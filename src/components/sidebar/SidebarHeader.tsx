import React from 'react';
import { Menu, Building2, User, X } from 'lucide-react';

interface SidebarHeaderProps {
  isOpen: boolean;
  onToggle: () => void;
  userName?: string;
  userRole?: string;
  etablissementNom?: string;
  isChef?: boolean;
}

export default function SidebarHeader({
  isOpen,
  onToggle,
  userName,
  userRole,
  etablissementNom,
  isChef = false,
}: SidebarHeaderProps) {
  const displayName = userName || 'Utilisateur';
  const displayRole = userRole || 'Visiteur';

  if (!isOpen) {
    return (
      <div className="flex items-center justify-center py-4 border-b border-gray-200">
        <button
          onClick={onToggle}
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          aria-label="Ouvrir le menu"
        >
          <Menu className="h-5 w-5 text-gray-600" />
        </button>
      </div>
    );
  }

  return (
    <div className="px-4 pt-5 pb-4 border-b border-gray-200 bg-gradient-to-b from-white to-gray-50/50">
      <div className="flex justify-end mb-3">
        <button
          onClick={onToggle}
          className="p-1 rounded-lg hover:bg-gray-100 transition-colors"
          aria-label="Fermer le menu"
        >
          <X className="h-4 w-4 text-gray-500" />
        </button>
      </div>

      <div className="flex items-center gap-3">
        <div className="w-11 h-11 rounded-full bg-gradient-to-br from-schoolnet-primary to-schoolnet-primary-light flex items-center justify-center text-white font-semibold text-sm flex-shrink-0 shadow-soft">
          {displayName.charAt(0).toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-gray-800 truncate">{displayName}</p>
          <p className="text-xs text-gray-500 truncate">{displayRole}</p>
        </div>
      </div>

      {isChef && etablissementNom && (
        <>
          <div className="h-px bg-gray-200 my-3" />
          <div className="flex items-center gap-2">
            <Building2 className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" />
            <span className="text-xs font-medium text-gray-600 truncate">{etablissementNom}</span>
          </div>
        </>
      )}
    </div>
  );
}