// /src/pages/EnseignantRendezVousForm.tsx
// Formulaire de création de rendez-vous

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase.web';
import { ChevronLeft, Calendar, Clock, User } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

export default function EnseignantRendezVousForm() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [parentNom, setParentNom] = useState('');
  const [parentPrenom, setParentPrenom] = useState('');
  const [eleveNom, setEleveNom] = useState('');
  const [elevePrenom, setElevePrenom] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [heure, setHeure] = useState('09:00');
  const [motif, setMotif] = useState('');
  const [lieu, setLieu] = useState('Salle des professeurs');
  const [sending, setSending] = useState(false);

  const handleSubmit = async () => {
    if (!parentNom.trim() || !parentPrenom.trim()) {
      window.alert('Veuillez saisir le nom et prénom du parent');
      return;
    }
    if (!motif.trim()) {
      window.alert('Veuillez saisir un motif');
      return;
    }

    setSending(true);

    try {
      const { data: parents, error: parentError } = await supabase
        .from('parents')
        .select('id')
        .ilike('nom', parentNom)
        .ilike('prenom', parentPrenom)
        .limit(1);

      if (parentError || !parents || parents.length === 0) {
        window.alert('Parent non trouvé. Vérifiez le nom et prénom.');
        setSending(false);
        return;
      }

      const parentId = parents[0].id;

      let eleveId = null;
      if (eleveNom.trim() && elevePrenom.trim()) {
        const { data: eleves, error: eleveError } = await supabase
          .from('eleves')
          .select('id')
          .ilike('nom', eleveNom)
          .ilike('prenom', elevePrenom)
          .limit(1);

        if (!eleveError && eleves && eleves.length > 0) {
          eleveId = eleves[0].id;
        }
      }

      const heureFin = `${parseInt(heure.split(':')[0]) + 1}:${heure.split(':')[1]}`;

      const { error: insertError } = await supabase
        .from('rendez_vous')
        .insert({
          parent_id: parentId,
          enseignant_id: user?.id,
          eleve_id: eleveId,
          date_rdv: date,
          heure_debut: heure,
          heure_fin: heureFin,
          motif: motif,
          statut: 'en_attente',
          lieu: lieu,
        });

      if (insertError) throw insertError;

      window.alert('La demande de rendez-vous a été envoyée au parent.');
      navigate(-1);
    } catch (err) {
      console.error('Erreur:', err);
      window.alert('Impossible de créer le rendez-vous');
    } finally {
      setSending(false);
    }
  };

  const HEURES_DISPONIBLES = ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00'];

  return (
    <div className="flex-1 bg-gray-50">
      <div className="p-4 pb-8 max-w-2xl mx-auto">
        {/* En-tête */}
        <div className="flex flex-row items-center justify-between mb-5">
          <button onClick={() => navigate(-1)} className="p-2 -ml-2">
            <ChevronLeft className="w-6 h-6 text-schoolnet-primary" />
          </button>
          <h1 className="text-lg font-semibold text-gray-800">Nouveau rendez-vous</h1>
          <div className="w-10" />
        </div>

        {/* Parent */}
        <div className="mb-4">
          <label className="text-sm font-medium text-gray-700 block mb-2">Parent *</label>
          <div className="flex flex-row gap-3">
            <Input
              value={parentNom}
              onChange={(e) => setParentNom(e.target.value)}
              placeholder="Nom"
              className="flex-1"
            />
            <Input
              value={parentPrenom}
              onChange={(e) => setParentPrenom(e.target.value)}
              placeholder="Prénom"
              className="flex-1"
            />
          </div>
        </div>

        {/* Élève (optionnel) */}
        <div className="mb-4">
          <label className="text-sm font-medium text-gray-700 block mb-2">Élève (optionnel)</label>
          <div className="flex flex-row gap-3">
            <Input
              value={eleveNom}
              onChange={(e) => setEleveNom(e.target.value)}
              placeholder="Nom"
              className="flex-1"
            />
            <Input
              value={elevePrenom}
              onChange={(e) => setElevePrenom(e.target.value)}
              placeholder="Prénom"
              className="flex-1"
            />
          </div>
        </div>

        {/* Date */}
        <div className="mb-4">
          <label className="text-sm font-medium text-gray-700 block mb-2">Date *</label>
          <Input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            min={new Date().toISOString().split('T')[0]}
          />
        </div>

        {/* Heure */}
        <div className="mb-4">
          <label className="text-sm font-medium text-gray-700 block mb-2">Heure *</label>
          <div className="flex flex-row flex-wrap gap-2">
            {HEURES_DISPONIBLES.map((h) => (
              <button
                key={h}
                onClick={() => setHeure(h)}
                className={`flex flex-row items-center gap-1.5 px-4 py-2 rounded-full text-sm transition-colors ${
                  heure === h
                    ? 'bg-schoolnet-primary text-white'
                    : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                }`}
              >
                <Clock className="w-3.5 h-3.5" />
                {h}
              </button>
            ))}
          </div>
        </div>

        {/* Lieu */}
        <div className="mb-4">
          <label className="text-sm font-medium text-gray-700 block mb-2">Lieu</label>
          <Input
            value={lieu}
            onChange={(e) => setLieu(e.target.value)}
            placeholder="Salle des professeurs, bureau, etc."
          />
        </div>

        {/* Motif */}
        <div className="mb-6">
          <label className="text-sm font-medium text-gray-700 block mb-2">Motif *</label>
          <textarea
            value={motif}
            onChange={(e) => setMotif(e.target.value)}
            placeholder="Décrivez le motif du rendez-vous..."
            className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-schoolnet-primary min-h-[100px]"
            rows={4}
          />
        </div>

        {/* Bouton */}
        <button
          onClick={handleSubmit}
          disabled={sending}
          className={`w-full py-3.5 rounded-lg text-sm font-semibold text-white transition-colors ${
            sending ? 'bg-gray-400 cursor-not-allowed' : 'bg-schoolnet-primary hover:bg-schoolnet-primary/90'
          }`}
        >
          {sending ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto" />
          ) : (
            'Envoyer la demande'
          )}
        </button>
      </div>
    </div>
  );
}
