import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useReactions } from '@/hooks/useReactions';
import { ThumbsUp, Calendar, HelpCircle, Bell, CheckCircle } from 'lucide-react';

interface AnnonceReactionsProps {
  annonceId: string;
  onReactionChange?: () => void;
  showConfirmation?: boolean;
}

export default function AnnonceReactions({
  annonceId,
  onReactionChange,
  showConfirmation = true,
}: AnnonceReactionsProps) {
  const { user } = useAuth();
  const { userReaction, reactionCounts, totalConfirmations, ajouterReaction, retirerReaction, confirmer } = useReactions(annonceId);
  const [loading, setLoading] = useState<string | null>(null);
  const [localReaction, setLocalReaction] = useState(userReaction?.reaction || null);
  const [localConfirmation, setLocalConfirmation] = useState(userReaction?.confirmation_presence || false);

  const handleReaction = async (reaction: 'like' | 'participe' | 'question' | 'notify') => {
    if (!user) return;

    setLoading(reaction);

    let success = false;
    if (localReaction === reaction) {
      success = await retirerReaction();
      if (success) {
        setLocalReaction(null);
        if (onReactionChange) onReactionChange();
      }
    } else {
      success = await ajouterReaction(reaction);
      if (success) {
        setLocalReaction(reaction);
        if (onReactionChange) onReactionChange();
      }
    }

    setLoading(null);
  };

  const handleConfirmer = async () => {
    if (!user) return;

    setLoading('confirmer');
    const success = await confirmer(!localConfirmation);
    if (success) {
      setLocalConfirmation(!localConfirmation);
      if (onReactionChange) onReactionChange();
    }
    setLoading(null);
  };

  const reactions = [
    { key: 'like' as const, icon: ThumbsUp, count: reactionCounts.like, label: 'J\'aime' },
    { key: 'participe' as const, icon: Calendar, count: reactionCounts.participe, label: 'Participe' },
    { key: 'question' as const, icon: HelpCircle, count: reactionCounts.question, label: 'Question' },
    { key: 'notify' as const, icon: Bell, count: reactionCounts.notify, label: 'Notifier' },
  ];

  return (
    <div className="flex flex-wrap items-center gap-3 mt-2">
      {reactions.map((r) => {
        const Icon = r.icon;
        const isActive = localReaction === r.key;
        const isLoading = loading === r.key;

        return (
          <button
            key={r.key}
            onClick={() => handleReaction(r.key)}
            disabled={!!loading}
            className={`
              flex items-center gap-1.5 text-sm font-medium transition-colors
              ${isActive ? 'text-schoolnet-primary' : 'text-gray-500 hover:text-gray-700'}
              ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}
            `}
          >
            {isLoading ? (
              <div className="w-4 h-4 border-2 border-schoolnet-primary border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <Icon size={18} className={isActive ? 'text-schoolnet-primary' : 'text-gray-400'} />
                <span>{r.label}</span>
                {r.count > 0 && (
                  <span className={`text-xs ${isActive ? 'text-schoolnet-primary' : 'text-gray-400'}`}>
                    {r.count}
                  </span>
                )}
              </>
            )}
          </button>
        );
      })}

      {/* Confirmation présence */}
      {showConfirmation && (
        <button
          onClick={handleConfirmer}
          disabled={loading === 'confirmer'}
          className={`
            flex items-center gap-1.5 text-sm font-medium transition-colors
            ${localConfirmation ? 'text-green-600' : 'text-gray-500 hover:text-gray-700'}
            ${loading === 'confirmer' ? 'opacity-50 cursor-not-allowed' : ''}
          `}
        >
          {loading === 'confirmer' ? (
            <div className="w-4 h-4 border-2 border-green-500 border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              <CheckCircle size={18} className={localConfirmation ? 'text-green-500' : 'text-gray-400'} />
              <span>{localConfirmation ? 'Présence confirmée' : 'Confirmer ma présence'}</span>
              {totalConfirmations > 0 && (
                <span className={`text-xs ${localConfirmation ? 'text-green-500' : 'text-gray-400'}`}>
                  ({totalConfirmations})
                </span>
              )}
            </>
          )}
        </button>
      )}
    </div>
  );
}