// ============================================================
// VIEW/PAGE : DocumentsPage
// ============================================================

import React, { useState, type ReactNode } from 'react';
import { Upload, Filter, Eye, Download, Edit, Trash2, FileText, Clock, CheckCircle, XCircle } from 'lucide-react';
import { AddDocumentModal } from '../components/AddDocumentModal';
import { useApp } from '../../context/AppContext';
import { apiService } from '../../services/ApiService';
import { authService } from '../../services/AuthService';
import type { ConfidentialityLevel } from '../../models/Document';

const getConfidentialityStyle = (level: ConfidentialityLevel): string => {
  const styles: Record<ConfidentialityLevel, string> = {
    'Critique': 'bg-red-100 text-red-700',
    'Élevé': 'bg-orange-100 text-orange-700',
    'Normal': 'bg-blue-100 text-blue-700'
  };
  return styles[level];
};

const getStatusStyle = (statut: string): { bg: string; text: string; icon: ReactNode } => {
  if (statut === 'valide' || statut === 'modifie') {
    return { bg: 'bg-green-100', text: 'text-green-700', icon: <CheckCircle size={14} /> };
  }
  if (statut === 'en_attente' || statut === 'en_attente_critique' || statut === 'modif_en_attente' || statut === 'suppr_en_attente') {
    return { bg: 'bg-yellow-100', text: 'text-yellow-700', icon: <Clock size={14} /> };
  }
  if (statut === 'rejete') {
    return { bg: 'bg-red-100', text: 'text-red-700', icon: <XCircle size={14} /> };
  }
  return { bg: 'bg-slate-100', text: 'text-slate-700', icon: <FileText size={14} /> };
};

const getStatusLabel = (statut: string): string => {
  const labels: Record<string, string> = {
    'valide': 'Validé',
    'en_attente': 'En attente',
    'en_attente_critique': 'En attente (Critique)',
    'rejete': 'Rejeté',
    'modifie': 'Modifié',
    'modif_en_attente': 'Modif. en attente',
    'modif_en_attente_critique': 'Modif. en attente (Critique)',
    'suppr_en_attente': 'Suppr. en attente',
    'suppr_en_attente_critique': 'Suppr. en attente (Critique)',
    'approuve_partiel': 'Approuvé (1/2)',
    'modif_approuve_partiel': 'Modif. approuvée (1/2)',
    'suppr_approuve_partiel': 'Suppr. approuvée (1/2)',
    'supprime': 'Supprimé'
  };
  return labels[statut] || statut;
};

export const DocumentsPage: React.FC = () => {
  const { documents } = useApp();
  const { filteredDocuments, searchQuery, setSearchQuery, openDocument, reload } = documents;
  const [showAddModal, setShowAddModal] = useState(false);
  const [showModifyModal, setShowModifyModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [selectedDocId, setSelectedDocId] = useState<number | null>(null);
  const [modifications, setModifications] = useState('');
  
  const canModifyOrDelete = () => {
    const user = authService.getCurrentUser();
    return user?.role_code === 'ADMIN' || user?.role_code === 'CHEF_AGENCE' || user?.role_code === 'CHEF_DEPT';
  };

  const handleRequestModify = async () => {
    if (!selectedDocId || !modifications) return;
    try {
      await apiService.requestDocumentModification(selectedDocId, modifications);
      setShowModifyModal(false);
      setModifications('');
      setSelectedDocId(null);
      reload();
    } catch (error) {
      console.error('Erreur demande modification:', error);
    }
  };

  const handleRequestDelete = async () => {
    if (!selectedDocId) return;
    try {
      await apiService.requestDocumentDeletion(selectedDocId);
      setShowDeleteConfirm(false);
      setSelectedDocId(null);
      reload();
    } catch (error) {
      console.error('Erreur demande suppression:', error);
    }
  };

  const openModifyModal = (docId: number) => {
    setSelectedDocId(docId);
    setShowModifyModal(true);
  };

  const openDeleteConfirm = (docId: number) => {
    setSelectedDocId(docId);
    setShowDeleteConfirm(true);
  };

  const handleDownload = async (docId: number, filename?: string) => {
    try {
      await apiService.downloadDocument(docId, filename);
    } catch (error) {
      console.error('Erreur téléchargement:', error);
      alert(`Erreur lors du téléchargement: ${error}`);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold text-slate-800">Gestion des documents</h2>
        <button 
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 transition-colors"
        >
          <Upload size={18} /> Importer un document
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
        {/* Barre de recherche */}
        <div className="flex gap-3 mb-4">
          <input
            type="text"
            placeholder="Rechercher un document..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-600"
          />
          <button className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 flex items-center gap-2 transition-colors">
            <Filter size={18} /> Filtres
          </button>
        </div>

        {/* Tableau */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                {['Titre', 'Type', 'Propriétaire', 'Date', 'Statut', 'Confidentialité', 'Actions'].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-sm font-semibold text-slate-700">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredDocuments.map((doc) => {
                const statusStyle = getStatusStyle(doc.status);
                return (
                  <tr key={doc.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 text-sm text-slate-700">{doc.title}</td>
                    <td className="px-4 py-3 text-sm text-slate-600">{doc.type}</td>
                    <td className="px-4 py-3 text-sm text-slate-600">{doc.client}</td>
                    <td className="px-4 py-3 text-sm text-slate-600">{doc.date}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${statusStyle.bg} ${statusStyle.text}`}>
                        {statusStyle.icon}
                        {getStatusLabel(doc.status)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getConfidentialityStyle(doc.confidentiality)}`}>
                        {doc.confidentiality}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button onClick={() => openDocument(doc)} className="p-1 hover:bg-primary-100 rounded transition-colors" title="Voir">
                          <Eye size={16} className="text-primary-700" />
                        </button>
                        <button onClick={() => handleDownload(doc.id, doc.fichier_nom)} className="p-1 hover:bg-secondary-100 rounded transition-colors" title="Télécharger">
                          <Download size={16} className="text-secondary-700" />
                        </button>
                        {canModifyOrDelete() && (
                          <>
                            <button 
                              onClick={() => openModifyModal(doc.id)} 
                              className="p-1 hover:bg-blue-100 rounded transition-colors" 
                              title="Demander modification"
                              disabled={doc.status.includes('en_attente')}
                            >
                              <Edit size={16} className="text-blue-600" />
                            </button>
                            <button 
                              onClick={() => openDeleteConfirm(doc.id)} 
                              className="p-1 hover:bg-red-100 rounded transition-colors" 
                              title="Demander suppression"
                              disabled={doc.status.includes('en_attente')}
                            >
                              <Trash2 size={16} className="text-red-600" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal ajout document */}
      {showAddModal && (
        <AddDocumentModal
          onClose={() => setShowAddModal(false)}
          onSuccess={async () => { await reload(); }}
        />
      )}

      {/* Modal demande modification */}
      {showModifyModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h3 className="text-xl font-bold text-slate-800 mb-4">Demander une modification</h3>
            <p className="text-slate-600 mb-4">Veuillez décrire les modifications souhaitées :</p>
            <textarea
              value={modifications}
              onChange={(e) => setModifications(e.target.value)}
              className="w-full p-3 border border-slate-300 rounded-lg mb-4 h-32 resize-none"
              placeholder="Décrivez les modifications..."
            />
            <div className="flex gap-4">
              <button
                onClick={() => setShowModifyModal(false)}
                className="flex-1 py-2 px-4 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50"
              >
                Annuler
              </button>
              <button
                onClick={handleRequestModify}
                className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Soumettre la demande
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation suppression */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h3 className="text-xl font-bold text-slate-800 mb-4">Confirmer la suppression</h3>
            <p className="text-slate-600 mb-4">
              Êtes-vous sûr de vouloir demander la suppression de ce document ? 
              Cette demande devra être validée selon le niveau de sensibilité du document.
            </p>
            <div className="flex gap-4">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 py-2 px-4 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50"
              >
                Annuler
              </button>
              <button
                onClick={handleRequestDelete}
                className="flex-1 py-2 px-4 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Confirmer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
