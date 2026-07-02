// /src/components/classes/GroupesManagerV2.tsx
// Gestionnaire de groupes V2

import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Users, RefreshCw, Edit2, UserPlus, X, Check, Search } from 'lucide-react';
import { supabase } from '@/lib/supabase.web';
import { useGroupes, ModeleGroupe } from '@/hooks/useGroupes';
import { useAcademicStructure } from '@/hooks/useAcademicStructure';
import { Card } from '@/components/ui/Card';
import { Portal } from '@/components/ui/Portal';
import { Input } from '@/components/ui/Input';
import GroupeModal from './GroupeModal';
import AssignerEnseignantModal from './AssignerEnseignantModal';
import GroupeDetailModal from './GroupeDetailModal';
import CreerGroupeModal from './CreerGroupeModal';
import GenererGroupesModal from './GenererGroupesModal';
import ConfirmationModal from '@/components/common/ConfirmationModal';

interface GroupesManagerV2Props {
  classeId: string;
  classeNom?: string;
  onRefresh?: () => void;
}

export default function GroupesManagerV2({ classeId, classeNom, onRefresh }: GroupesManagerV2Props) {
  const { 
    groupes, 
    loading, 
    error, 
    deleteGroupe, 
    generateGroupesFromModele, 
    refresh, 
    createGroupe, 
    updateGroupe 
  } = useGroupes(classeId);
  const { modelesGroupes, loading: modelesLoading } = useAcademicStructure();
  
  const [generating, setGenerating] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [isModelesLoading, setIsModelesLoading] = useState(true);
  
  // États pour les modals
  const [showCreerModal, setShowCreerModal] = useState(false);
  const [showGenererModal, setShowGenererModal] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingGroupe, setEditingGroupe] = useState<{ id: string; nom: string; description?: string } | null>(null);
  const [assignEnseignantModalVisible, setAssignEnseignantModalVisible] = useState(false);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  
  // États pour confirmation
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [groupeToDelete, setGroupeToDelete] = useState<{ id: string; nom: string } | null>(null);

  // États pour le modal d'ajout d'élèves
  const [showAddElevesModal, setShowAddElevesModal] = useState(false);
  const [currentGroupeId, setCurrentGroupeId] = useState<string | null>(null);
  const [currentGroupeNom, setCurrentGroupeNom] = useState('');
  const [elevesDisponibles, setElevesDisponibles] = useState<any[]>([]);
  const [filteredDisponibles, setFilteredDisponibles] = useState<any[]>([]);
  const [selectedEleveIds, setSelectedEleveIds] = useState<Set<string>>(new Set());
  const [searchDisponibleQuery, setSearchDisponibleQuery] = useState('');
  const [loadingAdd, setLoadingAdd] = useState(false);
  const [loadingActionAdd, setLoadingActionAdd] = useState(false);

  useEffect(() => {
    if (modelesGroupes) {
      setIsModelesLoading(false);
    }
  }, [modelesGroupes]);

  const handleGenerateFromModele = async (modele: ModeleGroupe) => {
    setGenerating(true);
    const result = await generateGroupesFromModele(modele);
    setGenerating(false);
    
    if (result.success) {
      if (onRefresh) onRefresh();
    } else {
      console.error('Erreur:', result.error);
    }
  };

  const handleDeleteGroupe = (groupeId: string, groupeNom: string) => {
    setGroupeToDelete({ id: groupeId, nom: groupeNom });
    setShowDeleteConfirm(true);
  };

  const confirmDeleteGroupe = async () => {
    if (!groupeToDelete) return;
    
    setDeleting(true);
    const result = await deleteGroupe(groupeToDelete.id);
    setDeleting(false);
    
    if (result.success) {
      setShowDeleteConfirm(false);
      setGroupeToDelete(null);
      if (onRefresh) onRefresh();
    } else {
      console.error('Erreur:', result.error);
    }
  };

  const handleCreateGroupe = async (nom: string, description?: string) => {
    const result = await createGroupe(nom, description);
    if (result.success) {
      setShowCreerModal(false);
      if (onRefresh) onRefresh();
    } else {
      console.error('Erreur:', result.error);
    }
  };

  const handleUpdateGroupe = async (nom: string, description?: string) => {
    if (!editingGroupe) return;
    const result = await updateGroupe(editingGroupe.id, { nom, description });
    if (result.success) {
      setEditModalVisible(false);
      setEditingGroupe(null);
      if (onRefresh) onRefresh();
    } else {
      console.error('Erreur:', result.error);
    }
  };

  const openEditModal = (groupe: { id: string; nom: string; description?: string }) => {
    setEditingGroupe(groupe);
    setEditModalVisible(true);
  };

  const openAssignEnseignantModal = (groupeId: string, groupeNom: string) => {
    setCurrentGroupeId(groupeId);
    setCurrentGroupeNom(groupeNom);
    setAssignEnseignantModalVisible(true);
  };

  const openDetailModal = (groupeId: string, groupeNom: string) => {
    setCurrentGroupeId(groupeId);
    setCurrentGroupeNom(groupeNom);
    setDetailModalVisible(true);
  };

  const handleAssignSuccess = () => {
    if (onRefresh) onRefresh();
  };

  const handleOpenGenererModal = () => {
    setShowGenererModal(true);
  };

  // Fonctions pour le modal d'ajout d'élèves
  const loadElevesDisponibles = async (groupeId: string) => {
    setLoadingAdd(true);
    try {
      const { data: tousLesGroupes, error: groupesError } = await supabase
        .from('groupes_eleves')
        .select('id')
        .eq('classe_id', classeId);

      if (groupesError) throw groupesError;

      const tousLesGroupesIds = tousLesGroupes?.map(g => g.id) || [];

      let elevesAvecGroupeIds = new Set<string>();
      
      if (tousLesGroupesIds.length > 0) {
        const { data: elevesAvecGroupe, error: elevesAvecGroupeError } = await supabase
          .from('eleve_groupes')
          .select('eleve_id')
          .in('groupe_id', tousLesGroupesIds);

        if (!elevesAvecGroupeError && elevesAvecGroupe) {
          elevesAvecGroupeIds = new Set(elevesAvecGroupe.map(eg => eg.eleve_id));
        }
      }

      const { data: elevesClasse, error: elevesError } = await supabase
        .from('eleves')
        .select('id, matricule, user_id, statut')
        .eq('classe_id', classeId);

      if (elevesError) throw elevesError;

      if (!elevesClasse || elevesClasse.length === 0) {
        setElevesDisponibles([]);
        setFilteredDisponibles([]);
        return;
      }

      const elevesNonAssignes = elevesClasse.filter(e => !elevesAvecGroupeIds.has(e.id));

      if (elevesNonAssignes.length === 0) {
        setElevesDisponibles([]);
        setFilteredDisponibles([]);
        return;
      }

      const userIds = elevesNonAssignes.map(e => e.user_id).filter(Boolean);
      let profileMap = new Map();

      if (userIds.length > 0) {
        const { data: profilesData, error: profilesError } = await supabase
          .from('profiles')
          .select('id, nom, prenom')
          .in('id', userIds);

        if (!profilesError && profilesData) {
          profilesData.forEach(p => {
            profileMap.set(p.id, { nom: p.nom || '', prenom: p.prenom || '' });
          });
        }
      }

      const formatted = elevesNonAssignes.map(e => {
        const profile = profileMap.get(e.user_id);
        return {
          id: e.id,
          matricule: e.matricule || '',
          prenom: profile?.prenom,
          nom: profile?.nom,
          statut: e.statut || 'inconnu',
        };
      });

      setElevesDisponibles(formatted);
      setFilteredDisponibles(formatted);
    } catch (error) {
      console.error('Error loading eleves disponibles:', error);
      setElevesDisponibles([]);
      setFilteredDisponibles([]);
    } finally {
      setLoadingAdd(false);
    }
  };

  const openAddElevesModal = async (groupeId: string, groupeNom: string) => {
    setCurrentGroupeId(groupeId);
    setCurrentGroupeNom(groupeNom);
    setSelectedEleveIds(new Set());
    setSearchDisponibleQuery('');
    await loadElevesDisponibles(groupeId);
    setShowAddElevesModal(true);
  };

  const handleAddEleves = async () => {
    if (selectedEleveIds.size === 0 || !currentGroupeId) {
      window.alert('Veuillez sélectionner au moins un élève');
      return;
    }

    setLoadingActionAdd(true);
    try {
      const inserts = Array.from(selectedEleveIds).map(eleveId => ({
        eleve_id: eleveId,
        groupe_id: currentGroupeId,
      }));

      const { error } = await supabase
        .from('eleve_groupes')
        .insert(inserts);

      if (error) throw error;

      window.alert(`${selectedEleveIds.size} élève(s) ajouté(s) au groupe`);
      
      setShowAddElevesModal(false);
      setSelectedEleveIds(new Set());
      setSearchDisponibleQuery('');
      
      if (onRefresh) onRefresh();
      refresh();
    } catch (error) {
      console.error('Error adding eleves:', error);
      window.alert('Impossible d\'ajouter les élèves');
    } finally {
      setLoadingActionAdd(false);
    }
  };

  const filterDisponibles = (query: string) => {
    let filtered = [...elevesDisponibles];
    if (query.trim()) {
      const q = query.toLowerCase();
      filtered = filtered.filter(
        e => 
          (e.prenom && e.prenom.toLowerCase().includes(q)) ||
          (e.nom && e.nom.toLowerCase().includes(q)) ||
          (e.matricule && e.matricule.toLowerCase().includes(q))
      );
    }
    setFilteredDisponibles(filtered);
  };

  const toggleSelectEleve = (eleveId: string) => {
    const newSelected = new Set(selectedEleveIds);
    if (newSelected.has(eleveId)) {
      newSelected.delete(eleveId);
    } else {
      newSelected.add(eleveId);
    }
    setSelectedEleveIds(newSelected);
  };

  const getAvatarInitials = (eleve: any) => {
    const prenom = eleve.prenom || '';
    const nom = eleve.nom || '';
    if (prenom && nom) {
      return `${prenom.charAt(0)}${nom.charAt(0)}`.toUpperCase();
    }
    return eleve.matricule?.charAt(0) || '?';
  };

  const getEleveName = (eleve: any) => {
    if (eleve.prenom && eleve.nom) {
      return `${eleve.prenom} ${eleve.nom}`;
    }
    return eleve.matricule;
  };

  if (loading || modelesLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-8">
        <div className="w-8 h-8 border-4 border-schoolnet-primary border-t-transparent rounded-full animate-spin" />
        <p className="mt-3 text-sm text-gray-500">Chargement des groupes...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-8">
        <p className="text-sm text-red-500">{error}</p>
        <button
          onClick={refresh}
          className="mt-4 bg-schoolnet-primary text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-schoolnet-primary/90 transition-colors"
        >
          Réessayer
        </button>
      </div>
    );
  }

  return (
    <>
      <div className="flex-1 bg-gray-50">
        <div className="p-4 pb-8">
          {/* En-tête */}
          {classeNom && (
            <div className="flex flex-row items-center gap-2 mb-4">
              <Users className="w-5 h-5 text-schoolnet-primary" />
              <h3 className="text-base font-semibold text-gray-800">Groupes de {classeNom}</h3>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-row gap-3 mb-4">
            <button
              onClick={() => setShowCreerModal(true)}
              className="flex-1 flex flex-row items-center justify-center gap-2 bg-schoolnet-primary text-white py-3 rounded-lg text-sm font-medium hover:bg-schoolnet-primary/90 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Créer un groupe
            </button>
            <button
              onClick={handleOpenGenererModal}
              className="flex-1 flex flex-row items-center justify-center gap-2 bg-gray-100 text-schoolnet-primary py-3 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors border border-gray-200"
            >
              <RefreshCw className="w-4 h-4" />
              Générer depuis modèle
            </button>
          </div>

          {/* Liste des groupes */}
          <Card className="p-4 mb-4">
            <div className="flex flex-row items-center gap-2 mb-3">
              <h4 className="text-sm font-semibold text-gray-700">Groupes existants</h4>
              <span className="text-xs text-gray-400">({groupes.length})</span>
            </div>
            
            {groupes.length === 0 ? (
              <div className="text-center py-6">
                <p className="text-sm text-gray-400">Aucun groupe</p>
                <p className="text-xs text-gray-400 mt-1">
                  Créez un groupe manuellement ou générez-le à partir d'un modèle
                </p>
              </div>
            ) : (
              groupes.map((groupe) => (
                <div key={groupe.id} className="flex flex-row justify-between items-center py-2.5 border-b border-gray-100 last:border-0">
                  <button
                    onClick={() => openDetailModal(groupe.id, groupe.nom)}
                    className="flex-1 text-left"
                  >
                    <span className="text-sm font-medium text-gray-800 bg-gray-100 px-3 py-1 rounded-full inline-block">
                      {groupe.nom}
                    </span>
                    <p className="text-xs text-gray-400 mt-1">
                      {groupe.eleves_count || 0} élève(s)
                    </p>
                    {groupe.description && (
                      <p className="text-xs text-gray-500">{groupe.description}</p>
                    )}
                    {groupe.enseignant && (
                      <p className="text-xs text-schoolnet-primary mt-1">
                        👨‍🏫 {groupe.enseignant.prenom} {groupe.enseignant.nom} - {groupe.enseignant.matiere_nom}
                      </p>
                    )}
                  </button>
                  <div className="flex flex-row gap-2">
                    <button
                      onClick={() => openAddElevesModal(groupe.id, groupe.nom)}
                      className="p-1.5 hover:bg-blue-50 rounded-md transition-colors"
                      title="Ajouter des élèves"
                    >
                      <Users className="w-4 h-4 text-schoolnet-primary" />
                    </button>
                    <button
                      onClick={() => openAssignEnseignantModal(groupe.id, groupe.nom)}
                      className="p-1.5 hover:bg-blue-50 rounded-md transition-colors"
                      title="Assigner un enseignant"
                    >
                      <UserPlus className="w-4 h-4 text-schoolnet-primary" />
                    </button>
                    <button
                      onClick={() => openEditModal(groupe)}
                      className="p-1.5 hover:bg-amber-50 rounded-md transition-colors"
                      title="Modifier"
                    >
                      <Edit2 className="w-4 h-4 text-amber-500" />
                    </button>
                    <button
                      onClick={() => handleDeleteGroupe(groupe.id, groupe.nom)}
                      className="p-1.5 hover:bg-red-50 rounded-md transition-colors"
                      title="Supprimer"
                    >
                      <Trash2 className="w-4 h-4 text-red-400" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </Card>

          {/* Note */}
          <div className="bg-amber-50 rounded-lg p-3 border border-amber-200">
            <p className="text-xs text-amber-700">
              ℹ️ Les groupes permettent de subdiviser une classe pour les cours pratiques (ateliers, TP, etc.).
            </p>
          </div>
        </div>
      </div>

      {/* Modals */}
      <CreerGroupeModal
        visible={showCreerModal}
        onClose={() => setShowCreerModal(false)}
        onCreate={handleCreateGroupe}
        isLoading={loading}
      />

      <GenererGroupesModal
        visible={showGenererModal}
        onClose={() => setShowGenererModal(false)}
        onGenerate={handleGenerateFromModele}
        isLoading={generating}
      />

      <GroupeModal
        visible={editModalVisible}
        onClose={() => {
          setEditModalVisible(false);
          setEditingGroupe(null);
        }}
        onSave={handleUpdateGroupe}
        initialNom={editingGroupe?.nom || ''}
        initialDescription={editingGroupe?.description || ''}
        title="Modifier le groupe"
      />

      {currentGroupeId && (
        <>
          <AssignerEnseignantModal
            visible={assignEnseignantModalVisible}
            onClose={() => setAssignEnseignantModalVisible(false)}
            etablissementId={classeId}
            groupeId={currentGroupeId}
            groupeNom={currentGroupeNom}
            onAssign={handleAssignSuccess}
          />
          <GroupeDetailModal
            visible={detailModalVisible}
            onClose={() => setDetailModalVisible(false)}
            groupeId={currentGroupeId}
            groupeNom={currentGroupeNom}
            classeId={classeId}
          />
        </>
      )}

      <ConfirmationModal
        visible={showDeleteConfirm}
        title="Supprimer le groupe"
        message={`Êtes-vous sûr de vouloir supprimer le groupe "${groupeToDelete?.nom}" ?\n\nLes élèves ne seront pas supprimés, mais retirés du groupe.`}
        confirmText="Supprimer"
        variant="danger"
        onConfirm={confirmDeleteGroupe}
        onCancel={() => {
          setShowDeleteConfirm(false);
          setGroupeToDelete(null);
        }}
      />

      {/* Modal d'ajout d'élèves */}
      {showAddElevesModal && (
        <Portal>
          <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl w-full max-w-md max-h-[85vh] overflow-hidden">
              <div className="flex flex-row justify-between items-start px-5 py-4 border-b border-gray-200">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">Ajouter des élèves</h3>
                  <p className="text-sm text-gray-500">Sélectionnez les élèves à ajouter au groupe {currentGroupeNom}</p>
                </div>
                <button
                  onClick={() => {
                    setShowAddElevesModal(false);
                    setSelectedEleveIds(new Set());
                    setSearchDisponibleQuery('');
                  }}
                  className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              <div className="flex flex-row items-center gap-2 mx-4 mt-3 px-3 py-2 bg-gray-50 rounded-lg border border-gray-200">
                <Search className="w-4 h-4 text-gray-400" />
                <Input
                  value={searchDisponibleQuery}
                  onChange={(e) => {
                    setSearchDisponibleQuery(e.target.value);
                    filterDisponibles(e.target.value);
                  }}
                  placeholder="Rechercher un élève..."
                  className="border-0 bg-transparent p-0 text-sm focus:ring-0"
                />
              </div>

              <div className="p-4 overflow-y-auto max-h-[50vh]">
                {loadingAdd ? (
                  <div className="flex flex-col items-center justify-center py-8">
                    <div className="w-8 h-8 border-4 border-schoolnet-primary border-t-transparent rounded-full animate-spin" />
                    <p className="mt-3 text-sm text-gray-500">Chargement...</p>
                  </div>
                ) : filteredDisponibles.length === 0 ? (
                  <p className="text-sm text-gray-400 text-center py-4">
                    {searchDisponibleQuery ? 'Aucun élève ne correspond' : 'Aucun élève disponible à ajouter'}
                  </p>
                ) : (
                  filteredDisponibles.map((eleve) => (
                    <button
                      key={eleve.id}
                      onClick={() => toggleSelectEleve(eleve.id)}
                      className={`w-full flex flex-row items-center gap-3 py-3 px-3 border-b border-gray-100 transition-colors ${
                        selectedEleveIds.has(eleve.id) ? 'bg-blue-50' : 'hover:bg-gray-50'
                      }`}
                    >
                      <div className="w-9 h-9 rounded-full bg-schoolnet-primary flex items-center justify-center flex-shrink-0">
                        <span className="text-sm font-semibold text-white">
                          {getAvatarInitials(eleve)}
                        </span>
                      </div>
                      <div className="flex-1 text-left">
                        <p className="text-sm font-medium text-gray-800">{getEleveName(eleve)}</p>
                        <p className="text-xs text-gray-400">{eleve.matricule}</p>
                      </div>
                      {selectedEleveIds.has(eleve.id) && (
                        <Check className="w-4 h-4 text-schoolnet-primary" />
                      )}
                    </button>
                  ))
                )}
              </div>

              <div className="flex flex-row gap-3 px-5 py-4 border-t border-gray-200">
                <button
                  onClick={() => {
                    setShowAddElevesModal(false);
                    setSelectedEleveIds(new Set());
                    setSearchDisponibleQuery('');
                  }}
                  className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium text-gray-500 transition-colors"
                >
                  Annuler
                </button>
                <button
                  onClick={handleAddEleves}
                  disabled={selectedEleveIds.size === 0 || loadingActionAdd}
                  className={`flex-1 py-2.5 rounded-lg text-sm font-medium text-white transition-colors ${
                    selectedEleveIds.size === 0 || loadingActionAdd
                      ? 'bg-gray-300 cursor-not-allowed'
                      : 'bg-schoolnet-primary hover:bg-schoolnet-primary/90'
                  }`}
                >
                  {loadingActionAdd ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto" />
                  ) : (
                    `Ajouter (${selectedEleveIds.size})`
                  )}
                </button>
              </div>
            </div>
          </div>
        </Portal>
      )}
    </>
  );
}
