// ============================================================
// VIEW/COMPONENT : DocumentModal
// ============================================================

import React from 'react';
import { X, FileText, Download, Edit, Trash2 } from 'lucide-react';
import type { Document, ConfidentialityLevel } from '../../models/Document';

interface Props {
  doc: Document;
  onClose: () => void;
  onDelete: (id: number) => void;
}

const getConfidentialityStyle = (level: ConfidentialityLevel): string => {
  const styles: Record<ConfidentialityLevel, string> = {
    'Critique': 'bg-red-100 text-red-700',
    'Élevé': 'bg-orange-100 text-orange-700',
    'Normal': 'bg-blue-100 text-blue-700'
  };
  return styles[level];
};

export const DocumentModal: React.FC<Props> = ({ doc, onClose, onDelete }) => (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={onClose}>
    <div className="bg-white rounded-xl shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>

      {/* En-tête */}
      <div className="p-6 border-b border-slate-200 flex items-center justify-between">
        <h3 className="text-2xl font-bold text-slate-800">Détails du document</h3>
        <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
          <X size={20} />
        </button>
      </div>

      {/* Corps */}
      <div className="p-6 space-y-6">
        <div className="grid grid-cols-2 gap-4">
          {[
            ['Titre', doc.title],
            ['Type', doc.type],
            ['Client', doc.client],
            ['Date', doc.date],
          ].map(([label, val]) => (
            <div key={label}>
              <p className="text-sm font-medium text-slate-600 mb-1">{label}</p>
              <p className="text-slate-800">{val}</p>
            </div>
          ))}
          <div>
            <p className="text-sm font-medium text-slate-600 mb-1">Statut</p>
            <span className="inline-block px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">
              {doc.status}
            </span>
          </div>
          <div>
            <p className="text-sm font-medium text-slate-600 mb-1">Confidentialité</p>
            <span className={`inline-block px-3 py-1 rounded-full text-sm ${getConfidentialityStyle(doc.confidentiality)}`}>
              {doc.confidentiality}
            </span>
          </div>
        </div>

        {/* Aperçu */}
        <div className="border-t border-slate-200 pt-6">
          <p className="text-sm font-medium text-slate-600 mb-3">Aperçu du document</p>
          <div className="bg-slate-100 h-64 rounded-lg flex items-center justify-center">
            <FileText size={48} className="text-slate-400" />
          </div>
        </div>

        {/* Historique */}
        <div className="border-t border-slate-200 pt-6">
          <p className="text-sm font-medium text-slate-600 mb-3">Historique des versions</p>
          <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
            <div>
              <p className="text-sm font-medium text-slate-800">Version 1.2</p>
              <p className="text-xs text-slate-500">Modifié par Marie Dupont • {doc.date}</p>
            </div>
            <button className="text-blue-600 hover:underline text-sm">Restaurer</button>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-4">
          <button className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2 transition-colors">
            <Download size={18} /> Télécharger
          </button>
          <button className="flex-1 px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 flex items-center justify-center gap-2 transition-colors">
            <Edit size={18} /> Modifier
          </button>
          <button
            onClick={() => onDelete(doc.id)}
            className="px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 flex items-center justify-center gap-2 transition-colors"
          >
            <Trash2 size={18} /> Supprimer
          </button>
        </div>
      </div>
    </div>
  </div>
);
