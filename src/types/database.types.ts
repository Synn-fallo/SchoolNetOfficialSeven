export type UserRole =
  | "admin"
  | "chef_etablissement"
  | "autorite"
  | "partenaire"
  | "membre_administratif"
  | "enseignant"
  | "parent"
  | "eleve"
  | "visiteur";

export interface Profile {
  id: string;
  nom: string;
  prenom: string;
  email?: string;
  phone?: string;
  active_role: UserRole;
  is_active?: boolean;
  perimetre?: string;
  zone_id?: string;
  organisation?: string;
  organisation_type?: string;
  etablissement_id?: string;
  etablissement_nom?: string;
  created_at?: string;
}

export interface UserRoleRecord {
  id: string;
  user_id: string;
  role: UserRole;
  is_active: boolean;
  etablissement_id?: string;
  metadata?: any;
}
