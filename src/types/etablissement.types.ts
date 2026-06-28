export interface EtablissementPublic {
  id: string;
  nom: string;
  slug: string;
  ville: string;
  type_etablissement: string;
  regime: string;
  logo_url?: string;
  taux_reussite?: number;
  likes_count?: number;
  vues_count?: number;
  note_moyenne?: number;
  region: string;
  departement: string;
  region_id?: string;
  departement_id?: string;
  badge_annuaire?: 'Prestige' | 'Premium' | 'Certifié' | null;
  cycles?: string;
  options?: string;
  description_courte?: string;
  etoiles?: string;
  type_affichage?: string;
  code_etablissement?: string;
}
