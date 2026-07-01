// /src/components/enseignant/GroupesManager.tsx
// Gestion des groupes d'élèves

import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Edit2, Users, Save, X } from 'lucide-react';
import { supabase } from '@/lib/supabase.web';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

interface GroupesManagerProps {
  classeId: string;
  onRefresh?: () => void;
}

interface Groupe {
  id: string;
  nom: string;
  description?: string;
  eleves?: { id: string; matricule: string; nom?: string; prenom?: string }[];
}

interface Eleve {
  id: string;
  matricule: string;
  user?: { prenom: string; nom: string };
}

export default function GroupesManager({ classeId, onRefresh }: GroupesManagerProps) {
  const [groupes, setGroupes] = useState<Groupe[]>([]);
  const [eleves, setEleves] = useState<Eleve[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingGroupe, setEditingGroupe] = useState<Groupe | null>(null);
  const [formNom, setFormNom] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [selectedEleve, setSelectedEleve] = useState<string | null>(null);
  const [selectedGroupeId, setSelectedGroupeId] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, [classeId]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      const { data: elevesData, error: elevesError } = await supabase
        .from('eleves')
        .select('id, matricule, user:user_id(prenom, nom)')
        .eq('classe_id', classeId)
        .eq('statut', 'actif');
      
      if (elevesError) {
        console.error('Error loading eleves:', elevesError);
        setEleves([]);
      } else {
        setEleves(elevesData || []);
      }
      
      const { data: groupesData, error: groupesError } = await supabase
        .from('groupes_eleves')
        .select('*')
        .eq('classe_id', classeId)
        .order('nom');
      
      if (groupesError) {
        console.error('Error loading groupes:', groupesError);
        setGroupes([]);
      } else {
        let appartenances: any[] = [];
        if (groupesData && groupesData.length > 0) {
          const { data: appData, error: appError } = await supabase
            .from('eleve_groupes')
            .select('eleve_id, groupe_id');
          
          if (!appError) {
            appartenances = appData || [];
          }
        }
        
        const groupesAvecEleves = (groupesData || []).map(g => ({
          ...g,
          eleves: (elevesData || []).filter(e => 
            appartenances.some(a => a.eleve_id === e.id && a.groupe_id === g.id)
          ),
        }));
        
        setGroupes(groupesAvecEleves);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateGroupe = async () => {
    if (!formNom.trim()) {
      window.alert('Veuillez saisir un nom pour le groupe');
      return;
    }
    
    try {
      const { error } = await supabase
        .from('groupes_eleves')
        .insert({
          classe_id: classeId,
          nom: formNom,
          description: formDescription || null,
        });
      
      if (error) throw error;
      
      setShowForm(false);
      setFormNom('');
      setFormDescription('');
      loadData();
      if (onRefresh) onRefresh();
      
      window.alert('Groupe créé avec succès');
    } catch (error) {
      console.error('Error creating groupe:', error);
      window.alert('Impossible de créer le groupe');
    }
  };

  const handleUpdateGroupe = async () => {
    if (!editingGroupe || !formNom.trim()) return;
    
    try {
      const { error } = await supabase
        .from('groupes_eleves')
        .update({
          nom: formNom,
          description: formDescription || null,
        })
        .eq('id', editingGroupe.id);
      
      if (error) throw error;
      
      setEditingGroupe(null);
      setFormNom('');
      setFormDescription('');
      loadData();
      if (onRefresh) onRefresh();
      
      window.alert('Groupe modifié avec succès');
    } catch (error) {
      console.error('Error updating groupe:', error);
      window.alert('Impossible de modifier le groupe');
    }
  };

  const handleDeleteGroupe = async (groupeId: string) => {
    if (!window.confirm('Supprimer ce groupe ? Les élèves seront retirés du groupe.')) return;
    
    try {
      const { error } = await supabase
        .from('groupes_eleves')
        .delete()
        .eq('id', groupeId);
      
      if (error) throw error;
      
      loadData();
      if (onRefresh) onRefresh();
      window.alert('Groupe supprimé');
    } catch (error) {
      console.error('Error deleting groupe:', error);
      window.alert('Impossible de supprimer le groupe');
    }
  };

  const handleAddEleveToGroupe = async () => {
    if (!selectedEleve || !selectedGroupeId) return;
    
    try {
      const { error } = await supabase
        .from('eleve_groupes')
        .insert({
          eleve_id: selectedEleve,
          groupe_id: selectedGroupeId,
        });
      
      if (error) throw error;
      
      setSelectedEleve(null);
      setSelectedGroupeId(null);
      loadData();
      window.alert('Élève ajouté au groupe');
    } catch (error) {
      console.error('Error adding eleve to groupe:', error);
      window.alert('Impossible d\'ajouter l\'élève');
    }
  };

  const handleRemoveEleveFromGroupe = async (eleveId: string, groupeId: string) => {
    try {
      const { error } = await supabase
        .from('eleve_groupes')
        .delete()
        .eq('eleve_id', eleveId)
        .eq('groupe_id', groupeId);
      
      if (error) throw error;
      loadData();
    } catch (error) {
      console.error('Error removing eleve from groupe:', error);
    }
  };

  const getEleveName = (eleve: Eleve) => {
    if (eleve.user?.prenom && eleve.user?.nom) {
      return `${eleve.user.prenom} ${eleve.user.nom}`;
    }
    return eleve.matricule;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="w-8 h-8 border-4 border-schoolnet-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex-1">
      <div className="flex flex-row justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-800">Gestion des groupes</h3>
        <button
          onClick={() => setShowForm(true)}
          className="flex flex-row items-center gap-1.5 bg-schoolnet-primary text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-schoolnet-primary/90 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Nouveau groupe
        </button>
      </div>

      {/* Formulaire */}
      {(showForm || editingGroupe) && (
        <Card className="p-4 mb-4">
          <h4 className="text-sm font-semibold text-gray-700 mb-3">
            {editingGroupe ? 'Modifier le groupe' : 'Créer un groupe'}
          </h4>
          <Input
            value={formNom}
            onChange={(e) => setFormNom(e.target.value)}
            placeholder="Nom du groupe"
            className="mb-3"
          />
          <textarea
            value={formDescription}
            onChange={(e) => setFormDescription(e.target.value)}
            placeholder="Description (optionnel)"
            className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-schoolnet-primary min-h-[80px] mb-3"
            rows={3}
          />
          <div className="flex flex-row gap-3">
            <button
              onClick={() => {
                setShowForm(false);
                setEditingGroupe(null);
                setFormNom('');
                setFormDescription('');
              }}
              className="flex-1 flex flex-row items-center justify-center gap-1.5 py-2.5 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium text-gray-500 transition-colors"
            >
              <X className="w-4 h-4" />
              Annuler
            </button>
            <button
              onClick={editingGroupe ? handleUpdateGroupe : handleCreateGroupe}
              className="flex-1 flex flex-row items-center justify-center gap-1.5 bg-emerald-500 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-emerald-600 transition-colors"
            >
              <Save className="w-4 h-4" />
              Enregistrer
            </button>
          </div>
        </Card>
      )}

      {/* Liste des groupes */}
      {groupes.length > 0 ? (
        groupes.map((groupe) => (
          <Card key={groupe.id} className="p-4 mb-3">
            <div className="flex flex-row justify-between items-start mb-3">
              <div>
                <h4 className="text-base font-semibold text-gray-800">{groupe.nom}</h4>
                {groupe.description && (
                  <p className="text-sm text-gray-500">{groupe.description}</p>
                )}
                <p className="text-xs text-gray-400 mt-1">{groupe.eleves?.length || 0} élèves</p>
              </div>
              <div className="flex flex-row gap-2">
                <button
                  onClick={() => {
                    setEditingGroupe(groupe);
                    setFormNom(groupe.nom);
                    setFormDescription(groupe.description || '');
                    setShowForm(false);
                  }}
                  className="p-1.5 hover:bg-gray-100 rounded-md transition-colors"
                >
                  <Edit2 className="w-4 h-4 text-gray-500" />
                </button>
                <button
                  onClick={() => handleDeleteGroupe(groupe.id)}
                  className="p-1.5 hover:bg-red-50 rounded-md transition-colors"
                >
                  <Trash2 className="w-4 h-4 text-red-500" />
                </button>
              </div>
            </div>

            {/* Élèves du groupe */}
            {groupe.eleves && groupe.eleves.length > 0 && (
              <div className="mt-3 pt-3 border-t border-gray-100">
                {groupe.eleves.map((eleve) => (
                  <div key={eleve.id} className="flex flex-row justify-between items-center py-1.5">
                    <span className="text-sm text-gray-600">{eleve.matricule}</span>
                    <button
                      onClick={() => handleRemoveEleveFromGroupe(eleve.id, groupe.id)}
                      className="p-1 hover:bg-red-50 rounded-md"
                    >
                      <X className="w-3.5 h-3.5 text-red-400" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Ajouter un élève */}
            <div className="mt-3 pt-3 border-t border-gray-100">
              {eleves.filter(e => !groupe.eleves?.some(ge => ge.id === e.id)).length > 0 ? (
                <button
                  onClick={() => {
                    const disponibles = eleves.filter(e => !groupe.eleves?.some(ge => ge.id === e.id));
                    // Simple prompt pour la démo
                    const eleveOptions = disponibles.map((e, i) => `${i}: ${getEleveName(e)}`).join('\n');
                    const choice = window.prompt(`Sélectionnez un élève (entrez le numéro):\n${eleveOptions}`);
                    if (choice !== null) {
                      const idx = parseInt(choice);
                      if (!isNaN(idx) && idx >= 0 && idx < disponibles.length) {
                        setSelectedEleve(disponibles[idx].id);
                        setSelectedGroupeId(groupe.id);
                        handleAddEleveToGroupe();
                      }
                    }
                  }}
                  className="flex flex-row items-center gap-1.5 text-schoolnet-primary text-sm font-medium hover:underline"
                >
                  <Plus className="w-4 h-4" />
                  Ajouter un élève
                </button>
              ) : (
                <p className="text-xs text-gray-400 italic">Tous les élèves sont déjà dans un groupe</p>
              )}
            </div>
          </Card>
        ))
      ) : (
        <Card className="p-8 text-center">
          <p className="text-sm text-gray-400">Aucun groupe créé</p>
          <p className="text-xs text-gray-400 mt-1">
            Cliquez sur "Nouveau groupe" pour créer votre premier groupe d'élèves.
          </p>
        </Card>
      )}
    </div>
  );
}
