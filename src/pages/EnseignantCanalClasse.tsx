// /src/pages/EnseignantCanalClasse.tsx
// Canal de classe

import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useCanalClasse } from '@/hooks/useCanalClasse';
import { supabase } from '@/lib/supabase.web';
import { Send, ChevronLeft, Lock, MessageCircle, Pin, User, Users, Settings, AlertCircle, Check, X, ChevronDown } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Portal } from '@/components/ui/Portal';

export default function EnseignantCanalClasse() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  
  const canalId = searchParams.get('canalId') || '';
  const classeId = searchParams.get('classeId') || '';
  const classeNom = searchParams.get('classeNom') || '';
  const estAnimateur = searchParams.get('estAnimateur') === 'true';

  const [message, setMessage] = useState('');
  const [showMembresModal, setShowMembresModal] = useState(false);
  const [showModeModal, setShowModeModal] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const { 
    canal, 
    messages, 
    membres,
    peutEcrire,
    loading, 
    sending, 
    error, 
    envoyerMessage,
    changerMode,
    exclureMembre,
    reintegrerMembre,
    pingerMessage,
    refetch 
  } = useCanalClasse(classeId);

  // Vérifier que l'utilisateur est bien animateur
  useEffect(() => {
    if (!loading && canal && !estAnimateur) {
      window.alert('Vous n\'êtes pas l\'animateur de ce canal.');
      navigate(-1);
    }
  }, [loading, canal, estAnimateur]);

  // Scroll en bas des messages
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleSendMessage = async () => {
    if (!message.trim() || !peutEcrire) return;
    
    const success = await envoyerMessage(message);
    if (success) {
      setMessage('');
    } else {
      window.alert("Impossible d'envoyer le message");
    }
  };

  const handleChangerMode = async (mode: 'moderation' | 'libre' | 'ferme') => {
    const success = await changerMode(mode);
    if (success) {
      setShowModeModal(false);
      window.alert(`Mode changé en ${mode === 'libre' ? 'Libre' : mode === 'moderation' ? 'Modération' : 'Fermé'}`);
    } else {
      window.alert('Impossible de changer le mode');
    }
  };

  const handleExclureMembre = async (userId: string, nom: string, prenom: string) => {
    if (!window.confirm(`Voulez-vous exclure ${prenom} ${nom} du canal ?`)) return;
    
    const success = await exclureMembre(userId);
    if (success) {
      window.alert('Membre exclu');
      setShowMembresModal(false);
      refetch();
    } else {
      window.alert('Impossible d\'exclure le membre');
    }
  };

  const handleReintegrerMembre = async (userId: string, nom: string, prenom: string) => {
    if (!window.confirm(`Voulez-vous réintégrer ${prenom} ${nom} dans le canal ?`)) return;
    
    const success = await reintegrerMembre(userId);
    if (success) {
      window.alert('Membre réintégré');
      setShowMembresModal(false);
      refetch();
    } else {
      window.alert('Impossible de réintégrer le membre');
    }
  };

  const handlePingerMessage = async (messageId: string) => {
    const success = await pingerMessage(messageId);
    if (!success) {
      window.alert('Impossible d\'épingler le message');
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (date.toDateString() === today.toDateString()) return "Aujourd'hui";
    if (date.toDateString() === yesterday.toDateString()) return 'Hier';
    return date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' });
  };

  // Grouper les messages par date
  const groupedMessages: { date: string; messages: typeof messages }[] = [];
  let lastDate = '';
  
  messages.forEach(msg => {
    const dateKey = formatDate(msg.created_at);
    if (dateKey !== lastDate) {
      groupedMessages.push({ date: dateKey, messages: [] });
      lastDate = dateKey;
    }
    groupedMessages[groupedMessages.length - 1].messages.push(msg);
  });

  const getModeLabel = () => {
    switch (canal?.mode) {
      case 'libre': return { label: 'Libre 💬', color: 'text-emerald-600', description: 'Tous peuvent écrire' };
      case 'moderation': return { label: 'Modération 🛡️', color: 'text-amber-600', description: 'Seul vous pouvez écrire' };
      case 'ferme': return { label: 'Fermé 🔒', color: 'text-red-600', description: 'Canal invisible pour les parents' };
      default: return { label: 'Modération', color: 'text-amber-600', description: '' };
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-schoolnet-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="mt-3 text-sm text-gray-500">Chargement du canal...</p>
        </div>
      </div>
    );
  }

  if (!canal) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50 p-5">
        <div className="text-center">
          <Lock className="w-12 h-12 text-gray-300 mx-auto" />
          <h3 className="text-xl font-semibold text-gray-700 mt-4">Canal non disponible</h3>
          <p className="text-sm text-gray-400 mt-2">
            Aucun canal n'a été créé pour cette classe.
          </p>
          <button
            onClick={() => navigate(-1)}
            className="mt-6 bg-schoolnet-primary text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-schoolnet-primary/90 transition-colors"
          >
            Retour
          </button>
        </div>
      </div>
    );
  }

  const mode = getModeLabel();

  return (
    <div className="flex-1 flex flex-col bg-gray-50">
      {/* En-tête */}
      <div className="flex flex-row items-center justify-between px-4 py-3 bg-white border-b border-gray-200">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2">
          <ChevronLeft className="w-6 h-6 text-schoolnet-primary" />
        </button>
        <div className="flex-1 text-center">
          <h2 className="text-sm font-semibold text-gray-800">{canal.nom}</h2>
          <button
            onClick={() => setShowModeModal(true)}
            className="flex flex-row items-center justify-center gap-1 text-xs font-medium mx-auto"
          >
            <span className={mode.color}>{mode.label}</span>
            <ChevronDown className={`w-3.5 h-3.5 ${mode.color}`} />
          </button>
        </div>
        <button
          onClick={() => setShowMembresModal(true)}
          className="p-2 -mr-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <Users className="w-5 h-5 text-gray-500" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-3">
        {messages.length === 0 ? (
          <div className="py-12 text-center">
            <MessageCircle className="w-10 h-10 text-gray-300 mx-auto" />
            <h4 className="text-sm font-medium text-gray-600 mt-3">Aucun message</h4>
            <p className="text-xs text-gray-400 mt-1">
              Envoyez un message pour démarrer la conversation.
            </p>
          </div>
        ) : (
          groupedMessages.map((group, groupIdx) => (
            <div key={groupIdx}>
              <div className="flex justify-center my-3">
                <span className="text-xs text-gray-400 bg-gray-100 px-3 py-1 rounded-full">
                  {group.date}
                </span>
              </div>
              {group.messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex flex-row gap-3 mb-3 ${msg.is_pinned ? 'bg-amber-50 rounded-xl p-2 -mx-2' : ''}`}
                >
                  {msg.is_pinned && (
                    <div className="absolute -top-1 -left-1">
                      <Pin className="w-3 h-3 text-amber-500" />
                    </div>
                  )}
                  <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                    <span className="text-xs font-semibold text-schoolnet-primary">
                      {msg.expediteur_prenom?.charAt(0)}{msg.expediteur_nom?.charAt(0)}
                    </span>
                  </div>
                  <div className="flex-1 bg-white rounded-xl p-3 border border-gray-200">
                    <div className="flex flex-row justify-between items-center mb-1">
                      <span className="text-xs font-semibold text-gray-700">
                        {msg.expediteur_prenom} {msg.expediteur_nom}
                        {msg.expediteur_id === canal.animateur_id && (
                          <span className="text-schoolnet-primary text-xs font-normal"> (PP)</span>
                        )}
                      </span>
                      <span className="text-xs text-gray-400">{formatTime(msg.created_at)}</span>
                    </div>
                    <p className="text-sm text-gray-700">{msg.contenu}</p>
                  </div>
                  <button
                    onClick={() => handlePingerMessage(msg.id)}
                    className="self-center p-1 hover:bg-gray-100 rounded-md transition-colors"
                  >
                    <Pin className={`w-4 h-4 ${msg.is_pinned ? 'text-amber-500' : 'text-gray-300'}`} />
                  </button>
                </div>
              ))}
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Zone de saisie */}
      <div className="flex flex-row items-end gap-2 px-3 py-2 bg-white border-t border-gray-200">
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Écrivez votre message..."
          className="flex-1 bg-gray-50 rounded-2xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-schoolnet-primary resize-none max-h-24 min-h-[40px]"
          rows={1}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSendMessage();
            }
          }}
          disabled={!peutEcrire || sending}
        />
        <button
          onClick={handleSendMessage}
          disabled={!message.trim() || sending || !peutEcrire}
          className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
            !message.trim() || sending || !peutEcrire
              ? 'bg-gray-200 cursor-not-allowed'
              : 'bg-schoolnet-primary hover:bg-schoolnet-primary/90'
          }`}
        >
          {sending ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <Send className="w-4 h-4 text-white" />
          )}
        </button>
      </div>

      {/* Modal membres */}
      {showMembresModal && (
        <Portal>
          <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl w-full max-w-md max-h-[80vh] overflow-hidden">
              <div className="flex flex-row justify-between items-center px-5 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800">Gestion des membres</h3>
                <button onClick={() => setShowMembresModal(false)} className="p-1 hover:bg-gray-100 rounded-full">
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
              <div className="overflow-y-auto max-h-[60vh] p-2">
                <h4 className="text-xs font-semibold text-gray-500 px-3 pt-2 pb-1">Membres actifs</h4>
                {membres.filter(m => m.est_actif).map((membre) => (
                  <div key={membre.user_id} className="flex flex-row justify-between items-center px-3 py-2.5 border-b border-gray-100">
                    <div className="flex flex-row items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                        <span className="text-xs font-semibold text-schoolnet-primary">
                          {membre.prenom?.charAt(0)}{membre.nom?.charAt(0)}
                        </span>
                      </div>
                      <span className="text-sm text-gray-700">{membre.prenom} {membre.nom}</span>
                    </div>
                    <button
                      onClick={() => handleExclureMembre(membre.user_id, membre.nom, membre.prenom)}
                      className="text-xs text-red-500 font-medium hover:underline"
                    >
                      Exclure
                    </button>
                  </div>
                ))}
                
                {membres.filter(m => !m.est_actif).length > 0 && (
                  <>
                    <h4 className="text-xs font-semibold text-gray-500 px-3 pt-4 pb-1 border-t border-gray-200 mt-2">Membres exclus</h4>
                    {membres.filter(m => !m.est_actif).map((membre) => (
                      <div key={membre.user_id} className="flex flex-row justify-between items-center px-3 py-2.5 border-b border-gray-100 bg-red-50">
                        <div className="flex flex-row items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center">
                            <span className="text-xs font-semibold text-red-500">
                              {membre.prenom?.charAt(0)}{membre.nom?.charAt(0)}
                            </span>
                          </div>
                          <span className="text-sm text-gray-400 line-through">{membre.prenom} {membre.nom}</span>
                        </div>
                        <button
                          onClick={() => handleReintegrerMembre(membre.user_id, membre.nom, membre.prenom)}
                          className="text-xs text-emerald-500 font-medium hover:underline"
                        >
                          Réintégrer
                        </button>
                      </div>
                    ))}
                  </>
                )}
              </div>
            </div>
          </div>
        </Portal>
      )}

      {/* Modal changement de mode */}
      {showModeModal && (
        <Portal>
          <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl w-full max-w-md p-6">
              <div className="flex flex-row justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-800">Changer le mode</h3>
                <button onClick={() => setShowModeModal(false)} className="p-1 hover:bg-gray-100 rounded-full">
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
              <div className="flex flex-col gap-3">
                {[
                  { value: 'libre', emoji: '💬', title: 'Libre', desc: 'Tous les membres peuvent écrire' },
                  { value: 'moderation', emoji: '🛡️', title: 'Modération', desc: 'Seul vous pouvez écrire' },
                  { value: 'ferme', emoji: '🔒', title: 'Fermé', desc: 'Canal invisible pour les parents' },
                ].map((option) => (
                  <button
                    key={option.value}
                    onClick={() => handleChangerMode(option.value as 'moderation' | 'libre' | 'ferme')}
                    className={`flex flex-row items-center gap-3 p-3 rounded-xl border transition-colors ${
                      canal.mode === option.value
                        ? 'border-schoolnet-primary bg-blue-50'
                        : 'border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <span className="text-2xl">{option.emoji}</span>
                    <div className="flex-1 text-left">
                      <p className={`text-sm font-medium ${canal.mode === option.value ? 'text-schoolnet-primary' : 'text-gray-700'}`}>
                        {option.title}
                      </p>
                      <p className="text-xs text-gray-400">{option.desc}</p>
                    </div>
                    {canal.mode === option.value && (
                      <Check className="w-5 h-5 text-emerald-500" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </Portal>
      )}
    </div>
  );
}
