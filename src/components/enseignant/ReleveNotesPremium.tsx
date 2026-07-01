// /src/components/enseignant/ReleveNotesPremium.tsx
// Relevé de notes premium avec options d'export

import React from 'react';
import { Download, Printer, FileText, FileSpreadsheet } from 'lucide-react';

interface Props {
  onExportPDF: () => void;
  onExportExcel: () => void;
  onPrint: () => void;
}

export default function ReleveNotesPremium({ onExportPDF, onExportExcel, onPrint }: Props) {
  return (
    <div className="bg-white mx-4 my-3 p-3 rounded-xl border border-gray-200">
      <h4 className="text-sm font-semibold text-gray-700 mb-3">📄 Export premium</h4>
      <div className="flex flex-row gap-3">
        <button
          onClick={onExportPDF}
          className="flex-1 flex flex-row items-center justify-center gap-1.5 bg-schoolnet-primary text-white py-2.5 rounded-lg text-xs font-medium hover:bg-schoolnet-primary/90 transition-colors"
        >
          <FileText className="w-4 h-4" />
          PDF
        </button>
        <button
          onClick={onExportExcel}
          className="flex-1 flex flex-row items-center justify-center gap-1.5 bg-schoolnet-primary text-white py-2.5 rounded-lg text-xs font-medium hover:bg-schoolnet-primary/90 transition-colors"
        >
          <FileSpreadsheet className="w-4 h-4" />
          Excel
        </button>
        <button
          onClick={onPrint}
          className="flex-1 flex flex-row items-center justify-center gap-1.5 bg-schoolnet-primary text-white py-2.5 rounded-lg text-xs font-medium hover:bg-schoolnet-primary/90 transition-colors"
        >
          <Printer className="w-4 h-4" />
          Imprimer
        </button>
      </div>
    </div>
  );
}
