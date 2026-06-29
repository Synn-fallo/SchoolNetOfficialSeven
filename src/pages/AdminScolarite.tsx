import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase.web';
import { Card } from '@/components/ui/Card';
import { Users, DollarSign, FileText, Download, Plus, ChevronRight } from 'lucide-react';

interface Statistiques {
  totalEleves: number;
  totalInscriptions: number;
  totalPaiements: number;
  montantTotal: number;
  montantRecu: number;
}

export default function AdminScolarite() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [stats, setStats] = useState<Statistiques>({
    totalEleves: 0,
    totalInscriptions: 0,
    totalPaiements: 0,
    montantTotal: 0,
    montantRecu: 0,
  });
  const [loading, setLoading] = useState(true);
  const [etablissementId, setEtablissementId] = useState<string | null>(null);

  useEffect(() => {
    fetchEtablissementId();
  }, [user]);

  useEffect(() => {
    if (etablissementId) {
      fetchStats();
    }
  }, [etablissementId]);

  const fetchEtablissementId = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('etablissement_id')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .limit(1);

      if (error) throw error;
      if (data && data.length > 0) {
        setEtablissementId(data[0].etablissement_id);
      }
    } catch (error) {
      console.error('Error fetching etablissement:', error);
    }
  };

  const fetchStats = async () => {
    if (!etablissementId) return;

    setLoading(true);
    try {
      // Compter les élèves
      const { count: elevesCount } = await supabase
        .from('eleves')
        .select('*', { count: 'exact', head: true })
        .eq('etablissement_id', etablissementId);

      // Compter les inscriptions
      const { count: inscriptionsCount } = await supabase
        .from('inscriptions')
        .select('*', { count: 'exact', head: true })
        .eq('etablissement_id', etablissementId);

      // Calculer les paiements
      const { data: paiements } = await supabase
        .from('paiements')
        .select('montant')
        .eq('etablissement_id', etablissementId);

      const montantRecu = paiements?.reduce((sum, p) => sum + (p.montant || 0), 0) || 0;

      setStats({
        totalEleves: elevesCount || 0,
        totalInscriptions: inscriptionsCount || 0,
        totalPaiements: paiements?.length || 0,
        montantTotal: 0,
        montantRecu: montantRecu,
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
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
        <h2 className="text-2xl font-bold text-slate-800 mb-1">Gestion de la scolarité</h2>
        <p className="text-sm text-slate-500">Suivez les inscriptions, paiements et statistiques</p>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4">
        <Card className="p-4 text-center">
          <Users className="h-7 w-7 text-blue-600 mx-auto" />
          <p className="text-2xl font-bold text-slate-800 mt-2">{stats.totalEleves}</p>
          <p className="text-xs text-slate-400">Élèves inscrits</p>
        </Card>
        <Card className="p-4 text-center">
          <FileText className="h-7 w-7 text-blue-600 mx-auto" />
          <p className="text-2xl font-bold text-slate-800 mt-2">{stats.totalInscriptions}</p>
          <p className="text-xs text-slate-400">Inscriptions</p>
        </Card>
        <Card className="p-4 text-center">
          <DollarSign className="h-7 w-7 text-blue-600 mx-auto" />
          <p className="text-2xl font-bold text-slate-800 mt-2">{stats.montantRecu.toLocaleString()} FCFA</p>
          <p className="text-xs text-slate-400">Paiements reçus</p>
        </Card>
      </div>

      {/* Actions rapides */}
      <div className="px-4">
        <h4 className="text-sm font-semibold text-slate-700 mb-3">Actions rapides</h4>
        <div className="space-y-3">
          <button
            onClick={() => alert('Fonctionnalité à venir')}
            className="w-full flex items-center gap-3 bg-white rounded-xl p-4 border border-slate-200 text-left hover:shadow-md transition-shadow"
          >
            <Plus className="h-6 w-6 text-blue-600 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-slate-800">Nouvelle inscription</p>
              <p className="text-xs text-slate-400">Inscrire un nouvel élève</p>
            </div>
            <ChevronRight className="h-4 w-4 text-slate-400" />
          </button>

          <button
            onClick={() => alert('Fonctionnalité à venir')}
            className="w-full flex items-center gap-3 bg-white rounded-xl p-4 border border-slate-200 text-left hover:shadow-md transition-shadow"
          >
            <Download className="h-6 w-6 text-blue-600 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-slate-800">Exporter</p>
              <p className="text-xs text-slate-400">Exporter les données en CSV</p>
            </div>
            <ChevronRight className="h-4 w-4 text-slate-400" />
          </button>
        </div>
      </div>
    </div>
  );
}
