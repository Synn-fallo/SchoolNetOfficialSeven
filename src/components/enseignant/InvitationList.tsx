// /src/components/enseignant/InvitationList.tsx
// Liste des invitations envoyées

import React, { useState, useEffect } from 'react';
import { Mail, Phone, Calendar } from 'lucide-react';
import { supabase } from '@/lib/supabase.web';
import { Card } from '@/components/ui/Card';
import InvitationStatus from './InvitationStatus';

interface Invitation {
  id: string;
  email: string;
  nom: string;
  prenom: string;
  telephone?: string;
  statut: 'en_attente' | 'acceptee' | 'expiree' | 'annulee';
  expires_at: string;
  created_at: string;
  metadata?: {
    matieres?: string[];
    classes?: string[];
    departement?: string;
  };
}

interface InvitationListProps {
  etablissementId: string;
  onInvitationUpdate?: () => void;
}

export default function InvitationList({ etablissementId, onInvitationUpdate }: InvitationListProps) {
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [loading, setLoading] = useState(true);

  const loadInvitations = async () => {
    try {
      const { data, error } = await supabase
        .from('invitation_codes')
        .select('*')
        .eq('etablissement_id', etablissementId)
        .eq('role', 'enseignant')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setInvitations(data || []);
    } catch (error) {
      console.error('Error loading invitations:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInvitations();
  }, [etablissementId]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const isExpired = (expiresAt: string) => {
    return new Date(expiresAt) < new Date();
  };

  if (loading) {
    return (
      <div className="p-8 text-center">
        <div className="w-8 h-8 border-4 border-schoolnet-primary border-t-transparent rounded-full animate-spin mx-auto" />
      </div>
    );
  }

  if (invitations.length === 0) {
    return (
      <Card className="p-8 text-center">
        <p className="text-sm text-gray-400">Aucune invitation envoyée</p>
      </Card>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {invitations.map((item) => {
        const expired = item.statut === 'expiree' || isExpired(item.expires_at);
        const status = expired && item.statut === 'en_attente' ? 'expiree' : item.statut;
        
        return (
          <Card key={item.id} className="p-4">
            <div className="flex flex-row justify-between items-start mb-3">
              <div>
                <p className="text-sm font-semibold text-gray-800">
                  {item.prenom} {item.nom}
                </p>
                <div className="flex flex-row items-center gap-1.5 text-xs text-gray-400 mt-0.5">
                  <Mail className="w-3 h-3" />
                  <span>{item.email}</span>
                </div>
                {item.telephone && (
                  <div className="flex flex-row items-center gap-1.5 text-xs text-gray-400">
                    <Phone className="w-3 h-3" />
                    <span>{item.telephone}</span>
                  </div>
                )}
              </div>
              <InvitationStatus status={status} />
            </div>
            
            {item.metadata?.departement && (
              <div className="flex flex-row items-center gap-2 text-xs mb-1">
                <span className="text-gray-400">Département:</span>
                <span className="text-gray-600">{item.metadata.departement}</span>
              </div>
            )}
            
            {item.metadata?.matieres && item.metadata.matieres.length > 0 && (
              <div className="flex flex-row items-center gap-2 text-xs mb-1">
                <span className="text-gray-400">Matières:</span>
                <span className="text-gray-600">{item.metadata.matieres.length} sélectionnée(s)</span>
              </div>
            )}
            
            {item.metadata?.classes && item.metadata.classes.length > 0 && (
              <div className="flex flex-row items-center gap-2 text-xs mb-2">
                <span className="text-gray-400">Classes:</span>
                <span className="text-gray-600">{item.metadata.classes.length} sélectionnée(s)</span>
              </div>
            )}
            
            <div className="flex flex-row justify-between items-center pt-2 border-t border-gray-100">
              <div className="flex flex-row items-center gap-1.5 text-xs text-gray-400">
                <Calendar className="w-3 h-3" />
                <span>Envoyée le {formatDate(item.created_at)}</span>
              </div>
              {item.statut === 'en_attente' && !expired && (
                <span className="text-xs text-amber-500">
                  Expire le {formatDate(item.expires_at)}
                </span>
              )}
            </div>
          </Card>
        );
      })}
    </div>
  );
}
