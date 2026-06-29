import React from 'react';
import { Filter, X } from 'lucide-react';

export interface FilterOption {
  id: string;
  label: string;
  value: string;
}

export interface FilterGroup {
  id: string;
  label: string;
  options: FilterOption[];
}

interface FilterBarProps {
  groups?: FilterGroup[];
  activeFilters?: Record<string, string>;
  onFilterChange: (groupId: string, value: string) => void;
  onClearAll?: () => void;
  showClearAll?: boolean;
}

export default function FilterBar({
  groups = [],
  activeFilters = {},
  onFilterChange,
  onClearAll,
  showClearAll = true,
}: FilterBarProps) {
  // ✅ Vérification que activeFilters existe avant d'utiliser Object.values
  const hasActiveFilters = activeFilters && Object.values(activeFilters).some(v => v !== '');

  const handleClearAll = () => {
    if (onClearAll) {
      onClearAll();
    }
  };

  // ✅ Si groups est vide, ne pas afficher le composant
  if (!groups || groups.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-2xl p-4 mb-6 border border-slate-150 shadow-sm flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-slate-500" />
          <span className="text-xs font-extrabold text-slate-700 uppercase tracking-wider">Filtres</span>
        </div>
        {showClearAll && hasActiveFilters && (
          <button
            onClick={handleClearAll}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-extrabold text-blue-600 hover:text-blue-700 hover:bg-blue-50 transition-colors cursor-pointer"
          >
            <X className="h-3.5 w-3.5" />
            <span>Tout effacer</span>
          </button>
        )}
      </div>

      {/* Filter Groups & Scroll Container */}
      <div className="flex flex-col md:flex-row gap-5 overflow-x-auto pb-1 scrollbar-thin">
        {groups.map((group) => (
          <div key={group.id} className="flex flex-col gap-2 shrink-0">
            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wide">
              {group.label}
            </span>
            <div className="flex flex-wrap gap-2">
              {group.options.map((option) => {
                const isActive = activeFilters && activeFilters[group.id] === option.value;
                return (
                  <button
                    key={option.id}
                    onClick={() => onFilterChange(group.id, isActive ? '' : option.value)}
                    className={`
                      px-3.5 py-1.5 rounded-full text-xs font-bold border transition-all cursor-pointer select-none focus:outline-none
                      ${isActive
                        ? 'bg-blue-50 border-blue-200 text-blue-600 font-extrabold'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100 hover:border-slate-300'}
                    `}
                  >
                    {option.label}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
