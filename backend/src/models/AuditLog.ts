// ============================================================
// MODEL : AuditLog
// Responsabilité : définir la structure des journaux d'audit
//                 et fournir les données de démonstration
// ============================================================

export type AuditAction = 'Upload' | 'Téléchargement' | 'Modification' | 'Suppression' | 'Connexion';

export interface AuditLog {
  id: number;
  user: string;
  action: AuditAction;
  document: string;
  time: string;
  date: string;
}

// Données de démonstration
export const MOCK_AUDIT_LOGS: AuditLog[] = [
  { id: 1, user: 'Marie Dupont',  action: 'Téléchargement', document: 'Contrat A-001',    time: '10:45', date: '2025-11-19' },
  { id: 2, user: 'Jean Mballa',   action: 'Upload',          document: 'Bilan Q3',         time: '09:30', date: '2025-11-19' },
  { id: 3, user: 'Sophie Nkomo',  action: 'Modification',    document: 'Rapport audit',    time: '08:15', date: '2025-11-19' },
  { id: 4, user: 'Marie Dupont',  action: 'Suppression',     document: 'Doc temporaire',   time: '16:20', date: '2025-11-18' },
];
