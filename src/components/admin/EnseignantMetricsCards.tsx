import React from 'react';
import { 
  Users, 
  UserCheck, 
  UserX, 
  Mail, 
  Clock, 
  AlertTriangle, 
  TrendingUp, 
  Building2,
  RefreshCw,
  BarChart3,
  PieChart,
  Calendar
} from 'lucide-react';
import { EnseignantMetrics } from '@/hooks/useEnseignantMetrics';
import { Card } from '@/components/ui/Card';

interface EnseignantMetricsCardsProps {
  metrics: EnseignantMetrics;
  onRefresh?: () => void;
}

export default function EnseignantMetricsCards({ metrics, onRefresh }: EnseignantMetricsCardsProps) {
  const { loading, error, refresh } = metrics;

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-8">
        <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
        <p className="mt-3 text-sm text-slate-500">Chargement des métriques enseignants...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-8 bg-red-50 rounded-xl mx-4 my-2">
        <AlertTriangle className="h-6 w-6 text-red-500" />
        <p className="mt-2 text-sm text-red-600 text-center">{error}</p>
        {onRefresh && (
          <button
            onClick={onRefresh}
            className="mt-3 flex items-center gap-1.5 px-4 py-2 bg-white rounded-lg border border-blue-500 text-blue-500 text-sm font-medium hover:bg-blue-50 transition-colors"
          >
            <RefreshCw className="h-4 w-4" />
            <span>Réessayer</span>
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="flex gap-3 px-4 overflow-x-auto pb-2 scrollbar-thin">
      {/* Carte Volumétrie */}
      <Card className="p-4 w-56 flex-shrink-0">
        <div className="flex items-center gap-2 mb-3">
          <Users className="h-5 w-5 text-blue-500" />
          <span className="text-xs font-medium text-slate-500 uppercase">Enseignants</span>
        </div>
        <p className="text-2xl font-bold text-slate-800">{metrics.totalEnseignants}</p>
        <div className="flex gap-3 mt-2">
          <div className="flex items-center gap-1 text-xs">
            <UserCheck className="h-3 w-3 text-emerald-500" />
            <span className="text-slate-500">Actifs: {metrics.enseignantsActifs}</span>
          </div>
          <div className="flex items-center gap-1 text-xs">
            <UserX className="h-3 w-3 text-red-500" />
            <span className="text-slate-500">Inactifs: {metrics.enseignantsInactifs}</span>
          </div>
        </div>
      </Card>

      {/* Carte Invitations */}
      <Card className="p-4 w-56 flex-shrink-0">
        <div className="flex items-center gap-2 mb-3">
          <Mail className="h-5 w-5 text-amber-500" />
          <span className="text-xs font-medium text-slate-500 uppercase">Invitations</span>
        </div>
        <p className="text-2xl font-bold text-slate-800">{metrics.invitationsEnCours}</p>
        <p className="text-xs text-slate-400">en cours</p>
        <div className="flex flex-wrap gap-3 mt-2">
          <div className="flex items-center gap-1 text-xs">
            <Clock className="h-3 w-3 text-slate-400" />
            <span className="text-slate-500">Expirées: {metrics.invitationsExpirees}</span>
          </div>
          {metrics.tauxAcceptationInvitations !== null && (
            <div className="flex items-center gap-1 text-xs">
              <TrendingUp className="h-3 w-3 text-emerald-500" />
              <span className="text-slate-500">Acceptation: {metrics.tauxAcceptationInvitations}%</span>
            </div>
          )}
        </div>
        {metrics.delaiMoyenAcceptation !== null && (
          <p className="text-[10px] text-slate-400 italic mt-1">Délai moyen: {metrics.delaiMoyenAcceptation} jours</p>
        )}
      </Card>

      {/* Carte Rattachements */}
      <Card className="p-4 w-56 flex-shrink-0">
        <div className="flex items-center gap-2 mb-3">
          <Building2 className="h-5 w-5 text-emerald-500" />
          <span className="text-xs font-medium text-slate-500 uppercase">Rattachements</span>
        </div>
        <div className="flex items-center justify-around my-2">
          <div className="text-center">
            <p className="text-2xl font-bold text-slate-800">{metrics.enseignantsAvecClasses}</p>
            <p className="text-[10px] text-slate-400">avec classe(s)</p>
          </div>
          <div className="w-px h-8 bg-slate-200" />
          <div className="text-center">
            <p className="text-2xl font-bold text-slate-800">{metrics.enseignantsAvecGroupes}</p>
            <p className="text-[10px] text-slate-400">avec groupe(s)</p>
          </div>
        </div>
        {metrics.tauxEnseignantsMultiEtablissements !== null && (
          <p className="text-[10px] text-slate-400 italic text-center">
            {metrics.tauxEnseignantsMultiEtablissements}% dans plusieurs établissements
          </p>
        )}
      </Card>

      {/* Carte Alertes */}
      <Card className="p-4 w-56 flex-shrink-0 bg-amber-50 border-amber-100">
        <div className="flex items-center gap-2 mb-3">
          <AlertTriangle className="h-5 w-5 text-red-500" />
          <span className="text-xs font-medium text-slate-500 uppercase">Alertes</span>
        </div>
        
        {metrics.enseignantsSansClasseDepuis > 0 && (
          <div className="flex items-center gap-1.5 text-xs text-amber-500 mb-1.5">
            <Calendar className="h-3.5 w-3.5" />
            <span>{metrics.enseignantsSansClasseDepuis} enseignant(s) sans classe depuis &gt;7j</span>
          </div>
        )}
        
        {metrics.plafondsAtteints > 0 && (
          <div className="flex items-center gap-1.5 text-xs text-red-500 mb-1.5">
            <AlertTriangle className="h-3.5 w-3.5" />
            <span>{metrics.plafondsAtteints} département(s) à capacité maximale</span>
          </div>
        )}
        
        {metrics.groupesSansResponsable > 0 && (
          <div className="flex items-center gap-1.5 text-xs text-amber-500 mb-1.5">
            <Users className="h-3.5 w-3.5" />
            <span>{metrics.groupesSansResponsable} groupe(s) sans responsable</span>
          </div>
        )}
        
        {metrics.invitationsExpirées > 0 && (
          <div className="flex items-center gap-1.5 text-xs text-amber-500 mb-1.5">
            <Clock className="h-3.5 w-3.5" />
            <span>{metrics.invitationsExpirées} invitation(s) expirée(s)</span>
          </div>
        )}
        
        {metrics.enseignantsSansClasseDepuis === 0 && 
         metrics.plafondsAtteints === 0 && 
         metrics.groupesSansResponsable === 0 && 
         metrics.invitationsExpirées === 0 && (
          <p className="text-xs text-slate-400 italic">Aucune alerte</p>
        )}
      </Card>

      {/* Carte Plafonds par département */}
      {metrics.plafondsParDepartement.length > 0 && (
        <Card className="p-4 w-64 flex-shrink-0">
          <div className="flex items-center gap-2 mb-3">
            <BarChart3 className="h-5 w-5 text-purple-500" />
            <span className="text-xs font-medium text-slate-500 uppercase">Plafonds par département</span>
          </div>
          {metrics.plafondsParDepartement.slice(0, 3).map((dept, index) => (
            <div key={index} className="mb-3 last:mb-0">
              <div className="flex justify-between text-xs">
                <span className="font-medium text-slate-700">{dept.departement}</span>
                <span className="text-slate-500">{dept.actuel}/{dept.plafond}</span>
              </div>
              <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden mt-1">
                <div 
                  className="h-full rounded-full transition-all"
                  style={{ 
                    width: `${dept.pourcentage}%`,
                    backgroundColor: dept.pourcentage >= 90 ? '#EF4444' : 
                                    dept.pourcentage >= 70 ? '#F59E0B' : '#10B981'
                  }}
                />
              </div>
              {dept.ae_nom && (
                <p className="text-[10px] text-slate-400 mt-0.5">
                  AE: {dept.ae_prenom} {dept.ae_nom}
                </p>
              )}
            </div>
          ))}
          {metrics.plafondsParDepartement.length > 3 && (
            <p className="text-[10px] text-slate-400 italic text-center mt-1">
              +{metrics.plafondsParDepartement.length - 3} autres départements
            </p>
          )}
        </Card>
      )}

      {/* Carte Répartition par département */}
      {metrics.repartitionParDepartement.length > 0 && (
        <Card className="p-4 w-56 flex-shrink-0">
          <div className="flex items-center gap-2 mb-3">
            <PieChart className="h-5 w-5 text-blue-500" />
            <span className="text-xs font-medium text-slate-500 uppercase">Répartition par département</span>
          </div>
          {metrics.repartitionParDepartement.slice(0, 4).map((dept, index) => (
            <div key={index} className="flex justify-between items-center py-1.5 border-b border-slate-50 last:border-0">
              <span className="text-xs text-slate-600">{dept.departement}</span>
              <span className="text-xs font-semibold text-slate-800">{dept.count}</span>
            </div>
          ))}
          {metrics.repartitionParDepartement.length > 4 && (
            <p className="text-[10px] text-slate-400 italic text-center mt-1">
              +{metrics.repartitionParDepartement.length - 4} autres
            </p>
          )}
        </Card>
      )}
    </div>
  );
}
