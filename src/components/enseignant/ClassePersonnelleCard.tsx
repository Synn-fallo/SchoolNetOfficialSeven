// /src/components/enseignant/ClassePersonnelleCard.tsx
// Carte d'affichage d'une classe personnelle

import React from 'react';
import { 
  BookOpen, 
  Users, 
  FileText, 
  Trash2, 
  Edit2, 
  Download, 
  Eye 
} from 'lucide-react';
import { Card } from '@/components/ui/Card';

interface ClassePersonnelle {
  id: string;
  nom: string;
  description: string | null;
  matieres: any[];
  eleves: any[];
  created_at: string;
  updated_at: string;
}

interface ClassePersonnelleCardProps {
  classe: ClassePersonnelle;
  onPress?: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onExport: () => void;
  onManageEleves: () => void;
  onManageMatieres: () => void;
  onViewNotes: () => void;
  onPressDetails?: () => void;
}

export default function ClassePersonnelleCard({
  classe,
  onPress,
  onEdit,
  onDelete,
  onExport,
  onManageEleves,
  onManageMatieres,
  onViewNotes,
  onPressDetails,
}: ClassePersonnelleCardProps) {
  const elevesCount = classe.eleves?.length || 0;
  const matieresCount = classe.matieres?.length || 0;

  const handleDelete = () => {
    if (window.confirm(
      `Êtes-vous sûr de vouloir supprimer la classe "${classe.nom}" ?\n\nCette action est irréversible.`
    )) {
      onDelete();
    }
  };

  const handleCardClick = () => {
    if (onPress) {
      onPress();
    } else if (onPressDetails) {
      onPressDetails();
    }
  };

  return (
    <button
      onClick={handleCardClick}
      className="w-full text-left"
    >
      <Card className="p-4 mb-3 border-l-4 border-l-purple-500 hover:shadow-md transition-shadow">
        {/* En-tête */}
        <div className="flex flex-row justify-between items-start mb-2">
          <div className="flex flex-row items-center gap-2">
            <BookOpen className="w-5 h-5 text-purple-500" />
            <h3 className="text-lg font-semibold text-gray-800">{classe.nom}</h3>
          </div>
          <span className="bg-purple-500 text-white text-xs font-medium px-2 py-1 rounded-full">
            Personnel
          </span>
        </div>

        {/* Description */}
        {classe.description && (
          <p className="text-sm text-gray-500 mb-3 line-clamp-2">
            {classe.description}
          </p>
        )}

        {/* Statistiques */}
        <div className="flex flex-row gap-4 py-2 mb-3 border-t border-b border-gray-100">
          <div className="flex flex-row items-center gap-1.5">
            <Users className="w-3.5 h-3.5 text-gray-500" />
            <span className="text-xs text-gray-500">{elevesCount} élève(s)</span>
          </div>
          <div className="flex flex-row items-center gap-1.5">
            <FileText className="w-3.5 h-3.5 text-gray-500" />
            <span className="text-xs text-gray-500">{matieresCount} matière(s)</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-row flex-wrap gap-1.5">
          <button
            onClick={(e) => { e.stopPropagation(); onManageEleves(); }}
            className="flex flex-row items-center gap-1 px-2.5 py-1 bg-gray-100 hover:bg-gray-200 rounded-md text-xs text-schoolnet-primary font-medium transition-colors"
          >
            <Users className="w-3.5 h-3.5" />
            Élèves
          </button>

          <button
            onClick={(e) => { e.stopPropagation(); onManageMatieres(); }}
            className="flex flex-row items-center gap-1 px-2.5 py-1 bg-gray-100 hover:bg-gray-200 rounded-md text-xs text-schoolnet-primary font-medium transition-colors"
          >
            <FileText className="w-3.5 h-3.5" />
            Matières
          </button>

          <button
            onClick={(e) => { e.stopPropagation(); onViewNotes(); }}
            className="flex flex-row items-center gap-1 px-2.5 py-1 bg-gray-100 hover:bg-gray-200 rounded-md text-xs text-schoolnet-primary font-medium transition-colors"
          >
            <Eye className="w-3.5 h-3.5" />
            Notes
          </button>

          <button
            onClick={(e) => { e.stopPropagation(); onExport(); }}
            className="flex flex-row items-center gap-1 px-2.5 py-1 bg-gray-100 hover:bg-gray-200 rounded-md text-xs text-green-600 font-medium transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            Export
          </button>

          <button
            onClick={(e) => { e.stopPropagation(); onEdit(); }}
            className="flex flex-row items-center gap-1 px-2.5 py-1 bg-gray-100 hover:bg-gray-200 rounded-md text-xs text-amber-500 font-medium transition-colors"
          >
            <Edit2 className="w-3.5 h-3.5" />
            Modifier
          </button>

          <button
            onClick={(e) => { e.stopPropagation(); handleDelete(); }}
            className="flex flex-row items-center gap-1 px-2.5 py-1 bg-gray-100 hover:bg-red-50 rounded-md text-xs text-red-500 font-medium transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Supprimer
          </button>
        </div>
      </Card>
    </button>
  );
}
