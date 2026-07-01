// /src/pages/EnseignantAnnoncesPublier.tsx
// Publication d'annonces

import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase.web';
import { ChevronLeft, Send, Building2, Users, Globe, Pin } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

interface Classe {
  id: string;
  nom: string;
  est_animateur: boolean;
}

export default function EnseignantAnnoncesPublier() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [titre, setTitre] = useState('');
  const [contenu, setContenu] = useState('');
  const [type, setType] = useState<'classe' | 'etablissement'>('classe');
  const [selectedClasseId, setSelectedClasseId] = useState<string>('');
  const [classes, setClasses] = useState<Classe[]>([]);
  const [visibilite, setVisibilite] = useState<'parents' | 'enseignants' | 'tous'>('parents');
  const [estEpingle, setEstEpingle] = useState(false);
  const [dateDebut, setDateDebut] = useState('');
  const [dateFin, setDateFin] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingClasses, setLoadingClasses] = useState(true);

  const chargerClasses = useCallback(async () => {
    if (!user) return;

    try {
      const { data: enseignements, error } = await supabase
        .from('enseignant_classes')
        .select('classe_id')
        .eq('enseignant_id', user.id);

      if (error) throw error;

      const classeIds = enseignements?.map(e => e.classe_id) || [];

      if (classeIds.length === 0) {
        setClasses([]);
        setLoadingClasses(false);
        return;
      }

      const { data: classesData, error: classesError } = await supabase
        .from('classes')
        .select('id, nom, enseignant_principal_id')
        .in('id', classeIds);

      if (classesError) throw classesError;

      const formatted = (classesData || []).map(c => ({
        id: c.id,
        nom: c.nom,
        est_animateur: c.enseignant_principal_id === user.id,
      }));

      setClasses(formatted);
      if (formatted.length > 0 && !selectedClasseId) {
        setSelectedClasseId(formatted[0].id);
      }
    } catch (err) {
      console.error('Erreur chargement classes:', err);
    } finally {
      setLoadingClasses(false);
    }
  }, [user]);

  useEffect(() => {
    chargerClasses();
  }, [chargerClasses]);

  const handleSubmit = async () => {
    if (!titre.trim()) {
      window.alert('Veuillez saisir un titre');
      return;
    }
    if (!contenu.trim()) {
      window.alert('Veuillez saisir le contenu');
      return;
    }
    if (type === 'classe' && !selectedClasseId) {
      window.alert('Veuillez sélectionner une classe');
      return;
    }

    setLoading(true);

    try {
      const insertData: any = {
        titre: titre.trim(),
        contenu: contenu.trim(),
        type: type,
        visibilite: visibilite,
        publie_par_id: user?.id,
        est_publiee: true,
        est_epingle: estEpingle,
        created_at: new Date().toISOString(),
      };

      if (type === 'classe') {
        insertData.classe_id = selectedClasseId;
      } else {
        const { data: etabData } = await supabase
          .from('enseignant_etablissements')
          .select('etablissement_id')
          .eq('enseignant_id', user?.id)
          .maybeSingle();
        
        if (etabData) {
          insertData.etablissement_id = etabData.etablissement_id;
        }
      }

      if (dateDebut) insertData.date_debut = dateDebut;
      if (dateFin) insertData.date_fin = dateFin;

      const { error: insertError } = await supabase
        .from('publications')
        .insert(insertData);

      if (insertError) throw insertError;

      window.alert('L\'annonce a été publiée');
      navigate(-1);
    } catch (err) {
      console.error('Erreur publication:', err);
      window.alert('Impossible de publier l\'annonce');
    } finally {
      setLoading(false);
    }
  };

  const selectedClasse = classes.find(c => c.id === selectedClasseId);
  const peutPublierEtablissement = classes.some(c => c.est_animateur);

  if (loadingClasses) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50">
        <div className="w-10 h-10 border-4 border-schoolnet-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex-1 bg-gray-50">
      <div className="p-4 pb-8 max-w-2xl mx-auto">
        {/* En-tête */}
        <div className="flex flex-row items-center justify-between mb-5">
          <button onClick={() => navigate(-1)} className="p-2 -ml-2">
            <ChevronLeft className="w-6 h-6 text-schoolnet-primary" />
          </button>
          <h1 className="text-lg font-semibold text-gray-800">Publier une annonce</h1>
          <div className="w-10" />
        </div>

        {/* Type d'annonce */}
        <div className="mb-4">
          <label className="text-sm font-medium text-gray-700 block mb-2">Type d'annonce *</label>
          <div className="flex flex-row gap-3">
            <button
              onClick={() => setType('classe')}
              className={`flex-1 flex flex-row items-center justify-center gap-2 py-3 rounded-lg text-sm font-medium transition-colors ${
                type === 'classe'
                  ? 'bg-schoolnet-primary text-white'
                  : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
              }`}
            >
              <Users className="w-4 h-4" />
              Classe
            </button>
            <button
              onClick={() => peutPublierEtablissement && setType('etablissement')}
              disabled={!peutPublierEtablissement}
              className={`flex-1 flex flex-row items-center justify-center gap-2 py-3 rounded-lg text-sm font-medium transition-colors ${
                type === 'etablissement'
                  ? 'bg-schoolnet-primary text-white'
                  : !peutPublierEtablissement
                  ? 'bg-gray-100 text-gray-300 cursor-not-allowed'
                  : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
              }`}
            >
              <Building2 className="w-4 h-4" />
              Établissement
            </button>
          </div>
          {!peutPublierEtablissement && (
            <p className="text-xs text-gray-400 mt-2">
              Seul un Professeur Principal peut publier une annonce pour l'établissement
            </p>
          )}
        </div>

        {/* Sélection de la classe */}
        {type === 'classe' && (
          <div className="mb-4">
            <label className="text-sm font-medium text-gray-700 block mb-2">Classe *</label>
            <div className="flex flex-row flex-wrap gap-2">
              {classes.map((classe) => (
                <button
                  key={classe.id}
                  onClick={() => setSelectedClasseId(classe.id)}
                  className={`flex flex-row items-center gap-2 px-4 py-2 rounded-full text-sm transition-colors ${
                    selectedClasseId === classe.id
                      ? 'bg-schoolnet-primary text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {classe.nom}
                  {classe.est_animateur && (
                    <span className="text-xs font-semibold text-amber-500 bg-white px-1.5 py-0.5 rounded">PP</span>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Titre */}
        <div className="mb-4">
          <label className="text-sm font-medium text-gray-700 block mb-2">Titre *</label>
          <Input
            value={titre}
            onChange={(e) => setTitre(e.target.value)}
            placeholder="Titre de l'annonce"
            maxLength={100}
          />
        </div>

        {/* Contenu */}
        <div className="mb-4">
          <label className="text-sm font-medium text-gray-700 block mb-2">Contenu *</label>
          <textarea
            value={contenu}
            onChange={(e) => setContenu(e.target.value)}
            placeholder="Détail de l'annonce..."
            className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-schoolnet-primary min-h-[120px]"
            rows={6}
          />
        </div>

        {/* Visibilité */}
        <div className="mb-4">
          <label className="text-sm font-medium text-gray-700 block mb-2">Visibilité</label>
          <div className="flex flex-row gap-2">
            {[
              { value: 'parents', label: 'Parents uniquement' },
              { value: 'enseignants', label: 'Enseignants uniquement' },
              { value: 'tous', label: 'Tous' },
            ].map((option) => (
              <button
                key={option.value}
                onClick={() => setVisibilite(option.value as typeof visibilite)}
                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                  visibilite === option.value
                    ? 'bg-schoolnet-primary text-white'
                    : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {/* Options */}
        <div className="mb-6">
          <div className="flex flex-row items-center justify-between py-2">
            <div className="flex flex-row items-center gap-2">
              <Pin className="w-4 h-4 text-schoolnet-primary" />
              <span className="text-sm text-gray-700">Épingler l'annonce</span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={estEpingle}
                onChange={(e) => setEstEpingle(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:ring-2 peer-focus:ring-schoolnet-primary rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-schoolnet-primary" />
            </label>
          </div>
        </div>

        {/* Bouton publication */}
        <button
          onClick={handleSubmit}
          disabled={loading}
          className={`w-full flex flex-row items-center justify-center gap-2 py-3.5 rounded-lg text-sm font-semibold text-white transition-colors ${
            loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-schoolnet-primary hover:bg-schoolnet-primary/90'
          }`}
        >
          {loading ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              <Send className="w-4 h-4" />
              Publier l'annonce
            </>
          )}
        </button>
      </div>
    </div>
  );
}
