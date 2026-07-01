// /src/components/enseignant/ClassCard.tsx
// Carte d'affichage d'une classe

import React from 'react';
import { Users, Building2, ChevronRight } from 'lucide-react';
import { Card } from '@/components/ui/Card';

interface ClassCardProps {
  id: string;
  nom: string;
  niveau: string;
  statut: 'personnel' | 'officiel' | 'archive';
  etablissementNom?: string;
  effectif: number;
  onPress: () => void;
  onRefresh?: () => void;
}

export default function ClassCard({
  nom,
  niveau,
  statut,
  etablissementNom,
  effectif,
  onPress,
}: ClassCardProps) {
  const getStatutConfig = () => {
    switch (statut) {
      case 'personnel':
        return { label: 'Personnel', color: 'text-amber-600', bgColor: 'bg-amber-100' };
      case 'officiel':
        return { label: 'Officiel', color: 'text-emerald-600', bgColor: 'bg-emerald-100' };
      case 'archive':
        return { label: 'Archivé', color: 'text-gray-500', bgColor: 'bg-gray-100' };
      default:
        return { label: 'Personnel', color: 'text-amber-600', bgColor: 'bg-amber-100' };
    }
  };

  const statutConfig = getStatutConfig();

  return (
    <button
      onClick={onPress}
      className="w-full text-left"
    >
      <Card className="p-4 mb-3 hover:shadow-md transition-shadow">
        <div className="flex flex-row justify-between items-start mb-3">
          <div className="flex-1">
            <h3 className="text-base font-semibold text-gray-800">{nom}</h3>
            <p className="text-xs text-gray-500">{niveau}</p>
          </div>
          <span className={`text-xs font-semibold px-2 py-1 rounded-full ${statutConfig.bgColor} ${statutConfig.color}`}>
            {statutConfig.label}
          </span>
        </div>

        <div className="flex flex-col gap-1.5 mb-3">
          {etablissementNom && (
            <div className="flex flex-row items-center gap-2">
              <Building2 className="w-3.5 h-3.5 text-gray-400" />
              <span className="text-xs text-gray-500">{etablissementNom}</span>
            </div>
          )}
          <div className="flex flex-row items-center gap-2">
            <Users className="w-3.5 h-3.5 text-gray-400" />
            <span className="text-xs text-gray-500">{effectif} élève(s)</span>
          </div>
        </div>

        <div className="flex justify-end pt-2 border-t border-gray-100">
          <ChevronRight className="w-4 h-4 text-gray-300" />
        </div>
      </Card>
    </button>
  );
}
