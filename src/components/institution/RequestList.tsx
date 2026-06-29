import React from 'react';
import { Card } from '@/components/ui/Card';
import RequestStatus, { RequestStatusType } from './RequestStatus';

interface RequestItem {
  id: string;
  created_at: string;
  statut: RequestStatusType;
  type: 'etablissement' | 'partenariat';
  nom_etablissement?: string;
  organisation_nom?: string;
  ville?: string;
  contact_nom?: string;
  [key: string]: any;
}

interface RequestListProps {
  requests: RequestItem[];
  onSelect: (id: string) => void;
  loading?: boolean;
}

export default function RequestList({ requests, onSelect, loading = false }: RequestListProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const getTitle = (item: RequestItem) => {
    if (item.type === 'etablissement') {
      return item.nom_etablissement || "Demande d'établissement";
    }
    return item.organisation_nom || 'Demande de partenariat';
  };

  const getSubtitle = (item: RequestItem) => {
    if (item.type === 'etablissement') {
      return item.ville || '';
    }
    return item.contact_nom || '';
  };

  const getTypeLabel = (type: string) => {
    if (type === 'etablissement') {
      return 'Établissement';
    }
    return 'Partenariat';
  };

  if (loading && requests.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-3 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (requests.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-sm text-slate-400">Aucune demande trouvée</p>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-3">
      {requests.map((item) => (
        <button
          key={item.id}
          onClick={() => onSelect(item.id)}
          className="w-full text-left"
        >
          <Card className="p-4 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-2">
              <div className="flex-1 min-w-0 mr-3">
                <span className="inline-block text-[10px] font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full mb-1.5">
                  {getTypeLabel(item.type)}
                </span>
                <p className="text-sm font-semibold text-slate-800 truncate">{getTitle(item)}</p>
              </div>
              <RequestStatus status={item.statut} />
            </div>
            {getSubtitle(item) && (
              <p className="text-sm text-slate-500 truncate mb-2">{getSubtitle(item)}</p>
            )}
            <p className="text-xs text-slate-400">{formatDate(item.created_at)}</p>
          </Card>
        </button>
      ))}
    </div>
  );
}
