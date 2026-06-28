import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, LogOut, User, AlertCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import SidebarSection from './SidebarSection';
import SidebarItem from './SidebarItem';
import { MenuSection } from '@/types/sidebar.types';

interface SidebarMobileProps {
  visible: boolean;
  onClose: () => void;
  sections: MenuSection[];
  activePath: string;
  onNavigate: (href: string) => void;
  userName?: string;
  userRole?: string;
  etablissementNom?: string;
}

export default function SidebarMobile({
  visible,
  onClose,
  sections,
  activePath,
  onNavigate,
  userName,
  userRole,
  etablissementNom,
}: SidebarMobileProps) {
  const navigate = useNavigate();
  const { signOut, isProfileComplete } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);

  // Gestion du clic en dehors
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (visible && sidebarRef.current && !sidebarRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    // Empêcher le scroll du body quand la sidebar est ouverte
    if (visible) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = '';
    };
  }, [visible, onClose]);

  const isActive = (href: string) => {
    return activePath === href || activePath.startsWith(href + '/');
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await signOut();
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  const handleProfile = () => {
    onNavigate('/profile');
    onClose();
  };

  const renderSections = () => {
    return sections.map((section, idx) => (
      <SidebarSection key={idx} title={section.title} isOpen={true}>
        {section.items.map((item) => (
          <SidebarItem
            key={item.id}
            icon={item.icon}
            label={item.label}
            badge={item.badge}
            active={isActive(item.href)}
            isOpen={true}
            onClick={() => {
              onNavigate(item.href);
              onClose();
            }}
          />
        ))}
      </SidebarSection>
    ));
  };

  const getInitials = () => {
    if (userName) {
      const parts = userName.split(' ');
      if (parts.length >= 2) {
        return `${parts[0].charAt(0)}${parts[1].charAt(0)}`.toUpperCase();
      }
      return userName.charAt(0).toUpperCase();
    }
    return 'U';
  };

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Overlay */}
      <div className="flex-1 bg-black/50" onClick={onClose} />

      {/* Sidebar */}
      <div
        ref={sidebarRef}
        className="w-[80%] max-w-[320px] h-full bg-white shadow-2xl flex flex-col animate-slide-in-right"
        style={{
          animation: 'slideInRight 0.25s ease-out',
        }}
      >
        {/* Header avec avatar cliquable */}
        <button
          onClick={handleProfile}
          className="flex items-center gap-3 px-4 py-4 border-b border-gray-200 hover:bg-gray-50 transition-colors w-full text-left"
        >
          <div className="w-12 h-12 rounded-full bg-schoolnet-primary flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
            {getInitials()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-800 truncate">{userName || 'Utilisateur'}</p>
            <p className="text-xs text-gray-500 truncate">{userRole || 'Invité'}</p>
            {etablissementNom && (
              <p className="text-xs text-gray-400 truncate mt-0.5">{etablissementNom}</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors flex-shrink-0"
          >
            <X size={20} className="text-gray-600" />
          </button>
        </button>

        {/* Indicateur de profil incomplet */}
        {!isProfileComplete && (
          <button
            onClick={handleProfile}
            className="flex items-center justify-center gap-2 mx-4 mt-3 py-2 bg-amber-50 rounded-lg"
          >
            <AlertCircle size={14} className="text-amber-500" />
            <span className="text-xs text-amber-700 font-medium">Profil incomplet</span>
          </button>
        )}

        {/* ScrollView des sections */}
        <div className="flex-1 overflow-y-auto">
          <div className="py-4 pb-2">
            {renderSections()}
          </div>
        </div>

        {/* Footer avec Mon profil + Déconnexion */}
        <div className="border-t border-gray-200 py-2 px-4">
          <button
            onClick={handleProfile}
            className="flex items-center justify-center gap-2 w-full py-3 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <User size={18} className="text-gray-600" />
            <span className="text-sm text-gray-600 font-medium">Mon profil</span>
          </button>

          <button
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="flex items-center justify-center gap-2 w-full py-3 rounded-lg hover:bg-red-50 transition-colors"
          >
            {isLoggingOut ? (
              <div className="w-4 h-4 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
            ) : (
              <LogOut size={18} className="text-red-500" />
            )}
            <span className="text-sm text-red-500 font-medium">
              {isLoggingOut ? 'Déconnexion...' : 'Se déconnecter'}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}

// Ajouter l'animation CSS
// À placer dans index.css ou un fichier CSS global
/*
@keyframes slideInRight {
  from {
    transform: translateX(-100%);
  }
  to {
    transform: translateX(0);
  }
}
*/