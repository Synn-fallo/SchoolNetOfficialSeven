import React from 'react';
import { Clock, CheckCircle, XCircle, Calendar, ChevronRight } from 'lucide-react';

export type RequestStatus = 'en_attente' | 'valide' | 'rejete' | 'annule' | 'en_cours';

interface RequestCardProps {
  id: string;
  title: string;
  subtitle?: string;
  status: RequestStatus;
  date: string;
  onPress: () => void;
  onCancel?: () => void;
  showCancelButton?: boolean;
}

const getStatusConfig = (status: RequestStatus) => {
  switch (status) {
    case 'en_attente':
      return { label: 'En attente', color: '#F59E0B', bg: '#FEF3C7', icon: Clock };
    case 'en_cours':
      return { label: 'En cours', color: '#3B82F6', bg: '#EFF6FF', icon: Clock };
    case 'valide':
      return { label: 'Validé', color: '#10B981', bg: '#D1FAE5', icon: CheckCircle };
    case 'rejete':
      return { label: 'Rejeté', color: '#EF4444', bg: '#FEE2E2', icon: XCircle };
    case 'annule':
      return { label: 'Annulé', color: '#6B7280', bg: '#F3F4F6', icon: XCircle };
    default:
      return { label: status, color: '#6B7280', bg: '#F3F4F6', icon: Clock };
  }
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) return "Aujourd'hui";
  if (diffDays === 1) return 'Hier';
  if (diffDays < 7) return `Il y a ${diffDays} jours`;
  return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' });
};

export default function RequestCard({
  title,
  subtitle,
  status,
  date,
  onPress,
  onCancel,
  showCancelButton = false,
}: RequestCardProps) {
  const statusConfig = getStatusConfig(status);
  const StatusIcon = statusConfig.icon;
  const isCancelable = status === 'en_attente' || status === 'en_cours';

  return (
    <button
      onClick={onPress}
      className="w-full text-left bg-white rounded-xl p-4 mb-2.5 border border-slate-200 shadow-sm hover:shadow-md transition-shadow"
    >
      <div className="flex justify-between items-start mb-2.5">
        <div className="flex-1 min-w-0 mr-2.5">
          <p className="text-sm font-semibold text-slate-800 truncate">{title}</p>
          {subtitle && (
            <p className="text-xs text-slate-500 truncate">{subtitle}</p>
          )}
        </div>
        <div className="flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium flex-shrink-0" style={{ backgroundColor: statusConfig.bg, color: statusConfig.color }}>
          <StatusIcon className="h-3 w-3" />
          <span>{statusConfig.label}</span>
        </div>
      </div>

      <div className="flex justify-between items-center">
        <div className="flex items-center gap-1.5">
          <Calendar className="h-3 w-3 text-slate-400" />
          <span className="text-xs text-slate-400">{formatDate(date)}</span>
        </div>
        <div className="flex items-center gap-2">
          {showCancelButton && isCancelable && onCancel && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onCancel();
              }}
              className="px-2 py-1 bg-red-50 hover:bg-red-100 text-red-500 rounded-lg text-xs font-medium transition-colors"
            >
              Annuler
            </button>
          )}
          <ChevronRight className="h-4 w-4 text-slate-400" />
        </div>
      </div>
    </button>
  );
}
