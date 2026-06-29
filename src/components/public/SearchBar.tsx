import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Search, Filter, X } from 'lucide-react';

interface SearchBarProps {
  onSearch: (query: string) => void;
  placeholder?: string;
  value: string;
  loading?: boolean;
  showFilters?: boolean;
  onFilterPress?: () => void;
}

export default function SearchBar({
  onSearch,
  placeholder = "Rechercher...",
  value,
  loading = false,
  showFilters = false,
  onFilterPress,
}: SearchBarProps) {
  // État local pour une saisie fluide (pas de debouncing sur l'affichage)
  const [localValue, setLocalValue] = useState(value);
  const timeoutRef = useRef<NodeJS.Timeout>();

  // Synchroniser l'état local avec la prop value (quand value change de l'extérieur)
  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const handleChange = useCallback((text: string) => {
    // Mettre à jour l'affichage immédiatement (sans délai)
    setLocalValue(text);
    
    // Debouncing UNIQUEMENT pour l'appel API
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    timeoutRef.current = setTimeout(() => {
      onSearch(text);
    }, 300);
  }, [onSearch]);

  const clearSearch = () => {
    setLocalValue("");
    onSearch("");
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return (
    <div className="flex items-center gap-2 w-full">
      <div className="flex-1 flex items-center bg-slate-50 rounded-lg border border-slate-200 px-3 h-[42px] transition-all focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-500">
        <Search className="h-4 w-4 text-slate-400 mr-2 flex-shrink-0" />
        <input
          type="text"
          className="flex-1 bg-transparent text-sm text-slate-800 placeholder:text-slate-400 outline-none h-full"
          placeholder={placeholder}
          value={localValue}
          onChange={(e) => handleChange(e.target.value)}
        />
        {loading && (
          <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin ml-2 flex-shrink-0" />
        )}
        {!loading && localValue.length > 0 && (
          <button
            onClick={clearSearch}
            className="p-1 rounded hover:bg-slate-200 transition-colors flex-shrink-0"
            aria-label="Effacer la recherche"
          >
            <X className="h-4 w-4 text-slate-400" />
          </button>
        )}
      </div>
      {showFilters && onFilterPress && (
        <button
          onClick={onFilterPress}
          className="w-[42px] h-[42px] flex items-center justify-center bg-slate-50 rounded-lg border border-slate-200 hover:bg-slate-100 transition-colors flex-shrink-0"
          aria-label="Filtres"
        >
          <Filter className="h-4 w-4 text-slate-500" />
        </button>
      )}
    </div>
  );
}
