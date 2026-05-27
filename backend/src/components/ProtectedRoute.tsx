import React from 'react';
import { authService } from '../services/AuthService';

interface Props {
  children: React.ReactNode;
  requireAdmin?: boolean;
  requireValidation?: boolean;
  requireRole?: string;
  fallback?: React.ReactNode;
}

export const ProtectedRoute: React.FC<Props> = ({ children, requireAdmin, requireValidation, requireRole, fallback }) => {
  const user = authService.getCurrentUser();

  if (!user) {
    return fallback || (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Accès refusé</h2>
          <p className="text-slate-600">Vous devez être connecté pour accéder à cette page.</p>
        </div>
      </div>
    );
  }

  if (requireAdmin && !authService.isAdmin()) {
    return fallback || (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Accès refusé</h2>
          <p className="text-slate-600">Cette page est réservée aux administrateurs.</p>
        </div>
      </div>
    );
  }

  if (requireValidation && user.role_code === 'AGENT') {
    return fallback || (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Accès refusé</h2>
          <p className="text-slate-600">Vous n'avez pas les permissions nécessaires pour accéder à cette page.</p>
        </div>
      </div>
    );
  }

  if (requireRole && user.role_code !== requireRole) {
    return fallback || (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Accès refusé</h2>
          <p className="text-slate-600">Vous n'avez pas les permissions nécessaires.</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
