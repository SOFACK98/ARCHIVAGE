// ============================================================
// VIEW/PAGE : UsersPage
// ============================================================

import React, { useState } from 'react';
import { UserPlus, Edit, Trash2 } from 'lucide-react';
import { AddUserModal } from '../components/AddUserModal';
import { EditUserModal } from '../components/EditUserModal';
import { ConfirmModal } from '../components/ConfirmModal';
import { useApp } from '../../context/AppContext';

export const UsersPage: React.FC = () => {
  const { users } = useApp();
  const { users: userList, toggleUserStatus, deleteUser, reload } = users;
  const [showAddModal, setShowAddModal] = useState(false);
  const [userToEdit, setUserToEdit] = useState<number | null>(null);
  const [userToDelete, setUserToDelete] = useState<number | null>(null);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold text-slate-800">Gestion des utilisateurs</h2>
        <button 
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 transition-colors"
        >
          <UserPlus size={18} /> Nouvel utilisateur
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                {['Nom', 'Email', 'Rôle', 'Agence', 'Département', 'Statut', 'Actions'].map((h) => (
                  <th key={h} className="px-6 py-4 text-left text-sm font-semibold text-slate-700">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {userList.map((user) => (
                <tr
                  id={`user-row-${user.id}`}
                  key={user.id}
                  onClick={() => setSelectedUserId(user.id)}
                  className={`border-b border-slate-100 transition-colors cursor-pointer ${selectedUserId === user.id ? 'bg-emerald-50' : 'hover:bg-slate-50'}`}
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-medium">
                        {user.name.split(' ').map((n) => n[0]).join('')}
                      </div>
                      <span className="text-sm font-medium text-slate-700">{user.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">{user.email}</td>
                  <td className="px-6 py-4">
                    <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">{user.agence}</td>
                  <td className="px-6 py-4 text-sm text-slate-600">{user.departement}</td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => toggleUserStatus(user.id)}
                      className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                        user.status === 'Actif' ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      {user.status}
                    </button>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <button 
                        onClick={() => setUserToEdit(user.id)}
                        className="p-1 hover:bg-blue-100 rounded transition-colors" 
                        title="Modifier"
                      >
                        <Edit size={16} className="text-blue-600" />
                      </button>
                      <button 
                        onClick={() => setUserToDelete(user.id)} 
                        className="p-1 hover:bg-red-100 rounded transition-colors" 
                        title="Supprimer"
                      >
                        <Trash2 size={16} className="text-red-600" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showAddModal && (
        <AddUserModal
          onClose={() => setShowAddModal(false)}
          onSuccess={(newUserId: number) => {
            setShowAddModal(false);
            reload().then(() => {
              setSelectedUserId(newUserId);
              const row = document.getElementById(`user-row-${newUserId}`);
              row?.scrollIntoView({ behavior: 'smooth', block: 'center' });
            });
          }}
        />
      )}

      {userToEdit && (
        <EditUserModal
          userId={userToEdit}
          onClose={() => setUserToEdit(null)}
          onSuccess={() => {
            setUserToEdit(null);
            window.location.reload();
          }}
        />
      )}

      {userToDelete && (
        <ConfirmModal
          title="Supprimer l'utilisateur"
          message="Êtes-vous sûr de vouloir supprimer cet utilisateur ? Cette action est irréversible."
          onConfirm={() => {
            deleteUser(userToDelete);
            setUserToDelete(null);
          }}
          onCancel={() => setUserToDelete(null)}
        />
      )}
    </div>
  );
};
