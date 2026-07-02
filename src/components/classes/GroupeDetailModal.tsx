// /src/components/classes/GroupeDetailModal.tsx
// Modal de détail d'un groupe

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, User, BookOpen, Users, Search, ChevronDown, ChevronUp, Circle, Plus, Trash2, Check } from 'lucide-react';
import { supabase } from '@/lib/supabase.web';
import { Portal } from '@/components/ui/Portal';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';

interface GroupeDetailModalProps {
  visible: boolean;
  onClose: () => void;
  groupeId: string;
  groupeNom: string;
  classeId: string;
}

interface Eleve {
  id: string;
  matricule: string;
  prenom?: string;
  nom?: string;
  statut?: string;
}

interface EleveDisponible {
  id: string;
  matricule: string;
  prenom?: string;
  nom?: string;
  statut?: string;
}

interface Enseignant {
  id: string;
  nom: string;
  prenom: string;
  matiere_nom: string;
}

type SortField = 'nom' | 'matricule';
type SortOrder = 'asc' | 'desc';

export default function GroupeDetailModal({
  visible,
  onClose,
  groupeId,
  groupeNom,
  classeId,
}: GroupeDetailModalProps) {
  const navigate = useNavigate();
  const [eleves, setEleves] = useState<Eleve[]>([]);
  const [filteredEleves, setFilteredEleves] = useState<Eleve[]>([]);
  const [enseignant, setEnseignant] = useState<Enseignant | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingAction, setLoadingAction] = useState(false);
  
  // Ajout d'élève
  const [showAddModal, setShowAddModal] = useState(false);
  const [elevesDisponibles, setElevesDisponibles] = useState<EleveDisponible[]>([]);
  const [filteredDisponibles, setFilteredDisponibles] = useState<EleveDisponible[]>([]);
  const [selectedEleveIds, setSelectedEleveIds] = useState<Set<string>>(new Set());
  const [searchDisponibleQuery, setSearchDisponibleQuery] = useState('');

  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmAction, setConfirmAction] = useState<{ eleveId: string; eleveNom: string } | null>(null);
  
  // Recherche
  const [searchQuery, setSearchQuery] = useState('');
  
  // Tri
  const [sortField, setSortField] = useState<SortField>('nom');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const totalPages = Math.ceil(filteredEleves.length / itemsPerPage);
  const paginatedEleves = filteredEleves.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  useEffect(() => {
    if (visible && groupeId) {
      loadData();
    }
  }, [visible, groupeId]);

  useEffect(() => {
    filterAndSortEleves();
  }, [searchQuery, eleves, sortField, sortOrder]);

  useEffect(() => {
    if (showAddModal && classeId) {
      loadElevesDisponibles();
    }
  }, [showAddModal, classeId]);

  useEffect(() => {
    filterDisponibles();
  }, [searchDisponibleQuery, elevesDisponibles]);

  if (!visible) return null;

  const loadData = async () => {
    setLoading(true);
    try {
      await Promise.all([loadEleves(), loadEnseignant()]);
    } catch (error) {
      console.error('Error loading groupe details:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadEleves = async () => {
    try {
      const { data: liens, error: liensError } = await supabase
        .from('eleve_groupes')
        .select('eleve_id')
        .eq('groupe_id', groupeId);

      if (liensError) throw liensError;

      if (!liens || liens.length === 0) {
        setEleves([]);
        setFilteredEleves([]);
        return;
      }

      const eleveIds = liens.map(l => l.eleve_id);

      const { data: elevesData, error: elevesError } = await supabase
        .from('eleves')
        .select('id, matricule, user_id, statut')
        .in('id', eleveIds);

      if (elevesError) throw elevesError;

      if (!elevesData || elevesData.length === 0) {
        setEleves([]);
        setFilteredEleves([]);
        return;
      }

      const userIds = elevesData.map(e => e.user_id).filter(Boolean);
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

      const formattedEleves: Eleve[] = elevesData.map(e => {
        const profile = profileMap.get(e.user_id);
        return {
          id: e.id,
          matricule: e.matricule || '',
          prenom: profile?.prenom,
          nom: profile?.nom,
          statut: e.statut || 'inconnu',
        };
      });

      setEleves(formattedEleves);
      setFilteredEleves(formattedEleves);
    } catch (error) {
      console.error('Error loading eleves:', error);
      setEleves([]);
      setFilteredEleves([]);
    }
  };

  const loadElevesDisponibles = async () => {
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

      const formattedEleves: EleveDisponible[] = elevesNonAssignes.map(e => {
        const profile = profileMap.get(e.user_id);
        return {
          id: e.id,
          matricule: e.matricule || '',
          prenom: profile?.prenom,
          nom: profile?.nom,
          statut: e.statut || 'inconnu',
        };
      });

      setElevesDisponibles(formattedEleves);
      setFilteredDisponibles(formattedEleves);
    } catch (error) {
      console.error('Error loading eleves disponibles:', error);
      setElevesDisponibles([]);
      setFilteredDisponibles([]);
    }
  };

  const loadEnseignant = async () => {
    try {
      const { data, error } = await supabase
        .from('enseignant_groupes')
        .select('enseignant_id, matiere_id')
        .eq('groupe_id', groupeId)
        .maybeSingle();

      if (error) throw error;

      if (!data) {
        setEnseignant(null);
        return;
      }

      let enseignantNom = '', enseignantPrenom = '';

      if (data.enseignant_id) {
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('nom, prenom')
          .eq('id', data.enseignant_id)
          .maybeSingle();

        if (!profileError && profileData) {
          enseignantNom = profileData.nom || '';
          enseignantPrenom = profileData.prenom || '';
        }
      }

      let matiereNom = '';
      if (data.matiere_id) {
        const { data: matiereData, error: matiereError } = await supabase
          .from('matieres')
          .select('nom')
          .eq('id', data.matiere_id)
          .maybeSingle();

        if (!matiereError && matiereData) {
          matiereNom = matiereData.nom || '';
        }
      }

      setEnseignant({
        id: data.enseignant_id,
        nom: enseignantNom,
        prenom: enseignantPrenom,
        matiere_nom: matiereNom,
      });
    } catch (error) {
      console.error('Error loading enseignant:', error);
      setEnseignant(null);
    }
  };

  const filterAndSortEleves = () => {
    let filtered = [...eleves];
    
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        e => 
          (e.prenom && e.prenom.toLowerCase().includes(query)) ||
          (e.nom && e.nom.toLowerCase().includes(query)) ||
          (e.matricule && e.matricule.toLowerCase().includes(query))
      );
    }
    
    filtered.sort((a, b) => {
      let valueA: string, valueB: string;
      
      if (sortField === 'nom') {
        valueA = `${a.prenom || ''} ${a.nom || ''}`.toLowerCase();
        valueB = `${b.prenom || ''} ${b.nom || ''}`.toLowerCase();
      } else {
        valueA = a.matricule?.toLowerCase() || '';
        valueB = b.matricule?.toLowerCase() || '';
      }
      
      if (sortOrder === 'asc') {
        return valueA < valueB ? -1 : valueA > valueB ? 1 : 0;
      } else {
        return valueA > valueB ? -1 : valueA < valueB ? 1 : 0;
      }
    });
    
    setFilteredEleves(filtered);
    setCurrentPage(1);
  };

  const filterDisponibles = () => {
    let filtered = [...elevesDisponibles];
    
    if (searchDisponibleQuery.trim()) {
      const query = searchDisponibleQuery.toLowerCase();
      filtered = filtered.filter(
        e => 
          (e.prenom && e.prenom.toLowerCase().includes(query)) ||
          (e.nom && e.nom.toLowerCase().includes(query)) ||
          (e.matricule && e.matricule.toLowerCase().includes(query))
      );
    }
    
    setFilteredDisponibles(filtered);
  };

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
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

  const handleAddEleves = async () => {
    if (selectedEleveIds.size === 0) {
      window.alert('Veuillez sélectionner au moins un élève');
      return;
    }

    setLoadingAction(true);
    try {
      const inserts = Array.from(selectedEleveIds).map(eleveId => ({
        eleve_id: eleveId,
        groupe_id: groupeId,
      }));

      const { error } = await supabase
        .from('eleve_groupes')
        .insert(inserts);

      if (error) throw error;

      window.alert(`${selectedEleveIds.size} élève(s) ajouté(s) au groupe`);
      
      setShowAddModal(false);
      setSelectedEleveIds(new Set());
      setSearchDisponibleQuery('');
      await loadEleves();
    } catch (error) {
      console.error('Error adding eleves:', error);
      window.alert('Impossible d\'ajouter les élèves');
    } finally {
      setLoadingAction(false);
    }
  };

  const handleRemoveEleve = (eleveId: string, eleveNom: string) => {
    setConfirmAction({ eleveId, eleveNom });
    setShowConfirmModal(true);
  };
  
  const executeRemoveEleve = async () => {
    if (!confirmAction) return;
    
    const { eleveId, eleveNom } = confirmAction;
    
    setLoadingAction(true);
    try {
      const { error } = await supabase
        .from('eleve_groupes')
        .delete()
        .eq('eleve_id', eleveId)
        .eq('groupe_id', groupeId);
  
      if (error) throw error;
  
      await loadEleves();
      window.alert(`${eleveNom} a été retiré du groupe`);
    } catch (error) {
      console.error('Error removing eleve:', error);
      window.alert('Impossible de retirer l\'élève');
    } finally {
      setLoadingAction(false);
      setShowConfirmModal(false);
      setConfirmAction(null);
    }
  };
  
  const cancelRemoveEleve = () => {
    setShowConfirmModal(false);
    setConfirmAction(null);
  };

  const getStatutColor = (statut: string) => {
    switch (statut) {
      case 'actif': return '#10B981';
      case 'PRE_ACCEPTED': return '#F59E0B';
      case 'inactif': return '#EF4444';
      default: return '#9CA3AF';
    }
  };

  const getStatutLabel = (statut: string) => {
    switch (statut) {
      case 'actif': return 'Actif';
      case 'PRE_ACCEPTED': return 'Pré-inscrit';
      case 'inactif': return 'Inactif';
      default: return statut;
    }
  };

  const getAvatarInitials = (eleve: Eleve | EleveDisponible) => {
    const prenom = eleve.prenom || '';
    const nom = eleve.nom || '';
    if (prenom && nom) {
      return `${prenom.charAt(0)}${nom.charAt(0)}`.toUpperCase();
    }
    return eleve.matricule?.charAt(0) || '?';
  };

  const getEleveName = (eleve: Eleve | EleveDisponible) => {
    if (eleve.prenom && eleve.nom) {
      return `${eleve.prenom} ${eleve.nom}`;
    }
    return eleve.matricule;
  };

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const renderPagination = () => {
    if (totalPages <= 1) return null;
    
    return (
      <div className="flex flex-row justify-between items-center mt-3 pt-3 border-t border-gray-100">
        <button
          onClick={() => goToPage(currentPage - 1)}
          disabled={currentPage === 1}
          className={`px-4 py-2 rounded-lg text-sm transition-colors ${
            currentPage === 1
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
          }`}
        >
          ‹ Préc.
        </button>
        <span className="text-sm text-gray-500">
          Page {currentPage} / {totalPages}
        </span>
        <button
          onClick={() => goToPage(currentPage + 1)}
          disabled={currentPage === totalPages}
          className={`px-4 py-2 rounded-lg text-sm transition-colors ${
            currentPage === totalPages
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
          }`}
        >
          Suiv. ›
        </button>
      </div>
    );
  };

  const renderSortIndicator = (field: SortField) => {
    if (sortField !== field) return null;
    return sortOrder === 'asc' 
      ? <ChevronUp className="w-3.5 h-3.5 text-schoolnet-primary" />
      : <ChevronDown className="w-3.5 h-3.5 text-schoolnet-primary" />;
  };

  const handleElevePress = (eleveId: string) => {
    onClose();
    setTimeout(() => {
      navigate(`/eleves/${eleveId}`);
    }, 100);
  };

  const handleEnseignantPress = (enseignantId: string) => {
    onClose();
    setTimeout(() => {
      navigate(`/enseignants/${enseignantId}/detail`);
    }, 100);
  };

  return (
    <>
      {/* Modal principal */}
      <Portal>
        <div 
          className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <div 
            className="bg-white rounded-2xl w-full max-w-2xl max-h-[85vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* En-tête */}
            <div className="flex flex-row justify-between items-start px-5 py-4 border-b border-gray-200">
              <div>
                <h3 className="text-lg font-semibold text-gray-800">Détails du groupe</h3>
                <p className="text-sm text-gray-500">{groupeNom}</p>
              </div>
              <button
                onClick={onClose}
                className="p-1 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {loading ? (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="w-8 h-8 border-4 border-schoolnet-primary border-t-transparent rounded-full animate-spin" />
                <p className="mt-3 text-sm text-gray-500">Chargement...</p>
              </div>
            ) : (
              <>
                {/* Barre de recherche */}
                <div className="flex flex-row items-center gap-2 mx-4 mt-3 px-3 py-2 bg-gray-50 rounded-lg border border-gray-200">
                  <Search className="w-4 h-4 text-gray-400" />
                  <Input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Rechercher un élève (nom, prénom, matricule)"
                    className="border-0 bg-transparent p-0 text-sm focus:ring-0"
                  />
                </div>

                <div className="p-4 overflow-y-auto max-h-[60vh]">
                  {/* Enseignant assigné */}
                  <div className="mb-4">
                    <h4 className="text-sm font-semibold text-gray-700 mb-2">
                      <User className="w-4 h-4 inline mr-1 text-gray-400" /> Professeur Principal
                    </h4>
                    {enseignant ? (
                      <button
                        onClick={() => handleEnseignantPress(enseignant.id)}
                        className="w-full text-left bg-gray-50 rounded-lg p-3 hover:bg-gray-100 transition-colors"
                      >
                        <p className="text-sm font-medium text-gray-800">
                          {enseignant.prenom} {enseignant.nom}
                        </p>
                        <p className="text-xs text-gray-500">
                          <BookOpen className="w-3 h-3 inline mr-1" /> {enseignant.matiere_nom}
                        </p>
                      </button>
                    ) : (
                      <p className="text-sm text-gray-400 text-center py-2">Aucun professeur principal assigné</p>
                    )}
                  </div>

                  {/* Élèves */}
                  <div>
                    <div className="flex flex-row justify-between items-center mb-3 flex-wrap gap-2">
                      <h4 className="text-sm font-semibold text-gray-700">
                        <Users className="w-4 h-4 inline mr-1 text-gray-400" /> Élèves ({filteredEleves.length})
                      </h4>
                      <div className="flex flex-row items-center gap-2">
                        <button
                          onClick={() => setShowAddModal(true)}
                          className="flex flex-row items-center gap-1 bg-blue-50 text-schoolnet-primary px-3 py-1 rounded-full text-xs font-medium hover:bg-blue-100 transition-colors"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          Ajouter
                        </button>
                        <div className="flex flex-row gap-1">
                          <button
                            onClick={() => toggleSort('nom')}
                            className={`flex flex-row items-center gap-1 px-2 py-1 rounded-md text-xs transition-colors ${
                              sortField === 'nom' ? 'bg-blue-50 text-schoolnet-primary font-medium' : 'bg-gray-100 text-gray-500'
                            }`}
                          >
                            Nom {renderSortIndicator('nom')}
                          </button>
                          <button
                            onClick={() => toggleSort('matricule')}
                            className={`flex flex-row items-center gap-1 px-2 py-1 rounded-md text-xs transition-colors ${
                              sortField === 'matricule' ? 'bg-blue-50 text-schoolnet-primary font-medium' : 'bg-gray-100 text-gray-500'
                            }`}
                          >
                            Matricule {renderSortIndicator('matricule')}
                          </button>
                        </div>
                      </div>
                    </div>

                    {filteredEleves.length === 0 ? (
                      <p className="text-sm text-gray-400 text-center py-4">
                        {searchQuery ? 'Aucun élève ne correspond à la recherche' : 'Aucun élève assigné'}
                      </p>
                    ) : (
                      <>
                        {paginatedEleves.map((eleve) => (
                          <div key={eleve.id} className="flex flex-row items-center gap-2 py-2.5 border-b border-gray-100 last:border-0">
                            <button
                              onClick={() => handleElevePress(eleve.id)}
                              className="flex-1 flex flex-row items-center gap-3 text-left"
                            >
                              <div className="w-9 h-9 rounded-full bg-schoolnet-primary flex items-center justify-center flex-shrink-0">
                                <span className="text-sm font-semibold text-white">
                                  {getAvatarInitials(eleve)}
                                </span>
                              </div>
                              <div className="flex-1">
                                <div className="flex flex-row items-center gap-2">
                                  <span className="text-sm font-medium text-gray-800">{getEleveName(eleve)}</span>
                                  <span className={`text-xs px-2 py-0.5 rounded-full flex items-center gap-1`}
                                    style={{ backgroundColor: getStatutColor(eleve.statut || '') + '20' }}
                                  >
                                    <Circle className="w-1.5 h-1.5" style={{ color: getStatutColor(eleve.statut || '') }} />
                                    <span style={{ color: getStatutColor(eleve.statut || '') }}>{getStatutLabel(eleve.statut || '')}</span>
                                  </span>
                                </div>
                                <p className="text-xs text-gray-400">{eleve.matricule}</p>
                              </div>
                            </button>
                            <button
                              onClick={() => handleRemoveEleve(eleve.id, getEleveName(eleve))}
                              disabled={loadingAction}
                              className="p-2 hover:bg-red-50 rounded-md transition-colors"
                            >
                              <Trash2 className="w-4 h-4 text-red-400 hover:text-red-600" />
                            </button>
                          </div>
                        ))}
                        {renderPagination()}
                      </>
                    )}
                  </div>
                </div>
              </>
            )}

            {/* Footer */}
            <div className="flex flex-row gap-3 px-5 py-4 border-t border-gray-200">
              <button
                onClick={onClose}
                className="flex-1 py-2.5 bg-schoolnet-primary hover:bg-schoolnet-primary/90 rounded-lg text-sm font-medium text-white transition-colors"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      </Portal>

      {/* Modal d'ajout d'élèves */}
      {showAddModal && (
        <Portal>
          <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl w-full max-w-md max-h-[85vh] overflow-hidden">
              <div className="flex flex-row justify-between items-start px-5 py-4 border-b border-gray-200">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">Ajouter des élèves</h3>
                  <p className="text-sm text-gray-500">Sélectionnez les élèves à ajouter au groupe {groupeNom}</p>
                </div>
                <button
                  onClick={() => {
                    setShowAddModal(false);
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
                  onChange={(e) => setSearchDisponibleQuery(e.target.value)}
                  placeholder="Rechercher un élève..."
                  className="border-0 bg-transparent p-0 text-sm focus:ring-0"
                />
              </div>

              <div className="p-4 overflow-y-auto max-h-[50vh]">
                {filteredDisponibles.length === 0 ? (
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
                    setShowAddModal(false);
                    setSelectedEleveIds(new Set());
                    setSearchDisponibleQuery('');
                  }}
                  className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium text-gray-500 transition-colors"
                >
                  Annuler
                </button>
                <button
                  onClick={handleAddEleves}
                  disabled={selectedEleveIds.size === 0 || loadingAction}
                  className={`flex-1 py-2.5 rounded-lg text-sm font-medium text-white transition-colors ${
                    selectedEleveIds.size === 0 || loadingAction
                      ? 'bg-gray-300 cursor-not-allowed'
                      : 'bg-schoolnet-primary hover:bg-schoolnet-primary/90'
                  }`}
                >
                  {loadingAction ? (
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

      {/* Modal de confirmation de suppression */}
      {showConfirmModal && (
        <Portal>
          <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl w-full max-w-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-200 text-center">
                <h3 className="text-lg font-semibold text-gray-800">Confirmer le retrait</h3>
              </div>
              <div className="p-5 text-center">
                <p className="text-sm text-gray-600">
                  Êtes-vous sûr de vouloir retirer{' '}
                  <span className="font-semibold text-gray-800">{confirmAction?.eleveNom}</span>{' '}
                  du groupe ?
                </p>
                <p className="text-xs text-gray-400 mt-2">Cette action est réversible.</p>
              </div>
              <div className="flex flex-row gap-3 px-5 py-4 border-t border-gray-200">
                <button
                  onClick={cancelRemoveEleve}
                  className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium text-gray-500 transition-colors"
                >
                  Annuler
                </button>
                <button
                  onClick={executeRemoveEleve}
                  className="flex-1 flex flex-row items-center justify-center gap-2 py-2.5 bg-red-500 hover:bg-red-600 rounded-lg text-sm font-medium text-white transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  Retirer
                </button>
              </div>
            </div>
          </div>
        </Portal>
      )}
    </>
  );
}
