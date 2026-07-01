// /src/components/enseignant/RapportMigration.tsx
// Rapport final de migration

import React from 'react';
import { CheckCircle, XCircle, AlertCircle, FileText } from 'lucide-react';
import { Card } from '@/components/ui/Card';

interface RapportMigrationProps {
  rapport: {
    success: boolean;
    evaluations_transferees: number;
    notes_transferees: number;
    notes_ecrasees: number;
    notes_ignorees: number;
    details: Array<{
      evaluation: string;
      statut: string;
      message?: string;
    }>;
  };
  onClose: () => void;
}

export default function RapportMigration({ rapport, onClose }: RapportMigrationProps) {
  const getStatutIcon = (statut: string) => {
    switch (statut) {
      case 'success': return <CheckCircle className="w-4 h-4 text-emerald-500" />;
      case 'partial': return <AlertCircle className="w-4 h-4 text-amber-500" />;
      case 'failed': return <XCircle className="w-4 h-4 text-red-500" />;
      default: return <AlertCircle className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatutText = (statut: string) => {
    switch (statut) {
      case 'success': return 'Succès';
      case 'partial': return 'Partiel';
      case 'failed': return 'Échec';
      default: return 'Inconnu';
    }
  };

  const getStatutColor = (statut: string) => {
    switch (statut) {
      case 'success': return 'text-emerald-600';
      case 'partial': return 'text-amber-600';
      case 'failed': return 'text-red-600';
      default: return 'text-gray-400';
    }
  };

  return (
    <Card className="p-5 mb-4">
      <div className="text-center mb-5">
        <FileText className={`w-8 h-8 mx-auto ${rapport.success ? 'text-emerald-500' : 'text-red-500'}`} />
        <h3 className="text-xl font-bold text-gray-800 mt-2">
          {rapport.success ? 'Transfert réussi' : 'Transfert partiel'}
        </h3>
      </div>
      
      <div className="flex flex-row flex-wrap justify-around gap-4 mb-5 pb-4 border-b border-gray-200">
        <div className="text-center">
          <p className="text-2xl font-bold text-emerald-500">{rapport.evaluations_transferees}</p>
          <p className="text-xs text-gray-400">Évaluations transférées</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-emerald-500">{rapport.notes_transferees}</p>
          <p className="text-xs text-gray-400">Notes transférées</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-amber-500">{rapport.notes_ecrasees}</p>
          <p className="text-xs text-gray-400">Notes écrasées</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-red-500">{rapport.notes_ignorees}</p>
          <p className="text-xs text-gray-400">Notes ignorées</p>
        </div>
      </div>
      
      <h4 className="text-sm font-semibold text-gray-700 mb-3">Détails par évaluation :</h4>
      <div className="max-h-[300px] overflow-y-auto">
        {rapport.details.map((detail, index) => (
          <div key={index} className="flex flex-row items-start gap-2.5 py-2.5 border-b border-gray-100 last:border-0">
            {getStatutIcon(detail.statut)}
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-700">{detail.evaluation}</p>
              {detail.message && (
                <p className="text-xs text-gray-400">{detail.message}</p>
              )}
            </div>
            <span className={`text-xs font-medium ${getStatutColor(detail.statut)}`}>
              {getStatutText(detail.statut)}
            </span>
          </div>
        ))}
      </div>
      
      <button
        onClick={onClose}
        className="w-full bg-schoolnet-primary text-white py-3 rounded-lg text-sm font-semibold hover:bg-schoolnet-primary/90 transition-colors mt-4"
      >
        Fermer
      </button>
    </Card>
  );
}
