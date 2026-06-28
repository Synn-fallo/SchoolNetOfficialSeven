import { useCallback } from "react";

export interface Nomination {
  id: string;
  user_id: string;
  type_admin: "de" | "ae" | "administratif" | "vie_scolaire" | "comptable" | "caissier" | "assistant_comptable";
  etablissement_id: string;
  is_active: boolean;
}

export function useNominations() {
  const getNominations = useCallback(async (filters: { etablissementId?: string; is_active?: boolean }) => {
    // Return sample nominations for demo
    return [
      {
        id: "nom-1",
        user_id: "demo-user-123",
        type_admin: "de" as const,
        etablissement_id: filters.etablissementId || "etab-lycee-demba",
        is_active: true,
      },
    ];
  }, []);

  return { getNominations };
}
