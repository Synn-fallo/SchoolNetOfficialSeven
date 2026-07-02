// /src/components/classes/GestionElevesPersonnels.tsx
// Gestion des élèves d'une classe personnelle

import React, { useState } from 'react';
import { Plus, Trash2, Edit2, X, Save } from 'lucide-react';
import { supabase } from '@/lib/supabase.web';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Portal } from '@/components/ui/Portal';

interface Eleve {
  nom: string;
  prenom: string;
  matricule?: string;
}

interface GestionElevesPersonnelsProps {
  classeId: string;
  eleves: Eleve[];
  onRefresh: () => void;
}

export default function GestionElevesPersonnels({ 
  classeId, 
  eleves, 
  onRefresh 
}: GestionElevesPersonnelsProps) {
  const [modalVisible, setModalVisible] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [formData, setFormData] = useState({ nom: '', prenom: '', matricule: '' });

  const handleSave = async () => {
    if (!formData.nom.trim() || !formData.prenom.trim()) {
      window.alert('Le nom et le prénom sont requis');
      return;
    }

    const newEleves = [...eleves];
    if (editingIndex !== null) {
      newEleves[editingIndex] = {
        nom: formData.nom.trim(),
        prenom: formData.prenom.trim(),
        matricule: formData.matricule.trim() || undefined
      };
    } else {
      newEleves.push({
        nom: formData.nom.trim(),
        prenom: formData.prenom.trim(),
        matricule: formData.matricule.trim() || undefined
      });
    }

    try {
      const { error } = await supabase
        .from('classes_personnelles')
        .update({ eleves: newEleves })
        .eq('id', classeId);

      if (error) throw error;
      onRefresh();
      setModalVisible(false);
      resetForm();
    } catch (error) {
      console.error('Error saving students:', error);
      window.alert('Impossible de sauvegarder');
    }
  };

  const handleDelete = (index: number) => {
    if (!window.confirm(`Supprimer ${eleves[index].prenom} ${eleves[index].nom} ?`)) return;
    
    const deleteEleve = async () => {
      const newEleves = eleves.filter((_, i) => i !== index);
      const { error } = await supabase
        .from('classes_personnelles')
        .update({ eleves: newEleves })
        .eq('id', classeId);
      if (error) throw error;
      onRefresh();
    };
    
    deleteEleve().catch((error) => {
      console.error('Error deleting student:', error);
      window.alert('Impossible de supprimer');
    });
  };

  const handleEdit = (index: number) => {
    setEditingIndex(index);
    setFormData({
      nom: eleves[index].nom,
      prenom: eleves[index].prenom,
      matricule: eleves[index].matricule || ''
    });
    setModalVisible(true);
  };

  const resetForm = () => {
    setEditingIndex(null);
    setFormData({ nom: '', prenom: '', matricule: '' });
  };

  return (
    <Card className="p-4">
      <div className="flex flex-row justify-between items-center mb-4">
        <h3 className="text-base font-semibold text-gray-800">Gestion des élèves</h3>
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

      {eleves.length === 0 ? (
        <p className="text-sm text-gray-400 text-center py-5">
          Aucun élève. Cliquez sur "Ajouter" pour commencer.
        </p>
      ) : (
        <div className="flex flex-col gap-1">
          {eleves.map((item, index) => (
            <div
              key={index}
              className="flex flex-row justify-between items-center py-2.5 border-b border-gray-100 last:border-0"
            >
              <div>
                <p className="text-sm font-medium text-gray-700">
                  {item.prenom} {item.nom}
                </p>
                {item.matricule && (
                  <p className="text-xs text-gray-400">Matricule: {item.matricule}</p>
                )}
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
                  {editingIndex !== null ? 'Modifier' : 'Ajouter'} un élève
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
                  Nom *
                </label>
                <Input
                  value={formData.nom}
                  onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                  placeholder="Nom"
                  className="mb-3"
                />

                <label className="text-sm font-medium text-gray-700 block mb-1.5">
                  Prénom *
                </label>
                <Input
                  value={formData.prenom}
                  onChange={(e) => setFormData({ ...formData, prenom: e.target.value })}
                  placeholder="Prénom"
                  className="mb-3"
                />

                <label className="text-sm font-medium text-gray-700 block mb-1.5">
                  Matricule (optionnel)
                </label>
                <Input
                  value={formData.matricule}
                  onChange={(e) => setFormData({ ...formData, matricule: e.target.value })}
                  placeholder="Matricule"
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
