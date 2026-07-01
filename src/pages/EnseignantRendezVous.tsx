// /src/pages/EnseignantRendezVous.tsx
// Gestion des rendez-vous

import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase.web';
import { Calendar, Clock, User, ChevronLeft, CheckCircle, XCircle, MessageCircle, Plus } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Portal } from '@/components/ui/Portal';

interface RendezVous {
  id: string;
  parent_id: string;
  parent_nom: string;
  parent_prenom: string;
  eleve_id: string;
  eleve_nom: string;
  eleve_prenom: string;
  date_rdv: string;
  heure_debut: string;
  heure_fin: string;
  motif: string;
  statut: 'en_attente' | 'confirme' | 'refuse' | 'annule' | 'termine';
  lieu: string;
  created_at: string;
  motif_refus?: string;
}

export default function EnseignantRendezVous() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [rendezVous, setRendezVous] = useState<RendezVous[]>([]);
  const [loading, setLoading] = useState(true);
  const [showRefusModal, setShowRefusModal] = useState(false);
  const [selectedRdv, setSelectedRdv] = useState<RendezVous | null>(null);
  const [motifRefus, setMotifRefus] = useState('');

  const chargerRendezVous = useCallback(async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('rendez_vous')
        .select(`
          *,
          parent:parent_id (user_id),
          eleve:eleve_id (user_id)
        `)
        .eq('enseignant_id', user.id)
        .order('date_rdv', { ascending: true });

      if (error) throw error;

      const formatted: RendezVous[] = [];
      
      for (const rdv of data || []) {
        let parentNom = '', parentPrenom = '';
        let eleveNom = '', elevePrenom = '';

        if (rdv.parent?.user_id) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('nom, prenom')
            .eq('id', rdv.parent.user_id)
            .maybeSingle();
          if (profile) {
            parentNom = profile.nom;
            parentPrenom = profile.prenom;
          }
        }

        if (rdv.eleve?.user_id) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('nom, prenom')
            .eq('id', rdv.eleve.user_id)
            .maybeSingle();
          if (profile) {
            eleveNom = profile.nom;
            elevePrenom = profile.prenom;
          }
        }

        formatted.push({
          id: rdv.id,
          parent_id: rdv.parent_id,
          parent_nom: parentNom,
          parent_prenom: parentPrenom,
          eleve_id: rdv.eleve_id,
          eleve_nom: eleveNom,
          eleve_prenom: elevePrenom,
          date_rdv: rdv.date_rdv,
          heure_debut: rdv.heure_debut,
          heure_fin: rdv.heure_fin,
          motif: rdv.motif,
          statut: rdv.statut,
          lieu: rdv.lieu,
          created_at: rdv.created_at,
          motif_refus: rdv.motif_refus,
        });
      }

      setRendezVous(formatted);
    } catch (err) {
      console.error('Erreur:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const handleRepondre = async (rdvId: string, action: 'confirme' | 'refuse', motif?: string) => {
    try {
      const updateData: any = { statut: action };
      if (action === 'refuse' && motif) {
        updateData.motif_refus = motif;
      }

      const { error } = await supabase
        .from('rendez_vous')
        .update(updateData)
        .eq('id', rdvId);

      if (error) throw error;

      window.alert(action === 'confirme' ? 'Rendez-vous confirmé' : 'Rendez-vous refusé');
      chargerRendezVous();
    } catch (err) {
      window.alert('Impossible de traiter la demande');
    }
  };

  useEffect(() => {
    chargerRendezVous();
  }, [chargerRendezVous]);

  const getStatutBadge = (statut: string) => {
    switch (statut) {
      case 'confirme': return { bg: 'bg-emerald-50', color: 'text-emerald-700', label: 'Confirmé' };
      case 'refuse': return { bg: 'bg-red-50', color: 'text-red-700', label: 'Refusé' };
      case 'annule': return { bg: 'bg-gray-50', color: 'text-gray-500', label: 'Annulé' };
      case 'termine': return { bg: 'bg-blue-50', color: 'text-blue-700', label: 'Terminé' };
      default: return { bg: 'bg-amber-50', color: 'text-amber-700', label: 'En attente' };
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50">
        <div className="w-10 h-10 border-4 border-schoolnet-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const demandesEnAttente = rendezVous.filter(r => r.statut === 'en_attente');
  const autresRdv = rendezVous.filter(r => r.statut !== 'en_attente');

  return (
    <div className="flex-1 bg-gray-50">
      <div className="p-4 pb-8 max-w-3xl mx-auto">
        {/* En-tête */}
        <div className="flex flex-row items-center justify-between mb-5">
          <button onClick={() => navigate(-1)} className="p-2 -ml-2">
            <ChevronLeft className="w-6 h-6 text-schoolnet-primary" />
          </button>
          <h1 className="text-lg font-semibold text-gray-800">Rendez-vous parents</h1>
          <button
            onClick={() => navigate('/enseignant/rendez-vous-form')}
            className="bg-schoolnet-primary text-white p-2 rounded-full hover:bg-schoolnet-primary/90 transition-colors"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>

        {/* Demandes en attente */}
        {demandesEnAttente.length > 0 && (
          <div className="mb-6">
            <h2 className="text-sm font-semibold text-gray-700 mb-3">📋 Demandes en attente ({demandesEnAttente.length})</h2>
            {demandesEnAttente.map((rdv) => {
              const status = getStatutBadge(rdv.statut);
              return (
                <Card key={rdv.id} className="p-4 mb-3">
                  <div className="flex flex-row justify-between items-center mb-2">
                    <div className="flex flex-row items-center gap-2">
                      <User className="w-4 h-4 text-schoolnet-primary" />
                      <span className="text-sm font-semibold text-gray-800">{rdv.parent_prenom} {rdv.parent_nom}</span>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${status.bg} ${status.color}`}>
                      {status.label}
                    </span>
                  </div>
                  <p className="text-sm text-schoolnet-primary mb-2">Enfant : {rdv.eleve_prenom} {rdv.eleve_nom}</p>
                  <div className="flex flex-row items-center gap-4 mb-3">
                    <div className="flex flex-row items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-gray-400" />
                      <span className="text-xs text-gray-500">{new Date(rdv.date_rdv).toLocaleDateString('fr-FR')}</span>
                    </div>
                    <div className="flex flex-row items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-gray-400" />
                      <span className="text-xs text-gray-500">{rdv.heure_debut} - {rdv.heure_fin}</span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">{rdv.motif}</p>
                  <div className="flex flex-row gap-3">
                    <button
                      onClick={() => handleRepondre(rdv.id, 'confirme')}
                      className="flex-1 flex flex-row items-center justify-center gap-1.5 bg-emerald-500 text-white py-2 rounded-lg text-sm font-medium hover:bg-emerald-600 transition-colors"
                    >
                      <CheckCircle className="w-4 h-4" />
                      Confirmer
                    </button>
                    <button
                      onClick={() => {
                        setSelectedRdv(rdv);
                        setShowRefusModal(true);
                      }}
                      className="flex-1 flex flex-row items-center justify-center gap-1.5 bg-red-50 text-red-500 py-2 rounded-lg text-sm font-medium hover:bg-red-100 transition-colors"
                    >
                      <XCircle className="w-4 h-4" />
                      Refuser
                    </button>
                  </div>
                </Card>
              );
            })}
          </div>
        )}

        {/* Historique */}
        {autresRdv.length > 0 && (
          <div>
            <h2 className="text-sm font-semibold text-gray-700 mb-3">📅 Historique</h2>
            {autresRdv.map((rdv) => {
              const status = getStatutBadge(rdv.statut);
              return (
                <Card key={rdv.id} className="p-4 mb-3">
                  <div className="flex flex-row justify-between items-center mb-2">
                    <div className="flex flex-row items-center gap-2">
                      <User className="w-4 h-4 text-gray-400" />
                      <span className="text-sm font-medium text-gray-600">{rdv.parent_prenom} {rdv.parent_nom}</span>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${status.bg} ${status.color}`}>
                      {status.label}
                    </span>
                  </div>
                  <p className="text-sm text-schoolnet-primary mb-2">Enfant : {rdv.eleve_prenom} {rdv.eleve_nom}</p>
                  <div className="flex flex-row items-center gap-4 mb-2">
                    <div className="flex flex-row items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-gray-400" />
                      <span className="text-xs text-gray-500">{new Date(rdv.date_rdv).toLocaleDateString('fr-FR')}</span>
                    </div>
                    <div className="flex flex-row items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-gray-400" />
                      <span className="text-xs text-gray-500">{rdv.heure_debut} - {rdv.heure_fin}</span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600">{rdv.motif}</p>
                  {rdv.statut === 'refuse' && rdv.motif_refus && (
                    <p className="text-xs text-red-500 mt-2">Motif : {rdv.motif_refus}</p>
                  )}
                </Card>
              );
            })}
          </div>
        )}

        {rendezVous.length === 0 && (
          <div className="py-12 text-center">
            <MessageCircle className="w-12 h-12 text-gray-300 mx-auto" />
            <h3 className="text-lg font-semibold text-gray-700 mt-4">Aucune demande</h3>
            <p className="text-sm text-gray-400 mt-2">Vous n'avez pas encore de demande de rendez-vous.</p>
          </div>
        )}
      </div>

      {/* Modal de refus */}
      {showRefusModal && (
        <Portal>
          <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl w-full max-w-md p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Motif du refus</h3>
              <textarea
                value={motifRefus}
                onChange={(e) => setMotifRefus(e.target.value)}
                placeholder="Expliquez le motif du refus..."
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-schoolnet-primary min-h-[80px] mb-4"
                rows={3}
              />
              <div className="flex flex-row gap-3">
                <button
                  onClick={() => { setShowRefusModal(false); setMotifRefus(''); }}
                  className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium text-gray-500 transition-colors"
                >
                  Annuler
                </button>
                <button
                  onClick={() => {
                    if (selectedRdv) {
                      handleRepondre(selectedRdv.id, 'refuse', motifRefus);
                      setShowRefusModal(false);
                      setMotifRefus('');
                    }
                  }}
                  className="flex-1 py-2.5 bg-red-500 hover:bg-red-600 rounded-lg text-sm font-medium text-white transition-colors"
                >
                  Confirmer le refus
                </button>
              </div>
            </div>
          </div>
        </Portal>
      )}
    </div>
  );
}
