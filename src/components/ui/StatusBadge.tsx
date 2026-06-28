import React from 'react';

export type StatusType = 'paye' | 'partiel' | 'impaye' | 'en_attente' | 'en_cours' | 'valide' | 'rejete' | 'annule' | string;

export interface StatusBadgeProps {
  status: StatusType;
  label?: string;
  size?: 'small' | 'medium';
}

export function StatusBadge({ status, label, size = 'medium' }: StatusBadgeProps) {
  const getStatusClasses = () => {
    switch (status) {
      // Payments
      case 'paye':
        return 'bg-emerald-50 text-emerald-700 border border-emerald-200';
      case 'partiel':
        return 'bg-amber-50 text-amber-700 border border-amber-200';
      case 'impaye':
        return 'bg-red-50 text-red-700 border border-red-200';
      // Institutional requests
      case 'en_attente':
        return 'bg-yellow-50 text-yellow-800 border border-yellow-200';
      case 'en_cours':
        return 'bg-blue-50 text-blue-700 border border-blue-200';
      case 'valide':
        return 'bg-emerald-50 text-emerald-700 border border-emerald-200';
      case 'rejete':
        return 'bg-red-50 text-red-700 border border-red-200';
      case 'annule':
        return 'bg-slate-100 text-slate-600 border border-slate-200';
      default:
        return 'bg-slate-100 text-slate-600 border border-slate-200';
    }
  };

  const getStatusLabel = () => {
    if (label) return label;
    switch (status) {
      case 'paye': return 'Payé';
      case 'partiel': return 'Partiel';
      case 'impaye': return 'Impayé';
      case 'en_attente': return 'En attente';
      case 'en_cours': return 'En cours';
      case 'valide': return 'Validé';
      case 'rejete': return 'Rejeté';
      case 'annule': return 'Annulé';
      default: return status.charAt(0).toUpperCase() + status.slice(1);
    }
  };

  return (
    <span
      className={`
        inline-flex items-center justify-center font-bold tracking-wide rounded-full select-none
        ${size === 'small' ? 'px-2 py-0.5 text-[10px]' : 'px-3.5 py-1 text-xs'}
        ${getStatusClasses()}
      `}
    >
      {getStatusLabel()}
    </span>
  );
}
