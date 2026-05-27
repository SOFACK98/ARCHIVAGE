-- Migration : Table des dossiers (avec droits d'accès identiques aux documents) - SQL Server 2012
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'dossiers')
BEGIN
    CREATE TABLE dossiers (
        id INT IDENTITY(1,1) PRIMARY KEY,
        nom NVARCHAR(255) NOT NULL,
        description NVARCHAR(MAX),
        parent_id INT DEFAULT NULL,
        couleur VARCHAR(20) DEFAULT '#10b981',
        agence_id INT DEFAULT NULL,
        departement_id INT DEFAULT NULL,
        created_by INT NOT NULL,
        created_at DATETIME2 DEFAULT GETDATE(),
        updated_at DATETIME2 DEFAULT GETDATE(),
        FOREIGN KEY (parent_id) REFERENCES dossiers(id) ON DELETE SET NULL,
        FOREIGN KEY (agence_id) REFERENCES agences(id) ON DELETE SET NULL,
        FOREIGN KEY (departement_id) REFERENCES departements(id) ON DELETE SET NULL,
        FOREIGN KEY (created_by) REFERENCES utilisateurs(id)
    );
END;
GO

-- Table de liaison dossiers <-> documents
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'dossier_documents')
BEGIN
    CREATE TABLE dossier_documents (
        id INT IDENTITY(1,1) PRIMARY KEY,
        dossier_id INT NOT NULL,
        document_id INT NOT NULL,
        added_at DATETIME2 DEFAULT GETDATE(),
        CONSTRAINT unique_dossier_doc UNIQUE (dossier_id, document_id),
        FOREIGN KEY (dossier_id) REFERENCES dossiers(id) ON DELETE CASCADE,
        FOREIGN KEY (document_id) REFERENCES documents(id) ON DELETE CASCADE
    );
END;
GO

-- Si la table dossiers existe déjà sans agence_id/departement_id, ajouter les colonnes :
-- ALTER TABLE dossiers ADD agence_id INT DEFAULT NULL;
-- ALTER TABLE dossiers ADD departement_id INT DEFAULT NULL;
-- ALTER TABLE dossiers ADD FOREIGN KEY (agence_id) REFERENCES agences(id) ON DELETE SET NULL;
-- ALTER TABLE dossiers ADD FOREIGN KEY (departement_id) REFERENCES departements(id) ON DELETE SET NULL;
