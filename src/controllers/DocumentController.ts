// ============================================================
// CONTROLLER : DocumentController
// Responsabilité : logique métier liée aux documents
//   - CRUD via API
//   - filtrage / tri
//   - sélection du document courant
// ============================================================

import { useState, useCallback, useEffect } from 'react';
import type { Document } from '../models/Document';
import { apiService } from '../services/ApiService';

export function useDocumentController() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const reload = useCallback(async () => {
    try {
      const data = await apiService.getDocuments();
      const mapped = data.map((d: any) => ({
        id: d.id,
        title: d.titre,
        type: d.type_nom || d.type || 'Non défini',
        client: d.uploaded_by_nom || 'N/A',
        date: new Date(d.created_at).toLocaleDateString('fr-FR'),
        confidentiality: d.confidentialite === 'critique' ? 'Critique' : d.confidentialite === 'eleve' ? 'Élevé' : 'Normal',
        status: d.statut || 'en_attente',
        fichier_nom: d.fichier_nom,
        fichier_path: d.fichier_path,
        fichier_type: d.fichier_type,
      }));
      setDocuments(mapped);
    } catch (error) {
      console.error('Erreur chargement documents:', error);
    }
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  /** Retourne les documents filtrés selon la requête de recherche */
  const filteredDocuments = documents.filter((doc) =>
    doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    doc.type.toLowerCase().includes(searchQuery.toLowerCase())  ||
    doc.client.toLowerCase().includes(searchQuery.toLowerCase())
  );

  /** Ouvre le modal de détails */
  const openDocument = useCallback((doc: Document) => {
    setSelectedDocument(doc);
  }, []);

  /** Ferme le modal */
  const closeDocument = useCallback(() => {
    setSelectedDocument(null);
  }, []);

  /** Supprime un document (simulation) */
  const deleteDocument = useCallback((id: number) => {
    setDocuments((prev) => prev.filter((d) => d.id !== id));
    setSelectedDocument(null);
  }, []);

  /** Ajoute un nouveau document (simulation) */
  const addDocument = useCallback((doc: Omit<Document, 'id'>) => {
    setDocuments((prev) => [
      { ...doc, id: Date.now() },
      ...prev,
    ]);
  }, []);

  return {
    documents,
    filteredDocuments,
    selectedDocument,
    searchQuery,
    setSearchQuery,
    openDocument,
    closeDocument,
    deleteDocument,
    addDocument,
    reload,
  };
}
