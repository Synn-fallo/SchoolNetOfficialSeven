// /src/components/enseignant/UpgradeBanner.tsx
// Bannière de mise à niveau vers Premium

import React from 'react';
import { Crown } from 'lucide-react';

interface UpgradeBannerProps {
  onUpgrade?: () => void;
}

export default function UpgradeBanner({ onUpgrade }: UpgradeBannerProps) {
  return (
    <div className="flex flex-row items-center gap-3 mx-4 my-3 p-3 rounded-xl bg-amber-50 border border-amber-200">
      <Crown className="w-6 h-6 text-amber-500 flex-shrink-0" />
      <div className="flex-1">
        <p className="text-sm font-semibold text-amber-800">
          Débloquez l'export PDF/Excel
        </p>
        <p className="text-xs text-amber-700">
          Passez à l'abonnement Premium
        </p>
      </div>
      {onUpgrade && (
        <button
          onClick={onUpgrade}
          className="bg-amber-500 hover:bg-amber-600 text-white text-xs font-semibold px-4 py-2 rounded-lg transition-colors"
        >
          Upgrade
        </button>
      )}
    </div>
  );
}
