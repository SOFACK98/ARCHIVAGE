// ============================================================
// CONTROLLER : NavigationController
// Responsabilité : gestion de la navigation et de l'état UI global
//   - page courante
//   - état de la sidebar
// ============================================================

import { useState, useCallback } from 'react';

export type Page = 'dashboard' | 'home' | 'documents' | 'search' | 'users' | 'audit' | 'settings' | 'validation' | 'validated-documents' | 'rejected-documents' | 'dossiers';

export function useNavigationController(initialPage: Page = 'home') {
  const [currentPage,  setCurrentPage]  = useState<Page>(initialPage);
  const [sidebarOpen,  setSidebarOpen]  = useState(true);

  const navigate = useCallback((page: Page) => {
    setCurrentPage(page);
  }, []);

  const toggleSidebar = useCallback(() => {
    setSidebarOpen((prev) => !prev);
  }, []);

  return { currentPage, navigate, sidebarOpen, toggleSidebar };
}
