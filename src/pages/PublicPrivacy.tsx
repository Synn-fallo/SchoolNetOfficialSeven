import React from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Lock, ShieldCheck } from "lucide-react";

export default function PublicPrivacy() {
  return (
    <div className="py-8 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 text-left" id="privacy-root">
      <Link to="/" className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-blue-600 transition-colors">
        <ArrowLeft className="h-4 w-4" /> Retour à l'accueil
      </Link>

      <div className="bg-white rounded-3xl border border-slate-100 p-6 sm:p-10 shadow-sm space-y-6">
        <div className="border-b border-slate-100 pb-4 space-y-1">
          <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Protection des données</span>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-2">
            <Lock className="h-6 w-6 text-blue-600" /> Politique de Confidentialité
          </h1>
          <p className="text-[10px] text-slate-400 font-semibold">Dernière mise à jour : 28 Juin 2026</p>
        </div>

        <div className="space-y-5 text-xs text-slate-600 leading-relaxed font-medium">
          <section className="space-y-1.5">
            <h2 className="text-sm font-bold text-slate-800">1. Nature des Données Collectées</h2>
            <p>
              Dans le cadre de l'utilisation de SchoolNet par les établissements scolaires, nous traitons uniquement les informations nécessaires au suivi de la vie scolaire de l'élève :
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong>Identification de l'élève :</strong> Nom, prénom, date de naissance, classe d'affectation, matricule d'inscription.</li>
              <li><strong>Informations des Parents :</strong> Email, téléphone portable afin d'envoyer les notifications et d'assurer le contrôle parental interactif.</li>
              <li><strong>Suivi académique :</strong> Notes, bulletins de fin de trimestre, appréciations du corps professoral, retards et absences.</li>
            </ul>
          </section>

          <section className="space-y-1.5">
            <h2 className="text-sm font-bold text-slate-800">2. Finalités du Traitement</h2>
            <p>
              Ces données sont collectées à des fins purement académiques et administratives. Elles permettent à l'école d'éditer les bulletins scolaires officiels, de notifier les parents des retards des élèves, et d'assurer la communication directe au sein de l'établissement. Aucune revente ou exploitation commerciale de ces données scolaires n'est tolérée ni effectuée.
            </p>
          </section>

          <section className="space-y-1.5">
            <h2 className="text-sm font-bold text-slate-800">3. Sécurisation et Chiffrement</h2>
            <p>
              Toutes les connexions s'effectuent via le protocole HTTPS sécurisé. Les serveurs de bases de données Supabase appliquent des règles de sécurité au niveau des lignes (RLS) pour interdire à un utilisateur non authentifié ou d'une autre école de consulter les notes de vos élèves.
            </p>
          </section>
        </div>

        {/* Info Box */}
        <div className="p-4 bg-emerald-50/70 border border-emerald-100/50 rounded-2xl text-[11px] text-emerald-800 flex items-start gap-2.5">
          <ShieldCheck className="h-4.5 w-4.5 text-emerald-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-bold">Charte d'Éthique & RGPD / CDP (Commission des Données Personnelles)</p>
            <p className="font-medium text-emerald-700 leading-relaxed mt-0.5">
              SchoolNet s'engage à respecter les principes de minimisation des données et la réglementation en vigueur relative à la protection des données personnelles de l'enfant mineur.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
