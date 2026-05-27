# 🏗️ Architecture du Projet

## Vue d'Ensemble

Le projet utilise une **architecture MVC (Model-View-Controller)** adaptée à React, avec une séparation claire des responsabilités.

```
┌─────────────────────────────────────────────────────────┐
│                     UTILISATEUR                          │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│                   VIEWS (React)                          │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐              │
│  │  Pages   │  │ Layout   │  │Components│              │
│  └──────────┘  └──────────┘  └──────────┘              │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│              CONTEXT (État Global)                       │
│              AppContext.tsx                              │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│            CONTROLLERS (Logique Métier)                  │
│  ┌──────────────┐  ┌──────────────┐                     │
│  │ Navigation   │  │  Document    │  ...                │
│  │ Controller   │  │  Controller  │                     │
│  └──────────────┘  └──────────────┘                     │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│              MODELS (Données)                            │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐              │
│  │ Document │  │   User   │  │ AuditLog │              │
│  └──────────┘  └──────────┘  └──────────┘              │
└─────────────────────────────────────────────────────────┘
```

## 📁 Structure Détaillée

```
web/
├── src/
│   ├── models/                    # 📊 MODÈLES DE DONNÉES
│   │   ├── Document.ts            # Types et données mock des documents
│   │   ├── User.ts                # Types et données mock des utilisateurs
│   │   ├── AuditLog.ts            # Types et données mock des logs
│   │   └── Stats.ts               # Types et données des statistiques
│   │
│   ├── controllers/               # 🎮 LOGIQUE MÉTIER
│   │   ├── NavigationController.ts    # Gestion navigation et UI
│   │   ├── DocumentController.ts      # CRUD documents
│   │   ├── UserController.ts          # CRUD utilisateurs
│   │   ├── AuditController.ts         # Gestion des logs
│   │   └── SearchController.ts        # Recherche avancée
│   │
│   ├── views/                     # 🎨 INTERFACE UTILISATEUR
│   │   ├── components/            # Composants réutilisables
│   │   │   ├── DocumentRow.tsx    # Ligne de document
│   │   │   ├── DocumentModal.tsx  # Modal détails document
│   │   │   ├── StatCard.tsx       # Carte statistique
│   │   │   ├── Alert.tsx          # Composant alerte
│   │   │   └── NavItem.tsx        # Item de navigation
│   │   │
│   │   ├── layout/                # Layout de l'application
│   │   │   ├── Header.tsx         # En-tête
│   │   │   └── Sidebar.tsx        # Barre latérale
│   │   │
│   │   └── pages/                 # Pages principales
│   │       ├── Dashboard.tsx      # Tableau de bord
│   │       ├── DocumentsPage.tsx  # Gestion documents
│   │       ├── SearchPage.tsx     # Recherche avancée
│   │       ├── UsersPage.tsx      # Gestion utilisateurs
│   │       ├── AuditPage.tsx      # Audit & logs
│   │       └── SettingsPage.tsx   # Paramètres
│   │
│   ├── context/                   # 🔗 ÉTAT GLOBAL
│   │   └── AppContext.tsx         # Context React (pont MVC)
│   │
│   ├── App.tsx                    # 🚀 Composant racine
│   ├── main.tsx                   # 🎯 Point d'entrée
│   └── index.css                  # 🎨 Styles globaux
│
├── database/                      # 🗄️ BASE DE DONNÉES
│   ├── config.ts                  # Configuration DB
│   ├── connection.ts              # Connexion DB
│   ├── database.sql               # Schéma SQL
│   └── migrate.ts                 # Migrations
│
├── public/                        # 📦 ASSETS STATIQUES
│   └── vite.svg
│
├── index.html                     # 📄 HTML principal
├── vite.config.ts                 # ⚙️ Config Vite
├── tailwind.config.js             # 🎨 Config Tailwind
├── postcss.config.js              # 🎨 Config PostCSS
├── tsconfig.json                  # 📝 Config TypeScript
├── package.json                   # 📦 Dépendances
└── .env.example                   # 🔐 Variables d'env
```

## 🎯 Couches de l'Architecture

### 1. Models (Modèles de Données)

**Responsabilité:** Définir la structure des données et fournir les données de démonstration.

```typescript
// Document.ts
export interface Document {
  id: number;
  title: string;
  type: DocumentType;
  client: string;
  date: string;
  status: DocumentStatus;
  confidentiality: ConfidentialityLevel;
}

export const MOCK_DOCUMENTS: Document[] = [...];
```

**Caractéristiques:**
- Types TypeScript stricts
- Données mock pour le développement
- Aucune logique métier
- Exportation des types et constantes

### 2. Controllers (Contrôleurs)

**Responsabilité:** Gérer la logique métier et l'état local.

```typescript
// DocumentController.ts
export function useDocumentController() {
  const [documents, setDocuments] = useState<Document[]>(MOCK_DOCUMENTS);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  
  const openDocument = useCallback((doc: Document) => {
    setSelectedDocument(doc);
  }, []);
  
  return { documents, selectedDocument, openDocument, ... };
}
```

**Caractéristiques:**
- Custom hooks React
- Gestion de l'état avec useState
- Fonctions métier avec useCallback
- Pas de JSX, uniquement de la logique

### 3. Context (État Global)

**Responsabilité:** Centraliser tous les contrôleurs et les exposer aux vues.

```typescript
// AppContext.tsx
export function AppProvider({ children }: { children: ReactNode }) {
  const navigation = useNavigationController();
  const documents = useDocumentController();
  const users = useUserController();
  
  const value = { navigation, documents, users, ... };
  
  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp(): AppContextType {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
```

**Caractéristiques:**
- Context API React
- Hook personnalisé useApp()
- Centralisation de l'état
- Pont entre contrôleurs et vues

### 4. Views (Vues)

**Responsabilité:** Afficher l'interface utilisateur et gérer les interactions.

```typescript
// Dashboard.tsx
export const Dashboard: React.FC = () => {
  const { stats, documents } = useApp();
  const { openDocument } = documents;
  
  return (
    <div>
      <StatCard value={stats.totalDocuments} />
      {documents.documents.map(doc => (
        <DocumentRow doc={doc} onSelect={openDocument} />
      ))}
    </div>
  );
};
```

**Caractéristiques:**
- Composants React fonctionnels
- Utilisation du hook useApp()
- Pas de logique métier
- Focus sur l'UI et l'UX

## 🔄 Flux de Données

### Lecture de Données
```
User Action → View → useApp() → Controller → Model → Controller → View → UI Update
```

### Modification de Données
```
User Action → View → Controller Function → setState → Context Update → View Re-render
```

### Exemple Concret: Ouvrir un Document

1. **User** clique sur un document
2. **View** (DocumentRow) appelle `onSelect(doc)`
3. **Controller** (DocumentController) exécute `openDocument(doc)`
4. **State** `selectedDocument` est mis à jour
5. **Context** propage le changement
6. **View** (DocumentModal) se re-render avec le document

## 🎨 Patterns Utilisés

### 1. Custom Hooks Pattern
```typescript
// Encapsulation de la logique dans des hooks
function useDocumentController() {
  // Logique métier
  return { documents, openDocument, ... };
}
```

### 2. Context Provider Pattern
```typescript
// Centralisation de l'état global
<AppProvider>
  <App />
</AppProvider>
```

### 3. Composition Pattern
```typescript
// Composition de composants
<Dashboard>
  <StatCard />
  <DocumentRow />
  <Alert />
</Dashboard>
```

### 4. Render Props Pattern (implicite)
```typescript
// Passage de fonctions comme props
<DocumentRow doc={doc} onSelect={openDocument} />
```

## 🔐 Gestion de l'État

### État Local (useState)
- État spécifique à un composant
- Exemple: état d'un formulaire

### État Global (Context)
- État partagé entre plusieurs composants
- Exemple: utilisateur connecté, documents

### État Serveur (futur)
- Données provenant de l'API
- Exemple: React Query, SWR

## 🚀 Performance

### Optimisations Appliquées

1. **useCallback** pour mémoriser les fonctions
```typescript
const openDocument = useCallback((doc: Document) => {
  setSelectedDocument(doc);
}, []);
```

2. **React.memo** pour éviter les re-renders inutiles (à ajouter si nécessaire)
```typescript
export const DocumentRow = React.memo<Props>(({ doc, onSelect }) => {
  // ...
});
```

3. **Lazy Loading** des pages (à implémenter)
```typescript
const Dashboard = lazy(() => import('./views/pages/Dashboard'));
```

## 🔄 Évolution Future

### Phase 1: Backend Integration
```
Models → API Calls → Backend
```

### Phase 2: State Management
```
Context → Redux/Zustand → Optimized State
```

### Phase 3: Real-time
```
WebSocket → Real-time Updates → UI
```

## 📊 Diagramme de Séquence

### Exemple: Suppression d'un Document

```
User                View              Controller         Model
 |                   |                    |               |
 |-- Click Delete -->|                    |               |
 |                   |-- deleteDocument ->|               |
 |                   |                    |-- filter ---->|
 |                   |                    |<-- updated ---|
 |                   |<-- state update ---|               |
 |<-- UI update -----|                    |               |
```

## 🎓 Principes Appliqués

### SOLID Principles

- **S**ingle Responsibility: Chaque module a une seule responsabilité
- **O**pen/Closed: Extensible sans modification
- **L**iskov Substitution: Types interchangeables
- **I**nterface Segregation: Interfaces spécifiques
- **D**ependency Inversion: Dépendance aux abstractions

### DRY (Don't Repeat Yourself)
- Fonctions utilitaires réutilisables
- Composants génériques

### KISS (Keep It Simple, Stupid)
- Code simple et lisible
- Pas de sur-ingénierie

## 📚 Ressources

- [React Architecture Best Practices](https://react.dev/learn/thinking-in-react)
- [MVC Pattern](https://en.wikipedia.org/wiki/Model%E2%80%93view%E2%80%93controller)
- [React Context API](https://react.dev/reference/react/useContext)
- [Custom Hooks](https://react.dev/learn/reusing-logic-with-custom-hooks)

---

**Note:** Cette architecture est évolutive et peut être adaptée selon les besoins du projet.
