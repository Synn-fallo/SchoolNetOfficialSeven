import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase.web';
import { Card } from '@/components/ui/Card';
import RequestStatus from '@/components/institution/RequestStatus';
import AdminRequestReview from '@/components/institution/AdminRequestReview';
import SearchBar from '@/components/public/SearchBar';
import { Filter, RefreshCw } from 'lucide-react';

interface DemandePartenariat {
  id: string;
  organisation_nom: string;
  type_partenaire: string;
  type_collaboration: string;
  contact_nom: string;
  contact_email: string;
  contact_telephone: string;
  proposition: string;
  statut: 'en_attente' | 'en_cours' | 'valide' | 'rejete' | 'annule';
  created_at: string;
  demandeur_id: string;
  demandeur_nom?: string;
  demandeur_prenom?: string;
}

type StatutFiltre = 'tous' | 'en_attente' | 'en_cours' | 'valide' | 'rejete' | 'annule';

const STATUT_FILTRES: { label: string; value: StatutFiltre }[] = [
  { label: 'Tous', value: 'tous' },
  { label: 'En attente', value: 'en_attente' },
  { label: 'En cours', value: 'en_cours' },
  { label: 'Validé', value: 'valide' },
  { label: 'Rejeté', value: 'rejete' },
  { label: 'Annulé', value: 'annule' },
];

export default function AdminDemandesPartenariats() {
  const { hasRole, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [demandes, setDemandes] = useState<DemandePartenariat[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statutFiltre, setStatutFiltre] = useState<StatutFiltre>('tous');
  const [selectedDemande, setSelectedDemande] = useState<DemandePartenariat | null>(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);

  useEffect(() => {
    if (!authLoading && !hasRole('admin')) {
      navigate('/app');
    }
  }, [authLoading, hasRole, navigate]);

  useEffect(() => {
    fetchDemandes();
  }, [statutFiltre]);

  const fetchDemandes = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('demandes_partenariat')
        .select(`
          *,
          profiles:demandeur_id (
            nom,
            prenom
          )
        `)
        .order('created_at', { ascending: false });

      if (statutFiltre !== 'tous') {
        query = query.eq('statut', statutFiltre);
      }

      const { data, error } = await query;

      if (error) throw error;

      const formattedData = (data || []).map((item: any) => ({
        ...item,
        demandeur_nom: item.profiles?.nom,
        demandeur_prenom: item.profiles?.prenom,
      }));

      setDemandes(formattedData);
    } catch (error) {
      console.error('Error fetching demandes:', error);
      alert('❌ Impossible de charger les demandes');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchDemandes();
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleSelectDemande = (demande: DemandePartenariat) => {
    setSelectedDemande(demande);
    setShowReviewModal(true);
  };

  const handleProcessed = () => {
    setShowReviewModal(false);
    setSelectedDemande(null);
    fetchDemandes();
  };

  const filteredDemandes = demandes.filter((demande) => {
    if (!searchQuery) return true;
    return demande.organisation_nom.toLowerCase().includes(searchQuery.toLowerCase()) ||
           demande.contact_nom.toLowerCase().includes(searchQuery.toLowerCase()) ||
           demande.contact_email.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatutCount = (statut: StatutFiltre) => {
    if (statut === 'tous') return demandes.length;
    return demandes.filter(d => d.statut === statut).length;
  };

  const getTypePartenaireLabel = (type: string) => {
    const labels: Record<string, string> = {
      ong: 'ONG',
      operateur_telecom: 'Opérateur télécom',
      editeur: 'Éditeur',
      sponsor: 'Sponsor',
      autre: 'Autre',
    };
    return labels[type] || type;
  };

  if (authLoading || (loading && !refreshing)) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex-1 bg-slate-50 overflow-y-auto">
      {/* Header */}
      <div className="bg-white px-4 pt-5 pb-4 border-b border-slate-200">
        <h2 className="text-2xl font-bold text-slate-800 mb-1">Demandes de partenariat</h2>
        <p className="text-sm text-slate-500">Gérez les demandes de partenariat avec SchoolNet</p>
      </div>

      {/* Barre de recherche et filtres */}
      <div className="bg-white px-4 py-3 border-b border-slate-200">
        <div className="flex items-center gap-2">
          <SearchBar
            onSearch={handleSearch}
            placeholder="Rechercher par organisation, contact..."
            value={searchQuery}
          />
          <button
            onClick={() => setShowFilterModal(true)}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg text-sm font-medium transition-colors whitespace-nowrap"
          >
            <Filter className="h-4 w-4" />
            <span>Filtres</span>
          </button>
          <button
            onClick={handleRefresh}
            className="p-2 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
            aria-label="Rafraîchir"
          >
            <RefreshCw className="h-4 w-4 text-blue-600" />
          </button>
        </div>

        {/* Badges de filtres rapides */}
        <div className="flex gap-2 mt-3 overflow-x-auto pb-1">
          {STATUT_FILTRES.map((filtre) => (
            <button
              key={filtre.value}
              onClick={() => setStatutFiltre(filtre.value)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                statutFiltre === filtre.value
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {filtre.label} ({getStatutCount(filtre.value)})
            </button>
          ))}
        </div>
      </div>

      {/* Liste des demandes */}
      <div className="p-4 space-y-3">
        {filteredDemandes.length === 0 ? (
          <div className="flex items-center justify-center py-12">
            <p className="text-sm text-slate-400">Aucune demande trouvée</p>
          </div>
        ) : (
          filteredDemandes.map((item) => (
            <button
              key={item.id}
              onClick={() => handleSelectDemande(item)}
              className="w-full text-left"
            >
              <Card className="p-4">
                <div className="flex justify-between items-start mb-1.5">
                  <h4 className="text-sm font-semibold text-slate-800">{item.organisation_nom}</h4>
                  <RequestStatus status={item.statut} />
                </div>
                <p className="text-sm text-slate-500 mb-1">Type: {getTypePartenaireLabel(item.type_partenaire)}</p>
                <p className="text-xs text-slate-400 mb-0.5">👤 {item.contact_nom}</p>
                <p className="text-xs text-slate-400 mb-0.5">📧 {item.contact_email}</p>
                <p className="text-xs text-slate-400">📞 {item.contact_telephone}</p>
                <div className="flex justify-between items-center mt-3 pt-2 border-t border-slate-100">
                  <span className="text-xs text-slate-500">
                    Demandeur: {item.demandeur_prenom} {item.demandeur_nom}
                  </span>
                  <span className="text-xs text-slate-400">{formatDate(item.created_at)}</span>
                </div>
              </Card>
            </button>
          ))
        )}
      </div>

      {/* Modal de filtres avancés */}
      {showFilterModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-end justify-center">
          <div className="bg-white w-full max-w-md rounded-t-2xl shadow-2xl p-5">
            <h4 className="text-lg font-semibold text-slate-800 text-center mb-4">Filtrer par statut</h4>
            {STATUT_FILTRES.map((filtre) => (
              <button
                key={filtre.value}
                onClick={() => {
                  setStatutFiltre(filtre.value);
                  setShowFilterModal(false);
                }}
                className="w-full flex justify-between items-center py-3.5 border-b border-slate-50 last:border-0 text-left"
              >
                <span className={`text-sm ${statutFiltre === filtre.value ? 'text-blue-600 font-medium' : 'text-slate-700'}`}>
                  {filtre.label}
                </span>
                {statutFiltre === filtre.value && (
                  <span className="text-blue-600 font-medium">✓</span>
                )}
              </button>
            ))}
            <button
              onClick={() => setShowFilterModal(false)}
              className="w-full mt-4 py-3 text-center text-sm font-medium text-slate-500 border-t border-slate-100"
            >
              Fermer
            </button>
          </div>
        </div>
      )}

      {/* Modal de revue de demande */}
      {selectedDemande && showReviewModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-2xl max-h-[90vh] rounded-2xl shadow-2xl overflow-hidden flex flex-col">
            <div className="flex-1 overflow-y-auto">
              <AdminRequestReview
                request={selectedDemande}
                type="partenariat"
                onProcessed={handleProcessed}
                onClose={() => setShowReviewModal(false)}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
