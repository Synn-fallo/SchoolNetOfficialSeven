import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminEducMasterConfig } from '@/hooks/useAdminEducMasterConfig';
import EducMasterConfigForm from '@/components/admin/EducMasterConfigForm';
import EducMasterStats from '@/components/admin/EducMasterStats';
import { Card } from '@/components/ui/Card';

export default function AdminEducMasterConfig() {
  const navigate = useNavigate();
  const {
    config,
    stats,
    loading,
    saving,
    error,
    updateConfig,
    loadStats,
    clearCache,
    testApiConnection,
  } = useAdminEducMasterConfig();

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 bg-slate-50">
        <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
        <p className="mt-3 text-sm text-slate-500">Chargement de la configuration...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 bg-slate-50">
        <p className="text-sm text-red-500 text-center">{error}</p>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-slate-50 overflow-y-auto">
      <div className="p-4 max-w-3xl mx-auto">
        <h2 className="text-2xl font-bold text-slate-800 mb-1">⚙️ Configuration EducMaster</h2>
        <p className="text-sm text-slate-500 mb-6">
          Paramètres de connexion à l'API du Ministère pour la vérification des EducMaster
        </p>

        <EducMasterStats
          stats={stats}
          loading={loading}
          onRefresh={loadStats}
        />

        <EducMasterConfigForm
          config={config}
          onSave={updateConfig}
          onTest={testApiConnection}
          onClearCache={clearCache}
          saving={saving}
          stats={stats}
        />

        <Card className="p-4 bg-blue-50 border border-blue-200 mt-4">
          <h4 className="text-sm font-semibold text-blue-800 mb-2">ℹ️ À propos</h4>
          <ul className="text-xs text-blue-700 space-y-1">
            <li>• L'EducMaster est un numéro unique de 12 chiffres attribué par le Ministère.</li>
            <li>• La vérification peut se faire dans notre base (SchoolNet) ou via l'API du Ministère.</li>
            <li>• L'ordre de vérification détermine la priorité des sources.</li>
            <li>• Le cache permet d'éviter des appels redondants à l'API externe.</li>
          </ul>
        </Card>
      </div>
    </div>
  );
}
