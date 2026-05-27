// ============================================================
// SCRIPT : Insertion utilisateur test admin@test.com
// Usage : node database/insert_admin_test_user.js
// ============================================================

const db = require('../backend/db');
const fs = require('fs');
const path = require('path');

async function insertAdminTestUser() {
  console.log('🚀 Insertion d\'un utilisateur test admin@test.com...\n');

  try {
    // Lire le fichier SQL
    const sqlPath = path.join(__dirname, 'insert_admin_test_user.sql');
    const sql = fs.readFileSync(sqlPath, 'utf-8');

    // Diviser le SQL en commandes individuelles (séparées par GO)
    const commands = sql.split(/\bGO\b/i).filter(cmd => cmd.trim());

    console.log(`📝 Exécution de ${commands.length} commandes SQL...\n`);

    // Exécuter chaque commande
    for (let i = 0; i < commands.length; i++) {
      const command = commands[i].trim();
      if (command) {
        try {
          console.log(`⏳ Exécution commande ${i + 1}/${commands.length}...`);
          await db.query(command);
          console.log(`✅ Commande ${i + 1} exécutée avec succès`);
        } catch (error) {
          // Ignorer les erreurs de contrainte unique (utilisateur existe déjà)
          if (error.message.includes('UNIQUE KEY') || error.message.includes('duplicate key')) {
            console.log(`⚠️  Commande ${i + 1} ignorée (données déjà existantes)`);
          } else {
            console.error(`❌ Erreur commande ${i + 1}:`, error.message);
          }
        }
      }
    }

    console.log('\n✅ Script terminé avec succès !');
    console.log('\n📋 Informations de connexion :');
    console.log('   Email : admin@test.com');
    console.log('   Mot de passe : password123');
    console.log('   Rôle : Administrateur');
    console.log('\n💡 Vous pouvez maintenant vous connecter à l\'application.');

  } catch (error) {
    console.error('❌ Erreur lors de l\'exécution du script:', error.message);
    process.exit(1);
  }
}

// Exécuter le script
insertAdminTestUser()
  .then(() => {
    console.log('\n✨ Script terminé');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Erreur fatale:', error);
    process.exit(1);
  });
