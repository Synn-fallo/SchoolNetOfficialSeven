import React from 'react';
import { Filter, Users, Building2, Landmark, Handshake } from 'lucide-react';
import { DemandeRole, FilterType, RoleFilterType } from '@/hooks/useAdminDemandes';
import DemandeCard from './DemandeCard';

interface DemandeListProps {
  demandes: DemandeRole[];
  loading: boolean;
  error: string | null;
  statutFilter: FilterType;
  setStatutFilter: (filter: FilterType) => void;
  roleFilter: RoleFilterType;
  setRoleFilter: (filter: RoleFilterType) => void;
  onDemandePress: (demande: DemandeRole) => void;
  onRefresh?: () => void;
}

const STATUT_FILTERS: { value: FilterType; label: string }[] = [
  { value: 'en_attente', label: 'En attente' },
  { value: 'valide', label: 'Validé' },
  { value: 'rejete', label: 'Rejeté' },
  { value: 'toutes', label: 'Toutes' },
];

const ROLE_FILTERS: { value: RoleFilterType; label: string; icon: any }[] = [
  { value: 'tous', label: 'Tous', icon: Users },
  { value: 'chef_etablissement', label: 'Chef', icon: Building2 },
  { value: 'autorite', label: 'Autorité', icon: Landmark },
  { value: 'partenaire', label: 'Partenaire', icon: Handshake },
];

export default function DemandeList({
  demandes,
  loading,
  error,
  statutFilter,
  setStatutFilter,
  roleFilter,
  setRoleFilter,
  onDemandePress,
  onRefresh,
}: DemandeListProps) {
  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center py-12">
        <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center py-12 px-6">
        <p className="text-sm text-red-500 text-center mb-4">{error}</p>
        {onRefresh && (
          <button
            onClick={onRefresh}
            className="px-5 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
          >
            Réessayer
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="flex-1 bg-slate-50">
      {/* Filtres par statut */}
      <div className="bg-white py-3 border-b border-slate-200 overflow-x-auto">
        <div className="flex gap-2 px-4">
          {STATUT_FILTERS.map((filter) => (
            <button
              key={filter.value}
              onClick={() => setStatutFilter(filter.value)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-colors whitespace-nowrap ${
                statutFilter === filter.value
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </div>

      {/* Filtres par rôle */}
      <div className="flex gap-3 bg-white px-4 py-3 border-b border-slate-200 overflow-x-auto">
        {ROLE_FILTERS.map((filter) => {
          const Icon = filter.icon;
          const isActive = roleFilter === filter.value;
          return (
            <button
              key={filter.value}
              onClick={() => setRoleFilter(filter.value)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors whitespace-nowrap ${
                isActive
                  ? 'bg-blue-50 text-blue-600'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              <span>{filter.label}</span>
            </button>
          );
        })}
      </div>

      {/* Liste des demandes */}
      <div className="p-4 overflow-y-auto">
        {demandes.length === 0 ? (
          <div className="flex items-center justify-center py-12">
            <p className="text-sm text-slate-400">Aucune demande trouvée</p>
          </div>
        ) : (
          demandes.map((demande) => (
            <DemandeCard
              key={demande.id}
              demande={demande}
              onPress={() => onDemandePress(demande)}
            />
          ))
        )}
      </div>
    </div>
  );
}
