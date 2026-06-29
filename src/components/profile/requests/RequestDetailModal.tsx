import React from 'react';
import { X, Mail, Phone, MapPin, Building2, FileText, Calendar, User, Briefcase, Handshake } from 'lucide-react';
import { supabase } from '@/lib/supabase.web';
import { useAuth } from '@/contexts/AuthContext';

interface RequestDetailModalProps {
  visible: boolean;
  request: any;
  type: 'role' | 'etablissement' | 'partenariat';
  onClose: () => void;
  onRefresh?: () => void;
}

export default function RequestDetailModal({ visible, request, type, onClose, onRefresh }: RequestDetailModalProps) {
  const { user } = useAuth();

  if (!visible || !request) return null;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusColor = (statut: string) => {
    switch (statut) {
      case 'en_attente': return '#F59E0B';
      case 'en_cours': return '#3B82F6';
      case 'valide': return '#10B981';
      case 'rejete': return '#EF4444';
      case 'annule': return '#6B7280';
      default: return '#6B7280';
    }
  };

  const getStatusLabel = (statut: string) => {
    switch (statut) {
      case 'en_attente': return 'En attente';
      case 'en_cours': return 'En cours';
      case 'valide': return 'Validé';
      case 'rejete': return 'Rejeté';
      case 'annule': return 'Annulé';
      default: return statut;
    }
  };

  const handleCancel = async () => {
    if (!confirm('Êtes-vous sûr de vouloir annuler cette demande ?')) return;

    let table = '';
    let idField = 'id';

    if (type === 'role') {
      table = 'demandes_role';
    } else if (type === 'etablissement') {
      table = 'demandes_etablissement';
      idField = 'id';
    } else {
      table = 'demandes_partenariat';
      idField = 'id';
    }

    const { error } = await supabase
      .from(table)
      .update({ statut: 'annule' })
      .eq(idField, request.id);

    if (error) {
      alert('❌ Impossible d\'annuler la demande');
    } else {
      alert('✅ Demande annulée');
      if (onRefresh) onRefresh();
      onClose();
    }
  };

  const renderRoleContent = () => {
    const metadata = request.metadata || {};
    return (
      <>
        <div className="flex items-center gap-2.5 text-sm text-slate-600 mb-2">
          <User className="h-4 w-4 text-slate-400" />
          <span>Rôle demandé: {request.role_souhaite}</span>
        </div>
        {metadata.institution_nom && (
          <div className="flex items-center gap-2.5 text-sm text-slate-600 mb-2">
            <Building2 className="h-4 w-4 text-slate-400" />
            <span>Institution: {metadata.institution_nom}</span>
          </div>
        )}
        {metadata.fonction && (
          <div className="flex items-center gap-2.5 text-sm text-slate-600 mb-2">
            <Briefcase className="h-4 w-4 text-slate-400" />
            <span>Fonction: {metadata.fonction}</span>
          </div>
        )}
        {metadata.organisation_nom && (
          <div className="flex items-center gap-2.5 text-sm text-slate-600 mb-2">
            <Handshake className="h-4 w-4 text-slate-400" />
            <span>Organisation: {metadata.organisation_nom}</span>
          </div>
        )}
        {request.message && (
          <div className="mt-3 pt-3 border-t border-slate-100">
            <p className="text-xs font-semibold text-slate-500 mb-1">Message :</p>
            <p className="text-sm text-slate-600">{request.message}</p>
          </div>
        )}
        {request.justificatif_url && (
          <button
            onClick={() => window.open(request.justificatif_url, '_blank')}
            className="flex items-center gap-2 mt-3 text-sm text-blue-600 hover:text-blue-700 transition-colors"
          >
            <FileText className="h-4 w-4" />
            <span>Voir le justificatif</span>
          </button>
        )}
      </>
    );
  };

  const renderEtablissementContent = () => {
    return (
      <>
        <div className="flex items-center gap-2.5 text-sm text-slate-600 mb-2">
          <Building2 className="h-4 w-4 text-slate-400" />
          <span>Établissement: {request.nom_etablissement}</span>
        </div>
        <div className="flex items-center gap-2.5 text-sm text-slate-600 mb-2">
          <MapPin className="h-4 w-4 text-slate-400" />
          <span>Ville: {request.ville}</span>
        </div>
        <div className="flex items-center gap-2.5 text-sm text-slate-600 mb-2">
          <MapPin className="h-4 w-4 text-slate-400" />
          <span>Adresse: {request.adresse}</span>
        </div>
        <div className="flex items-center gap-2.5 text-sm text-slate-600 mb-2">
          <Phone className="h-4 w-4 text-slate-400" />
          <span>Téléphone: {request.telephone}</span>
        </div>
        <div className="flex items-center gap-2.5 text-sm text-slate-600 mb-2">
          <Mail className="h-4 w-4 text-slate-400" />
          <span>Email: {request.email_contact}</span>
        </div>
        <div className="flex items-center gap-2.5 text-sm text-slate-600 mb-2">
          <FileText className="h-4 w-4 text-slate-400" />
          <span>Plan souhaité: {request.plan_souhaite}</span>
        </div>
        {request.message_demandeur && (
          <div className="mt-3 pt-3 border-t border-slate-100">
            <p className="text-xs font-semibold text-slate-500 mb-1">Message :</p>
            <p className="text-sm text-slate-600">{request.message_demandeur}</p>
          </div>
        )}
        {request.commentaire_admin && (
          <div className="mt-3 pt-3 border-t border-slate-100">
            <p className="text-xs font-semibold text-slate-500 mb-1">Commentaire admin :</p>
            <p className="text-sm text-slate-600">{request.commentaire_admin}</p>
          </div>
        )}
      </>
    );
  };

  const renderPartenariatContent = () => {
    return (
      <>
        <div className="flex items-center gap-2.5 text-sm text-slate-600 mb-2">
          <Building2 className="h-4 w-4 text-slate-400" />
          <span>Organisation: {request.organisation_nom}</span>
        </div>
        <div className="flex items-center gap-2.5 text-sm text-slate-600 mb-2">
          <Briefcase className="h-4 w-4 text-slate-400" />
          <span>Type: {request.type_partenaire}</span>
        </div>
        <div className="flex items-center gap-2.5 text-sm text-slate-600 mb-2">
          <User className="h-4 w-4 text-slate-400" />
          <span>Contact: {request.contact_nom}</span>
        </div>
        <div className="flex items-center gap-2.5 text-sm text-slate-600 mb-2">
          <Mail className="h-4 w-4 text-slate-400" />
          <span>Email: {request.contact_email}</span>
        </div>
        <div className="flex items-center gap-2.5 text-sm text-slate-600 mb-2">
          <Phone className="h-4 w-4 text-slate-400" />
          <span>Téléphone: {request.contact_telephone}</span>
        </div>
        <div className="flex items-center gap-2.5 text-sm text-slate-600 mb-2">
          <Handshake className="h-4 w-4 text-slate-400" />
          <span>Collaboration: {request.type_collaboration}</span>
        </div>
        {request.proposition && (
          <div className="mt-3 pt-3 border-t border-slate-100">
            <p className="text-xs font-semibold text-slate-500 mb-1">Proposition :</p>
            <p className="text-sm text-slate-600">{request.proposition}</p>
          </div>
        )}
        {request.notes_internes && (
          <div className="mt-3 pt-3 border-t border-slate-100">
            <p className="text-xs font-semibold text-slate-500 mb-1">Notes internes :</p>
            <p className="text-sm text-slate-600">{request.notes_internes}</p>
          </div>
        )}
      </>
    );
  };

  const isCancelable = request.statut === 'en_attente' || request.statut === 'en_cours';

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-slate-100">
          <h3 className="text-lg font-semibold text-slate-800">
            {type === 'role' && 'Demande de rôle'}
            {type === 'etablissement' && "Demande d'établissement"}
            {type === 'partenariat' && 'Demande de partenariat'}
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
          <div className="inline-flex px-2.5 py-1 rounded-full text-xs font-medium mb-4" style={{ 
            backgroundColor: `${getStatusColor(request.statut)}15`,
            color: getStatusColor(request.statut)
          }}>
            {getStatusLabel(request.statut)}
          </div>

          {type === 'role' && renderRoleContent()}
          {type === 'etablissement' && renderEtablissementContent()}
          {type === 'partenariat' && renderPartenariatContent()}

          <div className="flex items-center gap-1.5 mt-5 pt-4 border-t border-slate-100">
            <Calendar className="h-3.5 w-3.5 text-slate-400" />
            <span className="text-xs text-slate-400">
              Demandé le {formatDate(request.created_at)}
            </span>
          </div>

          {isCancelable && (
            <button
              onClick={handleCancel}
              className="w-full mt-4 py-3 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl text-sm font-medium transition-colors"
            >
              Annuler la demande
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
