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
      return
