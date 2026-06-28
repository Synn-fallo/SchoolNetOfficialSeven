import { useState, memo } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, TrendingUp, Eye, Star, Award, Key, ChevronRight } from 'lucide-react';

export interface EtablissementCardProps {
  id: string;
  nom: string;
  slug: string;
  ville?: string | null;
  departement?: string | null;
  region?: string | null;
  logo_url?: string | null;
  taux_reussite?: number | null;
  vues_count?: number;
  note_moyenne?: number;
  badge_annuaire?: string | null;
  code_etablissement?: string | null;
  type_affichage?: string | null;
  description_courte?: string | null;
  cycles?: string | null;
  options?: string | null;
}

function EtablissementCard({
  nom,
  ville,
  departement,
  region,
  logo_url,
  taux_reussite,
  vues_count,
  note_moyenne,
  badge_annuaire,
  code_etablissement,
  type_affichage,
  description_courte,
  slug,
}: EtablissementCardProps) {
  const navigate = useNavigate();
  const [imageError, setImageError] = useState(false);
  
  const hasLogo = !!logo_url && !imageError;
  const initiales = getInitiales(nom);
  
  const locationParts = [];
  if (ville) locationParts.push(ville);
  if (departement) locationParts.push(departement);
  if (region) locationParts.push(region);
  const locationString = locationParts.join(' • ') || ville || 'Bénin';
  
  const handleSeeDetails = () => {
    navigate(`/public/etablissements/${slug}`);
  };
  
  const badgeStyle = getBadgeStyle(badge_annuaire);
  
  const successRate = taux_reussite ? `${taux_reussite}%` : '--%';
  const ratingValue = note_moyenne ? note_moyenne.toFixed(1) : '0';
  const viewsValue = formatNumber(vues_count);
  
  return (
    <div className="mb-4">
      <div className="bg-white rounded-xl p-3.5 border border-gray-200 shadow-md">
        {/* Ligne des badges */}
        <div className="flex justify-between items-center mb-2.5">
          {badgeStyle && (
            <div className={`flex items-center gap-1 px-2 py-1 rounded-full border ${badgeStyle.border} ${badgeStyle.bg}`}>
              <Award size={10} className={badgeStyle.text} />
              <span className={`text-[9px] font-semibold ${badgeStyle.text}`}>{badge_annuaire}</span>
            </div>
          )}
          {type_affichage && (
            <div className="bg-blue-50 px-2.5 py-1 rounded-full">
              <span className="text-[10px] font-bold text-blue-600 uppercase">{type_affichage}</span>
            </div>
          )}
        </div>
        
        {/* Logo */}
        <div className="flex justify-center mb-2.5">
          {hasLogo ? (
            <img 
              src={logo_url} 
              alt={nom} 
              className="w-[70px] h-[70px] rounded-full object-cover border-2 border-gray-200"
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="w-[70px] h-[70px] rounded-full bg-schoolnet-primary flex items-center justify-center">
              <span className="text-2xl font-bold text-white">{initiales}</span>
            </div>
          )}
        </div>
        
        {/* Informations */}
        <div className="text-center space-y-1.5">
          <h3 className="text-base font-bold text-gray-800 line-clamp-2">{nom}</h3>
          
          {code_etablissement && (
            <div className="flex items-center justify-center gap-1.5 bg-green-50 px-3 py-1 rounded-full mx-auto w-fit">
              <Key size={10} className="text-green-600" />
              <span className="text-[10px] font-bold text-green-700">REF: {code_etablissement}</span>
            </div>
          )}
          
          <div className="flex items-center justify-center gap-1">
            <MapPin size={10} className="text-gray-400" />
            <span className="text-[11px] text-gray-500">{locationString}</span>
          </div>
          
          {/* Métriques */}
          <div className="flex justify-around mt-3 py-2.5 border-t border-b border-gray-100 w-full">
            <div className="flex flex-col items-center flex-1">
              <TrendingUp size={16} className={taux_reussite ? 'text-green-500' : 'text-gray-300'} />
              <span className="text-[15px] font-bold text-gray-700 mt-1.5">{successRate}</span>
              <span className="text-[9px] text-gray-400 uppercase mt-1">Réussite</span>
            </div>
            
            <div className="flex flex-col items-center flex-1">
              <Star size={14} className={note_moyenne && note_moyenne > 0 ? 'text-amber-400 fill-amber-400' : 'text-gray-300'} />
              <span className="text-[15px] font-bold text-gray-700 mt-1.5">{ratingValue}</span>
              <span className="text-[9px] text-gray-400 uppercase mt-1">Note</span>
            </div>
            
            <div className="flex flex-col items-center flex-1">
              <Eye size={16} className={vues_count && vues_count > 0 ? 'text-schoolnet-primary' : 'text-gray-300'} />
              <span className="text-[15px] font-bold text-gray-700 mt-1.5">{viewsValue}</span>
              <span className="text-[9px] text-gray-400 uppercase mt-1">Vues</span>
            </div>
          </div>
          
          {description_courte && (
            <p className="text-[10px] text-gray-400 italic truncate">{description_courte}</p>
          )}
        </div>
        
        {/* Bouton */}
        <button
          onClick={handleSeeDetails}
          className="w-full mt-3.5 py-3 bg-gray-50 rounded-lg flex items-center justify-center gap-2 hover:bg-gray-100 transition-colors active:scale-95 duration-75"
        >
          <span className="text-sm font-semibold text-schoolnet-primary">Voir les détails</span>
          <ChevronRight size={14} className="text-schoolnet-primary" />
        </button>
      </div>
    </div>
  );
}

// ============================================================================
// FONCTIONS UTILITAIRES
// ============================================================================

const formatNumber = (num?: number): string => {
  if (!num) return '0';
  if (num >= 1000) return (num / 1000).toFixed(1) + 'k';
  return num.toString();
};

const getInitiales = (nom: string): string => {
  const mots = nom.trim().split(' ');
  if (mots.length >= 2) return (mots[0][0] + mots[mots.length - 1][0]).toUpperCase();
  return nom.substring(0, 2).toUpperCase();
};

const getBadgeStyle = (badge?: string | null) => {
  switch (badge) {
    case 'Prestige': return { bg: 'bg-amber-50', text: 'text-amber-600', border: 'border-amber-200' };
    case 'Premium': return { bg: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-200' };
    case 'Certifié': return { bg: 'bg-green-50', text: 'text-green-600', border: 'border-green-200' };
    default: return null;
  }
};

export default memo(EtablissementCard);