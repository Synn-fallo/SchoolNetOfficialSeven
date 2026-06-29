import React, { useState, memo } from "react";
import { useNavigate } from "react-router-dom";
import { MapPin, Star, Award, CheckCircle, Eye, Info, ExternalLink, TrendingUp, Key } from "lucide-react";
import { motion } from "motion/react";
import SchoolLogo from "@/components/common/SchoolLogo";

export interface EtablissementCardProps {
  id: string;
  nom: string;
  slug: string;
  ville?: string | null;
  region?: string | null;
  departement?: string | null;
  logo_url?: string | null;
  taux_reussite?: number | null;
  vues_count?: number | null;
  note_moyenne?: number | null;
  badge_annuaire?: string | null;
  code_etablissement?: string | null;
  type_affichage?: string | null;
  description_courte?: string | null;
  cycles?: string | null;
  options?: string | null;
  onPress: () => void;
  onQuickView: () => void;
}

function EtablissementCard({
  id,
  nom,
  slug,
  ville,
  region,
  departement,
  logo_url,
  taux_reussite,
  vues_count = 0,
  note_moyenne = 4.5,
  badge_annuaire,
  code_etablissement,
  type_affichage,
  description_courte,
  cycles,
  options,
  onPress,
  onQuickView,
}: EtablissementCardProps) {
  const navigate = useNavigate();
  const [imageError, setImageError] = useState(false);

  const hasLogo = !!logo_url && !imageError;
  const initiales = getInitiales(nom);

  const locationParts = [];
  if (ville) locationParts.push(ville);
  if (departement) locationParts.push(departement);
  if (region) locationParts.push(region);
  const locationString = locationParts.join(" • ") || ville || "Sénégal";

  // ✅ Navigation vers la page détail
  const handleSeeDetails = () => {
    navigate(`/public/etablissements/${slug}`);
  };

  // ✅ Style des badges selon le niveau
  const getBadgeStyle = (badge?: string | null) => {
    switch (badge) {
      case "Prestige":
        return { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200/50" };
      case "Premium":
        return { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200/50" };
      case "Certifié":
        return { bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-200/50" };
      default:
        return null;
    }
  };

  const badgeStyle = getBadgeStyle(badge_annuaire);

  // ✅ Style de la carte selon le badge
  let cardBorder = "border-slate-100 shadow-sm hover:shadow-md hover:border-slate-200";
  let badgeBg = "bg-slate-100 text-slate-700";

  if (badge_annuaire === "Prestige" || type_affichage === "VIP") {
    cardBorder = "border-amber-200/60 shadow-amber-500/5 hover:shadow-amber-500/10 hover:border-amber-400 bg-gradient-to-b from-amber-50/10 to-white";
    badgeBg = "bg-amber-50 text-amber-700 border border-amber-200/50";
  } else if (badge_annuaire === "Premium" || type_affichage === "Gold") {
    cardBorder = "border-emerald-200/60 shadow-emerald-500/5 hover:shadow-emerald-500/10 hover:border-emerald-400 bg-gradient-to-b from-emerald-50/10 to-white";
    badgeBg = "bg-emerald-50 text-emerald-700 border border-emerald-200/50";
  } else if (badge_annuaire === "Certifié") {
    cardBorder = "border-blue-200/60 shadow-blue-500/5 hover:shadow-blue-500/10 hover:border-blue-400 bg-gradient-to-b from-blue-50/10 to-white";
    badgeBg = "bg-blue-50 text-blue-700 border border-blue-200/50";
  }

  // ✅ Valeurs formatées
  const successRate = taux_reussite ? `${taux_reussite}%` : "--%";
  const ratingValue = note_moyenne ? note_moyenne.toFixed(1) : "0";
  const viewsValue = formatNumber(vues_count);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.35 }}
      className={`group bg-white rounded-3xl border transition-all duration-300 relative flex flex-col h-full hover:-translate-y-1.5 ${cardBorder}`}
    >
      {/* ✅ Badge flottant (Prestige, Premium, Certifié) */}
      {badge_annuaire && badgeStyle && (
        <div className="absolute top-4 right-4 z-10">
          <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wide uppercase border ${badgeStyle.bg} ${badgeStyle.text} ${badgeStyle.border}`}
          >
            {badge_annuaire === "Prestige" && <Star className="h-3 w-3 fill-amber-500 text-amber-500" />}
            {badge_annuaire === "Premium" && <CheckCircle className="h-3 w-3 text-emerald-600" />}
            {badge_annuaire === "Certifié" && <Award className="h-3 w-3 text-blue-600" />}
            {badge_annuaire}
          </span>
        </div>
      )}

      {/* ✅ Badge type_affichage (VIP, Gold, Classic) - si présent et pas déjà affiché */}
      {type_affichage && !badge_annuaire && (
        <div className="absolute top-4 right-4 z-10">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wide uppercase bg-blue-50 text-blue-700 border border-blue-200/50">
            {type_affichage}
          </span>
        </div>
      )}

      {/* Corps de la carte */}
      <div className="p-6 flex-1 flex flex-col">
        {/* Logo + Infos */}
        <div className="flex gap-4 items-start mb-4">
          <SchoolLogo
            src={logo_url}
            name={nom}
            sizeClassName="w-14 h-14"
            className="group-hover:scale-105 transition-transform duration-300"
          />
          <div className="min-w-0 flex-1">
            {code_etablissement && (
              <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase flex items-center gap-1">
                <Key className="h-3 w-3 text-green-500" />
                {code_etablissement}
              </span>
            )}
            <h3 className="text-base font-extrabold text-slate-800 leading-snug line-clamp-2 mt-0.5 tracking-tight group-hover:text-blue-600 transition-colors">
              {nom}
            </h3>
            <p className="text-xs text-slate-500 font-semibold flex items-center gap-1 mt-1.5">
              <MapPin className="h-3.5 w-3.5 text-slate-400 flex-shrink-0" />
              <span className="truncate">{locationString}</span>
            </p>
          </div>
        </div>

        {/* Étoiles */}
        <div className="flex items-center gap-1.5 mb-4">
          <div className="flex text-amber-400">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`h-3.5 w-3.5 ${
                  i < Math.floor(note_moyenne)
                    ? "fill-amber-400 text-amber-400"
                    : "text-slate-200"
                }`}
              />
            ))}
          </div>
          <span className="text-xs font-extrabold text-slate-700">{ratingValue}</span>
          <span className="text-[10px] text-slate-400 font-medium">({viewsValue} vues)</span>
        </div>

        {/* Description courte */}
        {description_courte && (
          <p className="text-xs text-slate-500 leading-relaxed line-clamp-3 mb-4 flex-1 font-medium">
            {description_courte}
          </p>
        )}

        {/* Indicateurs de performance */}
        <div className="grid grid-cols-2 gap-3.5 py-3 border-t border-b border-slate-100/75 mb-4 bg-slate-50/50 rounded-2xl px-4">
          <div>
            <p className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider">Taux de réussite</p>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-sm font-black text-slate-800">{successRate}</span>
              <span className="text-[8px] text-emerald-600 font-bold uppercase">Bac</span>
            </div>
          </div>
          <div>
            <p className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider">Cycles</p>
            <p className="text-xs font-bold text-slate-700 mt-1 truncate">{cycles || "Général"}</p>
          </div>
        </div>
      </div>

      {/* Actions en bas de carte */}
      <div className="p-4 border-t border-slate-50 flex gap-2.5">
        <button
          onClick={onQuickView}
          className="flex-1 py-2.5 px-3 rounded-xl bg-slate-50 hover:bg-slate-100 text-xs font-bold text-slate-600 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <Info className="h-3.5 w-3.5 text-slate-400" />
          Aperçu rapide
        </button>

        <button
          onClick={handleSeeDetails}
          className="flex-1 py-2.5 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-xs font-bold text-white transition-all flex items-center justify-center gap-1 shadow-sm hover:shadow cursor-pointer"
        >
          Voir les détails
          <ExternalLink className="h-3.5 w-3.5" />
        </button>
      </div>
    </motion.div>
  );
}

// ============================================================================
// FONCTIONS UTILITAIRES
// ============================================================================

const formatNumber = (num?: number | null): string => {
  if (!num) return "0";
  if (num >= 1000) return (num / 1000).toFixed(1) + "k";
  return num.toString();
};

const getInitiales = (nom: string): string => {
  if (!nom) return "SN";
  const mots = nom.trim().split(" ");
  if (mots.length >= 2) {
    return (mots[0][0] + mots[mots.length - 1][0]).toUpperCase();
  }
  return nom.substring(0, 2).toUpperCase();
};

export default memo(EtablissementCard);
