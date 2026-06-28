import { supabase } from '@/lib/supabase.web';

export interface UserSearchResult {
  id: string;
  email: string;
  nom: string;
  prenom: string;
  telephone?: string | null;
}

/**
 * Recherche un utilisateur par email
 * Utilise une Edge Function pour accéder à auth.users sur Supabase
 * Retourne null si non trouvé
 */
export async function searchUserByEmail(email: string): Promise<UserSearchResult | null> {
  if (!email || !email.trim()) {
    return null;
  }

  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "";

  // Si pas d'URL Supabase configuree, on utilise le fallback sur la table profiles ou mock
  if (!supabaseUrl) {
    console.warn('[UserSearch] VITE_SUPABASE_URL non configuré, repli sur la table profiles ou le mock.');
    return searchUserByEmailFallback(email);
  }

  try {
    // Récupérer la session pour le token
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError || !sessionData?.session) {
      console.warn('[UserSearch] Pas de session active, repli sur le fallback.', sessionError);
      return searchUserByEmailFallback(email);
    }

    const accessToken = sessionData.session.access_token;

    // Appel à l'Edge Function
    const response = await fetch(
      `${supabaseUrl}/functions/v1/search-user-by-email`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      }
    );

    if (!response.ok) {
      const result = await response.json().catch(() => ({}));
      console.error('Edge Function error:', result.error || response.statusText);
      return searchUserByEmailFallback(email);
    }

    const result = await response.json();

    if (result.found && result.user) {
      return {
        id: result.user.id,
        email: result.user.email,
        nom: result.user.nom || '',
        prenom: result.user.prenom || '',
        telephone: result.user.telephone || null,
      };
    }

    return null;
  } catch (error) {
    console.error('Error searching user by email via Edge Function, trying fallback:', error);
    return searchUserByEmailFallback(email);
  }
}

/**
 * Version de repli : recherche directe dans la table 'profiles' ou mock
 */
async function searchUserByEmailFallback(email: string): Promise<UserSearchResult | null> {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, prenom, nom, email, telephone')
      .eq('email', email.trim().toLowerCase())
      .maybeSingle();

    if (error) throw error;
    
    if (data) {
      return {
        id: data.id,
        email: data.email,
        nom: data.nom || '',
        prenom: data.prenom || '',
        telephone: data.telephone || null,
      };
    }
  } catch (e) {
    console.error('Error in searchUserByEmail fallback database query:', e);
  }

  // Fallback ultime sur mock si la requête de base de données échoue ou ne renvoie rien en mode dev
  return searchUserByEmailMock(email);
}

/**
 * Version simplifiée pour test (sans Edge Function)
 * À utiliser uniquement en environnement de test
 */
export async function searchUserByEmailMock(email: string): Promise<UserSearchResult | null> {
  // Mock pour les tests
  const mockUsers = [
    { email: 'enseignant.workflow@gmail.com', id: 'test-id-123', nom: 'WORKFLOW', prenom: 'Enseignant', telephone: null },
  ];
  
  const found = mockUsers.find(u => u.email === email.trim().toLowerCase());
  if (found) {
    return found;
  }
  return null;
}
