// ============================================================
//  FICHIER : database/config.ts
//  Rôle    : Configuration centralisée de la connexion
//            à la base de données SQL Server 2012.
//
//  Les valeurs sont lues depuis les variables d'environnement
//  définies dans le fichier .env (voir .env.example).
//
//  Utilisation :
//    import { dbConfig, getPool, query } from './config';
// ============================================================

import * as sql from 'mssql';
import * as dotenv from 'dotenv';
import * as path   from 'path';

// Charger le fichier .env depuis la racine du projet
dotenv.config({ path: path.resolve(__dirname, '../.env') });

// ============================================================
// 1. CONFIGURATION PAR ENVIRONNEMENT
// ============================================================

type Environment = 'development' | 'production' | 'test';

const ENV: Environment = (process.env.NODE_ENV as Environment) ?? 'development';

/**
 * Paramètres de connexion SQL Server 2012.
 * Toutes les valeurs ont un fallback pour le développement local.
 */
export const dbConfig = {
  // Environnement courant
  env: ENV,

  // Connexion
  server:     process.env.DB_HOST     ?? 'localhost',
  port:       Number(process.env.DB_PORT ?? 1433),
  database:   process.env.DB_NAME     ?? 'archivage',
  user:       process.env.DB_USER     ?? 'sa',
  password:   process.env.DB_PASSWORD ?? '12345678',

  // Options SQL Server
  options: {
    encrypt:          ENV === 'production', // SSL en production
    trustServerCertificate: ENV !== 'production', // Pour le développement
    enableArithAbort: true,
  },

  // Pool de connexions
  pool: {
    max:                    Number(process.env.DB_POOL_MAX      ?? 20),
    min:                    Number(process.env.DB_POOL_MIN      ?? 2),
    idleTimeoutMillis:      Number(process.env.DB_IDLE_TIMEOUT  ?? 30_000),
    connectionTimeoutMillis:Number(process.env.DB_CONN_TIMEOUT  ?? 5_000),
  },

  // Logs SQL : actifs en développement uniquement
  logging: ENV === 'development',
} as const;


// ============================================================
// 2. POOL SINGLETON
// ============================================================

let _pool: sql.ConnectionPool | null = null;

/**
 * Retourne le pool SQL Server (singleton).
 * Le pool est créé à la première demande puis réutilisé.
 */
export async function getPool(): Promise<sql.ConnectionPool> {
  if (!_pool) {
    _pool = new sql.ConnectionPool({
      server:                    dbConfig.server,
      port:                      dbConfig.port,
      database:                  dbConfig.database,
      user:                      dbConfig.user,
      password:                  dbConfig.password,
      options:                   dbConfig.options,
      pool:                      dbConfig.pool,
    });

    _pool.on('connect', () => {
      if (dbConfig.logging) {
        console.log(`[DB] Connexion établie → ${dbConfig.user}@${dbConfig.server}:${dbConfig.port}/${dbConfig.database}`);
      }
    });

    _pool.on('error', (err: Error) => {
      console.error('[DB] Erreur inattendue sur le client idle :', err.message);
    });

    await _pool.connect();
  }

  return _pool;
}


// ============================================================
// 3. HELPERS DE REQUÊTE
// ============================================================

/**
 * Exécute une requête SQL paramétrée.
 *
 * @param sql    Requête SQL avec placeholders ?
 * @param params Valeurs des paramètres
 * @returns      Résultat SQL Server typé
 *
 * @example
 *   const { rows } = await query<Document>(
 *     'SELECT * FROM documents WHERE id = ?',
 *     [42]
 *   );
 */
export async function query<T = any>(
  sqlQuery: string,
  params: unknown[] = [],
): Promise<{ recordset: T[]; rowCount: number }> {
  const start = Date.now();

  try {
    const pool = await getPool();
    const request = pool.request();

    // Convertir les paramètres MySQL (?) en paramètres SQL Server (@param)
    let paramIndex = 0;
    const processedQuery = sqlQuery.replace(/\?/g, () => {
      const paramName = `param${paramIndex}`;
      request.input(paramName, params[paramIndex]);
      paramIndex++;
      return `@${paramName}`;
    });

    const result = await request.query(processedQuery);
    const duration = Date.now() - start;

    if (dbConfig.logging) {
      console.log(`[DB] ✓ ${duration}ms | ${result.rowsAffected[0]} ligne(s) | ${sqlQuery.slice(0, 80).replace(/\s+/g, ' ')}…`);
    }

    return {
      recordset: result.recordset as T[],
      rowCount: result.rowsAffected[0] || 0,
    };
  } catch (err) {
    const error = err as Error;
    console.error('[DB] ✗ Erreur SQL :', {
      message: error.message,
      sql:     sqlQuery.slice(0, 200),
      params,
    });
    throw error;
  }
}


/**
 * Exécute plusieurs requêtes dans une transaction SQL Server.
 * COMMIT automatique en cas de succès, ROLLBACK en cas d'erreur.
 *
 * @example
 *   await withTransaction(async (transaction) => {
 *     const request = new sql.Request(transaction);
 *     await request.query('INSERT INTO documents ...');
 *     await request.query('INSERT INTO audit_logs ...');
 *   });
 */
export async function withTransaction<T>(
  fn: (transaction: sql.Transaction) => Promise<T>,
): Promise<T> {
  const pool = await getPool();
  const transaction = new sql.Transaction(pool);

  try {
    await transaction.begin();
    const result = await fn(transaction);
    await transaction.commit();
    return result;
  } catch (err) {
    await transaction.rollback();
    throw err;
  }
}


// ============================================================
// 4. HEALTH CHECK
// ============================================================

export interface HealthCheckResult {
  status:     'ok' | 'error';
  latencyMs:  number;
  host:       string;
  database:   string;
  serverVersion: string;
  serverTime: string;
  poolStats: {
    total:   number;
    idle:    number;
    waiting: number;
  };
  message: string;
}

/**
 * Vérifie que la base de données est accessible.
 * Utilisé au démarrage et dans les endpoints /health.
 */
export async function checkHealth(): Promise<HealthCheckResult> {
  const start = Date.now();
  const pool = await getPool();

  try {
    const { recordset } = await query<{ now: string; version: string }>(
      "SELECT GETDATE() AS now, @@VERSION AS version",
    );

    return {
      status:     'ok',
      latencyMs:  Date.now() - start,
      host:       dbConfig.server,
      database:   dbConfig.database,
      serverVersion: recordset[0]?.version || 'N/A',
      serverTime: recordset[0]?.now || 'N/A',
      poolStats: {
        total:   pool.size,
        idle:    pool.available,
        waiting: pool.pending,
      },
      message: 'Connexion à la base de données opérationnelle.',
    };
  } catch (err) {
    return {
      status:     'error',
      latencyMs:  Date.now() - start,
      host:       dbConfig.server,
      database:   dbConfig.database,
      serverVersion: 'N/A',
      serverTime: 'N/A',
      poolStats:  { total: 0, idle: 0, waiting: 0 },
      message:    (err as Error).message,
    };
  }
}


// ============================================================
// 5. FERMETURE PROPRE DU POOL
// ============================================================

/**
 * Ferme toutes les connexions du pool.
 * À appeler lors de l'arrêt du serveur.
 */
export async function closePool(): Promise<void> {
  if (_pool) {
    await _pool.close();
    _pool = null;
    console.log('[DB] Pool de connexions fermé proprement.');
  }
}

// Fermeture automatique sur SIGTERM et SIGINT
process.on('SIGTERM', async () => { await closePool(); process.exit(0); });
process.on('SIGINT',  async () => { await closePool(); process.exit(0); });


// ============================================================
// 6. EXPORT PAR DÉFAUT (pour import simple)
// ============================================================

export default {
  dbConfig,
  getPool,
  query,
  withTransaction,
  checkHealth,
  closePool,
};
