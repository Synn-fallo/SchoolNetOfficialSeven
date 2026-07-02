// /src/components/classes/RattachementAssistant.tsx
// Assistant de rattachement d'une classe personnelle

import React, { useState, useEffect } from 'react';
import { X, Check, ArrowRight, Building2, Users, Search } from 'lucide-react';
import { supabase } from '@/lib/supabase.web';
import { useAuth } from '@/contexts/AuthContext';
import { useTransferNotesToOfficielle } from '@/hooks/useTransferNotesToOfficielle';
import { Portal } from '@/components/ui/Portal';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';

interface RattachementAssistantProps {
  visible: boolean;
  classePersonnelleId: string;
  classePersonnelleNom: string;
  elevesPersonnels: Array<{ nom: string; prenom: string; matricule?: string }>;
  onClose: () => void;
  onSuccess: () => void;
}

interface ClasseOfficielle {
  id: string;
  nom: string;
  niveau: string;
  effectif: number;
  etablissement_nom: string;
}

interface EleveOfficiel {
  id: string;
  nom: string;
  prenom: string;
  matricule?: string;
}

interface Correspondance {
  elevePersonnelIndex: number;
  eleveOfficielId: string | null;
  eleveOfficielNom: string;
  eleveOfficielPrenom: string;
}

export default function RattachementAssistant({
  visible,
  classePersonnelleId,
  classePersonnelleNom,
  elevesPersonnels,
  onClose,
  onSuccess
}: RattachementAssistantProps) {
  const { user } = useAuth();
  const { transfererNotes, loading: transferLoading } = useTransferNotesToOfficielle();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [classesOfficielles, setClassesOfficielles] = useState<ClasseOfficielle[]>([]);
  const [selectedClasseOfficielleId, setSelectedClasseOfficielleId] = useState<string | null>(null);
  const [selectedClasseOfficielleNom, setSelectedClasseOfficielleNom] = useState<string>('');
  const [elevesOfficiels, setElevesOfficiels] = useState<EleveOfficiel[]>([]);
  const [correspondances, setCorrespondances] = useState<Correspondance[]>([]);
  const [showEleveSelector, setShowEleveSelector] = useState(false);
  const [currentSelectionIndex, setCurrentSelectionIndex] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [loadingClasses, setLoadingClasses] = useState(true);

  if (!visible) return null;

  // Étape 1 : Charger les classes officielles de l'enseignant
  useEffect(() => {
    if (visible && step === 1) {
      loadClassesOfficielles();
    }
  }, [visible, step]);

  // Étape 2 : Charger les élèves de la classe officielle sélectionnée
  useEffect(() => {
    if (step === 2 && selectedClasseOfficielleId) {
      loadElevesOfficiels();
      initCorrespondances();
    }
  }, [step, selectedClasseOfficielleId]);

  const loadClassesOfficielles = async () => {
    setLoadingClasses(true);
    try {
      const { data, error } = await supabase
        .from('enseignant_classes')
        .select(`
          classe_id,
          classes!inner(
            id, nom, niveau,
            etablissements!inner(nom)
          )
        `)
        .eq('enseignant_id', user?.id)
        .eq('est_actif', true);

      if (error) throw error;

      const formatted = (data || []).map((item: any) => ({
        id: item.classes.id,
        nom: item.classes.nom,
        niveau: item.classes.niveau || 'Non spécifié',
        etablissement_nom: item.classes.etablissements.nom,
        effectif: 0
      }));

      setClassesOfficielles(formatted);
    } catch (error) {
      console.error('Error loading official classes:', error);
      window.alert('Impossible de charger les classes officielles');
    } finally {
      setLoadingClasses(false);
    }
  };

  const loadElevesOfficiels = async () => {
    if (!selectedClasseOfficielleId) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('eleves')
        .select('id, nom, prenom, matricule')
        .eq('classe_id', selectedClasseOfficielleId)
        .order('nom', { ascending: true });

      if (error) throw error;
      setElevesOfficiels(data || []);
    } catch (error) {
      console.error('Error loading official students:', error);
      window.alert('Impossible de charger les élèves de la classe');
    } finally {
      setLoading(false);
    }
  };

  const initCorrespondances = () => {
    const corresp = elevesPersonnels.map((eleve, index) => {
      const match = elevesOfficiels.find(e => 
        e.nom.toLowerCase() === eleve.nom.toLowerCase() && 
        e.prenom.toLowerCase() === eleve.prenom.toLowerCase()
      );
      
      return {
        elevePersonnelIndex: index,
        eleveOfficielId: match?.id || null,
        eleveOfficielNom: match?.nom || '',
        eleveOfficielPrenom: match?.prenom || '',
      };
    });
    setCorrespondances(corresp);
  };

  const openEleveSelector = (index: number) => {
    setCurrentSelectionIndex(index);
    setSearchQuery('');
    setShowEleveSelector(true);
  };

  const selectEleveOfficiel = (eleve: EleveOfficiel) => {
    if (currentSelectionIndex !== null) {
      const nouvelles = [...correspondances];
      nouvelles[currentSelectionIndex] = {
        ...nouvelles[currentSelectionIndex],
        eleveOfficielId: eleve.id,
        eleveOfficielNom: eleve.nom,
        eleveOfficielPrenom: eleve.prenom
      };
      setCorrespondances(nouvelles);
    }
    setShowEleveSelector(false);
    setCurrentSelectionIndex(null);
  };

  const handleSelectionClasse = (classeId: string, classeNom: string) => {
    setSelectedClasseOfficielleId(classeId);
    setSelectedClasseOfficielleNom(classeNom);
    setStep(2);
  };

  const handleTransfert = async () => {
    const nonAssocies = correspondances.filter(c => !c.eleveOfficielId);
    if (nonAssocies.length > 0) {
      if (!window.confirm(
        `${nonAssocies.length} élève(s) non associé(s). Ignorer et continuer ?`
      )) {
        return;
      }
    }
    executerTransfert();
  };

  const executerTransfert = async () => {
    setLoading(true);
    try {
      const mapping = correspondances
        .filter(c => c.eleveOfficielId)
        .map(c => ({
          elevePersonnel: elevesPersonnels[c.elevePersonnelIndex],
          eleveOfficielId: c.eleveOfficielId!
        }));

      const success = await transfererNotes(
        classePersonnelleId,
        selectedClasseOfficielleId!,
        mapping
      );

      if (success) {
        const { error: updateError } = await supabase
          .from('classes_personnelles')
          .update({ rattachee_a: selectedClasseOfficielleId })
          .eq('id', classePersonnelleId);

        if (updateError) throw updateError;

        window.alert(`La classe "${classePersonnelleNom}" a été rattachée avec succès.`);
        onSuccess();
        onClose();
      } else {
        window.alert('Le transfert des notes a échoué');
      }
    } catch (error) {
      console.error('Error during transfer:', error);
      window.alert('Une erreur est survenue lors du rattachement');
    } finally {
      setLoading(false);
    }
  };

  const filteredElevesOfficiels = elevesOfficiels.filter(eleve =>
    `${eleve.prenom} ${eleve.nom}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
    eleve.matricule?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderStep1 = () => (
    <div>
      <h3 className="text-lg font-semibold text-gray-800 mb-2">Choisir la classe officielle cible</h3>
      <p className="text-sm text-gray-500 mb-4">
        Sélectionnez la classe officielle vers laquelle vous souhaitez rattacher "{classePersonnelleNom}".
      </p>

      {loadingClasses ? (
        <div className="flex flex-col items-center justify-center py-8">
          <div className="w-8 h-8 border-4 border-schoolnet-primary border-t-transparent rounded-full animate-spin" />
          <p className="mt-3 text-sm text-gray-500">Chargement...</p>
        </div>
      ) : classesOfficielles.length === 0 ? (
        <p className="text-sm text-gray-400 text-center py-4">Aucune classe officielle trouvée</p>
      ) : (
        classesOfficielles.map((classe) => (
          <button
            key={classe.id}
            onClick={() => handleSelectionClasse(classe.id, classe.nom)}
            className="w-full flex flex-row items-center gap-3 p-4 bg-white rounded-xl border border-gray-200 mb-2 hover:shadow-md transition-shadow"
          >
            <Building2 className="w-5 h-5 text-schoolnet-primary flex-shrink-0" />
            <div className="flex-1 text-left">
              <p className="text-sm font-semibold text-gray-800">{classe.nom}</p>
              <p className="text-xs text-gray-500">{classe.niveau} • {classe.etablissement_nom}</p>
            </div>
            <ArrowRight className="w-4 h-4 text-gray-400" />
          </button>
        ))
      )}
    </div>
  );

  const renderStep2 = () => (
    <div>
      <h3 className="text-lg font-semibold text-gray-800 mb-2">Associer les élèves</h3>
      <p className="text-sm text-gray-500 mb-4">
        Associez chaque élève de votre classe personnelle à un élève de la classe officielle "{selectedClasseOfficielleNom}".
      </p>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-8">
          <div className="w-8 h-8 border-4 border-schoolnet-primary border-t-transparent rounded-full animate-spin" />
          <p className="mt-3 text-sm text-gray-500">Chargement...</p>
        </div>
      ) : (
        <>
          {correspondances.map((corresp, idx) => {
            const eleve = elevesPersonnels[corresp.elevePersonnelIndex];
            const estAssocie = !!corresp.eleveOfficielId;
            
            return (
              <button
                key={idx}
                onClick={() => openEleveSelector(idx)}
                className={`w-full flex flex-row items-center gap-3 p-3 rounded-xl border mb-2 transition-colors ${
                  estAssocie ? 'border-emerald-200 bg-emerald-50' : 'border-gray-200 hover:bg-gray-50'
                }`}
              >
                <div className="flex-1 text-left">
                  <p className="text-sm font-medium text-gray-800">{eleve.prenom} {eleve.nom}</p>
                  {eleve.matricule && (
                    <p className="text-xs text-gray-400">{eleve.matricule}</p>
                  )}
                </div>
                <ArrowRight className="w-4 h-4 text-gray-400" />
                <div className="flex-1 text-right">
                  {estAssocie ? (
                    <span className="text-sm font-medium text-emerald-600">
                      {corresp.eleveOfficielPrenom} {corresp.eleveOfficielNom}
                    </span>
                  ) : (
                    <span className="text-sm text-gray-400">Sélectionner un élève</span>
                  )}
                </div>
              </button>
            );
          })}

          <button
            onClick={handleTransfert}
            disabled={transferLoading || loading}
            className={`w-full flex flex-row items-center justify-center gap-2 py-3.5 rounded-xl text-sm font-semibold text-white transition-colors mt-4 ${
              transferLoading || loading
                ? 'bg-gray-300 cursor-not-allowed'
                : 'bg-schoolnet-primary hover:bg-schoolnet-primary/90'
            }`}
          >
            {transferLoading || loading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <Check className="w-4 h-4" />
                Confirmer le rattachement
              </>
            )}
          </button>
        </>
      )}
    </div>
  );

  return (
    <Portal>
      <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
          {/* En-tête */}
          <div className="flex flex-row justify-between items-center px-5 py-4 border-b border-gray-200">
            <h3 className="text-xl font-bold text-gray-800">Rattacher à l'établissement</h3>
            <button
              onClick={onClose}
              className="p-1 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* Progression */}
          <div className="flex flex-row items-center justify-center gap-4 px-5 py-4 border-b border-gray-200 bg-gray-50">
            <div className="flex flex-col items-center">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-sm font-semibold ${
                step >= 1 ? 'bg-schoolnet-primary text-white' : 'bg-gray-200 text-gray-500'
              }`}>
                1
              </div>
              <span className="text-xs text-gray-500 mt-1">Classe cible</span>
            </div>
            <div className={`w-12 h-0.5 ${step >= 2 ? 'bg-schoolnet-primary' : 'bg-gray-200'}`} />
            <div className="flex flex-col items-center">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-sm font-semibold ${
                step >= 2 ? 'bg-schoolnet-primary text-white' : 'bg-gray-200 text-gray-500'
              }`}>
                2
              </div>
              <span className="text-xs text-gray-500 mt-1">Associations</span>
            </div>
          </div>

          {/* Contenu */}
          <div className="p-5 overflow-y-auto max-h-[60vh]">
            {step === 1 && renderStep1()}
            {step === 2 && renderStep2()}
          </div>
        </div>
      </div>

      {/* Modal de sélection d'élève */}
      {showEleveSelector && (
        <Portal>
          <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl w-full max-w-sm max-h-[80vh] overflow-hidden">
              <div className="flex flex-row justify-between items-center px-5 py-4 border-b border-gray-200">
                <h4 className="text-lg font-semibold text-gray-800">Choisir un élève</h4>
                <button
                  onClick={() => setShowEleveSelector(false)}
                  className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              <div className="flex flex-row items-center gap-2 mx-4 mt-3 px-3 py-2 bg-gray-50 rounded-lg border border-gray-200">
                <Search className="w-4 h-4 text-gray-400" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Rechercher un élève..."
                  className="border-0 bg-transparent p-0 text-sm focus:ring-0"
                />
              </div>

              <div className="p-2 overflow-y-auto max-h-[50vh]">
                {filteredElevesOfficiels.length === 0 ? (
                  <p className="text-sm text-gray-400 text-center py-4">Aucun élève trouvé</p>
                ) : (
                  filteredElevesOfficiels.map((eleve) => (
                    <button
                      key={eleve.id}
                      onClick={() => selectEleveOfficiel(eleve)}
                      className="w-full text-left px-3 py-3 border-b border-gray-100 hover:bg-gray-50 transition-colors"
                    >
                      <p className="text-sm font-medium text-gray-800">{eleve.prenom} {eleve.nom}</p>
                      {eleve.matricule && (
                        <p className="text-xs text-gray-400">{eleve.matricule}</p>
                      )}
                    </button>
                  ))
                )}
              </div>
            </div>
          </div>
        </Portal>
      )}
    </Portal>
  );
}
