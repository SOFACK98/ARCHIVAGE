import { Router } from 'express';
import bcrypt from 'bcrypt';
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

    res.json({ success: true, token, user: { id: user.id, email: user.email, role: user.role } });
  } catch (err) {
    console.error('Erreur serveur:', err);
    res.status(500).json({ success: false, message: 'Erreur interne du serveur' });
  }
});

export default router;
