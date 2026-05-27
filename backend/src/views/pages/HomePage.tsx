import React, { useState, useEffect } from 'react';
import { FileText, Upload, Search, Clock, TrendingUp, Award, Zap, ArrowRight } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { apiService } from '../../services/ApiService';
import { authService } from '../../services/AuthService';

export const HomePage: React.FC = () => {
  const { navigation, currentUser } = useApp();
  const [stats, setStats] = useState({ myDocuments: 0, todayUploads: 0, recentActivity: 0 });
  const [recentDocs, setRecentDocs] = useState<any[]>([]);
  const user = authService.getCurrentUser();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const user = authService.getCurrentUser();
      const docs = await apiService.getDocuments() as any[];
      
      const myDocs = docs.filter(d => d.uploaded_by === user?.id);
      const today = docs.filter(d => {
        const docDate = new Date(d.created_at);
        const now = new Date();
        return docDate.toDateString() === now.toDateString();
      });
      
      setStats({
        myDocuments: myDocs.length,
        todayUploads: today.length,
        recentActivity: docs.length
      });
      
      setRecentDocs(docs.slice(0, 5));
    } catch (error) {
      console.error('Erreur chargement:', error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Hero Section */}
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
      <div className="grid grid-cols-3 gap-6">
        <div className="bg-white rounded-xl p-6 border border-slate-200 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
              <FileText size={24} className="text-emerald-600" />
            </div>
            <TrendingUp size={20} className="text-emerald-600" />
          </div>
          <h3 className="text-3xl font-bold text-slate-800">{stats.myDocuments}</h3>
          <p className="text-slate-600 text-sm mt-1">Mes documents</p>
        </div>

        <div className="bg-white rounded-xl p-6 border border-slate-200 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <Upload size={24} className="text-blue-600" />
            </div>
            <Zap size={20} className="text-blue-600" />
          </div>
          <h3 className="text-3xl font-bold text-slate-800">{stats.todayUploads}</h3>
          <p className="text-slate-600 text-sm mt-1">Importés aujourd'hui</p>
        </div>

        <div className="bg-white rounded-xl p-6 border border-slate-200 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
              <Clock size={24} className="text-purple-600" />
            </div>
            <TrendingUp size={20} className="text-purple-600" />
          </div>
          <h3 className="text-3xl font-bold text-slate-800">{stats.recentActivity}</h3>
          <p className="text-slate-600 text-sm mt-1">Activité récente</p>
        </div>
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

      {/* Recent Documents */}
      <div className="bg-white rounded-xl p-6 border border-slate-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-slate-800">Documents récents</h2>
          <button 
            onClick={() => navigation.navigate('documents')}
            className="text-emerald-600 hover:text-emerald-700 flex items-center gap-2 text-sm font-semibold"
          >
            Voir tout <ArrowRight size={16} />
          </button>
        </div>
        <div className="space-y-3">
          {recentDocs.map((doc) => (
            <div key={doc.id} className="flex items-center gap-4 p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
              <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center shrink-0">
                <FileText size={20} className="text-emerald-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-slate-800 truncate">{doc.titre}</p>
                <p className="text-sm text-slate-500">{doc.type} • {new Date(doc.created_at).toLocaleDateString('fr-FR')}</p>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                doc.confidentialite === 'public' ? 'bg-green-100 text-green-700' :
                doc.confidentialite === 'confidentiel' ? 'bg-orange-100 text-orange-700' :
                'bg-red-100 text-red-700'
              }`}>
                {doc.confidentialite}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
