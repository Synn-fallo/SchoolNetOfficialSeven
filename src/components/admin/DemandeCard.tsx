import React from 'react';
import { Building2, Landmark, Handshake, Clock, CheckCircle, XCircle, ChevronRight, FileText } from 'lucide-react';
import { DemandeRole } from '@/hooks/useAdminDemandes';

interface DemandeCardProps {
  demande: DemandeRole;
  onPress: () => void;
}

const getRoleIcon = (role: string) => {
  switch (role) {
    case 'chef_etablissement':
      return { icon: Building2, color: '#3B82F6', bg: '#EFF6FF' };
    case 'autorite':
      return { icon: Landmark, color: '#8B5CF6', bg: '#F3E8FF' };
    case 'partenaire':
      return { icon: Handshake, color: '#10B981', bg: '#ECFDF5' };
    default:
      return { icon: FileText, color: '#6B7280', bg: '#F3F4F6' };
  }
};

const getRoleLabel = (role: string): string => {
  switch (role) {
    case 'chef_etablissement': return 'Chef d\'établissement';
    case 'autorite': return 'Autorité';
    case 'partenaire': return 'Partenaire';
    default: return role;
  }
};

const getStatutConfig = (statut: string): { label: string; color: string; icon: any } => {
  switch (statut) {
    case 'en_attente':
      return { label: 'En attente', color: '#F59E0B', icon: Clock };
    case 'valide':
      return { label: 'Validé', color: '#10B981', icon: CheckCircle };
    case 'rejete':
      return { label: 'Rejeté', color: '#EF4444', icon: XCircle };
    default:
      return { label: statut, color: '#6B7280', icon: Clock };
  }
};

export default function DemandeCard({ demande, onPress }: DemandeCardProps) {
  const roleConfig = getRoleIcon(demande.role_souhaite);
  const RoleIcon = roleConfig.icon;
  const statutConfig = getStatutConfig(demande.statut);
  const StatutIcon = statutConfig.icon;
  const userName = `${demande.user_prenom || ''} ${demande.user_nom || ''}`.trim() || 'Utilisateur';

  return (
    <button
      onClick={onPress}
      className="w-full text-left bg-white rounded-xl p-4 mb-3 border border-slate-200 shadow-sm hover:shadow-md transition-shadow"
    >
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: roleConfig.bg }}>
          <RoleIcon className="h-5 w-5" style={{ color: roleConfig.color }} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-slate-800">{getRoleLabel(demande.role_souhaite)}</p>
          <p className="text-xs text-slate-500">{userName}</p>
        </div>
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium" style={{ backgroundColor: `${statutConfig.color}15`, color: statutConfig.color }}>
          <StatutIcon className="h-3 w-3" />
          <span>{statutConfig.label}</span>
        </div>
      </div>

      <div className="flex justify-between items-center pt-2 border-t border-slate-100">
        <span className="text-xs text-slate-400">
          Demande du {new Date(demande.created_at).toLocaleDateString('fr-FR')}
        </span>
        <ChevronRight className="h-4 w-4 text-slate-400" />
      </div>
    </button>
  );
}
