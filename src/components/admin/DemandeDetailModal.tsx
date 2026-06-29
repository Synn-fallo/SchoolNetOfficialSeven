import React, { useState } from 'react';
import { X, CheckCircle, XCircle, FileText, Eye, User, Mail, Phone, Building2, MapPin, Briefcase } from 'lucide-react';
import { DemandeRole } from '@/hooks/useAdminDemandes';

interface DemandeDetailModalProps {
  visible: boolean;
  demande: DemandeRole | null;
  onClose: () => void;
  onValidate: (demandeId: string, commentaire?: string) => Promise<boolean>;
  onReject: (demandeId: string, motif: string) => Promise<boolean>;
  isLoading?: boolean;
}

const getRoleLabel = (role: string): string => {
  switch (role) {
    case 'chef_etablissement': return 'Chef d\'établissement';
    case 'autorite': return 'Autorité';
    case 'partenaire': return 'Partenaire';
    default: return role;
  }
};

export default function DemandeDetailModal({
  visible,
  demande,
  onClose,
  onValidate,
  onReject,
  isLoading = false,
}: DemandeDetailModalProps) {
  const [rejectMotif, setRejectMotif] = useState('');
  const [showRejectInput, setShowRejectInput] = useState(false);
  const [validating, setValidating] = useState(false);
  const [rejecting, setRejecting] = useState(false);

  if (!visible || !demande) return null;

  const handleValidate = async () => {
    setValidating(true);
    const success = await onValidate(demande.id);
    setValidating(false);
    if (success) {
      alert('✅ La demande a été validée et le rôle a été attribué.');
      onClose();
    }
  };

  const handleReject = async () => {
    if (!rejectMotif.trim()) {
      alert('❌ Veuillez indiquer un motif de rejet.');
      return;
    }
    setRejecting(true);
    const success = await onReject(demande.id, rejectMotif);
    setRejecting(false);
    if (success) {
      alert('✅ La demande a été rejetée.');
      setShowRejectInput(false);
      setRejectMotif('');
      onClose();
    }
  };

  const openJustificatif = () => {
    if (demande.justificatif_url) {
      window.open(demande.justificatif_url, '_blank');
    }
  };

  const renderMetadata = () => {
    const metadata = demande.metadata || {};
    
    if (demande.role_souhaite === 'chef_etablissement') {
      return (
        <div className="bg-white rounded-xl p-4 border border-slate-200 mb-4">
          <p className="text-sm font-semibold text-slate-700 mb-3">Informations du demandeur</p>
          <div className="flex items-center gap-2.5 text-sm text-slate-600 mb-1.5">
            <User className="h-4 w-4 text-slate-400" />
            <span>Nom complet: {metadata.user_prenom || ''} {metadata.user_nom || 'Non renseigné'}</span>
          </div>
          <div className="flex items-center gap-2.5 text-sm text-slate-600 mb-1.5">
            <Mail className="h-4 w-4 text-slate-400" />
            <span>Email: {metadata.user_email || 'Non renseigné'}</span>
          </div>
          <div className="flex items-center gap-2.5 text-sm text-slate-600">
            <Phone className="h-4 w-4 text-slate-400" />
            <span>Téléphone: {metadata.user_telephone || 'Non renseigné'}</span>
          </div>
        </div>
      );
    }
    
    if (demande.role_souhaite === 'autorite') {
      return (
        <div className="bg-white rounded-xl p-4 border border-slate-200 mb-4">
          <p className="text-sm font-semibold text-slate-700 mb-3">Informations autorité</p>
          <div className="flex items-center gap-2.5 text-sm text-slate-600 mb-1.5">
            <User className="h-4 w-4 text-slate-400" />
            <span>Nom: {metadata.user_prenom || ''} {metadata.user_nom || 'Non renseigné'}</span>
          </div>
          <div className="flex items-center gap-2.5 text-sm text-slate-600 mb-1.5">
            <Mail className="h-4 w-4 text-slate-400" />
            <span>Email: {metadata.user_email || 'Non renseigné'}</span>
          </div>
          <div className="flex items-center gap-2.5 text-sm text-slate-600 mb-1.5">
            <Phone className="h-4 w-4 text-slate-400" />
            <span>Téléphone: {metadata.user_telephone || 'Non renseigné'}</span>
          </div>
          <div className="flex items-center gap-2.5 text-sm text-slate-600 mb-1.5">
            <Building2 className="h-4 w-4 text-slate-400" />
            <span>Institution: {metadata.institution_nom || 'Non renseignée'}</span>
          </div>
          <div className="flex items-center gap-2.5 text-sm text-slate-600">
            <Briefcase className="h-4 w-4 text-slate-400" />
            <span>Fonction: {metadata.fonction || 'Non renseignée'}</span>
          </div>
        </div>
      );
    }
    
    if (demande.role_souhaite === 'partenaire') {
      return (
        <div className="bg-white rounded-xl p-4 border border-slate-200 mb-4">
          <p className="text-sm font-semibold text-slate-700 mb-3">Informations partenaire</p>
          <div className="flex items-center gap-2.5 text-sm text-slate-600 mb-1.5">
            <User className="h-4 w-4 text-slate-400" />
            <span>Nom: {metadata.user_prenom || ''} {metadata.user_nom || 'Non renseigné'}</span>
          </div>
          <div className="flex items-center gap-2.5 text-sm text-slate-600 mb-1.5">
            <Mail className="h-4 w-4 text-slate-400" />
            <span>Email: {metadata.user_email || 'Non renseigné'}</span>
          </div>
          <div className="flex items-center gap-2.5 text-sm text-slate-600 mb-1.5">
            <Phone className="h-4 w-4 text-slate-400" />
            <span>Téléphone: {metadata.user_telephone || 'Non renseigné'}</span>
          </div>
          <div className="flex items-center gap-2.5 text-sm text-slate-600 mb-1.5">
            <Building2 className="h-4 w-4 text-slate-400" />
            <span>Organisation: {metadata.organisation_nom || 'Non renseignée'}</span>
          </div>
          <div className="flex items-center gap-2.5 text-sm text-slate-600">
            <Briefcase className="h-4 w-4 text-slate-400" />
            <span>Secteur: {metadata.secteur || 'Non renseigné'}</span>
          </div>
        </div>
      );
    }
    
    return null;
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-slate-100">
          <h3 className="text-lg font-semibold text-slate-800">
            Demande {getRoleLabel(demande.role_souhaite)}
          </h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Métadonnées spécifiques */}
          {renderMetadata()}

          {/* Message complémentaire */}
          {demande.message && (
            <div className="bg-white rounded-xl p-4 border border-slate-200 mb-4">
              <p className="text-sm font-semibold text-slate-700 mb-2">📌 Message complémentaire</p>
              <p className="text-sm text-slate-600">{demande.message}</p>
            </div>
          )}

          {/* Justificatif */}
          <div className="bg-white rounded-xl p-4 border border-slate-200 mb-4">
            <p className="text-sm font-semibold text-slate-700 mb-2">📌 Pièce justificative</p>
            {demande.justificatif_url ? (
              <button
                onClick={openJustificatif}
                className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 transition-colors"
              >
                <FileText className="h-4 w-4" />
                <span>Voir le justificatif</span>
                <Eye className="h-4 w-4" />
              </button>
            ) : (
              <p className="text-sm text-slate-400 italic">Aucun justificatif fourni</p>
            )}
          </div>

          {/* Date de demande */}
          <div className="bg-white rounded-xl p-4 border border-slate-200">
            <p className="text-sm font-semibold text-slate-700 mb-2">📌 Date de demande</p>
            <p className="text-sm text-slate-600">
              {new Date(demande.created_at).toLocaleDateString('fr-FR', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </p>
          </div>

          {/* Commentaire admin si déjà traité */}
          {demande.statut !== 'en_attente' && demande.commentaire_admin && (
            <div className="bg-white rounded-xl p-4 border border-slate-200 mt-4">
              <p className="text-sm font-semibold text-slate-700 mb-2">
                {demande.statut === 'valide' ? '✅ Commentaire de validation' : '❌ Motif du rejet'}
              </p>
              <p className="text-sm text-slate-600">{demande.commentaire_admin}</p>
            </div>
          )}
        </div>

        {/* Actions admin */}
        {demande.statut === 'en_attente' && (
          <div className="p-6 border-t border-slate-100 bg-slate-50">
            <div className="flex flex-col gap-3">
              <button
                onClick={handleValidate}
                disabled={validating || isLoading}
                className="flex items-center justify-center gap-2 w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold text-sm transition-colors disabled:opacity-60"
              >
                {validating ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4" />
                    <span>Valider la demande</span>
                  </>
                )}
              </button>

              {!showRejectInput ? (
                <button
                  onClick={() => setShowRejectInput(true)}
                  disabled={isLoading}
                  className="flex items-center justify-center gap-2 w-full py-3.5 bg-white border border-red-500 text-red-500 rounded-xl font-semibold text-sm hover:bg-red-50 transition-colors disabled:opacity-60"
                >
                  <XCircle className="h-4 w-4" />
                  <span>Rejeter</span>
                </button>
              ) : (
                <div className="bg-white rounded-xl p-4 border border-red-300">
                  <textarea
                    className="w-full min-h-[80px] p-3 bg-slate-50 rounded-lg text-sm text-slate-800 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 resize-none"
                    placeholder="Motif du rejet..."
                    value={rejectMotif}
                    onChange={(e) => setRejectMotif(e.target.value)}
                  />
                  <div className="flex justify-end gap-3 mt-3">
                    <button
                      onClick={() => {
                        setShowRejectInput(false);
                        setRejectMotif('');
                      }}
                      className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 transition-colors"
                    >
                      Annuler
                    </button>
                    <button
                      onClick={handleReject}
                      disabled={rejecting}
                      className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-60"
                    >
                      {rejecting ? (
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        'Confirmer le rejet'
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
