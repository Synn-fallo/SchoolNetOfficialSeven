// /src/components/classes/ExportClasseCSV.tsx
// Export d'une classe en CSV

import React from 'react';
import { Download } from 'lucide-react';
import { exportClassesToCSV, downloadCSV } from '@/utils/exportCSV';

interface ExportClasseCSVProps {
  classe: {
    id: string;
    nom: string;
    eleves: any[];
    matieres: any[];
  };
  onExport?: () => void;
}

export default function ExportClasseCSV({ classe, onExport }: ExportClasseCSVProps) {
  const handleExport = () => {
    try {
      // Formater les données pour l'export
      const exportData = {
        id: classe.id,
        nom: classe.nom,
        eleves: classe.eleves || [],
        matieres: classe.matieres || []
      };

      exportClassesToCSV([exportData]);
      
      if (onExport) onExport();
      
      window.alert(`La classe "${classe.nom}" a été exportée en CSV.`);
    } catch (error) {
      console.error('Error exporting class:', error);
      window.alert('Impossible d\'exporter la classe');
    }
  };

  return (
    <button
      onClick={handleExport}
      className="flex flex-row items-center gap-1.5 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-medium px-3 py-1.5 rounded-md transition-colors"
    >
      <Download className="w-3.5 h-3.5" />
      Exporter en CSV
    </button>
  );
}
