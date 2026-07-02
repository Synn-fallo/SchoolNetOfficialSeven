// /src/components/classes/AssignerPrincipalModal.tsx
// Modal pour assigner un professeur principal à une classe

import React, { useState, useEffect } from 'react';
import { X, User, Check } from 'lucide-react';
import { supabase } from '@/lib/supabase.web';
import { Portal } from '@/components/ui/Portal';
import { Input } from '@/components/ui/Input';

interface Enseignant {
  id: string;
  nom: string;
  prenom: string;
  email: string;
}

interface AssignerPrincipalModalProps {
  visible: boolean;
  onClose: () => void;
  classeId: string;
  classeNom: string;
  currentPrincipalId?: string;
  currentPrincipalNom?: string;
  onSave: () => void;
}

export default function AssignerPrincipalModal({
  visible,
  onClose,
  classeId,
  classeNom,
  currentPrincipalId,
  currentPrincipalNom,
  onSave,
}: AssignerPrincipalModalProps) {
  const [enseignants, setEnseignants] = useState<Enseignant[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(currentPrincipalId || null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (visible) {
      loadEnseignants();
      setSelectedId(currentPrincipalId || null);
    }
  }, [visible, classeId]);

  if (!visible) return null;

  const loadEnseignants = async () => {
    setLoading(true);
    try {
      // Récupérer l'établissement de la classe
      const { data: classe, error: classeError } = await supabase
        .from('classes')
        .select('etablissement_id')
        .eq('id', classeId)
        .single();

      if (classeError) throw classeError;

      // Récupérer les enseignants de l'établissement
      const { data: rolesData, error: rolesError } = await supabase
        .from('user_roles')
        .select('user_id')
        .eq('etablissement_id', classe.etablissement_id)
        .eq('role', 'enseignant')
        .eq('is_active', true);

      if (rolesError) throw rolesError;

      if (!rolesData || rolesData.length === 0) {
        setEnseignants([]);
        setLoading(false);
        return;
      }

      const userIds = rolesData.map(r => r.user_id);
      
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, nom, prenom')
        .in('id', userIds);

      if (profilesError) throw profilesError;

      // Récupérer les emails
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
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!selectedId) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from('classes')
        .update({ enseignant_principal_id: selectedId })
        .eq('id', classeId);

      if (error) throw error;

      onSave();
      onClose();
    } catch (error) {
      console.error('Error assigning principal:', error);
      window.alert('Impossible d\'assigner le professeur principal');
    } finally {
      setSaving(false);
    }
  };

  const handleRemove = async () => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from('classes')
        .update({ enseignant_principal_id: null })
        .eq('id', classeId);

      if (error) throw error;

      setSelectedId(null);
      onSave();
      onClose();
    } catch (error) {
      console.error('Error removing principal:', error);
      window.alert('Impossible de retirer le professeur principal');
    } finally {
      setSaving(false);
    }
  };

  const filteredEnseignants = enseignants.filter(enseignant => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      enseignant.nom.toLowerCase().includes(query) ||
      enseignant.prenom.toLowerCase().includes(query) ||
      enseignant.email.toLowerCase().includes(query)
    );
  });

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
              <h3 className="text-lg font-semibold text-gray-800">Professeur principal</h3>
              <p className="text-sm text-gray-500">Classe : {classeNom}</p>
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
            {/* Professeur principal actuel */}
            {currentPrincipalId && (
              <div className="bg-gray-50 rounded-lg p-3 mb-4">
                <p className="text-xs text-gray-500">Professeur principal actuel :</p>
                <p className="text-sm font-semibold text-gray-800 mt-1">{currentPrincipalNom || 'Non défini'}</p>
                <button
                  onClick={handleRemove}
                  disabled={saving}
                  className="mt-2 px-3 py-1 bg-red-50 hover:bg-red-100 rounded-md text-xs font-medium text-red-500 transition-colors"
                >
                  Retirer
                </button>
              </div>
            )}

            <h4 className="text-sm font-semibold text-gray-700 mb-3">Nouveau professeur principal</h4>

            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher un enseignant..."
              className="mb-3"
            />

            {loading ? (
              <div className="flex flex-col items-center justify-center py-8">
                <div className="w-8 h-8 border-4 border-schoolnet-primary border-t-transparent rounded-full animate-spin" />
              </div>
            ) : filteredEnseignants.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-4">Aucun enseignant trouvé</p>
            ) : (
              filteredEnseignants.map((enseignant) => (
                <button
                  key={enseignant.id}
                  onClick={() => setSelectedId(enseignant.id)}
                  className={`w-full flex flex-row items-center justify-between px-3 py-3 border-b border-gray-100 transition-colors ${
                    selectedId === enseignant.id ? 'bg-blue-50' : 'hover:bg-gray-50'
                  }`}
                >
                  <div className="flex flex-row items-center gap-3">
                    <User className={`w-4 h-4 ${selectedId === enseignant.id ? 'text-schoolnet-primary' : 'text-gray-400'}`} />
                    <div className="text-left">
                      <p className={`text-sm font-medium ${selectedId === enseignant.id ? 'text-schoolnet-primary' : 'text-gray-800'}`}>
                        {enseignant.prenom} {enseignant.nom}
                      </p>
                      <p className="text-xs text-gray-400">{enseignant.email}</p>
                    </div>
                  </div>
                  {selectedId === enseignant.id && (
                    <Check className="w-4 h-4 text-schoolnet-primary" />
                  )}
                </button>
              ))
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
              disabled={!selectedId || saving}
              className={`flex-1 py-2.5 rounded-lg text-sm font-medium text-white transition-colors ${
                !selectedId || saving
                  ? 'bg-gray-300 cursor-not-allowed'
                  : 'bg-schoolnet-primary hover:bg-schoolnet-primary/90'
              }`}
            >
              {saving ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto" />
              ) : (
                'Assigner'
              )}
            </button>
          </div>
        </div>
      </div>
    </Portal>
  );
}
