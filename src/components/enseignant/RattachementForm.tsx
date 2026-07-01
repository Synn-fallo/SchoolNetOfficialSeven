// /src/components/enseignant/RattachementForm.tsx
// Formulaire de rattachement d'un enseignant

import React, { useState, useEffect } from 'react';
import { Users, BookOpen, Save, X } from 'lucide-react';
import { supabase } from '@/lib/supabase.web';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

interface RattachementFormProps {
  enseignantId: string;
  etablissementId: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

interface Classe {
  id: string;
  nom: string;
  niveau: string;
}

interface Matiere {
  id: string;
  nom: string;
  code: string;
}

export default function RattachementForm({ enseignantId, etablissementId, onSuccess, onCancel }: RattachementFormProps) {
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [classes, setClasses] = useState<Classe[]>([]);
  const [matieres, setMatieres] = useState<Matiere[]>([]);
  const [existingClasses, setExistingClasses] = useState<string[]>([]);
  const [existingMatieres, setExistingMatieres] = useState<string[]>([]);
  
  const [selectedClasses, setSelectedClasses] = useState<string[]>([]);
  const [selectedMatieres, setSelectedMatieres] = useState<string[]>([]);
  const [selectedRole, setSelectedRole] = useState<'responsable' | 'intervenant'>('intervenant');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoadingData(true);
      
      const { data: classesData } = await supabase
        .from('classes')
        .select('id, nom, niveau')
        .eq('etablissement_id', etablissementId)
        .eq('is_active', true)
        .order('nom');
      
      setClasses(classesData || []);
      
      const { data: matieresData } = await supabase
        .from('matieres')
        .select('id, nom, code')
        .eq('etablissement_id', etablissementId)
        .order('nom');
      
      setMatieres(matieresData || []);
      
      const { data: existingClassesData } = await supabase
        .from('enseignant_classes')
        .select('classe_id')
        .eq('enseignant_id', enseignantId);
      
      setExistingClasses(existingClassesData?.map(c => c.classe_id) || []);
      setSelectedClasses(existingClassesData?.map(c => c.classe_id) || []);
      
      const { data: existingMatieresData } = await supabase
        .from('enseignant_matieres')
        .select('matiere_id')
        .eq('enseignant_id', enseignantId);
      
      setExistingMatieres(existingMatieresData?.map(m => m.matiere_id) || []);
      setSelectedMatieres(existingMatieresData?.map(m => m.matiere_id) || []);
      
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoadingData(false);
    }
  };

  const toggleClasse = (classeId: string) => {
    setSelectedClasses(prev =>
      prev.includes(classeId)
        ? prev.filter(id => id !== classeId)
        : [...prev, classeId]
    );
  };

  const toggleMatiere = (matiereId: string) => {
    setSelectedMatieres(prev =>
      prev.includes(matiereId)
        ? prev.filter(id => id !== matiereId)
        : [...prev, matiereId]
    );
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const toAdd = selectedClasses.filter(id => !existingClasses.includes(id));
      const toRemove = existingClasses.filter(id => !selectedClasses.includes(id));
      
      if (toAdd.length > 0) {
        await supabase
          .from('enseignant_classes')
          .insert(toAdd.map(classeId => ({
            enseignant_id: enseignantId,
            classe_id: classeId,
            role: selectedRole,
          })));
      }
      
      if (toRemove.length > 0) {
        await supabase
          .from('enseignant_classes')
          .delete()
          .eq('enseignant_id', enseignantId)
          .in('classe_id', toRemove);
      }
      
      const toAddMat = selectedMatieres.filter(id => !existingMatieres.includes(id));
      const toRemoveMat = existingMatieres.filter(id => !selectedMatieres.includes(id));
      
      if (toAddMat.length > 0) {
        await supabase
          .from('enseignant_matieres')
          .insert(toAddMat.map(matiereId => ({
            enseignant_id: enseignantId,
            matiere_id: matiereId,
          })));
      }
      
      if (toRemoveMat.length > 0) {
        await supabase
          .from('enseignant_matieres')
          .delete()
          .eq('enseignant_id', enseignantId)
          .in('matiere_id', toRemoveMat);
      }
      
      window.alert('Rattachements mis à jour avec succès');
      if (onSuccess) onSuccess();
      
    } catch (error) {
      console.error('Error saving rattachements:', error);
      window.alert('Impossible de sauvegarder les modifications');
    } finally {
      setLoading(false);
    }
  };

  if (loadingData) {
    return (
      <Card className="p-8 text-center">
        <div className="w-8 h-8 border-4 border-schoolnet-primary border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-sm text-gray-500 mt-3">Chargement...</p>
      </Card>
    );
  }

  return (
    <div className="flex-1 bg-gray-50">
      <div className="p-4 pb-8 max-w-2xl mx-auto">
        {/* En-tête */}
        <div className="text-center mb-5">
          <Users className="w-7 h-7 text-schoolnet-primary mx-auto" />
          <h2 className="text-xl font-bold text-gray-800 mt-3 mb-1">Rattachements</h2>
          <p className="text-sm text-gray-500">Affectez l'enseignant aux classes et matières</p>
        </div>

        {/* Rôle */}
        <Card className="p-4 mb-4">
          <div className="flex flex-row items-center justify-between">
            <span className="text-sm font-medium text-gray-600">Rôle dans les classes:</span>
            <div className="flex flex-row gap-2">
              <button
                onClick={() => setSelectedRole('responsable')}
                className={`px-4 py-2 rounded-lg text-sm transition-colors ${
                  selectedRole === 'responsable'
                    ? 'bg-schoolnet-primary text-white'
                    : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                }`}
              >
                Responsable
              </button>
              <button
                onClick={() => setSelectedRole('intervenant')}
                className={`px-4 py-2 rounded-lg text-sm transition-colors ${
                  selectedRole === 'intervenant'
                    ? 'bg-schoolnet-primary text-white'
                    : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                }`}
              >
                Intervenant
              </button>
            </div>
          </div>
        </Card>

        {/* Classes */}
        <Card className="p-4 mb-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Classes</h3>
          <div className="flex flex-row flex-wrap gap-2">
            {classes.map((classe) => (
              <button
                key={classe.id}
                onClick={() => toggleClasse(classe.id)}
                className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
                  selectedClasses.includes(classe.id)
                    ? 'bg-schoolnet-primary text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {classe.nom}
              </button>
            ))}
          </div>
        </Card>

        {/* Matières */}
        <Card className="p-4 mb-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Matières</h3>
          <div className="flex flex-row flex-wrap gap-2">
            {matieres.map((matiere) => (
              <button
                key={matiere.id}
                onClick={() => toggleMatiere(matiere.id)}
                className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
                  selectedMatieres.includes(matiere.id)
                    ? 'bg-schoolnet-primary text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {matiere.nom}
              </button>
            ))}
          </div>
        </Card>

        {/* Boutons */}
        <div className="flex flex-row gap-3 mt-2">
          {onCancel && (
            <button
              onClick={onCancel}
              className="flex-1 flex flex-row items-center justify-center gap-1.5 py-3 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium text-gray-500 transition-colors"
            >
              <X className="w-4 h-4" />
              Annuler
            </button>
          )}
          <button
            onClick={handleSubmit}
            disabled={loading}
            className={`flex-1 flex flex-row items-center justify-center gap-1.5 py-3 rounded-lg text-sm font-medium text-white transition-colors ${
              loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-emerald-500 hover:bg-emerald-600'
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
  );
}
