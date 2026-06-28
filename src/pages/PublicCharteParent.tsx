import React from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Users, ShieldAlert } from "lucide-react";

export default function PublicCharteParent() {
  return (
    <div className="py-8 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 text-left" id="charte-parent-root">
      <Link to="/" className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-blue-600 transition-colors">
        <ArrowLeft className="h-4 w-4" /> Retour à l'accueil
      </Link>

      <div className="bg-white rounded-3xl border border-slate-100 p-6 sm:p-10 shadow-sm space-y-6">
        <div className="border-b border-slate-100 pb-4 space-y-1">
          <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Partenariat Éducatif</span>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-2">
            <Users className="h-6 w-6 text-blue-600" /> Charte du Parent d'Élève
          </h1>
          <p className="text-[10px] text-slate-400 font-semibold">Collaboration active et suivi de la scolarité</p>
        </div>

        <div className="space-y-5 text-xs text-slate-600 leading-relaxed font-medium">
          <section className="space-y-1.5">
            <h2 className="text-sm font-bold text-slate-800">1. Suivi Régulier du Travail Scolaire</h2>
            <p>
              Le parent s'engage à accompagner activement la scolarité de son enfant. Grâce à son portail d'accès confidentiel SchoolNet, il s'informe régulièrement de l'emploi du temps, des devoirs assignés, des retards de l'élève et consulte ses notes trimestrielles afin d'anticiper toute difficulté d'apprentissage.
            </p>
          </section>

          <section className="space-y-1.5">
            <h2 className="text-sm font-bold text-slate-800">2. Dialogue Constructif avec l'Équipe Pédagogique</h2>
            <p>
              En cas de question ou d'inquiétude sur les résultats d'un devoir ou le comportement de l'élève, le parent privilégie un dialogue poli, mesuré et respectueux avec les enseignants et l'administration scolaire. Les messageries de l'application sont réservées à des échanges purement scolaires.
            </p>
          </section>

          <section className="space-y-1.5">
            <h2 className="text-sm font-bold text-slate-800">3. Promotion d'un Cadre d'Étude Propice</h2>
            <p>
              Le parent s'efforce d'offrir à l'élève un espace calme à la maison, d'encourager la lecture, de fixer des temps d'écran équilibrés (notamment en configurant le module de Contrôle Parental) et de veiller au sommeil nécessaire à une attention maximale en classe.
            </p>
          </section>
        </div>

        {/* Commitment Footer */}
        <div className="p-4 bg-blue-50/70 border border-blue-100/50 rounded-2xl text-[11px] text-blue-800 flex items-start gap-2.5">
          <ShieldAlert className="h-4.5 w-4.5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-bold">Co-éducation & Confiance</p>
            <p className="font-medium text-blue-700 leading-relaxed mt-0.5">
              Éduquer est une œuvre commune. En collaborant de manière confiante et fluide avec le lycée, nous créons ensemble le tremplin de réussite idéal pour l'élève.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
