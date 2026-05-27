-- Migration : Table des dossiers (avec droits d'accès identiques aux documents)
CREATE TABLE IF NOT EXISTS dossiers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nom VARCHAR(255) NOT NULL,
    description TEXT,
    parent_id INT DEFAULT NULL,
    couleur VARCHAR(20) DEFAULT '#10b981',
    agence_id INT DEFAULT NULL,
    departement_id INT DEFAULT NULL,
    created_by INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (parent_id) REFERENCES dossiers(id) ON DELETE SET NULL,
    FOREIGN KEY (agence_id) REFERENCES agences(id) ON DELETE SET NULL,
    FOREIGN KEY (departement_id) REFERENCES departements(id) ON DELETE SET NULL,
    FOREIGN KEY (created_by) REFERENCES utilisateurs(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table de liaison dossiers <-> documents
CREATE TABLE IF NOT EXISTS dossier_documents (
    id INT AUTO_INCREMENT PRIMARY KEY,
    dossier_id INT NOT NULL,
    document_id INT NOT NULL,
    added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_dossier_doc (dossier_id, document_id),
    FOREIGN KEY (dossier_id) REFERENCES dossiers(id) ON DELETE CASCADE,
    FOREIGN KEY (document_id) REFERENCES documents(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Si la table dossiers existe déjà sans agence_id/departement_id, ajouter les colonnes :
-- ALTER TABLE dossiers ADD COLUMN agence_id INT DEFAULT NULL;
-- ALTER TABLE dossiers ADD COLUMN departement_id INT DEFAULT NULL;
-- ALTER TABLE dossiers ADD FOREIGN KEY (agence_id) REFERENCES agences(id) ON DELETE SET NULL;
-- ALTER TABLE dossiers ADD FOREIGN KEY (departement_id) REFERENCES departements(id) ON DELETE SET NULL;
