import { Router } from 'express';
import { supabase } from '../config/supabase.js';
import { authMiddleware } from '../middlewares/auth.js';

const router = Router();

const enrichDocs = async (data) => {
  if (!data?.length) return [];
  const typeIds   = [...new Set(data.map(d => d.type_document_id).filter(Boolean))];
  const agenceIds = [...new Set(data.map(d => d.agence_id).filter(Boolean))];
  const deptIds   = [...new Set(data.map(d => d.departement_id).filter(Boolean))];
  const userIds   = [...new Set(data.map(d => d.uploaded_by).filter(Boolean))];

  const [types, agences, depts, users] = await Promise.all([
    typeIds.length   ? supabase.from('types_documents').select('id,nom').in('id', typeIds)   : { data: [] },
    agenceIds.length ? supabase.from('agences').select('id,nom').in('id', agenceIds)         : { data: [] },
    deptIds.length   ? supabase.from('departements').select('id,nom').in('id', deptIds)      : { data: [] },
    userIds.length   ? supabase.from('utilisateurs').select('id,nom,prenom').in('id', userIds) : { data: [] },
  ]);

  const typeMap  = Object.fromEntries((types.data  || []).map(t => [t.id, t.nom]));
  const agenceMap= Object.fromEntries((agences.data|| []).map(a => [a.id, a.nom]));
  const deptMap  = Object.fromEntries((depts.data  || []).map(d => [d.id, d.nom]));
  const userMap  = Object.fromEntries((users.data  || []).map(u => [u.id, `${u.prenom||''} ${u.nom||''}`.trim()]));

  return data.map(d => ({
    ...d,
    type:            typeMap[d.type_document_id] || null,
    departement:     deptMap[d.departement_id]   || null,
    agencia_nom:     agenceMap[d.agence_id]       || null,
    uploaded_by_nom: userMap[d.uploaded_by]       || null,
  }));
};

// GET /api/validation/pending
router.get('/pending', authMiddleware, async (req, res) => {
  try {
    const role = req.user.role;
    let query = supabase
      .from('documents')
      .select('*')
      .in('statut', ['en_attente', 'en_attente_critique', 'modif_en_attente'])
      .order('created_at', { ascending: false });

    // Les agents ne voient que leurs propres documents
    if (role === 'AGENT') {
      query = query.eq('uploaded_by', req.user.id);
    }

    const { data, error } = await query;
    if (error) throw error;
    res.json(await enrichDocs(data));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/validation/approved
router.get('/approved', authMiddleware, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('documents')
      .select('*')
      .eq('statut', 'valide')
      .order('validated_at', { ascending: false });
    if (error) throw error;
    res.json(await enrichDocs(data));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/validation/rejected
router.get('/rejected', authMiddleware, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('documents')
      .select('*')
      .eq('statut', 'rejete')
      .order('updated_at', { ascending: false });
    if (error) throw error;
    res.json(await enrichDocs(data));
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
