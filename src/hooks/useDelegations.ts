import { useCallback } from "react";

export interface Delegation {
  id: string;
  delegue_id: string;
  role_delegue: "de" | "ae" | "administratif" | "vie_scolaire" | "comptable" | "caissier" | "assistant_comptable";
  etablissement_id: string;
  is_active: boolean;
}

export function useDelegations() {
  const getActiveDelegationsForUser = useCallback(async (userId: string, etablissementId?: string | null) => {
    // Return sample delegations for demo
    return [
      {
        id: "del-1",
        delegue_id: userId,
        role_delegue: "ae" as const,
        etablissement_id: etablissementId || "etab-lycee-demba",
        is_active: true,
      },
    ];
  }, []);

  return { getActiveDelegationsForUser };
}
