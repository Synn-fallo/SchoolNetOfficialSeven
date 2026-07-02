// /src/components/classes/ClassePersonnelleDetailModal.tsx
// Modal de détail d'une classe personnelle

import React, { useState, useEffect } from 'react';
import { X, Users, BookOpen, UserPlus, Download, Link2, Building2 } from 'lucide-react';
import { supabase } from '@/lib/supabase.web';
import { useAuth } from '@/contexts/AuthContext';
import { Portal } from '@/components/ui/Portal';
import { Card } from '@/components/ui/Card';
import GestionElevesPersonnels from './GestionElevesPersonnels';
import GestionMatieresPersonnelles from './GestionMatieresPersonnelles';
import RattachementAssistant from './RattachementAssistant';

interface ClassePersonnelleDetailModalProps {
  visible: boolean;
  classeId: string;
  onClose: () => void;
  onRefresh: () => void;
}

type TabType = 'eleves' | 'matieres';

export default function ClassePersonnelleDetailModal({
  visible,
  classeId,
  onClose,
  onRefresh
}: ClassePersonnelleDetailModalProps) {
  const { user, isAffiliated } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>('eleves');
  const [classe, setClasse] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showRattachement, setShowRattachement] = useState(false);

  const peutRattacher = isAffiliated && classe?.rattachee_a === null;

  useEffect(() => {
    if (visible && classeId) {
      loadClasse();
    }
  }, [visible, classeId]);

  if (!visible) return null;

  const loadClasse = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('classes_personnelles')
        .select('*')
        .eq('id', classeId)
        .single();

      if (error) throw error;
      setClasse(data);
    } catch (error) {
      console.error('Error loading class:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    loadClasse();
    onRefresh();
  };

  const handleRattachementSuccess = () => {
    setShowRattachement(false);
    loadClasse();
    onRefresh();
    window.alert('La classe a été rattachée avec succès');
  };

  if (!classe) return null;

  const isRattachee = classe.rattachee_a !== null && classe.rattachee_a !== undefined;

  return (
    <>
      <Portal>
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
            {/* En-tête */}
            <div className="flex flex-row justify-between items-center px-5 py-4 border-b border-gray-200">
              <h3 className="text-xl font-bold text-gray-800">{classe.nom}</h3>
              <div className="flex flex-row items-center gap-3">
                <button
                  onClick={() => {
                    // Export logic
                    window.alert('Export des données lancé');
                  }}
                  className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <Download className="w-5 h-5 text-schoolnet-primary" />
                </button>
                <button
                  onClick={onClose}
                  className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
            </div>

            {/* Description */}
            {classe.description && (
              <div className="px-5 py-3 border-b border-gray-100">
                <p className="text-sm text-gray-600">{classe.description}</p>
              </div>
            )}

            {/* Établissement */}
            {classe.etablissement_nom && (
              <div className="flex flex-row items-center gap-2 px-5 py-2 border-b border-gray-100">
                <Building2 className="w-3.5 h-3.5 text-gray-400" />
                <span className="text-sm text-gray-500">{classe.etablissement_nom}</span>
              </div>
            )}

            {/* Badge de rattachement */}
            {isRattachee && (
              <div className="px-5 py-2 border-b border-gray-100">
                <span className="inline-flex items-center gap-1.5 bg-emerald-100 text-emerald-700 text-xs font-medium px-3 py-1 rounded-full">
                  <Link2 className="w-3 h-3" />
                  Déjà rattachée
                </span>
              </div>
            )}

            {/* Bouton Rattacher */}
            {peutRattacher && !isRattachee && (
              <div className="px-5 py-3 border-b border-gray-100">
                <button
                  onClick={() => setShowRattachement(true)}
                  className="w-full flex flex-row items-center justify-center gap-2 bg-schoolnet-primary text-white py-2.5 rounded-lg text-sm font-medium hover:bg-schoolnet-primary/90 transition-colors"
                >
                  <Link2 className="w-4 h-4" />
                  Rattacher à l'établissement
                </button>
              </div>
            )}

            {/* Onglets */}
            <div className="flex flex-row gap-2 px-5 py-3 border-b border-gray-200 bg-gray-50">
              <button
                onClick={() => setActiveTab('eleves')}
                className={`flex flex-row items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  activeTab === 'eleves'
                    ? 'bg-schoolnet-primary text-white'
                    : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                }`}
              >
                <Users className="w-4 h-4" />
                Élèves ({classe.eleves?.length || 0})
              </button>
              <button
                onClick={() => setActiveTab('matieres')}
                className={`flex flex-row items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  activeTab === 'matieres'
                    ? 'bg-schoolnet-primary text-white'
                    : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                }`}
              >
                <BookOpen className="w-4 h-4" />
                Matières ({classe.matieres?.length || 0})
              </button>
            </div>

            {/* Contenu */}
            <div className="p-4 overflow-y-auto max-h-[50vh]">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-8">
                  <div className="w-8 h-8 border-4 border-schoolnet-primary border-t-transparent rounded-full animate-spin" />
                  <p className="mt-3 text-sm text-gray-500">Chargement...</p>
                </div>
              ) : (
                <>
                  {activeTab === 'eleves' && (
                    <GestionElevesPersonnels
                      classeId={classeId}
                      eleves={classe.eleves || []}
                      onRefresh={handleRefresh}
                    />
                  )}
                  {activeTab === 'matieres' && (
                    <GestionMatieresPersonnelles
                      classeId={classeId}
                      matieres={classe.matieres || []}
                      onRefresh={handleRefresh}
                    />
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </Portal>

      {/* Assistant de rattachement */}
      {showRattachement && (
        <RattachementAssistant
          visible={showRattachement}
          classePersonnelleId={classeId}
          classePersonnelleNom={classe.nom}
          elevesPersonnels={classe.eleves || []}
          onClose={() => setShowRattachement(false)}
          onSuccess={handleRattachementSuccess}
        />
      )}
    </>
  );
}
