// /src/components/classes/GestionMatieresPersonnelles.tsx
// Gestion des matières d'une classe personnelle

import React, { useState } from 'react';
import { Plus, Trash2, Edit2, X, Save } from 'lucide-react';
import { supabase } from '@/lib/supabase.web';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Portal } from '@/components/ui/Portal';

interface Matiere {
  nom: string;
  coefficient: number;
}

interface GestionMatieresPersonnellesProps {
  classeId: string;
  matieres: Matiere[];
  onRefresh: () => void;
}

export default function GestionMatieresPersonnelles({ 
  classeId, 
  matieres, 
  onRefresh 
}: GestionMatieresPersonnellesProps) {
  const [modalVisible, setModalVisible] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [formData, setFormData] = useState({ nom: '', coefficient: '1' });

  const handleSave = async () => {
    if (!formData.nom.trim()) {
      window.alert('Le nom de la matière est requis');
      return;
    }

    const coeff = parseInt(formData.coefficient, 10);
    if (isNaN(coeff) || coeff < 1) {
      window.alert('Le coefficient doit être un nombre supérieur à 0');
      return;
    }

    const newMatieres = [...matieres];
    if (editingIndex !== null) {
      newMatieres[editingIndex] = { nom: formData.nom.trim(), coefficient: coeff };
    } else {
      newMatieres.push({ nom: formData.nom.trim(), coefficient: coeff });
    }

    try {
      const { error } = await supabase
        .from('classes_personnelles')
        .update({ matieres: newMatieres })
        .eq('id', classeId);

      if (error) throw error;
      onRefresh();
      setModalVisible(false);
      resetForm();
    } catch (error) {
      console.error('Error saving subjects:', error);
      window.alert('Impossible de sauvegarder');
    }
  };

  const handleDelete = (index: number) => {
    if (!window.confirm(`Supprimer "${matieres[index].nom}" ?`)) return;
    
    const deleteMatiere = async () => {
      const newMatieres = matieres.filter((_, i) => i !== index);
      const { error } = await supabase
        .from('classes_personnelles')
        .update({ matieres: newMatieres })
        .eq('id', classeId);
      if (error) throw error;
      onRefresh();
    };
    
    deleteMatiere().catch((error) => {
      console.error('Error deleting subject:', error);
      window.alert('Impossible de supprimer');
    });
  };

  const handleEdit = (index: number) => {
    setEditingIndex(index);
    setFormData({
      nom: matieres[index].nom,
      coefficient: matieres[index].coefficient.toString()
    });
    setModalVisible(true);
  };

  const resetForm = () => {
    setEditingIndex(null);
    setFormData({ nom: '', coefficient: '1' });
  };

  return (
    <Card className="p-4">
      <div className="flex flex-row justify-between items-center mb-4">
        <h3 className="text-base font-semibold text-gray-800">Gestion des matières</h3>
        <button
          onClick={() => {
            resetForm();
            setModalVisible(true);
          }}
          className="flex flex-row items-center gap-1.5 bg-schoolnet-primary text-white px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-schoolnet-primary/90 transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          Ajouter
        </button>
      </div>

      {matieres.length === 0 ? (
        <p className="text-sm text-gray-400 text-center py-5">
          Aucune matière. Cliquez sur "Ajouter" pour commencer.
        </p>
      ) : (
        <div className="flex flex-col gap-1">
          {matieres.map((item, index) => (
            <div
              key={index}
              className="flex flex-row justify-between items-center py-2.5 border-b border-gray-100 last:border-0"
            >
              <div>
                <p className="text-sm font-medium text-gray-700">{item.nom}</p>
                <p className="text-xs text-gray-400">Coefficient: {item.coefficient}</p>
              </div>
              <div className="flex flex-row gap-3">
                <button
                  onClick={() => handleEdit(index)}
                  className="p-1 hover:bg-amber-50 rounded-md transition-colors"
                >
                  <Edit2 className="w-4 h-4 text-amber-500" />
                </button>
                <button
                  onClick={() => handleDelete(index)}
                  className="p-1 hover:bg-red-50 rounded-md transition-colors"
                >
                  <Trash2 className="w-4 h-4 text-red-500" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal d'ajout/modification */}
      {modalVisible && (
        <Portal>
          <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden">
              <div className="flex flex-row justify-between items-center px-5 py-4 border-b border-gray-200">
                <h4 className="text-lg font-semibold text-gray-800">
                  {editingIndex !== null ? 'Modifier' : 'Ajouter'} une matière
                </h4>
                <button
                  onClick={() => setModalVisible(false)}
                  className="p-1 hover:bg-gray-100 rounded-full"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              <div className="p-5">
                <label className="text-sm font-medium text-gray-700 block mb-1.5">
                  Nom de la matière *
                </label>
                <Input
                  value={formData.nom}
                  onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                  placeholder="Nom de la matière"
                  className="mb-3"
                />

                <label className="text-sm font-medium text-gray-700 block mb-1.5">
                  Coefficient *
                </label>
                <Input
                  type="number"
                  min={1}
                  value={formData.coefficient}
                  onChange={(e) => setFormData({ ...formData, coefficient: e.target.value })}
                  placeholder="1"
                  className="mb-4"
                />

                <div className="flex flex-row justify-end gap-3">
                  <button
                    onClick={() => setModalVisible(false)}
                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium text-gray-500 transition-colors"
                  >
                    Annuler
                  </button>
                  <button
                    onClick={handleSave}
                    className="flex flex-row items-center gap-2 px-4 py-2 bg-schoolnet-primary hover:bg-schoolnet-primary/90 rounded-lg text-sm font-medium text-white transition-colors"
                  >
                    <Save className="w-4 h-4" />
                    Enregistrer
                  </button>
                </div>
              </div>
            </div>
          </div>
        </Portal>
      )}
    </Card>
  );
}
