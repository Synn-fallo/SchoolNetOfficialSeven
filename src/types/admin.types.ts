export interface AdminMetadata {
  type_admin: "de" | "ae" | "administratif" | "vie_scolaire" | "comptable" | "caissier" | string;
  departement?: string;
  fonction?: string;
}
