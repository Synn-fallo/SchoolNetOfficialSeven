// /src/components/classes/ClassePersonnelleForm.tsx
// Formulaire de création/modification de classe personnelle

import React, { useState } from 'react';
import { X, Save, Building2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase.web';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Portal } from '@/components/ui/Portal';
import EtablissementSearchModal from '@/components/etablissement/EtablissementSearchModal';

interface ClassePersonnelleFormProps {
  onSuccess: () => void;
  onCancel: () => void;
  initialData?: {
    id?: string;
    nom: string;
    description: string;
    etablissement_nom?: string;
    etablissement_id?: string | null;
  };
}

export default function ClassePersonnelleForm({ 
  onSuccess, 
  onCancel, 
  initialData 
}: ClassePersonnelleFormProps) {
  const { user } = useAuth();
  const [nom, setNom] = useState(initialData?.nom || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [etablissementNom, setEtablissementNom] = useState(initialData?.etablissement_nom || '');
  const [etablissementId, setEtablissementId] = useState(initialData?.etablissement_id || null);
  const [loading, setLoading] = useState(false);
  const [showSearchModal, setShowSearchModal] = useState(false);

  const isEditing = !!initialData?.id;

  const handleSelectEtablissement = (etablissement: { id: string; nom: string; ville?: string | null }) => {
    setEtablissementNom(etablissement.nom);
    setEtablissementId(etablissement.id);
  };

  const handleSubmit = async () => {
    if (!nom.trim()) {
      window.alert('Le nom de la classe est requis');
      return;
    }

    if (!user) {
      window.alert('Utilisateur non connecté');
      return;
    }

    setLoading(true);

    try {
      const dataToSave: any = {
        nom: nom.trim(),
        description: description.trim() || null,
        updated_at: new Date().toISOString(),
      };

      if (etablissementId) {
        dataToSave.etablissement_id = etablissementId;
        dataToSave.etablissement_nom = etablissementNom;
      } else if (etablissementNom.trim()) {
        dataToSave.etablissement_nom = etablissementNom.trim();
        dataToSave.etablissement_id = null;
      }

      if (isEditing) {
        const { error } = await supabase
          .from('classes_personnelles')
          .update(dataToSave)
          .eq('id', initialData.id)
          .eq('enseignant_id', user.id);

        if (error) throw error;
        window.alert('Classe modifiée avec succès');
      } else {
        const { error } = await supabase
          .from('classes_personnelles')
          .insert({
            enseignant_id: user.id,
            nom: nom.trim(),
            description: description.trim() || null,
            matieres: [],
            eleves: [],
            etablissement_nom: etablissementNom.trim() || null,
            etablissement_id: etablissementId || null,
          });

        if (error) throw error;
        window.alert('Classe créée avec succès');
      }

      onSuccess();
    } catch (error) {
      console.error('Error saving class:', error);
      window.alert('Impossible de sauvegarder la classe');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-hidden">
          {/* En-tête */}
          <div className="flex flex-row justify-between items-center px-5 py-4 border-b border-gray-200">
            <h3 className="text-xl font-semibold text-gray-800">
              {isEditing ? 'Modifier la classe' : 'Nouvelle classe personnelle'}
            </h3>
            <button
              onClick={onCancel}
              className="p-1 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* Corps */}
          <div className="p-5 overflow-y-auto max-h-[calc(90vh-80px)]">
            {/* Nom */}
            <div className="mb-4">
              <label className="text-sm font-medium text-gray-700 block mb-1.5">
                Nom de la classe *
              </label>
              <Input
                value={nom}
                onChange={(e) => setNom(e.target.value)}
                placeholder="Ex: Tle D, 3ème A, Classe de soutien..."
              />
            </div>

            {/* Établissement */}
            <div className="mb-4">
              <label className="text-sm font-medium text-gray-700 block mb-1.5">
                Établissement
              </label>
              <button
                onClick={() => setShowSearchModal(true)}
                className="w-full flex flex-row items-center gap-2 border border-gray-200 rounded-lg px-3 py-2.5 text-sm hover:bg-gray-50 transition-colors"
              >
                <Building2 className="w-4 h-4 text-schoolnet-primary" />
                <span className={etablissementNom ? 'text-gray-800' : 'text-gray-400'}>
                  {etablissementNom || 'Rechercher un établissement'}
                </span>
              </button>
              {etablissementNom && (
                <button
                  onClick={() => { setEtablissementNom(''); setEtablissementId(null); }}
                  className="text-xs text-red-500 hover:underline mt-1"
                >
                  Effacer
                </button>
              )}
            </div>

            {/* Description */}
            <div className="mb-4">
              <label className="text-sm font-medium text-gray-700 block mb-1.5">
                Description (optionnelle)
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Description de la classe..."
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-schoolnet-primary min-h-[80px]"
                rows={3}
              />
            </div>

            {/* Actions */}
            <div className="flex flex-row justify-end gap-3 mt-4">
              <button
                onClick={onCancel}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium text-gray-500 transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={handleSubmit}
                disabled={loading}
                className={`flex flex-row items-center gap-2 px-5 py-2 rounded-lg text-sm font-medium text-white transition-colors ${
                  loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-schoolnet-primary hover:bg-schoolnet-primary/90'
                }`}
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    {isEditing ? 'Enregistrer' : 'Créer'}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de recherche d'établissement */}
      <EtablissementSearchModal
        visible={showSearchModal}
        onClose={() => setShowSearchModal(false)}
        onSelect={handleSelectEtablissement}
      />
    </>
  );
}
