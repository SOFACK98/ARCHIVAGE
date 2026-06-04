// ============================================================
// CONTROLLER : UserController
// Responsabilité : logique métier liée aux utilisateurs
//   - CRUD via API
//   - activation / désactivation
// ============================================================

import { useState, useCallback, useEffect } from 'react';
import type { User } from '../models/User';
import { apiService } from '../services/ApiService';

export function useUserController() {
  const [users, setUsers] = useState<User[]>([]);

  const reload = useCallback(async () => {
    try {
      const data = await apiService.getUsers();
      console.log('[Users] data reçue:', data);
      const mapped = (data as any[]).map((u: any) => ({
        id: u.id,
        name: `${u.prenom || ''} ${u.nom || ''}`.trim(),
        email: u.email,
        role: u.role_nom || u.role_code || u.role || 'N/A',
        agence: u.agence_nom || 'N/A',
        departement: u.departement_nom || 'N/A',
        status: u.statut === 'actif' || u.statut === 'active' || u.actif === true ? 'Actif' : 'Inactif'
      }));
      setUsers(mapped);
    } catch (error) {
      console.error('Erreur chargement utilisateurs:', error);
    }
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  /** Active ou désactive un utilisateur */
  const toggleUserStatus = useCallback((id: number) => {
    apiService.updateUser(id, { statut: 'toggle' })
      .then(() => reload())
      .catch(console.error);
  }, [reload]);

  /** Supprime un utilisateur (simulation) */
  const deleteUser = useCallback((id: number) => {
    apiService.deleteUser(id)
      .then(() => reload())
      .catch(console.error);
  }, [reload]);

  /** Ajoute un utilisateur (simulation) */
  const addUser = useCallback((user: Omit<User, 'id'>) => {
    setUsers((prev) => [...prev, { ...user, id: Date.now() }]);
  }, []);

  return { users, toggleUserStatus, deleteUser, addUser, reload };
}
