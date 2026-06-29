import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Save, RefreshCw, CheckCircle, XCircle, Clock, Database, Globe, Zap } from 'lucide-react';

interface EducMasterConfigFormProps {
  config: any;
  onSave: (updates: any) => Promise<{ success: boolean; error?: string }>;
  onTest: () => Promise<{ success: boolean; message: string; responseTime?: number }>;
  onClearCache: () => Promise<{ success: boolean; error?: string }>;
  saving: boolean;
  stats?: any;
}

export default function EducMasterConfigForm({
  config,
  onSave,
  onTest,
  onClearCache,
  saving,
  stats,
}: EducMasterConfigFormProps) {
  const [ordreVerification, setOrdreVerification] = useState<'BDD_API' | 'API_BDD'>('BDD_API');
  const [apiEnabled, setApiEnabled] = useState(false);
  const [apiUrl, setApiUrl] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [apiTimeoutMs, setApiTimeoutMs] = useState('5000');
  const [cacheEnabled, setCacheEnabled] = useState(true);
  const [cacheTtlHours, setCacheTtlHours] = useState('24');
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string; responseTime?: number } | null>(null);
  const [clearingCache, setClearingCache] = useState(false);

  useEffect(() => {
    if (config) {
      setOrdreVerification(config.ordre_verification || 'BDD_API');
      setApiEnabled(config.api_enabled || false);
      setApiUrl(config.api_url || '');
      setApiKey(config.api_key || '');
      setApiTimeoutMs(String(config.api_timeout_ms || 5000));
      setCacheEnabled(config.cache_enabled !== undefined ? config.cache_enabled : true);
      setCacheTtlHours(String(config.cache_ttl_hours || 24));
    }
  }, [config]);

  const handleSave = async () => {
    const updates = {
      ordre_verification: ordreVerification,
      api_enabled: apiEnabled,
      api_url: apiUrl || null,
      api_key: apiKey || null,
      api_timeout_ms: parseInt(apiTimeoutMs, 10),
      cache_enabled: cacheEnabled,
      cache_ttl_hours: parseInt(cacheTtlHours, 10),
    };
    
    const result = await onSave(updates);
    if (result.success) {
      alert('✅ Configuration sauvegardée');
    } else {
      alert(`❌ Erreur: ${result.error || 'Impossible de sauvegarder'}`);
    }
  };

  const handleTest = async () => {
    setTesting(true);
    setTestResult(null);
    const result = await onTest();
    setTestResult(result);
    setTesting(false);
  };

  const handleClearCache = async () => {
    setClearingCache(true);
    const result = await onClearCache();
    setClearingCache(false);
    if (result.success) {
      alert('✅ Cache vidé avec succès');
    } else {
      alert(`❌ Erreur: ${result.error || 'Impossible de vider le cache'}`);
    }
  };

  return (
    <div className="space-y-4">
      {/* 🔌 Configuration API Ministère */}
      <Card className="p-5">
        <h4 className="text-base font-semibold text-slate-800 mb-4">🔌 Configuration API Ministère</h4>
        
        <div className="flex justify-between items-center mb-4">
          <label className="text-sm font-medium text-slate-700">Activer l'API externe</label>
          <button
            onClick={() => setApiEnabled(!apiEnabled)}
            className={`relative w-11 h-6 rounded-full transition-colors ${apiEnabled ? 'bg-blue-600' : 'bg-slate-300'}`}
          >
            <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${apiEnabled ? 'translate-x-5' : ''}`} />
          </button>
        </div>

        {apiEnabled && (
          <>
            <div className="mb-3">
              <label className="text-sm font-medium text-slate-700 block mb-1.5">URL de l'API</label>
              <input
                type="text"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                placeholder="https://api.education.gouv.bj/..."
                value={apiUrl}
                onChange={(e) => setApiUrl(e.target.value)}
              />
            </div>

            <div className="mb-3">
              <label className="text-sm font-medium text-slate-700 block mb-1.5">Clé API (Bearer Token)</label>
              <input
                type="password"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                placeholder="Votre clé d'authentification"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
              />
            </div>

            <div className="mb-4">
              <label className="text-sm font-medium text-slate-700 block mb-1.5">Timeout (millisecondes)</label>
              <input
                type="number"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                placeholder="5000"
                value={apiTimeoutMs}
                onChange={(e) => setApiTimeoutMs(e.target.value)}
              />
            </div>

            <button
              onClick={handleTest}
              disabled={testing || !apiUrl}
              className="flex items-center justify-center gap-2 w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-medium transition-colors disabled:opacity-50"
            >
              {testing ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Globe className="h-4 w-4" />
                  <span>Tester la connexion</span>
                </>
              )}
            </button>

            {testResult && (
              <div className={`flex items-center gap-2 px-3 py-2.5 rounded-lg mt-3 ${
                testResult.success ? 'bg-emerald-50 border border-emerald-200' : 'bg-red-50 border border-red-200'
              }`}>
                {testResult.success ? (
                  <CheckCircle className="h-4 w-4 text-emerald-600" />
                ) : (
                  <XCircle className="h-4 w-4 text-red-600" />
                )}
                <span className={`text-sm ${testResult.success ? 'text-emerald-700' : 'text-red-700'}`}>
                  {testResult.message}
                  {testResult.responseTime && ` (${testResult.responseTime}ms)`}
                </span>
              </div>
            )}
          </>
        )}
      </Card>

      {/* 🔄 Ordre de vérification */}
      <Card className="p-5">
        <h4 className="text-base font-semibold text-slate-800 mb-4">🔄 Ordre de vérification</h4>
        
        <button
          onClick={() => setOrdreVerification('BDD_API')}
          className={`w-full text-left p-3 rounded-xl border transition-all mb-2 ${
            ordreVerification === 'BDD_API' ? 'bg-blue-50 border-blue-500' : 'border-slate-200 hover:bg-slate-50'
          }`}
        >
          <div className="flex items-start gap-3">
            <div className={`w-4.5 h-4.5 rounded-full border-2 mt-0.5 flex items-center justify-center ${
              ordreVerification === 'BDD_API' ? 'border-blue-600 bg-blue-600' : 'border-slate-300'
            }`}>
              {ordreVerification === 'BDD_API' && <div className="w-2 h-2 bg-white rounded-full" />}
            </div>
            <div>
              <p className="text-sm font-medium text-slate-800">Base de données → API</p>
              <p className="text-xs text-slate-500">Vérifie d'abord dans SchoolNet, puis dans l'API du Ministère</p>
            </div>
          </div>
        </button>

        <button
          onClick={() => setOrdreVerification('API_BDD')}
          className={`w-full text-left p-3 rounded-xl border transition-all ${
            ordreVerification === 'API_BDD' ? 'bg-blue-50 border-blue-500' : 'border-slate-200 hover:bg-slate-50'
          }`}
        >
          <div className="flex items-start gap-3">
            <div className={`w-4.5 h-4.5 rounded-full border-2 mt-0.5 flex items-center justify-center ${
              ordreVerification === 'API_BDD' ? 'border-blue-600 bg-blue-600' : 'border-slate-300'
            }`}>
              {ordreVerification === 'API_BDD' && <div className="w-2 h-2 bg-white rounded-full" />}
            </div>
            <div>
              <p className="text-sm font-medium text-slate-800">API → Base de données</p>
              <p className="text-xs text-slate-500">Vérifie d'abord dans l'API du Ministère, puis dans SchoolNet</p>
            </div>
          </div>
        </button>
      </Card>

      {/* 💾 Cache des données */}
      <Card className="p-5">
        <h4 className="text-base font-semibold text-slate-800 mb-4">💾 Cache des données</h4>
        
        <div className="flex justify-between items-center mb-4">
          <label className="text-sm font-medium text-slate-700">Activer le cache</label>
          <button
            onClick={() => setCacheEnabled(!cacheEnabled)}
            className={`relative w-11 h-6 rounded-full transition-colors ${cacheEnabled ? 'bg-blue-600' : 'bg-slate-300'}`}
          >
            <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${cacheEnabled ? 'translate-x-5' : ''}`} />
          </button>
        </div>

        {cacheEnabled && (
          <div className="mb-4">
            <label className="text-sm font-medium text-slate-700 block mb-1.5">Durée de validité (heures)</label>
            <input
              type="number"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              placeholder="24"
              value={cacheTtlHours}
              onChange={(e) => setCacheTtlHours(e.target.value)}
            />
          </div>
        )}

        <button
          onClick={handleClearCache}
          disabled={clearingCache}
          className="flex items-center justify-center gap-2 w-full py-3 bg-slate-100 hover:bg-slate-200 text-blue-600 rounded-xl text-sm font-medium transition-colors disabled:opacity-50"
        >
          {clearingCache ? (
            <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              <RefreshCw className="h-4 w-4" />
              <span>Vider le cache</span>
            </>
          )}
        </button>
      </Card>

      {/* 📊 Statistiques API */}
      {stats && (
        <Card className="p-5">
          <h4 className="text-base font-semibold text-slate-800 mb-4">📊 Statistiques API</h4>
          
          <div className="grid grid-cols-5 gap-3 mb-4">
            <div className="text-center p-2 bg-slate-50 rounded-lg border border-slate-200">
              <Database className="h-5 w-5 text-slate-400 mx-auto" />
              <p className="text-lg font-bold text-slate-800">{stats.total_calls}</p>
              <p className="text-[10px] text-slate-400">Appels totaux</p>
            </div>
            <div className="text-center p-2 bg-slate-50 rounded-lg border border-slate-200">
              <CheckCircle className="h-5 w-5 text-emerald-500 mx-auto" />
              <p className="text-lg font-bold text-emerald-600">{stats.success_count}</p>
              <p className="text-[10px] text-slate-400">Succès</p>
            </div>
            <div className="text-center p-2 bg-slate-50 rounded-lg border border-slate-200">
              <XCircle className="h-5 w-5 text-red-500 mx-auto" />
              <p className="text-lg font-bold text-red-500">{stats.failure_count}</p>
              <p className="text-[10px] text-slate-400">Échecs</p>
            </div>
            <div className="text-center p-2 bg-slate-50 rounded-lg border border-slate-200">
              <Zap className="h-5 w-5 text-blue-500 mx-auto" />
              <p className="text-lg font-bold text-blue-600">{stats.success_rate}%</p>
              <p className="text-[10px] text-slate-400">Taux succès</p>
            </div>
            <div className="text-center p-2 bg-slate-50 rounded-lg border border-slate-200">
              <Clock className="h-5 w-5 text-slate-400 mx-auto" />
              <p className="text-lg font-bold text-slate-800">{stats.avg_response_time_ms}ms</p>
              <p className="text-[10px] text-slate-400">Temps moyen</p>
            </div>
          </div>

          {stats.last_error && (
            <div className="bg-amber-50 p-3 rounded-lg border border-amber-200">
              <p className="text-xs font-medium text-amber-700">Dernière erreur :</p>
              <p className="text-xs text-amber-600">{stats.last_error}</p>
            </div>
          )}
        </Card>
      )}

      {/* Bouton Enregistrer */}
      <button
        onClick={handleSave}
        disabled={saving}
        className="flex items-center justify-center gap-2 w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold text-sm transition-colors disabled:opacity-60"
      >
        {saving ? (
          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
        ) : (
          <>
            <Save className="h-4 w-4" />
            <span>Enregistrer</span>
          </>
        )}
      </button>
    </div>
  );
}
