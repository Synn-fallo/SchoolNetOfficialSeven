import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAnnonces } from '@/hooks/useAnnonces';
import AnnonceCard from '@/components/communication/AnnonceCard';
import { ChevronLeft, Megaphone } from 'lucide-react';

export default function ParentAnnoncesScreen() {
  const navigate = useNavigate();
  const { annonces, loading, error, refetch } = useAnnonces();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  // Regrouper par type
  const annoncesEtablissement = annonces.filter(a => a.type === 'etablissement');
  const annoncesClasse = annonces.filter(a => a.type === 'classe');
  const hasAnnonces = annoncesEtablissement.length > 0 || annoncesClasse.length > 0;

  if (loading && !refreshing) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-[300px] p-6">
        <div className="w-8 h-8 border-4 border-schoolnet-primary border-t-transparent rounded-full animate-spin" />
        <p className="mt-3 text-sm text-gray-500">Chargement des annonces...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-[300px] p-6">
        <p className="text-lg font-semibold text-red-500">Une erreur est survenue</p>
        <p className="mt-2 text-sm text-gray-500 text-center">{error}</p>
        <button
          onClick={refetch}
          className="mt-5 px-5 py-2.5 bg-schoolnet-primary text-white rounded-lg font-medium hover:bg-schoolnet-primary-light transition-colors"
        >
          Réessayer
        </button>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-gray-50 min-h-screen">
      <div className="max-w-4xl mx-auto px-4 py-4">
        {/* Header */}
        <div className="flex items-center justify-between bg-white px-4 py-4 -mx-4 border-b border-gray-200 mb-4">
          <button
            onClick={() => navigate(-1)}
            className="p-2 -ml-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <ChevronLeft size={24} className="text-schoolnet-primary" />
          </button>
          <h1 className="text-lg font-semibold text-gray-900">Annonces</h1>
          <div className="w-10" />
        </div>

        {!hasAnnonces ? (
          <div className="flex flex-col items-center py-16 px-8">
            <Megaphone size={48} className="text-gray-300" />
            <h3 className="mt-4 text-lg font-semibold text-gray-900">Aucune annonce</h3>
            <p className="mt-2 text-sm text-gray-500 text-center">
              Aucune annonce n'a été publiée pour les classes de vos enfants.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {annoncesEtablissement.length > 0 && (
              <div>
                <h2 className="text-base font-semibold text-gray-900 mb-3 px-1">🏫 Annonces de l'établissement</h2>
                {annoncesEtablissement.map((annonce) => (
                  <AnnonceCard
                    key={annonce.id}
                    annonce={annonce}
                    onRefresh={onRefresh}
                  />
                ))}
              </div>
            )}

            {annoncesClasse.length > 0 && (
              <div>
                <h2 className="text-base font-semibold text-gray-900 mb-3 px-1">📚 Annonces de votre classe</h2>
                {annoncesClasse.map((annonce) => (
                  <AnnonceCard
                    key={annonce.id}
                    annonce={annonce}
                    onRefresh={onRefresh}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
