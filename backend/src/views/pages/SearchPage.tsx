// ============================================================
// VIEW/PAGE : SearchPage - Recherche rapide de documents
// ============================================================

import React, { useEffect, useState, useMemo } from 'react';
import { Search, FileText, FolderOpen, Building, Calendar, Shield, Clock, X } from 'lucide-react';
import { apiService } from '../../services/ApiService';
import { authService } from '../../services/AuthService';
import { DocumentPreview } from '../components/DocumentPreview';

interface SearchDocument {
  id: number;
  reference: string;
  titre: string;
  fichier_nom?: string;
  fichier_path?: string;
  fichier_type?: string;
  fichier_taille?: number;
  confidentialite: string;
  statut: string;
  created_at: string;
  validated_at?: string;
  updated_at?: string;
  date_document?: string;
  date_expiration?: string;
  description?: string;
  client_nom?: string;
  client_reference?: string;
  mots_cles?: string;
  version?: number;
  document_parent_id?: number;
  modification_request?: string;
  validation_level?: number;
  type_nom?: string;
  departement_nom?: string;
  agencia_id?: number;
  agencia_id?: number;
  agencia_nom?: string;
  uploaded_by_nom?: string;
  dossier_id?: number;
  dossier_nom?: string;
}

export const SearchPage: React.FC = () => {
  const currentUser = authService.getCurrentUser();
  const userRole = currentUser?.role_code || '';
  
  const [allDocuments, setAllDocuments] = useState<SearchDocument[]>([]);
  const [allDossiers, setAllDossiers] = useState<{id: number; nom: string}[]>([]);
  const [allAgences, setAllAgences] = useState<{id: number; nom: string}[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Filtres supplémentaires
  const [filterAgence, setFilterAgence] = useState<number | ''>('');
  const [filterStatut, setFilterStatut] = useState<string>('');
  const [filterConfidentialite, setFilterConfidentialite] = useState<string>('');
  const [filterDateFrom, setFilterDateFrom] = useState<string>('');
  const [filterDateTo, setFilterDateTo] = useState<string>('');
  
  // Prévisualisation
  const [previewDoc, setPreviewDoc] = useState<SearchDocument | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  
  useEffect(() => {
    loadData();
  }, []);
  
  const loadData = async () => {
    try {
      setLoading(true);
      const canSeeAll = userRole === 'ADMIN' || userRole === 'CHEF_DEPT' || userRole === 'CHEF_DEPARTEMENT';
      
      const [docsData, dossiersData, agencesData] = await Promise.all([
        apiService.getDocuments(),
        canSeeAll ? apiService.getDossiers() : Promise.resolve([]),
        canSeeAll ? apiService.getAgences() : Promise.resolve([])
      ]);
      
      setAllDocuments(docsData || []);
      setAllDossiers(dossiersData || []);
      setAllAgences(agencesData || []);
    } catch (err) {
      console.error('Erreur chargement:', err);
    } finally {
      setLoading(false);
    }
  };
  
// Filtrage client-side approfondi
  const filteredDocuments = useMemo(() => {
    let docs = allDocuments;
    
// Filtre par agence du propriétaire (uploader)
    if (filterAgence !== '') {
      docs = docs.filter(doc => doc.uploader_agence_id === filterAgence);
    }
    
    // Filtre par statut
    if (filterStatut !== '') {
      docs = docs.filter(doc => doc.statut === filterStatut);
    }
    
    // Filtre par confidentialité
    if (filterConfidentialite !== '') {
      docs = docs.filter(doc => doc.confidentialite === filterConfidentialite);
    }
    
    // Filtre par période de dépôt (date de création)
    if (filterDateFrom) {
      const fromDate = new Date(filterDateFrom);
      fromDate.setHours(0, 0, 0, 0);
      docs = docs.filter(doc => {
        if (!doc.created_at) return false;
        const docDate = new Date(doc.created_at);
        return docDate >= fromDate;
      });
    }
    
    if (filterDateTo) {
      const toDate = new Date(filterDateTo);
      toDate.setHours(23, 59, 59, 999);
      docs = docs.filter(doc => {
        if (!doc.created_at) return false;
        const docDate = new Date(doc.created_at);
        return docDate <= toDate;
      });
    }
    
    // Recherche textuelle
    if (!searchQuery.trim()) return docs;
    
    const query = searchQuery.toLowerCase().trim();
    return docs.filter(doc => {
      const searchText = [
        doc.reference,
        doc.titre,
        doc.description,
        doc.client_nom,
        doc.client_reference,
        doc.type_nom,
        doc.departement_nom,
        doc.agencia_nom,
        doc.uploaded_by_nom,
        doc.statut,
        doc.confidentialite,
        doc.dossier_nom,
        doc.fichier_nom,
        doc.version,
        doc.validation_level,
        doc.date_document,
        doc.date_expiration,
        doc.validated_at,
        doc.created_at,
        doc.updated_at,
        doc.modification_request
      ].map(v => v?.toString().toLowerCase() || '').join(' ');
      
      return searchText.includes(query);
    });
  }, [allDocuments, searchQuery, filterAgence, filterStatut, filterConfidentialite, filterDateFrom, filterDateTo]);
  
  const handleOpenPreview = (doc: SearchDocument, e: React.MouseEvent) => {
    e.stopPropagation();
    if (doc.fichier_path) {
      setPreviewDoc(doc);
      setShowPreview(true);
    }
  };
  
  const getStatutBadge = (s: string) => {
    const styles: Record<string, string> = {
      'valide': 'bg-emerald-100 text-emerald-700',
      'en_attente': 'bg-yellow-100 text-yellow-700',
      'en_attente_critique': 'bg-red-100 text-red-700',
      'rejete': 'bg-red-200 text-red-800',
      'modifie': 'bg-blue-100 text-blue-700',
      'modif_en_attente': 'bg-orange-100 text-orange-700',
      'supprime': 'bg-gray-200 text-gray-700',
      'approuve_partiel': 'bg-purple-100 text-purple-700',
    };
    const labels: Record<string, string> = {
      'valide': 'Validé',
      'en_attente': 'En attente',
      'en_attente_critique': 'En attente CRITIQUE',
      'rejete': 'Rejeté',
      'modifie': 'Modifié',
      'modif_en_attente': 'Modification',
      'supprime': 'Supprimé',
      'approuve_partiel': 'Partiel',
    };
    return (
      <span className={`px-2 py-0.5 rounded text-xs font-medium ${styles[s] || 'bg-gray-100 text-gray-700'}`}>
        {labels[s] || s}
      </span>
    );
  };
  
  const getConfBadge = (c: string) => {
    const styles: Record<string, string> = {
      'critique': 'bg-red-600 text-white',
      'eleve': 'bg-orange-500 text-white',
      'normal': 'bg-slate-200 text-slate-700',
    };
    return (
      <span className={`px-2 py-0.5 rounded text-xs font-medium ${styles[c] || 'bg-gray-200 text-gray-700'}`}>
        {c || 'normal'}
      </span>
    );
  };
  
  const formatDate = (d: string) => {
    if (!d) return '-';
    return new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-xl p-6 text-white">
        <h2 className="text-2xl font-bold">Recherche Documents</h2>
        <p className="text-blue-100 text-sm">Recherchez dans tous les champs</p>
      </div>

      {/* Zone de recherche */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={22} />
          <input
            type="text"
            placeholder="Rechercher par référence, titre, description, client, type, département, agence, dossier, état..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-10 py-3 text-lg border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X size={20} />
            </button>
          )}
        </div>
        <div className="flex items-center justify-between mt-3 text-sm text-slate-500">
          <span>{filteredDocuments.length} document(s) trouvé(s)</span>
          {searchQuery && (
            <span className="text-blue-600">Filtre: "{searchQuery}"</span>
          )}
        </div>
      </div>

      {/* Filtres avancés */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
        <div className="flex flex-wrap items-center gap-4">
          {/* Filtre Agence */}
          <div className="flex items-center gap-2">
            <Building className="text-slate-400" size={18} />
            <select
              value={filterAgence}
              onChange={(e) => setFilterAgence(e.target.value ? Number(e.target.value) : '')}
              className="px-3 py-1.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Toutes les agences</option>
              {allAgences.map(a => (
                <option key={a.id} value={a.id}>{a.nom}</option>
              ))}
            </select>
          </div>

          {/* Filtre Statut */}
          <div className="flex items-center gap-2">
            <Clock className="text-slate-400" size={18} />
            <select
              value={filterStatut}
              onChange={(e) => setFilterStatut(e.target.value)}
              className="px-3 py-1.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Tous les statuts</option>
              <option value="en_attente">En attente</option>
              <option value="en_attente_critique">En attente critique</option>
              <option value="valide">Validé</option>
              <option value="rejete">Rejeté</option>
              <option value="modifie">Modifié</option>
              <option value="modif_en_attente">Modification en attente</option>
              <option value="supprime">Supprimé</option>
              <option value="approuve_partiel">Approuvé partiellement</option>
            </select>
          </div>

          {/* Filtre Confidentialité */}
          <div className="flex items-center gap-2">
            <Shield className="text-slate-400" size={18} />
            <select
              value={filterConfidentialite}
              onChange={(e) => setFilterConfidentialite(e.target.value)}
              className="px-3 py-1.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Toutes confidentialités</option>
              <option value="normal">Normal</option>
              <option value="eleve">Élevé</option>
              <option value="critique">Critique</option>
            </select>
          </div>

          {/* Filtre Période - Du */}
          <div className="flex items-center gap-2">
            <Calendar className="text-slate-400" size={18} />
            <input
              type="date"
              value={filterDateFrom}
              onChange={(e) => setFilterDateFrom(e.target.value)}
              className="px-3 py-1.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Du"
            />
          </div>

          {/* Filtre Période - Au */}
          <div className="flex items-center gap-2">
            <span className="text-slate-400 text-sm">à</span>
            <input
              type="date"
              value={filterDateTo}
              onChange={(e) => setFilterDateTo(e.target.value)}
              className="px-3 py-1.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Au"
            />
          </div>

          {/* Reset filtres */}
          {(filterAgence !== '' || filterStatut !== '' || filterConfidentialite !== '' || filterDateFrom || filterDateTo) && (
            <button
              onClick={() => {
                setFilterAgence('');
                setFilterStatut('');
                setFilterConfidentialite('');
                setFilterDateFrom('');
                setFilterDateTo('');
              }}
              className="ml-auto text-sm text-red-600 hover:text-red-700 flex items-center gap-1"
            >
              <X size={16} /> Réinitialiser
            </button>
          )}
        </div>
      </div>

      {/* Documents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredDocuments.slice(0, 100).map((doc) => (
          <div
            key={doc.id}
            className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 hover:shadow-md transition-shadow cursor-pointer"
            onClick={(e) => handleOpenPreview(doc, e)}
          >
            <div className="flex items-start gap-3">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                doc.confidentialite === 'critique' ? 'bg-red-100' : 
                doc.confidentialite === 'eleve' ? 'bg-orange-100' : 'bg-blue-100'
              }`}>
                <FileText className={`${
                  doc.confidentialite === 'critique' ? 'text-red-600' : 
                  doc.confidentialite === 'eleve' ? 'text-orange-600' : 'text-blue-600'
                }`} size={20} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-slate-800 text-sm truncate">{doc.titre}</p>
                <p className="text-xs text-slate-500 font-mono">{doc.reference}</p>
              </div>
            </div>
            
            <div className="mt-3 space-y-1 text-xs text-slate-600">
              {doc.type_nom && <p><span className="text-slate-400">Type:</span> {doc.type_nom}</p>}
              {doc.agencia_nom && <p><span className="text-slate-400">Agence:</span> {doc.agencia_nom}</p>}
              {doc.departement_nom && <p><span className="text-slate-400">Dépt:</span> {doc.departement_nom}</p>}
              {doc.client_nom && <p><span className="text-slate-400">Client:</span> {doc.client_nom}</p>}
              {doc.client_reference && <p><span className="text-slate-400">Ref. Client:</span> {doc.client_reference}</p>}
              {doc.dossier_nom && <p><span className="text-blue-600">📁 Dossier:</span> {doc.dossier_nom}</p>}
              {doc.mots_cles && <p><span className="text-slate-400">Mots-clés:</span> {doc.mots_cles}</p>}
              {doc.version && <p><span className="text-slate-400">Version:</span> {doc.version}</p>}
            </div>
            
            <div className="flex items-center gap-2 mt-3 pt-3 border-t border-slate-100">
              {getStatutBadge(doc.statut)}
              {getConfBadge(doc.confidentialite)}
            </div>
            
            <div className="mt-2 flex items-center justify-between text-xs text-slate-400">
              <span>{formatDate(doc.created_at)}</span>
              {doc.uploaded_by_nom && <span>{doc.uploaded_by_nom}</span>}
            </div>
          </div>
        ))}
      </div>
      
      {filteredDocuments.length === 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center">
          <FileText className="mx-auto text-slate-300 mb-4" size={48} />
          <p className="text-slate-500 font-medium">Aucun document trouvé</p>
          <p className="text-sm text-slate-400 mt-1">Essayez avec d'autres mots-clés</p>
        </div>
      )}
      
      {filteredDocuments.length > 100 && (
        <div className="text-center text-slate-500">
          Affichage des 100 premiers documents sur {filteredDocuments.length}
        </div>
      )}
      
      {/* Modal aperçu */}
      {showPreview && previewDoc && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl overflow-hidden relative" style={{ width: '210mm', height: '297mm', maxWidth: '90vw', maxHeight: '90vh' }}>
            <button
              onClick={() => setShowPreview(false)}
              className="absolute top-3 right-3 z-10 px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Fermer
            </button>
            <div className="h-full overflow-auto p-4" style={{ width: '100%', height: '100%' }}>
              <h3 className="text-xl font-bold text-slate-800 mb-4">Aperçu - {previewDoc.titre}</h3>
              <div className="h-[calc(100vh-160px)]">
                <DocumentPreview
                  src={previewDoc.fichier_path}
                  type={previewDoc.fichier_type || ''}
                  name={previewDoc.fichier_nom || previewDoc.titre}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};