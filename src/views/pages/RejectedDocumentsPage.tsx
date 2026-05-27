import React, { useEffect, useState } from 'react';
import { FileText, X, ArrowLeft, Calendar, User, Building, Download, Eye } from 'lucide-react';
import { apiService } from '../../services/ApiService';
import { DocumentPreview } from '../components/DocumentPreview';
import { useApp } from '../../context/AppContext';

interface RejectedDocument {
  id: number;
  reference: string;
  titre: string;
  fichier_nom?: string;
  fichier_path?: string;
  fichier_type?: string;
  fichier_taille?: number;
  fichier_taille_formatted?: string;
  statut: string;
  validated_at?: string;
  validated_at_formatted?: string;
  confidentialite: string;
  created_at: string;
  type: string;
  departement: string;
  agencia_nom: string;
  validateur_id?: number;
  validateur_nom?: string;
  validateur_agence_nom?: string;
  rejection_motif?: string;
}

export const RejectedDocumentsPage: React.FC = () => {
  const [documents, setDocuments] = useState<RejectedDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDoc, setSelectedDoc] = useState<RejectedDocument | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const { navigation } = useApp();

  useEffect(() => {
    loadRejectedDocuments();
  }, []);

  const loadRejectedDocuments = async () => {
    try {
      setLoading(true);
      console.log('Loading rejected documents...');
      const data = await apiService.getRejectedDocuments() as RejectedDocument[];
      console.log('Rejected documents loaded:', data.length, data);
      setDocuments(data);
    } catch (error) {
      console.error('Erreur chargement documents rejetes:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-red-600 to-red-800 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigation.navigate('validation')}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <ArrowLeft size={24} />
            </button>
            <div>
              <h2 className="text-3xl font-bold">Documents Rejetes</h2>
              <p className="text-red-100 mt-1">Historique des documents rejetes</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold">{documents.length}</p>
            <p className="text-red-200 text-sm">documents rejetes</p>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
          <p className="mt-4 text-slate-600">Chargement...</p>
        </div>
      ) : documents.length === 0 ? (
        <div className="bg-white rounded-xl p-12 text-center border border-slate-200">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FileText className="text-gray-400" size={32} />
          </div>
          <h3 className="text-xl font-semibold text-slate-800 mb-2">Aucun document rejete</h3>
          <p className="text-slate-600">Aucun document n'a encore ete rejete</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 bg-white rounded-xl border border-slate-200 overflow-hidden">
            <div className="p-4 border-b border-slate-200 bg-slate-50">
              <h3 className="font-semibold text-slate-800">Liste des documents ({documents.length})</h3>
            </div>
            <div className="divide-y divide-slate-100 max-h-[600px] overflow-y-auto">
              {documents.map((doc) => (
                <button
                  key={doc.id}
                  onClick={() => setSelectedDoc(doc)}
                  className={`w-full p-4 text-left hover:bg-slate-50 transition-colors ${
                    selectedDoc?.id === doc.id ? 'bg-red-50 border-l-4 border-red-600' : ''
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center shrink-0">
                      <X className="text-red-600" size={20} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-slate-800 truncate">{doc.titre}</p>
                      <p className="text-xs text-slate-500 mt-1">
                        Rejete par {doc.validateur_nom || 'N/A'}
                      </p>
                      <p className="text-xs text-red-500 mt-1 truncate">
                        Motif: {doc.rejection_motif || 'Sans motif'}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="lg:col-span-2">
            {selectedDoc ? (
              <div className="bg-white rounded-xl border border-slate-200 p-6">
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <h3 className="text-xl font-bold text-slate-800">{selectedDoc.titre}</h3>
                    <p className="text-sm text-slate-500">{selectedDoc.reference} - {selectedDoc.type}</p>
                  </div>
                  <span className="px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-700">
                    Rejete
                  </span>
                </div>

                <div className="bg-slate-50 rounded-lg p-4 mb-6">
                  <h4 className="font-semibold text-slate-700 mb-4">Informations du document</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs text-slate-500">Nom du fichier</label>
                      <p className="font-medium text-slate-800">{selectedDoc.fichier_nom || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="text-xs text-slate-500">Taille</label>
                      <p className="font-medium text-slate-800">{selectedDoc.fichier_taille_formatted || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="text-xs text-slate-500">Type de document</label>
                      <p className="font-medium text-slate-800">{selectedDoc.type || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="text-xs text-slate-500">Departement</label>
                      <p className="font-medium text-slate-800">{selectedDoc.departement || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="text-xs text-slate-500">Agence</label>
                      <p className="font-medium text-slate-800">{selectedDoc.agencia_nom || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="text-xs text-slate-500">Confidentialite</label>
                      <p className="font-medium text-slate-800">{selectedDoc.confidentialite || 'N/A'}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-red-50 rounded-lg p-4 mb-6">
                  <h4 className="font-semibold text-red-800 mb-4">Informations du rejet</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                        <User className="text-red-600" size={20} />
                      </div>
                      <div>
                        <label className="text-xs text-red-600">Rejete par</label>
                        <p className="font-medium text-slate-800">{selectedDoc.validateur_nom || 'N/A'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                        <Building className="text-red-600" size={20} />
                      </div>
                      <div>
                        <label className="text-xs text-red-600">Agence</label>
                        <p className="font-medium text-slate-800">{selectedDoc.validateur_agence_nom || 'N/A'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                        <Calendar className="text-red-600" size={20} />
                      </div>
                      <div>
                        <label className="text-xs text-red-600">Date du rejet</label>
                        <p className="font-medium text-slate-800">{selectedDoc.validated_at_formatted || 'N/A'}</p>
                      </div>
                    </div>
                  </div>
                  {selectedDoc.rejection_motif && (
                    <div className="mt-4 pt-4 border-t border-red-200">
                      <label className="text-xs text-red-600">Motif du rejet</label>
                      <p className="font-medium text-slate-800 mt-1">{selectedDoc.rejection_motif}</p>
                    </div>
                  )}
                </div>

                {selectedDoc.fichier_path && (
                  <div className="flex gap-4">
                    <button
                      onClick={() => setPreviewOpen(true)}
                      className="flex-1 flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white py-3 px-6 rounded-lg font-medium transition-colors"
                    >
                      <Eye size={20} />
                      Voir le document
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
                <FileText className="text-slate-300 mx-auto mb-4" size={48} />
                <p className="text-slate-500">Selectionnez un document pour voir les details</p>
              </div>
            )}
          </div>
        </div>
      )}

      {previewOpen && selectedDoc && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl overflow-hidden relative" style={{ width: '210mm', height: '297mm', maxWidth: '90vw', maxHeight: '90vh' }}>
            <button
              onClick={() => setPreviewOpen(false)}
              className="absolute top-3 right-3 z-10 px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Fermer
            </button>
            <div className="h-full overflow-auto p-4" style={{ width: '100%', height: '100%' }}>
              <h3 className="text-xl font-bold text-slate-800 mb-4">Apercu - {selectedDoc.titre}</h3>
              <div className="h-[calc(100vh-160px)]">
                <DocumentPreview
                  src={selectedDoc.fichier_path}
                  type={selectedDoc.fichier_type || ''}
                  name={selectedDoc.fichier_nom || selectedDoc.titre}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};