import React, { useState, useCallback, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { Building2, ArrowRight, X } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useEtablissementsPublic } from "@/hooks/useEtablissementsPublic";
import SearchBar from "@/components/public/SearchBar";
// ✅ CORRECTION : FilterBar est dans common
import FilterBar from "@/components/common/FilterBar";
import EtablissementCard from "@/components/public/EtablissementCard";
import EtablissementModal from "@/components/public/EtablissementModal";
import Pagination from "@/components/common/Pagination";
import { useAuth } from "@/contexts/AuthContext";

export default function PublicEtablissements() {
  const { user } = useAuth();
  
  // État pour la recherche et les filtres
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRegionId, setSelectedRegionId] = useState("");
  const [selectedDepartementId, setSelectedDepartementId] = useState("");
  const [selectedType, setSelectedType] = useState("tous");
  const [selectedCycle, setSelectedCycle] = useState("tous");
  const [selectedOption, setSelectedOption] = useState("tous");
  const [showFilters, setShowFilters] = useState(false);
  
  // État pour la modale
  const [selectedEtablissement, setSelectedEtablissement] = useState<any>(null);
  const [modalVisible, setModalVisible] = useState(false);
  
  // Ref pour le debounce
  const searchDebounceRef = useRef<NodeJS.Timeout>();
  const isResettingRef = useRef(false);
  const isApplyingFiltersRef = useRef(false);
  const lastAppliedFiltersRef = useRef<string>("");

  // Hook pour récupérer les établissements
  const {
    etablissements,
    loading,
    error,
    total,
    page,
    totalPages,
    regions,
    departements,
    types,
    options,
    setFilters,
    setPage,
    refresh,
  } = useEtablissementsPublic();

  // Appliquer les filtres
  const applyFiltersImmediately = useCallback(() => {
    if (isResettingRef.current) return;
    if (isApplyingFiltersRef.current) return;
    
    const filters: any = {};
    if (searchQuery) filters.searchQuery = searchQuery;
    if (selectedRegionId) filters.regionId = selectedRegionId;
    if (selectedDepartementId) filters.departementId = selectedDepartementId;
    if (selectedType !== "tous") filters.type = selectedType;
    if (selectedCycle !== "tous") filters.cycle = selectedCycle;
    if (selectedOption !== "tous") filters.option = selectedOption;
    
    const filtersKey = JSON.stringify(filters);
    if (lastAppliedFiltersRef.current === filtersKey) return;
    
    isApplyingFiltersRef.current = true;
    lastAppliedFiltersRef.current = filtersKey;
    setFilters(filters);
    
    setTimeout(() => {
      isApplyingFiltersRef.current = false;
    }, 100);
  }, [searchQuery, selectedRegionId, selectedDepartementId, selectedType, selectedCycle, selectedOption, setFilters]);

  // Debounce pour la recherche
  useEffect(() => {
    if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
    searchDebounceRef.current = setTimeout(() => {
      applyFiltersImmediately();
    }, 300);
    return () => {
      if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
    };
  }, [searchQuery, applyFiltersImmediately]);

  // Appliquer les filtres quand ils changent
  useEffect(() => {
    if (isResettingRef.current) return;
    applyFiltersImmediately();
  }, [selectedRegionId, selectedDepartementId, selectedType, selectedCycle, selectedOption, applyFiltersImmediately]);

  // Réinitialiser les filtres
  const resetFilters = () => {
    isResettingRef.current = true;
    isApplyingFiltersRef.current = false;
    if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
    lastAppliedFiltersRef.current = "";
    setSearchQuery("");
    setSelectedRegionId("");
    setSelectedDepartementId("");
    setSelectedType("tous");
    setSelectedCycle("tous");
    setSelectedOption("tous");
    setFilters({});
    setTimeout(() => {
      isResettingRef.current = false;
      refresh();
    }, 150);
  };

  // Réinitialiser les départements quand la région change
  useEffect(() => {
    setSelectedDepartementId("");
  }, [selectedRegionId]);

  // Ouvrir la modale
  const handleQuickView = (etablissement: any) => {
    setSelectedEtablissement(etablissement);
    setModalVisible(true);
  };

  // Afficher le message d'erreur si présent
  if (error) {
    return (
      <div className="py-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="bg-white rounded-3xl border border-slate-100 p-12">
          <Building2 className="h-12 w-12 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-slate-800 mb-2">Une erreur est survenue</h3>
          <p className="text-sm text-slate-500 max-w-sm mx-auto">{error}</p>
          <button
            onClick={refresh}
            className="mt-4 px-5 py-2.5 bg-blue-600 text-white rounded-xl font-bold text-sm hover:bg-blue-700 transition-colors"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="py-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" id="annuaire-root">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto mb-8">
        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 mb-4 border border-blue-100/50">
          Annuaire National Officiel
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 mb-4 font-sans leading-tight">
          Trouvez l'Établissement Scolaire Idéal
        </h1>
        <p className="text-base text-slate-500 max-w-2xl mx-auto">
          Explorez et comparez les lycées, collèges et écoles d'excellence.
        </p>
      </div>

      {/* Barre de recherche */}
      <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm mb-4">
        <SearchBar
          value={searchQuery}
          onSearch={setSearchQuery}
          placeholder="Rechercher par nom, ville ou code..."
          loading={loading}
          showFilters={true}
          onFilterPress={() => setShowFilters(true)}
        />
      </div>

      {/* Filtres actifs */}
      {(selectedRegionId || selectedDepartementId || selectedType !== "tous" || selectedCycle !== "tous" || selectedOption !== "tous" || searchQuery) && (
        <div className="bg-white rounded-3xl border border-slate-100 p-4 shadow-sm mb-4">
          <div className="flex flex-wrap items-center gap-2">
            {searchQuery && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 rounded-full text-xs font-medium text-slate-600">
                Recherche: {searchQuery}
                <button onClick={() => setSearchQuery("")} className="hover:text-slate-800">
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}
            {selectedRegionId && regions.find(r => r.id === selectedRegionId) && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 rounded-full text-xs font-medium text-slate-600">
                Région: {regions.find(r => r.id === selectedRegionId)?.nom}
                <button onClick={() => setSelectedRegionId("")} className="hover:text-slate-800">
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}
            {selectedDepartementId && departements.find(d => d.id === selectedDepartementId) && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 rounded-full text-xs font-medium text-slate-600">
                Dépt: {departements.find(d => d.id === selectedDepartementId)?.nom}
                <button onClick={() => setSelectedDepartementId("")} className="hover:text-slate-800">
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}
            {selectedType !== "tous" && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 rounded-full text-xs font-medium text-slate-600">
                Type: {selectedType === "public" ? "Public" : selectedType === "prive" ? "Privé" : "Mixte"}
                <button onClick={() => setSelectedType("tous")} className="hover:text-slate-800">
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}
            {selectedCycle !== "tous" && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 rounded-full text-xs font-medium text-slate-600">
                Cycle: {selectedCycle === "premier" ? "1er cycle" : "2nd cycle"}
                <button onClick={() => setSelectedCycle("tous")} className="hover:text-slate-800">
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}
            {selectedOption !== "tous" && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 rounded-full text-xs font-medium text-slate-600">
                Option: {selectedOption}
                <button onClick={() => setSelectedOption("tous")} className="hover:text-slate-800">
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}
            <button
              onClick={resetFilters}
              className="px-3 py-1.5 bg-red-50 text-red-600 rounded-full text-xs font-medium hover:bg-red-100 transition-colors"
            >
              Tout effacer
            </button>
          </div>
        </div>
      )}

      {/* Compteur */}
      {!loading && (
        <div className="mb-4">
          <p className="text-sm text-slate-500 font-medium">
            {total} établissement{total > 1 ? "s" : ""} trouvé{total > 1 ? "s" : ""}
          </p>
        </div>
      )}

      {/* Chargement */}
      {loading && etablissements.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <p className="mt-4 text-sm text-slate-500">Chargement des établissements...</p>
        </div>
      ) : etablissements.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-100 p-12 text-center">
          <Building2 className="h-12 w-12 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-slate-800 mb-2">Aucun établissement trouvé</h3>
          <p className="text-sm text-slate-500 max-w-sm mx-auto">
            Ajustez vos filtres ou modifiez votre requête pour trouver l'établissement recherché.
          </p>
          <button
            onClick={resetFilters}
            className="mt-4 px-5 py-2.5 bg-blue-600 text-white rounded-xl font-bold text-sm hover:bg-blue-700 transition-colors"
          >
            Réinitialiser les filtres
          </button>
        </div>
      ) : (
        <>
          {/* Grille des établissements */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6" id="directory-grid">
            {etablissements.map((etab) => (
              <EtablissementCard
                key={etab.id}
                id={etab.id}
                nom={etab.nom}
                slug={etab.slug}
                ville={etab.ville}
                region={etab.region}
                departement={etab.departement}
                type_affichage={etab.type_affichage}
                logo_url={etab.logo_url}
                taux_reussite={etab.taux_reussite}
                vues_count={etab.vues_count}
                note_moyenne={etab.note_moyenne}
                badge_annuaire={etab.badge_annuaire}
                cycles={etab.cycles}
                options={etab.options}
                description_courte={etab.description_courte}
                code_etablissement={etab.code_etablissement}
                onPress={() => window.location.href = `/etablissements/${etab.slug}`}
                onQuickView={() => handleQuickView(etab)}
              />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-8 flex justify-center">
              <Pagination
                currentPage={page}
                totalPages={totalPages}
                onPageChange={setPage}
              />
            </div>
          )}
        </>
      )}

      {/* Auto-inscription teaser */}
      <div className="mt-16 bg-slate-900 rounded-3xl p-8 sm:p-12 text-white relative overflow-hidden shadow-lg">
        <div className="absolute right-0 bottom-0 top-0 w-1/3 opacity-10 bg-[radial-gradient(ellipse_at_bottom_right,_var(--tw-gradient-stops))] from-blue-400 via-indigo-600 to-transparent pointer-events-none hidden md:block"></div>
        <div className="relative z-10 max-w-xl">
          <span className="px-2.5 py-1 rounded-md text-[10px] font-extrabold bg-blue-500 text-white uppercase tracking-wider">
            Écoles & Administrateurs
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold mt-4 mb-4 font-sans leading-tight">
            Votre établissement n'est pas encore présent dans l'annuaire ?
          </h2>
          <p className="text-slate-300 text-sm mb-6 leading-relaxed font-medium">
            Inscrivez votre école gratuitement pour figurer dans la recherche nationale, et optez pour un abonnement premium afin de débloquer votre site web vitrine interactif, vos actualités et vos portails parents/élèves !
          </p>
          <div className="flex flex-wrap gap-4">
            <Link
              to="/auto-inscription"
              className="px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 font-bold text-xs text-white transition-all flex items-center gap-1.5 shadow-md"
            >
              Inscrire mon école
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              to="/comment-ca-marche"
              className="px-5 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 font-bold text-xs text-slate-200 border border-slate-700 transition-colors"
            >
              Découvrir les offres
            </Link>
          </div>
        </div>
      </div>

      {/* Modal */}
      <EtablissementModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        etablissement={selectedEtablissement}
      />

      {/* FilterBar */}
      <FilterBar
        visible={showFilters}
        onClose={() => setShowFilters(false)}
        regions={regions}
        departements={departements}
        types={types}
        options={options}
        selectedRegionId={selectedRegionId}
        selectedDepartementId={selectedDepartementId}
        selectedType={selectedType}
        selectedCycle={selectedCycle}
        selectedOption={selectedOption}
        onRegionChange={(id) => {
          setSelectedRegionId(id);
          setSelectedDepartementId("");
        }}
        onDepartementChange={setSelectedDepartementId}
        onTypeChange={setSelectedType}
        onCycleChange={setSelectedCycle}
        onOptionChange={setSelectedOption}
        onReset={resetFilters}
      />
    </div>
  );
}
