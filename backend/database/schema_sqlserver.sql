-- ============================================================
-- SCHÉMA COMPLET - SYSTÈME D'ARCHIVAGE MULTI-AGENCES (SQL Server 2012)
-- ============================================================

-- Table des agences
CREATE TABLE agences (
    id INT IDENTITY(1,1) PRIMARY KEY,
    code VARCHAR(20) UNIQUE NOT NULL,
    nom NVARCHAR(100) NOT NULL,
    ville NVARCHAR(100),
    adresse NVARCHAR(MAX),
    telephone VARCHAR(20),
    email VARCHAR(100),
    statut VARCHAR(10) DEFAULT 'actif' CHECK (statut IN ('actif', 'inactif')),
    created_at DATETIME2 DEFAULT GETDATE(),
    updated_at DATETIME2 DEFAULT GETDATE()
);
GO

-- Table des départements
CREATE TABLE departements (
    id INT IDENTITY(1,1) PRIMARY KEY,
    nom NVARCHAR(100) NOT NULL,
    description NVARCHAR(MAX),
    created_at DATETIME2 DEFAULT GETDATE()
);
GO

-- Table des rôles
CREATE TABLE roles (
    id INT IDENTITY(1,1) PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL,
    nom NVARCHAR(100) NOT NULL,
    description NVARCHAR(MAX),
    niveau_acces INT NOT NULL,
    created_at DATETIME2 DEFAULT GETDATE()
);
GO

-- Table des permissions
CREATE TABLE permissions (
    id INT IDENTITY(1,1) PRIMARY KEY,
    code VARCHAR(100) UNIQUE NOT NULL,
    nom NVARCHAR(100) NOT NULL,
    module VARCHAR(50) NOT NULL,
    action VARCHAR(50) NOT NULL,
    description NVARCHAR(MAX),
    created_at DATETIME2 DEFAULT GETDATE()
);
GO

-- Table de liaison rôles-permissions
CREATE TABLE role_permissions (
    id INT IDENTITY(1,1) PRIMARY KEY,
    role_id INT NOT NULL,
    permission_id INT NOT NULL,
    created_at DATETIME2 DEFAULT GETDATE(),
    CONSTRAINT unique_role_permission UNIQUE (role_id, permission_id),
    FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE,
    FOREIGN KEY (permission_id) REFERENCES permissions(id) ON DELETE CASCADE
);
GO

-- Table des utilisateurs
CREATE TABLE utilisateurs (
    id INT IDENTITY(1,1) PRIMARY KEY,
    matricule VARCHAR(50) UNIQUE NOT NULL,
    nom NVARCHAR(100) NOT NULL,
    prenom NVARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    telephone VARCHAR(20),
    password_hash VARCHAR(255) NOT NULL,
    agence_id INT NOT NULL,
    departement_id INT,
    role_id INT NOT NULL,
    statut VARCHAR(15) DEFAULT 'actif' CHECK (statut IN ('actif', 'inactif', 'suspendu')),
    derniere_connexion DATETIME2 NULL,
    tentatives_connexion INT DEFAULT 0,
    compte_verrouille BIT DEFAULT 0,
    date_verrouillage DATETIME2 NULL,
    reset_token VARCHAR(255),
    reset_token_expiry DATETIME2 NULL,
    created_at DATETIME2 DEFAULT GETDATE(),
    updated_at DATETIME2 DEFAULT GETDATE(),
    created_by INT,
    FOREIGN KEY (agence_id) REFERENCES agences(id),
    FOREIGN KEY (departement_id) REFERENCES departements(id),
    FOREIGN KEY (role_id) REFERENCES roles(id),
    FOREIGN KEY (created_by) REFERENCES utilisateurs(id)
);
GO

-- Table des sessions
CREATE TABLE sessions (
    id INT IDENTITY(1,1) PRIMARY KEY,
    utilisateur_id INT NOT NULL,
    token VARCHAR(255) UNIQUE NOT NULL,
    ip_address VARCHAR(45),
    user_agent NVARCHAR(MAX),
    expires_at DATETIME2 NOT NULL,
    created_at DATETIME2 DEFAULT GETDATE(),
    FOREIGN KEY (utilisateur_id) REFERENCES utilisateurs(id) ON DELETE CASCADE
);
GO

-- Table des types de documents
CREATE TABLE types_documents (
    id INT IDENTITY(1,1) PRIMARY KEY,
    nom NVARCHAR(100) NOT NULL,
    description NVARCHAR(MAX),
    duree_conservation_annees INT,
    created_at DATETIME2 DEFAULT GETDATE()
);
GO

-- Table des documents
CREATE TABLE documents (
    id INT IDENTITY(1,1) PRIMARY KEY,
    reference VARCHAR(100) UNIQUE NOT NULL,
    titre NVARCHAR(255) NOT NULL,
    type_document_id INT NOT NULL,
    agence_id INT NOT NULL,
    departement_id INT,
    client_nom NVARCHAR(255),
    client_reference VARCHAR(100),
    fichier_nom NVARCHAR(255) NOT NULL,
    fichier_path NVARCHAR(500) NOT NULL,
    fichier_taille BIGINT,
    fichier_type VARCHAR(100),
    confidentialite VARCHAR(10) DEFAULT 'normal' CHECK (confidentialite IN ('normal', 'eleve', 'critique')),
    statut VARCHAR(30) DEFAULT 'en_attente' CHECK (statut IN ('en_attente', 'valide', 'rejete', 'archive', 'en_attente_critique', 'modif_en_attente', 'modif_en_attente_critique', 'suppr_en_attente', 'suppr_en_attente_critique', 'approuve_partiel', 'modif_approuve_partiel', 'suppr_approuve_partiel', 'modifie', 'supprime')),
    date_document DATE,
    date_expiration DATE,
    description NVARCHAR(MAX),
    mots_cles NVARCHAR(MAX), -- JSON en SQL Server 2012
    version INT DEFAULT 1,
    document_parent_id INT,
    uploaded_by INT NOT NULL,
    validated_by INT DEFAULT NULL,
    validated_at DATETIME2 NULL,
    modification_request NVARCHAR(MAX),
    validation_level INT DEFAULT 1,
    created_at DATETIME2 DEFAULT GETDATE(),
    updated_at DATETIME2 DEFAULT GETDATE(),
    FOREIGN KEY (type_document_id) REFERENCES types_documents(id),
    FOREIGN KEY (agence_id) REFERENCES agences(id),
    FOREIGN KEY (departement_id) REFERENCES departements(id),
    FOREIGN KEY (document_parent_id) REFERENCES documents(id),
    FOREIGN KEY (uploaded_by) REFERENCES utilisateurs(id)
);
GO

-- Table des accès aux documents
CREATE TABLE document_acces (
    id INT IDENTITY(1,1) PRIMARY KEY,
    document_id INT NOT NULL,
    utilisateur_id INT,
    role_id INT,
    agence_id INT,
    type_acces VARCHAR(15) NOT NULL CHECK (type_acces IN ('lecture', 'modification', 'suppression')),
    accorde_par INT NOT NULL,
    created_at DATETIME2 DEFAULT GETDATE(),
    expires_at DATETIME2 NULL,
    FOREIGN KEY (document_id) REFERENCES documents(id) ON DELETE CASCADE,
    FOREIGN KEY (utilisateur_id) REFERENCES utilisateurs(id) ON DELETE CASCADE,
    FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE,
    FOREIGN KEY (agence_id) REFERENCES agences(id) ON DELETE CASCADE,
    FOREIGN KEY (accorde_par) REFERENCES utilisateurs(id)
);
GO

-- Table des validations de documents
CREATE TABLE document_validations (
    id INT IDENTITY(1,1) PRIMARY KEY,
    document_id INT NOT NULL,
    validateur_id INT NOT NULL,
    type_validateur VARCHAR(50),
    type_demande VARCHAR(20) CHECK (type_demande IN ('import', 'modification', 'suppression')),
    statut VARCHAR(20) CHECK (statut IN ('en_attente', 'approuve', 'rejete')),
    commentaire NVARCHAR(MAX),
    created_at DATETIME2 DEFAULT GETDATE(),
    validated_at DATETIME2 NULL,
    FOREIGN KEY (document_id) REFERENCES documents(id) ON DELETE CASCADE,
    FOREIGN KEY (validateur_id) REFERENCES utilisateurs(id)
);
GO

-- Table d'audit
CREATE TABLE audit_logs (
    id INT IDENTITY(1,1) PRIMARY KEY,
    utilisateur_id INT,
    utilisateur_nom NVARCHAR(255),
    utilisateur_email VARCHAR(100),
    role_nom NVARCHAR(100),
    agence_id INT,
    agence_nom NVARCHAR(100),
    action VARCHAR(100) NOT NULL,
    module VARCHAR(50) NOT NULL,
    entite_type VARCHAR(50),
    entite_id INT,
    entite_reference NVARCHAR(255),
    details NVARCHAR(MAX), -- JSON en SQL Server 2012
    ip_address VARCHAR(45),
    user_agent NVARCHAR(MAX),
    url NVARCHAR(500),
    methode_http VARCHAR(10),
    statut_http INT,
    duree_ms INT,
    created_at DATETIME2 DEFAULT GETDATE(),
    FOREIGN KEY (utilisateur_id) REFERENCES utilisateurs(id) ON DELETE SET NULL,
    FOREIGN KEY (agence_id) REFERENCES agences(id) ON DELETE SET NULL
);
GO

-- Table des notifications
CREATE TABLE notifications (
    id INT IDENTITY(1,1) PRIMARY KEY,
    utilisateur_id INT NOT NULL,
    type VARCHAR(50) NOT NULL,
    titre NVARCHAR(255) NOT NULL,
    message NVARCHAR(MAX) NOT NULL,
    lue BIT DEFAULT 0,
    lue_at DATETIME2 NULL,
    data NVARCHAR(MAX), -- JSON en SQL Server 2012
    created_at DATETIME2 DEFAULT GETDATE(),
    FOREIGN KEY (utilisateur_id) REFERENCES utilisateurs(id) ON DELETE CASCADE
);
GO

-- Table des dossiers
CREATE TABLE dossiers (
    id INT IDENTITY(1,1) PRIMARY KEY,
    nom NVARCHAR(255) NOT NULL,
    description NVARCHAR(MAX),
    parent_id INT,
    couleur VARCHAR(20) DEFAULT '#10b981',
    created_by INT NOT NULL,
    created_at DATETIME2 DEFAULT GETDATE(),
    updated_at DATETIME2 DEFAULT GETDATE(),
    FOREIGN KEY (parent_id) REFERENCES dossiers(id),
    FOREIGN KEY (created_by) REFERENCES utilisateurs(id)
);
GO

-- Table de liaison dossiers-documents
CREATE TABLE dossier_documents (
    id INT IDENTITY(1,1) PRIMARY KEY,
    dossier_id INT NOT NULL,
    document_id INT NOT NULL,
    created_at DATETIME2 DEFAULT GETDATE(),
    CONSTRAINT unique_dossier_document UNIQUE (dossier_id, document_id),
    FOREIGN KEY (dossier_id) REFERENCES dossiers(id) ON DELETE CASCADE,
    FOREIGN KEY (document_id) REFERENCES documents(id) ON DELETE CASCADE
);
GO

-- Index pour optimisation
CREATE INDEX idx_documents_agence ON documents(agence_id);
CREATE INDEX idx_documents_departement ON documents(departement_id);
CREATE INDEX idx_documents_type ON documents(type_document_id);
CREATE INDEX idx_documents_statut ON documents(statut);
CREATE INDEX idx_documents_uploaded_by ON documents(uploaded_by);
CREATE INDEX idx_documents_reference ON documents(reference);
CREATE INDEX idx_documents_date ON documents(date_document);
GO

CREATE INDEX idx_utilisateurs_agence ON utilisateurs(agence_id);
CREATE INDEX idx_utilisateurs_departement ON utilisateurs(departement_id);
CREATE INDEX idx_utilisateurs_role ON utilisateurs(role_id);
CREATE INDEX idx_utilisateurs_email ON utilisateurs(email);
CREATE INDEX idx_utilisateurs_statut ON utilisateurs(statut);
GO

CREATE INDEX idx_audit_logs_utilisateur ON audit_logs(utilisateur_id);
CREATE INDEX idx_audit_logs_agence ON audit_logs(agence_id);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);
CREATE INDEX idx_audit_logs_module ON audit_logs(module);
CREATE INDEX idx_audit_logs_created ON audit_logs(created_at);
CREATE INDEX idx_audit_logs_entite ON audit_logs(entite_type, entite_id);
GO

CREATE INDEX idx_sessions_token ON sessions(token);
CREATE INDEX idx_sessions_utilisateur ON sessions(utilisateur_id);
CREATE INDEX idx_sessions_expires ON sessions(expires_at);
GO

CREATE INDEX idx_dossiers_parent ON dossiers(parent_id);
CREATE INDEX idx_dossiers_created_by ON dossiers(created_by);
GO

CREATE INDEX idx_dossier_documents_dossier ON dossier_documents(dossier_id);
CREATE INDEX idx_dossier_documents_document ON dossier_documents(document_id);
GO

-- Trigger pour updated_at sur agences
CREATE TRIGGER tr_agences_updated_at
ON agences
AFTER UPDATE
AS
BEGIN
    SET NOCOUNT ON;
    UPDATE agences
    SET updated_at = GETDATE()
    FROM agences a
    INNER JOIN inserted i ON a.id = i.id;
END;
GO

-- Trigger pour updated_at sur utilisateurs
CREATE TRIGGER tr_utilisateurs_updated_at
ON utilisateurs
AFTER UPDATE
AS
BEGIN
    SET NOCOUNT ON;
    UPDATE utilisateurs
    SET updated_at = GETDATE()
    FROM utilisateurs u
    INNER JOIN inserted i ON u.id = i.id;
END;
GO

-- Trigger pour updated_at sur documents
CREATE TRIGGER tr_documents_updated_at
ON documents
AFTER UPDATE
AS
BEGIN
    SET NOCOUNT ON;
    UPDATE documents
    SET updated_at = GETDATE()
    FROM documents d
    INNER JOIN inserted i ON d.id = i.id;
END;
GO

-- Trigger pour updated_at sur dossiers
CREATE TRIGGER tr_dossiers_updated_at
ON dossiers
AFTER UPDATE
AS
BEGIN
    SET NOCOUNT ON;
    UPDATE dossiers
    SET updated_at = GETDATE()
    FROM dossiers d
    INNER JOIN inserted i ON d.id = i.id;
END;
GO

-- Données initiales
INSERT INTO roles (code, nom, description, niveau_acces) VALUES
('ADMIN', 'Administrateur', 'Accès complet au système', 4),
('CHEF_AGENCE', 'Chef d''Agence', 'Gestion complète de son agence', 3),
('CHEF_DEPT', 'Chef de Département', 'Gestion de son département multi-agences', 2),
('AGENT', 'Agent', 'Accès limité à son département', 1);
GO

INSERT INTO permissions (code, nom, module, action) VALUES
-- Documents
('DOC_CREATE', 'Créer un document', 'documents', 'create'),
('DOC_READ_OWN', 'Consulter ses documents', 'documents', 'read'),
('DOC_READ_DEPT', 'Consulter documents département', 'documents', 'read'),
('DOC_READ_AGENCE', 'Consulter documents agence', 'documents', 'read'),
('DOC_READ_ALL', 'Consulter tous documents', 'documents', 'read'),
('DOC_UPDATE', 'Modifier un document', 'documents', 'update'),
('DOC_DELETE', 'Supprimer un document', 'documents', 'delete'),
('DOC_DOWNLOAD', 'Télécharger un document', 'documents', 'download'),
('DOC_VALIDATE', 'Valider un document', 'documents', 'validate'),
-- Utilisateurs
('USER_CREATE', 'Créer un utilisateur', 'users', 'create'),
('USER_READ', 'Consulter utilisateurs', 'users', 'read'),
('USER_UPDATE', 'Modifier un utilisateur', 'users', 'update'),
('USER_DELETE', 'Supprimer un utilisateur', 'users', 'delete'),
-- Audit
('AUDIT_READ', 'Consulter les logs', 'audit', 'read'),
('AUDIT_EXPORT', 'Exporter les logs', 'audit', 'export'),
-- Paramètres
('SETTINGS_READ', 'Consulter paramètres', 'settings', 'read'),
('SETTINGS_UPDATE', 'Modifier paramètres', 'settings', 'update');
GO

-- Attribution permissions par rôle
-- ADMIN: Toutes les permissions
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r, permissions p WHERE r.code = 'ADMIN';
GO

-- CHEF_AGENCE
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r, permissions p 
WHERE r.code = 'CHEF_AGENCE' 
AND p.code IN ('DOC_CREATE', 'DOC_READ_AGENCE', 'DOC_UPDATE', 'DOC_DELETE', 'DOC_DOWNLOAD', 'DOC_VALIDATE', 'USER_READ', 'AUDIT_READ');
GO

-- CHEF_DEPT
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r, permissions p 
WHERE r.code = 'CHEF_DEPT' 
AND p.code IN ('DOC_CREATE', 'DOC_READ_DEPT', 'DOC_UPDATE', 'DOC_DOWNLOAD', 'DOC_VALIDATE', 'USER_READ');
GO

-- AGENT
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r, permissions p 
WHERE r.code = 'AGENT' 
AND p.code IN ('DOC_CREATE', 'DOC_READ_OWN', 'DOC_DOWNLOAD');
GO
