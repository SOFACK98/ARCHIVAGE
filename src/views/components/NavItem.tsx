// ============================================================
// VIEW/COMPONENT : NavItem
// ============================================================

import React, { type ReactNode } from 'react';
import type { Page } from '../../controllers/NavigationController';

interface Props {
  icon: ReactNode;
  text: string;
  page: Page;
  currentPage: Page;
  sidebarOpen: boolean;
  onNavigate: (page: Page) => void;
  badge?: number;
}

export const NavItem: React.FC<Props> = ({ icon, text, page, currentPage, sidebarOpen, onNavigate, badge }) => (
  <button
    onClick={() => onNavigate(page)}
    className={`w-full flex items-center gap-3 px-3 py-3 mb-2 rounded-lg transition-colors ${
      currentPage === page ? 'bg-emerald-700' : 'hover:bg-emerald-700'
    }`}
  >
    {icon}
    {sidebarOpen && (
      <div className="flex-1 flex items-center justify-between">
        <span>{text}</span>
        {badge !== undefined && badge > 0 && (
          <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
            {badge}
          </span>
        )}
      </div>
    )}
  </button>
);
