import { Router } from 'express';
import { supabase } from '../config/supabase.js';
import { authMiddleware } from '../middlewares/auth.js';

const router = Router();

// GET /api/dossiers
router.get('/', authMiddleware, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('dossiers')
      .select(`*, utilisateurs(nom, prenom)`)
      .order('nom');
    if (error) throw error;
    const dossiers = (data || []).map(d => ({
      ...d,
      created_by_nom: d.utilisateurs ? `${d.utilisateurs.prenom} ${d.utilisateurs.nom}` : '',
      nb_documents: 0,
    }));
    // Compter les documents par dossier
    const { data: counts } = await supabase.from('dossier_documents').select('dossier_id');
    const countMap = {};
    (counts || []).forEach((c) => { countMap[c.dossier_id] = (countMap[c.dossier_id] || 0) + 1; });
    dossiers.forEach(d => { d.nb_documents = countMap[d.id] || 0; });
    res.json(dossiers);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/dossiers
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { nom, description, parent_id, couleur } = req.body;
    const { data, error } = await supabase
      .from('dossiers')
      .insert({ nom, description, parent_id: parent_id || null, couleur: couleur || '#10b981', created_by: req.user.id })
      .select().single();
    if (error) throw error;
    res.status(201).json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/dossiers/:id
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { nom, description, couleur } = req.body;
    const { data, error } = await supabase.from('dossiers').update({ nom, description, couleur }).eq('id', req.params.id).select().single();
    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE /api/dossiers/:id
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    await supabase.from('dossier_documents').delete().eq('dossier_id', req.params.id);
    const { error } = await supabase.from('dossiers').delete().eq('id', req.params.id);
    if (error) throw error;
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/dossiers/:id/documents
router.get('/:id/documents', authMiddleware, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('dossier_documents')
      .select(`documents(id, titre, reference, fichier_nom, created_at, statut, types_documents(nom))`)
      .eq('dossier_id', req.params.id);
    if (error) throw error;
    const docs = (data || []).map((d) => ({
      ...d.documents,
      type: d.documents?.types_documents?.nom,
    }));
    res.json(docs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/dossiers/:id/documents
router.post('/:id/documents', authMiddleware, async (req, res) => {
  try {
    const { document_id } = req.body;
    const { error } = await supabase.from('dossier_documents').insert({ dossier_id: req.params.id, document_id });
    if (error) throw error;
    res.status(201).json({ success: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE /api/dossiers/:id/documents/:docId
router.delete('/:id/documents/:docId', authMiddleware, async (req, res) => {
  try {
    const { error } = await supabase.from('dossier_documents').delete().eq('dossier_id', req.params.id).eq('document_id', req.params.docId);
    if (error) throw error;
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
