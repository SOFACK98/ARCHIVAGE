// ============================================================
// VIEW/COMPONENT : Alert
// ============================================================

import React from 'react';
import { AlertCircle, CheckCircle } from 'lucide-react';

type AlertType = 'warning' | 'info' | 'success';

const STYLES: Record<AlertType, { bg: string; border: string; text: string; icon: React.ReactNode }> = {
  warning: { bg: 'bg-orange-50', border: 'border-orange-200', text: 'text-orange-700', icon: <AlertCircle size={16} /> },
  info:    { bg: 'bg-blue-50',   border: 'border-blue-200',   text: 'text-blue-700',   icon: <AlertCircle size={16} /> },
  success: { bg: 'bg-green-50',  border: 'border-green-200',  text: 'text-green-700',  icon: <CheckCircle size={16} /> },
};

interface Props {
  type: AlertType;
  message: string;
}

export const Alert: React.FC<Props> = ({ type, message }) => {
  const s = STYLES[type];
  return (
    <div className={`flex items-center gap-3 p-3 rounded-lg border ${s.bg} ${s.border}`}>
      <div className={s.text}>{s.icon}</div>
      <p className={`text-sm ${s.text}`}>{message}</p>
    </div>
  );
};
