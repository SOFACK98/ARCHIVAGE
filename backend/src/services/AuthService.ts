// Types for AuthService
interface CurrentUser {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  role: string;
  role_code: string;
  agence_id?: number;
  agence_nom?: string;
  departement_id?: number;
  departement?: string;
}

interface LoginCredentials {
  email: string;
  password: string;
}

interface AuthResponse {
  success: boolean;
  message?: string;
  token?: string;
  user?: CurrentUser;
}

class AuthService {
  private currentUser: CurrentUser | null = null;
  private token: string | null = null;

  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
      });

      const data = await response.json();

      if (!response.ok) {
        return { success: false, message: data.message || 'Erreur de connexion' };
      }

      if (data.token && data.user) {
        const normalizedUser = {
          ...data.user,
          departement: data.user.departement || data.user.departement_nom || '',
          agence_nom: data.user.agence_nom || '',
        };

        this.token = data.token;
        this.currentUser = normalizedUser;

        localStorage.setItem('auth_token', data.token);
        localStorage.setItem('user', JSON.stringify(normalizedUser));

        return { success: true, token: data.token, user: normalizedUser };
      }

      return { success: false, message: 'Erreur de connexion' };
    } catch (error) {
      console.error('Erreur de connexion:', error);
      return { success: false, message: 'Erreur de connexion' };
    }
  }

  async logout(): Promise<void> {
    try {
      await this.logAction('DECONNEXION', 'auth', 'Déconnexion');
      await fetch('/api/auth/logout', {
        method: 'POST',
        headers: this.getHeaders(),
      });
    } catch (error) {
      console.error('Erreur de déconnexion:', error);
    } finally {
      this.currentUser = null;
      this.token = null;
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user');
      window.location.reload();
    }
  }

  getCurrentUser(): CurrentUser | null {
    if (!this.currentUser) {
      const userStr = localStorage.getItem('user');
      const token = localStorage.getItem('auth_token');
      
      if (userStr && token) {
        const parsedUser = JSON.parse(userStr);
        this.token = token;
        this.currentUser = {
          ...parsedUser,
          departement: parsedUser.departement || parsedUser.departement_nom || '',
          agence_nom: parsedUser.agence_nom || '',
        };
      }
    }
    return this.currentUser;
  }

  isAuthenticated(): boolean {
    return !!localStorage.getItem('auth_token');
  }

  isAdmin(): boolean {
    const user = this.getCurrentUser();
    return user?.role_code === 'ADMIN';
  }

  canValidate(): boolean {
    const user = this.getCurrentUser();
    if (!user) return false;
    return user.role_code !== 'AGENT';
  }

  canAccessDashboard(): boolean {
    return this.isAdmin();
  }

  canAccessAgence(agenceId: number): boolean {
    const user = this.getCurrentUser();
    if (!user) return false;
    if (this.isAdmin()) return true;
    return user.agence_id === agenceId;
  }

  getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    
    // Ensure token is loaded from localStorage if not in memory
    if (!this.token) {
      this.token = localStorage.getItem('auth_token');
    }
    
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }
    
    return headers;
  }

  async logAction(action: string, module: string, details?: any): Promise<void> {
    try {
      await fetch('/api/audit/log', {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({ action, module, details, timestamp: new Date().toISOString() }),
      });
    } catch (error) {
      // Silent fail
    }
  }

  // Récupérer le rôle de l'utilisateur depuis la base de données
  async getUserRoleFromDB(): Promise<{ role_id: number; role_code: string; role_nom: string } | null> {
    try {
      const response = await fetch('/api/auth/me', {
        method: 'GET',
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        return null;
      }

      const user = await response.json();
      return {
        role_id: user.role_id,
        role_code: user.role_code,
        role_nom: user.role_nom
      };
    } catch (error) {
      console.error('Erreur récupération rôle:', error);
      return null;
    }
  }
}

export const authService = new AuthService();
