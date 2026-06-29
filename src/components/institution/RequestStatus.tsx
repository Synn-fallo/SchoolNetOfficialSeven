import React from 'react';

export type RequestStatusType = 'en_attente' | 'en_cours' | 'valide' | 'rejete' | 'annule';

interface RequestStatusProps {
  status: RequestStatusType;
  label?: string;
}

export default function RequestStatus({ status, label }: RequestStatusProps) {
  const getStatusStyle = () => {
    switch (status) {
      case 'en_attente':
        return { backgroundColor: '#FEF3C7', color: '#D97706' };
      case 'en_cours':
        return { backgroundColor: '#EFF6FF', color: '#3B82F6' };
      case 'valide':
        return { backgroundColor: '#D1FAE5', color: '#10B981' };
      case 'rejete':
        return { backgroundColor: '#FEE2E2', color: '#EF4444' };
      case 'annule':
        return { backgroundColor: '#F3F4F6', color: '#6B7280' };
      default:
        return { backgroundColor: '#F3F4F6', color: '#6B7280' };
    }
  };

  const getStatusLabel = () => {
    if (label) return label;
    switch (status) {
      case 'en_attente':
        return 'En attente';
      case 'en_cours':
        return 'En cours';
      case 'valide':
        return 'Validée';
      case 'rejete':
        return 'Rejetée';
      case 'annule':
        return 'Annulée';
      default:
        return status;
    }
  };

  const style = getStatusStyle();

  return (
    <span
      className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold"
      style={{ backgroundColor: style.backgroundColor, color: style.color }}
    >
      {getStatusLabel()}
    </span>
  );
}
