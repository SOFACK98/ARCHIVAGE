// ============================================================
// MODEL : Stats
// Responsabilité : définir et fournir les statistiques du tableau de bord
// ============================================================

export interface DashboardStats {
  totalDocuments: number;
  todayUploads: number;
  pendingApprovals: number;
  activeUsers: number;
}

export interface SecurityAlert {
  id: number;
  type: 'warning' | 'info' | 'success';
  message: string;
}

export const MOCK_STATS: DashboardStats = {
  totalDocuments: 1247,
  todayUploads: 23,
  pendingApprovals: 5,
  activeUsers: 48,
};

export const MOCK_ALERTS: SecurityAlert[] = [
  { id: 1, type: 'warning', message: '3 tentatives de connexion échouées détectées' },
  { id: 2, type: 'info',    message: 'Sauvegarde automatique effectuée avec succès'  },
  { id: 3, type: 'success', message: 'Tous les systèmes opérationnels'               },
];
