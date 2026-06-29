import { useEducMasterConfig } from './useEducMasterConfig';

/**
 * Hook wrapper pour la configuration EducMaster
 * Alias de useEducMasterConfig pour les pages admin
 * 
 * Ce hook expose exactement les mêmes fonctionnalités que useEducMasterConfig
 * mais avec un nom plus explicite pour le contexte admin.
 */
export function useAdminEducMasterConfig() {
  const {
    config,
    loading,
    error,
    loadConfig,
    updateConfig,
    getOrdreVerification,
    isApiEnabled,
    getApiTimeout,
  } = useEducMasterConfig();

  // Pour les statistiques, on pourrait ajouter une fonction supplémentaire
  // qui récupère les statistiques d'appels API depuis une table dédiée
  const loadStats = async () => {
    try {
      // Récupérer les statistiques depuis la table api_stats
      const { data, error } = await supabase
        .from('api_stats')
        .select('*')
        .eq('service', 'educmaster')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      return data;
    } catch (err) {
      console.error('Error loading EducMaster stats:', err);
      return null;
    }
  };

  const clearCache = async () => {
    try {
      // Appeler la fonction RPC pour nettoyer le cache
      const { data, error } = await supabase.rpc('clean_expired_educmaster_cache');
      if (error) throw error;
      return { success: true, data };
    } catch (err) {
      console.error('Error clearing EducMaster cache:', err);
      return { success: false, error: err instanceof Error ? err.message : 'Erreur lors du nettoyage du cache' };
    }
  };

  const testApiConnection = async () => {
    try {
      const startTime = Date.now();
      
      // Tester la connexion à l'API configurée
      if (!config?.api_url) {
        return { success: false, message: 'Aucune URL d\'API configurée' };
      }

      const response = await fetch(config.api_url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${config.api_key || ''}`,
          'Content-Type': 'application/json',
        },
        signal: AbortSignal.timeout(config.api_timeout_ms || 5000),
      });

      const responseTime = Date.now() - startTime;

      if (response.ok) {
        return { success: true, message: 'Connexion API réussie', responseTime };
      } else {
        return { success: false, message: `Erreur API: ${response.status} ${response.statusText}`, responseTime };
      }
    } catch (err) {
      console.error('Error testing API connection:', err);
      return { success: false, message: err instanceof Error ? err.message : 'Erreur de connexion' };
    }
  };

  // Ajouter une référence à supabase pour les stats
  const supabase = require('@/lib/supabase.web').supabase;

  return {
    config,
    loading,
    error,
    saving: loading, // Pour compatibilité avec le composant EducMasterConfigForm
    updateConfig,
    loadStats,
    clearCache,
    testApiConnection,
    getOrdreVerification,
    isApiEnabled,
    getApiTimeout,
  };
}
