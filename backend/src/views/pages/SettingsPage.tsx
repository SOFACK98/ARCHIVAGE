// ============================================================
// VIEW/PAGE : SettingsPage
// ============================================================

import React, { useState, useEffect } from 'react';
import { Shield, Settings, Plus, FolderPlus, FileType, CheckCircle, XCircle, Building2 } from 'lucide-react';
import { apiService } from '../../services/ApiService';

const RETENTION_POLICIES = [
  { label: 'Contrats clients',      duration: '10 ans' },
  { label: "Pièces d'identité",     duration: '5 ans'  },
  { label: 'Rapports internes',     duration: '7 ans'  },
  { label: 'Documents temporaires', duration: '1 an'   },
];

export const SettingsPage: React.FC = () => {
  const [departements, setDepartements] = useState<any[]>([]);
  const [typesDocuments, setTypesDocuments] = useState<any[]>([]);
  const [agences, setAgences] = useState<any[]>([]);
  const [showAddDept, setShowAddDept] = useState(false);
  const [showAddType, setShowAddType] = useState(false);
  const [showAddAgence, setShowAddAgence] = useState(false);
  const [newDept, setNewDept] = useState({ nom: '', description: '' });
  const [newType, setNewType] = useState({ nom: '', description: '' });
  const [newAgence, setNewAgence] = useState({ code: '', nom: '' });
  const [deptMessage, setDeptMessage] = useState<{type: 'success'|'error', text: string} | null>(null);
  const [typeMessage, setTypeMessage] = useState<{type: 'success'|'error', text: string} | null>(null);
  const [agenceMessage, setAgenceMessage] = useState<{type: 'success'|'error', text: string} | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const [depts, types, ags] = await Promise.all([
      apiService.getDepartements(),
      apiService.getTypesDocuments(),
      apiService.getAgences()
    ]);
    setDepartements(depts as any[]);
    setTypesDocuments(types as any[]);
    setAgences(ags as any[]);
  };

  const handleAddDept = async (e: React.FormEvent) => {
    e.preventDefault();
    setDeptMessage(null);
    try {
      await apiService.createDepartement(newDept);
      setNewDept({ nom: '', description: '' });
      setShowAddDept(false);
      await loadData();
      setDeptMessage({ type: 'success', text: 'Département créé avec succès' });
      setTimeout(() => setDeptMessage(null), 3000);
    } catch (error: any) {
      setDeptMessage({ type: 'error', text: error.message || 'Erreur lors de la création' });
    }
  };

  const handleAddType = async (e: React.FormEvent) => {
    e.preventDefault();
    setTypeMessage(null);
    try {
      await apiService.createTypeDocument(newType);
      setNewType({ nom: '', description: '' });
      setShowAddType(false);
      await loadData();
      setTypeMessage({ type: 'success', text: 'Type de document créé avec succès' });
      setTimeout(() => setTypeMessage(null), 3000);
    } catch (error: any) {
      setTypeMessage({ type: 'error', text: error.message || 'Erreur lors de la création' });
    }
  };

  const handleAddAgence = async (e: React.FormEvent) => {
    e.preventDefault();
    setAgenceMessage(null);
    try {
      await apiService.createAgence(newAgence);
      setNewAgence({ code: '', nom: '' });
      setShowAddAgence(false);
      await loadData();
      setAgenceMessage({ type: 'success', text: 'Agence créée avec succès' });
      setTimeout(() => setAgenceMessage(null), 3000);
    } catch (error: any) {
      setAgenceMessage({ type: 'error', text: error.message || 'Erreur lors de la création' });
    }
  };

  return (
  <div className="space-y-6">
    <h2 className="text-3xl font-bold text-slate-800">Paramètres du système</h2>

    <div className="grid grid-cols-2 gap-6">
      {/* Agences */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
            <Building2 size={20} className="text-purple-600" /> Agences
          </h3>
          <button onClick={() => setShowAddAgence(!showAddAgence)} className="px-3 py-1 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center gap-1 text-sm">
            <Plus size={16} /> Ajouter
          </button>
        </div>
        {agenceMessage && (
          <div className={`mb-3 p-3 rounded-lg flex items-center gap-2 ${agenceMessage.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
            {agenceMessage.type === 'success' ? <CheckCircle size={18} /> : <XCircle size={18} />}
            <span className="text-sm">{agenceMessage.text}</span>
          </div>
        )}
        {showAddAgence && (
          <form onSubmit={handleAddAgence} className="mb-4 p-3 bg-slate-50 rounded-lg space-y-2">
            <input
              type="text"
              placeholder="Code de l'agence"
              value={newAgence.code}
              onChange={(e) => setNewAgence({...newAgence, code: e.target.value})}
              required
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
            />
            <input
              type="text"
              placeholder="Nom"
              value={newAgence.nom}
              onChange={(e) => setNewAgence({...newAgence, nom: e.target.value})}
              required
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
            />
            <button type="submit" className="w-full px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm">
              Créer
            </button>
          </form>
        )}
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {agences.map((agence) => (
            <div key={agence.id} className="p-3 bg-slate-50 rounded-lg">
              <p className="font-medium text-slate-700">{agence.code}</p>
              {agence.nom && <p className="text-xs text-slate-500">{agence.nom}</p>}
            </div>
          ))}
        </div>
      </div>

      {/* Départements */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
            <FolderPlus size={20} className="text-emerald-600" /> Départements
          </h3>
          <button onClick={() => setShowAddDept(!showAddDept)} className="px-3 py-1 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 flex items-center gap-1 text-sm">
            <Plus size={16} /> Ajouter
          </button>
        </div>
        {deptMessage && (
          <div className={`mb-3 p-3 rounded-lg flex items-center gap-2 ${deptMessage.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
            {deptMessage.type === 'success' ? <CheckCircle size={18} /> : <XCircle size={18} />}
            <span className="text-sm">{deptMessage.text}</span>
          </div>
        )}
        {showAddDept && (
          <form onSubmit={handleAddDept} className="mb-4 p-3 bg-slate-50 rounded-lg space-y-2">
            <input
              type="text"
              placeholder="Nom du département"
              value={newDept.nom}
              onChange={(e) => setNewDept({...newDept, nom: e.target.value})}
              required
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
            />
            <input
              type="text"
              placeholder="Description (optionnel)"
              value={newDept.description}
              onChange={(e) => setNewDept({...newDept, description: e.target.value})}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
            />
            <button type="submit" className="w-full px-3 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 text-sm">
              Créer
            </button>
          </form>
        )}
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {departements.map((dept) => (
            <div key={dept.id} className="p-3 bg-slate-50 rounded-lg">
              <p className="font-medium text-slate-700">{dept.nom}</p>
              {dept.description && <p className="text-xs text-slate-500">{dept.description}</p>}
            </div>
          ))}
        </div>
      </div>

      {/* Types de documents */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
            <FileType size={20} className="text-blue-600" /> Types de documents
          </h3>
          <button onClick={() => setShowAddType(!showAddType)} className="px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-1 text-sm">
            <Plus size={16} /> Ajouter
          </button>
        </div>
        {typeMessage && (
          <div className={`mb-3 p-3 rounded-lg flex items-center gap-2 ${typeMessage.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
            {typeMessage.type === 'success' ? <CheckCircle size={18} /> : <XCircle size={18} />}
            <span className="text-sm">{typeMessage.text}</span>
          </div>
        )}
        {showAddType && (
          <form onSubmit={handleAddType} className="mb-4 p-3 bg-slate-50 rounded-lg space-y-2">
            <input
              type="text"
              placeholder="Nom du type"
              value={newType.nom}
              onChange={(e) => setNewType({...newType, nom: e.target.value})}
              required
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
            />
            <input
              type="text"
              placeholder="Description (optionnel)"
              value={newType.description}
              onChange={(e) => setNewType({...newType, description: e.target.value})}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
            />
            <button type="submit" className="w-full px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm">
              Créer
            </button>
          </form>
        )}
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {typesDocuments.map((type) => (
            <div key={type.id} className="p-3 bg-slate-50 rounded-lg">
              <p className="font-medium text-slate-700">{type.nom}</p>
              {type.description && <p className="text-xs text-slate-500">{type.description}</p>}
            </div>
          ))}
        </div>
      </div>
      {/* Sécurité */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
          <Shield size={20} className="text-blue-600" /> Sécurité
        </h3>
        <div className="space-y-4">
          {[
            { label: 'Authentification à deux facteurs (MFA)', desc: 'Protection supplémentaire pour les connexions', active: true  },
            { label: 'Chiffrement des documents',              desc: 'AES-256 au repos et en transit',                active: true  },
            { label: 'Verrouillage automatique',               desc: "Après 15 minutes d'inactivité",                active: false },
          ].map(({ label, desc, active }) => (
            <div key={label} className="flex items-center justify-between pt-3 border-t border-slate-200 first:pt-0 first:border-0">
              <div>
                <p className="font-medium text-slate-700">{label}</p>
                <p className="text-sm text-slate-500">{desc}</p>
              </div>
              <button className={`px-4 py-2 rounded-lg text-sm ${active ? 'bg-green-600 text-white' : 'border border-slate-300 hover:bg-slate-50'}`}>
                {active ? 'Activé' : 'Configurer'}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Système */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
          <Settings size={20} className="text-blue-600" /> Système
        </h3>
        <div className="space-y-4">
          {[
            { label: 'Sauvegarde automatique',   desc: "Tous les jours à 02:00",            active: true  },
            { label: 'Notifications par email',   desc: 'Alertes de sécurité et activité',   active: true  },
            { label: 'Rétention des logs',        desc: 'Conservation de 12 mois',           active: false },
          ].map(({ label, desc, active }) => (
            <div key={label} className="flex items-center justify-between pt-3 border-t border-slate-200 first:pt-0 first:border-0">
              <div>
                <p className="font-medium text-slate-700">{label}</p>
                <p className="text-sm text-slate-500">{desc}</p>
              </div>
              <button className={`px-4 py-2 rounded-lg text-sm ${active ? 'bg-green-600 text-white' : 'border border-slate-300 hover:bg-slate-50'}`}>
                {active ? 'Activé' : 'Modifier'}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Politique de rétention */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <h3 className="text-lg font-semibold text-slate-800 mb-4">Politique de rétention</h3>
        <div className="space-y-3">
          {RETENTION_POLICIES.map(({ label, duration }) => (
            <div key={label} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
              <span className="text-sm font-medium text-slate-700">{label}</span>
              <span className="text-sm text-slate-600">{duration}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Informations système */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <h3 className="text-lg font-semibold text-slate-800 mb-4">Informations système</h3>
        <div className="space-y-3">
          {[
            ['Version du système',  'v2.5.1'],
            ['Dernière mise à jour','15 novembre 2025'],
            ['Base de données',     'PostgreSQL 15.2'],
          ].map(([label, val]) => (
            <div key={label} className="pt-3 border-t border-slate-200 first:pt-0 first:border-0">
              <p className="text-sm text-slate-600">{label}</p>
              <p className="font-medium text-slate-800">{val}</p>
            </div>
          ))}
          <div className="pt-3 border-t border-slate-200">
            <p className="text-sm text-slate-600">Espace de stockage</p>
            <div className="flex items-center gap-2 mt-1">
              <div className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden">
                <div className="h-full bg-blue-600 rounded-full" style={{ width: '45%' }} />
              </div>
              <span className="text-sm text-slate-600">45% utilisé</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    {/* Bannière support */}
    {/* <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl shadow-sm p-6 text-white">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-semibold mb-2">Assistance et support technique</h3>
          <p className="text-blue-100">Besoin d'aide ? Contactez notre équipe support disponible 24/7</p>
        </div>
        <button className="px-6 py-3 bg-white text-blue-600 rounded-lg hover:bg-blue-50 font-medium">
          Contacter le support
        </button>
      </div>
    </div> */}
  </div>
  );
};
