import React, { useEffect, useState } from 'react';
import { FileText, Check, X, ArrowLeft, Calendar, User, Building, Download, Eye } from 'lucide-react';
import { apiService } from '../../services/ApiService';
import { authService } from '../../services/AuthService';
import { DocumentPreview } from '../components/DocumentPreview';
import { useApp } from '../../context/AppContext';

interface ApprovedDocument {
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
  validation_commentaire?: string;
}

export const ValidatedDocumentsPage: React.FC = () => {
  const [documents, setDocuments] = useState<ApprovedDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDoc, setSelectedDoc] = useState<ApprovedDocument | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const { navigation } = useApp();

  useEffect(() => {
    loadApprovedDocuments();
  }, []);

  const loadApprovedDocuments = async () => {
    try {
      setLoading(true);
      const data = await apiService.getApprovedDocuments() as ApprovedDocument[];
      setDocuments(data);
    } catch (error) {
      console.error('Erreur chargement documents valides:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatutLabel = (statut: string): { label: string; color: string } => {
    const labels: Record<string, { label: string; color: string }> = {
      'valide': { label: 'Valide', color: 'bg-green-100 text-green-700' },
      'modifie': { label: 'Modifie', color: 'bg-blue-100 text-blue-700' },
      'supprime': { label: 'Supprime', color: 'bg-red-100 text-red-700' },
      'approuve_partiel': { label: 'Approuve partiel', color: 'bg-yellow-100 text-yellow-700' },
    };
    return labels[statut] || { label: statut, color: 'bg-gray-100 text-gray-700' };
  };

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-emerald-600 to-emerald-800 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigation.navigate('validation')}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <ArrowLeft size={24} />
            </button>
            <div>
              <h2 className="text-3xl font-bold">Documents Valides</h2>
              <p className="text-emerald-100 mt-1">Historique des documents validates</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold">{documents.length}</p>
            <p className="text-emerald-200 text-sm">documents valides</p>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto"></div>
          <p className="mt-4 text-slate-600">Chargement...</p>
        </div>
      ) : documents.length === 0 ? (
        <div className="bg-white rounded-xl p-12 text-center border border-slate-200">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FileText className="text-gray-400" size={32} />
          </div>
          <h3 className="text-xl font-semibold text-slate-800 mb-2">Aucun document valide</h3>
          <p className="text-slate-600">Aucun document n'a encore ete valide</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 bg-white rounded-xl border border-slate-200 overflow-hidden">
            <div className="p-4 border-b border-slate-200 bg-slate-50">
              <h3 className="font-semibold text-slate-800">Liste des documents ({documents.length})</h3>
            </div>
            <div className="divide-y divide-slate-100 max-h-[600px] overflow-y-auto">
              {documents.map((doc) => {
                const statutInfo = getStatutLabel(doc.statut);
                return (
                  <button
                    key={doc.id}
                    onClick={() => setSelectedDoc(doc)}
                    className={`w-full p-4 text-left hover:bg-slate-50 transition-colors ${
                      selectedDoc?.id === doc.id ? 'bg-emerald-50 border-l-4 border-emerald-600' : ''
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center shrink-0">
                        <FileText className="text-emerald-600" size={20} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-slate-800 truncate">{doc.titre}</p>
                        <p className="text-xs text-slate-500 mt-1">
                          Valide par {doc.validateur_nom || 'N/A'}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <span className={`px-2 py-0.5 rounded text-xs font-medium ${statutInfo.color}`}>
                            {statutInfo.label}
                          </span>
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
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
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    getStatutLabel(selectedDoc.statut).color
                  }`}>
                    {getStatutLabel(selectedDoc.statut).label}
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

                <div className="bg-emerald-50 rounded-lg p-4 mb-6">
                  <h4 className="font-semibold text-emerald-800 mb-4">Informations de validation</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
                        <User className="text-emerald-600" size={20} />
                      </div>
                      <div>
                        <label className="text-xs text-emerald-600">Valide par</label>
                        <p className="font-medium text-slate-800">{selectedDoc.validateur_nom || 'N/A'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
                        <Building className="text-emerald-600" size={20} />
                      </div>
                      <div>
                        <label className="text-xs text-emerald-600">Agence</label>
                        <p className="font-medium text-slate-800">{selectedDoc.validateur_agence_nom || 'N/A'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
                        <Calendar className="text-emerald-600" size={20} />
                      </div>
                      <div>
                        <label className="text-xs text-emerald-600">Date de validation</label>
                        <p className="font-medium text-slate-800">{selectedDoc.validated_at_formatted || 'N/A'}</p>
                      </div>
                    </div>
                    {selectedDoc.validation_commentaire && (
                      <div className="col-span-2">
                        <label className="text-xs text-emerald-600">Commentaire</label>
                        <p className="font-medium text-slate-800">{selectedDoc.validation_commentaire}</p>
                      </div>
                    )}
                  </div>
                </div>

                {selectedDoc.fichier_path && (
                  <div className="flex gap-4">
                    <button
                      onClick={() => setPreviewOpen(true)}
                      className="flex-1 flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white py-3 px-6 rounded-lg font-medium transition-colors"
                    >
                      <Eye size={20} />
                      Voir le document
                    </button>
                    <a
                      href={selectedDoc.fichier_path}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-lg font-medium transition-colors"
                    >
                      <Download size={20} />
                      Telcharger
                    </a>
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