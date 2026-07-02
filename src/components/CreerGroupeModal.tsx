// /src/components/classes/CreerGroupeModal.tsx
// Modal pour créer un groupe manuellement

import React, { useState } from 'react';
import { X, Plus } from 'lucide-react';
import { Portal } from '@/components/ui/Portal';
import { Input } from '@/components/ui/Input';

interface CreerGroupeModalProps {
  visible: boolean;
  onClose: () => void;
  onCreate: (nom: string, description?: string) => Promise<void>;
  isLoading?: boolean;
}

export default function CreerGroupeModal({
  visible,
  onClose,
  onCreate,
  isLoading = false,
}: CreerGroupeModalProps) {
  const [nom, setNom] = useState('');
  const [description, setDescription] = useState('');

  if (!visible) return null;

  const handleSubmit = async () => {
    if (!nom.trim()) return;
    await onCreate(nom.trim(), description.trim() || undefined);
    setNom('');
    setDescription('');
  };

  const handleClose = () => {
    setNom('');
    setDescription('');
    onClose();
  };

  return (
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
              <h3 className="text-lg font-semibold text-gray-800">Créer un groupe</h3>
              <p className="text-sm text-gray-500 mt-0.5">Ajoutez un nouveau groupe à la classe</p>
            </div>
            <button
              onClick={handleClose}
              className="p-1 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* Formulaire */}
          <div className="p-5">
            <label className="text-sm font-medium text-gray-700 block mb-1.5">
              Nom du groupe *
            </label>
            <Input
              value={nom}
              onChange={(e) => setNom(e.target.value)}
              placeholder="Ex: Groupe A, Atelier 1, Groupe de TP"
              className="mb-4"
            />

            <label className="text-sm font-medium text-gray-700 block mb-1.5">
              Description (optionnelle)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Description du groupe"
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-schoolnet-primary min-h-[80px]"
              rows={3}
            />
          </div>

          {/* Actions */}
          <div className="flex flex-row gap-3 px-5 py-4 border-t border-gray-200">
            <button
              onClick={handleClose}
              className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium text-gray-500 transition-colors"
            >
              Annuler
            </button>
            <button
              onClick={handleSubmit}
              disabled={!nom.trim() || isLoading}
              className={`
                flex-1 flex flex-row items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium text-white transition-colors
                ${!nom.trim() || isLoading
                  ? 'bg-gray-300 cursor-not-allowed'
                  : 'bg-schoolnet-primary hover:bg-schoolnet-primary/90'
                }
              `}
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  Créer le groupe
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </Portal>
  );
}
