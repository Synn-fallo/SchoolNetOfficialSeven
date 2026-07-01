// /src/components/enseignant/CorrespondanceEleves.tsx
// Correspondance entre élèves personnels et officiels

import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, AlertCircle, Search, UserCheck } from 'lucide-react';
import { supabase } from '@/lib/supabase.web';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Portal } from '@/components/ui/Portal';

interface CorrespondanceElevesProps {
  classePersonnelleId: string;
  classeOfficielleId: string;
  onComplete: () => void;
}

interface ElevePersonnel {
  index: number;
  nom: string;
  prenom: string;
  matricule?: string;
}

interface EleveOfficiel {
  id: string;
  nom: string;
  prenom: string;
  matricule?: string;
  date_naissance?: string;
}

interface Correspondance {
  elevePersonnel: ElevePersonnel;
  eleveOfficielId: string | null;
  eleveOfficielNom: string | null;
  statut: 'auto' | 'manuel' | 'ignore' | 'pending';
}

export default function CorrespondanceEleves({
  classePersonnelleId,
  classeOfficielleId,
  onComplete
}: CorrespondanceElevesProps) {
  const [loading, setLoading] = useState(true);
  const [elevesPersonnels, setElevesPersonnels] = useState<ElevePersonnel[]>([]);
  const [elevesOfficiels, setElevesOfficiels] = useState<EleveOfficiel[]>([]);
  const [correspondances, setCorrespondances] = useState<Correspondance[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedEleve, setSelectedEleve] = useState<Correspondance | null>(null);
  const [recherche, setRecherche] = useState('');

  useEffect(() => {
    loadEleves();
  }, []);

  const loadEleves = async () => {
    setLoading(true);
    try {
      const { data: classePerso, error: err1 } = await supabase
        .from('classes_personnelles')
        .select('eleves')
        .eq('id', classePersonnelleId)
        .single();
      
      if (err1) throw err1;
      
      const personnels: ElevePersonnel[] = (classePerso.eleves || []).map((e: any, idx: number) => ({
        index: idx,
        nom: e.nom || '',
        prenom: e.prenom || '',
        matricule: e.matricule || ''
      }));
      setElevesPersonnels(personnels);
      
      const { data: officiels, error: err2 } = await supabase
        .from('eleves')
        .select('id, nom, prenom, matricule, date_naissance')
        .eq('classe_id', classeOfficielleId);
      
      if (err2) throw err2;
      setElevesOfficiels(officiels || []);
      
      const { data: existantes, error: err3 } = await supabase
        .from('correspondance_eleves')
        .select('*')
        .eq('classe_personnelle_id', classePersonnelleId);
      
      if (err3) throw err3;
      
      const initialCorrespondances: Correspondance[] = personnels.map((eleve, idx) => {
        const existante = existantes?.find(e => 
          e.eleve_personnel_nom === eleve.nom && 
          e.eleve_personnel_prenom === eleve.prenom
        );
        
        if (existante && existante.eleve_officiel_id) {
          const officiel = officiels?.find(o => o.id === existante.eleve_officiel_id);
          return {
            elevePersonnel: eleve,
            eleveOfficielId: existante.eleve_officiel_id,
            eleveOfficielNom: officiel ? `${officiel.prenom} ${officiel.nom}` : null,
            statut: 'auto'
          };
        }
        
        return {
          elevePersonnel: eleve,
          eleveOfficielId: null,
          eleveOfficielNom: null,
          statut: 'pending'
        };
      });
      
      setCorrespondances(initialCorrespondances);
    } catch (error) {
      console.error('Error loading students:', error);
      window.alert('Impossible de charger les élèves');
    } finally {
      setLoading(false);
    }
  };

  const rechercherCorrespondanceAuto = (eleve: ElevePersonnel): EleveOfficiel | null => {
    if (eleve.matricule) {
      const match = elevesOfficiels.find(o => o.matricule === eleve.matricule);
      if (match) return match;
    }
    
    const matchExact = elevesOfficiels.find(o => 
      o.nom.toLowerCase() === eleve.nom.toLowerCase() && 
      o.prenom.toLowerCase() === eleve.prenom.toLowerCase()
    );
    if (matchExact) return matchExact;
    
    const matches = elevesOfficiels.filter(o => 
      o.nom.toLowerCase().includes(eleve.nom.toLowerCase()) ||
      eleve.nom.toLowerCase().includes(o.nom.toLowerCase())
    );
    if (matches.length === 1) return matches[0];
    
    return null;
  };

  const handleAutoCorrespondance = () => {
    const nouvellesCorrespondances = correspondances.map(c => {
      if (c.statut !== 'pending') return c;
      
      const match = rechercherCorrespondanceAuto(c.elevePersonnel);
      if (match) {
        return {
          ...c,
          eleveOfficielId: match.id,
          eleveOfficielNom: `${match.prenom} ${match.nom}`,
          statut: 'auto'
        };
      }
      return c;
    });
    
    setCorrespondances(nouvellesCorrespondances);
    window.alert('Recherche automatique terminée');
  };

  const handleCorrespondanceManuelle = (correspondance: Correspondance, eleveOfficielId: string) => {
    const officiel = elevesOfficiels.find(o => o.id === eleveOfficielId);
    const nouvellesCorrespondances = correspondances.map(c => {
      if (c.elevePersonnel.index === correspondance.elevePersonnel.index) {
        return {
          ...c,
          eleveOfficielId,
          eleveOfficielNom: officiel ? `${officiel.prenom} ${officiel.nom}` : null,
          statut: 'manuel'
        };
      }
      return c;
    });
    setCorrespondances(nouvellesCorrespondances);
    setModalVisible(false);
    setSelectedEleve(null);
  };

  const handleIgnorer = (correspondance: Correspondance) => {
    const nouvellesCorrespondances = correspondances.map(c => {
      if (c.elevePersonnel.index === correspondance.elevePersonnel.index) {
        return { ...c, statut: 'ignore' };
      }
      return c;
    });
    setCorrespondances(nouvellesCorrespondances);
  };

  const handleValider = async () => {
    const nonCorrespondus = correspondances.filter(c => c.statut === 'pending');
    if (nonCorrespondus.length > 0) {
      if (!window.confirm(`${nonCorrespondus.length} élève(s) sans correspondance. Voulez-vous continuer ? Ils seront ignorés.`)) {
        return;
      }
    }
    sauvegarderCorrespondances();
  };

  const sauvegarderCorrespondances = async () => {
    try {
      for (const c of correspondances) {
        if (c.statut === 'auto' || c.statut === 'manuel') {
          const { data: existante } = await supabase
            .from('correspondance_eleves')
            .select('id')
            .eq('classe_personnelle_id', classePersonnelleId)
            .eq('eleve_personnel_nom', c.elevePersonnel.nom)
            .eq('eleve_personnel_prenom', c.elevePersonnel.prenom)
            .maybeSingle();
          
          if (existante) {
            await supabase
              .from('correspondance_eleves')
              .update({
                eleve_officiel_id: c.eleveOfficielId,
                statut: 'active',
                updated_at: new Date().toISOString()
              })
              .eq('id', existante.id);
          } else {
            const { data: userData } = await supabase.auth.getUser();
            await supabase
              .from('correspondance_eleves')
              .insert({
                classe_personnelle_id: classePersonnelleId,
                eleve_personnel_nom: c.elevePersonnel.nom,
                eleve_personnel_prenom: c.elevePersonnel.prenom,
                eleve_personnel_matricule: c.elevePersonnel.matricule,
                eleve_officiel_id: c.eleveOfficielId,
                enseignant_id: userData.user?.id,
                statut: 'active'
              });
          }
        }
      }
      
      window.alert('Correspondances enregistrées');
      onComplete();
    } catch (error) {
      console.error('Error saving correspondences:', error);
      window.alert('Impossible d\'enregistrer les correspondances');
    }
  };

  if (loading) {
    return (
      <Card className="p-6 text-center">
        <div className="w-8 h-8 border-4 border-schoolnet-primary border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-sm text-gray-500">Chargement des élèves...</p>
      </Card>
    );
  }

  return (
    <Card className="p-4 mb-4">
      <h3 className="text-lg font-semibold text-gray-800 mb-1">👥 Étape 2 : Correspondance des élèves</h3>
      <p className="text-sm text-gray-500 mb-4">
        Associez chaque élève personnel à un élève officiel de la classe
      </p>
      
      <button
        onClick={handleAutoCorrespondance}
        className="flex flex-row items-center justify-center gap-2 bg-purple-500 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-purple-600 transition-colors mb-4"
      >
        <Search className="w-4 h-4" />
        Recherche automatique
      </button>
      
      <div className="max-h-[400px] overflow-y-auto">
        {correspondances.map((correspondance) => (
          <div key={correspondance.elevePersonnel.index} className="flex flex-row items-center flex-wrap gap-2 py-2.5 border-b border-gray-100 last:border-0">
            <div className="flex-1 min-w-[120px]">
              <p className="text-sm font-medium text-gray-700">
                {correspondance.elevePersonnel.prenom} {correspondance.elevePersonnel.nom}
              </p>
              {correspondance.elevePersonnel.matricule && (
                <p className="text-xs text-gray-400">Matricule: {correspondance.elevePersonnel.matricule}</p>
              )}
            </div>
            
            <div className="flex-1 min-w-[120px]">
              {correspondance.statut === 'auto' && (
                <div className="flex flex-row items-center gap-1.5">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                  <span className="text-xs text-emerald-600">Auto: {correspondance.eleveOfficielNom}</span>
                </div>
              )}
              {correspondance.statut === 'manuel' && (
                <div className="flex flex-row items-center gap-1.5">
                  <UserCheck className="w-3.5 h-3.5 text-schoolnet-primary" />
                  <span className="text-xs text-schoolnet-primary">Manuel: {correspondance.eleveOfficielNom}</span>
                </div>
              )}
              {correspondance.statut === 'ignore' && (
                <div className="flex flex-row items-center gap-1.5">
                  <XCircle className="w-3.5 h-3.5 text-red-500" />
                  <span className="text-xs text-red-500">Ignoré</span>
                </div>
              )}
              {correspondance.statut === 'pending' && (
                <div className="flex flex-row items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5 text-amber-500" />
                  <span className="text-xs text-amber-500">En attente</span>
                </div>
              )}
            </div>
            
            {correspondance.statut !== 'ignore' && correspondance.statut !== 'auto' && (
              <button
                onClick={() => {
                  setSelectedEleve(correspondance);
                  setModalVisible(true);
                }}
                className="px-3 py-1 bg-blue-50 text-schoolnet-primary text-xs font-medium rounded-md hover:bg-blue-100 transition-colors"
              >
                Modifier
              </button>
            )}
            
            {correspondance.statut !== 'ignore' && correspondance.statut !== 'auto' && (
              <button
                onClick={() => handleIgnorer(correspondance)}
                className="px-3 py-1 bg-red-50 text-red-500 text-xs font-medium rounded-md hover:bg-red-100 transition-colors"
              >
                Ignorer
              </button>
            )}
          </div>
        ))}
      </div>
      
      <button
        onClick={handleValider}
        className="w-full flex flex-row items-center justify-center gap-2 bg-schoolnet-primary text-white py-3.5 rounded-lg text-sm font-medium hover:bg-schoolnet-primary/90 transition-colors mt-4"
      >
        <CheckCircle className="w-4 h-4" />
        Valider les correspondances
      </button>

      {/* Modal de sélection manuelle */}
      {modalVisible && (
        <Portal>
          <div 
            className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
            onClick={() => setModalVisible(false)}
          >
            <div 
              className="bg-white rounded-2xl w-full max-w-md max-h-[80vh] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex flex-row justify-between items-center px-5 py-4 border-b border-gray-200">
                <h4 className="text-lg font-semibold text-gray-800">Choisir un élève officiel</h4>
                <button
                  onClick={() => setModalVisible(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircle className="w-5 h-5" />
                </button>
              </div>
              <div className="p-4">
                <Input
                  value={recherche}
                  onChange={(e) => setRecherche(e.target.value)}
                  placeholder="Rechercher..."
                  className="mb-3"
                />
                <div className="max-h-[300px] overflow-y-auto">
                  {elevesOfficiels
                    .filter(o => 
                      `${o.prenom} ${o.nom}`.toLowerCase().includes(recherche.toLowerCase())
                    )
                    .map(o => (
                      <button
                        key={o.id}
                        onClick={() => handleCorrespondanceManuelle(selectedEleve!, o.id)}
                        className="w-full text-left py-3 px-2 border-b border-gray-100 hover:bg-gray-50 transition-colors"
                      >
                        <p className="text-sm font-medium text-gray-700">{o.prenom} {o.nom}</p>
                        {o.matricule && <p className="text-xs text-gray-400">Matricule: {o.matricule}</p>}
                      </button>
                    ))}
                </div>
                <button
                  onClick={() => setModalVisible(false)}
                  className="w-full py-3 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium text-gray-500 transition-colors mt-3"
                >
                  Fermer
                </button>
              </div>
            </div>
          </div>
        </Portal>
      )}
    </Card>
  );
}
