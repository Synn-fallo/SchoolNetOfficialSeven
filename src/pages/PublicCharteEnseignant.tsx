import React from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, BookOpen, ShieldAlert } from "lucide-react";

export default function PublicCharteEnseignant() {
  return (
    <div className="py-8 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 text-left" id="charte-enseignant-root">
      <Link to="/" className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-blue-600 transition-colors">
        <ArrowLeft className="h-4 w-4" /> Retour à l'accueil
      </Link>

      <div className="bg-white rounded-3xl border border-slate-100 p-6 sm:p-10 shadow-sm space-y-6">
        <div className="border-b border-slate-100 pb-4 space-y-1">
          <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Éthique Professionnelle</span>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-2">
            <BookOpen className="h-6 w-6 text-blue-600" /> Charte de l'Enseignant
          </h1>
          <p className="text-[10px] text-slate-400 font-semibold">Engagements et déontologie du corps professoral</p>
        </div>

        <div className="space-y-5 text-xs text-slate-600 leading-relaxed font-medium">
          <section className="space-y-1.5">
            <h2 className="text-sm font-bold text-slate-800">1. Saisie Rigoureuse des Notes et Évaluations</h2>
            <p>
              L'enseignant s'engage à évaluer les élèves avec partialité, justice et bienveillance. Il saisit régulièrement les notes des devoirs et compositions sur son portail d'enseignement dans un délai raisonnable afin de permettre aux familles de suivre sereinement la progression de l'élève.
            </p>
          </section>

          <section className="space-y-1.5">
            <h2 className="text-sm font-bold text-slate-800">2. Accompagnement et Remarques Constructives</h2>
            <p>
              Toutes les appréciations écrites figurant sur les devoirs en ligne ou destinées à être reportées sur les bulletins trimestriels doivent être constructives, encourageantes et axées sur l'amélioration continue de l'apprenant. L'enseignant s'interdit toute appréciation insultante, blessante ou humiliante.
            </p>
          </section>

          <section className="space-y-1.5">
            <h2 className="text-sm font-bold text-slate-800">3. Confidentialité & Posture Pédagogique</h2>
            <p>
              L'enseignant veille à la stricte confidentialité des données scolaires et des notes de ses élèves. Il s'abstient de divulguer publiquement les difficultés d'un élève en dehors des cadres administratifs et pédagogiques de l'école (conseils de classe, réunions parents-professeurs).
            </p>
          </section>
        </div>

        {/* Commitment Footer */}
        <div className="p-4 bg-emerald-50/70 border border-emerald-100/50 rounded-2xl text-[11px] text-emerald-800 flex items-start gap-2.5">
          <ShieldAlert className="h-4.5 w-4.5 text-emerald-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-bold">Transmission & Excellence</p>
            <p className="font-medium text-emerald-700 leading-relaxed mt-0.5">
              En tant que transmetteur de savoir, l'enseignant s'engage à être un pilier de confiance pour l'école et à stimuler au quotidien la passion d'apprendre chez chaque élève.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
