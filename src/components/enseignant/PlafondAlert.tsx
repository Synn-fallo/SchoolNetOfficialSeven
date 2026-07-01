// /src/components/enseignant/PlafondAlert.tsx
// Alerte de plafond pour les départements

import React from 'react';
import { AlertTriangle, Users, ArrowRight } from 'lucide-react';

interface PlafondAlertProps {
  currentCount: number;
  plafond: number;
  departement: string;
  onContactClick?: () => void;
}

export default function PlafondAlert({
  currentCount,
  plafond,
  departement,
  onContactClick,
}: PlafondAlertProps) {
  const remaining = plafond - currentCount;
  const isAtRisk = remaining <= 2 && remaining > 0;
  const isFull = remaining === 0;

  if (isFull) {
    return (
      <div className="flex flex-row items-start gap-3 p-3 rounded-xl border border-red-200 bg-red-50 mb-4">
        <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <p className="text-sm font-semibold text-gray-800">Plafond atteint</p>
          <p className="text-sm text-gray-600">
            Le département {departement} a atteint son quota maximum de {plafond} enseignant(s).
          </p>
          {onContactClick && (
            <button
              onClick={onContactClick}
              className="flex flex-row items-center gap-1 mt-2 text-sm text-schoolnet-primary font-medium hover:underline"
            >
              Contacter le Directeur des Études
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    );
  }

  if (isAtRisk) {
    return (
      <div className="flex flex-row items-start gap-3 p-3 rounded-xl border border-yellow-200 bg-yellow-50 mb-4">
        <AlertTriangle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <p className="text-sm font-semibold text-gray-800">
            Plus que {remaining} place(s) restante(s)
          </p>
          <p className="text-sm text-gray-600">
            Le département {departement} compte actuellement {currentCount} enseignant(s) sur {plafond}.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-row items-start gap-3 p-3 rounded-xl bg-blue-50 mb-4">
      <Users className="w-5 h-5 text-schoolnet-primary flex-shrink-0 mt-0.5" />
      <div className="flex-1">
        <p className="text-sm font-semibold text-gray-800">
          Plafond du département {departement}
        </p>
        <p className="text-sm text-gray-600">
          {currentCount} enseignant(s) actuellement, capacité maximum : {plafond}
        </p>
      </div>
    </div>
  );
}
