// ============================================================
// VIEW/COMPONENT : StatCard
// ============================================================

import React, { type ReactNode } from 'react';

type Color = 'blue' | 'green' | 'orange' | 'purple';

const COLOR_MAP: Record<Color, string> = {
  blue:   'bg-blue-100 text-blue-600',
  green:  'bg-green-100 text-green-600',
  orange: 'bg-orange-100 text-orange-600',
  purple: 'bg-purple-100 text-purple-600',
};

interface Props {
  title: string;
  value: number | string;
  icon: ReactNode;
  color: Color;
}

export const StatCard: React.FC<Props> = ({ title, value, icon, color }) => (
  <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
    <div className="flex items-center justify-between mb-2">
      <p className="text-slate-600 text-sm font-medium">{title}</p>
      <div className={`p-3 rounded-lg ${COLOR_MAP[color]}`}>{icon}</div>
    </div>
    <p className="text-3xl font-bold text-slate-800">{value}</p>
  </div>
);
