import React, { useState, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { 
  ArrowLeft, 
  MapPin, 
  Globe, 
  Calendar, 
  FileText, 
  Image as ImageIcon, 
  UserCheck, 
  Award,
  ChevronRight,
  BookOpen,
  CheckCircle,
  HelpCircle,
  Clock,
  Briefcase,
  Users,
  Lock,
  Sparkles,
  ArrowRight,
  Phone,
  Mail,
  ShieldCheck
} from "lucide-react";
import { motion } from "motion/react";
import { EtablissementPublic } from "@/types/etablissement.types";
import SchoolLogo from "@/components/common/SchoolLogo";

const ALL_MOCK_SCHOOLS: EtablissementPublic[] = [
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

const SUBSCRIBED_ETABLISSEMENTS = [
  "etab-lycee-demba",
  "etab-sainte-marie",
  "etab-blaise-diagne",
  "etab-prytanee"
];

export default function PublicEtablissementSite() {
  const { slug } = useParams<{ slug: string }>();
  const [activeTab, setActiveTab] = useState<"general" | "curriculum" | "gallery" | "admission">("general");

  // Enrollment Form states
  const [enrollmentRole, setEnrollmentRole] = useState<"parent" | "eleve" | "enseignant">("parent");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [extraInfo, setExtraInfo] = useState("");
  const [submittingEnrollment, setSubmittingEnrollment] = useState(false);
  const [submittedEnrollment, setSubmittedEnrollment] = useState(false);

  const handleEnrollmentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingEnrollment(true);
    setTimeout(() => {
      setSubmittingEnrollment(false);
      setSubmittedEnrollment(true);
    }, 1200);
  };

  const school = useMemo(() => {
    return ALL_MOCK_SCHOOLS.find(s => s.slug === slug) || ALL_MOCK_SCHOOLS[0];
  }, [slug]);

  const hasSubscription = useMemo(() => {
    return SUBSCRIBED_ETABLISSEMENTS.includes(school.id);
  }, [school]);

  // Gallery mockup photos
  const galleryImages = [
    { url: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=500&auto=format&fit=crop&q=80", title: "Cérémonie de Remise des Diplômes" },
    { url: "https://images.unsplash.com/photo-1562774053-701939374585?w=500&auto=format&fit=crop&q=80", title: "Nouveau Laboratoire de Physique" },
    { url: "https://images.unsplash.com/photo-1509062522246-3755977927d7?w=500&auto=format&fit=crop&q=80", title: "Salle d'Informatique Connectée" },
    { url: "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=500&auto=format&fit=crop&q=80", title: "Bibliothèque de l'Établissement" },
  ];

  // ------------------ RENDERING SUBSCRIPTION BLOCKER IF NOT SUBSCRIBED ------------------
  if (!hasSubscription) {
    return (
      <div className="py-12 max-w-2xl mx-auto px-4 sm:px-6 text-center space-y-8 animate-in fade-in duration-300" id="site-blocked-root">
        
        {/* Lock Shield Illustration */}
        <div className="mx-auto w-24 h-24 bg-gradient-to-b from-amber-50 to-amber-100/50 border border-amber-200 text-amber-600 rounded-full flex items-center justify-center shadow-inner">
          <Lock className="h-10 w-10 animate-pulse" />
        </div>

        <div className="space-y-3">
          <span className="px-3 py-1 rounded-full text-[10px] font-extrabold bg-amber-50 text-amber-700 border border-amber-200 uppercase tracking-wider">
            Site Officiel Inactif
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-800 tracking-tight leading-none">
            Abonnement Premium Requis
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm leading-relaxed max-w-lg mx-auto font-medium">
            Le site vitrine interactif premium de l'établissement <strong className="font-bold text-slate-700">"{school.nom}"</strong> n'est pas encore actif. Seuls les établissements partenaires ayant souscrit à l'offre SchoolNet Premium disposent d'un portail officiel dédié.
          </p>
        </div>

        {/* Benefits Grid */}
        <div className="bg-slate-50 border border-slate-100 rounded-3xl p-6 text-left grid sm:grid-cols-2 gap-4">
          <div className="flex gap-3">
            <span className="h-7 w-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0 mt-0.5 border border-blue-100">
              <Sparkles className="h-4 w-4" />
            </span>
            <div>
              <h4 className="text-xs font-bold text-slate-800">Design Vitrine Unique</h4>
              <p className="text-[10px] text-slate-500 font-medium leading-relaxed mt-0.5">Présentez vos installations, mot du proviseur, et formations au grand public.</p>
            </div>
          </div>
          <div className="flex gap-3">
            <span className="h-7 w-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0 mt-0.5 border border-blue-100">
              <Calendar className="h-4 w-4" />
            </span>
            <div>
              <h4 className="text-xs font-bold text-slate-800">Actualités Officielles</h4>
              <p className="text-[10px] text-slate-500 font-medium leading-relaxed mt-0.5">Publiez vos communiqués et calendriers directement aux parents et élèves.</p>
            </div>
          </div>
          <div className="flex gap-3">
            <span className="h-7 w-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0 mt-0.5 border border-blue-100">
              <Users className="h-4 w-4" />
            </span>
            <div>
              <h4 className="text-xs font-bold text-slate-800">Portail Connecté</h4>
              <p className="text-[10px] text-slate-500 font-medium leading-relaxed mt-0.5">Ouvrez les espaces de suivi académique, saisie des notes et de scolarité.</p>
            </div>
          </div>
          <div className="flex gap-3">
            <span className="h-7 w-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0 mt-0.5 border border-blue-100">
              <ShieldCheck className="h-4 w-4" />
            </span>
            <div>
              <h4 className="text-xs font-bold text-slate-800">Assistance Technique</h4>
              <p className="text-[10px] text-slate-500 font-medium leading-relaxed mt-0.5">Profitez d'un accompagnement personnalisé pour la mise en ligne des données.</p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row justify-center gap-3">
          <Link
            to="/etablissements"
            className="px-5 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-xs transition-colors inline-flex items-center justify-center gap-1.5"
            id="blocked-btn-back"
          >
            <ArrowLeft className="h-4 w-4" />
            Retourner à l'annuaire
          </Link>
          <Link
            to={`/etablissements/${school.slug}`}
            className="px-5 py-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs transition-all inline-flex items-center justify-center gap-1.5"
            id="blocked-btn-infos"
          >
            Voir les Infos Générales
            <ArrowRight className="h-4 w-4 text-blue-600" />
          </Link>
        </div>

        <p className="text-[11px] text-slate-400 font-semibold pt-4">
          Vous êtes l'administrateur de cet établissement ?{" "}
          <Link to="/login" className="text-blue-600 hover:underline font-bold">Connectez-vous</Link> pour activer votre site premium !
        </p>
      </div>
    );
  }

  // ------------------ RENDERING PRESTIGE PREMIUM SITE CONTENT ------------------
  return (
    <div className="py-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8" id="school-site-root">
      {/* Return to profile view */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
        <Link 
          to={`/etablissements/${school.slug}`}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-blue-600 transition-colors"
          id="back-to-profile"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour aux informations générales
        </Link>
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-blue-50 text-blue-700 border border-blue-100/30">
          <Globe className="h-3.5 w-3.5 text-blue-600" /> SITE OFFICIEL PARTENAIRE
        </span>
      </div>

      {/* School Site Premium Custom Header */}
      <div className="text-center md:text-left flex flex-col md:flex-row justify-between items-center gap-6 bg-slate-50 p-6 rounded-3xl border border-slate-100" id="site-custom-header">
        <div className="flex flex-col md:flex-row gap-5 items-center">
          <SchoolLogo 
            src={school.logo_url} 
            name={school.nom} 
            sizeClassName="w-16 h-16"
          />
          <div>
            <h1 className="text-xl font-black text-slate-800 tracking-tight leading-none">{school.nom}</h1>
            <p className="text-xs text-slate-400 font-bold mt-1 tracking-wider uppercase">{school.type_etablissement} — {school.ville}, Sénégal</p>
          </div>
        </div>

        {/* Action quick links */}
        <div className="flex gap-2">
          <Link 
            to="/login"
            className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5 shadow animate-pulse"
          >
            <UserCheck className="h-4 w-4" />
            Portail Parent/Élève
          </Link>
        </div>
      </div>

      {/* Internal Navigation Tabs */}
      <div className="flex border-b border-slate-100 overflow-x-auto gap-2 py-1 scrollbar-none" id="site-tabs">
        <button
          onClick={() => setActiveTab("general")}
          className={`px-4 py-2.5 text-xs font-bold rounded-xl transition-all whitespace-nowrap ${
            activeTab === "general" 
              ? "bg-blue-50/80 text-blue-600" 
              : "text-slate-500 hover:text-slate-800 hover:bg-slate-50"
          }`}
        >
          Accueil & Mot du Proviseur
        </button>
        <button
          onClick={() => setActiveTab("curriculum")}
          className={`px-4 py-2.5 text-xs font-bold rounded-xl transition-all whitespace-nowrap ${
            activeTab === "curriculum" 
              ? "bg-blue-50/80 text-blue-600" 
              : "text-slate-500 hover:text-slate-800 hover:bg-slate-50"
          }`}
        >
          Formations & Horaires
        </button>
        <button
          onClick={() => setActiveTab("gallery")}
          className={`px-4 py-2.5 text-xs font-bold rounded-xl transition-all whitespace-nowrap ${
            activeTab === "gallery" 
              ? "bg-blue-50/80 text-blue-600" 
              : "text-slate-500 hover:text-slate-800 hover:bg-slate-50"
          }`}
        >
          Galerie Photos
        </button>
        <button
          onClick={() => setActiveTab("admission")}
          className={`px-4 py-2.5 text-xs font-bold rounded-xl transition-all whitespace-nowrap ${
            activeTab === "admission" 
              ? "bg-blue-50/80 text-blue-600" 
              : "text-slate-500 hover:text-slate-800 hover:bg-slate-50"
          }`}
        >
          Admissions & Inscriptions
        </button>
      </div>

      {/* Tab Contents */}
      <div className="bg-white rounded-3xl border border-slate-100 p-6 sm:p-8 shadow-sm min-h-[350px]" id="site-tabs-content">
        
        {/* TAB 1: GENERAL */}
        {activeTab === "general" && (
          <div className="grid md:grid-cols-3 gap-8 items-start animate-in fade-in duration-300">
            <div className="md:col-span-2 space-y-5">
              <h2 className="text-lg font-extrabold text-slate-800 flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-blue-600" /> Mot de bienvenue de la direction
              </h2>
              <p className="text-xs text-slate-600 leading-relaxed font-medium">
                Chers élèves, chers parents, et membres de notre dévouée communauté éducative,
              </p>
              <p className="text-xs text-slate-600 leading-relaxed font-medium">
                C'est un immense honneur de vous accueillir sur le portail numérique officiel de notre établissement. Au sein de notre institution, nous cultivons chaque jour le goût de l'excellence académique, de la discipline citoyenne et de l'innovation pédagogique.
              </p>
              <p className="text-xs text-slate-600 leading-relaxed font-medium">
                Grâce au partenariat solide établi avec SchoolNet, notre école franchit une étape charnière de sa numérisation pour rapprocher les familles des salles de cours. Ce site premium vous permettra de suivre en direct l'actualité de nos classes, le calendrier d'examens et d'ouvrir le dialogue pour la réussite collective de nos futurs leaders.
              </p>
              <div className="pt-4 border-t border-slate-50">
                <p className="text-xs font-bold text-slate-800">Le Secrétariat Général</p>
                <p className="text-[10px] text-slate-400 font-bold uppercase mt-0.5">Direction Académique, SchoolNet Premium Partner</p>
              </div>
            </div>

            <div className="bg-slate-50 border border-slate-100 p-6 rounded-2xl space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Coordonnées Utiles</h3>
              <div className="space-y-3.5">
                <div className="flex gap-3">
                  <MapPin className="h-4 w-4 text-slate-400 mt-0.5 flex-shrink-0" />
                  <span className="text-xs font-semibold text-slate-600">{school.ville}, {school.region}, Sénégal</span>
                </div>
                <div className="flex gap-3">
                  <Phone className="h-4 w-4 text-slate-400 mt-0.5 flex-shrink-0" />
                  <span className="text-xs font-semibold text-slate-600">{school.id === "etab-lycee-demba" ? "+221 33 824 55 55" : "+221 33 825 11 22"}</span>
                </div>
                <div className="flex gap-3">
                  <Mail className="h-4 w-4 text-slate-400 mt-0.5 flex-shrink-0" />
                  <span className="text-xs font-semibold text-slate-600 font-mono">{school.id === "etab-lycee-demba" ? "seydou.tall@schoolnet.sn" : "sainte.marie@schoolnet.sn"}</span>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-200">
                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-100/50">
                  <CheckCircle className="h-3.5 w-3.5" /> ÉTABLISSEMENT HOMOLOGUÉ
                </span>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: CURRICULUM */}
        {activeTab === "curriculum" && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div>
              <h2 className="text-lg font-extrabold text-slate-800">Programmes d'Enseignement & Options</h2>
              <p className="text-xs text-slate-400 mt-1">Les spécialisations et parcours disponibles au sein de notre structure</p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100 space-y-3">
                <div className="flex items-center gap-2">
                  <span className="p-1.5 bg-blue-100 text-blue-600 rounded-lg"><Award className="h-4 w-4" /></span>
                  <h3 className="text-xs font-bold text-slate-800 uppercase">Filières d'Excellence</h3>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed font-medium">
                  {school.options}
                </p>
                <div className="pt-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Cycles concernés :</span>
                  <p className="text-xs font-bold text-slate-700 mt-0.5">{school.cycles}</p>
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100 space-y-3">
                <div className="flex items-center gap-2">
                  <span className="p-1.5 bg-emerald-100 text-emerald-600 rounded-lg"><Clock className="h-4 w-4" /></span>
                  <h3 className="text-xs font-bold text-slate-800 uppercase">Horaires d'Ouverture</h3>
                </div>
                <div className="space-y-1.5 text-xs font-semibold text-slate-600">
                  <div className="flex justify-between py-1 border-b border-slate-200/50">
                    <span>Lundi - Vendredi (Matin)</span>
                    <span className="text-slate-800 font-bold">08h00 - 12h00</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-200/50">
                    <span>Lundi - Vendredi (Après-midi)</span>
                    <span className="text-slate-800 font-bold">15h00 - 18h00</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span>Samedi (Activités/Cours de soutien)</span>
                    <span className="text-slate-800 font-bold">09h00 - 12h00</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: GALLERY */}
        {activeTab === "gallery" && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div>
              <h2 className="text-lg font-extrabold text-slate-800">Galerie de la Vie Scolaire</h2>
              <p className="text-xs text-slate-400 mt-1">Aperçu en images de nos locaux, évènements et infrastructures</p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {galleryImages.map((img, i) => (
                <div key={i} className="group rounded-2xl overflow-hidden border border-slate-100 bg-slate-50 relative aspect-[4/3] shadow-sm">
                  <img 
                    src={img.url} 
                    alt={img.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all flex items-end p-4">
                    <span className="text-[10px] font-bold text-white leading-tight">{img.title}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: ADMISSION */}
        {activeTab === "admission" && (
          <div className="grid lg:grid-cols-3 gap-8 animate-in fade-in duration-300">
            {/* Enrollment Form */}
            <div className="lg:col-span-2 space-y-6">
              <div>
                <h2 className="text-lg font-extrabold text-slate-800">Auto-inscription Directe en Ligne</h2>
                <p className="text-xs text-slate-400 mt-1">Formulaire officiel de pré-inscription et d'affiliation à l'établissement.</p>
              </div>

              {submittedEnrollment ? (
                <div className="p-6 bg-emerald-50 border border-emerald-100 rounded-3xl text-center space-y-3 max-w-xl mx-auto">
                  <CheckCircle className="h-10 w-10 text-emerald-500 mx-auto animate-bounce" />
                  <h3 className="text-sm font-extrabold text-emerald-800">Candidature Soumise avec Succès !</h3>
                  <p className="text-xs text-emerald-700 leading-relaxed font-medium">
                    Félicitations <strong className="font-extrabold">{firstName} {lastName}</strong>. Votre demande de pré-inscription/affiliation en tant que <strong className="font-extrabold">{enrollmentRole === "parent" ? "Parent d'élève" : enrollmentRole === "eleve" ? "Élève" : "Enseignant"}</strong> a été transmise au secrétariat administratif de <strong className="font-extrabold">{school.nom}</strong>.
                  </p>
                  <p className="text-[11px] text-emerald-600/90 font-medium">
                    Un e-mail de confirmation contenant votre numéro de dossier temporaire a été envoyé à <strong className="font-bold">{email}</strong>. L'établissement vous contactera sous peu pour planifier votre entretien d'admission.
                  </p>
                  <button
                    onClick={() => {
                      setSubmittedEnrollment(false);
                      setFirstName("");
                      setLastName("");
                      setEmail("");
                      setPhone("");
                      setExtraInfo("");
                    }}
                    className="mt-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition-all shadow"
                  >
                    Soumettre une autre demande
                  </button>
                </div>
              ) : (
                <form onSubmit={handleEnrollmentSubmit} className="space-y-4 bg-slate-50/50 p-6 rounded-3xl border border-slate-100">
                  {/* Select Role */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Je m'inscris en tant que :</label>
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        type="button"
                        onClick={() => setEnrollmentRole("parent")}
                        className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all ${
                          enrollmentRole === "parent"
                            ? "bg-blue-600 border-blue-600 text-white shadow-sm"
                            : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                        }`}
                      >
                        Parent d'élève
                      </button>
                      <button
                        type="button"
                        onClick={() => setEnrollmentRole("eleve")}
                        className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all ${
                          enrollmentRole === "eleve"
                            ? "bg-blue-600 border-blue-600 text-white shadow-sm"
                            : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                        }`}
                      >
                        Élève
                      </button>
                      <button
                        type="button"
                        onClick={() => setEnrollmentRole("enseignant")}
                        className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all ${
                          enrollmentRole === "enseignant"
                            ? "bg-blue-600 border-blue-600 text-white shadow-sm"
                            : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                        }`}
                      >
                        Enseignant
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Prénom */}
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-600 block">Prénom</label>
                      <input
                        type="text"
                        required
                        placeholder="Ex: Babacar"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:ring-4 focus:ring-blue-50 focus:border-blue-500 transition-all outline-none text-xs font-semibold text-slate-700 bg-white"
                      />
                    </div>
                    {/* Nom */}
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-600 block">Nom</label>
                      <input
                        type="text"
                        required
                        placeholder="Ex: Ndiaye"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:ring-4 focus:ring-blue-50 focus:border-blue-500 transition-all outline-none text-xs font-semibold text-slate-700 bg-white"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Email */}
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-600 block">Email de contact</label>
                      <input
                        type="email"
                        required
                        placeholder="Ex: parent@domaine.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:ring-4 focus:ring-blue-50 focus:border-blue-500 transition-all outline-none text-xs font-semibold text-slate-700 bg-white"
                      />
                    </div>
                    {/* Téléphone */}
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-600 block">Téléphone</label>
                      <input
                        type="tel"
                        required
                        placeholder="Ex: +221 77 000 00 00"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:ring-4 focus:ring-blue-50 focus:border-blue-500 transition-all outline-none text-xs font-semibold text-slate-700 bg-white"
                      />
                    </div>
                  </div>

                  {/* Extra info */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-600 block">
                      {enrollmentRole === "parent" 
                        ? "Nom de l'enfant & classe visée" 
                        : enrollmentRole === "eleve" 
                        ? "Classe souhaitée" 
                        : "Matière principale d'enseignement"}
                    </label>
                    <input
                      type="text"
                      required
                      placeholder={enrollmentRole === "parent" ? "Ex: Fatou Ndiaye, classe de Seconde" : enrollmentRole === "eleve" ? "Ex: Terminale S2" : "Ex: Mathématiques / Sciences Physiques"}
                      value={extraInfo}
                      onChange={(e) => setExtraInfo(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:ring-4 focus:ring-blue-50 focus:border-blue-500 transition-all outline-none text-xs font-semibold text-slate-700 bg-white"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={submittingEnrollment}
                    className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition-colors flex items-center justify-center gap-1.5 shadow"
                  >
                    {submittingEnrollment ? (
                      <>
                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Traitement de la demande...
                      </>
                    ) : (
                      <>
                        Soumettre ma demande d'auto-inscription
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>

            {/* General conditions & details */}
            <div className="space-y-4">
              <div className="p-5 bg-white border border-slate-100 rounded-3xl shadow-sm space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Dossier physique requis</h3>
                <p className="text-[11px] text-slate-500 leading-relaxed font-medium">
                  Pour valider définitivement votre inscription après examen de votre demande en ligne, veuillez préparer les documents suivants :
                </p>
                <ul className="space-y-2 text-xs text-slate-600 font-semibold">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                    <span>Bulletins scolaires des deux dernières années</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                    <span>Extrait d'acte de naissance officiel</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                    <span>Certificat de scolarité ou de fin de cycle antérieur</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                    <span>Deux photos d'identité récentes</span>
                  </li>
                </ul>
              </div>

              <div className="p-5 bg-blue-50/50 border border-blue-100/50 rounded-3xl text-xs text-blue-800 space-y-2">
                <h4 className="font-bold">Régime d'étude & Scolarité</h4>
                <p className="font-medium text-[11px] text-blue-700 leading-relaxed">
                  Cet établissement fonctionne sous le régime <strong className="text-blue-900">{school.regime}</strong>. Les frais d'inscription et mensualités dépendent du niveau sélectionné et des options académiques choisies.
                </p>
                <div className="text-[10px] text-blue-500 font-bold uppercase pt-1">
                  SchoolNet Premium Verified Portal 🛡️
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
