// /src/components/enseignant/MesClassesView.tsx
// Vue principale des classes de l'enseignant

import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, Users, BookOpen, Plus, Search, ChevronDown, X, Save } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useActiveEtablissement } from '@/hooks/useActiveEtablissement';
import { useClassesPersonnelles } from '@/hooks/useClassesPersonnelles';
import { supabase } from '@/lib/supabase.web';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Portal } from '@/components/ui/Portal';
import ClassePersonnelleCard from './ClassePersonnelleCard';
import ClassCard from './ClassCard';
import ClasseDetailModal from './ClasseDetailModal';
import ElevesListModal from './ElevesListModal';

// Composants externes (à importer depuis leurs emplacements)
// Note: Ces composants seront créés dans les phases suivantes
// Pour l'instant, on les importe depuis les chemins attendus
import ClassePersonnelleForm from '@/components/classes/ClassePersonnelleForm';
import GestionElevesPersonnels from '@/components/classes/GestionElevesPersonnels';
import GestionMatieresPersonnelles from '@/components/classes/GestionMatieresPersonnelles';
import ClassePersonnelleDetailModal from '@/components/classes/ClassePersonnelleDetailModal';
import EtablissementSearchModal from '@/components/etablissement/EtablissementSearchModal';

const STORAGE_KEY = '@MesClasses_last_tab';

interface ClasseOfficielle {
  id: string;
  nom: string;
  niveau: string;
  effectif: number;
  etablissement_id: string;
  etablissement_nom: string;
  enseignant_principal_nom?: string;
  matieres?: Array<{ id: string; nom: string; coefficient: number }>;
}

interface ClassePersonnelle {
  id: string;
  enseignant_id: string;
  nom: string;
  description: string | null;
  matieres: any[];
  eleves: any[];
  rattachee_a: string | null;
  etablissement_nom: string | null;
  etablissement_id: string | null;
  created_at: string;
  updated_at: string;
}

const NIVEAUX_DISPONIBLES = ['tous', '6ème', '5ème', '4ème', '3ème', 'Seconde', 'Première', 'Terminale', 'Autre'];

export default function MesClassesView() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { activeEtablissement } = useActiveEtablissement();
  const { classes: classesPersonnelles, loading: loadingPersonnelles, createClasse, deleteClasse, updateClasse, refresh: refreshPersonnelles } = useClassesPersonnelles();
  
  const [classesOfficielles, setClassesOfficielles] = useState<ClasseOfficielle[]>([]);
  const [loadingOfficielles, setLoadingOfficielles] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedNiveau, setSelectedNiveau] = useState<string>('tous');
  const [activeTab, setActiveTab] = useState<'officielles' | 'personnelles'>('officielles');
  const [showPersonnelleForm, setShowPersonnelleForm] = useState(false);
  const [showNiveauFilter, setShowNiveauFilter] = useState(false);
  
  // Modals
  const [selectedClasseOfficielle, setSelectedClasseOfficielle] = useState<ClasseOfficielle | null>(null);
  const [showClasseDetail, setShowClasseDetail] = useState(false);
  const [selectedClassePersonnelle, setSelectedClassePersonnelle] = useState<ClassePersonnelle | null>(null);
  const [showClassePersonnelleDetail, setShowClassePersonnelleDetail] = useState(false);
  const [showElevesList, setShowElevesList] = useState(false);
  const [currentEleves, setCurrentEleves] = useState<any[]>([]);
  const [currentClasseNom, setCurrentClasseNom] = useState('');
  const [currentClasseId, setCurrentClasseId] = useState('');
  const [currentClasseType, setCurrentClasseType] = useState<'officielle' | 'personnelle'>('officielle');
  const [showGestionEleves, setShowGestionEleves] = useState(false);
  
  // États pour la gestion des matières
  const [showGestionMatieres, setShowGestionMatieres] = useState(false);
  const [currentClasseMatieres, setCurrentClasseMatieres] = useState<any[]>([]);
  
  // États pour la modification de la classe personnelle
  const [currentClasseForEdit, setCurrentClasseForEdit] = useState<ClassePersonnelle | null>(null);
  const [showEditClasseModal, setShowEditClasseModal] = useState(false);
  const [editClasseNom, setEditClasseNom] = useState('');
  const [editClasseDescription, setEditClasseDescription] = useState('');
  const [editEtablissementNom, setEditEtablissementNom] = useState('');
  const [editEtablissementId, setEditEtablissementId] = useState<string | null>(null);
  const [showEditEtablissementSearch, setShowEditEtablissementSearch] = useState(false);

  const aUnEtablissement = !!activeEtablissement;
  const peutAccederOfficielles = aUnEtablissement;

  // Charger le dernier onglet sauvegardé
  useEffect(() => {
    const savedTab = localStorage.getItem(STORAGE_KEY);
    if (savedTab === 'officielles' || savedTab === 'personnelles') {
      setActiveTab(savedTab);
    }
  }, []);

  const handleTabChange = (tab: 'officielles' | 'personnelles') => {
    setActiveTab(tab);
    localStorage.setItem(STORAGE_KEY, tab);
  };

  // Charger les classes officielles
  const loadClassesOfficielles = useCallback(async () => {
    if (!user || !peutAccederOfficielles) {
      setClassesOfficielles([]);
      setLoadingOfficielles(false);
      return;
    }

    setLoadingOfficielles(true);
    try {
      const { data: enseignantClasses, error: ecError } = await supabase
        .from('enseignant_classes')
        .select(`
          classe_id,
          classes!inner(
            id,
            nom,
            niveau,
            etablissement_id,
            enseignant_principal_id,
            etablissements!inner(id, nom)
          )
        `)
        .eq('enseignant_id', user.id)
        .eq('est_actif', true);

      if (ecError) throw ecError;

      if (!enseignantClasses || enseignantClasses.length === 0) {
        setClassesOfficielles([]);
        setLoadingOfficielles(false);
        return;
      }

      const classesWithData = await Promise.all(
        enseignantClasses.map(async (item: any) => {
          const classe = item.classes;
          
          const { count, error: countError } = await supabase
            .from('eleves')
            .select('*', { count: 'exact', head: true })
            .eq('classe_id', classe.id);

          const { data: matieres, error: matieresError } = await supabase
            .from('matieres')
            .select('id, nom, coefficient')
            .eq('etablissement_id', classe.etablissement_id);

          let principalNom = '';
          if (classe.enseignant_principal_id) {
            const { data: prof } = await supabase
              .from('profiles')
              .select('nom, prenom')
              .eq('id', classe.enseignant_principal_id)
              .single();
            if (prof) {
              principalNom = `${prof.prenom} ${prof.nom}`;
            }
          }

          return {
            id: classe.id,
            nom: classe.nom,
            niveau: classe.niveau || 'Non spécifié',
            effectif: countError ? 0 : (count || 0),
            etablissement_id: classe.etablissement_id,
            etablissement_nom: classe.etablissements?.nom || 'Établissement',
            enseignant_principal_nom: principalNom || undefined,
            matieres: matieresError ? [] : matieres
          };
        })
      );

      setClassesOfficielles(classesWithData);
    } catch (error) {
      console.error('Error loading official classes:', error);
    } finally {
      setLoadingOfficielles(false);
    }
  }, [user, peutAccederOfficielles]);

  useEffect(() => {
    loadClassesOfficielles();
  }, [loadClassesOfficielles]);

  const handleRefresh = useCallback(async () => {
    await Promise.all([loadClassesOfficielles(), refreshPersonnelles()]);
  }, [loadClassesOfficielles, refreshPersonnelles]);

  const handleCliqueOfficielle = (classe: ClasseOfficielle) => {
    setSelectedClasseOfficielle(classe);
    setShowClasseDetail(true);
  };

  const handleCliquePersonnelle = (classe: ClassePersonnelle) => {
    setSelectedClassePersonnelle(classe);
    setShowClassePersonnelleDetail(true);
  };

  const handleVoirEleves = async (classeId: string, classeNom: string, type: 'officielle' | 'personnelle') => {
    setCurrentClasseNom(classeNom);
    setCurrentClasseId(classeId);
    setCurrentClasseType(type);
    
    if (type === 'officielle') {
      const { data: eleves, error } = await supabase
        .from('eleves')
        .select('id, nom, prenom, matricule')
        .eq('classe_id', classeId)
        .order('nom', { ascending: true });
      
      if (!error && eleves) {
        setCurrentEleves(eleves);
        setShowElevesList(true);
      }
    } else if (type === 'personnelle') {
      const classe = classesPersonnelles.find(c => c.id === classeId);
      if (classe?.eleves) {
        setCurrentEleves(classe.eleves);
        setShowElevesList(true);
      }
    }
  };

  const handleGererElevesPersonnelle = () => {
    setShowClassePersonnelleDetail(false);
    setShowGestionEleves(true);
  };

  const handleGestionElevesSuccess = () => {
    setShowGestionEleves(false);
    refreshPersonnelles();
    setSelectedClassePersonnelle(null);
  };

  const handleCreatePersonnelleSuccess = () => {
    setShowPersonnelleForm(false);
    refreshPersonnelles();
  };

  const handleGererMatieres = (classe: ClassePersonnelle) => {
    setCurrentClasseId(classe.id);
    setCurrentClasseMatieres(classe.matieres || []);
    setShowGestionMatieres(true);
  };

  const handleGestionMatieresSuccess = () => {
    setShowGestionMatieres(false);
    refreshPersonnelles();
  };

  const handleEditClasse = (classe: ClassePersonnelle) => {
    setCurrentClasseForEdit(classe);
    setEditClasseNom(classe.nom);
    setEditClasseDescription(classe.description || '');
    setEditEtablissementNom(classe.etablissement_nom || '');
    setEditEtablissementId(classe.etablissement_id || null);
    setShowEditClasseModal(true);
  };

  const handleSaveEditClasse = async () => {
    if (!editClasseNom.trim()) {
      window.alert('Le nom de la classe est requis');
      return;
    }

    const updateData: any = {
      nom: editClasseNom.trim(),
      description: editClasseDescription.trim() || null,
    };

    if (editEtablissementId) {
      updateData.etablissement_id = editEtablissementId;
      updateData.etablissement_nom = editEtablissementNom;
    } else if (editEtablissementNom.trim()) {
      updateData.etablissement_nom = editEtablissementNom.trim();
      updateData.etablissement_id = null;
    }

    const success = await updateClasse(currentClasseForEdit!.id, updateData);

    if (success) {
      window.alert('Classe modifiée avec succès');
      setShowEditClasseModal(false);
      setCurrentClasseForEdit(null);
      refreshPersonnelles();
    } else {
      window.alert('Impossible de modifier la classe');
    }
  };

  const filteredOfficielles = classesOfficielles.filter(classe => {
    const matchNom = classe.nom.toLowerCase().includes(searchQuery.toLowerCase());
    const matchNiveau = selectedNiveau === 'tous' || classe.niveau === selectedNiveau;
    return matchNom && matchNiveau;
  });

  const filteredPersonnelles = classesPersonnelles.filter(classe =>
    classe.nom.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const isLoading = (loadingOfficielles && peutAccederOfficielles) || loadingPersonnelles;

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50 p-5">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-schoolnet-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="mt-3 text-sm text-gray-500">Chargement de vos classes...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="flex-1 bg-gray-50">
        <div className="p-4 pb-8 max-w-4xl mx-auto">
          {/* En-tête */}
          <div className="mb-4">
            <h1 className="text-2xl font-bold text-gray-800 mb-1">Mes classes</h1>
            <p className="text-sm text-gray-500">Gérez vos classes et suivez vos élèves</p>
          </div>

          {/* Barre de recherche */}
          <div className="flex flex-row items-center gap-2 bg-white rounded-lg px-3 py-2.5 mb-3 border border-gray-200">
            <Search className="w-4 h-4 text-gray-400" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher une classe..."
              className="border-0 bg-transparent p-0 text-sm focus:ring-0 flex-1"
            />
            <button
              onClick={() => setShowNiveauFilter(!showNiveauFilter)}
              className="text-gray-400 hover:text-gray-600"
            >
              <ChevronDown className="w-4 h-4" />
            </button>
          </div>

          {/* Filtre par niveau */}
          {showNiveauFilter && peutAccederOfficielles && (
            <div className="flex flex-row flex-wrap gap-2 mb-3">
              {NIVEAUX_DISPONIBLES.map((niveau) => (
                <button
                  key={niveau}
                  onClick={() => setSelectedNiveau(niveau)}
                  className={`
                    px-3 py-1.5 rounded-full text-xs font-medium transition-colors
                    ${selectedNiveau === niveau
                      ? 'bg-schoolnet-primary text-white'
                      : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                    }
                  `}
                >
                  {niveau === 'tous' ? 'Tous niveaux' : niveau}
                </button>
              ))}
            </div>
          )}

          {/* Onglets */}
          <div className="flex flex-row bg-white rounded-xl p-1 mb-4 border border-gray-200">
            <button
              onClick={() => handleTabChange('officielles')}
              className={`
                flex-1 flex flex-row items-center justify-center gap-1.5 py-2.5 rounded-lg text-sm font-medium transition-colors
                ${activeTab === 'officielles'
                  ? 'bg-schoolnet-primary text-white'
                  : 'text-gray-500 hover:bg-gray-50'
                }
              `}
            >
              <Building2 className="w-4 h-4" />
              Officielles ({peutAccederOfficielles ? filteredOfficielles.length : 0})
            </button>
            <button
              onClick={() => handleTabChange('personnelles')}
              className={`
                flex-1 flex flex-row items-center justify-center gap-1.5 py-2.5 rounded-lg text-sm font-medium transition-colors
                ${activeTab === 'personnelles'
                  ? 'bg-schoolnet-primary text-white'
                  : 'text-gray-500 hover:bg-gray-50'
                }
              `}
            >
              <BookOpen className="w-4 h-4" />
              Personnelles ({filteredPersonnelles.length})
            </button>
          </div>

          {/* Classes officielles */}
          {activeTab === 'officielles' && (
            <>
              {!peutAccederOfficielles ? (
                <Card className="p-8 text-center">
                  <Building2 className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <h3 className="text-base font-semibold text-gray-700 mb-2">Aucune classe officielle</h3>
                  <p className="text-sm text-gray-500">
                    Vous n'avez jamais été affilié à un établissement. Les classes officielles ne sont pas accessibles.
                  </p>
                  <p className="text-xs text-gray-400 mt-2">
                    En mode indépendant, vous pouvez créer vos propres classes personnelles.
                  </p>
                </Card>
              ) : filteredOfficielles.length === 0 ? (
                <Card className="p-8 text-center">
                  <Building2 className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <h3 className="text-base font-semibold text-gray-700 mb-2">
                    {searchQuery || selectedNiveau !== 'tous' ? 'Aucun résultat' : 'Aucune classe officielle'}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {searchQuery || selectedNiveau !== 'tous' 
                      ? 'Aucune classe ne correspond à vos critères.'
                      : 'Vous n\'êtes pas encore rattaché à une classe officielle.'}
                  </p>
                </Card>
              ) : (
                filteredOfficielles.map((classe) => (
                  <ClassCard
                    key={classe.id}
                    id={classe.id}
                    nom={classe.nom}
                    niveau={classe.niveau}
                    statut="officiel"
                    etablissementNom={classe.etablissement_nom}
                    effectif={classe.effectif}
                    onPress={() => handleCliqueOfficielle(classe)}
                  />
                ))
              )}
            </>
          )}

          {/* Classes personnelles */}
          {activeTab === 'personnelles' && (
            <>
              <button
                onClick={() => setShowPersonnelleForm(true)}
                className="w-full flex flex-row items-center justify-center gap-2 bg-purple-500 text-white py-3 rounded-lg text-sm font-medium hover:bg-purple-600 transition-colors mb-4"
              >
                <Plus className="w-4 h-4" />
                Nouvelle classe personnelle
              </button>

              {filteredPersonnelles.length === 0 ? (
                <Card className="p-8 text-center">
                  <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <h3 className="text-base font-semibold text-gray-700 mb-2">
                    {searchQuery ? 'Aucun résultat' : 'Aucune classe personnelle'}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {searchQuery 
                      ? 'Aucune classe ne correspond à votre recherche.'
                      : 'Créez votre première classe personnelle pour commencer.'}
                  </p>
                </Card>
              ) : (
                filteredPersonnelles.map((classe) => (
                  <ClassePersonnelleCard
                    key={classe.id}
                    classe={classe}
                    onPress={() => handleCliquePersonnelle(classe)}
                    onEdit={() => handleEditClasse(classe)}
                    onDelete={() => deleteClasse(classe.id)}
                    onExport={() => {
                      // exportElevesToCSV(classe.eleves, classe.nom);
                      // exportMatieresToCSV(classe.matieres, classe.nom);
                      window.alert(`Export des données de ${classe.nom} lancé`);
                    }}
                    onManageEleves={() => handleVoirEleves(classe.id, classe.nom, 'personnelle')}
                    onManageMatieres={() => handleGererMatieres(classe)}
                    onPressDetails={() => handleCliquePersonnelle(classe)}
                    onViewNotes={() => navigate(`/enseignant/notes?classePersonnelleId=${classe.id}`)}
                  />
                ))
              )}
            </>
          )}
        </div>
      </div>

      {/* Modals */}
      <ClasseDetailModal
        visible={showClasseDetail}
        classe={selectedClasseOfficielle}
        onClose={() => {
          setShowClasseDetail(false);
          setSelectedClasseOfficielle(null);
        }}
        onVoirEleves={() => {
          if (selectedClasseOfficielle) {
            setShowClasseDetail(false);
            handleVoirEleves(selectedClasseOfficielle.id, selectedClasseOfficielle.nom, 'officielle');
          }
        }}
      />

      <ElevesListModal
        visible={showElevesList}
        eleves={currentEleves}
        classeNom={currentClasseNom}
        classeId={currentClasseId}
        classeType={currentClasseType}
        onClose={() => {
          setShowElevesList(false);
          setCurrentEleves([]);
          setCurrentClasseNom('');
        }}
      />

      {/* Modal gestion des élèves */}
      {showGestionEleves && (
        <Portal>
          <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
              <div className="flex flex-row justify-between items-center px-5 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800">
                  Gérer les élèves - {selectedClassePersonnelle?.nom}
                </h3>
                <button
                  onClick={() => setShowGestionEleves(false)}
                  className="p-1 hover:bg-gray-100 rounded-full"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
              <div className="p-4 overflow-y-auto max-h-[calc(90vh-80px)]">
                {selectedClassePersonnelle && (
                  <GestionElevesPersonnels
                    classeId={selectedClassePersonnelle.id}
                    eleves={selectedClassePersonnelle.eleves || []}
                    onRefresh={handleGestionElevesSuccess}
                  />
                )}
              </div>
            </div>
          </div>
        </Portal>
      )}

      {/* Modal gestion des matières */}
      {showGestionMatieres && (
        <Portal>
          <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
              <div className="flex flex-row justify-between items-center px-5 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800">Gérer les matières</h3>
                <button
                  onClick={() => setShowGestionMatieres(false)}
                  className="p-1 hover:bg-gray-100 rounded-full"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
              <div className="p-4 overflow-y-auto max-h-[calc(90vh-80px)]">
                <GestionMatieresPersonnelles
                  classeId={currentClasseId}
                  matieres={currentClasseMatieres}
                  onRefresh={handleGestionMatieresSuccess}
                />
              </div>
            </div>
          </div>
        </Portal>
      )}

      {/* Modal modification classe personnelle */}
      {showEditClasseModal && (
        <Portal>
          <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl w-full max-w-md max-h-[90vh] overflow-hidden">
              <div className="flex flex-row justify-between items-center px-5 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800">Modifier la classe</h3>
                <button
                  onClick={() => setShowEditClasseModal(false)}
                  className="p-1 hover:bg-gray-100 rounded-full"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
              <div className="p-4 overflow-y-auto max-h-[calc(90vh-80px)]">
                <label className="text-sm font-medium text-gray-700 block mb-1.5">
                  Nom de la classe *
                </label>
                <Input
                  value={editClasseNom}
                  onChange={(e) => setEditClasseNom(e.target.value)}
                  placeholder="Nom de la classe"
                  className="mb-3"
                />

                <label className="text-sm font-medium text-gray-700 block mb-1.5">
                  Description (optionnelle)
                </label>
                <textarea
                  value={editClasseDescription}
                  onChange={(e) => setEditClasseDescription(e.target.value)}
                  placeholder="Description de la classe"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-schoolnet-primary min-h-[80px]"
                  rows={3}
                />

                <label className="text-sm font-medium text-gray-700 block mb-1.5 mt-3">
                  Établissement
                </label>
                <button
                  onClick={() => setShowEditEtablissementSearch(true)}
                  className="w-full flex flex-row items-center gap-2 border border-gray-200 rounded-lg px-3 py-2.5 text-sm hover:bg-gray-50 transition-colors"
                >
                  <Building2 className="w-4 h-4 text-schoolnet-primary" />
                  <span className={editEtablissementNom ? 'text-gray-800' : 'text-gray-400'}>
                    {editEtablissementNom || 'Rechercher un établissement'}
                  </span>
                </button>
                {editEtablissementNom && (
                  <button
                    onClick={() => { setEditEtablissementNom(''); setEditEtablissementId(null); }}
                    className="text-xs text-red-500 hover:underline mt-1"
                  >
                    Effacer
                  </button>
                )}

                <div className="flex flex-row gap-3 mt-4">
                  <button
                    onClick={() => setShowEditClasseModal(false)}
                    className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium text-gray-500 transition-colors"
                  >
                    Annuler
                  </button>
                  <button
                    onClick={handleSaveEditClasse}
                    className="flex-1 flex flex-row items-center justify-center gap-2 bg-schoolnet-primary text-white py-2.5 rounded-lg text-sm font-medium hover:bg-schoolnet-primary/90 transition-colors"
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

      {/* Modal recherche établissement */}
      <EtablissementSearchModal
        visible={showEditEtablissementSearch}
        onClose={() => setShowEditEtablissementSearch(false)}
        onSelect={(etablissement: any) => {
          setEditEtablissementNom(etablissement.nom);
          setEditEtablissementId(etablissement.id);
          setShowEditEtablissementSearch(false);
        }}
      />

      {/* Formulaire de création de classe personnelle */}
      {showPersonnelleForm && (
        <ClassePersonnelleForm
          onSuccess={handleCreatePersonnelleSuccess}
          onCancel={() => setShowPersonnelleForm(false)}
        />
      )}
    </>
  );
}
