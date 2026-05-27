-- Cr�ation de la base de donn�es (Optionnel)
 CREATE DATABASE archivage;
 GO
 USE archivage;
 GO

----------------------------------------------------------
-- Table `agences`
----------------------------------------------------------
CREATE TABLE agences (
  id int IDENTITY(1,1) NOT NULL PRIMARY KEY,
  code nvarchar(20) NOT NULL UNIQUE,
  nom nvarchar(100) DEFAULT NULL,
  created_at datetime2 NOT NULL DEFAULT GETDATE(),
  updated_at datetime2 NOT NULL DEFAULT GETDATE()
);

INSERT INTO agences (code, nom, created_at, updated_at) VALUES
('01', 'DSCHANG', '2026-02-18 16:47:56', '2026-02-23 16:06:11'),
('02', 'Akwa', '2026-02-23 16:04:04', '2026-02-23 16:04:04'),
('05', 'BONADIBONG', '2026-03-19 14:07:21', '2026-03-19 14:07:21');

----------------------------------------------------------
-- Table `departements`
----------------------------------------------------------
CREATE TABLE departements (
  id int IDENTITY(1,1) NOT NULL PRIMARY KEY,
  nom nvarchar(100) NOT NULL,
  description nvarchar(max) DEFAULT NULL,
  created_at datetime2 NOT NULL DEFAULT GETDATE()
);

INSERT INTO departements (nom, description, created_at) VALUES
('informatique ', 'parc info', '2026-02-18 16:30:22'),
('Comptabilit�', 'RAS', '2026-02-18 16:33:55'),
('RESSOURCES HUMAINS', NULL, '2026-03-31 08:45:30');

----------------------------------------------------------
-- Table `roles`
----------------------------------------------------------
CREATE TABLE roles (
  id int IDENTITY(1,1) NOT NULL PRIMARY KEY,
  code nvarchar(50) NOT NULL UNIQUE,
  nom nvarchar(100) NOT NULL,
  description nvarchar(max) DEFAULT NULL,
  niveau_acces int NOT NULL,
  created_at datetime2 NOT NULL DEFAULT GETDATE()
);

INSERT INTO roles (code, nom, description, niveau_acces, created_at) VALUES
('ADMIN', 'Administrateur', 'Acc�s complet au syst�me', 4, '2026-02-18 13:54:53'),
('CHEF_AGENCE', 'Chef d''Agence', 'Gestion compl�te de son agence', 3, '2026-02-18 13:54:53'),
('AGENT', 'Agent', 'Acc�s limit� � son d�partement', 1, '2026-02-18 13:54:53'),
('CHEF_DEPARTEMENT', 'Chef de D�partement', 'Chef responsable d''un d�partement', 70, '2026-03-10 14:23:19');

----------------------------------------------------------
-- Table `utilisateurs`
----------------------------------------------------------
CREATE TABLE utilisateurs (
  id int IDENTITY(1,1) NOT NULL PRIMARY KEY,
  nom nvarchar(100) NOT NULL,
  prenom nvarchar(100) NOT NULL,
  email nvarchar(100) NOT NULL UNIQUE,
  telephone nvarchar(20) DEFAULT NULL,
  password_hash nvarchar(255) NOT NULL,
  agence_id int NOT NULL,
  departement_id int DEFAULT NULL,
  role_id int NOT NULL,
  statut nvarchar(20) DEFAULT 'actif' CHECK (statut IN ('actif','inactif','suspendu')),
  derniere_connexion datetime2 NULL,
  tentatives_connexion int DEFAULT 0,
  compte_verrouille bit DEFAULT 0,
  date_verrouillage datetime2 NULL,
  reset_token nvarchar(255) DEFAULT NULL,
  reset_token_expiry datetime2 NULL,
  created_at datetime2 NOT NULL DEFAULT GETDATE(),
  updated_at datetime2 NOT NULL DEFAULT GETDATE(),
  created_by int DEFAULT NULL,
  CONSTRAINT FK_utilisateurs_agence FOREIGN KEY (agence_id) REFERENCES agences(id),
  CONSTRAINT FK_utilisateurs_dept FOREIGN KEY (departement_id) REFERENCES departements(id),
  CONSTRAINT FK_utilisateurs_role FOREIGN KEY (role_id) REFERENCES roles(id),
  CONSTRAINT FK_utilisateurs_creator FOREIGN KEY (created_by) REFERENCES utilisateurs(id)
);

----------------------------------------------------------
-- Table `types_documents`
----------------------------------------------------------
CREATE TABLE types_documents (
  id int IDENTITY(1,1) NOT NULL PRIMARY KEY,
  nom nvarchar(100) NOT NULL,
  description nvarchar(max) DEFAULT NULL,
  created_at datetime2 NOT NULL DEFAULT GETDATE()
);

INSERT INTO types_documents (nom, description, created_at) VALUES
('contrat', 'accord avec le client', '2026-02-18 16:30:52'),
('CNI', 'identit�', '2026-02-18 16:34:34');

----------------------------------------------------------
-- Table `documents`
----------------------------------------------------------
CREATE TABLE documents (
  id int IDENTITY(1,1) NOT NULL PRIMARY KEY,
  reference nvarchar(100) NOT NULL UNIQUE,
  titre nvarchar(255) NOT NULL,
  type_document_id int NOT NULL,
  agence_id int NOT NULL,
  departement_id int DEFAULT NULL,
  client_nom nvarchar(255) DEFAULT NULL,
  client_reference nvarchar(100) DEFAULT NULL,
  fichier_nom nvarchar(255) NOT NULL,
  fichier_path nvarchar(500) NOT NULL,
  fichier_taille bigint DEFAULT NULL,
  fichier_type nvarchar(100) DEFAULT NULL,
  confidentialite nvarchar(20) DEFAULT 'normal' CHECK (confidentialite IN ('normal','eleve','')),
  statut nvarchar(50) DEFAULT 'en_attente' CHECK (statut IN ('en_attente','en_attente_critique','valide','rejete','archive','modif_en_attente','modif_en_attente_critique','suppr_en_attente','suppr_en_attente_critique','modifie','supprime','approuve_partiel','modif_approuve_partiel','suppr_approuve_partiel')),
  date_document date DEFAULT NULL,
  date_expiration date DEFAULT NULL,
  description nvarchar(max) DEFAULT NULL,
  mots_cles nvarchar(max) DEFAULT NULL, -- SQL 2012 n'a pas de type JSON
  version int DEFAULT 1,
  document_parent_id int DEFAULT NULL,
  uploaded_by int NOT NULL,
  validated_by int DEFAULT NULL,
  validated_at datetime2 NULL,
  created_at datetime2 NOT NULL DEFAULT GETDATE(),
  updated_at datetime2 NOT NULL DEFAULT GETDATE(),
  modification_request nvarchar(max) DEFAULT NULL,
  validation_level int DEFAULT 1,
  CONSTRAINT FK_docs_type FOREIGN KEY (type_document_id) REFERENCES types_documents(id),
  CONSTRAINT FK_docs_agence FOREIGN KEY (agence_id) REFERENCES agences(id),
  CONSTRAINT FK_docs_dept FOREIGN KEY (departement_id) REFERENCES departements(id),
  CONSTRAINT FK_docs_parent FOREIGN KEY (document_parent_id) REFERENCES documents(id),
  CONSTRAINT FK_docs_uploader FOREIGN KEY (uploaded_by) REFERENCES utilisateurs(id),
  CONSTRAINT FK_docs_validator FOREIGN KEY (validated_by) REFERENCES utilisateurs(id)
);

----------------------------------------------------------
-- Table `audit_logs`
----------------------------------------------------------
CREATE TABLE audit_logs (
  id int IDENTITY(1,1) NOT NULL PRIMARY KEY,
  utilisateur_id int DEFAULT NULL,
  utilisateur_nom nvarchar(255) DEFAULT NULL,
  utilisateur_email nvarchar(100) DEFAULT NULL,
  role_nom nvarchar(100) DEFAULT NULL,
  agence_id int DEFAULT NULL,
  agence_nom nvarchar(100) DEFAULT NULL,
  action nvarchar(100) NOT NULL,
  module nvarchar(50) NOT NULL,
  entite_type nvarchar(50) DEFAULT NULL,
  entite_id int DEFAULT NULL,
  entite_reference nvarchar(255) DEFAULT NULL,
  details nvarchar(max) DEFAULT NULL,
  ip_address nvarchar(45) DEFAULT NULL,
  user_agent nvarchar(max) DEFAULT NULL,
  url nvarchar(500) DEFAULT NULL,
  methode_http nvarchar(10) DEFAULT NULL,
  statut_http int DEFAULT NULL,
  duree_ms int DEFAULT NULL,
  created_at datetime2 NOT NULL DEFAULT GETDATE(),
  CONSTRAINT FK_audit_user FOREIGN KEY (utilisateur_id) REFERENCES utilisateurs(id) ON DELETE SET NULL,
  CONSTRAINT FK_audit_agence FOREIGN KEY (agence_id) REFERENCES agences(id) ON DELETE SET NULL
);

----------------------------------------------------------
-- Table `document_validations`
----------------------------------------------------------
CREATE TABLE document_validations (
  id int IDENTITY(1,1) NOT NULL PRIMARY KEY,
  document_id int NOT NULL,
  validateur_id int NOT NULL,
  type_validateur nvarchar(50) NOT NULL,
  type_demande nvarchar(20) DEFAULT 'import' CHECK (type_demande IN ('import','modification','suppression')),
  statut nvarchar(20) NOT NULL CHECK (statut IN ('approuve','rejete','')),
  commentaire nvarchar(max) DEFAULT NULL,
  created_at datetime2 NOT NULL DEFAULT GETDATE(),
  validated_at datetime2 NULL,
  CONSTRAINT FK_val_doc FOREIGN KEY (document_id) REFERENCES documents(id) ON DELETE CASCADE,
  CONSTRAINT FK_val_user FOREIGN KEY (validateur_id) REFERENCES utilisateurs(id)
);

----------------------------------------------------------
-- Table `dossiers`
----------------------------------------------------------
CREATE TABLE dossiers (
  id int IDENTITY(1,1) NOT NULL PRIMARY KEY,
  nom nvarchar(255) NOT NULL,
  description nvarchar(max) DEFAULT NULL,
  parent_id int DEFAULT NULL,
  couleur nvarchar(20) DEFAULT '#10b981',
  created_by int NOT NULL,
  created_at datetime2 NOT NULL DEFAULT GETDATE(),
  updated_at datetime2 NOT NULL DEFAULT GETDATE(),
  agence_id int DEFAULT NULL,
  departement_id int DEFAULT NULL,
  CONSTRAINT FK_dossier_parent FOREIGN KEY (parent_id) REFERENCES dossiers(id),
  CONSTRAINT FK_dossier_creator FOREIGN KEY (created_by) REFERENCES utilisateurs(id),
  CONSTRAINT FK_dossier_agence FOREIGN KEY (agence_id) REFERENCES agences(id),
  CONSTRAINT FK_dossier_dept FOREIGN KEY (departement_id) REFERENCES departements(id)
);

----------------------------------------------------------
-- Table `dossier_documents`
----------------------------------------------------------
CREATE TABLE dossier_documents (
  id int IDENTITY(1,1) NOT NULL PRIMARY KEY,
  dossier_id int NOT NULL,
  document_id int NOT NULL,
  added_at datetime2 NOT NULL DEFAULT GETDATE(),
  CONSTRAINT UC_dossier_doc UNIQUE (dossier_id, document_id),
  CONSTRAINT FK_dd_dossier FOREIGN KEY (dossier_id) REFERENCES dossiers(id) ON DELETE CASCADE,
  CONSTRAINT FK_dd_doc FOREIGN KEY (document_id) REFERENCES documents(id) ON DELETE CASCADE
);

GO