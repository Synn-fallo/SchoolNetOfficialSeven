// /src/components/enseignant/ReleveNotesStandard.tsx
// Relevé de notes standard

import React from 'react';
import { Download } from 'lucide-react';
import { ReleveData, PeriodeType } from '@/types/releve.types';
import { exportReleveToCSV } from '@/utils/exportCSV';

interface Props {
  releve: ReleveData;
  eleveNom: string;
  elevePrenom: string;
  classeNom: string;
  type: 'officielle' | 'personnelle';
  selectedPeriode: PeriodeType;
}

const getMoyenneColor = (moyenne: number): string => {
  if (moyenne >= 12) return '#10B981';
  if (moyenne >= 10) return '#F59E0B';
  return '#EF4444';
};

export default function ReleveNotesStandard({
  releve,
  eleveNom,
  elevePrenom,
  classeNom,
  type,
  selectedPeriode,
}: Props) {
  const maxEvals = Math.max(...releve.matieres.map(m => m.evaluations.length), 0);
  const evalCols = Array.from({ length: maxEvals }, (_, i) => i);

  const handleExportCSV = () => {
    try {
      exportReleveToCSV(releve, eleveNom, elevePrenom);
      window.alert('Le fichier CSV a été exporté avec succès');
    } catch (error) {
      console.error('Erreur export CSV:', error);
      window.alert('Impossible d\'exporter le fichier CSV');
    }
  };

  return (
    <div className="flex-1 bg-gray-50 p-4">
      {/* En-tête */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 mb-4">
        <h2 className="text-xl font-bold text-gray-800">Relevé de notes</h2>
        <p className="text-sm text-gray-500">
          {elevePrenom} {eleveNom} - {classeNom}
          {type === 'officielle' && releve.classe.effectif && ` (${releve.classe.effectif} élèves)`}
        </p>
        <p className="text-xs text-gray-400 mt-2">Période : {selectedPeriode || releve.periode}</p>
      </div>

      {/* Bouton Export CSV */}
      <button
        onClick={handleExportCSV}
        className="w-full flex flex-row items-center justify-center gap-2 bg-schoolnet-primary text-white py-3 rounded-lg text-sm font-medium hover:bg-schoolnet-primary/90 transition-colors mb-4"
      >
        <Download className="w-4 h-4" />
        Exporter CSV
      </button>

      {/* Tableau */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-x-auto">
        <table className="w-full min-w-[800px] border-collapse text-sm">
          {/* En-tête */}
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left font-semibold text-gray-600 p-3 min-w-[120px]">
                Matière (coef)
              </th>
              {evalCols.map((_, idx) => (
                <th key={idx} className="text-center font-semibold text-gray-600 p-3 min-w-[70px]">
                  <div>Éval {idx + 1}</div>
                  <div className="text-xs text-gray-400 font-normal">---</div>
                </th>
              ))}
              <th className="text-center font-semibold text-gray-600 p-3 min-w-[70px]">
                Moyenne
              </th>
              <th className="text-center font-semibold text-gray-600 p-3 min-w-[60px]">
                Rang
              </th>
              <th className="text-left font-semibold text-gray-600 p-3 min-w-[100px]">
                Appréciation
              </th>
            </tr>
          </thead>

          {/* Corps */}
          <tbody>
            {releve.matieres.map((matiere, idx) => {
              const moyenneColor = getMoyenneColor(matiere.moyenne);
              
              return (
                <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="p-3 font-medium text-gray-700">
                    {matiere.nom} ({matiere.coefficient})
                  </td>
                  
                  {evalCols.map((_, colIdx) => {
                    const evalData = matiere.evaluations[colIdx];
                    const noteColor = evalData?.note ? getMoyenneColor(evalData.note) : '#6B7280';
                    
                    return (
                      <td key={colIdx} className="text-center p-3">
                        <span className="font-medium" style={{ color: noteColor }}>
                          {evalData?.note || '-'}
                        </span>
                        {evalData?.appreciation && (
                          <div className="text-xs text-gray-400 truncate max-w-[60px]">
                            {evalData.appreciation}
                          </div>
                        )}
                      </td>
                    );
                  })}
                  
                  <td className="text-center p-3 font-bold" style={{ color: moyenneColor }}>
                    {matiere.moyenne}
                  </td>
                  
                  <td className="text-center p-3 text-gray-500">
                    {matiere.rang || '-'}
                  </td>
                  
                  <td className="p-3 text-gray-500 text-sm max-w-[100px] truncate">
                    {matiere.appreciation || '-'}
                  </td>
                </tr>
              );
            })}

            {/* Ligne moyenne générale */}
            <tr className="bg-gray-50 border-t-2 border-gray-200">
              <td className="p-3 font-bold text-gray-700">Moyenne générale</td>
              {evalCols.map((_, idx) => (
                <td key={idx} className="p-3 text-center" />
              ))}
              <td className="p-3 text-center font-bold text-schoolnet-primary">
                {releve.moyenneGenerale}/20
              </td>
              <td className="p-3 text-center font-bold text-gray-700">
                {releve.rang || '-'}
              </td>
              <td className="p-3" />
            </tr>
          </tbody>
        </table>
      </div>

      {/* Statistiques */}
      {type === 'officielle' && releve.plusForteMoyenne && (
        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
          <p className="text-xs text-gray-500">
            📊 Plus forte moyenne : {releve.plusForteMoyenne.valeur} ({releve.plusForteMoyenne.eleve})
          </p>
          <p className="text-xs text-gray-500">
            📉 Plus faible moyenne : {releve.plusFaibleMoyenne?.valeur} ({releve.plusFaibleMoyenne?.eleve})
          </p>
        </div>
      )}
    </div>
  );
}
