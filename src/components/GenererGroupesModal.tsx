// /src/components/classes/GenererGroupesModal.tsx
// Modal pour générer des groupes à partir d'un modèle

import React, { useState, useEffect } from 'react';
import { X, RefreshCw } from 'lucide-react';
import { supabase } from '@/lib/supabase.web';
import { Portal } from '@/components/ui/Portal';
import { Card } from '@/components/ui/Card';
import Selector from '@/components/common/Selector';
import SelectorModal from '@/components/common/SelectorModal';
import ConfirmationModal from '@/components/common/ConfirmationModal';

interface ModeleGroupe {
  id: string;
  nom: string;
  valeurs: string[];
  type_suffixe: string;
  is_active: boolean;
}

interface GenererGroupesModalProps {
  visible: boolean;
  onClose: () => void;
  onGenerate: (modele: ModeleGroupe) => Promise<void>;
  isLoading?: boolean;
}

export default function GenererGroupesModal({
  visible,
  onClose,
  onGenerate,
  isLoading = false,
}: GenererGroupesModalProps) {
  const [modeles, setModeles] = useState<ModeleGroupe[]>([]);
  const [loadingModeles, setLoadingModeles] = useState(true);
  const [selectedModeleId, setSelectedModeleId] = useState<string>('');
  const [showModeleSelector, setShowModeleSelector] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    if (visible) {
      loadModeles();
    }
  }, [visible]);

  useEffect(() => {
    if (!visible) {
      setSelectedModeleId('');
    }
  }, [visible]);

  const loadModeles = async () => {
    setLoadingModeles(true);
    try {
      const { data, error } = await supabase
        .from('modeles_groupes')
        .select('*')
        .eq('is_active', true)
        .order('nom', { ascending: true });

      if (error) throw error;
      setModeles(data || []);
    } catch (error) {
      console.error('Erreur chargement modèles:', error);
      setModeles([]);
    } finally {
      setLoadingModeles(false);
    }
  };

  const selectedModele = modeles.find(m => m.id === selectedModeleId);

  const handleSelectModele = (id: string) => {
    setSelectedModeleId(id);
  };

  const handleGenerate = () => {
    if (!selectedModele) return;
    setShowConfirm(true);
  };

  const handleConfirmGenerate = async () => {
    if (!selectedModele) return;
    setShowConfirm(false);
    await onGenerate(selectedModele);
    setSelectedModeleId('');
    onClose();
  };

  const handleClose = () => {
    setSelectedModeleId('');
    onClose();
  };

  const hasModeles = modeles.length > 0;

  if (!visible) return null;

  return (
    <>
      <Portal>
        <div 
          className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
          onClick={handleClose}
        >
          <div 
            className="bg-white rounded-2xl w-full max-w-md overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* En-tête */}
            <div className="flex flex-row justify-between items-start px-5 py-4 border-b border-gray-200">
              <div>
                <h3 className="text-lg font-semibold text-gray-800">Générer des groupes</h3>
                <p className="text-sm text-gray-500 mt-0.5">Choisissez un modèle pour créer automatiquement les groupes</p>
              </div>
              <button
                onClick={handleClose}
                className="p-1 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Contenu */}
            <div className="p-5">
              {loadingModeles ? (
                <div className="flex flex-col items-center justify-center py-8">
                  <div className="w-8 h-8 border-4 border-schoolnet-primary border-t-transparent rounded-full animate-spin" />
                  <p className="mt-3 text-sm text-gray-500">Chargement des modèles...</p>
                </div>
              ) : isLoading ? (
                <div className="flex flex-col items-center justify-center py-8">
                  <div className="w-8 h-8 border-4 border-schoolnet-primary border-t-transparent rounded-full animate-spin" />
                  <p className="mt-3 text-sm text-gray-500">Génération en cours...</p>
                </div>
              ) : !hasModeles ? (
                <div className="flex flex-col items-center justify-center py-8">
                  <RefreshCw className="w-10 h-10 text-gray-300" />
                  <h4 className="text-base font-semibold text-gray-700 mt-3">Aucun modèle disponible</h4>
                  <p className="text-sm text-gray-400 text-center mt-1">
                    Veuillez d'abord créer des modèles de groupes dans les paramètres.
                  </p>
                </div>
              ) : (
                <>
                  <Selector
                    label="Modèle de groupes"
                    value={selectedModele?.nom || ''}
                    onPress={() => setShowModeleSelector(true)}
                    placeholder="Choisir un modèle"
                    required
                  />

                  {selectedModele && (
                    <div className="bg-blue-50 rounded-lg p-3 mb-4 border border-blue-200">
                      <p className="text-xs text-gray-500 mb-1">Aperçu du modèle :</p>
                      <p className="text-sm font-semibold text-blue-700">{selectedModele.nom}</p>
                      <p className="text-xs text-gray-600 mt-1">
                        Groupes générés : {selectedModele.valeurs?.join(', ') || 'Aucune valeur'}
                      </p>
                    </div>
                  )}

                  <div className="flex flex-row items-start gap-2 bg-amber-50 rounded-lg p-3 border border-amber-200">
                    <RefreshCw className="w-3.5 h-3.5 text-amber-600 flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-amber-700">
                      Les groupes existants seront remplacés par les nouveaux.
                    </p>
                  </div>
                </>
              )}
            </div>

            {/* Actions */}
            {hasModeles && !loadingModeles && !isLoading && (
              <div className="flex flex-row gap-3 px-5 py-4 border-t border-gray-200">
                <button
                  onClick={handleClose}
                  className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium text-gray-500 transition-colors"
                >
                  Annuler
                </button>
                <button
                  onClick={handleGenerate}
                  disabled={!selectedModele}
                  className={`
                    flex-1 py-2.5 rounded-lg text-sm font-medium text-white transition-colors
                    ${!selectedModele
                      ? 'bg-gray-300 cursor-not-allowed'
                      : 'bg-schoolnet-primary hover:bg-schoolnet-primary/90'
                    }
                  `}
                >
                  Générer
                </button>
              </div>
            )}
          </div>
        </div>
      </Portal>

      {/* Modal de sélection des modèles */}
      {hasModeles && (
        <SelectorModal
          visible={showModeleSelector}
          onClose={() => setShowModeleSelector(false)}
          title="Sélectionner un modèle de groupes"
          items={modeles}
          selectedId={selectedModeleId}
          onSelect={handleSelectModele}
          getItemLabel={(item) => item.nom}
          getItemSubLabel={(item) => item.valeurs?.length > 0 ? `Groupes: ${item.valeurs.join(', ')}` : ''}
        />
      )}

      {/* Modal de confirmation */}
      <ConfirmationModal
        visible={showConfirm}
        title="Générer les groupes"
        message={`Générer les groupes à partir du modèle "${selectedModele?.nom || ''}" ?\n\nLes groupes existants seront remplacés.`}
        confirmText="Générer"
        variant="warning"
        onConfirm={handleConfirmGenerate}
        onCancel={() => setShowConfirm(false)}
      />
    </>
  );
}
