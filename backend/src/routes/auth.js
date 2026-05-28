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
    const { data: user, error } = await supabase
      .from('utilisateurs')
      .select('*')
      .eq('email', email.trim())
      .single();

    if (error || !user)
      return res.status(401).json({ success: false, message: 'Utilisateur non trouvé' });

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch)
      return res.status(401).json({ success: false, message: 'Identifiants incorrects' });

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
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
        role: user.role,
        role_code: user.role_code,
        agence_id: user.agence_id,
        agence_nom: user.agence_nom,
        departement_id: user.departement_id,
        departement_nom: user.departement_nom,
      }
    });
  } catch (err) {
    console.error('Erreur serveur login:', err.message, err.stack);
    res.status(500).json({ success: false, message: err.message || 'Erreur interne du serveur' });
  }
});

export default router;
