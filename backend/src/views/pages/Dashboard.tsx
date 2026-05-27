// ============================================================
// VIEW/PAGE : Dashboard (Tableau de bord)
// ============================================================

import React, { useEffect, useState } from 'react';
import { FileText, Upload, Clock, Users, Bell, TrendingUp, AlertTriangle, Award, Search, ArrowRight } from 'lucide-react';
import { StatCard } from '../components/StatCard';
import { DocumentRow } from '../components/DocumentRow';
import { Alert } from '../components/Alert';
import { useApp } from '../../context/AppContext';
import { apiService } from '../../services/ApiService';
import { authService } from '../../services/AuthService';

export const Dashboard: React.FC = () => {
  const { stats, documents, navigation, currentUser } = useApp();
  const { openDocument, documents: docList, reload } = documents;
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [alerts, setAlerts] = useState<any[]>([]);
  const user = authService.getCurrentUser();

  useEffect(() => {
    apiService.getAuditLogs().then(logs => {
      setRecentActivity(logs.slice(0, 5));
    }).catch(console.error);

    const newAlerts = [];
    if (stats.pendingApprovals > 0) {
      newAlerts.push({
        id: 1,
        type: 'warning',
        message: `${stats.pendingApprovals} document(s) en attente de validation`
      });
    }
    if (stats.todayUploads > 10) {
      newAlerts.push({
        id: 2,
        type: 'success',
        message: `${stats.todayUploads} documents uploadés aujourd'hui`
      });
    }
    newAlerts.push({
      id: 3,
      type: 'info',
      message: 'Tous les systèmes opérationnels'
    });
    setAlerts(newAlerts);
  }, [stats]);

  return (
    <div className="space-y-6">
      {/* Hero Section - Message de bienvenue */}
      <div className="relative bg-gradient-to-br from-emerald-600 via-emerald-700 to-emerald-800 rounded-2xl p-8 text-white overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-emerald-900/30 rounded-full blur-2xl"></div>
        
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
              <Award size={32} className="text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Bienvenue, {user?.nom || currentUser.name?.split(' ')[0] || 'Utilisateur'}</h1>
              <p className="text-emerald-100">
                {user?.role || currentUser.role}
                {!(user?.role_code === 'CHEF_AGENCE' || currentUser.role_code === 'CHEF_AGENCE') &&
                  (user?.departement_nom || currentUser.departement) ?
                  ` • ${user?.departement_nom || currentUser.departement}` : ''}
                • {user?.agence_nom || currentUser.agence_nom || 'United Credit'}
              </p>
            </div>
          </div>
          <p className="text-emerald-50 text-lg mt-4 max-w-2xl">
            Gérez vos documents en toute sécurité avec notre système d'archivage électronique professionnel
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total documents" value={stats.totalDocuments} icon={<FileText />} color="blue" />
        <StatCard title="Uploads aujourd'hui" value={stats.todayUploads} icon={<Upload />} color="green" />
        <StatCard title="En attente" value={stats.pendingApprovals} icon={<Clock />} color="orange" />
        <StatCard title="Utilisateurs actifs" value={stats.activeUsers} icon={<Users />} color="purple" />
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl p-6 border border-slate-200">
        <h2 className="text-xl font-bold text-slate-800 mb-4">Actions rapides</h2>
        <div className="grid grid-cols-3 gap-4">
          <button
            onClick={() => navigation.navigate('documents')}
            className="p-6 bg-emerald-50 hover:bg-emerald-100 border-2 border-emerald-200 rounded-xl transition-all hover:scale-105 hover:shadow-md group"
          >
            <div className="w-14 h-14 bg-emerald-600 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <Upload size={24} className="text-white" />
            </div>
            <p className="font-semibold text-emerald-900">Importer document</p>
          </button>
          
          <button
            onClick={() => navigation.navigate('search')}
            className="p-6 bg-blue-50 hover:bg-blue-100 border-2 border-blue-200 rounded-xl transition-all hover:scale-105 hover:shadow-md group"
          >
            <div className="w-14 h-14 bg-blue-600 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <Search size={24} className="text-white" />
            </div>
            <p className="font-semibold text-blue-900">Rechercher</p>
          </button>
          
          <button
            onClick={() => navigation.navigate('documents')}
            className="p-6 bg-purple-50 hover:bg-purple-100 border-2 border-purple-200 rounded-xl transition-all hover:scale-105 hover:shadow-md group"
          >
            <div className="w-14 h-14 bg-purple-600 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <FileText size={24} className="text-white" />
            </div>
            <p className="font-semibold text-purple-900">Mes documents</p>
          </button>
        </div>
      </div>

      {/* Documents récents */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <FileText className="text-primary-700" size={20} />
            <h3 className="text-lg font-semibold text-slate-800">Documents récents</h3>
          </div>
          <button 
            onClick={() => navigation.navigate('documents')}
            className="text-primary-700 hover:underline text-sm font-medium flex items-center gap-1"
          >
            Voir tout <ArrowRight size={16} />
          </button>
        </div>
        <div className="space-y-3">
          {docList.slice(0, 5).map((doc) => (
            <DocumentRow key={doc.id} doc={doc} onSelect={openDocument} />
          ))}
          {docList.length === 0 && (
            <p className="text-center text-slate-500 py-8">Aucun document disponible</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Activité récente */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="text-primary-700" size={20} />
            <h3 className="text-lg font-semibold text-slate-800">Activité récente</h3>
          </div>
          <div className="space-y-3">
            {recentActivity.map((log) => (
              <div key={log.id} className="flex items-center gap-3 text-sm p-3 hover:bg-slate-50 rounded-lg transition-colors">
                <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center shrink-0">
                  <Clock size={16} className="text-primary-700" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-slate-700 font-medium truncate">
                    {log.utilisateur_nom || 'Utilisateur'} — {log.action}
                  </p>
                  <p className="text-slate-500 text-xs">
                    {log.module} • {new Date(log.created_at).toLocaleString('fr-FR')}
                  </p>
                </div>
              </div>
            ))}
            {recentActivity.length === 0 && (
              <p className="text-center text-slate-500 py-8">Aucune activité récente</p>
            )}
          </div>
        </div>

        {/* Alertes & Notifications */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="text-primary-700" size={20} />
            <h3 className="text-lg font-semibold text-slate-800">Alertes & Notifications</h3>
          </div>
          <div className="space-y-3">
            {alerts.map((a) => (
              <Alert key={a.id} type={a.type} message={a.message} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
