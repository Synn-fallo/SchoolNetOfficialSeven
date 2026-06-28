import React, { useState, useMemo } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { 
  MapPin, 
  GraduationCap, 
  Award, 
  Phone, 
  Mail, 
  Calendar, 
  BookOpen, 
  Users, 
  CheckCircle, 
  Lock,
  ArrowLeft, 
  ArrowRight,
  Send,
  Building2,
  Clock,
  Heart,
  Share2,
  Globe,
  Bell
} from "lucide-react";
import { motion } from "motion/react";
import { EtablissementPublic } from "@/types/etablissement.types";
import SchoolLogo from "@/components/common/SchoolLogo";

// Match exactly the mock schools defined in the directory
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

export default function PublicEtablissementDetail() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  
  const [hasLiked, setHasLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  
  // Pre-registration form state
  const [formData, setFormData] = useState({
    parentNom: "",
    parentEmail: "",
    parentPhone: "",
    enfantNom: "",
    enfantClasse: "6eme",
    message: ""
  });
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Find exact school
  const school = useMemo(() => {
    const found = MOCK_SCHOOLS.find(s => s.slug === slug);
    if (found) {
      setLikesCount(found.likes_count);
    }
    return found;
  }, [slug]);

  if (!school) {
    return (
      <div className="py-20 text-center max-w-xl mx-auto px-4" id="detail-not-found">
        <Building2 className="h-16 w-16 text-slate-300 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Établissement introuvable</h2>
        <p className="text-slate-500 mb-6 text-sm">Le site que vous essayez d'explorer n'existe pas ou n'est pas encore répertorié.</p>
        <Link to="/etablissements" className="px-5 py-2.5 rounded-xl bg-blue-600 text-white font-bold text-xs hover:bg-blue-700 transition-colors inline-flex items-center gap-1.5 shadow">
          <ArrowLeft className="h-4 w-4" /> Retour à l'annuaire
        </Link>
      </div>
    );
  }

  const handleLike = () => {
    if (hasLiked) {
      setLikesCount(prev => prev - 1);
    } else {
      setLikesCount(prev => prev + 1);
    }
    setHasLiked(!hasLiked);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitted(true);
    setTimeout(() => {
      // Auto-reset form after notification
      setIsSubmitted(false);
      setFormData({
        parentNom: "",
        parentEmail: "",
        parentPhone: "",
        enfantNom: "",
        enfantClasse: "6eme",
        message: ""
      });
    }, 4500);
  };

  return (
    <div className="py-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8" id="school-detail-root">
      {/* Navigation & Actions Breadcrumb */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <Link 
          to="/etablissements"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-blue-600 transition-colors"
          id="back-to-directory"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour à l'annuaire national
        </Link>
        
        <div className="flex items-center gap-2.5">
          <button 
            onClick={handleLike}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all ${
              hasLiked 
                ? "bg-rose-50 border-rose-200 text-rose-600" 
                : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
            }`}
            id="like-school-button"
          >
            <Heart className={`h-4 w-4 ${hasLiked ? "fill-rose-500 text-rose-500" : ""}`} />
            <span>{likesCount} Recommandations</span>
          </button>
          
          <button 
            onClick={() => alert("Lien copié dans votre presse-papiers !")}
            className="p-2 rounded-xl border border-slate-200 bg-white text-slate-500 hover:text-slate-800 hover:bg-slate-50 transition-colors"
            title="Partager"
            id="share-school-button"
          >
            <Share2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Modern School Showcase Hero Cover */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-10 text-white relative overflow-hidden shadow-lg" id="school-hero-banner">
        <div className="absolute right-0 bottom-0 top-0 w-1/3 opacity-10 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-400 via-emerald-400 to-transparent pointer-events-none hidden md:block"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row gap-6 md:items-center justify-between">
          <div className="flex flex-col sm:flex-row gap-5 sm:items-center">
            <SchoolLogo 
              src={school.logo_url} 
              name={school.nom} 
              sizeClassName="w-20 h-20 sm:w-24 sm:h-24"
              className="border-2 border-white/20 shadow-lg"
            />
            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-md text-[10px] font-extrabold bg-blue-500/80 text-white uppercase tracking-wider">
                  {school.type_etablissement}
                </span>
                {["etab-lycee-demba", "etab-sainte-marie", "etab-blaise-diagne", "etab-prytanee"].includes(school.id) ? (
                  <span className="px-2.5 py-0.5 rounded-md text-[10px] font-extrabold bg-emerald-500 text-white uppercase tracking-wider flex items-center gap-0.5">
                    <CheckCircle className="h-3 w-3" /> Abonnement Actif
                  </span>
                ) : (
                  <span className="px-2.5 py-0.5 rounded-md text-[10px] font-extrabold bg-slate-600 text-slate-300 uppercase tracking-wider flex items-center gap-0.5">
                    <Lock className="h-3 w-3" /> Standard
                  </span>
                )}
                {school.badge_annuaire && (
                  <span className="px-2.5 py-0.5 rounded-md text-[10px] font-extrabold bg-amber-500 text-slate-900 uppercase tracking-wider flex items-center gap-0.5">
                    <Award className="h-3 w-3" /> {school.badge_annuaire}
                  </span>
                )}
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight font-sans leading-tight">
                {school.nom}
              </h1>
              <p className="text-sm text-slate-300 font-medium flex items-center gap-1">
                <MapPin className="h-4 w-4 text-slate-400 flex-shrink-0" />
                <span>{school.ville}, {school.region} — Sénégal</span>
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Link 
              to={`/etablissements/${school.slug}/site`}
              className="px-6 py-3 rounded-xl bg-white hover:bg-slate-50 text-slate-900 font-bold text-xs text-center transition-all flex items-center justify-center gap-1.5 shadow-md"
              id="hero-visit-site"
            >
              <Globe className="h-4 w-4 text-blue-600" />
              Visiter le Site Web Premium
            </Link>
            <Link 
              to={`/etablissements/${school.slug}/actualites`}
              className="px-5 py-3 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-slate-200 border border-white/10 font-bold text-xs text-center transition-colors flex items-center justify-center gap-1.5"
              id="hero-view-news"
            >
              <Bell className="h-4 w-4 text-emerald-400" />
              Actualités Officielles
            </Link>
          </div>
        </div>
      </div>

      {/* Main Split Layout */}
      <div className="grid lg:grid-cols-3 gap-8" id="school-detail-split">
        
        {/* Left Column: Mission, Key features, contact info (ColSpan 2) */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Section: Presentation */}
          <div className="bg-white rounded-3xl border border-slate-100 p-6 sm:p-8 shadow-sm space-y-4">
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-blue-600" /> Présentation & Historique
            </h2>
            <p className="text-slate-600 text-sm leading-relaxed font-medium">
              {school.description_courte}
            </p>
            <p className="text-slate-500 text-xs leading-relaxed">
              Fondé sur des valeurs de rigueur intellectuelle, de civisme et de solidarité, le {school.nom} est reconnu comme un acteur pilier de l'éducation nationale. L'école s'est dotée d'équipements de pointe et de portails en ligne afin d'assurer l'excellence et la cohésion éducative entre enseignants, encadrants scolaires et familles.
            </p>

            {/* Cycles block */}
            <div className="mt-6 grid sm:grid-cols-2 gap-4 pt-6 border-t border-slate-100">
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Cycles d'études dispensés</p>
                <p className="text-xs font-bold text-slate-700 leading-relaxed">{school.cycles}</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Spécialités & Options</p>
                <p className="text-xs font-bold text-slate-700 leading-relaxed">{school.options}</p>
              </div>
            </div>
          </div>

          {/* Section: Key Figures / Success indicators */}
          <div className="bg-white rounded-3xl border border-slate-100 p-6 sm:p-8 shadow-sm space-y-6">
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <Award className="h-5 w-5 text-amber-500" /> Indicateurs de Performance & Réussite
            </h2>
            
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100/70 text-center">
                <p className="text-2xl font-extrabold text-slate-800">{school.taux_reussite}%</p>
                <p className="text-[10px] text-slate-400 font-bold mt-1 uppercase">Taux Réussite Bac</p>
              </div>
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100/70 text-center">
                <p className="text-2xl font-extrabold text-blue-600">98%</p>
                <p className="text-[10px] text-slate-400 font-bold mt-1 uppercase">Taux d'accès 2nd</p>
              </div>
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100/70 text-center">
                <p className="text-2xl font-extrabold text-emerald-600">850+</p>
                <p className="text-[10px] text-slate-400 font-bold mt-1 uppercase">Élèves encadrés</p>
              </div>
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100/70 text-center">
                <p className="text-2xl font-extrabold text-indigo-600">42</p>
                <p className="text-[10px] text-slate-400 font-bold mt-1 uppercase">Professeurs Agrégés</p>
              </div>
            </div>

            <div className="p-4 bg-emerald-50 border border-emerald-100/50 rounded-2xl text-xs text-emerald-800 flex items-start gap-2.5">
              <CheckCircle className="h-4.5 w-4.5 text-emerald-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-bold">Label Excellence Scolaire</p>
                <p className="font-medium text-[11px] text-emerald-700 leading-relaxed mt-0.5">
                  Cet établissement figure dans le top des classements nationaux basés sur les résultats au Concours Général et le taux d'obtention de mentions 'Très Bien' et 'Bien' aux examens d'État.
                </p>
              </div>
            </div>
          </div>

          {/* Section: Testimonial or Vision card */}
          <div className="bg-slate-50 rounded-3xl p-6 sm:p-8 border border-slate-100 relative">
            <span className="text-5xl text-blue-200 font-serif absolute top-2 left-4">“</span>
            <div className="relative z-10 space-y-3 pl-4">
              <p className="text-xs text-slate-500 font-semibold italic leading-relaxed">
                Notre ambition n'est pas seulement de préparer nos élèves aux examens nationaux, mais d'ériger des citoyens épanouis, ouverts sur le monde, porteurs de rigueur intellectuelle et de fierté nationale. Le portail numérique unifié renforce cette synergie quotidienne indispensable entre parents, élèves et administration.
              </p>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-slate-200 flex-shrink-0"></div>
                <div>
                  <p className="text-xs font-bold text-slate-800">M. El Hadji Demba Diop</p>
                  <p className="text-[10px] text-slate-400 font-semibold">Proviseur de l'Établissement</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Pre-registration widget and official contacts */}
        <div className="space-y-6">
          
          {/* Interactive Pre-Registration Form for Parents */}
          <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm space-y-5" id="parent-inquiry-box">
            <div className="space-y-1">
              <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-emerald-50 text-emerald-700 uppercase tracking-wide border border-emerald-200/50">Service Parents</span>
              <h3 className="text-base font-bold text-slate-800 mt-1.5">Formulaire de Pré-inscription</h3>
              <p className="text-xs text-slate-400 font-medium">Prenez contact directement avec l'administration de l'établissement.</p>
            </div>

            {isSubmitted ? (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-emerald-50 border border-emerald-200/50 rounded-2xl p-5 text-center space-y-2"
                id="form-success-alert"
              >
                <CheckCircle className="h-10 w-10 text-emerald-500 mx-auto" />
                <h4 className="text-xs font-bold text-emerald-800">Demande envoyée !</h4>
                <p className="text-[11px] text-emerald-600 font-medium leading-relaxed">
                  Votre formulaire de contact / pré-inscription a été envoyé avec succès à l'administration du lycée. Un responsable reviendra vers vous par email sous 48h.
                </p>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-3.5" id="pre-reg-form">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Votre Nom Complet</label>
                  <input
                    type="text"
                    required
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/15 focus:border-blue-500 text-xs font-semibold"
                    placeholder="Ex: Madame Diop"
                    value={formData.parentNom}
                    onChange={(e) => setFormData({...formData, parentNom: e.target.value})}
                  />
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Votre Email</label>
                    <input
                      type="email"
                      required
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/15 focus:border-blue-500 text-xs font-semibold"
                      placeholder="nom@mail.com"
                      value={formData.parentEmail}
                      onChange={(e) => setFormData({...formData, parentEmail: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Téléphone</label>
                    <input
                      type="tel"
                      required
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/15 focus:border-blue-500 text-xs font-semibold"
                      placeholder="77 123 45 67"
                      value={formData.parentPhone}
                      onChange={(e) => setFormData({...formData, parentPhone: e.target.value})}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Nom de l'élève</label>
                    <input
                      type="text"
                      required
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/15 focus:border-blue-500 text-xs font-semibold"
                      placeholder="Ex: Fatou Diop"
                      value={formData.enfantNom}
                      onChange={(e) => setFormData({...formData, enfantNom: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Classe demandée</label>
                    <select
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/15 focus:border-blue-500 text-xs font-bold text-slate-700 bg-white"
                      value={formData.enfantClasse}
                      onChange={(e) => setFormData({...formData, enfantClasse: e.target.value})}
                    >
                      <option value="6eme">6ème (Moyen)</option>
                      <option value="5eme">5ème (Moyen)</option>
                      <option value="4eme">4ème (Moyen)</option>
                      <option value="3eme">3ème (Moyen)</option>
                      <option value="2nde">Seconde (Lycée)</option>
                      <option value="1ere">Première (Lycée)</option>
                      <option value="terminale">Terminale (Lycée)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Précisions ou Message</label>
                  <textarea
                    rows={3}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/15 focus:border-blue-500 text-xs font-semibold resize-none"
                    placeholder="Saisissez vos questions pour le proviseur ou le bureau d'études..."
                    value={formData.message}
                    onChange={(e) => setFormData({...formData, message: e.target.value})}
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-sm"
                  id="btn-submit-pre-reg"
                >
                  Envoyer la Demande <Send className="h-3.5 w-3.5" />
                </button>
              </form>
            )}
          </div>

          {/* Core Contacts Widget */}
          <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm space-y-4" id="school-contacts-box">
            <h3 className="text-sm font-bold text-slate-800">Coordonnées de l'Administration</h3>
            
            <div className="space-y-3.5 text-xs text-slate-600 font-medium">
              <div className="flex items-start gap-2.5">
                <MapPin className="h-4 w-4 text-slate-400 mt-0.5 flex-shrink-0" />
                <span>Avenue Seydou Nourou Tall, Fann Résidence, Dakar, Sénégal</span>
              </div>
              
              <div className="flex items-center gap-2.5">
                <Phone className="h-4 w-4 text-slate-400 flex-shrink-0" />
                <span>+221 33 824 10 20</span>
              </div>

              <div className="flex items-center gap-2.5">
                <Mail className="h-4 w-4 text-slate-400 flex-shrink-0" />
                <span>contact@lyceetall.edu.sn</span>
              </div>

              <div className="flex items-center gap-2.5">
                <Clock className="h-4 w-4 text-slate-400 flex-shrink-0" />
                <span>Lundi au Vendredi : 08h00 — 17h00</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
