import { authService } from './AuthService';

class ApiService {
  private baseURL = '/api';

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...authService.getHeaders(),
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Erreur serveur' }));
      throw new Error(error.message || 'Erreur API');
    }

    return response.json();
  }

  async getDocuments(filters?: any) {
    const params = new URLSearchParams(filters).toString();
    return this.request(`/documents${params ? `?${params}` : ''}`);
  }

  async createDocument(data: any) {
    return this.request('/documents', { method: 'POST', body: JSON.stringify(data) });
  }

  async deleteDocument(id: number) {
    return this.request(`/documents/${id}`, { method: 'DELETE' });
  }

  async getUsers() {
    return this.request('/users');
  }

  async createUser(data: any) {
    return this.request('/users', { method: 'POST', body: JSON.stringify(data) });
  }

  async getRoles() {
    return this.request('/roles');
  }

  async deleteUser(id: number) {
    return this.request(`/users/${id}`, { method: 'DELETE' });
  }

  async updateUser(id: number, data: any) {
    return this.request(`/users/${id}`, { method: 'PUT', body: JSON.stringify(data) });
  }

  async getTypesDocuments() {
    return this.request('/types-documents');
  }

  async createTypeDocument(data: { nom: string; description?: string }) {
    return this.request('/types-documents', { method: 'POST', body: JSON.stringify(data) });
  }

  async getDepartements() {
    return this.request('/departements');
  }

  async getAgences() {
    return this.request('/agences');
  }

  async createAgence(data: { code: string; nom: string }) {
    return this.request('/agences', { method: 'POST', body: JSON.stringify(data) });
  }

  async createDepartement(data: { nom: string; description?: string }) {
    return this.request('/departements', { method: 'POST', body: JSON.stringify(data) });
  }

  async getAuditLogs(filters?: any): Promise<any[]> {
    const params = new URLSearchParams(filters).toString();
    return this.request(`/audit/logs${params ? `?${params}` : ''}`);
  }

  async getStats(): Promise<{ totalDocuments: number; todayUploads: number; pendingApprovals: number; activeUsers: number }> {
    return this.request('/stats');
  }

  async getPendingValidation() {
    return this.request('/validation/pending');
  }

  async uploadFile(formData: FormData) {
    const uploadHeaders = { ...authService.getHeaders() } as Record<string, string>;
    // Ne pas fixer Content-Type pour FormData (le navigateur gère le boundary automatiquement)
    delete uploadHeaders['Content-Type'];

    const response = await fetch('/api/upload', {
      method: 'POST',
      headers: uploadHeaders,
      body: formData,
    });

    if (!response.ok) {
      let errorMessage = `Upload failed ${response.status} ${response.statusText}`;
      try {
        const errorBody = await response.json();
        if (errorBody?.message) {
          errorMessage = errorBody.message;
        }
      } catch (_e) {
        // no json body
      }
      throw new Error(errorMessage);
    }

    return response.json();
  }

  async approveDocument(id: number) {
    return this.request(`/validation/approve/${id}`, { method: 'POST' });
  }

  async rejectDocument(id: number, motif: string) {
    return this.request(`/validation/reject/${id}`, { method: 'POST', body: JSON.stringify({ motif }) });
  }

  async requestDocumentModification(id: number, modifications: string) {
    return this.request(`/documents/${id}/request-modify`, { method: 'POST', body: JSON.stringify({ modifications }) });
  }

  async requestDocumentDeletion(id: number) {
    return this.request(`/documents/${id}/request-delete`, { method: 'POST' });
  }

  async getDossiers() {
    return this.request('/dossiers');
  }

  async createDossier(data: { nom: string; description?: string; parent_id?: number | null; couleur?: string }) {
    return this.request('/dossiers', { method: 'POST', body: JSON.stringify(data) });
  }

  async updateDossier(id: number, data: { nom: string; description?: string; couleur?: string }) {
    return this.request(`/dossiers/${id}`, { method: 'PUT', body: JSON.stringify(data) });
  }

  async deleteDossier(id: number) {
    return this.request(`/dossiers/${id}`, { method: 'DELETE' });
  }

  async getDossierDocuments(id: number) {
    return this.request(`/dossiers/${id}/documents`);
  }

  async addDocumentToDossier(dossierId: number, documentId: number) {
    return this.request(`/dossiers/${dossierId}/documents`, { method: 'POST', body: JSON.stringify({ document_id: documentId }) });
  }

  async removeDocumentFromDossier(dossierId: number, documentId: number) {
    return this.request(`/dossiers/${dossierId}/documents/${documentId}`, { method: 'DELETE' });
  }

  async searchDocuments(filters: {
    keywords?: string;
    type_id?: number;
    dossier_id?: number;
    departement_id?: number;
    agences?: number[];
    statut?: string;
    confidentialite?: string;
    date_from?: string;
    date_to?: string;
  }): Promise<any[]> {
    const params = new URLSearchParams();
    if (filters.keywords) params.set('q', filters.keywords);
    if (filters.type_id) params.set('type_id', String(filters.type_id));
    if (filters.dossier_id) params.set('dossier_id', String(filters.dossier_id));
    if (filters.departement_id) params.set('departement_id', String(filters.departement_id));
    if (filters.agences?.length) params.set('agences', filters.agences.join(','));
    if (filters.statut) params.set('statut', filters.statut);
    if (filters.confidentialite) params.set('confidentialite', filters.confidentialite);
    if (filters.date_from) params.set('date_from', filters.date_from);
    if (filters.date_to) params.set('date_to', filters.date_to);
    return this.request(`/documents/search?${params.toString()}`);
  }

  async getDossiersForSearch(): Promise<any[]> {
    return this.request('/dossiers/all');
  }

  async getTypesDocumentsForSearch(): Promise<any[]> {
    return this.request('/types-documents/all');
  }

  async getDepartementsForSearch(): Promise<any[]> {
    return this.request('/departements/all');
  }

  async getAgencesForSearch(): Promise<any[]> {
    return this.request('/agences/all');
  }

  // Obtenir l'historique des validations d'un document
  async getValidationHistory(documentId: number) {
    return this.request(`/validation/history/${documentId}`);
  }

  // Obtenir les documents validés
  async getApprovedDocuments() {
    return this.request('/validation/approved');
  }

  // Obtenir les documents rejetés
  async getRejectedDocuments() {
    return this.request('/validation/rejected');
  }

  // Télécharger un document
  async downloadDocument(id: number, filename?: string): Promise<void> {
    const token = localStorage.getItem('auth_token');
    const response = await fetch(`/api/documents/${id}/download`, {
      method: 'GET',
      headers: {
        'Authorization': token ? `Bearer ${token}` : '',
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Erreur serveur' }));
      throw new Error(error.message || 'Erreur lors du téléchargement');
    }

    // Créer un blob et télécharger
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename || `document-${id}`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  }
}

export const apiService = new ApiService();
