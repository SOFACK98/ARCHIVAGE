import { Router } from 'express';
import { supabase } from '../config/supabase.js';
import { authMiddleware } from '../middlewares/auth.js';

const router = Router();

// GET /api/validation/pending
router.get('/pending', authMiddleware, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('documents')
      .select(`*, types_documents(nom), departements(nom), agences(nom), utilisateurs(nom, prenom)`)
      .in('statut', ['en_attente', 'en_attente_critique', 'modif_en_attente'])
      .order('created_at', { ascending: false });
    if (error) throw error;
    const docs = (data || []).map(d => ({
      ...d,
      type: d.types_documents?.nom,
      departement: d.departements?.nom,
      agencia_nom: d.agences?.nom,
      uploaded_by_nom: d.utilisateurs ? `${d.utilisateurs.prenom} ${d.utilisateurs.nom}` : '',
    }));
    res.json(docs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/validation/approved
router.get('/approved', authMiddleware, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('documents')
      .select(`*, types_documents(nom), departements(nom), agences(nom)`)
      .eq('statut', 'valide')
      .order('validated_at', { ascending: false });
    if (error) throw error;
    const docs = (data || []).map(d => ({
      ...d,
      type: d.types_documents?.nom,
      departement: d.departements?.nom,
      agencia_nom: d.agences?.nom,
    }));
    res.json(docs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/validation/rejected
router.get('/rejected', authMiddleware, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('documents')
      .select(`*, types_documents(nom), departements(nom), agences(nom)`)
      .eq('statut', 'rejete')
      .order('updated_at', { ascending: false });
    if (error) throw error;
    const docs = (data || []).map(d => ({
      ...d,
      type: d.types_documents?.nom,
      departement: d.departements?.nom,
      agencia_nom: d.agences?.nom,
    }));
    res.json(docs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/validation/approve/:id
router.post('/approve/:id', authMiddleware, async (req, res) => {
  try {
    const { error } = await supabase.from('documents').update({
      statut: 'valide',
      validated_at: new Date().toISOString(),
      validateur_id: req.user.id,
    }).eq('id', req.params.id);
    if (error) throw error;
    res.json({ success: true, message: 'Document validé avec succès' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/validation/reject/:id
router.post('/reject/:id', authMiddleware, async (req, res) => {
  try {
    const { motif } = req.body;
    const { error } = await supabase.from('documents').update({
      statut: 'rejete',
      validation_commentaire: motif,
      updated_at: new Date().toISOString(),
    }).eq('id', req.params.id);
    if (error) throw error;
    res.json({ success: true, message: 'Document rejeté' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/validation/history/:id
router.get('/history/:id', authMiddleware, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('audit_logs')
      .select('*')
      .eq('document_id', req.params.id)
      .order('created_at', { ascending: false });
    if (error) throw error;
    res.json(data || []);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
