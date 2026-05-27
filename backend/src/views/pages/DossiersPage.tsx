import React, { useState, useEffect, useCallback } from 'react';
import {
  Folder, FolderOpen, FolderPlus, ChevronRight, ChevronDown,
  MoreVertical, Pencil, Trash2, FileText, Plus, X, Check,
  Search, FolderX, Upload, Link
} from 'lucide-react';
import { apiService } from '../../services/ApiService';
import { AddDocumentModal } from '../components/AddDocumentModal';

interface Dossier {
  id: number;
  nom: string;
  description?: string;
  parent_id: number | null;
  couleur: string;
  created_by_nom: string;
  created_at: string;
  nb_documents: number;
}

interface DocItem {
  id: number;
  titre: string;
  reference: string;
  type: string;
  fichier_nom: string;
  created_at: string;
  statut: string;
}

const COULEURS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16'];

// Nœud de l'arborescence
const DossierNode: React.FC<{
  dossier: Dossier;
  children: Dossier[];
  allDossiers: Dossier[];
  selected: number | null;
  onSelect: (d: Dossier) => void;
  onEdit: (d: Dossier) => void;
  onDelete: (d: Dossier) => void;
  onAddChild: (parentId: number) => void;
  depth?: number;
}> = ({ dossier, children, allDossiers, selected, onSelect, onEdit, onDelete, onAddChild, depth = 0 }) => {
  const [open, setOpen] = useState(depth === 0);
  const [menuOpen, setMenuOpen] = useState(false);
  const isSelected = selected === dossier.id;

  return (
    <div>
      <div
        className={`group flex items-center gap-1 px-2 py-1.5 rounded-lg cursor-pointer transition-colors ${
          isSelected ? 'bg-emerald-100 text-emerald-800' : 'hover:bg-slate-100'
        }`}
        style={{ paddingLeft: `${8 + depth * 16}px` }}
        onClick={() => { onSelect(dossier); setOpen(true); }}
      >
        <button
          onClick={(e) => { e.stopPropagation(); setOpen(!open); }}
          className="p-0.5 rounded hover:bg-slate-200"
        >
          {children.length > 0
            ? open ? <ChevronDown size={14} /> : <ChevronRight size={14} />
            : <span className="w-[18px]" />}
        </button>

        {open && children.length > 0
          ? <FolderOpen size={18} style={{ color: dossier.couleur }} />
          : <Folder size={18} style={{ color: dossier.couleur }} />}

        <span className="flex-1 text-sm font-medium truncate ml-1">{dossier.nom}</span>

        {dossier.nb_documents > 0 && (
          <span className="text-xs bg-slate-200 text-slate-600 px-1.5 py-0.5 rounded-full">
            {dossier.nb_documents}
          </span>
        )}

        <div className="relative opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={(e) => { e.stopPropagation(); setMenuOpen(!menuOpen); }}
            className="p-1 rounded hover:bg-slate-200"
          >
            <MoreVertical size={14} />
          </button>
          {menuOpen && (
            <div
              className="absolute right-0 top-6 bg-white border border-slate-200 rounded-lg shadow-lg z-20 w-44 py-1"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => { onAddChild(dossier.id); setMenuOpen(false); }}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-slate-50"
              >
                <FolderPlus size={14} className="text-emerald-600" /> Sous-dossier
              </button>
              <button
                onClick={() => { onEdit(dossier); setMenuOpen(false); }}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-slate-50"
              >
                <Pencil size={14} className="text-blue-600" /> Renommer
              </button>
              <button
                onClick={() => { onDelete(dossier); setMenuOpen(false); }}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-slate-50 text-red-600"
              >
                <Trash2 size={14} /> Supprimer
              </button>
            </div>
          )}
        </div>
      </div>

      {open && children.map(child => (
        <DossierNode
          key={child.id}
          dossier={child}
          children={allDossiers.filter(d => d.parent_id === child.id)}
          allDossiers={allDossiers}
          selected={selected}
          onSelect={onSelect}
          onEdit={onEdit}
          onDelete={onDelete}
          onAddChild={onAddChild}
          depth={depth + 1}
        />
      ))}
    </div>
  );
};

// Modal création/édition dossier
const DossierModal: React.FC<{
  initial?: Dossier | null;
  parentId?: number | null;
  onSave: (data: { nom: string; description: string; couleur: string }) => void;
  onClose: () => void;
}> = ({ initial, parentId, onSave, onClose }) => {
  const [nom, setNom] = useState(initial?.nom || '');
  const [description, setDescription] = useState(initial?.description || '');
  const [couleur, setCouleur] = useState(initial?.couleur || '#10b981');

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg font-bold text-slate-800">
            {initial ? 'Modifier le dossier' : parentId ? 'Nouveau sous-dossier' : 'Nouveau dossier'}
          </h3>
          <button onClick={onClose} className="p-1 hover:bg-slate-100 rounded"><X size={18} /></button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Nom *</label>
            <input
              autoFocus
              value={nom}
              onChange={e => setNom(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              placeholder="Nom du dossier"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              rows={2}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
              placeholder="Description optionnelle"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Couleur</label>
            <div className="flex gap-2">
              {COULEURS.map(c => (
                <button
                  key={c}
                  onClick={() => setCouleur(c)}
                  className={`w-7 h-7 rounded-full transition-transform ${couleur === c ? 'scale-125 ring-2 ring-offset-1 ring-slate-400' : 'hover:scale-110'}`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button onClick={onClose} className="flex-1 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50">
            Annuler
          </button>
          <button
            onClick={() => nom.trim() && onSave({ nom: nom.trim(), description, couleur })}
            disabled={!nom.trim()}
            className="flex-1 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <Check size={16} /> {initial ? 'Enregistrer' : 'Créer'}
          </button>
        </div>
      </div>
    </div>
  );
};

export const DossiersPage: React.FC = () => {
  const [dossiers, setDossiers] = useState<Dossier[]>([]);
  const [selectedDossier, setSelectedDossier] = useState<Dossier | null>(null);
  const [docsInDossier, setDocsInDossier] = useState<DocItem[]>([]);
  const [allDocs, setAllDocs] = useState<DocItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [docsLoading, setDocsLoading] = useState(false);

  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Dossier | null>(null);
  const [newParentId, setNewParentId] = useState<number | null>(null);

  const [deleteTarget, setDeleteTarget] = useState<Dossier | null>(null);
  const [addDocSearch, setAddDocSearch] = useState('');
  const [showAddDoc, setShowAddDoc] = useState(false);
  const [showImportDoc, setShowImportDoc] = useState(false);
  const [showLierDoc, setShowLierDoc] = useState(false);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const data = await apiService.getDossiers() as Dossier[];
      setDossiers(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    if (!selectedDossier) return;
    const fetchDocs = async () => {
      setDocsLoading(true);
      try {
        const docs = await apiService.getDossierDocuments(selectedDossier.id) as DocItem[];
        setDocsInDossier(docs);
      } catch (e) { console.error(e); }
      finally { setDocsLoading(false); }
    };
    fetchDocs();
  }, [selectedDossier]);

  useEffect(() => {
    if (!showLierDoc) return;
    apiService.getDocuments().then(d => setAllDocs(d as DocItem[])).catch(console.error);
  }, [showLierDoc]);

  const handleCreate = async (data: { nom: string; description: string; couleur: string }) => {
    await apiService.createDossier({ ...data, parent_id: newParentId });
    setModalOpen(false);
    setNewParentId(null);
    load();
  };

  const handleEdit = async (data: { nom: string; description: string; couleur: string }) => {
    if (!editTarget) return;
    await apiService.updateDossier(editTarget.id, data);
    setEditTarget(null);
    setModalOpen(false);
    load();
    if (selectedDossier?.id === editTarget.id) {
      setSelectedDossier(prev => prev ? { ...prev, ...data } : null);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    await apiService.deleteDossier(deleteTarget.id);
    setDeleteTarget(null);
    if (selectedDossier?.id === deleteTarget.id) setSelectedDossier(null);
    load();
  };

  const handleAddDoc = async (docId: number) => {
    if (!selectedDossier) return;
    await apiService.addDocumentToDossier(selectedDossier.id, docId);
    const docs = await apiService.getDossierDocuments(selectedDossier.id) as DocItem[];
    setDocsInDossier(docs);
    load();
  };

  const handleRemoveDoc = async (docId: number) => {
    if (!selectedDossier) return;
    await apiService.removeDocumentFromDossier(selectedDossier.id, docId);
    setDocsInDossier(prev => prev.filter(d => d.id !== docId));
    load();
  };

  const rootDossiers = dossiers.filter(d => d.parent_id === null);
  const alreadyInDossier = new Set(docsInDossier.map(d => d.id));
  const filteredAllDocs = (allDocs as any[]).filter((d: any) =>
    !alreadyInDossier.has(d.id) &&
    (d.titre || d.title || '').toLowerCase().includes(addDocSearch.toLowerCase())
  );

  return (
    <div className="flex h-full gap-6">
      {/* Panneau gauche — arborescence */}
      <div className="w-72 shrink-0 bg-white rounded-xl border border-slate-200 flex flex-col">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          <h3 className="font-semibold text-slate-800 flex items-center gap-2">
            <Folder size={18} className="text-emerald-600" /> Dossiers
          </h3>
          <button
            onClick={() => { setEditTarget(null); setNewParentId(null); setModalOpen(true); }}
            className="p-1.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
            title="Nouveau dossier racine"
          >
            <FolderPlus size={16} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-2">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600" />
            </div>
          ) : rootDossiers.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <FolderX size={40} className="mx-auto mb-2 opacity-40" />
              <p className="text-sm">Aucun dossier</p>
              <button
                onClick={() => { setEditTarget(null); setNewParentId(null); setModalOpen(true); }}
                className="mt-3 text-xs text-emerald-600 hover:underline"
              >
                Créer le premier dossier
              </button>
            </div>
          ) : (
            rootDossiers.map(d => (
              <DossierNode
                key={d.id}
                dossier={d}
                children={dossiers.filter(c => c.parent_id === d.id)}
                allDossiers={dossiers}
                selected={selectedDossier?.id ?? null}
                onSelect={setSelectedDossier}
                onEdit={d => { setEditTarget(d); setModalOpen(true); }}
                onDelete={setDeleteTarget}
                onAddChild={pid => { setEditTarget(null); setNewParentId(pid); setModalOpen(true); }}
              />
            ))
          )}
        </div>
      </div>

      {/* Panneau droit — contenu du dossier */}
      <div className="flex-1 bg-white rounded-xl border border-slate-200 flex flex-col overflow-hidden">
        {!selectedDossier ? (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
            <FolderOpen size={56} className="mb-4 opacity-30" />
            <p className="text-lg font-medium">Sélectionnez un dossier</p>
            <p className="text-sm mt-1">Cliquez sur un dossier pour voir son contenu</p>
          </div>
        ) : (
          <>
            {/* En-tête dossier */}
            <div className="p-5 border-b border-slate-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: selectedDossier.couleur + '22' }}>
                    <FolderOpen size={22} style={{ color: selectedDossier.couleur }} />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-slate-800">{selectedDossier.nom}</h2>
                    {selectedDossier.description && (
                      <p className="text-sm text-slate-500">{selectedDossier.description}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-slate-500">{docsInDossier.length} document{docsInDossier.length !== 1 ? 's' : ''}</span>
                  <button
                    onClick={() => setShowLierDoc(true)}
                    className="flex items-center gap-2 px-3 py-2 border border-emerald-600 text-emerald-600 rounded-lg hover:bg-emerald-50 text-sm transition-colors"
                  >
                    <Link size={16} /> Lier un existant
                  </button>
                  <button
                    onClick={() => setShowImportDoc(true)}
                    className="flex items-center gap-2 px-3 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 text-sm transition-colors"
                  >
                    <Upload size={16} /> Importer un document
                  </button>
                </div>
              </div>
            </div>

            {/* Liste des documents */}
            <div className="flex-1 overflow-y-auto p-4">
              {docsLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600" />
                </div>
              ) : docsInDossier.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-slate-400">
                  <FileText size={48} className="mb-3 opacity-30" />
                  <p className="font-medium">Dossier vide</p>
                  <p className="text-sm mt-1">Importez ou liez des documents à ce dossier</p>
                  <div className="flex gap-2 mt-4">
                    <button
                      onClick={() => setShowLierDoc(true)}
                      className="flex items-center gap-2 px-4 py-2 border border-emerald-600 text-emerald-600 rounded-lg hover:bg-emerald-50 text-sm"
                    >
                      <Link size={16} /> Lier un existant
                    </button>
                    <button
                      onClick={() => setShowImportDoc(true)}
                      className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 text-sm"
                    >
                      <Upload size={16} /> Importer
                    </button>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-2">
                  {docsInDossier.map(doc => (
                    <div key={doc.id} className="flex items-center gap-3 p-3 border border-slate-200 rounded-lg hover:bg-slate-50 group transition-colors">
                      <div className="w-9 h-9 bg-blue-50 rounded-lg flex items-center justify-center shrink-0">
                        <FileText size={18} className="text-blue-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-slate-800 truncate text-sm">{doc.titre}</p>
                        <p className="text-xs text-slate-500">{doc.reference} · {doc.type}</p>
                      </div>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        doc.statut === 'valide' ? 'bg-green-100 text-green-700' :
                        doc.statut === 'en_attente' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-slate-100 text-slate-600'
                      }`}>
                        {doc.statut === 'valide' ? 'Validé' : doc.statut === 'en_attente' ? 'En attente' : doc.statut}
                      </span>
                      <button
                        onClick={() => handleRemoveDoc(doc.id)}
                        className="p-1.5 opacity-0 group-hover:opacity-100 hover:bg-red-100 rounded-lg transition-all"
                        title="Retirer du dossier"
                      >
                        <X size={14} className="text-red-500" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* Modal création/édition */}
      {modalOpen && (
        <DossierModal
          initial={editTarget}
          parentId={newParentId}
          onSave={editTarget ? handleEdit : handleCreate}
          onClose={() => { setModalOpen(false); setEditTarget(null); setNewParentId(null); }}
        />
      )}

      {/* Modal confirmation suppression */}
      {deleteTarget && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-sm shadow-xl">
            <h3 className="text-lg font-bold text-slate-800 mb-2">Supprimer le dossier</h3>
            <p className="text-slate-600 text-sm mb-5">
              Supprimer <strong>"{deleteTarget.nom}"</strong> ? Les documents ne seront pas supprimés, seulement retirés du dossier.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteTarget(null)} className="flex-1 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50">
                Annuler
              </button>
              <button onClick={handleDelete} className="flex-1 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal import document → lié automatiquement au dossier */}
      {showImportDoc && selectedDossier && (
        <AddDocumentModal
          dossierId={selectedDossier.id}
          onClose={() => setShowImportDoc(false)}
          onSuccess={async () => {
            const docs = await apiService.getDossierDocuments(selectedDossier.id) as DocItem[];
            setDocsInDossier(docs);
            load();
          }}
        />
      )}

      {/* Modal lier un document existant */}
      {showLierDoc && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg flex flex-col max-h-[70vh]">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-800">Lier un document existant</h3>
                <p className="text-xs text-slate-500 mt-0.5">Sélectionnez un document déjà importé dans la plateforme</p>
              </div>
              <button onClick={() => { setShowLierDoc(false); setAddDocSearch(''); }} className="p-1 hover:bg-slate-100 rounded">
                <X size={18} />
              </button>
            </div>
            <div className="p-3 border-b border-slate-100">
              <div className="flex items-center gap-2 px-3 py-2 border border-slate-300 rounded-lg">
                <Search size={16} className="text-slate-400" />
                <input
                  autoFocus
                  value={addDocSearch}
                  onChange={e => setAddDocSearch(e.target.value)}
                  placeholder="Rechercher par titre..."
                  className="flex-1 outline-none text-sm"
                />
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-3 space-y-1">
              {filteredAllDocs.length === 0 ? (
                <p className="text-center text-slate-400 py-8 text-sm">Aucun document disponible</p>
              ) : (
                filteredAllDocs.map((doc: any) => (
                  <button
                    key={doc.id}
                    onClick={() => { handleAddDoc(doc.id); setShowLierDoc(false); setAddDocSearch(''); }}
                    className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-emerald-50 text-left transition-colors"
                  >
                    <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center shrink-0">
                      <FileText size={16} className="text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-800 truncate">{doc.titre || doc.title}</p>
                      <p className="text-xs text-slate-500">{doc.reference} · {doc.type}</p>
                    </div>
                    <Link size={16} className="text-emerald-600 shrink-0" />
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
