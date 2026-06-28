import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase.web";
import { useAuth } from "@/contexts/AuthContext";

const getCurrentEtablissementId = async (userId: string) => {
  const { data: profile, error } = await supabase
    .from("profiles")
    .select("etablissement_id")
    .eq("id", userId)
    .maybeSingle();
  
  if (error || !profile?.etablissement_id) {
    return "etab-lycee-demba"; // Fallback for demo
  }
  
  return profile.etablissement_id;
};

export function useBadges() {
  const { user, hasRole } = useAuth();
  const [messagesBadge, setMessagesBadge] = useState(3); // Default values for interactive demo
  const [demandesBadge, setDemandesBadge] = useState(2);
  const [invitationsBadge, setInvitationsBadge] = useState(1);
  const [demandesAutoInscriptionBadge, setDemandesAutoInscriptionBadge] = useState(4);
  const [loading, setLoading] = useState(false);

  const loadAutoInscriptionBadge = async () => {
    if (!user) return;
    try {
      const etablissementId = await getCurrentEtablissementId(user.id);
      if (!etablissementId) return;
      
      const { count, error } = await supabase
        .from("demandes_auto_inscription")
        .select("*", { count: "exact", head: true })
        .eq("etablissement_id", etablissementId)
        .eq("statut", "pending");
      
      if (!error && count !== null) {
        setDemandesAutoInscriptionBadge(count);
      }
    } catch (error) {
      console.error("Error loading auto-inscription badge:", error);
    }
  };

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const fetchBadges = async () => {
      try {
        const { count: messagesCount, error: messagesError } = await supabase
          .from("messages")
          .select("*", { count: "exact", head: true })
          .eq("destinataire_id", user.id)
          .eq("is_read", false);

        if (!messagesError && messagesCount !== null) {
          setMessagesBadge(messagesCount);
        }

        if (hasRole("admin")) {
          const { count: demandesCount, error: demandesError } = await supabase
            .from("demandes_etablissement")
            .select("*", { count: "exact", head: true })
            .in("statut", ["en_attente", "en_cours"]);

          if (!demandesError && demandesCount !== null) {
            setDemandesBadge(demandesCount);
          }
        }

        const loadInvitationsBadge = async () => {
          if (!user) return;
          try {
            const etablissementId = await getCurrentEtablissementId(user.id);
            if (!etablissementId) return;
            
            const { count, error } = await supabase
              .from("invitation_codes")
              .select("*", { count: "exact", head: true })
              .eq("etablissement_id", etablissementId)
              .eq("role", "enseignant")
              .eq("statut", "en_attente");
            
            if (!error && count !== null) {
              setInvitationsBadge(count);
            }
          } catch (error) {
            console.error("Error loading invitations badge:", error);
          }
        };

        await loadInvitationsBadge();
        await loadAutoInscriptionBadge();
      } catch (error) {
        console.error("Error fetching badges:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBadges();

    // Setup real-time listeners with safe channel setup
    const messagesSubscription = supabase
      .channel("messages-badge")
      .on("postgres_changes", {
        event: "INSERT",
        schema: "public",
        table: "messages",
        filter: `destinataire_id=eq.${user.id}`,
      }, () => {
        setMessagesBadge(prev => prev + 1);
      })
      .subscribe();

    return () => {
      if (messagesSubscription && typeof messagesSubscription.unsubscribe === "function") {
        try {
          messagesSubscription.unsubscribe();
        } catch (e) {}
      }
    };
  }, [user, hasRole]);

  return {
    messagesBadge,
    demandesBadge,
    invitationsBadge,
    demandesAutoInscriptionBadge,
    loading,
  };
}
