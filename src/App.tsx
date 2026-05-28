import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './views/layout/Header';
import { Sidebar } from './views/layout/Sidebar';
import { Dashboard } from './views/pages/Dashboard';
import { HomePage } from './views/pages/HomePage';
import { DocumentsPage } from './views/pages/DocumentsPage';
import { SearchPage } from './views/pages/SearchPage';
import { UsersPage } from './views/pages/UsersPage';
import { AuditPage } from './views/pages/AuditPage';
import { SettingsPage } from './views/pages/SettingsPage';
import { ValidationPage } from './views/pages/ValidationPage';
import { ValidatedDocumentsPage } from './views/pages/ValidatedDocumentsPage';
import { RejectedDocumentsPage } from './views/pages/RejectedDocumentsPage';
import { DossiersPage } from './views/pages/DossiersPage';
import { DocumentModal } from './views/components/DocumentModal';
import { LoginPage } from './views/pages/LoginPageUnited';
import { ProtectedRoute } from './components/ProtectedRoute';
import { authService } from './services/AuthService';

const AppContent: React.FC = () => {
  const { navigation, documents } = useApp();
  const { currentPage } = navigation;
  const { selectedDocument, closeDocument, deleteDocument } = documents;

  const renderPage = () => {
    const isAdmin = authService.isAdmin();
    
    switch (currentPage) {
      case 'dashboard': 
        return <Dashboard />;
      case 'home':
        return <HomePage />;
      case 'documents': return <DocumentsPage />;
      case 'search': return <SearchPage />;
      case 'users': 
        return (
          <ProtectedRoute requireAdmin>
            <UsersPage />
          </ProtectedRoute>
        );
      case 'audit': 
        return (
          <ProtectedRoute requireAdmin>
            <AuditPage />
          </ProtectedRoute>
        );
      case 'settings': 
        return (
          <ProtectedRoute requireAdmin>
            <SettingsPage />
          </ProtectedRoute>
        );
      case 'validation':
        return (
          <ProtectedRoute requireAdmin={false} requireValidation>
            <ValidationPage />
          </ProtectedRoute>
        );
      case 'validated-documents':
        return (
          <ProtectedRoute requireAdmin={false} requireValidation>
            <ValidatedDocumentsPage />
          </ProtectedRoute>
        );
      case 'rejected-documents':
        return (
          <ProtectedRoute requireAdmin={false} requireValidation>
            <RejectedDocumentsPage />
          </ProtectedRoute>
        );
      case 'dossiers':
        return <DossiersPage />;
      default: {
        const role = authService.getCurrentUser()?.role_code || authService.getCurrentUser()?.role || '';
        if (role === 'ADMIN') return <Dashboard />;
        if (role === 'CHEF_AGENCE' || role === 'CHEF_DEPT' || role === 'CHEF_DEPARTEMENT') return <ValidationPage />;
        return <HomePage />;
      }
    }
  };

  return (
    <div className="flex h-screen bg-slate-100">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-8">
          {renderPage()}
        </main>
      </div>
      {selectedDocument && (
        <DocumentModal
          doc={selectedDocument}
          onClose={closeDocument}
          onDelete={deleteDocument}
        />
      )}
    </div>
  );
};

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(
    () => localStorage.getItem('isAuthenticated') === 'true'
  );

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

export default App;
