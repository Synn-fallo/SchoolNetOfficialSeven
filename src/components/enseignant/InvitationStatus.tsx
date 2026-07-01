// /src/components/enseignant/InvitationStatus.tsx
// Statut d'une invitation

import React from 'react';

interface InvitationStatusProps {
  status: 'en_attente' | 'acceptee' | 'expiree' | 'annulee';
  size?: 'small' | 'medium';
}

const STATUS_CONFIG = {
  en_attente: {
    label: 'En attente',
    bg: 'bg-amber-100',
    text: 'text-amber-600',
    icon: '⏳',
  },
  acceptee: {
    label: 'Acceptée',
    bg: 'bg-blue-100',
    text: 'text-schoolnet-primary',
    icon: '✅',
  },
  expiree: {
    label: 'Expirée',
    bg: 'bg-red-100',
    text: 'text-red-500',
    icon: '⚠️',
  },
  annulee: {
    label: 'Annulée',
    bg: 'bg-gray-100',
    text: 'text-gray-500',
    icon: '❌',
  },
};

export default function InvitationStatus({ 
  status, 
  size = 'medium' 
}: InvitationStatusProps) {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.en_attente;
  const sizeClasses = size === 'small' 
    ? 'text-xs px-2 py-1 gap-1'
    : 'text-sm px-3 py-1.5 gap-1.5';
  const iconSize = size === 'small' ? 'text-xs' : 'text-sm';

  return (
    <div className={`
      inline-flex flex-row items-center rounded-full font-medium
      ${config.bg} ${config.text} ${sizeClasses}
    `}>
      <span className={iconSize}>{config.icon}</span>
      <span>{config.label}</span>
    </div>
  );
}
