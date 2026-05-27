// ============================================================
// MODEL : User
// Responsabilité : définir la structure des données utilisateur
//                 et fournir les données de démonstration
// ============================================================

export type UserRole = 'Administrateur' | 'Agent dossier' | 'Responsable conformité' | 'Lecteur';
export type UserStatus = 'Actif' | 'Inactif';

export interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  agence?: string;
  departement?: string;
  status: UserStatus;
}

export interface CurrentUser {
  name: string;
  initials: string;
  role: UserRole;
  lastLogin: string;
}

// Utilisateur connecté (simulé)
export const CURRENT_USER: CurrentUser = {
  name: 'Marie Dupont',
  initials: 'MD',
  role: 'Administrateur',
  lastLogin: "Aujourd'hui à 08:30",
};

// Données de démonstration
export const MOCK_USERS: User[] = [
  { id: 1, name: 'Marie Dupont',   email: 'marie.dupont@mf.cm',   role: 'Administrateur',          status: 'Actif'   },
  { id: 2, name: 'Jean Mballa',    email: 'jean.mballa@mf.cm',    role: 'Agent dossier',           status: 'Actif'   },
  { id: 3, name: 'Sophie Nkomo',   email: 'sophie.nkomo@mf.cm',   role: 'Responsable conformité',  status: 'Actif'   },
  { id: 4, name: 'Paul Etoa',      email: 'paul.etoa@mf.cm',      role: 'Lecteur',                 status: 'Inactif' },
];
