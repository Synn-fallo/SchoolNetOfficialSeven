import React from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, GraduationCap, HeartHandshake } from "lucide-react";

export default function PublicCharteEleve() {
  return (
    <div className="py-8 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 text-left" id="charte-eleve-root">
      <Link to="/" className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-blue-600 transition-colors">
        <ArrowLeft className="h-4 w-4" /> Retour à l'accueil
      </Link>

      <div className="bg-white rounded-3xl border border-slate-100 p-6 sm:p-10 shadow-sm space-y-6">
        <div className="border-b border-slate-100 pb-4 space-y-1">
          <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Éducation & Citoyenneté</span>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-2">
            <GraduationCap className="h-6 w-6 text-blue-600" /> Charte de l'Élève
          </h1>
          <p className="text-[10px] text-slate-400 font-semibold">Consignes et engagements de l'apprenant connecté</p>
        </div>

        <div className="space-y-5 text-xs text-slate-600 leading-relaxed font-medium">
          <section className="space-y-1.5">
            <h2 className="text-sm font-bold text-slate-800">1. Civilité et Respect sur les Espaces d'Échanges</h2>
            <p>
              En tant qu'élève utilisateur de SchoolNet, je m'engage à utiliser un langage poli, respectueux et constructif dans les forums de classe et dans mes messages privés avec mes camarades et mes professeurs. Toute injure, moquerie, acte de harcèlement ou propos inapproprié fera l'objet d'un signalement immédiat et de sanctions disciplinaires rigoureuses de la part de l'administration du lycée.
            </p>
          </section>

          <section className="space-y-1.5">
            <h2 className="text-sm font-bold text-slate-800">2. Intégrité Académique & Devoirs</h2>
            <p>
              Les travaux de recherche, devoirs de maison et évaluations que je remets doivent être le fruit de mon travail personnel. Si j'utilise l'intelligence artificielle pour m'aider à comprendre un sujet, je m'interdis formellement de copier-coller des réponses générées automatiquement et de les présenter comme mon propre travail (plagiat).
            </p>
          </section>

          <section className="space-y-1.5">
            <h2 className="text-sm font-bold text-slate-800">3. Assiduité et Ponctualité</h2>
            <p>
              Je consulte régulièrement mon emploi du temps et mon cahier de texte en ligne. Je m'efforce d'arriver à l'heure à mes cours et de rendre mes devoirs de maison dans les délais fixés par mes professeurs.
            </p>
          </section>
        </div>

        {/* Commitment Footer */}
        <div className="p-4 bg-blue-50/70 border border-blue-100/50 rounded-2xl text-[11px] text-blue-800 flex items-start gap-2.5">
          <HeartHandshake className="h-4.5 w-4.5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-bold">Savoir et Discipline</p>
            <p className="font-medium text-blue-700 leading-relaxed mt-0.5">
              En accédant à mon portail élève, j'accepte d'agir en citoyen numérique responsable et d'incarner avec fierté les valeurs d'excellence et d'intégrité de mon établissement.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
