import { Router } from 'express';
import multer from 'multer';
import { supabase } from '../config/supabase.js';
import { authMiddleware } from '../middlewares/auth.js';

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

// GET /api/documents
router.get('/', authMiddleware, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('documents')
      .select(`*, types_documents(nom), departements(nom), agences(nom), utilisateurs(nom, prenom)`)
      .order('created_at', { ascending: false });
    if (error) throw error;
    const docs = (data || []).map(d => ({
      ...d,
      type_nom: d.types_documents?.nom,
      departement_nom: d.departements?.nom,
      agencia_nom: d.agences?.nom,
      uploaded_by_nom: d.utilisateurs ? `${d.utilisateurs.prenom} ${d.utilisateurs.nom}` : null,
    }));
    res.json(docs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/documents
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { titre, type_document_id, departement_id, fichier_nom, fichier_path, fichier_type, fichier_taille, confidentialite } = req.body;
    const reference = `DOC-${Date.now()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;

    // Récupérer agence_id et departement_id depuis la BD si absent du token
    const { data: userDb } = await supabase
      .from('utilisateurs')
      .select('agence_id, departement_id')
      .eq('id', req.user.id)
      .single();

    const { data, error } = await supabase
      .from('documents')
      .insert({
        reference,
        titre, type_document_id,
        departement_id: departement_id || userDb?.departement_id || null,
        fichier_nom, fichier_path, fichier_type, fichier_taille,
        confidentialite: confidentialite || 'normal',
        statut: 'en_attente',
        uploaded_by: req.user.id,
        agence_id: userDb?.agence_id || null,
      })
      .select()
      .single();
    if (error) throw error;
    res.status(201).json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE /api/documents/:id
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const { error } = await supabase.from('documents').delete().eq('id', req.params.id);
    if (error) throw error;
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/documents/search
router.get('/search', authMiddleware, async (req, res) => {
  try {
    const { q, statut, confidentialite, date_from, date_to } = req.query;
    let query = supabase.from('documents').select(`*, types_documents(nom), departements(nom), agences(nom), utilisateurs(nom, prenom)`);
    if (q) query = query.ilike('titre', `%${q}%`);
    if (statut) query = query.eq('statut', statut);
    if (confidentialite) query = query.eq('confidentialite', confidentialite);
    if (date_from) query = query.gte('created_at', date_from);
    if (date_to) query = query.lte('created_at', date_to);
    const { data, error } = await query.order('created_at', { ascending: false });
    if (error) throw error;
    res.json(data || []);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/documents/:id/request-modify
router.post('/:id/request-modify', authMiddleware, async (req, res) => {
  try {
    const { modifications } = req.body;
    const { error } = await supabase.from('documents').update({ modification_request: modifications, statut: 'modif_en_attente' }).eq('id', req.params.id);
    if (error) throw error;
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/documents/:id/request-delete
router.post('/:id/request-delete', authMiddleware, async (req, res) => {
  try {
    const { error } = await supabase.from('documents').update({ statut: 'supprime' }).eq('id', req.params.id);
    if (error) throw error;
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/documents/:id/download
router.get('/:id/download', authMiddleware, async (req, res) => {
  try {
    const { data, error } = await supabase.from('documents').select('fichier_path, fichier_nom').eq('id', req.params.id).single();
    if (error || !data) return res.status(404).json({ message: 'Document non trouvé' });
    res.json({ url: data.fichier_path, nom: data.fichier_nom });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/upload
router.post('/upload-file', authMiddleware, upload.single('fichier'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'Aucun fichier reçu' });
    const fileName = `${Date.now()}_${req.file.originalname}`;
    const { data, error } = await supabase.storage
      .from('documents')
      .upload(fileName, req.file.buffer, { contentType: req.file.mimetype });
    if (error) throw error;
    const { data: urlData } = supabase.storage.from('documents').getPublicUrl(fileName);
    res.json({
      fichier_nom: req.file.originalname,
      fichier_path: urlData.publicUrl,
      fichier_type: req.file.mimetype,
      fichier_taille: req.file.size,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
