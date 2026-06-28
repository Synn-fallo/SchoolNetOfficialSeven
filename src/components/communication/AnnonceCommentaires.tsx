import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase.web';
import { useAnnonces } from '@/hooks/useAnnonces';
import { Send, User } from 'lucide-react';

interface Commentaire {
  id: string;
  user_id: string;
  user_role: string;
  contenu: string;
  est_masque: boolean;
  created_at: string;
  user_nom?: string;
  user_prenom?: string;
}

interface AnnonceCommentairesProps {
  annonceId: string;
  visibilite: 'masques' | 'visibles';
  onCommentAdded?: () => void;
}

export default function AnnonceCommentaires({ annonceId, visibilite, onCommentAdded }: AnnonceCommentairesProps) {
  const { user } = useAuth();
  const { commenter } = useAnnonces();
  const [commentaires, setCommentaires] = useState<Commentaire[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [error, setError] = useState<string | null>(null);

  const chargerCommentaires = useCallback(async () => {
    if (!annonceId) return;

    setLoading(true);
    setError(null);

    try {
      let query = supabase
        .from('annonces_commentaires')
        .select(`
          *,
          user:user_id (nom, prenom)
        `)
        .eq('annonce_id', annonceId)
        .order('created_at', { ascending: true });

      if (visibilite === 'masques') {
        query = query.eq('user_id', user?.id);
      }

      const { data, error } = await query;

      if (error) throw error;

      const formatted = (data || []).map((c: any) => ({
        id: c.id,
        user_id: c.user_id,
        user_role: c.user_role,
        contenu: c.contenu,
        est_masque: c.est_masque,
        created_at: c.created_at,
        user_nom: c.user?.nom,
        user_prenom: c.user?.prenom,
      }));

      setCommentaires(formatted);
    } catch (err) {
      console.error('Erreur chargement commentaires:', err);
      setError('Impossible de charger les commentaires');
    } finally {
      setLoading(false);
    }
  }, [annonceId, visibilite, user?.id]);

  const handleEnvoyer = async () => {
    if (!newComment.trim()) {
      setError('Veuillez saisir un commentaire');
      return;
    }

    setSending(true);
    setError(null);

    try {
      const result = await commenter(annonceId, newComment.trim());

      if (result.success) {
        setNewComment('');
        await chargerCommentaires();
        if (onCommentAdded) onCommentAdded();
      } else {
        setError(result.error || 'Impossible d\'ajouter le commentaire');
      }
    } catch (err) {
      setError('Une erreur est survenue');
    } finally {
      setSending(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  };

  useEffect(() => {
    chargerCommentaires();
  }, [chargerCommentaires]);

  if (loading) {
    return (
      <div className="py-3 flex justify-center">
        <div className="w-4 h-4 border-2 border-schoolnet-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="mt-2">
      {error && (
        <div className="mb-2 p-2 bg-red-50 text-red-600 text-xs rounded-lg">
          {error}
        </div>
      )}

      {/* Liste des commentaires */}
      {commentaires.length > 0 && (
        <div className="max-h-60 overflow-y-auto space-y-2.5">
          {commentaires.map((c) => (
            <div key={c.id} className="flex gap-2">
              <div className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                <User size={13} className="text-gray-500" />
              </div>
              <div className="flex-1 bg-gray-50 rounded-xl px-3 py-2">
                <div className="flex justify-between items-center mb-0.5">
                  <span className="text-xs font-medium text-gray-800">
                    {c.user_prenom} {c.user_nom}
                  </span>
                  <span className="text-[10px] text-gray-400">{formatDate(c.created_at)}</span>
                </div>
                <p className="text-sm text-gray-700 leading-5">{c.contenu}</p>
                {c.est_masque && (
                  <span className="text-[10px] text-amber-500 mt-0.5 block">Masqué pour les autres</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Formulaire d'ajout */}
      <div className="flex items-end gap-2 mt-3">
        <input
          type="text"
          className="flex-1 bg-gray-50 border border-gray-200 rounded-full px-3.5 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-schoolnet-primary focus:border-transparent"
          placeholder="Écrire un commentaire..."
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          maxLength={500}
        />
        <button
          onClick={handleEnvoyer}
          disabled={!newComment.trim() || sending}
          className={`
            w-8 h-8 rounded-full flex items-center justify-center transition-colors flex-shrink-0
            ${!newComment.trim() || sending
              ? 'bg-gray-200 cursor-not-allowed'
              : 'bg-schoolnet-primary hover:bg-schoolnet-primary-light'
            }
          `}
        >
          {sending ? (
            <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <Send size={14} className="text-white" />
          )}
        </button>
      </div>

      {commentaires.length === 0 && !loading && (
        <p className="text-xs text-gray-400 text-center py-2">
          {visibilite === 'masques' 
            ? 'Aucun commentaire. Soyez le premier à commenter.'
            : 'Soyez le premier à commenter.'
          }
        </p>
      )}
    </div>
  );
}