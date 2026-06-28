import React, { useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { 
  ArrowLeft, 
  Calendar, 
  MapPin, 
  Award, 
  Clock, 
  Share2, 
  Bell, 
  FileText, 
  User, 
  Info,
  ChevronRight
} from "lucide-react";
import { motion } from "motion/react";
import { EtablissementPublic } from "@/types/etablissement.types";
import SchoolLogo from "@/components/common/SchoolLogo";

const MOCK_SCHOOLS: EtablissementPublic[] = [
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
  }
];

// High fidelity mock news data for school portal
const MOCK_NEWS = [
  {
    id: "news-1",
    category: "Concours",
    title: "Brillante Performance au Concours Général Sénégalais 2026",
    summary: "Nos élèves de Première et de Terminale ont obtenu 8 distinctions majeures, réaffirmant le statut d'excellence académique de notre cher établissement.",
    content: "Cette année encore, l'engagement de nos enseignants et l'assiduité légendaire de nos candidats ont porté leurs fruits. Le Lycée Seydou Nourou Tall se classe parmi les établissements les plus distingués lors de l'édition 2026 du Concours Général, notamment en Mathématiques et en Sciences de la Vie et de la Terre.",
    date: "12 Juin 2026",
    author: "Bureau de la Communication",
    image: "https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=800&auto=format&fit=crop&q=80"
  },
  {
    id: "news-2",
    category: "Administration",
    title: "Lancement des inscriptions en ligne de la rentrée 2026-2027",
    summary: "L'administration informe les parents d'élèves que la campagne d'inscriptions et réinscriptions administratives se déroule désormais de manière simplifiée en ligne.",
    content: "Dans le cadre de la modernisation de nos services et pour vous éviter de longues files d'attente sous la chaleur de l'hivernage, toutes les démarches d'inscription administrative, de paiement des frais d'écolage et d'attribution des tenues réglementaires se feront via le portail en ligne sécurisé.",
    date: "05 Juin 2026",
    author: "Secrétaire Général de l'Établissement",
    image: "https://images.unsplash.com/photo-1509062522246-3755977927d7?w=800&auto=format&fit=crop&q=80"
  },
  {
    id: "news-3",
    category: "Vie Scolaire",
    title: "Journée d'Orientation Académique et Professionnelle",
    summary: "Une rencontre interactive organisée pour aider les classes de Seconde et de Première à affiner leur choix de filière pour le baccalauréat.",
    content: "Nos anciens lauréats, des professionnels de la médecine, de l'ingénierie civile, du droit et de l'innovation numérique sont venus échanger avec nos futurs bacheliers. Une riche journée de débats et d'ateliers interactifs qui suscite de magnifiques vocations scientifiques.",
    date: "24 Mai 2026",
    author: "Conseiller d'Orientation",
    image: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800&auto=format&fit=crop&q=80"
  }
];

// Core Upcoming events mockup
const UPCOMING_EVENTS = [
  { date: "02 Juil", title: "Réunion de Fin d'année des Parents", desc: "Bilan global à la salle de conférences" },
  { date: "15 Juil", title: "Publication officielle des Résultats", desc: "Baccalauréat & BFEM session 2026" },
  { date: "10 Sept", title: "Rentrée administrative", desc: "Distribution des tenues & manuels" }
];

export default function PublicEtablissementActualites() {
  const { slug } = useParams<{ slug: string }>();

  const school = useMemo(() => {
    return MOCK_SCHOOLS.find(s => s.slug === slug) || MOCK_SCHOOLS[0];
  }, [slug]);

  return (
    <div className="py-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8" id="school-news-root">
      
      {/* Return link */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
        <Link 
          to={`/etablissements/${school.slug}`}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-blue-600 transition-colors"
          id="back-to-profile-news"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour aux informations générales
        </Link>
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-100/30">
          <Bell className="h-3.5 w-3.5 text-emerald-600 animate-bounce" /> CANAL D'ANNONCES OFFICIELLES
        </span>
      </div>

      {/* Header Info Banner */}
      <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex gap-4 items-center">
          <SchoolLogo 
            src={school.logo_url} 
            name={school.nom} 
            sizeClassName="w-14 h-14"
          />
          <div>
            <h1 className="text-lg font-extrabold text-slate-800 tracking-tight leading-snug">Actualités & Annonces de l'école</h1>
            <p className="text-xs text-slate-400 font-bold mt-0.5">{school.nom}</p>
          </div>
        </div>
      </div>

      {/* Main split */}
      <div className="grid lg:grid-cols-3 gap-8" id="news-split">
        {/* Main News Stream - Left ColSpan 2 */}
        <div className="lg:col-span-2 space-y-6">
          {MOCK_NEWS.map((item, idx) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col sm:flex-row"
              id={`news-card-${item.id}`}
            >
              {/* Image banner for news */}
              <div className="w-full sm:w-1/3 relative h-48 sm:h-auto min-h-[180px] flex-shrink-0">
                <img 
                  src={item.image} 
                  alt={item.title} 
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
                <span className="absolute top-3 left-3 px-2.5 py-1 text-[9px] font-bold bg-blue-600 text-white uppercase rounded-md shadow-sm">
                  {item.category}
                </span>
              </div>

              {/* News Text Area */}
              <div className="p-6 flex-1 flex flex-col justify-between space-y-3">
                <div className="space-y-2">
                  <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-bold">
                    <Calendar className="h-3.5 w-3.5" />
                    <span>{item.date}</span>
                    <span className="text-slate-200">•</span>
                    <User className="h-3.5 w-3.5" />
                    <span className="truncate">{item.author}</span>
                  </div>
                  <h3 className="text-base font-bold text-slate-800 tracking-tight leading-snug">
                    {item.title}
                  </h3>
                  <p className="text-xs text-slate-500 leading-relaxed font-medium line-clamp-2">
                    {item.summary}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-50 flex items-center justify-between">
                  <button
                    onClick={() => alert(`Voici l'article complet :\n\n${item.content}`)}
                    className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
                    id={`btn-read-more-${item.id}`}
                  >
                    Lire l'article complet <ChevronRight className="h-4 w-4" />
                  </button>
                  <button 
                    onClick={() => alert("Lien de partage généré !")}
                    className="p-1.5 rounded-lg hover:bg-slate-50 text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    <Share2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Sidebar widgets */}
        <div className="space-y-6">
          {/* Agenda of Upcoming meetings & events */}
          <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <Calendar className="h-4 w-4 text-blue-600" /> Agenda Académique
            </h3>

            <div className="space-y-3.5">
              {UPCOMING_EVENTS.map((evt, idx) => (
                <div key={idx} className="flex gap-3.5 items-start">
                  <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-100/50 flex flex-col items-center justify-center flex-shrink-0">
                    <span className="text-xs font-black text-blue-700 leading-none">{evt.date.split(" ")[0]}</span>
                    <span className="text-[9px] font-bold text-blue-500 uppercase mt-0.5">{evt.date.split(" ")[1]}</span>
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-xs font-bold text-slate-800 truncate leading-snug">{evt.title}</h4>
                    <p className="text-[10px] text-slate-400 font-semibold mt-0.5 leading-normal">{evt.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Useful notes / administrative rules */}
          <div className="p-4 bg-blue-50/70 border border-blue-100/50 rounded-2xl text-xs text-blue-800 flex items-start gap-2.5">
            <Info className="h-4.5 w-4.5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Espace de confiance</p>
              <p className="font-medium text-[11px] text-blue-700 mt-0.5 leading-relaxed">
                Toutes les actualités affichées sur cette page proviennent directement du secrétariat du lycée par le biais du portail sécurisé d'administration SchoolNet, garantissant l'authenticité absolue des données.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
