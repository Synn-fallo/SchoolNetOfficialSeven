// /src/components/classes/ClasseForm.tsx
// Formulaire de création de classe

import React, { useState, useEffect } from 'react';
import { BookOpen, AlertCircle, Calendar } from 'lucide-react';
import { supabase } from '@/lib/supabase.web';
import { useAcademicStructure } from '@/hooks/useAcademicStructure';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import Selector from '@/components/common/Selector';
import SelectorModal from '@/components/common/SelectorModal';

interface ClasseFormProps {
  etablissementId: string;
  onSuccess: () => void;
  onCancel: () => void;
  initialData?: any;
}

// Options spéciales "Aucun"
const AUCUN_INDICE = { id: 'aucun', valeur: 'Aucun indice', type_indice: 'NONE', ordre: 0 };
const AUCUN_MODELE = { id: 'aucun', nom: 'Aucun groupe', valeurs: [], type_suffixe: 'NONE' };

export default function ClasseForm({ etablissementId, onSuccess, onCancel, initialData }: ClasseFormProps) {
  const {
    cycles,
    niveaux,
    series,
    options,
    indices,
    modelesGroupes,
    anneeScolaireActive,
    loading: structureLoading,
    getNiveauxByCycle,
    getOptionsBySerie,
  } = useAcademicStructure(etablissementId);

  const [selectedCycleId, setSelectedCycleId] = useState<string>(initialData?.cycle_id || '');
  const [selectedNiveauId, setSelectedNiveauId] = useState<string>(initialData?.niveau_id || '');
  const [selectedSerieId, setSelectedSerieId] = useState<string>(initialData?.serie_id || '');
  const [selectedOptionId, setSelectedOptionId] = useState<string>(initialData?.option_serie_id || '');
  const [selectedIndiceId, setSelectedIndiceId] = useState<string>(initialData?.indice_id || 'aucun');
  const [selectedModeleGroupeId, setSelectedModeleGroupeId] = useState<string>(initialData?.modele_groupe_id || 'aucun');
  const [capacite, setCapacite] = useState<string>(initialData?.capacite?.toString() || '');
  const [isManuel, setIsManuel] = useState<boolean>(initialData?.is_manuel || false);
  const [nomManuel, setNomManuel] = useState<string>(initialData?.nom_manuel || '');
  const [submitting, setSubmitting] = useState(false);

  // États pour les modals
  const [showCycleModal, setShowCycleModal] = useState(false);
  const [showNiveauModal, setShowNiveauModal] = useState(false);
  const [showSerieModal, setShowSerieModal] = useState(false);
  const [showOptionModal, setShowOptionModal] = useState(false);
  const [showIndiceModal, setShowIndiceModal] = useState(false);
  const [showModeleModal, setShowModeleModal] = useState(false);

  // Données filtrées
  const niveauxFiltres = selectedCycleId ? getNiveauxByCycle(selectedCycleId) : [];
  const optionsFiltrees = selectedSerieId ? getOptionsBySerie(selectedSerieId) : [];
  
  // Liste des indices avec option "Aucun"
  const indicesWithNone = [AUCUN_INDICE, ...indices];
  
  // Liste des modèles avec option "Aucun"
  const modelesWithNone = [AUCUN_MODELE, ...modelesGroupes];

  // Vérifier si une année scolaire est active
  useEffect(() => {
    if (!structureLoading && !anneeScolaireActive) {
      console.log('[ClasseForm] Aucune année scolaire active trouvée');
      window.alert(
        'Aucune année scolaire active n\'est définie pour cet établissement. Veuillez contacter l\'administrateur.'
      );
      onCancel();
    }
  }, [anneeScolaireActive, structureLoading]);

  // Génération du nom aperçu
  const getApercuNom = (): string => {
    if (isManuel) return nomManuel;
    
    const niveau = niveaux.find(n => n.id === selectedNiveauId);
    const serie = series.find(s => s.id === selectedSerieId);
    const option = options.find(o => o.id === selectedOptionId);
    const indice = indices.find(i => i.id === selectedIndiceId);
    
    let name = niveau?.nom || '';
    if (serie) name += ` ${serie.nom}`;
    if (option) name += ` ${option.code}`;
    if (indice && selectedIndiceId !== 'aucun') name += `/${indice.valeur}`;
    
    return name;
  };

  const apercuNom = getApercuNom();

  const handleSubmit = async () => {
    if (!anneeScolaireActive) {
      window.alert('Aucune année scolaire active. Impossible de créer une classe.');
      return;
    }

    if (isManuel && !nomManuel.trim()) {
      window.alert('Veuillez saisir un nom pour la classe');
      return;
    }

    if (!isManuel && !selectedNiveauId) {
      window.alert('Veuillez sélectionner un niveau');
      return;
    }

    setSubmitting(true);
    
    try {
      const niveau = niveaux.find(n => n.id === selectedNiveauId);
      const serie = series.find(s => s.id === selectedSerieId);
      const option = options.find(o => o.id === selectedOptionId);
      const indice = indices.find(i => i.id === selectedIndiceId);
      
      let nomComplet = '';
      let niveauText = '';
      
      if (isManuel) {
        nomComplet = nomManuel;
        niveauText = '';
      } else {
        niveauText = niveau?.nom || '';
        nomComplet = niveauText;
        if (serie) nomComplet += ` ${serie.nom}`;
        if (option) nomComplet += ` ${option.code}`;
        if (indice && selectedIndiceId !== 'aucun') nomComplet += `/${indice.valeur}`;
      }

      const classeData = {
        etablissement_id: etablissementId,
        annee_scolaire_id: anneeScolaireActive.id,
        nom: nomComplet,
        niveau: niveauText,
        capacite: capacite ? parseInt(capacite) : null,
        is_active: true,
        cycle_id: selectedCycleId || null,
        niveau_id: selectedNiveauId || null,
        serie_id: (selectedSerieId && selectedSerieId !== 'aucun') ? selectedSerieId : null,
        option_serie_id: (selectedOptionId && selectedOptionId !== 'aucun') ? selectedOptionId : null,
        indice_id: (selectedIndiceId && selectedIndiceId !== 'aucun') ? selectedIndiceId : null,
        modele_groupe_id: (selectedModeleGroupeId && selectedModeleGroupeId !== 'aucun') ? selectedModeleGroupeId : null,
        nom_generique: !isManuel ? nomComplet : null,
        is_manuel: isManuel
      };

      console.log('[ClasseForm] Envoi des données:', JSON.stringify(classeData, null, 2));

      const { data: result, error } = await supabase
        .from('classes')
        .insert(classeData)
        .select()
        .single();

      if (error) {
        console.error('[ClasseForm] Erreur Supabase:', error);
        throw new Error(error.message);
      }

      console.log('[ClasseForm] Classe créée avec succès:', result);

      // Si un modèle de groupe est sélectionné, créer les groupes
      if (selectedModeleGroupeId !== 'aucun' && selectedModeleGroupeId && !isManuel) {
        const modele = modelesGroupes.find(m => m.id === selectedModeleGroupeId);
        if (modele && modele.valeurs && modele.valeurs.length > 0) {
          const groupesData = modele.valeurs.map((valeur: string, index: number) => ({
            classe_id: result.id,
            nom: valeur,
            modele_groupe_id: selectedModeleGroupeId,
            ordre: index + 1
          }));
          
          const { error: groupesError } = await supabase
            .from('groupes_eleves')
            .insert(groupesData);
          
          if (groupesError) {
            console.error('[ClasseForm] Erreur création groupes:', groupesError);
          } else {
            console.log('[ClasseForm] Groupes créés avec succès');
          }
        }
      }

      window.alert(`La classe "${nomComplet}" a été créée avec succès`);
      onSuccess();
      
    } catch (error: any) {
      console.error('[ClasseForm] Erreur:', error);
      window.alert(error.message || 'Impossible de créer la classe');
    } finally {
      setSubmitting(false);
    }
  };

  const isLoading = structureLoading || submitting;

  // Affichage si pas d'année scolaire active
  if (!anneeScolaireActive && !structureLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <Calendar className="w-12 h-12 text-amber-500" />
        <h3 className="text-lg font-semibold text-gray-700 mt-4">Année scolaire non définie</h3>
        <p className="text-sm text-gray-500 mt-2 max-w-md">
          Aucune année scolaire active n'est configurée pour cet établissement.
        </p>
        <button
          onClick={onCancel}
          className="mt-4 bg-schoolnet-primary text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-schoolnet-primary/90 transition-colors"
        >
          Retour
        </button>
      </div>
    );
  }

  if (isLoading && !cycles.length) {
    return (
      <div className="flex flex-col items-center justify-center p-8">
        <div className="w-8 h-8 border-4 border-schoolnet-primary border-t-transparent rounded-full animate-spin" />
        <p className="mt-3 text-sm text-gray-500">Chargement des options...</p>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-gray-50">
      <div className="p-4 pb-8 max-w-2xl mx-auto">
        {/* Année scolaire active */}
        {anneeScolaireActive && (
          <div className="flex flex-row items-center gap-2 bg-emerald-50 px-3 py-2 rounded-lg mb-4 border border-emerald-200">
            <Calendar className="w-3.5 h-3.5 text-emerald-600" />
            <span className="text-xs font-medium text-emerald-700">
              Année scolaire active : {anneeScolaireActive?.libelle}
            </span>
          </div>
        )}

        <Card className="p-5">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Création d'une classe</h2>
          
          {/* Mode de création */}
          <div className="flex flex-row bg-gray-100 rounded-lg p-1 mb-4">
            <button
              onClick={() => setIsManuel(false)}
              className={`flex-1 flex flex-row items-center justify-center gap-2 py-2.5 rounded-md text-sm font-medium transition-colors ${
                !isManuel ? 'bg-schoolnet-primary text-white' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              Mode structuré
            </button>
            <button
              onClick={() => setIsManuel(true)}
              className={`flex-1 flex flex-row items-center justify-center gap-2 py-2.5 rounded-md text-sm font-medium transition-colors ${
                isManuel ? 'bg-schoolnet-primary text-white' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <AlertCircle className="w-4 h-4" />
              Mode manuel
            </button>
          </div>

          {!isManuel ? (
            // Mode structuré
            <>
              <Selector
                label="Cycle"
                value={cycles.find(c => c.id === selectedCycleId)?.nom || ''}
                onPress={() => setShowCycleModal(true)}
                placeholder="Sélectionner un cycle"
                required
              />

              {selectedCycleId && (
                <Selector
                  label="Niveau"
                  value={niveaux.find(n => n.id === selectedNiveauId)?.nom || ''}
                  onPress={() => setShowNiveauModal(true)}
                  placeholder="Sélectionner un niveau"
                  required
                />
              )}

              {selectedCycleId && cycles.find(c => c.id === selectedCycleId)?.nom === '2nd Cycle' && (
                <>
                  <Selector
                    label="Série"
                    value={series.find(s => s.id === selectedSerieId)?.nom || ''}
                    onPress={() => setShowSerieModal(true)}
                    placeholder="Sélectionner une série"
                  />

                  {selectedSerieId && (
                    <Selector
                      label="Option"
                      value={options.find(o => o.id === selectedOptionId)?.code || ''}
                      onPress={() => setShowOptionModal(true)}
                      placeholder="Sélectionner une option"
                    />
                  )}
                </>
              )}

              <Selector
                label="Indice"
                value={indicesWithNone.find(i => i.id === selectedIndiceId)?.valeur || ''}
                onPress={() => setShowIndiceModal(true)}
                placeholder="Aucun indice"
              />

              <Selector
                label="Modèle de groupes"
                value={modelesWithNone.find(m => m.id === selectedModeleGroupeId)?.nom || ''}
                onPress={() => setShowModeleModal(true)}
                placeholder="Aucun groupe"
              />

              {apercuNom && (
                <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                  <p className="text-xs text-gray-500">Aperçu du nom :</p>
                  <p className="text-sm font-semibold text-blue-700">{apercuNom}</p>
                </div>
              )}
            </>
          ) : (
            // Mode manuel
            <>
              <label className="text-sm font-medium text-gray-700 block mb-1.5">
                Nom de la classe *
              </label>
              <Input
                value={nomManuel}
                onChange={(e) => setNomManuel(e.target.value)}
                placeholder="Ex: 6ème M1, Classe spéciale"
                className="mb-3"
              />
              <p className="text-xs text-gray-400 -mt-2 mb-3">
                Utilisez ce mode pour les cas particuliers non prévus dans les listes.
              </p>
            </>
          )}

          {/* Capacité */}
          <label className="text-sm font-medium text-gray-700 block mb-1.5 mt-2">
            Capacité (optionnel)
          </label>
          <Input
            type="number"
            min={1}
            value={capacite}
            onChange={(e) => setCapacite(e.target.value)}
            placeholder="Nombre d'élèves"
            className="mb-4"
          />

          {/* Actions */}
          <div className="flex flex-row gap-3 mt-2">
            <button
              onClick={onCancel}
              className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium text-gray-500 transition-colors"
            >
              Annuler
            </button>
            <button
              onClick={handleSubmit}
              disabled={(!isManuel && !selectedNiveauId) || submitting}
              className={`flex-1 py-3 rounded-lg text-sm font-medium text-white transition-colors ${
                (!isManuel && !selectedNiveauId) || submitting
                  ? 'bg-gray-300 cursor-not-allowed'
                  : 'bg-schoolnet-primary hover:bg-schoolnet-primary/90'
              }`}
            >
              {submitting ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto" />
              ) : (
                'Créer la classe'
              )}
            </button>
          </div>
        </Card>

        {/* Modals avec composants communs */}
        <SelectorModal
          visible={showCycleModal}
          onClose={() => setShowCycleModal(false)}
          title="Sélectionner un cycle"
          items={cycles}
          selectedId={selectedCycleId}
          onSelect={(id) => {
            setSelectedCycleId(id);
            setSelectedNiveauId('');
            setSelectedSerieId('');
            setSelectedOptionId('');
          }}
          getItemLabel={(item) => item.nom}
        />

        <SelectorModal
          visible={showNiveauModal}
          onClose={() => setShowNiveauModal(false)}
          title="Sélectionner un niveau"
          items={niveauxFiltres}
          selectedId={selectedNiveauId}
          onSelect={setSelectedNiveauId}
          getItemLabel={(item) => item.nom}
        />

        <SelectorModal
          visible={showSerieModal}
          onClose={() => setShowSerieModal(false)}
          title="Sélectionner une série"
          items={series}
          selectedId={selectedSerieId}
          onSelect={(id) => {
            setSelectedSerieId(id);
            setSelectedOptionId('');
          }}
          getItemLabel={(item) => item.nom}
          getItemSubLabel={(item) => item.code ? `Code: ${item.code}` : ''}
        />

        <SelectorModal
          visible={showOptionModal}
          onClose={() => setShowOptionModal(false)}
          title="Sélectionner une option"
          items={optionsFiltrees}
          selectedId={selectedOptionId}
          onSelect={setSelectedOptionId}
          getItemLabel={(item) => `${item.code} - ${item.nom}`}
        />

        <SelectorModal
          visible={showIndiceModal}
          onClose={() => setShowIndiceModal(false)}
          title="Sélectionner un indice"
          items={indicesWithNone}
          selectedId={selectedIndiceId}
          onSelect={setSelectedIndiceId}
          getItemLabel={(item) => item.valeur}
          getItemSubLabel={(item) => item.type_indice === 'ALPHA' ? 'Lettre' : item.type_indice === 'NUMERIC' ? 'Chiffre' : ''}
        />

        <SelectorModal
          visible={showModeleModal}
          onClose={() => setShowModeleModal(false)}
          title="Sélectionner un modèle de groupes"
          items={modelesWithNone}
          selectedId={selectedModeleGroupeId}
          onSelect={setSelectedModeleGroupeId}
          getItemLabel={(item) => item.nom}
          getItemSubLabel={(item) => item.valeurs && item.valeurs.length > 0 ? `Groupes: ${item.valeurs.join(', ')}` : ''}
        />
      </div>
    </div>
  );
}
