import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { 
  TrendingUp, Users, BookOpen, Clock, Calendar, MessageSquare, 
  ChevronRight, Award, Bell, ShieldCheck, ArrowLeft, ArrowRight, Megaphone,
  DollarSign, Building2, UserCheck, Shield, BookOpenCheck, Activity,
  PlusCircle, Mail, Phone, MapPin, Check, Sparkles, Star
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useActiveEtablissement } from "@/hooks/useActiveEtablissement";

export default function Dashboard() {
  const { activeRole, profile, user, loading } = useAuth();
  const { activeEtablissement } = useActiveEtablissement();
  const navigate = useNavigate();

  React.useEffect(() => {
    if (!loading && !user) {
      navigate("/");
    }
  }, [user, loading, navigate]);

  // Wizard state for visitor establishment creation
  const [showWizard, setShowWizard] = useState(false);
  const [wizardStep, setWizardStep] = useState(1);
  const [successMsg, setSuccessMsg] = useState(false);
  
  const [formData, setFormData] = useState({
    ecoleNom: "",
    ecoleType: "Lycée Public",
    ecoleRegion: "Dakar",
    ecoleVille: "",
    ecolePhone: "",
    ecoleEmail: "",
    demandeurFonction: "Directeur",
    demandeurPhone: "",
    selectedPlan: "premium" // default to premium showcase
  });

  // Mock list of requests submitted by the visitor
  const [visitorRequests, setVisitorRequests] = useState([
    {
      id: "req-01",
      ecoleNom: "École Fondamentale de Pikine",
      ecoleType: "École Primaire",
      date: "28 Juin 2026",
      status: "En attente",
      plan: "Standard"
    }
  ]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleWizardSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (wizardStep < 3) {
      setWizardStep(prev => prev + 1);
    } else {
      // Final submission simulation
      const newRequest = {
        id: `req-${Date.now()}`,
        ecoleNom: formData.ecoleNom,
        ecoleType: formData.ecoleType,
        date: "Aujourd'hui",
        status: "En attente",
        plan: formData.selectedPlan === "premium" ? "Premium" : "Standard"
      };
      setVisitorRequests(prev => [newRequest, ...prev]);
      setSuccessMsg(true);
      setShowWizard(false);
      setWizardStep(1);
    }
  };

  const resetWizard = () => {
    setShowWizard(false);
    setWizardStep(1);
    setSuccessMsg(false);
    setFormData({
      ecoleNom: "",
      ecoleType: "Lycée Public",
      ecoleRegion: "Dakar",
      ecoleVille: "",
      ecolePhone: "",
      ecoleEmail: "",
      demandeurFonction: "Directeur",
      demandeurPhone: "",
      selectedPlan: "premium"
    });
  };

  // Dynamic content based on simulation role
  const getDashboardData = () => {
    switch (activeRole) {
      case "autorite":
        return {
          title: "Supervision Académique & Administrative",
          subtitle: "Direction Départementale de l'Enseignement Technique et Professionnel (DDETP)",
          kpis: [
            { label: "Établissements suivis", value: "14 Centres", change: "100% connectés", icon: Building2, color: "blue" },
            { label: "Effectif global", value: "6 852 Élèves", change: "Filière technique", icon: Users, color: "indigo" },
            { label: "Taux d'insertion pro", value: "84.2 %", change: "+3.5% vs 2025", icon: TrendingUp, color: "emerald" },
            { label: "Demandes d'agrément", value: "3 En attente", change: "À traiter ce mois", icon: BookOpen, color: "amber" }
          ],
          actions: [
            { label: "Inspecter les établissements", href: "/autorite/etablissements" },
            { label: "Traiter les demandes d'accréditation", href: "/autorite/demandes", badge: "3 nouvelles" },
            { label: "Consulter les statistiques d'insertion", href: "/autorite/statistiques" }
          ],
          events: [
            { title: "Commission Départementale de Planification", date: "02 Juil", desc: "Orientation post-brevet technique et professionnel", type: "Orientation" },
            { title: "Lancement de la campagne d'inspection", date: "08 Juil", desc: "Visite de conformité des plateaux techniques", type: "Inspection" }
          ]
        };

      case "chef_etablissement":
        return {
          title: "Supervision de l'Établissement",
          subtitle: "Pilotage général et indicateurs de performance",
          kpis: [
            { label: "Scolarité collectée", value: "85.4 %", change: "+4.2% ce mois", icon: DollarSign, color: "emerald" },
            { label: "Effectif Total", value: "482 Élèves", change: "99% inscrits", icon: Users, color: "blue" },
            { label: "Enseignants Actifs", value: "32 Profs", change: "100% assignés", icon: Award, color: "purple" },
            { label: "Taux de présence", value: "96.5 %", change: "Stable", icon: Clock, color: "amber" }
          ],
          actions: [
            { label: "Valider les auto-inscriptions", href: "/demandes-auto-inscription", badge: "4 nouvelles" },
            { label: "Publier une annonce officielle", href: "/communication-officielle" },
            { label: "Consulter le bilan comptable", href: "/scolarite" }
          ],
          events: [
            { title: "Conseil de Direction Pédagogique", date: "30 Juin", desc: "Sujet: Préparations examens de fin d'année", type: "Officiel" },
            { title: "Réunion budgétaire trimestrielle", date: "05 Juil", desc: "Clôture de l'exercice financier 2026", type: "Budget" }
          ]
        };

      case "enseignant":
        return {
          title: "Espace Enseignant",
          subtitle: "Gestion de vos cours, cahiers de texte et évaluations",
          kpis: [
            { label: "Moyenne des classes", value: "13.9 / 20", change: "+0.4 ce trimestre", icon: TrendingUp, color: "blue" },
            { label: "Heures de cours", value: "18h / semaine", change: "Emploi du temps stable", icon: Clock, color: "indigo" },
            { label: "Cahier de texte complété", value: "94 %", change: "À jour", icon: BookOpenCheck, color: "emerald" },
            { label: "Évaluations prévues", value: "3 Devoirs", change: "Saisie ouverte", icon: Calendar, color: "amber" }
          ],
          actions: [
            { label: "Saisir les notes du 3e Trimestre", href: "/notes", badge: "Urgent" },
            { label: "Remplir le cahier de texte", href: "/cahier-texte" },
            { label: "Programmer un rendez-vous parent", href: "/rendez-vous" }
          ],
          events: [
            { title: "Conseil de Classe - Terminale S1", date: "29 Juin", desc: "Lieu: Salle des Actes • 14h30", type: "Officiel" },
            { title: "Remise des projets de Technologie", date: "03 Juil", desc: "Classes de Seconde A & B", type: "Évaluation" }
          ]
        };

      case "parent":
        return {
          title: "Espace Parent d'Élève",
          subtitle: "Suivi de la scolarité de vos enfants",
          kpis: [
            { label: "Moyenne (Moussa Diop)", value: "14.5 / 20", change: "2e de sa classe", icon: Award, color: "emerald" },
            { label: "Frais de scolarité", value: "Saisie à jour", change: "Aucun impayé", icon: DollarSign, color: "blue" },
            { label: "Absences signalées", value: "1 Absence", change: "Justifiée", icon: Clock, color: "rose" },
            { label: "Rendez-vous à venir", value: "1 RDV prévu", change: "M. Ndiaye (Maths)", icon: Calendar, color: "amber" }
          ],
          actions: [
            { label: "Voir les annonces de l'établissement", href: "/parent/annonces" },
            { label: "Effectuer un paiement en ligne", href: "/paiements" },
            { label: "Inscrire un autre enfant", href: "/auto-inscription" }
          ],
          events: [
            { title: "Rencontre Parents-Enseignants", date: "04 Juil", desc: "Lieu: Gymnase • À partir de 16h", type: "Important" },
            { title: "Fête de fin d'année scolaire", date: "10 Juil", desc: "Spectacle des élèves et buffet de l'APE", type: "Loisir" }
          ]
        };

      case "eleve":
        return {
          title: "Espace Élève",
          subtitle: "Consultez vos notes, devoirs et cahiers de texte",
          kpis: [
            { label: "Votre moyenne", value: "12.8 / 20", change: "Rang: 14e / 38", icon: Award, color: "blue" },
            { label: "Cours aujourd'hui", value: "6 Heures", change: "Emploi du temps à jour", icon: Clock, color: "indigo" },
            { label: "Devoirs en retard", value: "0 Devoir", change: "Excellent travail !", icon: BookOpenCheck, color: "emerald" },
            { label: "Retards signalés", value: "0 Retard", change: "Parfaite assiduité", icon: Activity, color: "amber" }
          ],
          actions: [
            { label: "Consulter vos notes d'examens", href: "/notes" },
            { label: "Voir vos devoirs à rendre", href: "/devoirs" },
            { label: "Lire les annonces scolaires", href: "/annonces" }
          ],
          events: [
            { title: "Devoir de Mathématiques (Coeff 3)", date: "30 Juin", desc: "Sujet: Fonctions et Logarithmes", type: "Devoir" },
            { title: "Sortie pédagogique - Musée des Civilisations", date: "02 Juil", desc: "Départ 08h00 devant le lycée", type: "Sortie" }
          ]
        };

      default:
        return null;
    }
  };

  const dashboardData = getDashboardData();

  // ------------------ RENDERING IF VISITOR OR DEFAULT ------------------
  if (activeRole === "visiteur" || !activeRole) {
    return (
      <div className="py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto animate-in fade-in duration-300" id="visitor-dashboard-root">
        {/* Visitor Banner */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6 sm:p-8 rounded-3xl shadow-lg mb-8 relative overflow-hidden" id="visitor-banner">
          <div className="absolute right-0 bottom-0 top-0 w-1/3 opacity-15 bg-[radial-gradient(ellipse_at_bottom_right,_var(--tw-gradient-stops))] from-blue-400 via-emerald-400 to-transparent pointer-events-none hidden md:block"></div>
          <div className="relative z-10">
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-blue-600 text-white uppercase tracking-wider mb-3">
              Espace Visiteur SchoolNet
            </span>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight leading-none mb-3">
              Bienvenue, {profile?.prenom || "Visiteur"} {profile?.nom || ""}
            </h1>
            <p className="text-slate-300 text-xs sm:text-sm max-w-2xl leading-relaxed">
              Vous êtes actuellement connecté en tant que visiteur d'annuaire. Pour inscrire votre propre école, profiler vos classes et exploiter les portails SchoolNet, soumettez une demande d'affiliation officielle.
            </p>
          </div>
        </div>

        {/* Success message banner */}
        {successMsg && (
          <div className="mb-8 p-6 bg-emerald-50 border border-emerald-100 rounded-3xl flex items-start gap-4 animate-in slide-in-from-top-3 duration-300" id="success-request-banner">
            <div className="p-3 bg-emerald-500 text-white rounded-2xl flex-shrink-0">
              <Check className="h-6 w-6" />
            </div>
            <div className="space-y-1">
              <h3 className="font-bold text-slate-800 text-sm">Demande enregistrée avec succès !</h3>
              <p className="text-xs text-slate-600 leading-relaxed font-medium">
                Votre demande de création d'établissement pour <strong className="font-extrabold text-slate-800">"{formData.ecoleNom}"</strong> a été transmise aux administrateurs de SchoolNet. Notre équipe procède à la vérification sous 24 heures ouvrées. Vous recevrez une confirmation d'activation par email.
              </p>
              <button 
                onClick={() => setSuccessMsg(false)}
                className="text-xs text-emerald-700 font-bold hover:underline mt-2 block"
              >
                Masquer ce message
              </button>
            </div>
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-8" id="visitor-split-layout">
          {/* Main Column */}
          <div className="lg:col-span-2 space-y-8">
            {/* WIZARD FORM ACTIVE */}
            {showWizard ? (
              <div className="bg-white rounded-3xl border border-slate-100 p-6 sm:p-8 shadow-md relative" id="wizard-form-container">
                {/* Wizard Header */}
                <div className="flex justify-between items-center border-b border-slate-50 pb-5 mb-6">
                  <div>
                    <h2 className="text-lg font-black text-slate-800 tracking-tight">Demande de création d'établissement</h2>
                    <p className="text-xs text-slate-400 mt-1 font-medium">Suivez les étapes pour affilier votre structure</p>
                  </div>
                  <button 
                    onClick={resetWizard}
                    className="px-3 py-1.5 rounded-xl border border-slate-100 hover:bg-slate-50 text-slate-500 font-bold text-xs transition-colors"
                  >
                    Annuler
                  </button>
                </div>

                {/* Wizard Progress indicator */}
                <div className="grid grid-cols-3 gap-2 mb-8">
                  {[1, 2, 3].map((s) => (
                    <div key={s} className="flex flex-col gap-1.5">
                      <div className={`h-2.5 rounded-full transition-all duration-300 ${s <= wizardStep ? "bg-blue-600" : "bg-slate-100"}`} />
                      <span className={`text-[10px] font-bold uppercase tracking-wider text-center ${s === wizardStep ? "text-blue-600" : "text-slate-400"}`}>
                        Étape {s}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Form Elements */}
                <form onSubmit={handleWizardSubmit} className="space-y-6">
                  {/* STEP 1: ECOLE DETAILS */}
                  {wizardStep === 1 && (
                    <div className="space-y-4 animate-in fade-in duration-300">
                      <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Identité de l'établissement</h3>
                      
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-600 block">Nom complet de l'établissement *</label>
                        <input
                          type="text"
                          required
                          placeholder="Ex: Complexe Scolaire d'Excellence Cheikh Anta Diop"
                          value={formData.ecoleNom}
                          onChange={(e) => handleInputChange("ecoleNom", e.target.value)}
                          className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-50/50 transition-all outline-none text-xs font-semibold text-slate-700"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-slate-600 block">Type d'établissement *</label>
                          <select
                            value={formData.ecoleType}
                            onChange={(e) => handleInputChange("ecoleType", e.target.value)}
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-50/50 transition-all outline-none text-xs font-bold text-slate-700"
                          >
                            <option value="École Maternelle">École Maternelle</option>
                            <option value="École Primaire">École Primaire</option>
                            <option value="Collège d'Enseignement Moyen">Collège Moyen (CEM)</option>
                            <option value="Lycée Public">Lycée Public</option>
                            <option value="Lycée Privé">Lycée Privé</option>
                            <option value="Université / Institut">Université / Institut</option>
                          </select>
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-slate-600 block">Région Scolaire *</label>
                          <select
                            value={formData.ecoleRegion}
                            onChange={(e) => handleInputChange("ecoleRegion", e.target.value)}
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-50/50 transition-all outline-none text-xs font-bold text-slate-700"
                          >
                            <option value="Dakar">Dakar</option>
                            <option value="Diourbel">Diourbel</option>
                            <option value="Fatick">Fatick</option>
                            <option value="Kaffrine">Kaffrine</option>
                            <option value="Kaolack">Kaolack</option>
                            <option value="Kédougou">Kédougou</option>
                            <option value="Kolda">Kolda</option>
                            <option value="Louga">Louga</option>
                            <option value="Matam">Matam</option>
                            <option value="Saint-Louis">Saint-Louis</option>
                            <option value="Sédhiou">Sédhiou</option>
                            <option value="Tambacounda">Tambacounda</option>
                            <option value="Thiès">Thiès</option>
                            <option value="Ziguinchor">Ziguinchor</option>
                          </select>
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-600 block">Ville / Localité *</label>
                        <input
                          type="text"
                          required
                          placeholder="Ex: Rufisque"
                          value={formData.ecoleVille}
                          onChange={(e) => handleInputChange("ecoleVille", e.target.value)}
                          className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-50/50 transition-all outline-none text-xs font-semibold text-slate-700"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-slate-600 block">Téléphone Officiel *</label>
                          <input
                            type="tel"
                            required
                            placeholder="Ex: +221 33 824 55 55"
                            value={formData.ecolePhone}
                            onChange={(e) => handleInputChange("ecolePhone", e.target.value)}
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-50/50 transition-all outline-none text-xs font-semibold text-slate-700"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-slate-600 block">Email Officiel *</label>
                          <input
                            type="email"
                            required
                            placeholder="Ex: contact@ecole-excellence.sn"
                            value={formData.ecoleEmail}
                            onChange={(e) => handleInputChange("ecoleEmail", e.target.value)}
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-50/50 transition-all outline-none text-xs font-semibold text-slate-700"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* STEP 2: DEMANDEUR DETAILS */}
                  {wizardStep === 2 && (
                    <div className="space-y-4 animate-in fade-in duration-300">
                      <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Votre rôle de Chef d'Établissement</h3>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                        <div>
                          <p className="text-[10px] font-bold text-slate-400 uppercase">Demandeur connecté</p>
                          <p className="text-xs font-bold text-slate-800 mt-1">{profile?.prenom || "N/A"} {profile?.nom || ""}</p>
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-slate-400 uppercase">Email du compte</p>
                          <p className="text-xs font-bold text-slate-800 mt-1 font-mono">{user?.email || "N/A"}</p>
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-600 block">Votre Fonction officielle *</label>
                        <select
                          value={formData.demandeurFonction}
                          onChange={(e) => handleInputChange("demandeurFonction", e.target.value)}
                          className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-50/50 transition-all outline-none text-xs font-bold text-slate-700"
                        >
                          <option value="Proviseur">Proviseur / Proviseure</option>
                          <option value="Directeur d'Établissement">Directeur / Directrice</option>
                          <option value="Censeur des Études">Censeur / Censeure</option>
                          <option value="Promoteur / Fondateur scolaire">Promoteur / Fondateur</option>
                          <option value="Adjoint administratif chargé d'inscription">Adjoint administratif</option>
                        </select>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-600 block">Téléphone Professionnel Direct *</label>
                        <input
                          type="tel"
                          required
                          placeholder="Ex: +221 77 654 32 10"
                          value={formData.demandeurPhone}
                          onChange={(e) => handleInputChange("demandeurPhone", e.target.value)}
                          className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-50/50 transition-all outline-none text-xs font-semibold text-slate-700"
                        />
                      </div>
                    </div>
                  )}

                  {/* STEP 3: SELECT PLAN */}
                  {wizardStep === 3 && (
                    <div className="space-y-5 animate-in fade-in duration-300">
                      <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Sélectionnez votre niveau d'inscription</h3>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Plan Freemium */}
                        <div 
                          onClick={() => handleInputChange("selectedPlan", "standard")}
                          className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex flex-col justify-between ${
                            formData.selectedPlan === "standard" 
                              ? "border-blue-500 bg-blue-50/10 shadow-sm" 
                              : "border-slate-100 bg-white hover:border-slate-200"
                          }`}
                        >
                          <div>
                            <div className="flex justify-between items-start">
                              <span className="px-2 py-0.5 rounded-md text-[8px] font-extrabold bg-slate-100 text-slate-700 uppercase">BASE</span>
                              <div className={`h-4.5 w-4.5 rounded-full border flex items-center justify-center ${
                                formData.selectedPlan === "standard" ? "border-blue-500 bg-blue-600 text-white" : "border-slate-200"
                              }`}>
                                {formData.selectedPlan === "standard" && <Check className="h-3 w-3 stroke-[3]" />}
                              </div>
                            </div>
                            <h4 className="font-extrabold text-slate-800 text-xs mt-3">Plan Freemium</h4>
                            <p className="text-[10px] text-slate-500 mt-1 font-medium leading-relaxed">
                              Référencement national de l'école dans l'annuaire public avec coordonnées.
                            </p>
                          </div>
                          <div className="text-xs font-extrabold text-slate-800 mt-4">Gratuit</div>
                        </div>

                        {/* Plan Essentiel */}
                        <div 
                          onClick={() => handleInputChange("selectedPlan", "essentiel")}
                          className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex flex-col justify-between ${
                            formData.selectedPlan === "essentiel" 
                              ? "border-indigo-500 bg-indigo-50/10 shadow-sm" 
                              : "border-slate-100 bg-white hover:border-slate-200"
                          }`}
                        >
                          <div>
                            <div className="flex justify-between items-start">
                              <span className="px-2 py-0.5 rounded-md text-[8px] font-extrabold bg-indigo-100 text-indigo-800 uppercase">SUIVI</span>
                              <div className={`h-4.5 w-4.5 rounded-full border flex items-center justify-center ${
                                formData.selectedPlan === "essentiel" ? "border-indigo-500 bg-indigo-600 text-white" : "border-slate-200"
                              }`}>
                                {formData.selectedPlan === "essentiel" && <Check className="h-3 w-3 stroke-[3]" />}
                              </div>
                            </div>
                            <h4 className="font-extrabold text-slate-800 text-xs mt-3">Plan Essentiel</h4>
                            <p className="text-[10px] text-slate-500 mt-1 font-medium leading-relaxed">
                              Déploie les portails connectés élèves et parents pour le suivi pédagogique des notes.
                            </p>
                          </div>
                          <div className="text-xs font-extrabold text-indigo-600 mt-4">14 900 F / mois</div>
                        </div>

                        {/* Plan Premium */}
                        <div 
                          onClick={() => handleInputChange("selectedPlan", "premium")}
                          className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex flex-col justify-between relative overflow-hidden ${
                            formData.selectedPlan === "premium" 
                              ? "border-amber-400 bg-amber-50/5 shadow-sm" 
                              : "border-slate-100 bg-white hover:border-slate-200"
                          }`}
                        >
                          <div className="absolute -right-12 -top-12 h-20 w-20 bg-amber-500/10 rotate-45 pointer-events-none"></div>
                          <div>
                            <div className="flex justify-between items-start">
                              <span className="px-2 py-0.5 rounded-md text-[8px] font-extrabold bg-amber-100 text-amber-800 uppercase flex items-center gap-0.5">
                                <Sparkles className="h-2.5 w-2.5 fill-amber-500 text-amber-500" /> RECOMMANDÉ
                              </span>
                              <div className={`h-4.5 w-4.5 rounded-full border flex items-center justify-center ${
                                formData.selectedPlan === "premium" ? "border-amber-500 bg-amber-500 text-white" : "border-slate-200"
                              }`}>
                                {formData.selectedPlan === "premium" && <Check className="h-3 w-3 stroke-[3]" />}
                              </div>
                            </div>
                            <h4 className="font-extrabold text-slate-800 text-xs mt-3">Abonnement Premium</h4>
                            <p className="text-[10px] text-slate-500 mt-1 font-medium leading-relaxed">
                              Site Web Vitrine interactif complet de l'école, fil d'actualités et portails de suivi.
                            </p>
                          </div>
                          <div className="text-xs font-extrabold text-amber-600 mt-4 flex items-center gap-1">
                            <span>24 900 F / mois</span>
                          </div>
                        </div>
                      </div>

                      <div className="p-3 bg-blue-50/40 border border-blue-100/50 rounded-xl text-[10px] text-blue-800 font-medium leading-relaxed">
                        ⚠️ En sélectionnant l'offre premium, le site officiel vitrine associé sera automatiquement généré lors de la validation administrative sous le format unique <code className="font-mono bg-blue-100/60 px-1 py-0.5 rounded text-blue-900">schoolnet.sn/etablissements/[nom-de-votre-ecole]</code>.
                      </div>
                    </div>
                  )}

                  {/* Actions buttons */}
                  <div className="flex justify-between pt-5 border-t border-slate-50">
                    <button
                      type="button"
                      disabled={wizardStep === 1}
                      onClick={() => setWizardStep(prev => prev - 1)}
                      className="py-2.5 px-4 rounded-xl text-xs font-bold text-slate-400 hover:text-slate-700 hover:bg-slate-50 transition-colors flex items-center gap-1 disabled:opacity-30 disabled:pointer-events-none"
                    >
                      <ArrowLeft className="h-4 w-4" />
                      Étape précédente
                    </button>

                    <button
                      type="submit"
                      className="py-2.5 px-5 rounded-xl bg-blue-600 hover:bg-blue-700 text-xs font-bold text-white transition-all flex items-center gap-1.5 shadow-sm"
                    >
                      <span>{wizardStep === 3 ? "Soumettre ma Demande" : "Étape suivante"}</span>
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  </div>
                </form>
              </div>
            ) : (
              /* WIZARD NOT ACTIVE - VISITOR DASHBOARD HOMEPAGE */
              <div className="space-y-8" id="visitor-overview-panel">
                {/* Promo/Invitation Card */}
                <div className="bg-white rounded-3xl border border-slate-100 p-6 sm:p-8 shadow-sm flex flex-col md:flex-row gap-6 justify-between items-center relative overflow-hidden" id="invitation-card">
                  <div className="space-y-2.5 text-center md:text-left">
                    <h2 className="text-lg font-black text-slate-800 tracking-tight leading-none">Inscrire ou affilier un établissement</h2>
                    <p className="text-slate-500 text-xs sm:text-sm max-w-md leading-relaxed font-medium">
                      Débutez la numérisation de votre école. Ajoutez vos cycles d'enseignement et ouvrez les portails connectés en ligne pour votre communauté !
                    </p>
                  </div>
                  <button
                    onClick={() => setShowWizard(true)}
                    className="shrink-0 flex items-center gap-2 py-3.5 px-6 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-extrabold tracking-wide transition-all shadow-md hover:shadow-lg active:scale-[0.98]"
                    id="btn-start-wizard"
                  >
                    <PlusCircle className="h-4.5 w-4.5" />
                    Inscrire mon école
                  </button>
                </div>

                {/* Visitor Submissions List */}
                <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm" id="visitor-requests-list">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                      <Building2 className="h-4.5 w-4.5 text-blue-600" /> Vos Demandes d'Affiliation
                    </h3>
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-blue-50 text-blue-700">
                      {visitorRequests.length} soumise(s)
                    </span>
                  </div>

                  <div className="divide-y divide-slate-50">
                    {visitorRequests.map((req) => (
                      <div key={req.id} className="py-4.5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 first:pt-0 last:pb-0">
                        <div className="flex gap-4.5 items-center">
                          <div className="h-11 w-11 rounded-2xl bg-blue-50/50 flex items-center justify-center text-blue-600 border border-blue-100/30 flex-shrink-0">
                            <Building2 className="h-5 w-5" />
                          </div>
                          <div>
                            <h4 className="text-xs font-bold text-slate-800 leading-snug">{req.ecoleNom}</h4>
                            <p className="text-[10px] text-slate-400 mt-0.5 font-semibold flex items-center gap-1.5">
                              <span>{req.ecoleType}</span>
                              <span className="h-1 w-1 rounded-full bg-slate-200" />
                              <span>Plan {req.plan}</span>
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center justify-between sm:justify-end gap-6">
                          <span className="text-[10px] text-slate-400 font-semibold">{req.date}</span>
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-amber-50 text-amber-700 border border-amber-100/40 flex items-center gap-1">
                            <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />
                            {req.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar Column */}
          <div className="space-y-6">
            {/* Quick Links / Navigation Card */}
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4" id="visitor-sidebar-links">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                <Bell className="h-4 w-4 text-slate-400" /> Raccourcis Utiles
              </h3>
              
              <div className="space-y-2.5">
                <Link 
                  to="/etablissements" 
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-50/50 hover:bg-slate-50 border border-slate-50 text-xs font-semibold text-slate-700 transition-colors"
                >
                  <span>Explorer l'Annuaire National</span>
                  <ChevronRight className="h-4 w-4 text-slate-400" />
                </Link>
                <Link 
                  to="/comment-ca-marche" 
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-50/50 hover:bg-slate-50 border border-slate-50 text-xs font-semibold text-slate-700 transition-colors"
                >
                  <span>Tarifs & Offres de lancement</span>
                  <ChevronRight className="h-4 w-4 text-slate-400" />
                </Link>
                <a 
                  href="#support" 
                  onClick={(e) => { e.preventDefault(); alert("Notre ligne de support d'affiliation est disponible au +221 33 824 55 55"); }}
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-50/50 hover:bg-slate-50 border border-slate-50 text-xs font-semibold text-slate-700 transition-colors"
                >
                  <span>Contacter le support SchoolNet</span>
                  <ChevronRight className="h-4 w-4 text-slate-400" />
                </a>
              </div>
            </div>

            {/* SchoolNet Guarantee / Professional Panel */}
            <div className="bg-gradient-to-br from-blue-50/80 to-indigo-50/40 p-6 rounded-3xl border border-blue-100/50 space-y-3">
              <span className="p-1.5 rounded-lg bg-blue-100 text-blue-600 inline-block">
                <ShieldCheck className="h-5 w-5" />
              </span>
              <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wide">Validation de confiance</h4>
              <p className="text-[11px] text-slate-600 leading-relaxed font-medium">
                SchoolNet valide manuellement chaque demande d'école pour garantir l'intégrité de notre réseau d'éducation nationale sénégalais et éviter l'usurpation d'identité d'établissements existants.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ------------------ RENDERING FOR AUTHENTICATED ROLES (CHEF, TEACHER, PARENT, ELEVE, AUTORITE) ------------------
  const { title, subtitle, kpis, actions, events } = dashboardData || {};

  return (
    <div className="py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto animate-in fade-in duration-300" id="dashboard-page-container">
      
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-schoolnet-primary to-blue-800 text-white p-6 sm:p-8 rounded-2xl shadow-md mb-8 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6" id="welcome-banner">
        <div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white/10 text-emerald-300 mb-3 border border-white/10 uppercase tracking-wide">
            {activeRole ? activeRole.replace("_", " ") : "Utilisateur"}
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-2">{title}</h1>
          <p className="text-blue-100 max-w-xl text-xs sm:text-sm leading-relaxed">
            {subtitle}. Établissement actif : <strong className="text-white">{activeEtablissement?.nom || "Non défini"}</strong>.
          </p>
        </div>
        <div className="flex flex-wrap gap-3 shrink-0">
          <Link
            id="cta-dashboard-annonces"
            to="/annonces"
            className="bg-white text-schoolnet-primary hover:bg-blue-50 px-4.5 py-2.5 rounded-xl font-bold text-xs shadow-sm hover:shadow transition-all flex items-center gap-2"
          >
            <Megaphone className="h-4 w-4 text-schoolnet-secondary animate-bounce" /> Voir les Annonces
          </Link>
          <div className="bg-white/10 backdrop-blur-md px-4 py-2.5 rounded-xl border border-white/10 flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-green-300" />
            <div className="text-left">
              <div className="text-[10px] text-blue-200 uppercase font-mono tracking-wider">Moteur</div>
              <div className="text-xs font-semibold">Supabase Web OK</div>
            </div>
          </div>
        </div>
      </div>

      {/* Grid Statistics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8" id="dashboard-stats-grid">
        {kpis && kpis.map((kpi, idx) => {
          const IconComponent = kpi.icon;
          return (
            <div key={idx} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between hover:shadow-md transition-all duration-300">
              <div>
                <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider mb-1">{kpi.label}</span>
                <span className="text-xl font-extrabold text-slate-800 font-mono">{kpi.value}</span>
                <span className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1 mt-1">
                  <TrendingUp className="h-3 w-3" /> {kpi.change}
                </span>
              </div>
              <div className={`p-3 rounded-xl bg-slate-50 text-slate-600`}>
                <IconComponent className="h-5 w-5" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Two-Column Section */}
      <div className="grid lg:grid-cols-3 gap-8" id="dashboard-details-section">
        {/* Main Feed: Upcoming Events */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <Calendar className="h-5 w-5 text-blue-600" /> Prochains Événements Académiques
            </h3>
            <span className="text-xs text-blue-600 hover:underline font-semibold cursor-pointer">Tout voir</span>
          </div>

          <div className="space-y-4">
            {events && events.map((event, idx) => (
              <div key={idx} className="flex items-start gap-4 p-4 rounded-xl hover:bg-slate-50 transition-colors border border-slate-50">
                <div className="bg-blue-50/70 text-blue-700 font-bold p-3 rounded-xl text-center min-w-[55px]">
                  <div className="text-sm">{event.date.split(" ")[0]}</div>
                  <div className="text-[10px] uppercase font-mono tracking-wider">{event.date.split(" ")[1]}</div>
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-xs font-bold text-slate-800 truncate">{event.title}</h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">{event.desc}</p>
                  <span className="inline-flex items-center gap-1 text-[9px] font-extrabold text-blue-600 bg-blue-50 px-2 py-0.5 rounded mt-2 uppercase tracking-wide">
                    {event.type}
                  </span>
                </div>
                <ChevronRight className="h-4 w-4 text-slate-400 self-center" />
              </div>
            ))}
          </div>
        </div>

        {/* Sidebar Panel - Quick Actions & Demo Info */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col gap-6">
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2 mb-4">
              <Bell className="h-5 w-5 text-amber-500" /> Actions Rapides
            </h3>
            <div className="space-y-3">
              {actions && actions.map((action, idx) => (
                <Link
                  key={idx}
                  to={action.href}
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-50/50 hover:bg-slate-50 border border-slate-100 transition-all text-xs font-semibold text-slate-700"
                >
                  <span>{action.label}</span>
                  {action.badge ? (
                    <span className="px-2 py-0.5 rounded-md text-[9px] font-extrabold bg-blue-600 text-white">
                      {action.badge}
                    </span>
                  ) : (
                    <ChevronRight className="h-4 w-4 text-slate-400" />
                  )}
                </Link>
              ))}
            </div>
          </div>

          <div className="mt-auto pt-4 border-t border-slate-100">
            <Link 
              id="back-home-from-dashboard"
              to="/" 
              className="text-xs text-blue-600 font-bold hover:underline flex items-center gap-1.5"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> Retour à la page d'accueil
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
