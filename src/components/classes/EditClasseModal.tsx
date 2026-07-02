// /src/components/classes/EditClasseModal.tsx
// Modal de modification d'une classe

import React, { useState, useEffect } from 'react';
import { X, Save, Calendar, ChevronDown } from 'lucide-react';
import { supabase } from '@/lib/supabase.web';
import { Portal } from '@/components/ui/Portal';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';

interface EditClasseModalProps {
  visible: boolean;
  onClose: () => void;
  classeId: string;
  classeNom: string;
  classeNiveau: string;
  classeCycleId?: string;
  classeCapacite?: number;
  anneeScolaireId?: string;
  onSave: () => void;
}

interface AnneeScolaire {
  id: string;
  libelle: string;
  is_active: boolean;
}

interface Cycle {
  id: string;
  nom: string;
  ordre: number;
}

export default function EditClasseModal({
  visible,
  onClose,
  classeId,
  classeNom,
  classeNiveau,
  classeCycleId,
  classeCapacite,
  anneeScolaireId,
  onSave,
}: EditClasseModalProps) {
  const [nom, setNom] = useState(classeNom);
  const [capacite, setCapacite] = useState(classeCapacite?.toString() || '');
  const [cycleId, setCycleId] = useState(classeCycleId || '');
  const [anneeScolaireIdState, setAnneeScolaireIdState] = useState(anneeScolaireId || '');
  const [anneesScolaires, setAnneesScolaires] = useState<AnneeScolaire[]>([]);
  const [cycles, setCycles] = useState<Cycle[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingAnnees, setLoadingAnnees] = useState(true);
  const [loadingCycles, setLoadingCycles] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCyclePicker, setShowCyclePicker] = useState(false);

  useEffect(() => {
    if (visible) {
      setNom(classeNom);
      setCapacite(classeCapacite?.toString() || '');
      setCycleId(classeCycleId || '');
      setAnneeScolaireIdState(anneeScolaireId || '');
      loadAnneesScolaires();
      loadCycles();
    }
  }, [visible, classeNom, classeCapacite, classeCycleId, anneeScolaireId]);

  if (!visible) return null;

  const loadAnneesScolaires = async () => {
    setLoadingAnnees(true);
    try {
      const { data, error } = await supabase
        .from('annees_scolaires')
        .select('id, libelle, is_active')
        .order('libelle', { ascending: false });

      if (error) throw error;
      setAnneesScolaires(data || []);
    } catch (error) {
      console.error('Error loading annees scolaires:', error);
    } finally {
      setLoadingAnnees(false);
    }
  };

  const loadCycles = async () => {
    setLoadingCycles(true);
    try {
      const { data, error } = await supabase
        .from('cycles')
        .select('id, nom, ordre')
        .eq('is_active', true)
        .order('ordre', { ascending: true });

      if (error) throw error;
      setCycles(data || []);
    } catch (error) {
      console.error('Error loading cycles:', error);
    } finally {
      setLoadingCycles(false);
    }
  };

  const getCycleNom = (id: string) => {
    const cycle = cycles.find(c => c.id === id);
    return cycle ? cycle.nom : 'Sélectionner un cycle';
  };

  const handleSave = async () => {
    if (!nom.trim()) {
      setError('Le nom de la classe est obligatoire');
      return;
    }

    if (!cycleId) {
      setError('Le cycle est obligatoire');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const updateData: any = {
        nom: nom.trim(),
        capacite: capacite ? parseInt(capacite) : null,
        cycle_id: cycleId,
      };

      if (anneeScolaireIdState) {
        updateData.annee_scolaire_id = anneeScolaireIdState;
      }

      const { error } = await supabase
        .from('classes')
        .update(updateData)
        .eq('id', classeId);

      if (error) throw error;

      onSave();
      onClose();
    } catch (error) {
      console.error('Error updating class:', error);
      setError('Impossible de modifier la classe');
    } finally {
      setLoading(false);
    }
  };

  const selectedCycleNom = getCycleNom(cycleId);

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
          <div className="flex flex-row justify-between items-center px-5 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800">Modifier la classe</h3>
            <button
              onClick={onClose}
              className="p-1 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* Corps */}
          <div className="p-4 overflow-y-auto max-h-[65vh]">
            <label className="text-sm font-medium text-gray-700 block mb-1.5">
              Nom de la classe *
            </label>
            <Input
              value={nom}
              onChange={(e) => setNom(e.target.value)}
              placeholder="Ex: Tle Technique F1/1"
              className="mb-3"
            />

            <label className="text-sm font-medium text-gray-700 block mb-1.5">
              Niveau
            </label>
            <Input
              value={classeNiveau}
              disabled
              className="mb-3 bg-gray-100 text-gray-400 cursor-not-allowed"
            />

            {/* Cycle */}
            <label className="text-sm font-medium text-gray-700 block mb-1.5">
              Cycle *
            </label>
            {loadingCycles ? (
              <div className="flex items-center justify-center py-2">
                <div className="w-5 h-5 border-2 border-schoolnet-primary border-t-transparent rounded-full animate-spin" />
              </div>
            ) : (
              <button
                onClick={() => setShowCyclePicker(true)}
                className={`w-full flex flex-row justify-between items-center border rounded-lg px-3 py-2.5 text-sm transition-colors ${
                  cycleId ? 'border-gray-300' : 'border-red-300'
                }`}
              >
                <span className={cycleId ? 'text-gray-800' : 'text-gray-400'}>
                  {selectedCycleNom}
                </span>
                <ChevronDown className="w-4 h-4 text-gray-400" />
              </button>
            )}

            <label className="text-sm font-medium text-gray-700 block mb-1.5 mt-3">
              Capacité (optionnel)
            </label>
            <Input
              type="number"
              min={1}
              value={capacite}
              onChange={(e) => setCapacite(e.target.value)}
              placeholder="Nombre d'élèves"
              className="mb-3"
            />

            <label className="text-sm font-medium text-gray-700 block mb-1.5">
              Année scolaire
            </label>
            {loadingAnnees ? (
              <div className="flex items-center justify-center py-2">
                <div className="w-5 h-5 border-2 border-schoolnet-primary border-t-transparent rounded-full animate-spin" />
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {anneesScolaires.map((annee) => (
                  <button
                    key={annee.id}
                    onClick={() => setAnneeScolaireIdState(annee.id)}
                    className={`flex flex-row items-center gap-3 px-3 py-2.5 rounded-lg border transition-colors ${
                      anneeScolaireIdState === annee.id
                        ? 'border-schoolnet-primary bg-blue-50'
                        : 'border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <Calendar className={`w-4 h-4 ${anneeScolaireIdState === annee.id ? 'text-schoolnet-primary' : 'text-gray-400'}`} />
                    <span className={`text-sm ${anneeScolaireIdState === annee.id ? 'text-schoolnet-primary font-medium' : 'text-gray-700'}`}>
                      {annee.libelle}
                    </span>
                    {annee.is_active && (
                      <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                        Active
                      </span>
                    )}
                  </button>
                ))}
              </div>
            )}

            {error && (
              <p className="text-sm text-red-500 mt-2">{error}</p>
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
              disabled={loading}
              className={`flex-1 flex flex-row items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium text-white transition-colors ${
                loading ? 'bg-gray-300 cursor-not-allowed' : 'bg-schoolnet-primary hover:bg-schoolnet-primary/90'
              }`}
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Enregistrer
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Modal de sélection du cycle */}
      {showCyclePicker && (
        <Portal>
          <div 
            className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
            onClick={() => setShowCyclePicker(false)}
          >
            <div 
              className="bg-white rounded-2xl w-full max-w-sm max-h-[70vh] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex flex-row justify-between items-center px-5 py-4 border-b border-gray-200">
                <h4 className="text-lg font-semibold text-gray-800">Sélectionner un cycle</h4>
                <button
                  onClick={() => setShowCyclePicker(false)}
                  className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
              <div className="p-2 overflow-y-auto max-h-[50vh]">
                {cycles.map((cycle) => (
                  <button
                    key={cycle.id}
                    onClick={() => {
                      setCycleId(cycle.id);
                      setShowCyclePicker(false);
                    }}
                    className={`w-full flex flex-row justify-between items-center px-4 py-3 rounded-lg transition-colors ${
                      cycleId === cycle.id ? 'bg-blue-50' : 'hover:bg-gray-50'
                    }`}
                  >
                    <span className={`text-sm ${cycleId === cycle.id ? 'font-medium text-schoolnet-primary' : 'text-gray-700'}`}>
                      {cycle.nom}
                    </span>
                    {cycleId === cycle.id && (
                      <span className="text-schoolnet-primary">✓</span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </Portal>
      )}
    </Portal>
  );
}
