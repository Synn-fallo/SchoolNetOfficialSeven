import { useState, useMemo } from 'react';

export interface Nomination {
  id: string;
  type_admin: string;
  is_active: boolean;
  [key: string]: any;
}

export interface NominationFilters {
  type: string;
  status: string;
}

export function useNominationFilters(nominations: Nomination[]) {
  const [filters, setFilters] = useState<NominationFilters>({
    type: '',
    status: '',
  });

  const updateFilter = (key: keyof NominationFilters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearAllFilters = () => {
    setFilters({ type: '', status: '' });
  };

  const filteredNominations = useMemo(() => {
    return nominations.filter(nom => {
      // Filtre par type
      if (filters.type && nom.type_admin !== filters.type) {
        return false;
      }

      // Filtre par statut
      if (filters.status) {
        if (filters.status === 'active' && !nom.is_active) return false;
        if (filters.status === 'inactive' && nom.is_active) return false;
      }

      return true;
    });
  }, [nominations, filters]);

  return {
    filters,
    setFilters,
    updateFilter,
    clearAllFilters,
    filteredNominations,
  };
}
