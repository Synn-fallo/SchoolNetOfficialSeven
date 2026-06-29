import React from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import RequestStatus, { RequestStatusType } from './RequestStatus';
import { Mail, Phone, MapPin, Globe, Building2, User, Calendar, FileText } from 'lucide-react';

interface RequestDetailProps {
  request: any;
  type: 'etablissement' | 'partenariat';
  onCancel?: (id: string) => Promise<void>;
  onBack: () => void;
}

export default function RequestDetail({ request, type, onCancel, onBack }: RequestDetailProps) {
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

  const handleCancel = () => {
    if (!confirm('Êtes-vous sûr de vouloir annuler cette demande ? Cette action est irréversible.')) return;
    if (onCancel) {
      onCancel(request.id);
    }
  };

  const handleEmailPress = (email: string) => {
    window.open(`mailto:${email}`, '_blank');
  };

  const handlePhonePress = (phone: string) => {
    window.open(`tel:${phone}`, '_blank');
  };

  const isCancelable = request.statut === 'en_attente';

  if (type === 'etablissement') {
    return (
      <div className="flex-1 bg-slate-50 overflow-y-auto">
        <div className="p-4 max-w-2xl mx-auto">
          {/* Header */}
          <div className="flex justify-between items-center mb-5">
            <div className="flex items-center gap-3">
              <Building2 className="h-8 w-8 text-blue-500" />
              <h3 className="text-xl font-bold text-slate-800">Demande d'établissement</h3>
            </div>
            <RequestStatus status={request.statut} />
          </div>

          {/* Informations */}
          <Card className="p-4 mb-4">
            <h4 className="text-sm font-semibold text-slate-700 mb-3">Informations générales</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between border-b border-slate-100 pb-1.5">
                <span className="text-slate-500">Nom:</span>
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
                <button
                  onClick={() => handlePhonePress(request.telephone)}
                  className="font-medium text-blue-600 hover:underline"
                >
                  {request.telephone}
                </button>
              </div>
              <div className="flex justify-between border-b border-slate-100 pb-1.5">
                <span className="text-slate-500">Email:</span>
                <button
                  onClick={() => handleEmailPress(request.email_contact)}
                  className="font-medium text-blue-600 hover:underline"
                >
                  {request.email_contact}
                </button>
              </div>
              {request.site_web && (
                <div className="flex justify-between border-b border-slate-100 pb-1.5">
                  <span className="text-slate-500">Site web:</span>
                  <span className="font-medium text-slate-800">{request.site_web}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-slate-500">Plan souhaité:</span>
                <span className="font-medium text-slate-800">{request.plan_souhaite}</span>
              </div>
            </div>
          </Card>

          {/* Message */}
          {request.message_demandeur && (
            <Card className="p-4 mb-4">
              <h4 className="text-sm font-semibold text-slate-700 mb-2">Message</h4>
              <p className="text-sm text-slate-600 leading-relaxed">{request.message_demandeur}</p>
            </Card>
          )}

          {/* Traitement */}
          {request.traitee_at && (
            <Card className="p-4 mb-4">
              <h4 className="text-sm font-semibold text-slate-700 mb-3">Traitement</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between border-b border-slate-100 pb-1.5">
                  <span className="text-slate-500">Date de traitement:</span>
                  <span className="font-medium text-slate-800">{formatDate(request.traitee_at)}</span>
                </div>
                {request.commentaire_admin && (
                  <div className="flex justify-between">
                    <span className="text-slate-500">Commentaire:</span>
                    <span className="font-medium text-slate-800">{request.commentaire_admin}</span>
                  </div>
                )}
              </div>
            </Card>
          )}

          {/* Boutons */}
          <div className="flex gap-3 justify-center mt-4">
            <button
              onClick={onBack}
              className="px-6 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-sm font-medium transition-colors"
            >
              Retour
            </button>
            {isCancelable && (
              <button
                onClick={handleCancel}
                className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-medium transition-colors"
              >
                Annuler la demande
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Partenariat view
  return (
    <div className="flex-1 bg-slate-50 overflow-y-auto">
      <div className="p-4 max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-5">
          <div className="flex items-center gap-3">
            <Building2 className="h-8 w-8 text-blue-500" />
            <h3 className="text-xl font-bold text-slate-800">Demande de partenariat</h3>
          </div>
          <RequestStatus status={request.statut} />
        </div>

        {/* Organisation */}
        <Card className="p-4 mb-4">
          <h4 className="text-sm font-semibold text-slate-700 mb-3">Organisation</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between border-b border-slate-100 pb-1.5">
              <span className="text-slate-500">Nom:</span>
              <span className="font-medium text-slate-800">{request.organisation_nom}</span>
            </div>
            <div className="flex justify-between border-b border-slate-100 pb-1.5">
              <span className="text-slate-500">Type:</span>
              <span className="font-medium text-slate-800">{request.type_partenaire}</span>
            </div>
            {request.organisation_site && (
              <div className="flex justify-between border-b border-slate-100 pb-1.5">
                <span className="text-slate-500">Site web:</span>
                <span className="font-medium text-slate-800">{request.organisation_site}</span>
              </div>
            )}
            {request.organisation_siege && (
              <div className="flex justify-between">
                <span className="text-slate-500">Siège:</span>
                <span className="font-medium text-slate-800">{request.organisation_siege}</span>
              </div>
            )}
          </div>
        </Card>

        {/* Contact */}
        <Card className="p-4 mb-4">
          <h4 className="text-sm font-semibold text-slate-700 mb-3">Contact</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between border-b border-slate-100 pb-1.5">
              <span className="text-slate-500">Nom:</span>
              <span className="font-medium text-slate-800">{request.contact_nom}</span>
            </div>
            <div className="flex justify-between border-b border-slate-100 pb-1.5">
              <span className="text-slate-500">Email:</span>
              <button
                onClick={() => handleEmailPress(request.contact_email)}
                className="font-medium text-blue-600 hover:underline"
              >
                {request.contact_email}
              </button>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Téléphone:</span>
              <button
                onClick={() => handlePhonePress(request.contact_telephone)}
                className="font-medium text-blue-600 hover:underline"
              >
                {request.contact_telephone}
              </button>
            </div>
          </div>
        </Card>

        {/* Proposition */}
        <Card className="p-4 mb-4">
          <h4 className="text-sm font-semibold text-slate-700 mb-2">Proposition</h4>
          <p className="text-sm text-slate-500 mb-2">Type de collaboration: {request.type_collaboration}</p>
          <p className="text-sm text-slate-600 leading-relaxed">{request.proposition}</p>
          {request.montant_propose && (
            <div className="flex justify-between mt-3 pt-2 border-t border-slate-100">
              <span className="text-sm text-slate-500">Montant proposé:</span>
              <span className="text-sm font-medium text-slate-800">{Number(request.montant_propose).toLocaleString()} FCFA</span>
            </div>
          )}
        </Card>

        {/* Notes internes */}
        {request.notes_internes && (
          <Card className="p-4 mb-4">
            <h4 className="text-sm font-semibold text-slate-700 mb-2">Notes internes</h4>
            <p className="text-sm text-slate-600 leading-relaxed">{request.notes_internes}</p>
          </Card>
        )}

        {/* Boutons */}
        <div className="flex gap-3 justify-center mt-4">
          <button
            onClick={onBack}
            className="px-6 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-sm font-medium transition-colors"
          >
            Retour
          </button>
          {isCancelable && (
            <button
              onClick={handleCancel}
              className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-medium transition-colors"
            >
              Annuler la demande
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
