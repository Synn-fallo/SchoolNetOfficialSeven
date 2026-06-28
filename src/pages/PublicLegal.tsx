import React from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, FileText, ShieldAlert } from "lucide-react";

export default function PublicLegal() {
  return (
    <div className="py-8 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 text-left" id="legal-root">
      <Link to="/" className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-blue-600 transition-colors">
        <ArrowLeft className="h-4 w-4" /> Retour à l'accueil
      </Link>

      <div className="bg-white rounded-3xl border border-slate-100 p-6 sm:p-10 shadow-sm space-y-6">
        <div className="border-b border-slate-100 pb-4 space-y-1">
          <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Document Administratif</span>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-2">
            <FileText className="h-6 w-6 text-blue-600" /> Mentions Légales
          </h1>
          <p className="text-[10px] text-slate-400 font-semibold">Dernière mise à jour : 28 Juin 2026</p>
        </div>

        <div className="space-y-4 text-xs text-slate-600 leading-relaxed font-medium">
          <section className="space-y-1.5">
            <h2 className="text-sm font-bold text-slate-800">1. Éditeur de la Plateforme</h2>
            <p>
              Le site web et l'application mobile <strong>SchoolNet Official</strong> sont édités par la société <strong>SchoolNet Technologies S.A.</strong>, au capital social de 10 000 000 FCFA, immatriculée au Registre du Commerce et du Crédit Mobilier (RCCM) sous le numéro SN-DKR-2026-B-102.
            </p>
            <p><strong>Siège social :</strong> Avenue Cheikh Anta Diop, Dakar, Sénégal.</p>
            <p><strong>Directeur de publication :</strong> Monsieur Ousmane Sow, Directeur des Systèmes d'Information.</p>
          </section>

          <section className="space-y-1.5">
            <h2 className="text-sm font-bold text-slate-800">2. Hébergement du Service</h2>
            <p>
              SchoolNet est propulsé par une infrastructure cloud conteneurisée sécurisée et hébergé en conformité avec les directives sur la souveraineté numérique des données éducatives.
            </p>
            <p><strong>Hébergeur :</strong> Google Cloud Platform (Région Europe-West2) et serveurs de relais agréés au Sénégal.</p>
          </section>

          <section className="space-y-1.5">
            <h2 className="text-sm font-bold text-slate-800">3. Propriété Intellectuelle</h2>
            <p>
              L'ensemble des contenus (logiciel, codes sources, bases de données simulées, designs, logos, typographies, icônes) figurant sur SchoolNet est protégé par la législation nationale sur le droit d'auteur et la propriété intellectuelle. Toute reproduction ou copie non autorisée constitue une contrefaçon passible de sanctions judiciaires.
            </p>
          </section>
        </div>

        {/* Warning or information footer */}
        <div className="p-4 bg-blue-50/70 border border-blue-100/50 rounded-2xl text-[11px] text-blue-800 flex items-start gap-2.5">
          <ShieldAlert className="h-4.5 w-4.5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-bold">Contact Administratif</p>
            <p className="font-medium text-blue-700 leading-relaxed mt-0.5">
              Pour toute question d'ordre légal, de signalement de dysfonctionnement ou de demande d'exercice de droits sur les données, veuillez envoyer un message recommandé à l'adresse email officielle : <strong>legal@schoolnet.sn</strong>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
