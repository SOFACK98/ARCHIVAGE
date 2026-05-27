-- ============================================================
-- INSERTION UTILISATEUR TEST - admin@test.com
-- Usage : Exécuter ce script dans SQL Server Management Studio
-- ============================================================

-- Vérifier si l'utilisateur existe déjà
IF NOT EXISTS (SELECT * FROM utilisateurs WHERE email = 'admin@test.com')
BEGIN
    -- Insérer l'utilisateur test (mot de passe: password123)
    -- Le hash bcrypt pour 'password123' est: $2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy
    INSERT INTO utilisateurs (
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
        'Admin',
        'Test',
        'admin@test.com',
        '+237 6XX XXX XXX',
        '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',
        (SELECT TOP 1 id FROM agences WHERE code = '01'),  -- Agence DSCHANG
        (SELECT TOP 1 id FROM departements WHERE nom = 'informatique '),  -- Département informatique
        (SELECT TOP 1 id FROM roles WHERE code = 'ADMIN'),  -- Rôle ADMIN
        'actif',
        NULL
    );
    
    PRINT '✅ Utilisateur test créé avec succès';
    PRINT '📧 Email: admin@test.com';
    PRINT '🔑 Mot de passe: password123';
    PRINT '👤 Rôle: Administrateur';
END
ELSE
BEGIN
    PRINT '⚠️  L''utilisateur admin@test.com existe déjà';
END
GO

-- Vérifier l'utilisateur créé
SELECT 
    u.id,
    u.nom,
    u.prenom,
    u.email,
    u.telephone,
    u.statut,
    r.nom as role_nom,
    r.code as role_code,
    a.nom as agence_nom,
    d.nom as departement_nom
FROM utilisateurs u
LEFT JOIN roles r ON u.role_id = r.id
LEFT JOIN agences a ON u.agence_id = a.id
LEFT JOIN departements d ON u.departement_id = d.id
WHERE u.email = 'admin@test.com';
GO
