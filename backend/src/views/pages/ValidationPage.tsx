import React, { useEffect, useState } from 'react';
import { FileText, Check, X, Clock, User, Building, Calendar, Shield } from 'lucide-react';
import { apiService } from '../../services/ApiService';
import { authService } from '../../services/AuthService';
import { DocumentPreview } from '../components/DocumentPreview';
import { useApp } from '../../context/AppContext';

interface PendingDocument {
  id: number;
  reference: string;
  titre: string;
  type: string;
  departement: string;
  departement_id?: number;
  agencia_id?: number;
  agencia_nom: string;
  uploaded_by_nom: string;
  uploaded_by_id?: number;
  created_at: string;
  confidentialite: string;
  statut: string;
  validation_level: number;
  fichier_nom?: string;
  fichier_path?: string;
  fichier_type?: string;
}

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

export const ValidationPage: React.FC = () => {
  const [documents, setDocuments] = useState<PendingDocument[]>([]);
  const [approvedDocuments, setApprovedDocuments] = useState<ApprovedDocument[]>([]);
  const [rejectedDocuments, setRejectedDocuments] = useState<ApprovedDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingApproved, setLoadingApproved] = useState(true);
  const [loadingRejected, setLoadingRejected] = useState(true);
  const [selectedDoc, setSelectedDoc] = useState<PendingDocument | null>(null);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [confirmApproveOpen, setConfirmApproveOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error'>('success');
  const [toastVisible, setToastVisible] = useState(false);
  const [rejectMotif, setRejectMotif] = useState('');
  const [previewOpen, setPreviewOpen] = useState(false);
  
  const currentUser = authService.getCurrentUser();
  const userRole = currentUser?.role_code || '';
  const { reloadStats, navigation } = useApp();

  useEffect(() => {
    loadPendingDocuments();
    loadApprovedDocuments();
    loadRejectedDocuments();
  }, []);

  const loadPendingDocuments = async () => {
    try {
      setLoading(true);
      const data = await apiService.getPendingValidation() as PendingDocument[];
      const filtered = filterDocumentsByRole(data);
      setDocuments(filtered);
    } catch (error) {
      console.error('Erreur chargement documents:', error);
      alert('Erreur lors du chargement des documents: ' + error);
    } finally {
      setLoading(false);
    }
  };

  const loadApprovedDocuments = async () => {
    try {
      setLoadingApproved(true);
      const data = await apiService.getApprovedDocuments() as ApprovedDocument[];
      setApprovedDocuments(data);
    } catch (error) {
      console.error('Erreur chargement documents valides:', error);
    } finally {
      setLoadingApproved(false);
    }
  };

  const loadRejectedDocuments = async () => {
    try {
      setLoadingRejected(true);
      const data = await apiService.getRejectedDocuments() as ApprovedDocument[];
      setRejectedDocuments(data);
    } catch (error) {
      console.error('Erreur chargement documents rejetes:', error);
    } finally {
      setLoadingRejected(false);
    }
  };

  const canViewDocument = (doc: PendingDocument): boolean => {
    if (userRole === 'ADMIN') return true;
    if (userRole === 'CHEF_AGENCE') {
      return currentUser?.agence_id !== undefined && doc.agencia_id !== undefined && currentUser.agence_id === doc.agencia_id;
    }
    if (userRole === 'CHEF_DEPARTEMENT' || userRole === 'CHEF_DEPT') {
      return true;
    }
    return false;
  };

  const filterDocumentsByRole = (docs: PendingDocument[]): PendingDocument[] => {
    return docs.filter(doc => canViewDocument(doc));
  };

  const canApprove = (doc: PendingDocument): boolean => {
    if (userRole === 'ADMIN') return true;
    if (userRole === 'CHEF_AGENCE') {
      return doc.agencia_id !== undefined && currentUser?.agence_id !== undefined && doc.agencia_id === currentUser.agence_id;
    }
    if (userRole === 'CHEF_DEPARTEMENT' || userRole === 'CHEF_DEPT') {
      return true;
    }
    return false;
  };

  const getRoleLabel = (role: string): string => {
    const labels: Record<string, string> = {
      'ADMIN': 'Administrateur',
      'CHEF_AGENCE': 'Chef d\'agence',
      'CHEF_DEPT': 'Chef de departement'
    };
    return labels[role] || role;
  };

  const handleApprove = async (id: number) => {
    try {
      await apiService.approveDocument(id);
      setDocuments(prev => prev.filter(d => d.id !== id));
      setSelectedDoc(null);
      setConfirmApproveOpen(false);
      showToast('Document valide avec succes', 'success');
      await reloadStats();
    } catch (error: any) {
      const msg = error?.message || 'Erreur lors de l\'approbation';
      console.error('Erreur approveDocument:', msg);
      showToast(msg, 'error');
    }
  };

  const onApproveButtonClick = () => {
    if (!selectedDoc) return;
    setConfirmApproveOpen(true);
  };

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToastMessage(message);
    setToastType(type);
    setToastVisible(true);
    window.setTimeout(() => setToastVisible(false), 3000);
  };

  const handleReject = async () => {
    if (!selectedDoc) return;
    try {
      const result = (await apiService.rejectDocument(selectedDoc.id, rejectMotif)) as { message?: string };
      setDocuments(prev => prev.filter(d => d.id !== selectedDoc.id));
      setSelectedDoc(null);
      setRejectModalOpen(false);
      setRejectMotif('');
      showToast(result?.message || 'Document rejete avec succes', 'success');
      await reloadStats();
    } catch (error: any) {
      const msg = error?.message || 'Erreur lors du rejet';
      console.error('Erreur rejectDocument:', msg);
      showToast(msg, 'error');
    }
  };

  const getDocumentType = (doc: PendingDocument) => {
    return {
      label: doc.type ? 'Type: ' + doc.type : 'Nouveau document',
      color: 'bg-green-100 text-green-700'
    };
  };

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-emerald-600 to-emerald-800 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold">Validation Documents</h2>
            <p className="text-emerald-100 mt-1">Gerez les documents en attente de validation</p>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-2 bg-white/20 px-4 py-2 rounded-lg">
              <Shield size={20} />
              <span className="font-medium">{getRoleLabel(userRole)}</span>
            </div>
            <p className="text-sm text-emerald-200 mt-2">{currentUser?.nom || currentUser?.prenom || 'Utilisateur'}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl p-4 border border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
              <Clock className="text-orange-600" size={20} />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-800">{documents.length}</p>
              <p className="text-sm text-slate-500">En attente</p>
            </div>
          </div>
        </div>
        <button
          type="button"
          onClick={() => {
            navigation.navigate('rejected-documents');
          }}
          className="w-full text-left bg-white rounded-xl p-4 border-2 cursor-pointer transition-all hover:shadow-lg border-red-500 hover:border-red-600"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
              <X className="text-red-600" size={20} />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-800">
                {loadingRejected ? '-' : rejectedDocuments.length}
              </p>
              <p className="text-sm text-slate-500">Rejetes</p>
            </div>
          </div>
          {rejectedDocuments.length > 0 && (
            <p className="text-xs text-red-600 mt-2">Cliquez pour voir les details</p>
          )}
        </button>
        <button
          type="button"
          onClick={() => {
            navigation.navigate('validated-documents');
          }}
          className="w-full text-left bg-white rounded-xl p-4 border-2 cursor-pointer transition-all hover:shadow-lg border-emerald-500 hover:border-emerald-600"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
              <Check className="text-emerald-600" size={20} />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-800">
                {loadingApproved ? '-' : approvedDocuments.length}
              </p>
              <p className="text-sm text-slate-500">Valides</p>
            </div>
          </div>
          {approvedDocuments.length > 0 && (
            <p className="text-xs text-emerald-600 mt-2">Cliquez pour voir les details</p>
          )}
        </button>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto"></div>
          <p className="mt-4 text-slate-600">Chargement...</p>
        </div>
      ) : documents.length === 0 ? (
        <div className="bg-white rounded-xl p-12 text-center border border-slate-200">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check className="text-green-600" size={32} />
          </div>
          <h3 className="text-xl font-semibold text-slate-800 mb-2">Aucun document en attente</h3>
          <p className="text-slate-600">Tous les documents ont ete traites</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 bg-white rounded-xl border border-slate-200 overflow-hidden">
            <div className="p-4 border-b border-slate-200 bg-slate-50">
              <h3 className="font-semibold text-slate-800">Documents a valider</h3>
            </div>
            <div className="divide-y divide-slate-100 max-h-[600px] overflow-y-auto">
              {documents.map((doc) => {
                const docType = getDocumentType(doc);
                return (
                  <button
                    key={doc.id}
                    onClick={() => setSelectedDoc(doc)}
                    className={'w-full p-4 text-left hover:bg-slate-50 transition-colors ' + (
                      selectedDoc?.id === doc.id ? 'bg-emerald-50 border-l-4 border-emerald-600' : ''
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <div className={'w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ' + (
                        doc.confidentialite === 'critique' ? 'bg-red-100' : 'bg-blue-100'
                      )}>
                        <FileText className={doc.confidentialite === 'critique' ? 'text-red-600' : 'text-blue-600'} size={20} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-slate-800 truncate">{doc.titre}</p>
                        <p className="text-xs text-slate-500 mt-1">
                          {doc.uploaded_by_nom} - {new Date(doc.created_at).toLocaleDateString('fr-FR')}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <span className={'px-2 py-0.5 rounded text-xs font-medium ' + (
                            doc.confidentialite === 'critique' ? 'bg-red-100 text-red-700' :
                            doc.confidentialite === 'eleve' ? 'bg-orange-100 text-orange-700' :
                            'bg-gray-100 text-gray-700'
                          )}>
                            {doc.confidentialite}
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
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-slate-800">{selectedDoc.titre}</h3>
                    <p className="text-sm text-slate-500">{selectedDoc.reference} - {selectedDoc.type}</p>
                  </div>
                  <span className={'px-3 py-1 rounded-full text-sm font-medium ' + (
                    selectedDoc.confidentialite === 'critique' ? 'bg-red-100 text-red-700' :
                    selectedDoc.confidentialite === 'eleve' ? 'bg-orange-100 text-orange-700' :
                    'bg-gray-100 text-gray-700'
                  )}>
                    {selectedDoc.confidentialite}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="flex items-center gap-2">
                    <User className="text-slate-400" size={18} />
                    <span className="text-sm text-slate-600">{selectedDoc.uploaded_by_nom}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Building className="text-slate-400" size={18} />
                    <span className="text-sm text-slate-600">{selectedDoc.agencia_nom}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="text-slate-400" size={18} />
                    <span className="text-sm text-slate-600">{new Date(selectedDoc.created_at).toLocaleDateString('fr-FR')}</span>
                  </div>
                </div>

                {selectedDoc.fichier_path && (
                  <div className="mb-6">
                    <button
                      onClick={() => {
                        console.log('[ValidationPage] Preview clicked, fichier_path:', selectedDoc.fichier_path, 'fichier_type:', selectedDoc.fichier_type);
                        setPreviewOpen(true);
                      }}
                      className="w-full py-3 border-2 border-dashed border-slate-300 rounded-lg text-slate-600 hover:border-emerald-500 hover:text-emerald-600 transition-colors"
                    >
                      Voir l'apercu du document ({selectedDoc.fichier_path})
                    </button>
                  </div>
                )}

                {canApprove(selectedDoc) ? (
                  <>
                    <div className="flex gap-4">
                      <button
                        onClick={onApproveButtonClick}
                        className="flex-1 flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white py-3 px-6 rounded-lg font-medium transition-colors"
                      >
                        <Check size={20} />
                        Approuver
                      </button>
                      <button
                        onClick={() => setRejectModalOpen(true)}
                        className="flex-1 flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white py-3 px-6 rounded-lg font-medium transition-colors"
                      >
                        <X size={20} />
                        Rejeter
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="flex-1 p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-center">
                    <p className="text-yellow-700 font-medium">
                      Vous n'avez pas les droits pour valider ce document
                    </p>
                    <p className="text-sm text-yellow-600 mt-1">
                      Ce document necessite une validation par le Chef de departement
                    </p>
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
              <h3 className="text-xl font-bold text-slate-800 mb-4">Apercu agrandi - {selectedDoc.titre}</h3>
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

      {confirmApproveOpen && selectedDoc && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h3 className="text-xl font-bold text-slate-800 mb-4">Confirmer l'approbation</h3>
            <p className="text-slate-600 mb-4">Voulez-vous vraiment approuver le document <strong>{selectedDoc.titre}</strong> ?</p>
            <div className="flex gap-4">
              <button
                onClick={() => setConfirmApproveOpen(false)}
                className="flex-1 py-2 px-4 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50"
              >
                Annuler
              </button>
              <button
                onClick={() => selectedDoc && handleApprove(selectedDoc.id)}
                className="flex-1 py-2 px-4 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                Valider
              </button>
            </div>
          </div>
        </div>
      )}

      {toastVisible && (
        <div className={'fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg text-white ' + (toastType === 'success' ? 'bg-emerald-600' : 'bg-red-600')}>
          {toastMessage}
        </div>
      )}

      {rejectModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h3 className="text-xl font-bold text-slate-800 mb-4">Rejeter le document</h3>
            <p className="text-slate-600 mb-4">Veuillez preciser le motif du rejet :</p>
            <textarea
              value={rejectMotif}
              onChange={(e) => setRejectMotif(e.target.value)}
              className="w-full p-3 border border-slate-300 rounded-lg mb-4 h-24 resize-none"
              placeholder="Motif du rejet..."
            />
            <div className="flex gap-4">
              <button
                onClick={() => setRejectModalOpen(false)}
                className="flex-1 py-2 px-4 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50"
              >
                Annuler
              </button>
              <button
                onClick={handleReject}
                className="flex-1 py-2 px-4 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Confirmer le rejet
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};