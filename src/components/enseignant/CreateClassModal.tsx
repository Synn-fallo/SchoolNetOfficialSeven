// /src/components/enseignant/CreateClassModal.tsx
// Modal de création d'une classe

import React, { useState } from 'react';
import { X, Building2, BookOpen } from 'lucide-react';
import { useTeacherCahier } from '@/hooks/useTeacherCahier';
import { Portal } from '@/components/ui/Portal';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

interface CreateClassModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
  etablissements: { id: string; etablissement_nom: string }[];
}

const NIVEAUX = ['6ème', '5ème', '4ème', '3ème', '2nde', '1ère', 'Tle', 'Autre'];

export default function CreateClassModal({
  visible,
  onClose,
  onSuccess,
  etablissements,
}: CreateClassModalProps) {
  const { createClasse, loading } = useTeacherCahier();
  const [nom, setNom] = useState('');
  const [niveau, setNiveau] = useState('');
  const [selectedEtablissementId, setSelectedEtablissementId] = useState<string | null>(null);
  const [isPersonnel, setIsPersonnel] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  if (!visible) return null;

  const handleSubmit = async () => {
    if (!nom.trim()) {
      window.alert('Veuillez saisir un nom pour la classe');
      return;
    }

    if (!niveau) {
      window.alert('Veuillez sélectionner un niveau');
      return;
    }

    setSubmitting(true);
    const result = await createClasse(
      nom.trim(),
      niveau,
      !isPersonnel && selectedEtablissementId ? selectedEtablissementId : undefined
    );
    setSubmitting(false);

    if (result.success) {
      window.alert('Classe créée avec succès');
      setNom('');
      setNiveau('');
      setSelectedEtablissementId(null);
      setIsPersonnel(true);
      onSuccess();
    } else {
      window.alert(result.error || 'Impossible de créer la classe');
    }
  };

  const handleClose = () => {
    setNom('');
    setNiveau('');
    setSelectedEtablissementId(null);
    setIsPersonnel(true);
    onClose();
  };

  return (
    <Portal>
      <div 
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
        onClick={handleClose}
      >
        <div 
          className="bg-white rounded-2xl w-full max-w-md max-h-[90vh] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* En-tête */}
          <div className="flex flex-row justify-between items-center px-4 py-3.5 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-800">Nouvelle classe</h2>
            <button
              onClick={handleClose}
              className="p-1 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* Corps */}
          <div className="p-4 overflow-y-auto max-h-[calc(90vh-130px)]">
            {/* Nom */}
            <label className="text-sm font-medium text-gray-700 block mb-1.5">
              Nom de la classe *
            </label>
            <Input
              value={nom}
              onChange={(e) => setNom(e.target.value)}
              placeholder="Ex: Cours du soir - 3ème"
              className="mb-4"
            />

            {/* Niveau */}
            <label className="text-sm font-medium text-gray-700 block mb-1.5">
              Niveau *
            </label>
            <div className="flex flex-row flex-wrap gap-2 mb-4">
              {NIVEAUX.map((n) => (
                <button
                  key={n}
                  onClick={() => setNiveau(n)}
                  className={`
                    px-3.5 py-2 rounded-full text-sm transition-colors
                    ${niveau === n 
                      ? 'bg-schoolnet-primary text-white' 
                      : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                    }
                  `}
                >
                  {n}
                </button>
              ))}
            </div>

            {/* Type de classe */}
            <label className="text-sm font-medium text-gray-700 block mb-1.5">
              Type de classe
            </label>
            <div className="flex flex-row gap-3 mb-4">
              <button
                onClick={() => setIsPersonnel(true)}
                className={`
                  flex-1 flex flex-row items-center justify-center gap-2 py-2.5 rounded-lg transition-colors
                  ${isPersonnel 
                    ? 'bg-schoolnet-primary text-white' 
                    : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                  }
                `}
              >
                <BookOpen className="w-4 h-4" />
                <span className="text-sm font-medium">Personnel</span>
              </button>
              <button
                onClick={() => setIsPersonnel(false)}
                className={`
                  flex-1 flex flex-row items-center justify-center gap-2 py-2.5 rounded-lg transition-colors
                  ${!isPersonnel 
                    ? 'bg-schoolnet-primary text-white' 
                    : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                  }
                `}
              >
                <Building2 className="w-4 h-4" />
                <span className="text-sm font-medium">Rattacher</span>
              </button>
            </div>

            {/* Établissement (si rattachement) */}
            {!isPersonnel && etablissements.length > 0 && (
              <>
                <label className="text-sm font-medium text-gray-700 block mb-1.5">
                  Établissement *
                </label>
                <div className="flex flex-col gap-2 mb-4">
                  {etablissements.map((etab) => (
                    <button
                      key={etab.id}
                      onClick={() => setSelectedEtablissementId(etab.id)}
                      className={`
                        flex flex-row items-center gap-2 px-3.5 py-2.5 rounded-lg text-sm transition-colors
                        ${selectedEtablissementId === etab.id
                          ? 'bg-schoolnet-primary text-white'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }
                      `}
                    >
                      <Building2 className="w-4 h-4" />
                      {etab.etablissement_nom}
                    </button>
                  ))}
                </div>
              </>
            )}

            {!isPersonnel && etablissements.length === 0 && (
              <div className="bg-blue-50 rounded-lg p-3 mb-4">
                <p className="text-xs text-blue-700 text-center">
                  ℹ️ Vous n'êtes rattaché à aucun établissement. La classe sera créée comme classe personnelle.
                </p>
              </div>
            )}

            {/* Boutons */}
            <div className="flex flex-row gap-3 mt-2">
              <button
                onClick={handleClose}
                className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium text-gray-500 transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={handleSubmit}
                disabled={!nom || !niveau || submitting}
                className={`
                  flex-1 py-2.5 rounded-lg text-sm font-medium text-white transition-colors
                  ${(!nom || !niveau || submitting)
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-schoolnet-primary hover:bg-schoolnet-primary/90'
                  }
                `}
              >
                {submitting ? 'Création...' : 'Créer'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </Portal>
  );
}
