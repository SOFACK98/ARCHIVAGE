// ============================================================
// VIEW/COMPONENT : DocumentRow
// ============================================================

import React from 'react';
import { FileText, Lock, ChevronRight } from 'lucide-react';
import type { Document, ConfidentialityLevel } from '../../models/Document';

interface Props {
  doc: Document;
  onSelect: (doc: Document) => void;
}

const getConfidentialityStyle = (level: ConfidentialityLevel): string => {
  const styles: Record<ConfidentialityLevel, string> = {
    'Critique': 'bg-red-100 text-red-700',
    'Élevé': 'bg-orange-100 text-orange-700',
    'Normal': 'bg-blue-100 text-blue-700'
  };
  return styles[level];
};

export const DocumentRow: React.FC<Props> = ({ doc, onSelect }) => (
  <div
    className="flex items-center justify-between p-4 border border-slate-200 rounded-lg hover:bg-slate-50 cursor-pointer transition-colors"
    onClick={() => onSelect(doc)}
  >
    <div className="flex items-center gap-4">
      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
        <FileText className="text-blue-600" size={24} />
      </div>
      <div>
        <p className="font-medium text-slate-800">{doc.title}</p>
        <p className="text-sm text-slate-500">
          {doc.type} • {doc.client} • {doc.date}
        </p>
      </div>
    </div>

    <div className="flex items-center gap-3">
      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getConfidentialityStyle(doc.confidentiality)}`}>
        <Lock size={12} className="inline mr-1" />
        {doc.confidentiality}
      </span>
      <ChevronRight className="text-slate-400" size={20} />
    </div>
  </div>
);
