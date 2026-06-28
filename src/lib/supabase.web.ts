import { createClient } from "@supabase/supabase-js";

// Check if environment variables are available
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "";

// We build a robust simulation environment if credentials are not configured
class MockSupabaseClient {
  private listeners: Array<(event: string, session: any) => void> = [];
  private currentSession: any = null;

  constructor() {
    // Initial demo session setup for testing roles
    const savedSession = localStorage.getItem("schoolnet_demo_session");
    if (savedSession) {
      try {
        this.currentSession = JSON.parse(savedSession);
      } catch (e) {
        this.currentSession = null;
      }
    } else {
      this.currentSession = null;
    }
  }

  private getDefaultSession() {
    return {
      user: {
        id: "demo-user-123",
        email: "demo@schoolnet.com",
        user_metadata: {},
      },
      access_token: "mock-token",
    };
  }

  auth = {
    getSession: async () => {
      return { data: { session: this.currentSession }, error: null };
    },
    onAuthStateChange: (callback: (event: string, session: any) => void) => {
      this.listeners.push(callback);
      // Trigger initial callback
      setTimeout(() => callback("SIGNED_IN", this.currentSession), 0);
      return {
        data: {
          subscription: {
            unsubscribe: () => {
              this.listeners = this.listeners.filter((l) => l !== callback);
            },
          },
        },
      };
    },
    signInWithPassword: async ({ email }: { email: string }) => {
      const session = {
        user: {
          id: "demo-user-123",
          email: email,
          user_metadata: {},
        },
        access_token: "mock-token-signed-in",
      };
      this.currentSession = session;
      localStorage.setItem("schoolnet_demo_session", JSON.stringify(session));
      this.listeners.forEach((l) => l("SIGNED_IN", session));
      return { data: { session, user: session.user }, error: null };
    },
    signUp: async ({ email }: { email: string }) => {
      const session = {
        user: {
          id: "demo-user-123",
          email: email,
          user_metadata: {},
        },
        access_token: "mock-token-signed-up",
      };
      this.currentSession = session;
      localStorage.setItem("schoolnet_demo_session", JSON.stringify(session));
      this.listeners.forEach((l) => l("SIGNED_IN", session));
      return { data: { session, user: session.user }, error: null };
    },
    signOut: async () => {
      this.currentSession = null;
      localStorage.removeItem("schoolnet_demo_session");
      this.listeners.forEach((l) => l("SIGNED_OUT", null));
      return { error: null };
    },
  };

  // Safe table queries that return mocked data for all schoolnet features
  from(table: string) {
    return {
      select: (columns?: string, options?: any) => {
        return new MockQueryBuilder(table, this, "select");
      },
      insert: (data: any) => {
        return new MockQueryBuilder(table, this, "insert", data);
      },
      update: (data: any) => {
        return new MockQueryBuilder(table, this, "update", data);
      },
    };
  }

  // Realtime channel mocks
  channel(name: string) {
    return {
      on: (event: string, filter: any, callback: () => void) => {
        return {
          on: (ev2: string, filt2: any, cb2: () => void) => {
            return {
              subscribe: () => {
                return {
                  unsubscribe: () => {},
                };
              },
            };
          },
          subscribe: () => {
            return {
              unsubscribe: () => {},
            };
          },
        };
      },
      subscribe: () => {
        return {
          unsubscribe: () => {},
        };
      },
    };
  }

  public handleMaybeSingle(table: string, column: string, value: any) {
    if (table === "profiles") {
      // Return a rich profile based on user role choices
      const savedRole = localStorage.getItem("schoolnet_demo_active_role") || "chef_etablissement";
      
      let profileData = {
        id: value,
        nom: "Touré",
        prenom: "Fatou",
        email: "f.toure@schoolnet.com",
        active_role: savedRole,
        is_active: true,
        perimetre: "Région de Dakar",
        zone_id: "SN-DK",
        organisation: "Ministère de l'Éducation Nationale",
        organisation_type: "ministere",
        etablissement_id: "etab-lycee-demba",
        etablissement_nom: "Lycée Seydou Nourou Tall",
      };

      if (savedRole === "autorite") {
        profileData = {
          ...profileData,
          nom: "Sall",
          prenom: "Amadou",
          email: "amadou.sall@ddetp.gouv.sn",
          organisation: "Direction Départementale de l'Enseignement Technique et Professionnel",
          organisation_type: "direction_departementale",
          perimetre: "Département de Dakar",
          etablissement_nom: "Enseignement Technique & Professionnel",
        };
      } else if (savedRole === "eleve") {
        profileData = {
          ...profileData,
          nom: "Diop",
          prenom: "Abdou",
          email: "abdou.diop@eleve.schoolnet.sn",
          organisation: "Lycée Seydou Nourou Tall",
          organisation_type: "etablissement",
          perimetre: "Scolaire",
        };
      }

      return {
        data: profileData,
        error: null,
      };
    }

    if (table === "user_roles") {
      const savedRole = localStorage.getItem("schoolnet_demo_active_role") || "chef_etablissement";
      return {
        data: {
          id: "role-record-1",
          user_id: value,
          role: savedRole,
          is_active: true,
          etablissement_id: "etab-lycee-demba",
          metadata: {
            type_admin: "de", // Directeur des Études
            departement: "Sciences",
            fonction: "Directeur pédagogique",
          },
        },
        error: null,
      };
    }

    if (table === "user_preferences") {
      return {
        data: {
          id: "pref-1",
          preferences: {
            active_etablissement_id: "etab-lycee-demba",
          },
        },
        error: null,
      };
    }

    if (table === "enseignant_etablissements") {
      return {
        data: {
          etablissement_id: "etab-lycee-demba",
          is_active: true,
        },
        error: null,
      };
    }

    return { data: null, error: null };
  }

  public handleListQuery(table: string) {
    let data: any[] = [];
    let count: number | null = null;

    if (table === "user_roles") {
      const savedRole = localStorage.getItem("schoolnet_demo_active_role") || "chef_etablissement";
      data = [
        {
          id: "role-record-1",
          user_id: "demo-user-123",
          role: savedRole,
          is_active: true,
          etablissement_id: "etab-lycee-demba",
          metadata: {
            type_admin: "de",
            departement: "Sciences",
            fonction: "Directeur pédagogique",
          },
        },
        // Proposer plusieurs rôles dans la démo pour tester la flexibilité du menu !
        {
          id: "role-record-2",
          user_id: "demo-user-123",
          role: "parent",
          is_active: true,
          etablissement_id: "etab-lycee-demba",
        },
        {
          id: "role-record-3",
          user_id: "demo-user-123",
          role: "enseignant",
          is_active: true,
          etablissement_id: "etab-lycee-demba",
        },
        {
          id: "role-record-4",
          user_id: "demo-user-123",
          role: "chef_etablissement",
          is_active: true,
          etablissement_id: "etab-lycee-demba",
        },
        {
          id: "role-record-5",
          user_id: "demo-user-123",
          role: "eleve",
          is_active: true,
          etablissement_id: "etab-lycee-demba",
        },
        {
          id: "role-record-6",
          user_id: "demo-user-123",
          role: "autorite",
          is_active: true,
          etablissement_id: "etab-lycee-demba",
        },
      ];
    } else if (table === "etablissements") {
      data = [
        {
          id: "etab-lycee-demba",
          nom: "Lycée Seydou Nourou Tall",
          slug: "lycee-tall-dakar",
          ville: "Dakar",
          statut: "actif",
        },
        {
          id: "etab-college-bambey",
          nom: "Collège d'Enseignement Moyen de Bambey",
          slug: "cem-bambey",
          ville: "Bambey",
          statut: "actif",
        },
      ];
    } else if (table === "partenariats_etablissements") {
      data = [
        { etablissement_id: "etab-lycee-demba", statut: "actif" },
      ];
    } else if (table === "messages") {
      data = [];
      count = 3;
    } else if (table === "demandes_etablissement") {
      data = [];
      count = 2;
    } else if (table === "invitation_codes") {
      data = [];
      count = 1;
    } else if (table === "demandes_auto_inscription") {
      data = [];
      count = 4;
    }

    if (count === null) {
      count = data.length;
    }

    return { data, error: null, count };
  }
}

class MockQueryBuilder {
  private table: string;
  private client: any;
  private mode: "select" | "update" | "insert";
  private updateData: any = null;
  private insertData: any = null;
  private filters: Array<{ column: string; value: any }> = [];
  private isSingle = false;
  private isMaybeSingle = false;

  constructor(table: string, client: any, mode: "select" | "update" | "insert" = "select", data?: any) {
    this.table = table;
    this.client = client;
    this.mode = mode;
    if (mode === "update") {
      this.updateData = data;
    } else if (mode === "insert") {
      this.insertData = data;
    }
  }

  select(columns?: string, options?: any) {
    return this;
  }

  eq(column: string, value: any) {
    this.filters.push({ column, value });
    return this;
  }

  neq(column: string, value: any) {
    return this;
  }

  in(column: string, values: any[]) {
    return this;
  }

  not(column: string, operator: string, value: any) {
    return this;
  }

  order(column: string, options?: any) {
    return this;
  }

  limit(value: number) {
    return this;
  }

  range(from: number, to: number) {
    return this;
  }

  single() {
    this.isSingle = true;
    return this;
  }

  maybeSingle() {
    this.isMaybeSingle = true;
    return this;
  }

  then(onfulfilled?: (value: any) => any, onrejected?: (reason: any) => any) {
    let resultPromise;

    if (this.mode === "insert") {
      console.log(`[Mock Supabase] Inserting into ${this.table}:`, this.insertData);
      resultPromise = Promise.resolve({ data: this.insertData, error: null });
    } else if (this.mode === "update") {
      const firstFilter = this.filters[0];
      const col = firstFilter ? firstFilter.column : "id";
      const val = firstFilter ? firstFilter.value : "unknown";
      console.log(`[Mock Supabase] Updating ${this.table} where ${col}=${val}:`, this.updateData);
      resultPromise = Promise.resolve({ data: this.updateData, error: null });
    } else {
      const firstFilter = this.filters[0];
      const column = firstFilter ? firstFilter.column : "id";
      const value = firstFilter ? firstFilter.value : "demo-user-123";

      if (this.isSingle || this.isMaybeSingle) {
        resultPromise = Promise.resolve(this.client.handleMaybeSingle(this.table, column, value));
      } else {
        resultPromise = Promise.resolve(this.client.handleListQuery(this.table));
      }
    }

    return resultPromise.then(onfulfilled, onrejected);
  }
}

export const supabase =
  supabaseUrl && supabaseAnonKey
    ? createClient(supabaseUrl, supabaseAnonKey)
    : (new MockSupabaseClient() as any);
