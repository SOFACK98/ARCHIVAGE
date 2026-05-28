import { Router } from 'express';
import multer from 'multer';
import { supabase } from '../config/supabase.js';
import { authMiddleware } from '../middlewares/auth.js';

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

// ── Types documents ──────────────────────────────────────────
router.get('/types-documents', authMiddleware, async (req, res) => {
  const { data, error } = await supabase.from('types_documents').select('*').order('nom');
  if (error) return res.status(500).json({ message: error.message });
  res.json(data || []);
});

router.post('/types-documents', authMiddleware, async (req, res) => {
  const { nom, description } = req.body;
  const { data, error } = await supabase.from('types_documents').insert({ nom, description }).select().single();
  if (error) return res.status(500).json({ message: error.message });
  res.status(201).json(data);
});

// ── Départements ─────────────────────────────────────────────
router.get('/departements', authMiddleware, async (req, res) => {
  const { data, error } = await supabase.from('departements').select('*').order('nom');
  if (error) return res.status(500).json({ message: error.message });
  res.json(data || []);
});

router.post('/departements', authMiddleware, async (req, res) => {
  const { nom, description } = req.body;
  const { data, error } = await supabase.from('departements').insert({ nom, description }).select().single();
  if (error) return res.status(500).json({ message: error.message });
  res.status(201).json(data);
});

// ── Agences ───────────────────────────────────────────────────
router.get('/agences', authMiddleware, async (req, res) => {
  const { data, error } = await supabase.from('agences').select('*').order('nom');
  if (error) return res.status(500).json({ message: error.message });
  res.json(data || []);
});

router.post('/agences', authMiddleware, async (req, res) => {
  const { code, nom } = req.body;
  const { data, error } = await supabase.from('agences').insert({ code, nom }).select().single();
  if (error) return res.status(500).json({ message: error.message });
  res.status(201).json(data);
});

// ── Stats ─────────────────────────────────────────────────────
router.get('/stats', authMiddleware, async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const [{ count: totalDocuments }, { count: todayUploads }, { count: pendingApprovals }, { count: activeUsers }] = await Promise.all([
      supabase.from('documents').select('*', { count: 'exact', head: true }),
      supabase.from('documents').select('*', { count: 'exact', head: true }).gte('created_at', today),
      supabase.from('documents').select('*', { count: 'exact', head: true }).in('statut', ['en_attente', 'en_attente_critique']),
      supabase.from('utilisateurs').select('*', { count: 'exact', head: true }).eq('actif', true),
    ]);
    res.json({ totalDocuments, todayUploads, pendingApprovals, activeUsers });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── Upload fichier ────────────────────────────────────────────
router.post('/upload', authMiddleware, upload.single('fichier'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'Aucun fichier reçu' });
    const fileName = `${Date.now()}_${req.file.originalname.replace(/\s+/g, '_')}`;
    const { error } = await supabase.storage
      .from('documents')
      .upload(fileName, req.file.buffer, { contentType: req.file.mimetype, upsert: false });
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

// ── Audit logs ────────────────────────────────────────────────
router.get('/audit/logs', authMiddleware, async (req, res) => {
  try {
    const { data, error } = await supabase.from('audit_logs').select('*').order('created_at', { ascending: false }).limit(200);
    if (error) throw error;
    res.json(data || []);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/audit/log', authMiddleware, async (req, res) => {
  try {
    const { action, module, details, timestamp } = req.body;
    await supabase.from('audit_logs').insert({ action, module, details, user_id: req.user.id, created_at: timestamp });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── Utilisateurs ──────────────────────────────────────────────
router.get('/users', authMiddleware, async (req, res) => {
  const { data, error } = await supabase.from('utilisateurs').select('*').order('nom');
  if (error) return res.status(500).json({ message: error.message });
  res.json(data || []);
});

router.post('/users', authMiddleware, async (req, res) => {
  const { data, error } = await supabase.from('utilisateurs').insert(req.body).select().single();
  if (error) return res.status(500).json({ message: error.message });
  res.status(201).json(data);
});

router.put('/users/:id', authMiddleware, async (req, res) => {
  const { data, error } = await supabase.from('utilisateurs').update(req.body).eq('id', req.params.id).select().single();
  if (error) return res.status(500).json({ message: error.message });
  res.json(data);
});

router.delete('/users/:id', authMiddleware, async (req, res) => {
  const { error } = await supabase.from('utilisateurs').delete().eq('id', req.params.id);
  if (error) return res.status(500).json({ message: error.message });
  res.json({ success: true });
});

router.get('/roles', authMiddleware, async (req, res) => {
  const { data, error } = await supabase.from('roles').select('*');
  if (error) return res.status(500).json({ message: error.message });
  res.json(data || []);
});

// ── Auth me ───────────────────────────────────────────────────
router.get('/auth/me', authMiddleware, async (req, res) => {
  const { data, error } = await supabase.from('utilisateurs').select('*').eq('id', req.user.id).single();
  if (error) return res.status(500).json({ message: error.message });
  res.json(data);
});

export default router;
