-- ============================================================
-- ADDITIONAL SCHEMA: Document Validations Table - SQL Server 2012
-- À exécuter pour ajouter la table des validations si elle n'existe pas
-- ============================================================

-- Table des validations de documents (historique des validations)
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'document_validations')
BEGIN
    CREATE TABLE document_validations (
        id INT IDENTITY(1,1) PRIMARY KEY,
        document_id INT NOT NULL,
        validateur_id INT NOT NULL,
        type_validateur VARCHAR(50) NOT NULL,
        type_demande VARCHAR(20) DEFAULT 'import' CHECK (type_demande IN ('import', 'modification', 'suppression')),
        statut VARCHAR(20) NOT NULL CHECK (statut IN ('en_attente', 'approuve', 'rejete')),
        commentaire NVARCHAR(MAX),
        created_at DATETIME2 DEFAULT GETDATE(),
        validated_at DATETIME2 NULL,
        FOREIGN KEY (document_id) REFERENCES documents(id) ON DELETE CASCADE,
        FOREIGN KEY (validateur_id) REFERENCES utilisateurs(id)
    );
END;
GO

-- Ajouter les colonnes de suivi des modifications si elles n'existent pas
-- Ces colonnes permettent de suivre les demandes de modification
-- IF NOT EXISTS (SELECT * FROM sys.columns WHERE name = 'modification_request' AND object_id = OBJECT_ID('documents'))
--     ALTER TABLE documents ADD modification_request NVARCHAR(MAX);
-- IF NOT EXISTS (SELECT * FROM sys.columns WHERE name = 'modification_requested_by' AND object_id = OBJECT_ID('documents'))
--     ALTER TABLE documents ADD modification_requested_by INT;
-- IF NOT EXISTS (SELECT * FROM sys.columns WHERE name = 'modification_requested_at' AND object_id = OBJECT_ID('documents'))
--     ALTER TABLE documents ADD modification_requested_at DATETIME2 NULL;
-- IF NOT EXISTS (SELECT * FROM sys.columns WHERE name = 'validation_level' AND object_id = OBJECT_ID('documents'))
--     ALTER TABLE documents ADD validation_level INT DEFAULT 1;
