// ============================================================
// CONTROLLER : SearchController
// Responsabilité : logique de la recherche avancée
// ============================================================

import { useState, useCallback } from 'react';
import type { SearchResult } from '../models/Document';
import { MOCK_SEARCH_RESULTS } from '../models/Document';

export interface SearchFilters {
  keywords: string;
  type: string;
  period: string;
  confidentiality: string;
}

const INITIAL_FILTERS: SearchFilters = {
  keywords: '',
  type: 'Tous les types',
  period: 'Toutes les dates',
  confidentiality: 'Tous les niveaux',
};

export function useSearchController() {
  const [filters,  setFilters]  = useState<SearchFilters>(INITIAL_FILTERS);
  const [results,  setResults]  = useState<SearchResult[]>(MOCK_SEARCH_RESULTS);
  const [loading,  setLoading]  = useState(false);

  const updateFilter = useCallback(<K extends keyof SearchFilters>(key: K, value: SearchFilters[K]) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  }, []);

  /** Simulation d'une recherche asynchrone */
  const search = useCallback(async () => {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 400)); // simule un appel réseau
    const filtered = MOCK_SEARCH_RESULTS.filter((r) =>
      !filters.keywords || r.title.toLowerCase().includes(filters.keywords.toLowerCase())
    );
    setResults(filtered);
    setLoading(false);
  }, [filters]);

  const reset = useCallback(() => {
    setFilters(INITIAL_FILTERS);
    setResults(MOCK_SEARCH_RESULTS);
  }, []);

  return { filters, results, loading, updateFilter, search, reset };
}
