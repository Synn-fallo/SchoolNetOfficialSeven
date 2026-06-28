import React from 'react';
import * as LucideIcons from 'lucide-react';

interface SidebarItemProps {
  icon: string;
  label: string;
  badge?: number;
  active: boolean;
  isOpen: boolean;
  onClick: () => void;
}

export default function SidebarItem({
  icon,
  label,
  badge,
  active,
  isOpen,
  onClick,
}: SidebarItemProps) {
  // Récupérer l'icône dynamiquement
  const IconComponent = (LucideIcons as any)[icon] || LucideIcons.HelpCircle;

  const showBadge = badge && badge > 0;

  return (
    <button
      onClick={onClick}
      className={`
        flex items-center gap-3 w-full px-4 py-3 mx-2 rounded-lg transition-colors
        ${active
          ? 'bg-blue-50 text-schoolnet-primary'
          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
        }
        ${!isOpen && 'justify-center px-0 mx-1'}
      `}
      title={!isOpen ? label : undefined}
    >
      <div className="relative flex items-center justify-center w-6 h-6 flex-shrink-0">
        <IconComponent size={20} className={active ? 'text-schoolnet-primary' : 'text-gray-500'} />
        {showBadge && (
          <span className={`
            absolute -top-1 -right-2 min-w-[18px] h-[18px] flex items-center justify-center
            rounded-full text-[10px] font-semibold text-white
            ${badge > 0 ? 'bg-schoolnet-accent' : 'bg-gray-400'}
          `}>
            {badge > 99 ? '99+' : badge}
          </span>
        )}
      </div>

      {isOpen && (
        <span className={`
          text-sm flex-1 text-left transition-opacity duration-150
          ${active ? 'font-semibold text-schoolnet-primary' : 'text-gray-600'}
        `}>
          {label}
        </span>
      )}
    </button>
  );
}