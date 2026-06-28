import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  X, MapPin, Phone, Mail, Globe, BookOpen, ChevronRight, 
  Share2, Facebook, Twitter, Linkedin, Link as LinkIcon, 
  MessageCircle 
} from 'lucide-react';

interface EtablissementModalProps {
  visible: boolean;
  onClose: () => void;
  etablissement: {
    id: string;
    nom: string;
    slug: string;
    ville?: string;
    adresse?: string;
    telephone?: string;
    email?: string;
    logo_url?: string;
    type_etablissement?: 'public' | 'prive';
    description_courte?: string;
    classes?: Array<{ id: string; nom: string; niveau: string }>;
    site_web?: string;
    sous_domaine?: string;
  } | null;
}

const shareOptions = [
  { id: 'facebook', label: 'Facebook', icon: Facebook, color: '#1877F2' },
  { id: 'twitter', label: 'Twitter', icon: Twitter, color: '#1DA1F2' },
  { id: 'linkedin', label: 'LinkedIn', icon: Linkedin, color: '#0A66C2' },
  { id: 'whatsapp', label: 'WhatsApp', icon: MessageCircle, color: '#25D366' },
  { id: 'copy', label: 'Copier le lien', icon: LinkIcon, color: '#6B7280' },
];

export default function EtablissementModal({ visible, onClose, etablissement }: EtablissementModalProps) {
  const navigate = useNavigate();
  const [showShareMenu, setShowShareMenu] = useState(false);

  if (!visible || !etablissement) return null;

  const handleViewVitrine = () => {
    onClose();
    navigate(`/public/etablissements/${etablissement.slug}`);
  };

  const getShareUrl = () => {
    return `${window.location.origin}/etablissements/${etablissement.slug}`;
  };

  const handleShare = async (platform: string) => {
    const url = getShareUrl();
    const title = `Découvrez ${etablissement.nom}`;
    const text = `Je vous recommande ${etablissement.nom} sur SchoolNet - La plateforme éducative de référence`;

    if (platform === 'copy') {
      try {
        await navigator.clipboard.writeText(url);
        alert('Lien copié dans le presse-papier');
      } catch (err) {
        console.error('Erreur copie:', err);
      }
      setShowShareMenu(false);
      return;
    }

    if (navigator.share) {
      try {
        await navigator.share({ title, text, url });
      } catch (error) {
        console.log('Share cancelled', error);
      }
    } else {
      let shareUrl = '';
      const encodedUrl = encodeURIComponent(url);
      const encodedText = encodeURIComponent(text);
      
      switch (platform) {
        case 'facebook':
          shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;
          break;
        case 'twitter':
          shareUrl = `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`;
          break;
        case 'linkedin':
          shareUrl = `https://www.linkedin.com/shareArticle?mini=true&url=${encodedUrl}&title=${encodeURIComponent(title)}&summary=${encodedText}`;
          break;
        case 'whatsapp':
          shareUrl = `https://wa.me/?text=${encodedText}%20${encodedUrl}`;
          break;
        default:
          return;
      }
      
      window.open(shareUrl, '_blank', 'noopener,noreferrer');
    }
    
    setShowShareMenu(false);
  };

  const handlePhonePress = () => {
    if (etablissement.telephone) {
      window.location.href = `tel:${etablissement.telephone}`;
    }
  };

  const handleEmailPress = () => {
    if (etablissement.email) {
      window.location.href = `mailto:${etablissement.email}`;
    }
  };

  const getTypeLabel = () => {
    return etablissement.type_etablissement === 'public' ? 'Public' : 'Privé';
  };

  const typeStyle = etablissement.type_etablissement === 'public' 
    ? { bg: 'bg-blue-50', text: 'text-blue-700' }
    : { bg: 'bg-amber-50', text: 'text-amber-700' };

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50" onClick={onClose}>
        <div 
          className="bg-white rounded-t-2xl w-full max-w-lg max-h-[85vh] min-h-[50vh] flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex justify-between items-center p-4 border-b border-gray-200">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              {etablissement.logo_url ? (
                <img src={etablissement.logo_url} alt={etablissement.nom} className="w-12 h-12 rounded-md object-cover" />
              ) : (
                <div className="w-12 h-12 rounded-md bg-gray-100 flex items-center justify-center">
                  <BookOpen size={24} className="text-schoolnet-primary" />
                </div>
              )}
              <span className="text-lg font-semibold text-gray-800 truncate">{etablissement.nom}</span>
            </div>
            <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-lg transition-colors">
              <X size={24} className="text-gray-500" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {/* Badges */}
            <div className="flex items-center gap-2">
              <div className={`px-2 py-1 rounded ${typeStyle.bg}`}>
                <span className={`text-xs font-semibold ${typeStyle.text}`}>{getTypeLabel()}</span>
              </div>
              {etablissement.ville && (
                <div className="flex items-center gap-1 px-2 py-1 bg-gray-100 rounded">
                  <MapPin size={12} className="text-gray-500" />
                  <span className="text-xs text-gray-600">{etablissement.ville}</span>
                </div>
              )}
            </div>

            {/* Description */}
            {etablissement.description_courte && (
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">À propos</p>
                <p className="text-sm text-gray-600 leading-relaxed">{etablissement.description_courte}</p>
              </div>
            )}

            {/* Contact */}
            {(etablissement.adresse || etablissement.telephone || etablissement.email) && (
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Contact</p>
                <div className="space-y-2">
                  {etablissement.adresse && (
                    <div className="flex items-center gap-2">
                      <MapPin size={16} className="text-gray-400" />
                      <span className="text-sm text-gray-600">{etablissement.adresse}</span>
                    </div>
                  )}
                  {etablissement.telephone && (
                    <button onClick={handlePhonePress} className="flex items-center gap-2 hover:text-schoolnet-primary transition-colors">
                      <Phone size={16} className="text-gray-400" />
                      <span className="text-sm text-schoolnet-primary">{etablissement.telephone}</span>
                    </button>
                  )}
                  {etablissement.email && (
                    <button onClick={handleEmailPress} className="flex items-center gap-2 hover:text-schoolnet-primary transition-colors">
                      <Mail size={16} className="text-gray-400" />
                      <span className="text-sm text-schoolnet-primary">{etablissement.email}</span>
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Classes */}
            {etablissement.classes && etablissement.classes.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Classes</p>
                <div className="space-y-1.5">
                  {etablissement.classes.slice(0, 3).map((classe) => (
                    <div key={classe.id} className="flex items-center gap-2">
                      <BookOpen size={12} className="text-gray-400" />
                      <span className="text-sm text-gray-600">{classe.nom} ({classe.niveau})</span>
                    </div>
                  ))}
                  {etablissement.classes.length > 3 && (
                    <span className="text-xs text-gray-400">+{etablissement.classes.length - 3} autres classes</span>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 p-4 border-t border-gray-200">
            <button 
              onClick={() => setShowShareMenu(true)}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <Share2 size={18} className="text-gray-600" />
              <span className="text-sm text-gray-600">Partager</span>
            </button>

            <button 
              onClick={handleViewVitrine}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-schoolnet-primary rounded-lg hover:bg-schoolnet-primary-light transition-colors"
            >
              <span className="text-sm font-semibold text-white">Voir la page complète</span>
              <ChevronRight size={18} className="text-white" />
            </button>
          </div>
        </div>
      </div>

      {/* Share Menu */}
      {showShareMenu && (
        <div 
          className="fixed inset-0 z-[60] bg-black/50 flex items-center justify-center"
          onClick={() => setShowShareMenu(false)}
        >
          <div 
            className="bg-white rounded-xl p-4 w-[80%] max-w-xs shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <span className="text-lg font-semibold text-gray-800">Partager {etablissement.nom}</span>
              <button onClick={() => setShowShareMenu(false)} className="p-1 hover:bg-gray-100 rounded-lg">
                <X size={20} className="text-gray-500" />
              </button>
            </div>
            <div className="grid grid-cols-5 gap-2">
              {shareOptions.map((option) => (
                <button
                  key={option.id}
                  onClick={() => handleShare(option.id)}
                  className="flex flex-col items-center gap-1.5"
                >
                  <div 
                    className="w-14 h-14 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: option.color + '20' }}
                  >
                    <option.icon size={22} color={option.color} />
                  </div>
                  <span className="text-xs text-gray-600">{option.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}