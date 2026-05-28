// ============================================================
// VIEW/LAYOUT : Sidebar
// ============================================================

import React, { useState, useEffect } from 'react';
import { Home, FileText, Search, Users, Shield, Settings, LogOut, Menu, X, CheckCircle, ChevronDown, FolderOpen } from 'lucide-react';
import { NavItem } from '../components/NavItem';
import { useApp } from '../../context/AppContext';
import { authService } from '../../services/AuthService';
import { apiService } from '../../services/ApiService';

export const Sidebar: React.FC = () => {
  const { navigation, currentUser } = useApp();
  const { currentPage, navigate, sidebarOpen, toggleSidebar } = navigation;
  const [userRole, setUserRole] = useState<{ role_id: number; role_code: string } | null>(null);
  const [pendingCount, setPendingCount] = useState(0);
  const userStr = localStorage.getItem('user');
  const storedUser = userStr ? JSON.parse(userStr) : null;
  const role_code = storedUser?.role_code || storedUser?.role || '';
  const isAdmin = role_code === 'ADMIN';
  const canValidate = () => role_code !== 'AGENT' && role_code !== '';

  // Récupérer le rôle de l'utilisateur depuis la base de données
  useEffect(() => {
    const fetchUserRole = async () => {
      const role = await authService.getUserRoleFromDB();
      console.log('User role from DB:', role);
      if (role) {
        setUserRole(role);
      }
    };
    fetchUserRole();
  }, []);

  // Charger le nombre de documents en attente
  useEffect(() => {
    const fetchPendingCount = async () => {
      if (canValidate()) {
        try {
          const docs = await apiService.getPendingValidation();
          setPendingCount(Array.isArray(docs) ? docs.length : 0);
        } catch (error) {
          console.error('Erreur chargement pending:', error);
          setPendingCount(0);
        }
      } else {
        setPendingCount(0);
      }
    };
    fetchPendingCount();
    const interval = setInterval(fetchPendingCount, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleValidationClick = () => {
    navigate('validation');
  };

  const getNavItems = () => {
    const items = [];
    
    // Tableau de bord pour tous
    items.push({ icon: <Home size={20} />, text: 'Tableau de bord', page: 'home' as const });
    
    // Documents et Recherche pour tous
    items.push({ icon: <FileText size={20} />, text: 'Documents', page: 'documents' as const });
    items.push({ icon: <FolderOpen size={20} />, text: 'Dossiers', page: 'dossiers' as const });
    items.push({ icon: <Search size={20} />, text: 'Recherche', page: 'search' as const });
    
    // Admin uniquement (role ADMIN)
    if (isAdmin) {
      items.push({ icon: <Users size={20} />, text: 'Utilisateurs', page: 'users' as const });
      items.push({ icon: <Shield size={20} />, text: 'Audit & Logs', page: 'audit' as const });
      items.push({ icon: <Settings size={20} />, text: 'Paramètres', page: 'settings' as const });
    }
    
    return items;
  };
  
  const navItems = getNavItems();

  return (
    <div className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-emerald-800 text-white transition-all duration-300 flex flex-col`}>
      {/* Logo */}
      <div className="p-4 flex items-center justify-between border-b border-emerald-700">
        {sidebarOpen ? (
          <div className="flex items-center gap-3">
            <img src="/src/assets/logo_united-removebg.png" alt="Logo" className="h-10 w-10 object-contain" />
            <h1 className="text-xl font-bold">United Credit</h1>
          </div>
        ) : (
          <img src="/src/assets/logo_united-removebg.png" alt="Logo" className="h-8 w-8 object-contain mx-auto" />
        )}
        <button onClick={toggleSidebar} className="p-2 hover:bg-emerald-700 rounded transition-colors">
          {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 overflow-y-auto">
        {navItems.map((item) => (
          <NavItem
            key={item.page}
            icon={item.icon}
            text={item.text}
            page={item.page}
            currentPage={currentPage}
            sidebarOpen={sidebarOpen}
            onNavigate={navigate}
          />
        ))}

        {canValidate() && (
          <button
            onClick={handleValidationClick}
            className={`w-full flex items-center gap-3 px-3 py-3 mb-2 rounded-lg transition-colors ${
              currentPage === 'validation' ? 'bg-emerald-700' : 'hover:bg-emerald-700'
            }`}
          >
            <CheckCircle size={20} />
            {sidebarOpen && (
              <div className="flex-1 flex items-center justify-between">
                <span>Validation</span>
                {pendingCount > 0 && (
                  <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                    {pendingCount}
                  </span>
                )}
              </div>
            )}
          </button>
        )}
      </nav>

      {/* Profil utilisateur */}
      <div className="p-4 border-t border-emerald-700">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center shrink-0">
            {currentUser.initials}
          </div>
          {sidebarOpen && (
            <div className="flex-1 overflow-hidden">
              <p className="font-medium text-sm truncate">{currentUser.name}</p>
              <p className="text-xs text-slate-400">{currentUser.role}</p>              {currentUser.role_code !== 'CHEF_AGENCE' && currentUser.departement && (
                <p className="text-xs text-slate-400">Département : {currentUser.departement}</p>
              )}            </div>
          )}
        </div>
        {sidebarOpen && (
          <button 
            onClick={() => {
              localStorage.removeItem('isAuthenticated');
              localStorage.removeItem('auth_token');
              localStorage.removeItem('user');
              window.location.reload();
            }}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-emerald-700 rounded transition-colors"
          >
            <LogOut size={16} /> Déconnexion
          </button>
        )}
      </div>
    </div>
  );
};
