import React, { useState } from 'react';
import { supabase } from '@/lib/supabase.web';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import RequestStatus from './RequestStatus';

interface AdminRequestReviewProps {
  request: any;
  type: 'etablissement' | 'partenariat';
  onProcessed: () => void;
  onClose: () => void;
}

export default function AdminRequestReview({ request, type, onProcessed, onClose }: AdminRequestReviewProps) {
  const [commentaire, setCommentaire] = useState('');
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmModalVisible, setConfirmModalVisible] = useState(false);
  const [pendingAction, setPendingAction] = useState<'valider' | 'rejeter' | null>(null);

  const showConfirmModal = (action: 'valider' | 'rejeter') => {
    setPendingAction(action);
    setConfirmModalVisible(true);
  };

  const handleConfirm = async () => {
    if (!pendingAction) return;
    
    setConfirmModalVisible(false);
    setProcessing(true);
    setError(null);
    
    try {
      const { data, error } = await supabase.functions.invoke('process-institution-request', {
        body: {
          request_id: request.id,
          request_type: type,
          action: pendingAction,
          commentaire: commentaire || null,
        },
      });
      
      if (error) {
        throw new Error(error.message || 'Erreur lors de l\'appel');
      }
      
      if (data?.success) {
        const successMessage = pendingAction === 'valider' 
          ? 'La demande a été validée avec succès.' 
          : 'La demande a été rejetée.';
        
        alert(successMessage);
        onProcessed();
      } else {
        const errorMessage = data?.message || data?.error || 'Erreur lors du traitement';
        alert('❌ ' + errorMessage);
        setError(errorMessage);
      }
    } catch (err) {
      console.error('Erreur:', err);
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors du traitement';
      setError(errorMessage);
      alert('❌ ' + errorMessage);
    } finally {
      setProcessing(false);
      setPendingAction(null);
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="flex-1 bg-slate-50 overflow-y-auto">
      <div className="p-4 max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-5">
          <h3 className="text-lg font-bold text-slate-800">
            {type === 'etablissement' ? "Demande d'établissement" : 'Demande de partenariat'}
          </h3>
          <RequestStatus status={request.statut} />
        </div>

        {/* Message d'erreur */}
        {error && (
          <div className="bg-red-50 p-3 rounded-lg border border-red-200 mb-4">
            <p className="text-sm text-red-600 text-center">{error}</p>
          </div>
        )}

        {/* Informations */}
        <Card className="p-4 mb-4">
          <h4 className="text-sm font-semibold text-slate-700 mb-3">Informations</h4>
          {type === 'etablissement' ? (
            <div className="space-y-2 text-sm">
              <div className="flex justify-between border-b border-slate-100 pb-1.5">
                <span className="text-slate-500">Établissement:</span>
                <span className="font-medium text-slate-800">{request.nom_etablissement}</span>
              </div>
              <div className="flex justify-between border-b border-slate-100 pb-1.5">
                <span className="text-slate-500">Type:</span>
                <span className="font-medium text-slate-800">{request.type_etablissement === 'public' ? 'Public' : 'Privé'}</span>
              </div>
              <div className="flex justify-between border-b border-slate-100 pb-1.5">
                <span className="text-slate-500">Adresse:</span>
                <span className="font-medium text-slate-800">{request.adresse}, {request.ville}</span>
              </div>
              <div className="flex justify-between border-b border-slate-100 pb-1.5">
                <span className="text-slate-500">Téléphone:</span>
                <span className="font-medium text-slate-800">{request.telephone}</span>
              </div>
              <div className="flex justify-between border-b border-slate-100 pb-1.5">
                <span className="text-slate-500">Email:</span>
                <span className="font-medium text-slate-800">{request.email_contact}</span>
              </div>
              <div className="flex justify-between border-b border-slate-100 pb-1.5">
                <span className="text-slate-500">Plan souhaité:</span>
                <span className="font-medium text-slate-800">{request.plan_souhaite}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Demandeur ID:</span>
                <span className="font-medium text-slate-800">{request.demandeur_id?.substring(0, 8)}...</span>
              </div>
            </div>
          ) : (
            <div className="space-y-2 text-sm">
              <div className="flex justify-between border-b border-slate-100 pb-1.5">
                <span className="text-slate-500">Organisation:</span>
                <span className="font-medium text-slate-800">{request.organisation_nom}</span>
              </div>
              <div className="flex justify-between border-b border-slate-100 pb-1.5">
                <span className="text-slate-500">Type partenaire:</span>
                <span className="font-medium text-slate-800">{request.type_partenaire}</span>
              </div>
              <div className="flex justify-between border-b border-slate-100 pb-1.5">
                <span className="text-slate-500">Contact:</span>
                <span className="font-medium text-slate-800">{request.contact_nom}</span>
              </div>
              <div className="flex justify-between border-b border-slate-100 pb-1.5">
                <span className="text-slate-500">Email:</span>
                <span className="font-medium text-slate-800">{request.contact_email}</span>
              </div>
              <div className="flex justify-between border-b border-slate-100 pb-1.5">
                <span className="text-slate-500">Téléphone:</span>
                <span className="font-medium text-slate-800">{request.contact_telephone}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Collaboration:</span>
                <span className="font-medium text-slate-800">{request.type_collaboration}</span>
              </div>
            </div>
          )}
        </Card>

        {/* Message / Proposition */}
        <Card className="p-4 mb-4">
          <h4 className="text-sm font-semibold text-slate-700 mb-2">Message / Proposition</h4>
          <p className="text-sm text-slate-600 leading-relaxed">
            {type === 'etablissement' ? request.message_demandeur : request.proposition || 'Aucun message'}
          </p>
          {type === 'partenariat' && request.montant_propose && (
            <div className="flex justify-between mt-3 pt-2 border-t border-slate-100">
              <span className="text-sm text-slate-500">Montant proposé:</span>
              <span className="text-sm font-medium text-slate-800">{Number(request.montant_propose).toLocaleString()} FCFA</span>
            </div>
          )}
        </Card>

        {/* Commentaire admin */}
        <Card className="p-4 mb-4">
          <h4 className="text-sm font-semibold text-slate-700 mb-2">Commentaire admin</h4>
          <textarea
            className="w-full min-h-[80px] px-4 py-3 bg-white rounded-xl border border-slate-200 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 resize-none"
            placeholder="Ajouter un commentaire (optionnel)"
            value={commentaire}
            onChange={(e) => setCommentaire(e.target.value)}
          />
        </Card>

        {/* Boutons */}
        <div className="flex gap-3 mt-4 justify-center">
          <button
            onClick={() => showConfirmModal('rejeter')}
            disabled={processing}
            className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-medium transition-colors disabled:opacity-60"
          >
            Rejeter
          </button>
          <button
            onClick={() => showConfirmModal('valider')}
            disabled={processing}
            className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-medium transition-colors disabled:opacity-60"
          >
            Valider
          </button>
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-sm font-medium transition-colors"
          >
            Fermer
          </button>
        </div>
      </div>

      {/* Modal de confirmation */}
      {confirmModalVisible && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-80 rounded-2xl shadow-2xl p-6 text-center">
            <h4 className="text-lg font-semibold text-slate-800 mb-2">
              {pendingAction === 'valider' ? 'Valider la demande' : 'Rejeter la demande'}
            </h4>
            <p className="text-sm text-slate-500 mb-5">
              {pendingAction === 'valider' 
                ? 'Êtes-vous sûr de vouloir valider cette demande ?' 
                : 'Êtes-vous sûr de vouloir rejeter cette demande ?'}
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmModalVisible(false)}
                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-sm font-medium transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={handleConfirm}
                className={`flex-1 py-2.5 text-white rounded-xl text-sm font-medium transition-colors ${
                  pendingAction === 'valider' 
                    ? 'bg-emerald-600 hover:bg-emerald-700' 
                    : 'bg-red-600 hover:bg-red-700'
                }`}
              >
                {pendingAction === 'valider' ? 'Valider' : 'Rejeter'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
