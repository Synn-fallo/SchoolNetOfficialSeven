import React from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Clock, 
  AlertTriangle, 
  CheckCircle, 
  XCircle,
  Users,
  Building2,
  CreditCard,
  RefreshCw
} from 'lucide-react';
import { DashboardMetrics } from '@/hooks/useDashboardMetrics';

interface MetricsCardsProps {
  metrics: DashboardMetrics;
  onRefresh?: () => void;
}

export default function MetricsCards({ metrics, onRefresh }: MetricsCardsProps) {
  console.log('[MetricsCards] Rendering with metrics:', metrics);
  const { loading, error, refresh } = metrics;
  
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-8">
        <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
        <p className="mt-3 text-sm text-slate-500">Chargement des indicateurs...</p>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-8 bg-red-50 rounded-xl mx-4 my-2">
        <AlertTriangle className="h-6 w-6 text-red-500" />
        <p className="mt-2 text-sm text-red-600 text-center">{error}</p>
        {onRefresh && (
          <button
            onClick={onRefresh}
            className="mt-3 flex items-center gap-1.5 px-4 py-2 bg-white rounded-lg border border-blue-500 text-blue-500 text-sm font-medium hover:bg-blue-50 transition-colors"
          >
            <RefreshCw className="h-4 w-4" />
            <span>Réessayer</span>
          </button>
        )}
      </div>
    );
  }
  
  return (
    <div className="flex gap-3 px-4 overflow-x-auto pb-2 scrollbar-thin">
      {/* Carte Taux de conversion Phase 1 → Phase 2 */}
      <div className="bg-white rounded-xl p-4 w-52 shadow-sm border border-slate-100 flex-shrink-0">
        <div className="flex items-center gap-2 mb-3">
          <Building2 className="h-5 w-5 text-blue-500" />
          <span className="text-xs font-medium text-slate-500 uppercase">Conversion Phase 1 → 2</span>
        </div>
        <p className="text-2xl font-bold text-slate-800">
          {metrics.tauxConversionPhase1to2 ?? '—'}%
        </p>
        <p className="text-xs text-slate-400">
          {metrics.totalDemandes} demandes → {metrics.totalValidations} validées
        </p>
      </div>
      
      {/* Carte Taux de conversion Phase 2 → Abonnement */}
      <div className="bg-white rounded-xl p-4 w-52 shadow-sm border border-slate-100 flex-shrink-0">
        <div className="flex items-center gap-2 mb-3">
          <CreditCard className="h-5 w-5 text-emerald-500" />
          <span className="text-xs font-medium text-slate-500 uppercase">Conversion Phase 2 → Abo</span>
        </div>
        <p className="text-2xl font-bold text-slate-800">
          {metrics.tauxConversionPhase2toAbonnement ?? '—'}%
        </p>
        <div className="flex gap-2 mt-2">
          <span className="text-[10px] text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">E: {metrics.totalAbonnements.essentiel}</span>
          <span className="text-[10px] text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">P: {metrics.totalAbonnements.premium}</span>
          <span className="text-[10px] text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">Pr: {metrics.totalAbonnements.prestige}</span>
        </div>
      </div>
      
      {/* Carte Temps moyen */}
      <div className="bg-white rounded-xl p-4 w-52 shadow-sm border border-slate-100 flex-shrink-0">
        <div className="flex items-center gap-2 mb-3">
          <Clock className="h-5 w-5 text-amber-500" />
          <span className="text-xs font-medium text-slate-500 uppercase">Délais moyens</span>
        </div>
        <p className="text-2xl font-bold text-slate-800">
          {metrics.tempsMoyenPhase1to2 ?? '—'}h
        </p>
        <p className="text-xs text-slate-400">Phase 1→2: {metrics.tempsMoyenPhase1to2 ?? '—'} heures</p>
        <p className="text-xs text-slate-400">Phase 2→Abo: {metrics.tempsMoyenPhase2toAbonnement ?? '—'} jours</p>
      </div>
      
      {/* Carte Qualité des dossiers */}
      <div className="bg-white rounded-xl p-4 w-52 shadow-sm border border-slate-100 flex-shrink-0">
        <div className="flex items-center gap-2 mb-3">
          <CheckCircle className="h-5 w-5 text-emerald-500" />
          <span className="text-xs font-medium text-slate-500 uppercase">Qualité des dossiers</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-slate-500">Auto-validation:</span>
          <span className="font-semibold text-emerald-600">{metrics.tauxValidationAuto ?? '—'}%</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-slate-500">Taux de rejet:</span>
          <span className="font-semibold text-red-500">{metrics.tauxRejet ?? '—'}%</span>
        </div>
      </div>
      
      {/* Carte Alertes */}
      <div className="bg-amber-50 rounded-xl p-4 w-52 shadow-sm border border-amber-100 flex-shrink-0">
        <div className="flex items-center gap-2 mb-3">
          <AlertTriangle className="h-5 w-5 text-amber-500" />
          <span className="text-xs font-medium text-slate-500 uppercase">Alertes</span>
        </div>
        
        {metrics.demandesEnAttente48h > 0 && (
          <div className="flex items-center gap-1.5 text-xs text-amber-500 mb-1.5">
            <Clock className="h-3.5 w-3.5" />
            <span>{metrics.demandesEnAttente48h} demande(s) &gt;48h</span>
          </div>
        )}
        
        {metrics.etablissementsPhase2Plus30Jours > 0 && (
          <div className="flex items-center gap-1.5 text-xs text-amber-500 mb-1.5">
            <AlertTriangle className="h-3.5 w-3.5" />
            <span>{metrics.etablissementsPhase2Plus30Jours} établissement(s) Phase 2 &gt;30j</span>
          </div>
        )}
        
        {metrics.demandesEnAttente48h === 0 && metrics.etablissementsPhase2Plus30Jours === 0 && (
          <p className="text-xs text-slate-400 italic">Aucune alerte</p>
        )}
      </div>
    </div>
  );
}
