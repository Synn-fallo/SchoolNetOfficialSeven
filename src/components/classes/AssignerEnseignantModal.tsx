// /src/components/classes/AssignerEnseignantModal.tsx
// Modal pour assigner un enseignant à un groupe

import React, { useState, useEffect } from 'react';
import { X, Check, User, BookOpen } from 'lucide-react';
import { supabase } from '@/lib/supabase.web';
import { Portal } from '@/components/ui/Portal';

interface Enseignant {
  id: string;
  nom: string;
  prenom: string;
  email: string;
}

interface Matiere {
  id: string;
  nom: string;
  coefficient: number;
}

interface AssignerEnseignantModalProps {
  visible: boolean;
  onClose: () => void;
  etablissementId: string;
  groupeId: string;
  groupeNom: string;
  onAssign: () => void;
}

export default function AssignerEnseignantModal({
  visible,
  onClose,
  etablissementId,
  groupeId,
  groupeNom,
  onAssign,
}: AssignerEnseignantModalProps) {
  const [enseignants, setEnseignants] = useState<Enseignant[]>([]);
  const [matieres, setMatieres] = useState<Matiere[]>([]);
  const [selectedEnseignantId, setSelectedEnseignantId] = useState<string | null>(null);
  const [selectedMatiereId, setSelectedMatiereId] = useState<string | null>(null);
  const [existingAssignment, setExistingAssignment] = useState<{ enseignant_id: string; matiere_id: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (visible && etablissementId) {
      loadEnseignants();
      loadMatieres();
      loadExistingAssignment();
    }
  }, [visible, etablissementId, groupeId]);

  if (!visible) return null;

  const loadEnseignants = async () => {
    try {
      const { data: rolesData, error: rolesError } = await supabase
        .from('user_roles')
        .select('user_id')
        .eq('etablissement_id', etablissementId)
        .eq('role', 'enseignant')
        .eq('is_active', true);

      if (rolesError) throw rolesError;

      if (!rolesData || rolesData.length === 0) {
        setEnseignants([]);
        return;
      }

      const userIds = rolesData.map(r => r.user_id);
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, nom, prenom')
        .in('id', userIds);

      if (profilesError) throw profilesError;

      const enseignantsWithEmail: Enseignant[] = [];
      for (const profile of (profilesData || [])) {
        const { data: userData } = await supabase
          .from('users')
          .select('email')
          .eq('id', profile.id)
          .single();
        
        enseignantsWithEmail.push({
          id: profile.id,
          nom: profile.nom || '',
          prenom: profile.prenom || '',
          email: userData?.email || '',
        });
      }

      setEnseignants(enseignantsWithEmail);
    } catch (error) {
      console.error('Error loading enseignants:', error);
    }
  };

  const loadMatieres = async () => {
    try {
      const { data, error } = await supabase
        .from('matieres')
        .select('id, nom, coefficient')
        .eq('etablissement_id', etablissementId)
        .eq('is_active', true);

      if (error) throw error;
      setMatieres(data || []);
    } catch (error) {
      console.error('Error loading matieres:', error);
    }
  };

  const loadExistingAssignment = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('enseignant_groupes')
        .select('enseignant_id, matiere_id')
        .eq('groupe_id', groupeId)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setExistingAssignment(data);
        setSelectedEnseignantId(data.enseignant_id);
        setSelectedMatiereId(data.matiere_id);
      } else {
        setExistingAssignment(null);
        setSelectedEnseignantId(null);
        setSelectedMatiereId(null);
      }
    } catch (error) {
      console.error('Error loading existing assignment:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!selectedEnseignantId || !selectedMatiereId) return;

    setSaving(true);
    try {
      if (existingAssignment) {
        const { error } = await supabase
          .from('enseignant_groupes')
          .update({
            enseignant_id: selectedEnseignantId,
            matiere_id: selectedMatiereId,
          })
          .eq('groupe_id', groupeId);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('enseignant_groupes')
          .insert({
            groupe_id: groupeId,
            enseignant_id: selectedEnseignantId,
            matiere_id: selectedMatiereId,
            role: 'professeur',
          });

        if (error) throw error;
      }

      onAssign();
      onClose();
    } catch (error) {
      console.error('Error saving assignment:', error);
      window.alert('Impossible d\'enregistrer l\'assignation');
    } finally {
      setSaving(false);
    }
  };

  const handleRemove = async () => {
    if (!existingAssignment) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from('enseignant_groupes')
        .delete()
        .eq('groupe_id', groupeId);

      if (error) throw error;

      onAssign();
      onClose();
    } catch (error) {
      console.error('Error removing assignment:', error);
      window.alert('Impossible de supprimer l\'assignation');
    } finally {
      setSaving(false);
    }
  };

  const getEnseignantName = (enseignant: Enseignant) => {
    return `${enseignant.prenom} ${enseignant.nom}`;
  };

  if (loading) {
    return (
      <Portal>
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-8 text-center">
            <div className="w-8 h-8 border-4 border-schoolnet-primary border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="mt-3 text-sm text-gray-500">Chargement...</p>
          </div>
        </div>
      </Portal>
    );
  }

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
              <h3 className="text-lg font-semibold text-gray-800">Assigner un enseignant</h3>
              <p className="text-sm text-gray-500">Groupe : {groupeNom}</p>
            </div>
            <button
              onClick={onClose}
              className="p-1 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* Corps */}
          <div className="p-4 overflow-y-auto max-h-[60vh]">
            {/* Enseignants */}
            <h4 className="text-sm font-semibold text-gray-700 mb-3">Enseignant</h4>
            {enseignants.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-4">Aucun enseignant dans cet établissement</p>
            ) : (
              enseignants.map((enseignant) => (
                <button
                  key={enseignant.id}
                  onClick={() => setSelectedEnseignantId(enseignant.id)}
                  className={`w-full flex flex-row items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                    selectedEnseignantId === enseignant.id ? 'bg-blue-50' : 'hover:bg-gray-50'
                  }`}
                >
                  <User className={`w-4 h-4 ${selectedEnseignantId === enseignant.id ? 'text-schoolnet-primary' : 'text-gray-400'}`} />
                  <div className="flex-1 text-left">
                    <p className={`text-sm font-medium ${selectedEnseignantId === enseignant.id ? 'text-schoolnet-primary' : 'text-gray-800'}`}>
                      {getEnseignantName(enseignant)}
                    </p>
                    <p className="text-xs text-gray-400">{enseignant.email}</p>
                  </div>
                  {selectedEnseignantId === enseignant.id && (
                    <Check className="w-4 h-4 text-schoolnet-primary" />
                  )}
                </button>
              ))
            )}

            {/* Matières */}
            <h4 className="text-sm font-semibold text-gray-700 mt-4 mb-3">Matière</h4>
            {matieres.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-4">Aucune matière dans cet établissement</p>
            ) : (
              matieres.map((matiere) => (
                <button
                  key={matiere.id}
                  onClick={() => setSelectedMatiereId(matiere.id)}
                  className={`w-full flex flex-row items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                    selectedMatiereId === matiere.id ? 'bg-blue-50' : 'hover:bg-gray-50'
                  }`}
                >
                  <BookOpen className={`w-4 h-4 ${selectedMatiereId === matiere.id ? 'text-schoolnet-primary' : 'text-gray-400'}`} />
                  <div className="flex-1 text-left">
                    <p className={`text-sm font-medium ${selectedMatiereId === matiere.id ? 'text-schoolnet-primary' : 'text-gray-800'}`}>
                      {matiere.nom}
                    </p>
                    <p className="text-xs text-gray-400">Coefficient : {matiere.coefficient}</p>
                  </div>
                  {selectedMatiereId === matiere.id && (
                    <Check className="w-4 h-4 text-schoolnet-primary" />
                  )}
                </button>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="flex flex-row gap-3 px-5 py-4 border-t border-gray-200">
            {existingAssignment && (
              <button
                onClick={handleRemove}
                disabled={saving}
                className="flex-1 py-2.5 bg-red-50 hover:bg-red-100 rounded-lg text-sm font-medium text-red-500 transition-colors"
              >
                Supprimer
              </button>
            )}
            <button
              onClick={onClose}
              className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium text-gray-500 transition-colors"
            >
              Annuler
            </button>
            <button
              onClick={handleSave}
              disabled={!selectedEnseignantId || !selectedMatiereId || saving}
              className={`flex-1 py-2.5 rounded-lg text-sm font-medium text-white transition-colors ${
                !selectedEnseignantId || !selectedMatiereId || saving
                  ? 'bg-gray-300 cursor-not-allowed'
                  : 'bg-schoolnet-primary hover:bg-schoolnet-primary/90'
              }`}
            >
              {saving ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto" />
              ) : (
                existingAssignment ? 'Modifier' : 'Assigner'
              )}
            </button>
          </div>
        </div>
      </div>
    </Portal>
  );
}
