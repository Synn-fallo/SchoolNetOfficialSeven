import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { supabase } from "@/lib/supabase.web";
import { useAuth } from "@/contexts/AuthContext";
import { useNominations, Nomination } from "@/hooks/useNominations";
import { useActiveEtablissement } from "@/hooks/useActiveEtablissement";

interface NominationContextType {
  activeNominations: Nomination[];
  activeNominatedRoles: string[];
  loading: boolean;
  hasNominationForRole: (typeAdmin: string) => boolean;
  refreshNominations: () => Promise<void>;
}

const NominationContext = createContext<NominationContextType | undefined>(undefined);

export function NominationProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const { getNominations } = useNominations();
  const { activeEtablissement } = useActiveEtablissement();
  const [activeNominations, setActiveNominations] = useState<Nomination[]>([]);
  const [loading, setLoading] = useState(true);

  const activeNominatedRoles = activeNominations.map(n => n.type_admin);

  const hasNominationForRole = useCallback((typeAdmin: string): boolean => {
    return activeNominatedRoles.includes(typeAdmin);
  }, [activeNominatedRoles]);

  const refreshNominations = useCallback(async () => {
    if (!user) {
      setActiveNominations([]);
      setLoading(false);
      return;
    }

    try {
      const etablissementId = activeEtablissement?.id || "etab-lycee-demba";
      const nominations = await getNominations({
        etablissementId: etablissementId,
        is_active: true,
      });
      setActiveNominations(nominations);
    } catch (error) {
      console.error("Error refreshing nominations:", error);
      setActiveNominations([]);
    } finally {
      setLoading(false);
    }
  }, [user, getNominations, activeEtablissement?.id]);

  useEffect(() => {
    refreshNominations();
  }, [refreshNominations]);

  // Écouter les changements dans user_roles (real-time) AVEC GUARD
  useEffect(() => {
    if (!user) return;

    let subscription: any = null;

    try {
      const channel = supabase.channel("user_roles_changes_nomination");
      
      if (channel && typeof channel.on === "function" && typeof channel.subscribe === "function") {
        subscription = channel
          .on(
            "postgres_changes",
            {
              event: "*",
              schema: "public",
              table: "user_roles",
              filter: `user_id=eq.${user.id}`,
            },
            () => {
              refreshNominations();
            }
          )
          .subscribe();
      }
    } catch (error) {
      console.warn("Nomination subscription not available on web:", error);
    }

    return () => {
      if (subscription && typeof subscription.unsubscribe === "function") {
        try {
          subscription.unsubscribe();
        } catch (e) {
          console.warn("Error unsubscribing nomination:", e);
        }
      }
    };
  }, [user, refreshNominations]);

  return (
    <NominationContext.Provider
      value={{
        activeNominations,
        activeNominatedRoles,
        loading,
        hasNominationForRole,
        refreshNominations,
      }}
    >
      {children}
    </NominationContext.Provider>
  );
}

export function useNominationContext() {
  const context = useContext(NominationContext);
  if (context === undefined) {
    throw new Error("useNominationContext must be used within a NominationProvider");
  }
  return context;
}
