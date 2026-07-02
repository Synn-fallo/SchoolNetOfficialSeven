// /src/components/etablissement/EtablissementSearchModal.tsx
// Modal de recherche d'établissement

import React, { useState, useEffect } from 'react';
import { X, Search, Filter, Building2, MapPin } from 'lucide-react';
import { useEtablissementSearch, EtablissementResult } from '@/hooks/useEtablissementSearch';
import { useRegions, Region } from '@/hooks/useRegions';
import { useDepartements, Departement } from '@/hooks/useDepartements';
import { Portal } from '@/components/ui/Portal';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';

interface EtablissementSearchModalProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (etablissement: { id: string; nom: string; ville?: string | null }) => void;
}

export default function EtablissementSearchModal({
  visible,
  onClose,
  onSelect,
}: EtablissementSearchModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedVille, setSelectedVille] = useState<string>('');
  const [selectedType, setSelectedType] = useState<string>('');
  const [selectedRegionId, setSelectedRegionId] = useState<string>('');
  const [selectedDepartementId, setSelectedDepartementId] = useState<string>('');
  const [villes, setVilles] = useState<string[]>([]);
  const [types, setTypes] = useState<string[]>([]);
  const [loadingFilters, setLoadingFilters] = useState(false);

  const { regions } = useRegions();
  const { departements } = useDepartements(selectedRegionId || undefined);
  const { loading, results, searchEtablissements, getVillesDisponibles, getTypesDisponibles } = useEtablissementSearch();

  if (!visible) return null;

  useEffect(() => {
    if (visible) {
      loadFilters();
    }
  }, [visible]);

  useEffect(() => {
    const timer = setTimeout(() => {
      performSearch();
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery, selectedVille, selectedType, selectedRegionId, selectedDepartementId]);

  const loadFilters = async () => {
    setLoadingFilters(true);
    const [villesList, typesList] = await Promise.all([
      getVillesDisponibles(),
      getTypesDisponibles(),
    ]);
    setVilles(villesList);
    setTypes(typesList);
    setLoadingFilters(false);
  };

  const performSearch = () => {
    searchEtablissements(searchQuery, {
      ville: selectedVille || undefined,
      type: selectedType || undefined,
      regionId: selectedRegionId || undefined,
      departementId: selectedDepartementId || undefined,
    });
  };

  const handleSelect = (item: EtablissementResult) => {
    onSelect({ id: item.id, nom: item.nom, ville: item.ville });
    onClose();
  };

  const resetFilters = () => {
    setSelectedVille('');
    setSelectedType('');
    setSelectedRegionId('');
    setSelectedDepartementId('');
    setSearchQuery('');
  };

  return (
    <Portal>
      <div 
        className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <div 
          className="bg-white rounded-2xl w-full max-w-lg max-h-[85vh] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* En-tête */}
          <div className="flex flex-row justify-between items-center px-5 py-4 border-b border-gray-200">
            <h3 className="text-xl font-bold text-gray-800">Rechercher un établissement</h3>
            <button
              onClick={onClose}
              className="p-1 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* Recherche */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex flex-row items-center gap-2 bg-gray-50 rounded-xl px-3 py-2.5 border border-gray-200">
              <Search className="w-4 h-4 text-gray-400" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Nom de l'établissement..."
                className="border-0 bg-transparent p-0 text-sm focus:ring-0 flex-1"
              />
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="p-1 hover:bg-gray-200 rounded-md transition-colors"
              >
                <Filter className="w-4 h-4 text-gray-400" />
              </button>
            </div>

            {/* Filtres */}
            {showFilters && (
              <div className="mt-3 space-y-3">
                {/* Région */}
                {regions.length > 0 && (
                  <div>
                    <p className="text-xs font-medium text-gray-500 mb-1.5">Région :</p>
                    <div className="flex flex-row flex-wrap gap-1.5">
                      {regions.map((region) => (
                        <button
                          key={region.id}
                          onClick={() => {
                            setSelectedRegionId(selectedRegionId === region.id ? '' : region.id);
                            setSelectedDepartementId('');
                          }}
                          className={`px-3 py-1 rounded-full text-xs transition-colors ${
                            selectedRegionId === region.id
                              ? 'bg-schoolnet-primary text-white'
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          }`}
                        >
                          {region.nom}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Département */}
                {departements.length > 0 && (
                  <div>
                    <p className="text-xs font-medium text-gray-500 mb-1.5">Département :</p>
                    <div className="flex flex-row flex-wrap gap-1.5">
                      {departements.map((departement) => (
                        <button
                          key={departement.id}
                          onClick={() => setSelectedDepartementId(selectedDepartementId === departement.id ? '' : departement.id)}
                          className={`px-3 py-1 rounded-full text-xs transition-colors ${
                            selectedDepartementId === departement.id
                              ? 'bg-schoolnet-primary text-white'
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          }`}
                        >
                          {departement.nom}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Ville */}
                {villes.length > 0 && (
                  <div>
                    <p className="text-xs font-medium text-gray-500 mb-1.5">Ville :</p>
                    <div className="flex flex-row flex-wrap gap-1.5">
                      {villes.map((ville) => (
                        <button
                          key={ville}
                          onClick={() => setSelectedVille(selectedVille === ville ? '' : ville)}
                          className={`px-3 py-1 rounded-full text-xs transition-colors ${
                            selectedVille === ville
                              ? 'bg-schoolnet-primary text-white'
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          }`}
                        >
                          {ville}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Type */}
                {types.length > 0 && (
                  <div>
                    <p className="text-xs font-medium text-gray-500 mb-1.5">Type :</p>
                    <div className="flex flex-row flex-wrap gap-1.5">
                      {types.map((type) => (
                        <button
                          key={type}
                          onClick={() => setSelectedType(selectedType === type ? '' : type)}
                          className={`px-3 py-1 rounded-full text-xs transition-colors ${
                            selectedType === type
                              ? 'bg-schoolnet-primary text-white'
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          }`}
                        >
                          {type === 'public' ? 'Public' : type === 'prive' ? 'Privé' : type}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <button
                  onClick={resetFilters}
                  className="text-xs text-red-500 font-medium hover:underline"
                >
                  Réinitialiser
                </button>
              </div>
            )}
          </div>

          {/* Résultats */}
          <div className="p-3 overflow-y-auto max-h-[50vh]">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-8">
                <div className="w-8 h-8 border-4 border-schoolnet-primary border-t-transparent rounded-full animate-spin" />
                <p className="mt-3 text-sm text-gray-500">Recherche en cours...</p>
              </div>
            ) : results.length === 0 ? (
              searchQuery ? (
                <div className="text-center py-8">
                  <p className="text-sm text-gray-400">Aucun établissement trouvé</p>
                  <p className="text-xs text-gray-400 mt-1">
                    Vous pouvez créer une classe sans établissement, ou{' '}
                    <button className="text-schoolnet-primary font-medium hover:underline">
                      saisir manuellement le nom
                    </button>
                  </p>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-sm text-gray-400">Saisissez un nom pour rechercher</p>
                </div>
              )
            ) : (
              results.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleSelect(item)}
                  className="w-full flex flex-row items-center gap-3 p-3 bg-white rounded-xl border border-gray-200 mb-2 hover:shadow-md transition-shadow text-left"
                >
                  <Building2 className="w-5 h-5 text-schoolnet-primary flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-gray-800">{item.nom}</p>
                    <div className="flex flex-row items-center gap-3 mt-0.5">
                      {item.ville && (
                        <span className="flex flex-row items-center gap-1 text-xs text-gray-500">
                          <MapPin className="w-3 h-3" />
                          {item.ville}
                        </span>
                      )}
                      {item.type_etablissement && (
                        <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                          {item.type_etablissement === 'public' ? 'Public' : 'Privé'}
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      </div>
    </Portal>
  );
}
