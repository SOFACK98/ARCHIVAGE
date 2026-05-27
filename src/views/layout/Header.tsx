// ============================================================
// VIEW/LAYOUT : Header
// ============================================================

import React from 'react';
import { useApp } from '../../context/AppContext';

export const Header: React.FC = () => {
  const { currentUser } = useApp();

  return (
    <header className="bg-white border-b border-slate-200 px-8 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Système d'Archivage Électronique</h1>
          <p className="text-sm text-slate-600">United Credit - Gestion sécurisée des documents</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-sm font-medium text-slate-800">{currentUser.name}</p>
            <p className="text-xs text-green-600 flex items-center gap-1">
              <span className="w-2 h-2 bg-green-600 rounded-full"></span>
              {currentUser.status || 'Connecté'}
            </p>
          </div>
          <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-medium">
            {currentUser.initials}
          </div>
        </div>
      </div>
    </header>
  );
};
