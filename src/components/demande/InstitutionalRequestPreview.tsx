import React from 'react';
import { Building2, Landmark, Handshake, CheckCircle } from 'lucide-react';
import { InstitutionalRole } from '@/hooks/useInstitutionalRequest';

interface InstitutionalRequestPreviewProps {
  role: InstitutionalRole;
  formData: any;
  userName: string;
  userEmail: string;
  userPhone?: string;
  justificatifName?: string;
}

export default function InstitutionalRequestPreview({
  role,
  formData,
  userName,
  userEmail,
  userPhone,
  justificatifName,
}: InstitutionalRequestPreviewProps) {
  const getRoleIcon = () => {
    switch (role) {
      case 'chef_etablissement':
        return { icon: Building2, color: '#3B82F6', label: 'Chef d\'établissement' };
      case 'autorite':
        return { icon: Landmark, color: '#8B5CF6', label: 'Autorité' };
      case 'partenaire':
        return { icon: Handshake, color: '#10B981', label: 'Partenaire' };
    }
  };

  const roleConfig = getRoleIcon();
  const Icon = roleConfig.icon;
  const today = new Date();
  const formattedDate = today.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
      {/* Header de prévisualisation */}
      <div className="text-center py-3 px-4 bg-emerald-50 border-b border-emerald-200">
        <div className="flex items-center justify-center gap-2">
          <CheckCircle className="h-5 w-5 text-emerald-600" />
          <span className="text-sm font-medium text-emerald-700">Prévisualisation de votre demande</span>
        </div>
        <p className="text-xs text-slate-500 mt-0.5">Vérifiez attentivement les informations avant de confirmer l'envoi.</p>
      </div>

      {/* Lettre officielle */}
      <div className="p-5">
        {/* En-tête */}
        <div className="flex justify-between items-start mb-4">
          <div className="bg-blue-600 px-3 py-1.5 rounded">
            <span className="text-sm font-bold text-white">SchoolNet</span>
          </div>
          <span className="text-xs text-slate-500">Le {formattedDate}</span>
        </div>

        <div className="mb-4">
          <p className="text-sm font-semibold text-slate-700">À l'attention de l'équipe administrative</p>
          <p className="text-xs text-slate-500">Plateforme SchoolNet</p>
          <p className="text-xs text-slate-500">Service des demandes institutionnelles</p>
        </div>

        {/* Objet */}
        <div className="bg-amber-50 px-4 py-2.5 rounded-lg border border-amber-200 mb-4">
          <span className="text-sm font-semibold text-slate-700">Objet :</span>
          <span className="text-sm text-slate-700 ml-1">Demande d'attribution du rôle {roleConfig.label}</span>
        </div>

        {/* Corps */}
        <div className="space-y-3 text-sm text-slate-700 leading-relaxed">
          <p>Je soussigné(e), <span className="font-semibold">{userName}</span>,</p>
          <p>
            demeurant à l'adresse email <span className="font-semibold">{userEmail}</span>
            {userPhone && <span>, téléphone : <span className="font-semibold">{userPhone}</span></span>},
          </p>
          <p>
            ai l'honneur de solliciter auprès de votre institution l'attribution du rôle{' '}
            <span className="font-semibold">{roleConfig.label}</span> sur la plateforme SchoolNet.
          </p>

          <div className="pt-2">
            <p className="font-semibold text-slate-800 mb-1.5">📌 Informations fournies :</p>
            
            {role === 'chef_etablissement' && (
              <div className="space-y-1 text-sm pl-2">
                <p>• Nom de l'établissement : <span className="font-medium text-slate-800">{formData.nom_etablissement}</span></p>
                <p>• Ville : <span className="font-medium text-slate-800">{formData.ville}</span></p>
                <p>• Adresse : <span className="font-medium text-slate-800">{formData.adresse}</span></p>
                <p>• Téléphone : <span className="font-medium text-slate-800">{formData.telephone_etablissement}</span></p>
                <p>• Statut juridique : <span className="font-medium text-slate-800">{formData.statut_juridique}</span></p>
              </div>
            )}

            {role === 'autorite' && (
              <div className="space-y-1 text-sm pl-2">
                <p>• Institution : <span className="font-medium text-slate-800">{formData.institution_nom}</span></p>
                <p>• Fonction : <span className="font-medium text-slate-800">{formData.fonction}</span></p>
              </div>
            )}

            {role === 'partenaire' && (
              <div className="space-y-1 text-sm pl-2">
                <p>• Organisation : <span className="font-medium text-slate-800">{formData.organisation_nom}</span></p>
                <p>• Secteur d'activité : <span className="font-medium text-slate-800">{formData.secteur}</span></p>
              </div>
            )}
          </div>

          {formData.message && (
            <div className="pt-1">
              <p className="font-semibold text-slate-800 mb-0.5">📌 Message complémentaire :</p>
              <p className="text-sm text-slate-600 italic bg-slate-50 p-3 rounded-lg">"{formData.message}"</p>
            </div>
          )}

          <div className="pt-1">
            <p className="font-semibold text-slate-800 mb-0.5">📌 Pièces justificatives jointes :</p>
            {justificatifName ? (
              <p className="text-sm text-emerald-600">• {justificatifName}</p>
            ) : (
              <p className="text-sm text-red-500 italic">Aucun justificatif joint</p>
            )}
          </div>

          <div className="border-t border-slate-200 pt-3 mt-2">
            <p className="text-xs text-slate-500 italic">
              Je certifie sur l'honneur l'exactitude des informations fournies et je m'engage à respecter 
              les conditions générales d'utilisation de la plateforme SchoolNet.
            </p>
          </div>

          <div className="text-right pt-2">
            <p className="text-xs text-slate-500">Fait à {formData.ville || '[...]'}, le {formattedDate}</p>
            <p className="text-sm font-semibold text-slate-800">{userName}</p>
          </div>
        </div>

        {/* Pied de lettre */}
        <div className="mt-4 pt-3 border-t border-slate-200 bg-slate-50 -mx-5 px-5 py-3">
          <p className="text-xs text-slate-500 text-center">
            Une copie de cette demande vous sera adressée par email. Vous serez notifié de l'avancement de votre dossier.
          </p>
        </div>
      </div>
    </div>
  );
}
