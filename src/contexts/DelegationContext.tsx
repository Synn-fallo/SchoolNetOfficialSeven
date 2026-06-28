import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { supabase } from "@/lib/supabase.web";
import { useAuth } from "@/contexts/AuthContext";
import { useDelegations, Delegation } from "@/hooks/useDelegations";
import { useActiveEtablissement } from "@/hooks/useActiveEtablissement";

interface DelegationContextType {
  activeDelegations: Delegation[];
  loading: boolean;
  activeDelegatedRoles: string[];
  hasDelegationForRole: (roleDelegue: string) => boolean;
  refreshDelegations: () => Promise<void>;
}

const DelegationContext = createContext<DelegationContextType | undefined>(undefined);

export function DelegationProvider({ children }: { children: ReactNode }) {
  const { user, activeRole } = useAuth();
  const { getActiveDelegationsForUser } = useDelegations();
  const { activeEtablissement } = useActiveEtablissement();
  const [activeDelegations, setActiveDelegations] = useState<Delegation[]>([]);
  const [loading, setLoading] = useState(true);

  const activeDelegatedRoles = activeDelegations.map(d => d.role_delegue);

  const hasDelegationForRole = useCallback((roleDelegue: string): boolean => {
    return activeDelegatedRoles.includes(roleDelegue);
  }, [activeDelegatedRoles]);

  const refreshDelegations = useCallback(async () => {
    if (!user || activeRole === "enseignant") {
      setActiveDelegations([]);
      setLoading(false);
      return;
    }

    try {
      const etablissementId = activeEtablissement?.id || "etab-lycee-demba";
      const delegations = await getActiveDelegationsForUser(user.id, etablissementId);
      setActiveDelegations(delegations);
    } catch (error) {
      console.error("Error refreshing delegations:", error);
      setActiveDelegations([]);
    } finally {
      setLoading(false);
    }
  }, [user, activeRole, getActiveDelegationsForUser, activeEtablissement?.id]);

  useEffect(() => {
    refreshDelegations();
  }, [refreshDelegations]);

  // Écouter les changements dans la table delegations (real-time) AVEC GUARD
  useEffect(() => {
    if (!user) return;

    let subscription: any = null;

    try {
      const channel = supabase.channel("delegations_changes_context");
      
      if (channel && typeof channel.on === "function" && typeof channel.subscribe === "function") {
        subscription = channel
          .on(
            "postgres_changes",
            {
              event: "*",
              schema: "public",
              table: "delegations",
              filter: `delegue_id=eq.${user.id}`,
            },
            () => {
              refreshDelegations();
            }
          )
          .subscribe();
      }
    } catch (error) {
      console.warn("Delegation subscription not available on web:", error);
    }

    return () => {
      if (subscription && typeof subscription.unsubscribe === "function") {
        try {
          subscription.unsubscribe();
        } catch (e) {
          console.warn("Error unsubscribing delegation:", e);
        }
      }
    };
  }, [user, refreshDelegations]);

  return (
    <DelegationContext.Provider
      value={{
        activeDelegations,
        loading,
        activeDelegatedRoles,
        hasDelegationForRole,
        refreshDelegations,
      }}
    >
      {children}
    </DelegationContext.Provider>
  );
}

export function useDelegationContext() {
  const context = useContext(DelegationContext);
  if (context === undefined) {
    throw new Error("useDelegationContext must be used within a DelegationProvider");
  }
  return context;
}
