// /src/components/enseignant/SelectionEvaluations.tsx
// Sélection des évaluations à transférer

import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, AlertCircle, Send } from 'lucide-react';
import { supabase } from '@/lib/supabase.web';
import { Card } from '@/components/ui/Card';
import { Checkbox } from '@/components/ui/Checkbox';

interface SelectionEvaluationsProps {
  classePersonnelleId: string;
  classeOfficielleId: string;
  matiereOfficielleId: string;
  onTransfertComplete: (rapport: any) => void;
  setTransfertEnCours: (loading: boolean) => void;
}

interface Evaluation {
  id: string;
  type: 'interrogation' | 'devoir';
  titre: string;
  date: string;
  note_sur: number;
  coefficient: number;
  selected: boolean;
}

export default function SelectionEvaluations({
  classePersonnelleId,
  classeOfficielleId,
  matiereOfficielleId,
  onTransfertComplete,
  setTransfertEnCours,
}: SelectionEvaluationsProps) {
  const [loading, setLoading] = useState(true);
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);

  useEffect(() => {
    loadEvaluations();
  }, []);

  const loadEvaluations = async () => {
    setLoading(true);
    try {
      // Récupérer la classe personnelle
      const { data: classePerso, error: err1 } = await supabase
        .from('classes_personnelles')
        .select('eleves, matieres')
        .eq('id', classePersonnelleId)
        .single();
      
      if (err1) throw err1;
      
      // Ici, récupérer les devoirs personnels de l'enseignant
      // Pour l'exemple, on simule des évaluations
      const evaluationsSimulees: Evaluation[] = [
        {
          id: 'inter1',
          type: 'interrogation',
          titre: 'Interrogation 1',
          date: '2026-04-10',
          note_sur: 20,
          coefficient: 1,
          selected: false
        },
        {
          id: 'inter2',
          type: 'interrogation',
          titre: 'Interrogation 2',
          date: '2026-04-17',
          note_sur: 20,
          coefficient: 1,
          selected: false
        },
        {
          id: 'devoir1',
          type: 'devoir',
          titre: 'Devoir 1',
          date: '2026-04-24',
          note_sur: 20,
          coefficient: 2,
          selected: false
        }
      ];
      
      setEvaluations(evaluationsSimulees);
    } catch (error) {
      console.error('Error loading evaluations:', error);
      window.alert('Impossible de charger les évaluations');
    } finally {
      setLoading(false);
    }
  };

  const toggleSelection = (id: string) => {
    setEvaluations(prev => 
      prev.map(e => e.id === id ? { ...e, selected: !e.selected } : e)
    );
  };

  const toggleAll = () => {
    const allSelected = evaluations.every(e => e.selected);
    setEvaluations(prev => prev.map(e => ({ ...e, selected: !allSelected })));
  };

  const handleTransfert = async () => {
    const selected = evaluations.filter(e => e.selected);
    if (selected.length === 0) {
      window.alert('Veuillez sélectionner au moins une évaluation');
      return;
    }
    
    setTransfertEnCours(true);
    
    try {
      const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
      const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;
      
      const response = await fetch(`${SUPABASE_URL}/functions/v1/transferer-notes-bloc`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({
          classe_personnelle_id: classePersonnelleId,
          classe_officielle_id: classeOfficielleId,
          matiere_officielle_id: matiereOfficielleId,
          evaluations: selected.map(e => ({
            id: e.id,
            type: e.type,
            titre: e.titre,
            date: e.date,
            note_sur: e.note_sur,
            coefficient: e.coefficient
          }))
        })
      });
      
      const result = await response.json();
      
      if (result.success) {
        onTransfertComplete(result.rapport);
      } else {
        window.alert(result.error || 'Le transfert a échoué');
        setTransfertEnCours(false);
      }
    } catch (error) {
      console.error('Error during transfer:', error);
      window.alert('Impossible de transférer les notes');
      setTransfertEnCours(false);
    }
  };

  if (loading) {
    return (
      <Card className="p-6 text-center">
        <div className="w-8 h-8 border-4 border-schoolnet-primary border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-sm text-gray-500">Chargement des évaluations...</p>
      </Card>
    );
  }

  const selectedCount = evaluations.filter(e => e.selected).length;

  return (
    <Card className="p-4 mb-4">
      <h3 className="text-lg font-semibold text-gray-800 mb-1">📝 Étape 3 : Sélectionnez les évaluations à transférer</h3>
      <p className="text-sm text-gray-500 mb-4">
        Choisissez les interrogations et devoirs à transférer vers l'établissement
      </p>
      
      <button
        onClick={toggleAll}
        className="text-sm text-schoolnet-primary font-medium hover:underline ml-auto block mb-3"
      >
        {evaluations.every(e => e.selected) ? 'Tout désélectionner' : 'Tout sélectionner'}
      </button>
      
      <div className="max-h-[400px] overflow-y-auto">
        {evaluations.map((evaluation) => (
          <div key={evaluation.id} className="flex flex-row items-start gap-3 py-3 border-b border-gray-100 last:border-0">
            <Checkbox
              checked={evaluation.selected}
              onCheckedChange={() => toggleSelection(evaluation.id)}
              className="mt-1"
            />
            <div className="flex-1">
              <div className="flex flex-row justify-between items-center mb-0.5">
                <span className="text-xs font-medium text-schoolnet-primary">
                  {evaluation.type === 'interrogation' ? '📖 Interrogation' : '📝 Devoir'}
                </span>
                <span className="text-xs text-gray-400">
                  {new Date(evaluation.date).toLocaleDateString('fr-FR')}
                </span>
              </div>
              <p className="text-sm font-medium text-gray-700">{evaluation.titre}</p>
              <p className="text-xs text-gray-400">
                Note sur {evaluation.note_sur} • Coefficient {evaluation.coefficient}
              </p>
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-4 pt-3 border-t border-gray-100 text-center">
        <p className="text-sm font-medium text-gray-700">
          {selectedCount} évaluation(s) sélectionnée(s)
        </p>
      </div>
      
      <button
        onClick={handleTransfert}
        disabled={selectedCount === 0}
        className={`
          w-full flex flex-row items-center justify-center gap-2 py-3.5 rounded-lg text-sm font-semibold text-white mt-4 transition-colors
          ${selectedCount === 0
            ? 'bg-gray-300 cursor-not-allowed'
            : 'bg-emerald-500 hover:bg-emerald-600'
          }
        `}
      >
        <Send className="w-4 h-4" />
        Transférer les notes
      </button>
    </Card>
  );
}
