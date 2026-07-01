// /src/components/enseignant/PeriodSelector.tsx
// Sélecteur de période (Semestre 1, Semestre 2, Annuel)

import React from 'react';

export type PeriodeType = 'S1' | 'S2' | 'annuel';

interface PeriodSelectorProps {
  selectedPeriode: PeriodeType;
  onPeriodeChange: (periode: PeriodeType) => void;
  disabledPeriodes?: PeriodeType[];
}

const PERIODES: { label: string; value: PeriodeType }[] = [
  { label: 'Semestre 1', value: 'S1' },
  { label: 'Semestre 2', value: 'S2' },
  { label: 'Annuel', value: 'annuel' },
];

export default function PeriodSelector({
  selectedPeriode,
  onPeriodeChange,
  disabledPeriodes = [],
}: PeriodSelectorProps) {
  return (
    <div className="flex flex-row justify-center gap-3 px-4 py-3 bg-white border-b border-gray-200">
      {PERIODES.map((periode) => {
        const isActive = selectedPeriode === periode.value;
        const isDisabled = disabledPeriodes.includes(periode.value);

        return (
          <button
            key={periode.value}
            onClick={() => !isDisabled && onPeriodeChange(periode.value)}
            disabled={isDisabled}
            className={`
              px-5 py-2 rounded-full text-sm font-medium transition-colors
              ${isActive 
                ? 'bg-schoolnet-primary text-white' 
                : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
              }
              ${isDisabled 
                ? 'bg-gray-200 text-gray-400 opacity-50 cursor-not-allowed' 
                : ''
              }
            `}
          >
            {periode.label}
          </button>
        );
      })}
    </div>
  );
}
