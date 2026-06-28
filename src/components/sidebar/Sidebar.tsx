import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import SidebarHeader from './SidebarHeader';
import SidebarSection from './SidebarSection';
import SidebarItem from './SidebarItem';
import { MenuSection } from '@/types/sidebar.types';
import { LogOut, User, AlertCircle, Home, ChevronLeft, ChevronRight } from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  sections: MenuSection[];
  activePath: string;
  onNavigate: (href: string) => void;
  userName?: string;
  userRole?: string;
  etablissementNom?: string;
  isChef?: boolean;
}

export default function Sidebar({
  isOpen,
  onToggle,
  sections,
  activePath,
  onNavigate,
  userName,
  userRole,
  etablissementNom,
  isChef,
}: SidebarProps) {
  const navigate = useNavigate();
  const { signOut, isProfileComplete } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isOpen && sidebarRef.current && !sidebarRef.current.contains(event.target as Node)) {
        if (window.innerWidth < 768) {
          onToggle();
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onToggle]);

  const isActive = (href: string) => {
    return activePath === href || activePath.startsWith(href + '/');
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await signOut();
      navigate('/');
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  const handleProfile = () => {
    onNavigate('/profile');
  };

  // Bouton Accueil - Style pilule
  const renderHomeButton = () => {
    if (!isOpen) {
      return (
        <button
          onClick={() => navigate('/')}
          className="flex items-center justify-center p-3 mx-auto rounded-lg hover:bg-gray-100 transition-colors"
          title="Accueil"
        >
          <Home className="h-5 w-5 text-gray-500" />
        </button>
      );
    }

    return (
      <button
        onClick={() => navigate('/')}
        className="flex items-center gap-2.5 w-full px-4 py-2.5 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors text-sm font-medium text-gray-700"
      >
        <Home className="h-4 w-4" />
        Accueil
        <span className="text-xs text-gray-400 ml-auto">Portail</span>
      </button>
    );
  };

  const renderSections = () => {
    return sections.map((section, idx) => (
      <SidebarSection key={idx} title={section.title} isOpen={isOpen}>
        {section.items.map((item) => (
          <SidebarItem
            key={item.id}
            icon={item.icon}
            label={item.label}
            badge={item.badge}
            active={isActive(item.href)}
            isOpen={isOpen}
            onClick={() => onNavigate(item.href)}
          />
        ))}
      </SidebarSection>
    ));
  };

  const sidebarWidth = isOpen ? 'w-72' : 'w-20';

  return (
    <div
      ref={sidebarRef}
      className={`${sidebarWidth} h-screen bg-white border-r border-gray-200 overflow-hidden flex flex-col transition-all duration-200 sticky top-0 shadow-soft`}
    >
      <SidebarHeader
        isOpen={isOpen}
        onToggle={onToggle}
        userName={userName}
        userRole={userRole}
        etablissementNom={etablissementNom}
        isChef={isChef}
      />

      {/* Bouton Accueil - Après le header */}
      <div className="px-3 py-3 border-b border-gray-100">
        {renderHomeButton()}
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-hide">
        <div className="py-3 pb-2">
          {renderSections()}
        </div>
      </div>

      {/* Footer avec Mon profil + Déconnexion */}
      <div className="border-t border-gray-200 px-3 py-3 bg-white/80">
        {!isOpen ? (
          <div className="flex flex-col items-center gap-3">
            <button
              onClick={handleProfile}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              title="Mon profil"
            >
              <User className="h-5 w-5 text-gray-500" />
            </button>
            <button
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="p-2 rounded-lg hover:bg-red-50 transition-colors"
              title="Déconnexion"
            >
              {isLoggingOut ? (
                <div className="h-5 w-5 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
              ) : (
                <LogOut className="h-5 w-5 text-red-500" />
              )}
            </button>
          </div>
        ) : (
          <div className="space-y-1.5">
            <button
              onClick={handleProfile}
              className="flex items-center gap-3 w-full px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <User className="h-4 w-4 text-gray-500" />
              <span className="text-sm text-gray-600 font-medium">Mon profil</span>
            </button>

            <button
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="flex items-center gap-3 w-full px-3 py-2 rounded-lg hover:bg-red-50 transition-colors"
            >
              {isLoggingOut ? (
                <div className="h-4 w-4 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
              ) : (
                <LogOut className="h-4 w-4 text-red-500" />
              )}
              <span className="text-sm text-red-500 font-medium">
                {isLoggingOut ? 'Déconnexion...' : 'Se déconnecter'}
              </span>
            </button>

            {!isProfileComplete && (
              <button
                onClick={handleProfile}
                className="flex items-center justify-center gap-2 w-full mt-2 py-1.5 bg-amber-50 rounded-lg"
              >
                <AlertCircle className="h-3.5 w-3.5 text-amber-500" />
                <span className="text-xs text-amber-700 font-medium">Profil incomplet</span>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}