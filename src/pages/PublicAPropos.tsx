import React from "react";
import { Link } from "react-router-dom";
import { 
  Building2, 
  ShieldCheck, 
  Users, 
  Award, 
  ArrowRight,
  Sparkles,
  BookOpen
} from "lucide-react";

export default function PublicAPropos() {
  return (
    <div className="py-8 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12" id="about-page-root">
      
      {/* Hero Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-100/30">
          <Sparkles className="h-3.5 w-3.5" /> Qui sommes-nous ?
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 font-sans leading-tight">
          La Solution Digitale Unifiée au service de <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">l'Excellence Scolaire</span>
        </h1>
        <p className="text-base text-slate-500 max-w-2xl mx-auto font-medium leading-relaxed">
          SchoolNet simplifie, centralise et dynamise la communication et la gestion quotidienne entre administrations scolaires, enseignants, élèves et familles.
        </p>
      </div>

      {/* Narrative grid section */}
      <div className="grid md:grid-cols-2 gap-8 items-center bg-white rounded-3xl p-6 sm:p-10 border border-slate-100 shadow-sm" id="about-narrative">
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-slate-800 tracking-tight">Notre Engagement pour l'Avenir</h2>
          <p className="text-xs text-slate-600 leading-relaxed font-medium">
            Né de la volonté de moderniser les structures éducatives, SchoolNet est un portail scolaire complet de gestion académique. Nous fournissons aux établissements publics, privés et d'élite les outils indispensables pour automatiser le secrétariat, fiabiliser le suivi des notes, sécuriser les bulletins, et rapprocher les familles de la vie scolaire de leurs enfants.
          </p>
          <p className="text-xs text-slate-500 leading-relaxed font-medium">
            Du suivi en temps réel des devoirs à la consultation sécurisée des bulletins de notes, en passant par le contrôle d'accès parental, nous mettons l'innovation logicielle au service de la réussite éducative.
          </p>
        </div>

        {/* Brand visual box */}
        <div className="p-6 sm:p-8 bg-slate-950 rounded-2xl text-white relative overflow-hidden h-64 flex flex-col justify-between">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,_var(--tw-gradient-stops))] from-blue-500/10 via-indigo-500/5 to-transparent pointer-events-none"></div>
          <div className="p-2 w-fit rounded-xl bg-blue-600 text-white">
            <Building2 className="h-6 w-6" />
          </div>
          <div className="space-y-1 relative z-10">
            <p className="text-2xl font-black">100% Souple</p>
            <p className="text-xs text-slate-400 font-semibold leading-relaxed">Adaptable à toutes les tailles d'écoles, de la petite commune aux grands complexes scolaires nationaux.</p>
          </div>
        </div>
      </div>

      {/* Values grid */}
      <div className="space-y-6">
        <div className="text-center max-w-xl mx-auto">
          <h3 className="text-lg font-extrabold text-slate-800">Nos Valeurs Cardinales</h3>
          <p className="text-xs text-slate-500 mt-1">Les fondements de notre écosystème d'apprentissage de confiance.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6" id="values-grid">
          <div className="p-6 bg-white rounded-2xl border border-slate-100 text-left space-y-3">
            <div className="p-2.5 w-fit rounded-xl bg-blue-50 text-blue-600">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <h4 className="text-sm font-bold text-slate-800">Sécurité Absolue</h4>
            <p className="text-xs text-slate-500 leading-relaxed font-medium">
              Chiffrement complet des notes, anonymat des données personnelles de l'élève, et audits d'accès stricts.
            </p>
          </div>

          <div className="p-6 bg-white rounded-2xl border border-slate-100 text-left space-y-3">
            <div className="p-2.5 w-fit rounded-xl bg-indigo-50 text-indigo-600">
              <Users className="h-5 w-5" />
            </div>
            <h4 className="text-sm font-bold text-slate-800">Inclusivité Familiale</h4>
            <p className="text-xs text-slate-500 leading-relaxed font-medium">
              Espaces adaptés sur mobile et web pour s'assurer que chaque parent, même éloigné, puisse suivre l'élève.
            </p>
          </div>

          <div className="p-6 bg-white rounded-2xl border border-slate-100 text-left space-y-3">
            <div className="p-2.5 w-fit rounded-xl bg-emerald-50 text-emerald-600">
              <Award className="h-5 w-5" />
            </div>
            <h4 className="text-sm font-bold text-slate-800">Culture de l'Excellence</h4>
            <p className="text-xs text-slate-500 leading-relaxed font-medium">
              Mise en avant des taux de réussite, prix décernés et émulation positive via les concours et actualités.
            </p>
          </div>
        </div>
      </div>

      {/* CTA Box */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-10 text-center space-y-4" id="about-cta-box">
        <h3 className="text-lg font-bold">Prêt à digitaliser votre école ?</h3>
        <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
          Créez dès maintenant le profil de votre école et accédez à l'annuaire scolaire de référence.
        </p>
        <div className="pt-2 flex flex-wrap justify-center gap-3">
          <Link 
            to="/auto-inscription" 
            className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-1 shadow-md"
          >
            Inscrire mon école <ArrowRight className="h-4 w-4" />
          </Link>
          <Link 
            to="/comment-ca-marche" 
            className="px-5 py-2.5 rounded-xl bg-slate-800 text-slate-300 hover:text-white font-bold text-xs border border-slate-700"
          >
            Comment ça marche ?
          </Link>
        </div>
      </div>

    </div>
  );
}
