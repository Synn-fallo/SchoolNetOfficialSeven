import React, { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { 
  Search, 
  MapPin, 
  GraduationCap, 
  Award, 
  Eye, 
  ThumbsUp, 
  Star, 
  ArrowRight, 
  Building2, 
  CheckCircle, 
  Info, 
  X, 
  HelpCircle,
  ExternalLink,
  ChevronRight,
  Heart
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { EtablissementPublic } from "@/types/etablissement.types";
import { useAuth } from "@/contexts/AuthContext";
import SchoolLogo from "@/components/common/SchoolLogo";

// High-quality mock data matching the schema perfectly
const MOCK_PUBLIC_ETABLISSEMENTS: EtablissementPublic[] = [
  {
    id: "etab-lycee-demba",
    nom: "Lycée Seydou Nourou Tall",
    slug: "lycee-tall-dakar",
    ville: "Dakar",
    type_etablissement: "Lycée Public",
    regime: "Mixte",
    logo_url: "https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=150&auto=format&fit=crop&q=80",
    taux_reussite: 96.5,
    likes_count: 342,
    vues_count: 1845,
    note_moyenne: 4.8,
    region: "Dakar",
    departement: "Dakar",
    region_id: "reg-dakar",
    departement_id: "dep-dakar",
    badge_annuaire: "Prestige",
    cycles: "Second cycle (Seconde, Première, Terminale)",
    options: "Séries S1, S2, L1, L2, L' (Lettres classiques)",
    description_courte: "Un des fleurons de l'enseignement secondaire sénégalais, réputé pour sa rigueur académique et ses brillants résultats aux concours nationaux.",
    etoiles: "5",
    type_affichage: "VIP",
    code_etablissement: "LST-DK-01"
  },
  {
    id: "etab-sainte-marie",
    nom: "Cours Sainte Marie de Hann",
    slug: "sainte-marie-hann",
    ville: "Dakar",
    type_etablissement: "Privé Catholique",
    regime: "Mixte",
    logo_url: "https://images.unsplash.com/photo-1592280771190-3e2e4d571952?w=150&auto=format&fit=crop&q=80",
    taux_reussite: 98.2,
    likes_count: 512,
    vues_count: 2980,
    note_moyenne: 4.9,
    region: "Dakar",
    departement: "Dakar",
    region_id: "reg-dakar",
    departement_id: "dep-dakar",
    badge_annuaire: "Prestige",
    cycles: "Maternelle, Primaire, Moyen, Secondaire",
    options: "Baccalauréat Sénégalais, Baccalauréat Français, Séries Scientifiques, Littéraires, Économiques",
    description_courte: "Institution d'excellence multiculturelle, lauréate du prix UNESCO de l'éducation pour la paix, formant les leaders de demain.",
    etoiles: "5",
    type_affichage: "VIP",
    code_etablissement: "CSM-DK-02"
  },
  {
    id: "etab-blaise-diagne",
    nom: "Lycée Blaise Diagne",
    slug: "lycee-blaise-diagne",
    ville: "Dakar",
    type_etablissement: "Lycée Public",
    regime: "Mixte",
    logo_url: "https://images.unsplash.com/photo-1509062522246-3755977927d7?w=150&auto=format&fit=crop&q=80",
    taux_reussite: 89.1,
    likes_count: 184,
    vues_count: 924,
    note_moyenne: 4.2,
    region: "Dakar",
    departement: "Dakar",
    region_id: "reg-dakar",
    departement_id: "dep-dakar",
    badge_annuaire: "Premium",
    cycles: "Second cycle (Seconde, Première, Terminale)",
    options: "Séries S2, S3, L1, L2, Sciences Physiques, Sciences de la Vie et de la Terre",
    description_courte: "Établissement historique de Dakar offrant un cadre d'études dynamique et une solide formation pluridisciplinaire.",
    etoiles: "4",
    type_affichage: "Gold",
    code_etablissement: "LBD-DK-03"
  },
  {
    id: "etab-lamine-gueye",
    nom: "Lycée Lamine Guèye",
    slug: "lycee-lamine-gueye",
    ville: "Dakar",
    type_etablissement: "Lycée Public",
    regime: "Mixte",
    logo_url: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=150&auto=format&fit=crop&q=80",
    taux_reussite: 85.4,
    likes_count: 145,
    vues_count: 730,
    note_moyenne: 4.0,
    region: "Dakar",
    departement: "Dakar",
    region_id: "reg-dakar",
    departement_id: "dep-dakar",
    badge_annuaire: "Certifié",
    cycles: "Second cycle (Seconde, Première, Terminale)",
    options: "Séries S2, L1, L2, Arabe, Anglais renforcé",
    description_courte: "Anciennement Lycée Van Vollenhoven, un établissement patrimonial engagé pour la réussite de tous ses élèves.",
    etoiles: "4",
    type_affichage: "Classic",
    code_etablissement: "LLG-DK-04"
  },
  {
    id: "etab-college-bambey",
    nom: "Collège d'Enseignement Moyen de Bambey",
    slug: "cem-bambey",
    ville: "Bambey",
    type_etablissement: "Collège Public",
    regime: "Mixte",
    logo_url: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=150&auto=format&fit=crop&q=80",
    taux_reussite: 75.8,
    likes_count: 42,
    vues_count: 215,
    note_moyenne: 3.5,
    region: "Diourbel",
    departement: "Bambey",
    region_id: "reg-diourbel",
    departement_id: "dep-bambey",
    badge_annuaire: null,
    cycles: "Premier cycle (6ème à la 3ème)",
    options: "Enseignement Général, Langues (Anglais, Espagnol)",
    description_courte: "Collège public engagé de la région de Diourbel, accompagnant les élèves vers le brevet avec dévouement.",
    etoiles: "3",
    type_affichage: "Classic",
    code_etablissement: "CEM-BB-01"
  },
  {
    id: "etab-prytanee",
    nom: "Prytanée Militaire de Saint-Louis",
    slug: "prytanee-saint-louis",
    ville: "Saint-Louis",
    type_etablissement: "Militaire Public",
    regime: "Internat Garçons",
    logo_url: "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=150&auto=format&fit=crop&q=80",
    taux_reussite: 100.0,
    likes_count: 612,
    vues_count: 4120,
    note_moyenne: 5.0,
    region: "Saint-Louis",
    departement: "Saint-Louis",
    region_id: "reg-sl",
    departement_id: "dep-sl",
    badge_annuaire: "Prestige",
    cycles: "Moyen et Secondaire (de la 6ème à la Terminale)",
    options: "Séries S1, S2, L1, Préparation rigoureuse au Concours Général et carrières d'officiers",
    description_courte: "École d'excellence militaire d'envergure panafricaine. 'Savoir et Patrie' est la devise de ce temple du savoir d'élite.",
    etoiles: "5",
    type_affichage: "VIP",
    code_etablissement: "PMS-SL-01"
  }
];

// Active subscriptions simulation (matching lib/abonnement.ts)
const SUBSCRIBED_ETABLISSEMENTS = [
  "etab-lycee-demba",
  "etab-sainte-marie",
  "etab-blaise-diagne",
  "etab-prytanee"
];

export default function PublicEtablissements() {
  const { user, activeRole, isChefEtablissement } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRegion, setSelectedRegion] = useState("all");
  const [selectedType, setSelectedType] = useState("all");
  const [selectedBadge, setSelectedBadge] = useState("all");
  
  // Modal for General Info (Layer 1 detail display)
  const [selectedEtabForModal, setSelectedEtabForModal] = useState<EtablissementPublic | null>(null);
  
  // Show Subscription Prompt modal for unsubscribed schools
  const [showSubscriptionPrompt, setShowSubscriptionPrompt] = useState<EtablissementPublic | null>(null);

  // Interest tracking state
  const [manifestedInterests, setManifestedInterests] = useState<Record<string, boolean>>({});

  // Filter establishments
  const filteredEtablissements = useMemo(() => {
    return MOCK_PUBLIC_ETABLISSEMENTS.filter(etab => {
      const matchesSearch = 
        etab.nom.toLowerCase().includes(searchQuery.toLowerCase()) ||
        etab.ville?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        etab.code_etablissement?.toLowerCase().includes(searchQuery.toLowerCase());
        
      const matchesRegion = selectedRegion === "all" || etab.region === selectedRegion;
      
      const matchesType = selectedType === "all" || 
        (selectedType === "public" && etab.type_etablissement?.toLowerCase().includes("public")) ||
        (selectedType === "prive" && etab.type_etablissement?.toLowerCase().includes("privé"));

      const matchesBadge = selectedBadge === "all" || etab.badge_annuaire === selectedBadge;

      return matchesSearch && matchesRegion && matchesType && matchesBadge;
    });
  }, [searchQuery, selectedRegion, selectedType, selectedBadge]);

  // Handle "Visiter le site officiel" check
  const isAbonne = (id: string) => SUBSCRIBED_ETABLISSEMENTS.includes(id);

  // Quick stats
  const totalSchools = MOCK_PUBLIC_ETABLISSEMENTS.length;
  const vipCount = MOCK_PUBLIC_ETABLISSEMENTS.filter(e => e.badge_annuaire === "Prestige").length;
  const avgSuccessRate = (MOCK_PUBLIC_ETABLISSEMENTS.reduce((sum, e) => sum + (e.taux_reussite || 0), 0) / totalSchools).toFixed(1);

  return (
    <div className="py-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" id="annuaire-root">
      {/* Header Info Section */}
      <div className="text-center max-w-3xl mx-auto mb-12">
        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 mb-4 border border-blue-100/50">
          <Award className="h-3 w-3 text-blue-600" /> Annuaire National Officiel
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 mb-4 font-sans leading-tight">
          Trouvez l'Établissement <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Scolaire Idéal</span>
        </h1>
        <p className="text-base text-slate-500 max-w-2xl mx-auto">
          Explorez et comparez les lycées, collèges et écoles d'excellence. Accédez directement aux mini-sites officiels de nos partenaires abonnés.
        </p>
      </div>

      {/* Hero Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-10 max-w-4xl mx-auto" id="quick-stats-grid">
        <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm text-center">
          <p className="text-2xl font-bold text-slate-900">{totalSchools}</p>
          <p className="text-xs text-slate-400 font-medium mt-0.5">Établissements répertoriés</p>
        </div>
        <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm text-center">
          <p className="text-2xl font-bold text-indigo-600">{vipCount}</p>
          <p className="text-xs text-slate-400 font-medium mt-0.5">Membres Excellence Prestige</p>
        </div>
        <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm text-center col-span-2 md:col-span-1">
          <p className="text-2xl font-bold text-emerald-600">{avgSuccessRate}%</p>
          <p className="text-xs text-slate-400 font-medium mt-0.5">Taux de réussite moyen au Bac</p>
        </div>
      </div>

      {/* Advanced Filter and Search Bar */}
      <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm mb-10 space-y-4" id="filters-container">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Rechercher par nom, ville, code établissement..."
              className="w-full pl-10 pr-4 py-3 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm placeholder-slate-400 font-medium"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Region Filter */}
            <select
              className="px-3.5 py-3 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm font-semibold text-slate-700 bg-white"
              value={selectedRegion}
              onChange={(e) => setSelectedRegion(e.target.value)}
            >
              <option value="all">Toutes les régions</option>
              <option value="Dakar">Dakar</option>
              <option value="Saint-Louis">Saint-Louis</option>
              <option value="Diourbel">Diourbel</option>
            </select>

            {/* Public/Private Filter */}
            <select
              className="px-3.5 py-3 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm font-semibold text-slate-700 bg-white"
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
            >
              <option value="all">Tous les types d'école</option>
              <option value="public">Établissements Publics</option>
              <option value="prive">Établissements Privés</option>
            </select>

            {/* Badge level */}
            <select
              className="px-3.5 py-3 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm font-semibold text-slate-700 bg-white"
              value={selectedBadge}
              onChange={(e) => setSelectedBadge(e.target.value)}
            >
              <option value="all">Tous les badges</option>
              <option value="Prestige">Prestige ⭐</option>
              <option value="Premium">Premium ✨</option>
              <option value="Certifié">Certifié 🛡️</option>
            </select>
          </div>
        </div>
      </div>

      {/* Directory Cards Grid */}
      {filteredEtablissements.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6" id="directory-grid">
          {filteredEtablissements.map((etab) => {
            const hasSubscription = isAbonne(etab.id);
            
            // Define visual borders and badges according to its prestige levels
            let cardClasses = "bg-white rounded-3xl border transition-all duration-300 relative flex flex-col h-full hover:-translate-y-1.5 ";
            let borderStyle = "border-slate-100 shadow-sm hover:shadow-md hover:border-slate-200";
            let badgeBg = "bg-slate-100 text-slate-700";
            
            if (etab.badge_annuaire === "Prestige") {
              borderStyle = "border-amber-200/60 shadow-amber-500/5 hover:shadow-amber-500/10 hover:border-amber-400 bg-gradient-to-b from-amber-50/10 to-white hover:bg-gradient-to-b hover:from-amber-50/20 hover:to-white";
              badgeBg = "bg-amber-50 text-amber-700 border border-amber-200/50";
            } else if (etab.badge_annuaire === "Premium") {
              borderStyle = "border-emerald-200/60 shadow-emerald-500/5 hover:shadow-emerald-500/10 hover:border-emerald-400 bg-gradient-to-b from-emerald-50/10 to-white";
              badgeBg = "bg-emerald-50 text-emerald-700 border border-emerald-200/50";
            } else if (etab.badge_annuaire === "Certifié") {
              borderStyle = "border-blue-200/60 shadow-blue-500/5 hover:shadow-blue-500/10 hover:border-blue-400 bg-gradient-to-b from-blue-50/10 to-white";
              badgeBg = "bg-blue-50 text-blue-700 border border-blue-200/50";
            }

            return (
              <motion.div 
                key={etab.id}
                layout
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.35, ease: "easeOut" }}
                className={`${cardClasses} ${borderStyle}`}
                id={`school-card-${etab.slug}`}
              >
                {/* Prestige badge tag floating */}
                {etab.badge_annuaire && (
                  <div className="absolute top-4 right-4 z-10">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wide ${badgeBg}`}>
                      {etab.badge_annuaire === "Prestige" && <Star className="h-3 w-3 fill-amber-500 text-amber-500" />}
                      {etab.badge_annuaire === "Premium" && <CheckCircle className="h-3 w-3 text-emerald-600" />}
                      {etab.badge_annuaire === "Certifié" && <Award className="h-3 w-3 text-blue-600" />}
                      {etab.badge_annuaire}
                    </span>
                  </div>
                )}

                {/* Card Main Body */}
                <div className="p-6 flex-1 flex flex-col">
                  {/* Top: Logo & Basic Identification */}
                  <div className="flex gap-4 items-start mb-4">
                    <SchoolLogo 
                      src={etab.logo_url} 
                      name={etab.nom} 
                      sizeClassName="w-14 h-14"
                    />
                    <div className="min-w-0">
                      <p className="text-[10px] font-bold text-slate-400 tracking-wider uppercase">{etab.type_etablissement}</p>
                      <h3 className="text-base font-bold text-slate-800 leading-snug line-clamp-2 mt-0.5 tracking-tight">
                        {etab.nom}
                      </h3>
                      <p className="text-xs text-slate-500 font-medium flex items-center gap-1 mt-1">
                        <MapPin className="h-3.5 w-3.5 text-slate-400 flex-shrink-0" />
                        <span>{etab.ville}, {etab.region}</span>
                      </p>
                    </div>
                  </div>

                  {/* Rating or stars */}
                  <div className="flex items-center gap-1.5 mb-4">
                    <div className="flex text-amber-400">
                      {[...Array(5)].map((_, i) => (
                        <Star 
                          key={i} 
                          className={`h-3.5 w-3.5 ${i < parseInt(etab.etoiles) ? "fill-amber-400 text-amber-400" : "text-slate-200"}`} 
                        />
                      ))}
                    </div>
                    <span className="text-xs font-bold text-slate-700">{etab.note_moyenne}</span>
                    <span className="text-[10px] text-slate-400">({etab.likes_count} avis)</span>
                  </div>

                  {/* Description short */}
                  <p className="text-xs text-slate-500 leading-relaxed line-clamp-3 mb-4 flex-1 font-medium">
                    {etab.description_courte}
                  </p>

                  {/* Key Stats Block */}
                  <div className="grid grid-cols-2 gap-3.5 py-3 border-t border-b border-slate-100/75 mb-4 bg-slate-50/50 rounded-2xl px-4">
                    <div className="text-left">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Taux de réussite</p>
                      <div className="flex items-baseline gap-1 mt-0.5">
                        <span className="text-base font-extrabold text-slate-800">{etab.taux_reussite}%</span>
                        <span className="text-[9px] text-emerald-600 font-bold">Bac</span>
                      </div>
                    </div>
                    <div className="text-left">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Code Officiel</p>
                      <p className="text-xs font-bold text-slate-700 mt-0.5 font-mono">{etab.code_etablissement || "N/A"}</p>
                    </div>
                  </div>

                  {/* Social stats */}
                  <div className="flex items-center justify-between text-[11px] text-slate-400 font-semibold px-1">
                    <span className="flex items-center gap-1">
                      <Eye className="h-3.5 w-3.5" /> {etab.vues_count} vues
                    </span>
                    <span className="flex items-center gap-1">
                      <ThumbsUp className="h-3.5 w-3.5" /> {etab.likes_count} recommandations
                    </span>
                  </div>
                </div>

                {/* Footer Actions: The Two-Layer workflow */}
                <div className="p-4 border-t border-slate-50 flex flex-col sm:flex-row gap-2.5">
                  {/* Layer 1: Expand General Information (Detailed profile page) */}
                  <button
                    onClick={() => setSelectedEtabForModal(etab)}
                    className="flex-1 py-2.5 px-3 rounded-xl bg-slate-50 hover:bg-slate-100 text-xs font-bold text-slate-600 transition-colors flex items-center justify-center gap-1.5"
                    id={`btn-details-${etab.slug}`}
                  >
                    <Info className="h-3.5 w-3.5" />
                    Infos Générales
                  </button>

                  {/* Layer 2: Visit premium site or display upgrade prompt */}
                  {hasSubscription ? (
                    <Link
                      to={`/etablissements/${etab.slug}/site`}
                      className="flex-1 py-2.5 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-xs font-bold text-white transition-all flex items-center justify-center gap-1 shadow-sm hover:shadow"
                      id={`btn-visit-${etab.slug}`}
                    >
                      Site Officiel
                      <ExternalLink className="h-3.5 w-3.5" />
                    </Link>
                  ) : (
                    <button
                      onClick={() => setShowSubscriptionPrompt(etab)}
                      className="flex-1 py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-500 cursor-help transition-colors flex items-center justify-center gap-1.5"
                      title="Site premium indisponible"
                      id={`btn-nosub-${etab.slug}`}
                    >
                      Non-abonné
                      <HelpCircle className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-100 p-12 text-center" id="no-results-state">
          <Building2 className="h-12 w-12 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-slate-800 mb-1">Aucun établissement trouvé</h3>
          <p className="text-sm text-slate-500 max-w-sm mx-auto">
            Ajustez vos filtres ou modifiez votre requête pour trouver l'établissement recherché.
          </p>
        </div>
      )}

      {/* Auto-inscription teaser section */}
      <div className="mt-16 bg-slate-900 rounded-3xl p-8 sm:p-12 text-white relative overflow-hidden shadow-lg" id="teaser-cta">
        <div className="absolute right-0 bottom-0 top-0 w-1/3 opacity-10 bg-[radial-gradient(ellipse_at_bottom_right,_var(--tw-gradient-stops))] from-blue-400 via-indigo-600 to-transparent pointer-events-none hidden md:block"></div>
        <div className="relative z-10 max-w-xl">
          <span className="px-2.5 py-1 rounded-md text-[10px] font-extrabold bg-blue-500 text-white uppercase tracking-wider">Écoles & Administrateurs</span>
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
              id="cta-teaser-register"
            >
              Inscrire mon école
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              to="/comment-ca-marche"
              className="px-5 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 font-bold text-xs text-slate-200 border border-slate-700 transition-colors"
              id="cta-teaser-learn"
            >
              Découvrir les offres
            </Link>
          </div>
        </div>
      </div>

      {/* ----------------- LAYER 1 MODAL : INFOS GENERALES ----------------- */}
      <AnimatePresence>
        {selectedEtabForModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4" id="modal-layer1-container">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedEtabForModal(null)}
              className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm"
            />
            
            {/* Modal Body */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-white rounded-3xl border border-slate-100 w-full max-w-lg shadow-xl relative overflow-hidden z-10 flex flex-col max-h-[90vh]"
            >
              {/* Top Banner or Color Accent */}
              <div className="h-2.5 bg-gradient-to-r from-blue-600 to-indigo-600" />
              
              <button 
                onClick={() => setSelectedEtabForModal(null)}
                className="absolute top-4 right-4 p-1.5 rounded-full bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors"
                id="btn-close-modal-l1"
              >
                <X className="h-4 w-4" />
              </button>

              <div className="p-6 overflow-y-auto space-y-5">
                {/* School title & logo */}
                <div className="flex gap-4 items-start pr-8">
                  <SchoolLogo 
                    src={selectedEtabForModal.logo_url} 
                    name={selectedEtabForModal.nom} 
                    sizeClassName="w-16 h-16"
                  />
                  <div>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wide bg-blue-50 text-blue-700 border border-blue-100/50">
                      {selectedEtabForModal.type_etablissement}
                    </span>
                    <h3 className="text-lg font-bold text-slate-800 leading-snug mt-1.5">{selectedEtabForModal.nom}</h3>
                    <p className="text-xs text-slate-500 font-medium flex items-center gap-1 mt-1">
                      <MapPin className="h-3.5 w-3.5 text-slate-400" />
                      <span>{selectedEtabForModal.ville}, {selectedEtabForModal.region} ({selectedEtabForModal.departement})</span>
                    </p>
                  </div>
                </div>

                {/* Description Text */}
                <div className="space-y-1.5">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Présentation</h4>
                  <p className="text-xs text-slate-600 leading-relaxed font-medium">
                    {selectedEtabForModal.description_courte}
                  </p>
                </div>

                {/* Key indicators list */}
                <div className="space-y-3 pt-3 border-t border-slate-100">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Indicateurs Académiques</h4>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                      <p className="text-[10px] font-bold text-slate-400 uppercase">Taux de réussite Bac</p>
                      <p className="text-lg font-extrabold text-slate-800 mt-1">{selectedEtabForModal.taux_reussite}%</p>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                      <p className="text-[10px] font-bold text-slate-400 uppercase">Régime d'études</p>
                      <p className="text-xs font-bold text-slate-800 mt-1">{selectedEtabForModal.regime || "Non spécifié"}</p>
                    </div>
                  </div>

                  <div className="space-y-2.5 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase">Cycles d'enseignement</p>
                      <p className="text-xs font-bold text-slate-700 mt-0.5 leading-relaxed">{selectedEtabForModal.cycles || "Général"}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase">Filières & Options disponibles</p>
                      <p className="text-xs font-bold text-slate-700 mt-0.5 leading-relaxed">{selectedEtabForModal.options || "Séries générales"}</p>
                    </div>
                  </div>
                </div>

                {/* Footnote or Auto-inscription invitation inside general info layer */}
                <div className="p-3.5 bg-blue-50/70 border border-blue-100/50 rounded-2xl text-xs text-blue-800 flex items-start gap-2.5">
                  <Info className="h-4 w-4 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold">Vous êtes administrateur de cette école ?</p>
                    <p className="font-medium text-[11px] text-blue-700 mt-0.5 leading-relaxed">
                      Rejoignez SchoolNet pour mettre à jour ces informations en temps réel, publier vos actualités officielles et activer votre site web vitrine premium !
                    </p>
                  </div>
                </div>
              </div>

              {/* Bottom Action */}
              <div className="p-4 border-t border-slate-100 bg-slate-50 flex gap-2.5 justify-end">
                <button
                  onClick={() => setSelectedEtabForModal(null)}
                  className="py-2.5 px-4 rounded-xl text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors"
                >
                  Fermer
                </button>
                {isAbonne(selectedEtabForModal.id) ? (
                  <Link
                    to={`/etablissements/${selectedEtabForModal.slug}/site`}
                    onClick={() => setSelectedEtabForModal(null)}
                    className="py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-xs font-bold text-white transition-all flex items-center gap-1 shadow-sm"
                  >
                    Consulter le site officiel
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                ) : (
                  <button
                    onClick={() => {
                      setSelectedEtabForModal(null);
                      setShowSubscriptionPrompt(selectedEtabForModal);
                    }}
                    className="py-2.5 px-4 rounded-xl bg-slate-200 hover:bg-slate-300 text-xs font-bold text-slate-700 transition-all flex items-center gap-1"
                  >
                    Activer le site Premium
                    <ChevronRight className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ----------------- LAYER 2 COMPLEMENT : PROMPT NOT ABONNE ----------------- */}
      <AnimatePresence>
        {showSubscriptionPrompt && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4" id="modal-subscription-prompt-container">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowSubscriptionPrompt(null)}
              className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm"
            />

            {/* Modal Body */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-white rounded-3xl border border-slate-100 w-full max-w-md shadow-xl relative overflow-hidden z-10 p-6 space-y-5"
            >
              <button 
                onClick={() => setShowSubscriptionPrompt(null)}
                className="absolute top-4 right-4 p-1.5 rounded-full bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors"
                id="btn-close-modal-sub"
              >
                <X className="h-4 w-4" />
              </button>

              <div className="text-center space-y-3 pt-4">
                <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-500 border border-amber-200/50 flex items-center justify-center mx-auto shadow-sm">
                  <Star className="h-6 w-6 fill-amber-500 text-amber-500" />
                </div>
                <h3 className="text-lg font-extrabold text-slate-800 tracking-tight">Espace Web Vitrine non activé</h3>
                <p className="text-xs text-slate-500 max-w-xs mx-auto leading-relaxed">
                  L'établissement <span className="font-bold text-slate-700">{showSubscriptionPrompt.nom}</span> n'a pas encore activé son mini-site interactif officiel sur la plateforme SchoolNet.
                </p>
              </div>

              {/* Conditional Views based on User Role */}
              {isChefEtablissement || activeRole === "admin" ? (
                /* PROMOTER VIEW */
                <div className="space-y-4 pt-2">
                  <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 text-xs text-slate-600 leading-relaxed text-center font-medium">
                    <p className="font-bold text-slate-800 mb-1.5">👋 Message pour le promoteur</p>
                    En tant que responsable scolaire, vous pouvez débloquer cet espace pour publier vos actualités officielles, ouvrir vos formulaires de pré-inscription et moderniser votre communication.
                  </div>
                  
                  <div className="flex flex-col gap-2">
                    <Link
                      to="/comment-ca-marche"
                      onClick={() => setShowSubscriptionPrompt(null)}
                      className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-xs font-bold text-white text-center shadow-sm transition-all"
                      id="btn-sub-discover-plans-promoter"
                    >
                      Découvrir nos offres d'abonnement
                    </Link>
                    <button
                      onClick={() => setShowSubscriptionPrompt(null)}
                      className="w-full py-3 rounded-xl bg-slate-50 hover:bg-slate-100 text-xs font-bold text-slate-500 transition-colors"
                    >
                      Plus tard
                    </button>
                  </div>
                </div>
              ) : (
                /* VISITOR VIEW */
                <div className="space-y-4 pt-2">
                  {manifestedInterests[showSubscriptionPrompt.id] ? (
                    <motion.div 
                      initial={{ scale: 0.95, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4 text-center space-y-2 text-emerald-800"
                    >
                      <Heart className="h-8 w-8 text-emerald-500 fill-emerald-500 mx-auto animate-bounce" />
                      <p className="text-xs font-extrabold">Manifestation d'intérêt reçue !</p>
                      <p className="text-[11px] font-medium leading-relaxed">
                        Votre intérêt a été enregistré avec bienveillance. Nous transmettrons l'information de manière anonyme à la direction de l'école pour l'encourager à activer son portail numérique.
                      </p>
                    </motion.div>
                  ) : (
                    <div className="space-y-4">
                      <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 text-xs text-slate-600 leading-relaxed text-center font-medium">
                        Si vous êtes élève, parent, enseignant ou sympathisant de cet établissement, manifestez votre intérêt pour encourager bienveillamment son passage au numérique.
                      </div>
                      
                      <button
                        onClick={() => setManifestedInterests(prev => ({ ...prev, [showSubscriptionPrompt.id]: true }))}
                        className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-xs font-extrabold text-white text-center shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-1.5"
                        id="btn-manifest-interest"
                      >
                        <Heart className="h-4 w-4 text-white fill-white animate-pulse" />
                        Manifester votre intérêt
                      </button>
                    </div>
                  )}
                  
                  <div className="pt-2">
                    <button
                      onClick={() => setShowSubscriptionPrompt(null)}
                      className="w-full py-3 rounded-xl bg-slate-50 hover:bg-slate-100 text-xs font-bold text-slate-500 transition-colors text-center"
                    >
                      Fermer
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
