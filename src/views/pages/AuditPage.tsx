// ============================================================
// VIEW/PAGE : AuditPage
// ============================================================

import React from 'react';
import { Download } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import type { AuditAction } from '../../models/AuditLog';

const ACTION_COLORS: Record<AuditAction, string> = {
  Upload:           'bg-green-100 text-green-700',
  Suppression:      'bg-red-100 text-red-700',
  Téléchargement:   'bg-blue-100 text-blue-700',
  Modification:     'bg-purple-100 text-purple-700',
  Connexion:        'bg-orange-100 text-orange-700',
};

export const AuditPage: React.FC = () => {
  const { audit } = useApp();
  const { filteredLogs, filterAction, setFilterAction, filterDate, setFilterDate, exportLogs } = audit;

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-slate-800">Audit & Logs de sécurité</h2>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
        {/* Filtres */}
        <div className="flex gap-3 mb-4">
          <input
            type="date"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
            className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <select
            value={filterAction}
            onChange={(e) => setFilterAction(e.target.value as AuditAction | 'Toutes')}
            className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="Toutes">Toutes les actions</option>
            <option value="Upload">Upload</option>
            <option value="Téléchargement">Téléchargement</option>
            <option value="Modification">Modification</option>
            <option value="Suppression">Suppression</option>
            <option value="Connexion">Connexion</option>
          </select>
          <button
            onClick={exportLogs}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 transition-colors"
          >
            <Download size={18} /> Exporter les logs
          </button>
        </div>

        {/* Tableau */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                {['Date & Heure', 'Utilisateur', 'Action', 'Document', 'Détails'].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-sm font-semibold text-slate-700">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredLogs.map((log) => (
                <tr key={log.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3 text-sm text-slate-700">{log.date} {log.time}</td>
                  <td className="px-4 py-3 text-sm text-slate-700">{log.user}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${ACTION_COLORS[log.action]}`}>
                      {log.action}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-700">{log.document}</td>
                  <td className="px-4 py-3">
                    <button className="text-blue-600 hover:underline text-sm">Voir détails</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
