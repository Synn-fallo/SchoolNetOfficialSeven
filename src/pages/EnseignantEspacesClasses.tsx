// /src/pages/EnseignantEspacesClasses.tsx
// Espaces de communication des classes

import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase.web';
import { MessageCircle, ChevronRight, Building2, Crown } from 'lucide-react';
import { Card } from '@/components/ui/Card';

interface ClasseCanal {
  id: string;
  classe_id: string;
  classe_nom: string;
  etablissement_id: string;
  etablissement_nom: string;
  est_animateur: boolean;
  canal_id: string | null;
  canal_mode: string | null;
  canal_nom: string | null;
}

export default function EnseignantEspacesClasses() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [classes, setClasses] = useState<ClasseCanal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const chargerClasses = useCallback(async () => {
    if (!user) return;

    setLoading(true);
    setError(null);

    try {
      const { data: enseignements, error: enseignementError } = await supabase
        .from('enseignant_classes')
        .select('classe_id')
        .eq('enseignant_id', user.id);

      if (enseignementError) throw enseignementError;

      if (!enseignements || enseignements.length === 0) {
        setClasses([]);
        setLoading(false);
        return;
      }

      const classeIds = [...new Set(enseignements.map(e => e.classe_id))];

      const { data: classesData, error: classesError } = await supabase
        .from('classes')
        .select(`
          id,
          nom,
          enseignant_principal_id,
          etablissement_id,
          etablissement:etablissement_id (nom),
          canal:canaux_classe (
            id,
            mode,
            nom,
            animateur_id
          )
        `)
        .in('id', classeIds);

      if (classesError) throw classesError;

      const formatted: ClasseCanal[] = [];

      for (const classe of classesData || []) {
        const etablissement = classe.etablissement as any;
        const canal = classe.canal as any;
        const estAnimateur = classe.enseignant_principal_id === user.id;

        if (etablissement) {
          formatted.push({
            id: classe.id,
            classe_id: classe.id,
            classe_nom: classe.nom,
            etablissement_id: classe.etablissement_id,
            etablissement_nom: etablissement.nom,
            est_animateur: estAnimateur,
            canal_id: canal?.id || null,
            canal_mode: canal?.mode || null,
            canal_nom: canal?.nom || null,
          });
        }
      }

      formatted.sort((a, b) => {
        if (a.etablissement_nom !== b.etablissement_nom) {
          return a.etablissement_nom.localeCompare(b.etablissement_nom);
        }
        return a.classe_nom.localeCompare(b.classe_nom);
      });

      setClasses(formatted);
    } catch (err) {
      console.error('Erreur chargement classes:', err);
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    chargerClasses();
  }, [chargerClasses]);

  const handleOpenCanal = (classe: ClasseCanal) => {
    if (!classe.canal_id) {
      return;
    }
    navigate(`/enseignant/canal-classe?canalId=${classe.canal_id}&classeId=${classe.classe_id}&classeNom=${encodeURIComponent(classe.classe_nom)}&estAnimateur=${classe.est_animateur}`);
  };

  const getModeIcon = (mode: string | null) => {
    switch (mode) {
      case 'libre': return { icon: '💬', color: 'text-emerald-600 bg-emerald-50', label: 'Libre' };
      case 'moderation': return { icon: '🛡️', color: 'text-amber-600 bg-amber-50', label: 'Modération' };
      case 'ferme': return { icon: '🔒', color: 'text-red-600 bg-red-50', label: 'Fermé' };
      default: return { icon: '❓', color: 'text-gray-400 bg-gray-50', label: 'Indisponible' };
    }
  };

  // Regrouper par établissement
  const etablissements = classes.reduce((acc, classe) => {
    if (!acc[classe.etablissement_id]) {
      acc[classe.etablissement_id] = {
        nom: classe.etablissement_nom,
        classes: []
      };
    }
    acc[classe.etablissement_id].classes.push(classe);
    return acc;
  }, {} as Record<string, { nom: string; classes: ClasseCanal[] }>);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50 p-5">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-schoolnet-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="mt-3 text-sm text-gray-500">Chargement de vos espaces...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50 p-5">
        <div className="text-center">
          <p className="text-red-500 font-medium">Une erreur est survenue</p>
          <p className="text-sm text-gray-500 mt-1">{error}</p>
          <button
            onClick={chargerClasses}
            className="mt-4 bg-schoolnet-primary text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-schoolnet-primary/90 transition-colors"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  if (classes.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50 p-5">
        <div className="text-center">
          <MessageCircle className="w-16 h-16 text-gray-300 mx-auto" />
          <h3 className="text-xl font-semibold text-gray-700 mt-4">Aucun espace classe</h3>
          <p className="text-sm text-gray-500 mt-2">
            Vous n'êtes pas encore assigné à une classe.
          </p>
          <p className="text-xs text-gray-400 mt-1">
            Les espaces de communication apparaîtront ici une fois que vous serez rattaché à des classes.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-gray-50">
      {/* En-tête */}
      <div className="bg-white px-5 py-5 border-b border-gray-200">
        <h1 className="text-2xl font-bold text-gray-800">Espace classes</h1>
        <p className="text-sm text-gray-500">Communication avec les parents</p>
      </div>

      <div className="p-4 max-w-3xl mx-auto">
        {Object.entries(etablissements).map(([etabId, etab]) => (
          <div key={etabId} className="mb-6">
            <div className="flex flex-row items-center gap-2 mb-3">
              <Building2 className="w-4 h-4 text-schoolnet-primary" />
              <h3 className="text-sm font-semibold text-schoolnet-primary">{etab.nom}</h3>
            </div>

            {etab.classes.map((classe) => {
              const mode = getModeIcon(classe.canal_mode);
              const isActive = classe.canal_id !== null && classe.canal_mode !== 'ferme';
              const isPP = classe.est_animateur;
              
              return (
                <button
                  key={classe.id}
                  onClick={() => handleOpenCanal(classe)}
                  disabled={!isActive}
                  className={`
                    w-full text-left bg-white rounded-xl p-4 mb-3 border border-gray-200 transition-shadow
                    ${isActive ? 'hover:shadow-md' : 'opacity-60 cursor-not-allowed'}
                  `}
                >
                  <div className="flex flex-row justify-between items-start mb-3">
                    <div className="flex flex-row items-center gap-2">
                      <span className="text-base font-semibold text-gray-800">{classe.classe_nom}</span>
                      {isPP && (
                        <span className="flex flex-row items-center gap-1 bg-amber-50 text-amber-500 text-xs font-semibold px-2 py-0.5 rounded-full">
                          <Crown className="w-3 h-3" />
                          PP
                        </span>
                      )}
                    </div>
                    <span className={`flex flex-row items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${mode.color}`}>
                      <span>{mode.icon}</span>
                      {mode.label}
                    </span>
                  </div>

                  <div className="flex flex-row justify-between items-center pt-3 border-t border-gray-100">
                    {isActive ? (
                      <>
                        <div>
                          <p className="text-xs text-gray-400">
                            {isPP ? 'Professeur Principal 🛡️' : 'Enseignant'}
                          </p>
                          <p className="text-sm text-schoolnet-primary font-medium">{classe.canal_nom || 'Canal de la classe'}</p>
                        </div>
                        <ChevronRight className="w-4 h-4 text-schoolnet-primary" />
                      </>
                    ) : (
                      <p className="text-sm text-gray-400">
                        {!classe.canal_id ? 'Aucun canal actif' : 'Canal fermé'}
                      </p>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
