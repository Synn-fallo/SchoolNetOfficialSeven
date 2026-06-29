import React from 'react';
import { Card } from '@/components/ui/Card';
import { RefreshCw, TrendingUp, TrendingDown, Clock, Database, AlertCircle } from 'lucide-react';

interface EducMasterStatsProps {
  stats: any;
  loading: boolean;
  onRefresh: () => void;
}

export default function EducMasterStats({ stats, loading, onRefresh }: EducMasterStatsProps) {
  if (loading) {
    return (
      <Card className="p-5">
        <div className="flex flex-col items-center justify-center py-8">
          <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <p className="mt-3 text-sm text-slate-500">Chargement des statistiques...</p>
        </div>
      </Card>
    );
  }

  if (!stats || stats.total_calls === 0) {
    return (
      <Card className="p-5">
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <Database className="h-10 w-10 text-slate-300" />
          <p className="mt-3 text-base font-semibold text-slate-700">Aucune donnée</p>
          <p className="text-sm text-slate-400">Aucun appel API n'a encore été effectué.</p>
        </div>
      </Card>
    );
  }

  const getTrendIcon = (rate: number) => {
    if (rate >= 95) return <TrendingUp className="h-4 w-4 text-emerald-500" />;
    if (rate >= 80) return <TrendingUp className="h-4 w-4 text-amber-500" />;
    return <TrendingDown className="h-4 w-4 text-red-500" />;
  };

  const getSuccessColor = (rate: number) => {
    if (rate >= 95) return '#10B981';
    if (rate >= 80) return '#F59E0B';
    return '#EF4444';
  };

  return (
    <Card className="p-5 mb-4">
      <div className="flex justify-between items-center mb-5">
        <h3 className="text-base font-semibold text-slate-800">📊 Statistiques API EducMaster</h3>
        <button
          onClick={onRefresh}
          className="p-2 rounded-lg text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-colors"
        >
          <RefreshCw className="h-4 w-4" />
        </button>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-5">
        <div className="bg-slate-50 rounded-xl py-4 px-3 text-center border border-slate-200">
          <p className="text-2xl font-bold text-slate-800">{stats.total_calls}</p>
          <p className="text-xs text-slate-500 mt-1">Appels totaux</p>
        </div>
        <div className="bg-slate-50 rounded-xl py-4 px-3 text-center border border-slate-200">
          <p className="text-2xl font-bold text-emerald-600">{stats.success_count}</p>
          <p className="text-xs text-slate-500 mt-1">Succès</p>
        </div>
        <div className="bg-slate-50 rounded-xl py-4 px-3 text-center border border-slate-200">
          <p className="text-2xl font-bold text-red-500">{stats.failure_count}</p>
          <p className="text-xs text-slate-500 mt-1">Échecs</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
          <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center">
            {getTrendIcon(stats.success_rate)}
          </div>
          <div>
            <p className="text-base font-semibold" style={{ color: getSuccessColor(stats.success_rate) }}>
              {stats.success_rate}%
            </p>
            <p className="text-xs text-slate-500">Taux de succès</p>
          </div>
        </div>
        <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
          <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center">
            <Clock className="h-4 w-4 text-slate-500" />
          </div>
          <div>
            <p className="text-base font-semibold text-slate-800">{stats.avg_response_time_ms}ms</p>
            <p className="text-xs text-slate-500">Temps moyen</p>
          </div>
        </div>
      </div>

      {stats.last_call_at && (
        <div className="flex items-center gap-2 text-sm mb-3">
          <span className="text-slate-500">Dernier appel :</span>
          <span className="text-slate-700">{new Date(stats.last_call_at).toLocaleString()}</span>
        </div>
      )}

      {stats.last_error && (
        <div className="flex items-center gap-2 bg-red-50 px-3 py-2.5 rounded-lg border border-red-200">
          <AlertCircle className="h-3.5 w-3.5 text-red-500" />
          <span className="text-xs text-red-700">{stats.last_error}</span>
        </div>
      )}
    </Card>
  );
}
