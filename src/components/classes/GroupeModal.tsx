// /src/components/classes/GroupeModal.tsx
// Modal de création/modification de groupe

import React, { useState, useEffect } from 'react';
import { X, Save } from 'lucide-react';
import { Portal } from '@/components/ui/Portal';
import { Input } from '@/components/ui/Input';

interface GroupeModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (nom: string, description?: string) => Promise<void>;
  initialNom?: string;
  initialDescription?: string;
  title?: string;
}

export default function GroupeModal({
  visible,
  onClose,
  onSave,
  initialNom = '',
  initialDescription = '',
  title = 'Créer un groupe',
}: GroupeModalProps) {
  const [nom, setNom] = useState(initialNom);
  const [description, setDescription] = useState(initialDescription);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (visible) {
      setNom(initialNom);
      setDescription(initialDescription);
    }
  }, [visible, initialNom, initialDescription]);

  if (!visible) return null;

  const handleSave = async () => {
    if (!nom.trim()) return;
    setSaving(true);
    await onSave(nom.trim(), description.trim() || undefined);
    setSaving(false);
    onClose();
  };

  const handleClose = () => {
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
          <div className="flex flex-row justify-between items-center px-5 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
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
              placeholder="Ex: Groupe A, Atelier 1"
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
              onClick={handleSave}
              disabled={!nom.trim() || saving}
              className={`
                flex-1 flex flex-row items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium text-white transition-colors
                ${!nom.trim() || saving
                  ? 'bg-gray-300 cursor-not-allowed'
                  : 'bg-schoolnet-primary hover:bg-schoolnet-primary/90'
                }
              `}
            >
              {saving ? (
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
    </Portal>
  );
}
