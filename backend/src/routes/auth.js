import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { supabase } from '../config/supabase.js';

const router = Router();

router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password)
    return res.status(400).json({ success: false, message: 'Email et mot de passe requis.' });

  try {
    // 1. Récupérer l'utilisateur
    const { data: user, error } = await supabase
      .from('utilisateurs')
      .select('*')
      .eq('email', email.trim())
      .single();

    if (error || !user)
      return res.status(401).json({ success: false, message: 'Utilisateur non trouvé' });

    // 2. Vérifier le mot de passe
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch)
      return res.status(401).json({ success: false, message: 'Identifiants incorrects' });

    // 3. Récupérer role_code depuis la table roles
    let role_code = 'AGENT';
    let role_nom = 'Agent';
    if (user.role_id) {
      const { data: role } = await supabase
        .from('roles')
        .select('code, nom')
        .eq('id', user.role_id)
        .single();
      if (role) { role_code = role.code; role_nom = role.nom; }
    }

    // 4. Récupérer nom agence
    let agence_nom = null;
    if (user.agence_id) {
      const { data: agence } = await supabase.from('agences').select('nom').eq('id', user.agence_id).single();
      agence_nom = agence?.nom || null;
    }

    // 5. Récupérer nom département
    let departement_nom = null;
    if (user.departement_id) {
      const { data: dept } = await supabase.from('departements').select('nom').eq('id', user.departement_id).single();
      departement_nom = dept?.nom || null;
    }

    // 6. Générer le token avec le vrai role_code
    const token = jwt.sign(
      { id: user.id, email: user.email, role: role_code },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    );

    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        email: user.email,
        nom: user.nom,
        prenom: user.prenom,
        role: role_code,
        role_code,
        role_nom,
        agence_id: user.agence_id,
        agence_nom,
        departement_id: user.departement_id,
        departement_nom,
      }
    });
  } catch (err) {
    console.error('Erreur login:', err.message);
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
