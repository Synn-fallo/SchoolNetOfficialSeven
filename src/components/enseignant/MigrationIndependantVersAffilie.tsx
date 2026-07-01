// /src/components/enseignant/MigrationIndependantVersAffilie.tsx
// Migration d'indépendant vers affilié

import React, { useState, useEffect } from 'react';
import { Building2, BookOpen, ArrowRight, CheckCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase.web';
import { Card } from '@/components/ui/Card';
import CorrespondanceEleves from './CorrespondanceEleves';
import SelectionEvaluations from './SelectionEvaluations';
import RapportMigration from './RapportMigration';

interface ClassePersonnelle {
  id: string;
  nom: string;
  description: string | null;
  matieres: any[];
  eleves: any[];
}

interface ClasseOfficielle {
  id: string;
  nom: string;
  niveau: string;
}

interface MatiereOfficielle {
  id: string;
  nom: string;
  coefficient: number;
}

interface MigrationIndependantVersAffilieProps {
  onComplete?: () => void;
}

export default function MigrationIndependantVersAffilie({ onComplete }: MigrationIndependantVersAffilieProps) {
  const { user } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [classesPersonnelles, setClassesPersonnelles] = useState<ClassePersonnelle[]>([]);
  const [classesOfficielles, setClassesOfficielles] = useState<ClasseOfficielle[]>([]);
  const [matieresOfficielles, setMatieresOfficielles] = useState<MatiereOfficielle[]>([]);
  
  const [selectedClassePersonnelle, setSelectedClassePersonnelle] = useState<string | null>(null);
  const [selectedClasseOfficielle, setSelectedClasseOfficielle] = useState<string | null>(null);
  const [selectedMatiereOfficielle, setSelectedMatiereOfficielle] = useState<string | null>(null);
  
  const [correspondanceClasseExistante, setCorrespondanceClasseExistante] = useState<any>(null);
  const [correspondanceElevesValidee, setCorrespondanceElevesValidee] = useState(false);
  
  const [selectedEvaluations, setSelectedEvaluations] = useState<string[]>([]);
  const [transfertEnCours, setTransfertEnCours] = useState(false);
  const [rapport, setRapport] = useState<any>(null);
  const [etape, setEtape] = useState<'selection' | 'correspondance_eleves' | 'selection_evaluations' | 'transfert' | 'rapport'>('selection');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    if (!user) return;
    setLoading(true);
    
    try {
      const { data: classesPerso, error: err1 } = await supabase
        .from('classes_personnelles')
        .select('*')
        .eq('enseignant_id', user.id);
      
      if (err1) throw err1;
      setClassesPersonnelles(classesPerso || []);
      
      const { data: enseignantEtab, error: err2 } = await supabase
        .from('enseignant_etablissements')
        .select('etablissement_id')
        .eq('enseignant_id', user.id)
        .eq('is_active', true)
        .maybeSingle();
      
      if (err2) throw err2;
      
      if (enseignantEtab?.etablissement_id) {
        const { data: classesOff, error: err3 } = await supabase
          .from('classes')
          .select('id, nom, niveau')
          .eq('etablissement_id', enseignantEtab.etablissement_id)
          .eq('is_active', true);
        
        if (err3) throw err3;
        setClassesOfficielles(classesOff || []);
        
        const { data: matieresOff, error: err4 } = await supabase
          .from('matieres')
          .select('id, nom, coefficient')
          .eq('etablissement_id', enseignantEtab.etablissement_id);
        
        if (err4) throw err4;
        setMatieresOfficielles(matieresOff || []);
      }
    } catch (error) {
      console.error('Error loading data:', error);
      window.alert('Impossible de charger les données');
    } finally {
      setLoading(false);
    }
  };

  const handleClassePersonnelleChange = async (classeId: string) => {
    setSelectedClassePersonnelle(classeId);
    setSelectedClasseOfficielle(null);
    setCorrespondanceClasseExistante(null);
    setCorrespondanceElevesValidee(false);
    
    const { data } = await supabase
      .from('correspondance_classes')
      .select('*')
      .eq('classe_personnelle_id', classeId)
      .eq('statut', 'active')
      .maybeSingle();
    
    if (data) {
      setCorrespondanceClasseExistante(data);
      setSelectedClasseOfficielle(data.classe_officielle_id);
    }
  };

  const handleValiderClasse = async () => {
    if (!selectedClassePersonnelle || !selectedClasseOfficielle) {
      window.alert('Veuillez sélectionner une classe personnelle et une classe officielle');
      return;
    }
    
    try {
      if (correspondanceClasseExistante) {
        await supabase
          .from('correspondance_classes')
          .update({ classe_officielle_id: selectedClasseOfficielle, updated_at: new Date().toISOString() })
          .eq('id', correspondanceClasseExistante.id);
      } else {
        await supabase
          .from('correspondance_classes')
          .insert({
            classe_personnelle_id: selectedClassePersonnelle,
            classe_officielle_id: selectedClasseOfficielle,
            enseignant_id: user?.id,
            statut: 'active'
          });
      }
      
      window.alert('Correspondance de classe enregistrée');
      setEtape('correspondance_eleves');
    } catch (error) {
      console.error('Error saving class correspondence:', error);
      window.alert('Impossible d\'enregistrer la correspondance');
    }
  };

  const handleCorrespondanceElevesComplete = () => {
    setCorrespondanceElevesValidee(true);
    setEtape('selection_evaluations');
  };

  const handleTransfertComplete = (rapportData: any) => {
    setRapport(rapportData);
    setEtape('rapport');
    if (onComplete) onComplete();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-schoolnet-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="mt-3 text-sm text-gray-500">Chargement de vos données...</p>
        </div>
      </div>
    );
  }

  if (classesPersonnelles.length === 0) {
    return (
      <div className="flex items-center justify-center p-8">
        <Card className="p-8 text-center max-w-md">
          <h3 className="text-lg font-semibold text-gray-700 mb-2">Aucune classe personnelle</h3>
          <p className="text-sm text-gray-500">Vous n'avez pas encore créé de classe personnelle.</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-gray-50">
      <div className="p-4 pb-8 max-w-2xl mx-auto">
        {/* En-tête */}
        <div className="mb-5">
          <h2 className="text-2xl font-bold text-gray-800">Migration vers l'établissement</h2>
          <p className="text-sm text-gray-500">
            Transférez vos données personnelles vers votre établissement abonné
          </p>
        </div>

        {/* Étape 1 : Sélection */}
        {etape === 'selection' && (
          <Card className="p-4 mb-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">📚 Étape 1 : Choisissez votre classe</h3>
            
            <p className="text-sm font-medium text-gray-700 mb-2">Classe personnelle (source) :</p>
            {classesPersonnelles.map(classe => (
              <button
                key={classe.id}
                onClick={() => handleClassePersonnelleChange(classe.id)}
                className={`w-full flex flex-row items-center gap-3 p-3 rounded-lg mb-2 transition-colors ${
                  selectedClassePersonnelle === classe.id
                    ? 'bg-schoolnet-primary text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <Building2 className="w-5 h-5" />
                <span className="text-sm font-medium">{classe.nom}</span>
              </button>
            ))}
            
            <p className="text-sm font-medium text-gray-700 mt-4 mb-2">Classe officielle (destination) :</p>
            {classesOfficielles.map(classe => (
              <button
                key={classe.id}
                onClick={() => setSelectedClasseOfficielle(classe.id)}
                className={`w-full flex flex-row items-center gap-3 p-3 rounded-lg mb-2 transition-colors ${
                  selectedClasseOfficielle === classe.id
                    ? 'bg-schoolnet-primary text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <Building2 className="w-5 h-5" />
                <span className="text-sm font-medium">{classe.nom} ({classe.niveau})</span>
              </button>
            ))}
            
            <p className="text-sm font-medium text-gray-700 mt-4 mb-2">Matière officielle :</p>
            {matieresOfficielles.map(matiere => (
              <button
                key={matiere.id}
                onClick={() => setSelectedMatiereOfficielle(matiere.id)}
                className={`w-full flex flex-row items-center gap-3 p-3 rounded-lg mb-2 transition-colors ${
                  selectedMatiereOfficielle === matiere.id
                    ? 'bg-schoolnet-primary text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <BookOpen className="w-5 h-5" />
                <span className="text-sm font-medium">{matiere.nom} (coef {matiere.coefficient})</span>
              </button>
            ))}
            
            <button
              onClick={handleValiderClasse}
              disabled={!selectedClassePersonnelle || !selectedClasseOfficielle || !selectedMatiereOfficielle}
              className={`w-full flex flex-row items-center justify-center gap-2 py-3.5 rounded-lg text-sm font-semibold text-white mt-4 transition-colors ${
                !selectedClassePersonnelle || !selectedClasseOfficielle || !selectedMatiereOfficielle
                  ? 'bg-gray-300 cursor-not-allowed'
                  : 'bg-schoolnet-primary hover:bg-schoolnet-primary/90'
              }`}
            >
              <ArrowRight className="w-4 h-4" />
              Continuer
            </button>
          </Card>
        )}

        {/* Étape 2 : Correspondance des élèves */}
        {etape === 'correspondance_eleves' && selectedClassePersonnelle && (
          <CorrespondanceEleves
            classePersonnelleId={selectedClassePersonnelle}
            classeOfficielleId={selectedClasseOfficielle!}
            onComplete={handleCorrespondanceElevesComplete}
          />
        )}

        {/* Étape 3 : Sélection des évaluations */}
        {etape === 'selection_evaluations' && selectedClassePersonnelle && selectedMatiereOfficielle && (
          <SelectionEvaluations
            classePersonnelleId={selectedClassePersonnelle}
            classeOfficielleId={selectedClasseOfficielle!}
            matiereOfficielleId={selectedMatiereOfficielle}
            onTransfertComplete={handleTransfertComplete}
            setTransfertEnCours={setTransfertEnCours}
          />
        )}

        {/* Étape 4 : Rapport */}
        {etape === 'rapport' && rapport && (
          <RapportMigration rapport={rapport} onClose={() => setEtape('selection')} />
        )}

        {/* Indicateur de progression */}
        {transfertEnCours && (
          <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center">
            <div className="bg-white rounded-2xl p-8 text-center">
              <div className="w-12 h-12 border-4 border-schoolnet-primary border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="mt-4 text-lg font-medium text-gray-700">Transfert en cours...</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
