import React, { useState, useEffect } from 'react';
import { X, FileText, Save } from 'lucide-react';
import { apiService } from '../../services/ApiService';
import { authService } from '../../services/AuthService';
import { DocumentPreview } from './DocumentPreview';

interface Props {
  onClose: () => void;
  onSuccess: () => void;
  dossierId?: number | null;
}

export const AddDocumentModal: React.FC<Props> = ({ onClose, onSuccess, dossierId }) => {
  const [titre, setTitre] = useState('');
  const [typeDocumentId, setTypeDocumentId] = useState('');
  const [confidentialite, setConfidentialite] = useState('normal');
  const [fichier, setFichier] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error'>('success');
  const [toastVisible, setToastVisible] = useState(false);
  const [types, setTypes] = useState<any[]>([]);
  const currentUser = authService.getCurrentUser();

  useEffect(() => {
    apiService.getTypesDocuments().then((t) => {
      setTypes(t as any[]);
    }).catch((err) => {
      console.error('Erreur lors du chargement des types de documents:', err);
    });
  }, []);

  useEffect(() => {
    if (fichier) {
      const url = URL.createObjectURL(fichier);
      setPreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    }
    setPreviewUrl(null);
  }, [fichier]);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToastMessage(message);
    setToastType(type);
    setToastVisible(true);
    setTimeout(() => setToastVisible(false), 3000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fichier || !titre || !typeDocumentId) {
      showToast('Veuillez remplir tous les champs obligatoires', 'error');
      return;
    }
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('fichier', fichier);

      const uploadResult = await apiService.uploadFile(formData) as { fichier_nom: string; fichier_path: string; fichier_type: string; fichier_taille: number };

      // Get user's departement_id from current user
      const userDepartementId = currentUser?.departement_id || null;

      const result = await apiService.createDocument({
        titre,
        type_document_id: typeDocumentId,
        departement_id: userDepartementId,
        fichier_nom: uploadResult.fichier_nom,
        fichier_path: uploadResult.fichier_path,
        fichier_type: uploadResult.fichier_type || fichier.type,
        fichier_taille: uploadResult.fichier_taille,
        confidentialite
      }) as { id: number };

      // Si un dossier est ciblé, lier automatiquement le document
      if (dossierId && result?.id) {
        await apiService.addDocumentToDossier(dossierId, result.id);
      }

      showToast('Document importé avec succès! Il est en attente de validation.', 'success');
      onSuccess();
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (error: any) {
      console.error('Erreur:', error);
      showToast(`Erreur: ${error?.message || 'Impossible d\'enregistrer le document'}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="p-6 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
              <FileText className="text-primary-700" size={20} />
            </div>
            <h3 className="text-xl font-bold text-slate-800">Nouveau document</h3>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Titre du document *</label>
            <input
              type="text"
              value={titre}
              onChange={(e) => setTitre(e.target.value)}
              required
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-600"
              placeholder="Ex: Contrat Client A"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Type de document *</label>
              <select
                value={typeDocumentId}
                onChange={(e) => setTypeDocumentId(e.target.value)}
                required
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-600"
              >
                <option value="">Sélectionner...</option>
                {types.map(t => (
                  <option key={t.id} value={t.id}>{t.nom}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Département (non modifiable)</label>
              <input
                type="text"
                value={currentUser?.departement || 'Non défini'}
                disabled
                className="w-full px-4 py-2 border border-slate-300 rounded-lg bg-slate-100 text-slate-500 cursor-not-allowed"
              />
              <p className="text-xs text-slate-500 mt-1">Ce champ est défini par votre compte et ne peut pas être modifié ici.</p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Confidentialité *</label>
            <select
              value={confidentialite}
              onChange={(e) => setConfidentialite(e.target.value)}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-600"
            >
              <option value="normal">Normal</option>
              <option value="eleve">Élevé</option>
              <option value="critique">Critique</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Fichier *</label>
            <div className="relative">
              <input
                type="file"
                onChange={(e) => setFichier(e.target.files?.[0] || null)}
                required
                accept=".pdf"
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"
              />
            </div>
            {fichier && (
              <p className="text-sm text-slate-600 mt-2">
                Fichier sélectionné: {fichier.name} ({(fichier.size / 1024).toFixed(2)} KB)
              </p>
            )}
          </div>

          {previewUrl && fichier && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Aperçu</label>
              <div className="border border-slate-300 rounded-lg p-4 bg-slate-50">
                <DocumentPreview src={previewUrl} type={fichier.type} name={fichier.name} />
              </div>
            </div>
          )}

          {toastVisible && (
            <div className={`fixed bottom-4 right-4 z-50 px-4 py-3 rounded-lg text-white shadow-lg ${toastType === 'success' ? 'bg-emerald-600' : 'bg-red-600'}`}>
              {toastMessage}
            </div>
          )}
          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-primary-700 text-white rounded-lg hover:bg-primary-800 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Save size={18} />
              {loading ? 'Enregistrement...' : 'Enregistrer'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50"
            >
              Annuler
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
