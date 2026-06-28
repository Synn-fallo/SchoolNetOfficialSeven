import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase.web";
import { useAuth } from "@/contexts/AuthContext";

export interface EtablissementInfo {
  id: string;
  nom: string;
  slug: string;
  ville?: string;
  statut: string;
}

// Global state variables for synchronization across multiple instances of the hook
let globalActiveEtablissement: EtablissementInfo | null = null;
let globalAllEtablissements: EtablissementInfo[] = [];
let globalLoading = true;
let globalError: string | null = null;

interface GlobalState {
  active: EtablissementInfo | null;
  all: EtablissementInfo[];
  loading: boolean;
  error: string | null;
}

const listeners = new Set<(state: GlobalState) => void>();

const notifyListeners = (active: EtablissementInfo | null, all: EtablissementInfo[], loading: boolean, err: string | null) => {
  globalActiveEtablissement = active;
  globalAllEtablissements = all;
  globalLoading = loading;
  globalError = err;
  const state: GlobalState = { active, all, loading, error: err };
  listeners.forEach(l => l(state));
};

export function useActiveEtablissement() {
  const { user, activeRole } = useAuth();
  
  const [activeEtablissement, setActiveEtablissement] = useState<EtablissementInfo | null>(globalActiveEtablissement);
  const [allEtablissements, setAllEtablissements] = useState<EtablissementInfo[]>(globalAllEtablissements);
  const [loading, setLoading] = useState(globalLoading);
  const [error, setError] = useState<string | null>(globalError);

  useEffect(() => {
    const handleStateChange = (state: GlobalState) => {
      setActiveEtablissement(state.active);
      setAllEtablissements(state.all);
      setLoading(state.loading);
      setError(state.error);
    };
    listeners.add(handleStateChange);
    return () => {
      listeners.delete(handleStateChange);
    };
  }, []);

  const fetchAllEtablissements = useCallback(async () => {
    if (!user) return [];

    try {
      if (activeRole === "chef_etablissement" || activeRole === "admin") {
        const { data: rolesData, error: rolesError } = await supabase
          .from("user_roles")
          .select("etablissement_id")
          .eq("user_id", user.id)
          .eq("is_active", true)
          .not("etablissement_id", "is", null);

        if (rolesError) throw rolesError;
        if (!rolesData || rolesData.length === 0) return [];

        const etablissementIds = rolesData.map((r: any) => r.etablissement_id);
        
        const { data: etabsData, error: etabsError } = await supabase
          .from("etablissements")
          .select("id, nom, slug, ville, statut")
          .in("id", etablissementIds)
          .order("created_at", { ascending: true });

        if (etabsError) throw etabsError;
        
        return etabsData || [];
      }
      
      if (activeRole === "partenaire") {
        const { data: partenariats, error: partError } = await supabase
          .from("partenariats_etablissements")
          .select("etablissement_id")
          .eq("partenaire_id", user.id)
          .eq("statut", "actif");

        if (partError) throw partError;
        if (!partenariats || partenariats.length === 0) return [];

        const etablissementIds = partenariats.map((p: any) => p.etablissement_id);
        
        const { data: etabsData, error: etabsError } = await supabase
          .from("etablissements")
          .select("id, nom, slug, ville, statut")
          .in("id", etablissementIds)
          .order("created_at", { ascending: true });

        if (etabsError) throw etabsError;
        
        return etabsData || [];
      }
      
      // Default / for other roles
      const { data: etabsData } = await supabase
        .from("etablissements")
        .select("id, nom, slug, ville, statut");

      return etabsData || [];
    } catch (error) {
      console.error("Error fetching etablissements:", error);
      return [];
    }
  }, [user, activeRole]);

  const loadActiveEtablissement = useCallback(async () => {
    if (!user) {
      notifyListeners(null, [], false, null);
      return;
    }

    try {
      const etablissements = await fetchAllEtablissements();
      if (etablissements.length === 0) {
        notifyListeners(null, [], false, null);
        return;
      }

      const { data: prefs, error: prefsError } = await supabase
        .from("user_preferences")
        .select("preferences")
        .eq("user_id", user.id)
        .maybeSingle();

      if (prefsError) throw prefsError;

      const savedId = prefs?.preferences?.active_etablissement_id;
      
      let active = etablissements.find(e => e.id === savedId);
      if (!active && etablissements.length > 0) {
        active = etablissements[0];
        const newPreferences = {
          active_etablissement_id: active.id,
        };
        await supabase
          .from("user_preferences")
          .insert({
            user_id: user.id,
            preferences: newPreferences,
          });
      }
      
      notifyListeners(active || null, etablissements, false, null);
    } catch (error) {
      console.error("Error loading active etablissement:", error);
      notifyListeners(null, [], false, "Erreur lors du chargement");
    }
  }, [user, fetchAllEtablissements]);

  const saveActiveEtablissement = useCallback(async (etablissementId: string) => {
    if (!user) return false;

    try {
      const { data: existingPrefs, error: prefsError } = await supabase
        .from("user_preferences")
        .select("id, preferences")
        .eq("user_id", user.id)
        .maybeSingle();

      if (prefsError) throw prefsError;

      const newPreferences = {
        ...(existingPrefs?.preferences || {}),
        active_etablissement_id: etablissementId,
      };

      if (existingPrefs) {
        const { error: updateError } = await supabase
          .from("user_preferences")
          .update({ preferences: newPreferences })
          .eq("id", existingPrefs.id);
        if (updateError) throw updateError;
      } else {
        const { error: insertError } = await supabase
          .from("user_preferences")
          .insert({
            user_id: user.id,
            preferences: newPreferences,
          });
        if (insertError) throw insertError;
      }

      const newActive = globalAllEtablissements.find(e => e.id === etablissementId);
      if (newActive) {
        notifyListeners(newActive, globalAllEtablissements, false, null);
      }
      
      return true;
    } catch (error) {
      console.error("Error saving active etablissement:", error);
      return false;
    }
  }, [user]);

  const switchToEtablissement = useCallback(async (etablissementId: string) => {
    const etablissement = globalAllEtablissements.find(e => e.id === etablissementId);
    if (!etablissement) return false;
    
    const success = await saveActiveEtablissement(etablissementId);
    if (success) {
      notifyListeners(etablissement, globalAllEtablissements, false, null);
    }
    return success;
  }, [saveActiveEtablissement]);

  const refresh = useCallback(async () => {
    await loadActiveEtablissement();
  }, [loadActiveEtablissement]);

  useEffect(() => {
    loadActiveEtablissement();
  }, [loadActiveEtablissement]);

  return {
    activeEtablissement,
    allEtablissements,
    loading,
    error,
    switchToEtablissement,
    refresh,
    hasMultipleEtablissements: allEtablissements.length > 1,
    count: allEtablissements.length,
  };
}
