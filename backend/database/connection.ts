// ============================================================
// DATABASE : connection.ts
// Responsabilité : gérer le pool de connexions SQL Server 2012.
//   - Lit la config depuis les variables d'environnement
//   - Expose un pool réutilisable et une fonction query() helper
//   - Gère les erreurs de connexion et les reconnexions
// ============================================================

import * as sql from 'mssql';
import * as dotenv from 'dotenv';

dotenv.config();

// ── Configuration ────────────────────────────────────────────
const DB_CONFIG = {
  server:             process.env.DB_HOST     ?? 'localhost',
  port:               Number(process.env.DB_PORT ?? 1433),
  database:           process.env.DB_NAME     ?? 'archivage',
  user:               process.env.DB_USER     ?? 'sa',
  password:           process.env.DB_PASSWORD ?? '12345678',
  // Options SQL Server
  options: {
    encrypt:          process.env.NODE_ENV === 'production',
    trustServerCertificate: process.env.NODE_ENV !== 'production',
    enableArithAbort: true,
  },
  // Pool settings
  pool: {
    max:                Number(process.env.DB_POOL_MAX     ?? 20),   // connexions max simultanées
    min:                Number(process.env.DB_POOL_MIN     ?? 2),
    idleTimeoutMillis:  Number(process.env.DB_IDLE_TIMEOUT ?? 30_000),
    connectionTimeoutMillis: Number(process.env.DB_CONN_TIMEOUT ?? 5_000),
  },
};

// ── Pool singleton ───────────────────────────────────────────
let pool: sql.ConnectionPool | null = null;

async function getPool(): Promise<sql.ConnectionPool> {
  if (!pool) {
    pool = new sql.ConnectionPool(DB_CONFIG);

    // Log de connexion réussie
    pool.on('connect', () => {
      console.log(`[DB] Nouvelle connexion établie`);
    });

    // Log et gestion des erreurs idle
    pool.on('error', (err: Error) => {
      console.error('[DB] Erreur inattendue sur le client idle :', err.message);
    });

    await pool.connect();
  }
  return pool;
}

// ── Helper query ─────────────────────────────────────────────
/**
 * Exécute une requête SQL avec paramètres.
 * Utilise le pool de connexions interne.
 *
 * @example
 * const { recordset } = await query('SELECT * FROM documents WHERE id = ?', [42]);
 */
export async function query<T = any>(
  sqlQuery: string,
  params: unknown[] = [],
): Promise<{ recordset: T[]; rowCount: number }> {
  const start = Date.now();
  try {
    const poolInstance = await getPool();
    const request = poolInstance.request();

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

    if (process.env.NODE_ENV !== 'production') {
      console.log(`[DB] query (${duration}ms) → ${result.rowsAffected[0]} ligne(s)`);
    }
    return {
      recordset: result.recordset as T[],
      rowCount: result.rowsAffected[0] || 0,
    };
  } catch (err) {
    const error = err as Error;
    console.error('[DB] Erreur SQL :', { sql: sqlQuery, params, message: error.message });
    throw error;
  }
}

// ── Transaction helper ───────────────────────────────────────
/**
 * Exécute un bloc de code dans une transaction SQL Server.
 * Effectue un COMMIT en cas de succès, ROLLBACK en cas d'erreur.
 *
 * @example
 * await withTransaction(async (transaction) => {
 *   const request = new sql.Request(transaction);
 *   await request.query('INSERT INTO ...');
 *   await request.query('UPDATE  ...');
 * });
 */
export async function withTransaction<T>(
  fn: (transaction: sql.Transaction) => Promise<T>,
): Promise<T> {
  const poolInstance = await getPool();
  const transaction = new sql.Transaction(poolInstance);
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

// ── Health check ─────────────────────────────────────────────
/**
 * Vérifie que la base de données est accessible.
 * Utilisé au démarrage de l'application et dans les health endpoints.
 */
export async function checkDatabaseHealth(): Promise<{
  status: 'ok' | 'error';
  latencyMs: number;
  message: string;
}> {
  const start = Date.now();
  try {
    const { recordset } = await query<{ now: string; version: string }>(
      "SELECT GETDATE() AS now, @@VERSION AS version",
    );
    return {
      status: 'ok',
      latencyMs: Date.now() - start,
      message: `SQL Server connecté — heure serveur : ${recordset[0]?.now}`,
    };
  } catch (err) {
    return {
      status: 'error',
      latencyMs: Date.now() - start,
      message: (err as Error).message,
    };
  }
}

// ── Fermeture propre ─────────────────────────────────────────
/**
 * Ferme toutes les connexions du pool.
 * À appeler lors de l'arrêt du serveur (SIGTERM, SIGINT).
 */
export async function closePool(): Promise<void> {
  if (pool) {
    await pool.close();
    pool = null;
    console.log('[DB] Pool de connexions fermé proprement.');
  }
}

// Fermeture automatique sur arrêt du processus
process.on('SIGTERM', () => closePool());
process.on('SIGINT',  () => closePool());

// Export du pool pour les cas avancés
export { getPool };
export default { query, withTransaction, checkDatabaseHealth, closePool, getPool };
