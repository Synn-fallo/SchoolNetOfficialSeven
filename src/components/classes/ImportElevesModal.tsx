// /src/components/classes/ImportElevesModal.tsx
// Import d'élèves depuis un fichier CSV

import React, { useState } from 'react';
import { X, Upload, FileText, AlertCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase.web';
import { useEleves } from '@/hooks/useEleves';
import { useEducMaster } from '@/hooks/useEducMaster';
import { Portal } from '@/components/ui/Portal';
import { Card } from '@/components/ui/Card';

interface ImportElevesModalProps {
  visible: boolean;
  onClose: () => void;
  classeId: string;
  etablissementId: string;
  onSuccess: () => void;
}

interface CSVRow {
  educmaster: string;
  nom: string;
  prenom: string;
  date_naissance?: string;
  email?: string;
  telephone?: string;
}

export default function ImportElevesModal({
  visible,
  onClose,
  classeId,
  etablissementId,
  onSuccess,
}: ImportElevesModalProps) {
  const [importing, setImporting] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const [error, setError] = useState<string | null>(null);
  const { createEleve } = useEleves();
  const { generateIdentifiant } = useEducMaster();

  if (!visible) return null;

  const parseCSV = (content: string): CSVRow[] => {
    const lines = content.split('\n');
    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
    
    const requiredColumns = ['educmaster', 'nom', 'prenom'];
    const missingColumns = requiredColumns.filter(col => !headers.includes(col));
    
    if (missingColumns.length > 0) {
      throw new Error(`Colonnes manquantes: ${missingColumns.join(', ')}`);
    }
    
    const rows: CSVRow[] = [];
    
    for (let i = 1; i < lines.length; i++) {
      if (!lines[i].trim()) continue;
      
      const values = lines[i].split(',').map(v => v.trim());
      const row: any = {};
      
      headers.forEach((header, index) => {
        row[header] = values[index] || '';
      });
      
      rows.push({
        educmaster: row.educmaster,
        nom: row.nom.toUpperCase(),
        prenom: row.prenom,
        date_naissance: row.date_naissance,
        email: row.email,
        telephone: row.telephone,
      });
    }
    
    return rows;
  };

  const importEleves = async (rows: CSVRow[]) => {
    let successCount = 0;
    let errorCount = 0;
    const errors: string[] = [];
    
    setProgress({ current: 0, total: rows.length });
    
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      setProgress({ current: i + 1, total: rows.length });
      
      try {
        // Générer l'identifiant de connexion
        const result = await generateIdentifiant(row.nom, row.educmaster);
        if (!result.success) {
          errors.push(`Ligne ${i + 2}: ${result.error}`);
          errorCount++;
          continue;
        }
        
        // Créer l'élève
        const createResult = await createEleve(
          {
            etablissement_id: etablissementId,
            educmaster: row.educmaster,
            nom: row.nom,
            prenom: row.prenom,
            date_naissance: row.date_naissance,
            email: row.email,
            telephone: row.telephone,
            classe_id: classeId,
          },
          result.identifiant
        );
        
        if (!createResult.success) {
          errors.push(`Ligne ${i + 2}: ${createResult.error}`);
          errorCount++;
        } else {
          successCount++;
        }
      } catch (err) {
        errors.push(`Ligne ${i + 2}: ${err instanceof Error ? err.message : 'Erreur inconnue'}`);
        errorCount++;
      }
    }
    
    return { successCount, errorCount, errors };
  };

  const handleImportCSV = async () => {
    try {
      // Créer un input file pour sélectionner le CSV
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = '.csv';
      
      input.onchange = async (e) => {
        const file = (e.target as HTMLInputElement).files?.[0];
        if (!file) return;
        
        try {
          const content = await file.text();
          
          setImporting(true);
          setError(null);
          
          const rows = parseCSV(content);
          
          if (rows.length === 0) {
            throw new Error('Aucune donnée trouvée dans le fichier');
          }
          
          const importResult = await importEleves(rows);
          
          if (importResult.errorCount > 0) {
            window.alert(
              `${importResult.successCount} élèves importés avec succès\n${importResult.errorCount} échecs\n\n${importResult.errors.slice(0, 5).join('\n')}${importResult.errors.length > 5 ? `\n... et ${importResult.errors.length - 5} autres erreurs` : ''}`
            );
            onSuccess();
          } else {
            window.alert(`${importResult.successCount} élèves importés avec succès`);
            onSuccess();
          }
          
          onClose();
        } catch (err) {
          console.error('Import error:', err);
          setError(err instanceof Error ? err.message : 'Erreur lors de l\'import');
        } finally {
          setImporting(false);
        }
      };
      
      input.click();
    } catch (err) {
      console.error('Import error:', err);
      setError(err instanceof Error ? err.message : 'Erreur lors de l\'import');
    }
  };

  const getCSVTemplate = () => {
    const headers = ['educmaster', 'nom', 'prenom', 'date_naissance', 'email', 'telephone'];
    const example = ['108090199031', 'GANDO', 'Modeste', '1999-01-01', 'parent@email.com', '90123456'];
    return [headers.join(','), example.join(',')].join('\n');
  };

  const downloadTemplate = () => {
    const template = getCSVTemplate();
    const date = new Date().toISOString().split('T')[0];
    const filename = `import_eleves_template_${date}.csv`;
    
    const blob = new Blob([template], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Portal>
      <div 
        className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <div 
          className="bg-white rounded-2xl w-full max-w-md max-h-[85vh] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* En-tête */}
          <div className="flex flex-row justify-between items-center px-5 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800">Importer des élèves</h3>
            <button
              onClick={onClose}
              className="p-1 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* Corps */}
          <div className="p-5">
            <div className="bg-blue-50 rounded-xl p-4 mb-4 border border-blue-200">
              <div className="flex items-start gap-3">
                <FileText className="w-5 h-5 text-schoolnet-primary flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-semibold text-blue-700">Format du fichier CSV</h4>
                  <p className="text-xs text-gray-600 mt-1">
                    Le fichier doit contenir les colonnes suivantes:
                  </p>
                  <code className="block text-xs font-mono bg-blue-100 text-blue-800 px-2 py-1 rounded mt-1">
                    educmaster,nom,prenom,date_naissance,email,telephone
                  </code>
                  <p className="text-xs text-gray-500 mt-1">
                    Exemple: 108090199031,GANDO,Modeste,1999-01-01,parent@email.com,90123456
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={downloadTemplate}
              className="w-full flex flex-row items-center justify-center gap-2 py-2.5 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium text-schoolnet-primary transition-colors mb-4"
            >
              <FileText className="w-4 h-4" />
              Télécharger le modèle CSV
            </button>

            {error && (
              <div className="flex flex-row items-start gap-2 bg-red-50 p-3 rounded-lg border border-red-200 mb-4">
                <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            {importing && (
              <div className="flex flex-col items-center justify-center py-4">
                <div className="w-8 h-8 border-4 border-schoolnet-primary border-t-transparent rounded-full animate-spin" />
                <p className="mt-3 text-sm text-gray-500">
                  Import en cours... ({progress.current}/{progress.total})
                </p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex flex-row gap-3 px-5 py-4 border-t border-gray-200">
            <button
              onClick={onClose}
              className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium text-gray-500 transition-colors"
            >
              Annuler
            </button>
            <button
              onClick={handleImportCSV}
              disabled={importing}
              className={`flex-1 flex flex-row items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium text-white transition-colors ${
                importing ? 'bg-gray-300 cursor-not-allowed' : 'bg-schoolnet-primary hover:bg-schoolnet-primary/90'
              }`}
            >
              {importing ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Upload className="w-4 h-4" />
                  Importer CSV
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </Portal>
  );
}
