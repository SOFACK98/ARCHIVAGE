-- ============================================================
-- INSERTION D'UN UTILISATEUR TEST
-- ============================================================

-- D'abord, vérifions les rôles et agences existants
-- SELECT * FROM roles;
-- SELECT * FROM agences;

-- Insérer une agence test si elle n'existe pas
IF NOT EXISTS (SELECT * FROM agences WHERE code = 'TEST001')
BEGIN
    INSERT INTO agences (code, nom, ville, adresse, telephone, email, statut)
    VALUES ('TEST001', 'Agence Test', 'Douala', '123 Rue Test', '+237 6XX XXX XXX', 'test@example.com', 'actif');
    PRINT 'Agence test créée';
END
ELSE
BEGIN
    PRINT 'Agence test existe déjà';
END
GO

-- Insérer un département test si il n'existe pas
IF NOT EXISTS (SELECT * FROM departements WHERE nom = 'Département Test')
BEGIN
    INSERT INTO departements (nom, description)
    VALUES ('Département Test', 'Département pour les tests');
    PRINT 'Département test créé';
END
ELSE
BEGIN
    PRINT 'Département test existe déjà';
END
GO

-- Insérer un utilisateur test (mot de passe: password123)
-- Le hash bcrypt pour 'password123' est: $2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy
IF NOT EXISTS (SELECT * FROM utilisateurs WHERE email = 'admin@test.com')
BEGIN
    INSERT INTO utilisateurs (
        matricule,
        nom,
        prenom,
        email,
        telephone,
        password_hash,
        agence_id,
        departement_id,
        role_id,
        statut,
        created_by
    )
    VALUES (
        'MAT001',
        'Admin',
        'Test',
        'admin@test.com',
        '+237 6XX XXX XXX',
        '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',
        (SELECT id FROM agences WHERE code = 'TEST001'),
        (SELECT id FROM departements WHERE nom = 'Département Test'),
        (SELECT id FROM roles WHERE code = 'ADMIN'),
        'actif',
        NULL
    );
    PRINT 'Utilisateur test créé avec succès';
    PRINT 'Email: admin@test.com';
    PRINT 'Mot de passe: password123';
END
ELSE
BEGIN
    PRINT 'Utilisateur test existe déjà';
END
GO

-- Vérifier l'utilisateur créé
SELECT 
    u.id,
    u.matricule,
    u.nom,
    u.prenom,
    u.email,
    u.telephone,
    u.statut,
    r.nom as role_nom,
    a.nom as agence_nom,
    d.nom as departement_nom
FROM utilisateurs u
LEFT JOIN roles r ON u.role_id = r.id
LEFT JOIN agences a ON u.agence_id = a.id
LEFT JOIN departements d ON u.departement_id = d.id
WHERE u.email = 'admin@test.com';
GO
