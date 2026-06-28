/**
 * SHIM UNIQUE POUR SUPABASE - VERSION WEB
 * 
 * Ce shim combine :
 * 1. La désactivation de Realtime (évite les erreurs de subscribe)
 * 2. La correction des requêtes profiles (supprime la colonne email)
 * 
 * AUCUNE MODIFICATION DES FICHIERS DE LOGIQUE MÉTIER N'EST NÉCESSAIRE.
 */

// ✅ IMPORTER DIRECTEMENT DEPUIS LE PACKAGE REEL (CHEMIN ABSOLU)
import { createClient } from '/node_modules/@supabase/supabase-js/dist/module/index.js';

// ============================================
// 1. CONFIGURATION
// ============================================

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Variables d\'environnement Supabase manquantes');
  throw new Error(
    'Variables d\'environnement Supabase manquantes. ' +
    'Vérifiez VITE_SUPABASE_URL et VITE_SUPABASE_ANON_KEY dans .env'
  );
}

// ============================================
// 2. CRÉATION DU CLIENT SUPABASE
// ============================================

const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storage: window.localStorage,
  },
  realtime: {
    params: {
      eventsPerSecond: 0,
    },
  },
});

// ============================================
// 3. SAUVEGARDE DES MÉTHODES ORIGINALES
// ============================================

const originalChannel = (supabase as any).channel;
const originalFrom = (supabase as any).from;

// ============================================
// 4. DÉSACTIVATION DE REALTIME
// ============================================

(supabase as any).channel = function(name: string, opts?: any) {
  if (import.meta.env.VITE_APP_ENV !== 'production') {
    console.log(`🔇 [SHIM] Realtime désactivé: ${name}`);
  }
  
  const dummyChannel = {
    name: name,
    opts: opts || {},
    
    on: function(event: string, filter: any, callback: any) {
      return this;
    },
    
    subscribe: function(callback?: any) {
      if (callback) {
        setTimeout(() => {
          if (typeof callback === 'function') {
            callback('SUBSCRIBED');
          } else if (callback && typeof callback === 'object' && callback.onOpen) {
            callback.onOpen();
          }
        }, 10);
      }
      return this;
    },
    
    unsubscribe: function() {
      return this;
    },
    
    send: function(type: string, payload: any) {
      return this;
    },
    
    close: function() {
      return this;
    },
    
    removeAllListeners: function() {
      return this;
    },
    
    listen: function(type: string, callback: any) {
      return this;
    },
    
    onError: function(callback: any) {
      return this;
    },
    
    onClose: function(callback: any) {
      return this;
    },
    
    onOpen: function(callback: any) {
      return this;
    },
    
    presence: function() {
      return {
        onSync: function(callback: any) { return this; },
        onJoin: function(callback: any) { return this; },
        onLeave: function(callback: any) { return this; },
        track: function(payload: any) { return this; },
        untrack: function() { return this; },
        state: function() { return {}; },
      };
    },
  };
  
  return dummyChannel;
};

// ============================================
// 5. CORRECTION DES REQUÊTES PROFILES
// ============================================

const VALID_PROFILES_COLUMNS = [
  'id',
  'nom',
  'prenom',
  'telephone',
  'avatar_url',
  'date_naissance',
  'lieu_naissance',
  'adresse',
  'genre',
  'active_role',
  'perimetre',
  'zone_id',
  'organisation',
  'organisation_type',
  'etablissement_id',
  'created_at',
  'updated_at',
  'is_active',
  'last_login',
];

const INVALID_COLUMNS = ['email', 'created_by', 'updated_by'];

function cleanSelectQuery(select: string): string {
  if (!select) return select;
  
  let cleaned = select;
  
  for (const invalidCol of INVALID_COLUMNS) {
    const regex = new RegExp(`\\b${invalidCol}\\b,?\\s*`, 'g');
    cleaned = cleaned.replace(regex, '');
    const regexQuoted = new RegExp(`["']${invalidCol}["'],?\\s*`, 'g');
    cleaned = cleaned.replace(regexQuoted, '');
  }
  
  cleaned = cleaned.replace(/,\s*,/g, ',');
  cleaned = cleaned.replace(/^\s*,/, '');
  cleaned = cleaned.replace(/,\s*$/, '');
  
  return cleaned;
}

(supabase as any).from = function(table: string) {
  const queryBuilder = originalFrom.call(this, table);
  
  if (table === 'profiles') {
    const originalSelect = queryBuilder.select;
    queryBuilder.select = function(columns?: string) {
      if (columns) {
        const cleanedColumns = cleanSelectQuery(columns);
        if (cleanedColumns !== columns && import.meta.env.VITE_APP_ENV !== 'production') {
          console.log(`🔧 [SHIM] profiles: "${columns}" -> "${cleanedColumns}"`);
        }
        return originalSelect.call(this, cleanedColumns);
      }
      return originalSelect.call(this, VALID_PROFILES_COLUMNS.join(','));
    };
  }
  
  return queryBuilder;
};

// ============================================
// 6. EXPORT
// ============================================

console.log('✅ [SHIM] Supabase interceptions activées');
console.log('   - Realtime désactivé');
console.log('   - Profiles: colonne email supprimée');

// ✅ EXPORTER LE CLIENT SUPABASE MODIFIÉ
export { supabase };

// ✅ EXPORT PAR DEFAUT
export default supabase;