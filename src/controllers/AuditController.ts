// ============================================================
// CONTROLLER : AuditController
// Responsabilité : logique métier liée aux journaux d'audit
//   - filtrage par action / date
//   - export simulé
// ============================================================

import { useState, useCallback } from 'react';
import type { AuditLog, AuditAction } from '../models/AuditLog';
import { MOCK_AUDIT_LOGS } from '../models/AuditLog';

export function useAuditController() {
  const [logs]           = useState<AuditLog[]>(MOCK_AUDIT_LOGS);
  const [filterAction, setFilterAction] = useState<AuditAction | 'Toutes'>('Toutes');
  const [filterDate,   setFilterDate]   = useState('');

  /** Retourne les logs filtrés */
  const filteredLogs = logs.filter((log) => {
    const actionMatch = filterAction === 'Toutes' || log.action === filterAction;
    const dateMatch   = !filterDate || log.date === filterDate;
    return actionMatch && dateMatch;
  });

  /** Export CSV simulé */
  const exportLogs = useCallback(() => {
    const header = 'Date,Heure,Utilisateur,Action,Document\n';
    const rows   = filteredLogs
      .map((l) => `${l.date},${l.time},${l.user},${l.action},${l.document}`)
      .join('\n');
    const blob = new Blob([header + rows], { type: 'text/csv' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = 'audit_logs.csv';
    a.click();
    URL.revokeObjectURL(url);
  }, [filteredLogs]);

  return { logs, filteredLogs, filterAction, setFilterAction, filterDate, setFilterDate, exportLogs };
}
