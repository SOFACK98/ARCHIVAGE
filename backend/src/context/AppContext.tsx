// ============================================================
// CONTEXT : AppContext
// Responsabilité : centraliser tous les controllers et les
//                 exposer aux vues via React Context.
//                 C'est le "pont" MVC en React.
// ============================================================

import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { useNavigationController } from '../controllers/NavigationController';
import { useDocumentController }   from '../controllers/DocumentController';
import { useUserController }       from '../controllers/UserController';
import { useAuditController }      from '../controllers/AuditController';
import { useSearchController }     from '../controllers/SearchController';
import { MOCK_STATS, MOCK_ALERTS } from '../models/Stats';
import { apiService } from '../services/ApiService';
import type { DashboardStats } from '../models/Stats';

// --- Types du contexte ---
type AppContextType = {
  // Navigation
  navigation:  ReturnType<typeof useNavigationController>;
  // Données & logique métier
  documents:   ReturnType<typeof useDocumentController>;
  users:       ReturnType<typeof useUserController>;
  audit:       ReturnType<typeof useAuditController>;
  search:      ReturnType<typeof useSearchController>;
  // Données statiques (stats + utilisateur courant)
  stats:       DashboardStats;
  alerts:      typeof MOCK_ALERTS;
  currentUser: any;
  // Fonctions utilitaires
  reloadStats: () => Promise<void>;
};

const AppContext = createContext<AppContextType | null>(null);

// --- Provider ---
export function AppProvider({ children }: { children: ReactNode }) {
  const navigation = useNavigationController();
  const documents  = useDocumentController();
  const users      = useUserController();
  const audit      = useAuditController();
  const search     = useSearchController();
  
  const [stats, setStats] = useState<DashboardStats>(MOCK_STATS);
  const [currentUser, setCurrentUser] = useState<any>({
    name: 'Chargement...',
    initials: '...',
    role: 'Agent'
  });

  // Fonction pour recharger les stats
  const reloadStats = async () => {
    try {
      const data = await apiService.getStats();
      setStats({
        totalDocuments: data.totalDocuments || 0,
        todayUploads: data.todayUploads || 0,
        pendingApprovals: data.pendingApprovals || 0,
        activeUsers: data.activeUsers || 0
      });
    } catch (error) {
      console.error('Erreur rechargement stats:', error);
    }
  };

  // Charger les stats réelles depuis l'API
  useEffect(() => {
    reloadStats();
    
    // Polling automatique toutes les 30 secondes pour garder les stats à jour
    const interval = setInterval(() => {
      reloadStats();
    }, 30000);
    
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const user = JSON.parse(userStr);
      setCurrentUser({
        id: user.id,
        name: `${user.prenom} ${user.nom}`,
        initials: `${user.prenom?.[0] || ''}${user.nom?.[0] || ''}`,
        role: user.role || 'Agent',
        role_code: user.role_code,
        agence_id: user.agence_id,
        agence_nom: user.agence_nom,
        departement_id: user.departement_id,
        departement: user.departement_nom || '',
        status: 'Connecté'
      });
    }
  }, []);

  const value: AppContextType = {
    navigation,
    documents,
    users,
    audit,
    search,
    stats,
    alerts:      MOCK_ALERTS,
    currentUser,
    reloadStats,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

// --- Hook personnalisé ---
export function useApp(): AppContextType {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp doit être utilisé à l\'intérieur de <AppProvider>');
  return ctx;
}
