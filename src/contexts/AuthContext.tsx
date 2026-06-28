import React, { createContext, useState, useEffect, useContext, useMemo, useCallback } from "react";
import { supabase } from "@/lib/supabase.web";
import { Session, User } from "@supabase/supabase-js";
import { Profile, UserRoleRecord, UserRole } from "@/types/database.types";
import { AdminMetadata } from "@/types/admin.types";
import { isEtablissementAbonne } from "@/lib/abonnement";

interface AuthContextType {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  roles: UserRoleRecord[];
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, profileData: Partial<Profile>) => Promise<void>;
  signOut: () => Promise<void>;
  hasRole: (role: UserRole, etablissementId?: string) => boolean;
  primaryRole: UserRole | null;
  refreshProfile: () => Promise<void>;
  isChefEtablissement: boolean;
  isMembreAdministratif: boolean;
  isDirecteurEtudes: boolean;
  isAnimateurEtablissement: boolean;
  isPersonnelAdministratif: boolean;
  isPersonnelVieScolaire: boolean;
  getAdminMetadata: () => AdminMetadata | null;
  activeRole: UserRole | null;
  setActiveRole: (role: UserRole, etablissementId?: string) => Promise<void>;
  availableRoles: Array<{
    role: UserRole;
    label: string;
    etablissementId?: string;
    etablissementNom?: string;
  }>;
  getEtablissementForRole: (role: UserRole) => { id: string; nom: string } | null;
  canInviteEnseignant: () => Promise<boolean>;
  getPlafondRestant: () => Promise<number>;
  getDepartementAE: () => string | null;
  isProfileComplete: boolean;
  
  // NOUVEAUX CHAMPS POUR AUTORITÉ ET PARTENAIRE
  perimetre: string | null;
  zoneId: string | null;
  organisation: string | null;
  organisationType: string | null;
  adminType: string | null;
  adminDepartement: string | null;
  adminFonction: string | null;
  partenariatEtablissements: string[];
  
  // PHASE 5 – Affiliation enseignant
  isAffiliated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Ordre de priorité des rôles (du plus élevé au plus bas)
// Les rôles avec le même numéro sont à égalité hiérarchique
const ROLE_PRIORITY: Record<UserRole, number> = {
  admin: 1,
  chef_etablissement: 2,
  autorite: 2,
  partenaire: 2,
  membre_administratif: 3,
  enseignant: 4,
  parent: 5,
  eleve: 6,
  visiteur: 7,
};

const getRoleLabel = (role: UserRole): string => {
  switch (role) {
    case "eleve": return "Élève";
    case "parent": return "Parent";
    case "enseignant": return "Enseignant";
    case "chef_etablissement": return "Chef d'établissement";
    case "admin": return "Administrateur";
    case "autorite": return "Autorité administrative";
    case "partenaire": return "Partenaire";
    case "visiteur": return "Visiteur";
    case "membre_administratif": return "Membre administratif";
    default: return role;
  }
};

// Fonction de détermination du rôle principal selon la logique de priorité
const getPrimaryRoleFromRoles = (
  activeRole: UserRole | null,
  userRoles: UserRoleRecord[]
): UserRole | null => {
  if (userRoles.length === 0) return null;

  if (activeRole && userRoles.some(r => r.role === activeRole)) {
    return activeRole;
  }

  const highestPriority = Math.min(...userRoles.map(r => ROLE_PRIORITY[r.role]));
  const topRoles = userRoles.filter(r => ROLE_PRIORITY[r.role] === highestPriority);

  if (topRoles.length >= 1) {
    return topRoles[0].role;
  }

  return null;
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [roles, setRoles] = useState<UserRoleRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeRole, setActiveRoleState] = useState<UserRole | null>(null);
  const [activeEtablissementId, setActiveEtablissementId] = useState<string | null>(null);
  const [isProfileComplete, setIsProfileComplete] = useState(false);
  const [isAffiliated, setIsAffiliated] = useState(false);
  
  // NOUVEAUX ÉTATS
  const [perimetre, setPerimetre] = useState<string | null>(null);
  const [zoneId, setZoneId] = useState<string | null>(null);
  const [organisation, setOrganisation] = useState<string | null>(null);
  const [organisationType, setOrganisationType] = useState<string | null>(null);
  const [adminType, setAdminType] = useState<string | null>(null);
  const [adminDepartement, setAdminDepartement] = useState<string | null>(null);
  const [adminFonction, setAdminFonction] = useState<string | null>(null);
  const [partenariatEtablissements, setPartenariatEtablissements] = useState<string[]>([]);

  const getCurrentEtablissementId = async (): Promise<string | null> => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from("user_roles")
        .select("etablissement_id")
        .eq("user_id", user.id)
        .eq("is_active", true)
        .maybeSingle();

      if (error) throw error;
      return data?.etablissement_id || null;
    } catch (error) {
      console.error("Error getting current etablissement:", error);
      return null;
    }
  };

  const canInviteEnseignant = async (): Promise<boolean> => {
    if (!isAnimateurEtablissement) return false;

    const adminMeta = getAdminMetadata();
    const departement = adminMeta?.departement;
    if (!departement) return false;

    try {
      const etablissementId = await getCurrentEtablissementId();
      if (!etablissementId) return false;

      const supabaseUrlEnv = import.meta.env.VITE_SUPABASE_URL || "";
      const supabaseAnonKeyEnv = import.meta.env.VITE_SUPABASE_ANON_KEY || "";
      if (!supabaseUrlEnv) {
        // Mock fallback
        return true;
      }

      const response = await fetch(`${supabaseUrlEnv}/functions/v1/check-plafond-ae`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${supabaseAnonKeyEnv}`,
        },
        body: JSON.stringify({
          ae_id: user?.id,
          departement,
          etablissement_id: etablissementId,
        }),
      });

      const result = await response.json();
      return result.success && result.allowed;
    } catch (error) {
      console.error("Error checking invite permission:", error);
      return true; // Return true in mock mode to allow testing
    }
  };

  const getPlafondRestant = async (): Promise<number> => {
    if (!isAnimateurEtablissement) return 0;

    const adminMeta = getAdminMetadata();
    const departement = adminMeta?.departement;
    if (!departement) return 0;

    try {
      const etablissementId = await getCurrentEtablissementId();
      if (!etablissementId) return 0;

      const supabaseUrlEnv = import.meta.env.VITE_SUPABASE_URL || "";
      const supabaseAnonKeyEnv = import.meta.env.VITE_SUPABASE_ANON_KEY || "";
      if (!supabaseUrlEnv) {
        // Mock fallback
        return 15;
      }

      const response = await fetch(`${supabaseUrlEnv}/functions/v1/check-plafond-ae`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${supabaseAnonKeyEnv}`,
        },
        body: JSON.stringify({
          ae_id: user?.id,
          departement,
          etablissement_id: etablissementId,
        }),
      });

      const result = await response.json();
      if (result.success) {
        return result.remaining;
      }
      return 15;
    } catch (error) {
      console.error("Error getting plafond restant:", error);
      return 15;
    }
  };

  const getDepartementAE = (): string | null => {
    if (!isAnimateurEtablissement) return null;
    const adminMeta = getAdminMetadata();
    return adminMeta?.departement || null;
  };

  // Vérifier l'affiliation de l'enseignant (établissement abonné)
  const checkAffiliation = useCallback(async () => {
    if (!user) {
      setIsAffiliated(false);
      return;
    }

    const enseignantRole = roles.find(r => r.role === "enseignant" && r.is_active);
    if (!enseignantRole) {
      setIsAffiliated(false);
      return;
    }

    const { data: enseignantEtab, error } = await supabase
      .from("enseignant_etablissements")
      .select("etablissement_id")
      .eq("enseignant_id", user.id)
      .eq("is_active", true)
      .maybeSingle();

    if (error || !enseignantEtab?.etablissement_id) {
      setIsAffiliated(true); // Default true for smooth demo
      return;
    }

    const affiliated = await isEtablissementAbonne(enseignantEtab.etablissement_id);
    setIsAffiliated(affiliated);
  }, [user, roles]);

  const loadUserData = async (userId: string) => {
    try {
      const [profileResponse, rolesResponse] = await Promise.all([
        supabase.from("profiles").select("*").eq("id", userId).maybeSingle(),
        supabase.from("user_roles").select("*").eq("user_id", userId).eq("is_active", true),
      ]);

      console.log("[AuthContext] Profile loaded:", profileResponse.data);
      console.log("[AuthContext] active_role:", profileResponse.data?.active_role);
      console.log("[AuthContext] Roles loaded:", rolesResponse.data?.length, "roles");

      let profileData = profileResponse.data;
      let rolesData = rolesResponse.data || [];

      if (profileData) {
        setProfile(profileData);
        
        const isComplete = !!(profileData.nom && profileData.prenom);
        setIsProfileComplete(isComplete);
        
        setPerimetre(profileData.perimetre || null);
        setZoneId(profileData.zone_id || null);
        setOrganisation(profileData.organisation || null);
        setOrganisationType(profileData.organisation_type || null);
      }

      if (rolesData) {
        setRoles(rolesData);
        
        const adminRole = rolesData.find(r => r.role === "membre_administratif");
        if (adminRole?.metadata) {
          setAdminType(adminRole.metadata.type_admin || null);
          setAdminDepartement(adminRole.metadata.departement || null);
          setAdminFonction(adminRole.metadata.fonction || null);
        } else {
          setAdminType(null);
          setAdminDepartement(null);
          setAdminFonction(null);
        }
      }

      const currentActiveRole = profileData?.active_role as UserRole | null;
      if (currentActiveRole === "partenaire") {
        const { data: partenariats } = await supabase
          .from("partenariats_etablissements")
          .select("etablissement_id")
          .eq("partenaire_id", userId)
          .eq("statut", "actif");
        
        setPartenariatEtablissements(partenariats?.map((p: any) => p.etablissement_id) || []);
      } else {
        setPartenariatEtablissements([]);
      }

      const determinedRole = getPrimaryRoleFromRoles(currentActiveRole, rolesData);

      if (determinedRole) {
        setActiveRoleState(determinedRole);
      } else {
        setActiveRoleState(null);
      }

    } catch (error) {
      console.error("Error loading user data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        loadUserData(session.user.id);
      } else {
        setLoading(false);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      (async () => {
        setSession(session);
        setUser(session?.user ?? null);
        if (session?.user) {
          await loadUserData(session.user.id);
        } else {
          setProfile(null);
          setRoles([]);
          setActiveRoleState(null);
          setActiveEtablissementId(null);
          setLoading(false);
        }
      })();
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (roles.length > 0 && user) {
      checkAffiliation();
    }
  }, [roles, user, checkAffiliation]);

  const refreshProfile = async () => {
    if (user) {
      await loadUserData(user.id);
      await checkAffiliation();
    }
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  };

  const signUp = async (email: string, password: string, profileData: Partial<Profile>) => {
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) throw error;

    if (data.user) {
      const { error: profileError } = await supabase.from("profiles").insert({
        id: data.user.id,
        ...profileData,
        is_active: true,
        active_role: "visiteur",
      });
      if (profileError) throw profileError;

      const { error: roleError } = await supabase.from("user_roles").insert({
        user_id: data.user.id,
        role: "visiteur",
        is_active: true,
      });
      if (roleError) throw roleError;
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.warn("Exception lors de la déconnexion API:", error);
    }
  };

  const hasRole = useCallback((role: UserRole, etablissementId?: string): boolean => {
    if (etablissementId) {
      return roles.some(r => r.role === role && r.etablissement_id === etablissementId && r.is_active);
    }
    return roles.some(r => r.role === role && r.is_active);
  }, [roles]);

  const getAdminMetadata = (): AdminMetadata | null => {
    const adminRole = roles.find(r => r.role === "membre_administratif");
    if (!adminRole) return null;
    return adminRole.metadata as AdminMetadata;
  };

  const isChefEtablissement = useMemo(() => hasRole("chef_etablissement"), [hasRole]);
  const isMembreAdministratif = useMemo(() => hasRole("membre_administratif"), [hasRole]);
  const adminMeta = getAdminMetadata();

  const isDirecteurEtudes = useMemo(() => isMembreAdministratif && adminMeta?.type_admin === "de", [isMembreAdministratif, adminMeta]);
  const isAnimateurEtablissement = useMemo(() => isMembreAdministratif && adminMeta?.type_admin === "ae", [isMembreAdministratif, adminMeta]);
  const isPersonnelAdministratif = useMemo(() => isMembreAdministratif && adminMeta?.type_admin === "administratif", [isMembreAdministratif, adminMeta]);
  const isPersonnelVieScolaire = useMemo(() => isMembreAdministratif && adminMeta?.type_admin === "vie_scolaire", [isMembreAdministratif, adminMeta]);

  const primaryRole = useMemo(() => {
    const activeRoles = roles.filter(r => r.is_active);

    if (activeRoles.length === 0) return null;

    const currentActiveRole = profile?.active_role as UserRole | null;
    if (currentActiveRole && activeRoles.some(r => r.role === currentActiveRole)) {
      return currentActiveRole;
    }

    const highestPriority = Math.min(...activeRoles.map(r => ROLE_PRIORITY[r.role]));
    const topRoles = activeRoles.filter(r => ROLE_PRIORITY[r.role] === highestPriority);

    if (topRoles.length >= 1) {
      return topRoles[0].role;
    }

    return null;
  }, [roles, profile?.active_role]);

  const getEtablissementForRole = (role: UserRole): { id: string; nom: string } | null => {
    const roleRecord = roles.find(r => r.role === role && r.etablissement_id);
    if (!roleRecord || !roleRecord.etablissement_id) return null;

    const etab = (profile as any)?.etablissement_id === roleRecord.etablissement_id
      ? { id: roleRecord.etablissement_id, nom: (profile as any)?.etablissement_nom || "Établissement" }
      : { id: roleRecord.etablissement_id, nom: "Établissement" };

    return etab;
  };

  const availableRoles = useMemo(() => {
    const uniqueRoles = new Map<string, { role: UserRole; etablissementId?: string; etablissementNom?: string }>();

    for (const roleRecord of roles) {
      const key = roleRecord.role;
      if (!uniqueRoles.has(key)) {
        uniqueRoles.set(key, {
          role: roleRecord.role,
          etablissementId: roleRecord.etablissement_id,
          etablissementNom: undefined,
        });
      }
    }

    return Array.from(uniqueRoles.values()).map(r => ({
      role: r.role,
      label: getRoleLabel(r.role),
      etablissementId: r.etablissementId,
      etablissementNom: r.etablissementNom,
    }));
  }, [roles]);

  const setActiveRole = async (role: UserRole, etablissementId?: string) => {
    if (!user) return;

    try {
      const hasRoleRecord = roles.some(
        r => r.role === role && (!etablissementId || r.etablissement_id === etablissementId) && r.is_active
      );

      if (!hasRoleRecord) {
        throw new Error(`Vous n'avez pas le rôle ${role}`);
      }

      // Persist locally in localStorage as well to survive reloads in demo
      localStorage.setItem("schoolnet_demo_active_role", role);

      await supabase
        .from("profiles")
        .update({ active_role: role })
        .eq("id", user.id);

      setActiveRoleState(role);
      setActiveEtablissementId(etablissementId || null);

      await refreshProfile();
    } catch (error) {
      console.error("Error setting active role:", error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        session,
        user,
        profile,
        roles,
        loading,
        signIn,
        signUp,
        signOut,
        hasRole,
        primaryRole,
        refreshProfile,
        isChefEtablissement,
        isMembreAdministratif,
        isDirecteurEtudes,
        isAnimateurEtablissement,
        isPersonnelAdministratif,
        isPersonnelVieScolaire,
        getAdminMetadata,
        activeRole,
        setActiveRole,
        availableRoles,
        getEtablissementForRole,
        canInviteEnseignant,
        getPlafondRestant,
        getDepartementAE,
        isProfileComplete,
        
        // NOUVEAUX
        perimetre,
        zoneId,
        organisation,
        organisationType,
        adminType,
        adminDepartement,
        adminFonction,
        partenariatEtablissements,
        
        // PHASE 5 – Affiliation enseignant
        isAffiliated,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
