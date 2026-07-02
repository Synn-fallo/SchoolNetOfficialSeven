// /src/components/classes/AssignerElevesModal.tsx
// Modal pour assigner des élèves à un groupe

import React, { useState, useEffect } from 'react';
import { X, Check, Users } from 'lucide-react';
import { supabase } from '@/lib/supabase.web';
import { Portal } from '@/components/ui/Portal';
import { Card } from '@/components/ui/Card';

interface Eleve {
  id: string;
  matricule: string;
  prenom?: string;
  nom?: string;
}

interface AssignerElevesModalProps {
  visible: boolean;
  onClose: () => void;
  classeId: string;
  groupeId: string;
  groupeNom: string;
  onAssign: () => void;
}

export default function AssignerElevesModal({
  visible,
  onClose,
  classeId,
  groupeId,
  groupeNom,
  onAssign,
}: AssignerElevesModalProps) {
  const [eleves, setEleves] = useState<Eleve[]>([]);
  const [selectedEleves, setSelectedEleves] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (visible && classeId) {
      loadEleves();
      loadExistingAssignments();
    }
  }, [visible, classeId, groupeId]);

  if (!visible) return null;

  const loadEleves = async () => {
    setLoading(true);
    try {
      // 1. Récupérer tous les groupes de la classe
      const { data: tousLesGroupes, error: groupesError } = await supabase
        .from('groupes_eleves')
        .select('id')
        .eq('classe_id', classeId);

      if (groupesError) throw groupesError;

      const tousLesGroupesIds = tousLesGroupes?.map(g => g.id) || [];

      // 2. Récupérer les élèves qui ont déjà un groupe
      let elevesAvecGroupeIds = new Set<string>();
      
      if (tousLesGroupesIds.length > 0) {
        const { data: elevesAvecGroupe, error: elevesAvecGroupeError } = await supabase
          .from('eleve_groupes')
          .select('eleve_id')
          .in('groupe_id', tousLesGroupesIds);

        if (!elevesAvecGroupeError && elevesAvecGroupe) {
          elevesAvecGroupeIds = new Set(elevesAvecGroupe.map(eg => eg.eleve_id));
        }
      }

      // 3. Récupérer tous les élèves de la classe
      const { data: elevesData, error: elevesError } = await supabase
        .from('eleves')
        .select('id, matricule, user_id')
        .eq('classe_id', classeId)
        .eq('statut', 'actif');

      if (elevesError) throw elevesError;

      if (!elevesData || elevesData.length === 0) {
        setEleves([]);
        return;
      }

      // 4. Filtrer les élèves qui n'ont AUCUN groupe
      const elevesSansGroupe = elevesData.filter(e => !elevesAvecGroupeIds.has(e.id));

      if (elevesSansGroupe.length === 0) {
        setEleves([]);
        return;
      }

      // 5. Récupérer les profils
      const userIds = elevesSansGroupe.map(e => e.user_id).filter(Boolean);
      let profileMap = new Map();

      if (userIds.length > 0) {
        const { data: profilesData, error: profilesError } = await supabase
          .from('profiles')
          .select('id, nom, prenom')
          .in('id', userIds);

        if (!profilesError && profilesData) {
          profilesData.forEach(p => {
            profileMap.set(p.id, { nom: p.nom || '', prenom: p.prenom || '' });
          });
        }
      }

      // 6. Formater les élèves disponibles
      const formattedEleves: Eleve[] = elevesSansGroupe.map(e => {
        const profile = profileMap.get(e.user_id);
        return {
          id: e.id,
          matricule: e.matricule || '',
          prenom: profile?.prenom,
          nom: profile?.nom,
        };
      });

      setEleves(formattedEleves);
    } catch (error) {
      console.error('Error loading eleves:', error);
      setEleves([]);
    } finally {
      setLoading(false);
    }
  };

  const loadExistingAssignments = async () => {
    try {
      const { data, error } = await supabase
        .from('eleve_groupes')
        .select('eleve_id')
        .eq('groupe_id', groupeId);

      if (error) throw error;

      const assignedIds = new Set(data?.map(d => d.eleve_id) || []);
      setSelectedEleves(assignedIds);
    } catch (error) {
      console.error('Error loading assignments:', error);
    }
  };

  const toggleEleve = (eleveId: string) => {
    const newSelected = new Set(selectedEleves);
    if (newSelected.has(eleveId)) {
      newSelected.delete(eleveId);
    } else {
      newSelected.add(eleveId);
    }
    setSelectedEleves(newSelected);
  };

  const selectAll = () => {
    if (selectedEleves.size === eleves.length) {
      setSelectedEleves(new Set());
    } else {
      setSelectedEleves(new Set(eleves.map(e => e.id)));
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Récupérer les assignations existantes
      const { data: existing } = await supabase
        .from('eleve_groupes')
        .select('eleve_id')
        .eq('groupe_id', groupeId);

      const existingIds = new Set(existing?.map(e => e.eleve_id) || []);

      // Élèves à ajouter
      const toAdd = Array.from(selectedEleves).filter(id => !existingIds.has(id));
      // Élèves à retirer
      const toRemove = Array.from(existingIds).filter(id => !selectedEleves.has(id));

      // Ajouter les nouveaux
      if (toAdd.length > 0) {
        const { error: addError } = await supabase
          .from('eleve_groupes')
          .insert(toAdd.map(eleveId => ({ eleve_id: eleveId, groupe_id: groupeId })));

        if (addError) throw addError;
      }

      // Retirer les anciens
      if (toRemove.length > 0) {
        const { error: removeError } = await supabase
          .from('eleve_groupes')
          .delete()
          .eq('groupe_id', groupeId)
          .in('eleve_id', toRemove);

        if (removeError) throw removeError;
      }

      onAssign();
      onClose();
    } catch (error) {
      console.error('Error saving assignments:', error);
      window.alert('Impossible d\'enregistrer les assignations');
    } finally {
      setSaving(false);
    }
  };

  const getEleveName = (eleve: Eleve) => {
    if (eleve.prenom && eleve.nom) {
      return `${eleve.prenom} ${eleve.nom}`;
    }
    return eleve.matricule;
  };

  return (
    <Portal>
      <div 
        className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <div 
          className="bg-white rounded-2xl w-full max-w-md max-h-[85vh] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* En-tête */}
          <div className="flex flex-row justify-between items-start px-5 py-4 border-b border-gray-200">
            <div>
              <h3 className="text-lg font-semibold text-gray-800">Assigner des élèves</h3>
              <p className="text-sm text-gray-500">Groupe : {groupeNom}</p>
            </div>
            <button
              onClick={onClose}
              className="p-1 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* Barre d'outils */}
          <div className="flex flex-row justify-between items-center px-4 py-3 bg-gray-50 border-b border-gray-200">
            <button
              onClick={selectAll}
              className="flex flex-row items-center gap-1.5 text-sm text-schoolnet-primary font-medium hover:underline"
            >
              <Users className="w-4 h-4" />
              {selectedEleves.size === eleves.length ? 'Désélectionner tout' : 'Tout sélectionner'}
            </button>
            <span className="text-xs text-gray-500">
              {selectedEleves.size} / {eleves.length} sélectionné(s)
            </span>
          </div>

          {/* Liste des élèves */}
          <div className="p-2 overflow-y-auto max-h-[50vh]">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-8">
                <div className="w-8 h-8 border-4 border-schoolnet-primary border-t-transparent rounded-full animate-spin" />
                <p className="mt-3 text-sm text-gray-500">Chargement des élèves...</p>
              </div>
            ) : eleves.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-sm text-gray-400">Aucun élève disponible</p>
                <p className="text-xs text-gray-400 mt-1">
                  Tous les élèves de la classe ont déjà un groupe.
                </p>
              </div>
            ) : (
              eleves.map((eleve) => {
                const isSelected = selectedEleves.has(eleve.id);
                return (
                  <button
                    key={eleve.id}
                    onClick={() => toggleEleve(eleve.id)}
                    className={`w-full flex flex-row justify-between items-center px-3 py-3 rounded-lg transition-colors ${
                      isSelected ? 'bg-blue-50' : 'hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex-1 text-left">
                      <p className="text-sm font-medium text-gray-800">{getEleveName(eleve)}</p>
                      <p className="text-xs text-gray-400">{eleve.matricule}</p>
                    </div>
                    <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                      isSelected 
                        ? 'bg-schoolnet-primary border-schoolnet-primary' 
                        : 'border-gray-300'
                    }`}>
                      {isSelected && <Check className="w-3 h-3 text-white" />}
                    </div>
                  </button>
                );
              })
            )}
          </div>

          {/* Footer */}
          <div className="flex flex-row gap-3 px-5 py-4 border-t border-gray-200">
            <button
              onClick={onClose}
              className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium text-gray-500 transition-colors"
            >
              Annuler
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className={`flex-1 py-2.5 rounded-lg text-sm font-medium text-white transition-colors ${
                saving ? 'bg-gray-300 cursor-not-allowed' : 'bg-schoolnet-primary hover:bg-schoolnet-primary/90'
              }`}
            >
              {saving ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto" />
              ) : (
                'Enregistrer'
              )}
            </button>
          </div>
        </div>
      </div>
    </Portal>
  );
}
