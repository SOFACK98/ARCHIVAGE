// ============================================================
// MODEL : Document
// Responsabilité : définir la structure des données document
//                 et fournir les données de démonstration
// ============================================================

export type ConfidentialityLevel = 'Normal' | 'Élevé' | 'Critique';
export type DocumentStatus = 'Validé' | 'En cours' | 'En attente';
export type DocumentType = 'Contrat' | 'Rapport' | 'Identité' | 'Audit' | 'Bilan' | 'Dossier client';

export interface Document {
  id: number;
  title: string;
  type: DocumentType | string;
  client: string;
  date: string;
  status: DocumentStatus;
  confidentiality: ConfidentialityLevel;
  fichier_nom?: string;
  fichier_path?: string;
  fichier_type?: string;
}

export interface SearchResult {
  id: number;
  title: string;
  type: string;
  relevance: number;
  date: string;
}

// Données de démonstration (seraient remplacées par des appels API)
export const MOCK_DOCUMENTS: Document[] = [
  {
    id: 1,
    title: 'Contrat Client A-2025-001',
    type: 'Contrat',
    client: 'Client A',
    date: '2025-11-19',
    status: 'Validé',
    confidentiality: 'Élevé',
  },
  {
    id: 2,
    title: 'Bilan financier Q3 2025',
    type: 'Rapport',
    client: 'Interne',
    date: '2025-11-18',
    status: 'En cours',
    confidentiality: 'Critique',
  },
  {
    id: 3,
    title: 'Pièce identité - Dupont',
    type: 'Identité',
    client: 'Client B',
    date: '2025-11-17',
    status: 'Validé',
    confidentiality: 'Critique',
  },
  {
    id: 4,
    title: 'Rapport audit interne',
    type: 'Audit',
    client: 'Interne',
    date: '2025-11-16',
    status: 'Validé',
    confidentiality: 'Élevé',
  },
];

export const MOCK_SEARCH_RESULTS: SearchResult[] = [
  { id: 1, title: 'Contrat prêt personnel 2025', type: 'Contrat', relevance: 95, date: '2025-11-15' },
  { id: 2, title: 'Dossier client - Nkomo Sophie', type: 'Dossier client', relevance: 87, date: '2025-11-10' },
  { id: 3, title: 'Rapport mensuel Novembre', type: 'Rapport', relevance: 78, date: '2025-11-01' },
];
