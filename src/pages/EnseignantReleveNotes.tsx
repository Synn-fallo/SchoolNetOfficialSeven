// /src/pages/EnseignantReleveNotes.tsx
// Relevé de notes

import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useReleveNotes } from '@/hooks/useReleveNotes';
import { supabase } from '@/lib/supabase.web';
import ReleveNotesView from '@/components/enseignant/ReleveNotesView';

interface Eleve {
  id: string;
  nom: string;
  prenom: string;
  matricule?: string;
}

export default function EnseignantReleveNotes() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const eleveId = searchParams.get('eleveId') || '';
  const eleveNom = searchParams.get('eleveNom') || '';
  const elevePrenom = searchParams.get('elevePrenom') || '';
  const classeId = searchParams.get('classeId') || '';
  const classeNom = searchParams.get('classeNom') || '';
  const type = (searchParams.get('type') as 'officielle' | 'personnelle') || 'officielle';

  const [currentEleveId, setCurrentEleveId] = useState(eleveId);
  const [currentEleveNom, setCurrentEleveNom] = useState(eleveNom);
  const [currentElevePrenom, setCurrentElevePrenom] = useState(elevePrenom);
  const [elevesList, setElevesList] = useState<Eleve[]>([]);
  const [loadingEleves, setLoadingEleves] = useState(true);
  const [hideError, setHideError] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const { releve, loading, error, selectedPeriode, setSelectedPeriode, refresh } = useReleveNotes({
    eleveId: currentEleveId || eleveId,
    classeId: classeId,
    type: type || 'officielle',
  });

  const displayError = error || localError;

  const handlePeriodeChange = async (newPeriode: string) => {
    if (newPeriode === selectedPeriode) return;

    let hasData = false;
    try {
      if (type === 'officielle') {
        const { data } = await supabase
          .from('devoirs')
          .select('id', { count: 'exact', head: true })
          .eq('classe_id', classeId)
          .eq('periode', newPeriode);
        hasData = (data?.length || 0) > 0;
      } else {
        const { data } = await supabase
          .from('devoirs')
          .select('id', { count: 'exact', head: true })
          .eq('classe_personnelle_id', classeId)
          .eq('periode', newPeriode);
        hasData = (data?.length || 0) > 0;
      }
    } catch (err) {
      hasData = false;
    }

    if (hasData) {
      setSelectedPeriode(newPeriode);
      setHideError(false);
      setLocalError(null);
    } else {
      setLocalError(`Aucune note pour la période ${newPeriode}`);
      setHideError(false);
    }
  };

  useEffect(() => {
    const loadElevesList = async () => {
      if (!classeId) return;
      setLoadingEleves(true);
      
      try {
        if (type === 'officielle') {
          const { data, error } = await supabase
            .from('eleves')
            .select('id, nom, prenom, matricule')
            .eq('classe_id', classeId)
            .order('nom', { ascending: true });
          
          if (error) throw error;
          setElevesList(data || []);
        } else {
          const { data, error } = await supabase
            .from('classes_personnelles')
            .select('eleves')
            .eq('id', classeId)
            .single();
          
          if (error) throw error;
          
          const formattedEleves = (data?.eleves || []).map((e: any, idx: number) => ({
            id: e.id || `temp_${idx}`,
            nom: e.nom,
            prenom: e.prenom,
            matricule: e.matricule,
          }));
          setElevesList(formattedEleves);
        }
      } catch (err) {
        console.error('Error loading students list:', err);
      } finally {
        setLoadingEleves(false);
      }
    };
    
    loadElevesList();
  }, [classeId, type]);

  const handleEleveChange = (newEleveId: string, newEleveNom: string, newElevePrenom: string) => {
    setCurrentEleveId(newEleveId);
    setCurrentEleveNom(newEleveNom);
    setCurrentElevePrenom(newElevePrenom);
  };

  const handleCreateEvaluation = () => {
    if (type === 'officielle') {
      navigate(`/enseignant/notes?classeId=${classeId}`);
    } else {
      navigate(`/enseignant/notes?classePersonnelleId=${classeId}`);
    }
  };

  if (loading || loadingEleves) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50 p-5">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-schoolnet-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="mt-3 text-sm text-gray-500">Chargement...</p>
        </div>
      </div>
    );
  }

  if (displayError && !hideError) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50 p-5">
        <div className="bg-white rounded-2xl p-6 text-center max-w-md border border-gray-200">
          <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">📭</span>
          </div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Aucune note disponible</h3>
          <p className="text-sm text-gray-500 mb-6">
            {displayError === 'Aucune note pour cette période' || displayError?.includes('Aucune note')
              ? "Il n'y a pas encore de notes pour cette période."
              : displayError}
          </p>
          <div className="flex flex-row gap-3 mb-3">
            <button
              onClick={() => navigate(-1)}
              className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium text-schoolnet-primary transition-colors"
            >
              ← Retour
            </button>
            <button
              onClick={() => setHideError(true)}
              className="flex-1 py-2.5 bg-schoolnet-primary hover:bg-schoolnet-primary/90 rounded-lg text-sm font-medium text-white transition-colors"
            >
              OK
            </button>
          </div>
          <button
            onClick={handleCreateEvaluation}
            className="w-full py-2.5 bg-white border border-schoolnet-primary text-schoolnet-primary rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
          >
            + Créer une évaluation
          </button>
        </div>
      </div>
    );
  }

  if (!releve) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50 p-5">
        <p className="text-sm text-gray-400">Aucune donnée disponible</p>
      </div>
    );
  }

  return (
    <ReleveNotesView
      releve={releve}
      eleveNom={currentEleveNom || eleveNom}
      elevePrenom={currentElevePrenom || elevePrenom}
      classeNom={classeNom}
      classeId={classeId}
      type={type || 'officielle'}
      selectedPeriode={selectedPeriode}
      onPeriodeChange={handlePeriodeChange}
      onRefresh={refresh}
      elevesList={elevesList}
      onEleveChange={handleEleveChange}
      currentEleveId={currentEleveId || eleveId}
      onCreateEvaluation={handleCreateEvaluation}
    />
  );
}
