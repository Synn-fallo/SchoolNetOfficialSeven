import React, { useState, useEffect } from 'react';
import { X, Check } from 'lucide-react';

export interface MotifRefus {
  value: string;
  label: string;
  requiresPrecision?: boolean;
}

export const MOTIFS_REFUS: MotifRefus[] = [
  { value: 'educmaster_invalide', label: 'EducMaster invalide ou non reconnu' },
  { value: 'documents_manquants', label: 'Documents justificatifs manquants' },
  { value: 'classe_indisponible', label: 'Classe demandée non disponible' },
  { value: 'age_non_conforme', label: 'Âge non conforme au niveau demandé' },
  { value: 'capacite_atteinte', label: 'Effectif maximum de la classe atteint' },
  { value: 'doublon_etablissement', label: 'Élève déjà inscrit dans cet établissement' },
  { value: 'irregularite_dossier', label: 'Irrégularité dans le dossier' },
  { value: 'autre', label: 'Autre motif', requiresPrecision: true },
];

interface MotifRefusSelectProps {
  visible: boolean;
  selectedMotifs?: string[];
  motifPrecision?: string;
  onSelect: (motifs: string[], message: string) => void;
  onClose: () => void;
}

export default function MotifRefusSelect({
  visible,
  selectedMotifs = [],
  motifPrecision = '',
  onSelect,
  onClose,
}: MotifRefusSelectProps) {
  const [tempMotifs, setTempMotifs] = useState<string[]>(selectedMotifs);
  const [tempPrecision, setTempPrecision] = useState(motifPrecision);
  const [showAutreInput, setShowAutreInput] = useState(false);

  useEffect(() => {
    if (visible) {
      setTempMotifs(selectedMotifs);
      setTempPrecision(motifPrecision);
      setShowAutreInput(selectedMotifs.includes('autre'));
    }
  }, [visible, selectedMotifs, motifPrecision]);

  const toggleMotif = (motifValue: string) => {
    if (tempMotifs.includes(motifValue)) {
      setTempMotifs(tempMotifs.filter(m => m !== motifValue));
      if (motifValue === 'autre') {
        setShowAutreInput(false);
        setTempPrecision('');
      }
    } else {
      setTempMotifs([...tempMotifs, motifValue]);
      if (motifValue === 'autre') {
        setShowAutreInput(true);
      }
    }
  };

  const buildFinalMessage = (): string => {
    const selectedMotifsData = MOTIFS_REFUS.filter(m => tempMotifs.includes(m.value));
    const labels = selectedMotifsData.map(m => m.label);
    
    if (showAutreInput && tempPrecision.trim()) {
      return `${labels.filter(l => l !== 'Autre motif').join(', ')}${labels.includes('Autre motif') ? `, Autre: ${tempPrecision.trim()}` : ''}`;
    }
    
    return labels.join(', ');
  };

  const handleConfirm = () => {
    if (tempMotifs.length === 0) return;
    
    if (tempMotifs.includes('autre') && !tempPrecision.trim()) {
      return;
    }
    
    const finalMessage = buildFinalMessage();
    onSelect(tempMotifs, finalMessage);
    onClose();
  };

  const handleReset = () => {
    setTempMotifs([]);
    setTempPrecision('');
    setShowAutreInput(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center px-5 py-4 border-b border-slate-100">
          <h3 className="text-lg font-semibold text-slate-800">Motifs du refus</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5">
          <p className="text-sm font-medium text-slate-700 mb-3">Sélectionnez un ou plusieurs motifs *</p>
          
          {MOTIFS_REFUS.map((motif) => {
            const isSelected = tempMotifs.includes(motif.value);
            return (
              <button
                key={motif.value}
                onClick={() => toggleMotif(motif.value)}
                className={`w-full text-left py-2.5 px-3 rounded-lg border-b border-slate-50 last:border-0 transition-colors ${
                  isSelected ? 'bg-blue-50' : 'hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                    isSelected ? 'bg-blue-600 border-blue-600' : 'border-slate-300 bg-white'
                  }`}>
                    {isSelected && <Check className="h-3 w-3 text-white" />}
                  </div>
                  <span className={`text-sm ${isSelected ? 'text-blue-600 font-medium' : 'text-slate-600'}`}>
                    {motif.label}
                  </span>
                </div>
              </button>
            );
          })}

          {showAutreInput && (
            <div className="mt-4">
              <p className="text-sm font-medium text-slate-700 mb-1.5">Précisez le motif *</p>
              <textarea
                className="w-full min-h-[80px] p-3 bg-white rounded-xl border border-slate-200 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 resize-none"
                placeholder="Ex: Document d'identité manquant, Âge non vérifié..."
                value={tempPrecision}
                onChange={(e) => setTempPrecision(e.target.value)}
              />
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex gap-3 px-5 py-4 border-t border-slate-100 bg-slate-50">
          <button
            onClick={() => {
              handleReset();
              onClose();
            }}
            className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-sm font-medium transition-colors"
          >
            Annuler
          </button>
          <button
            onClick={handleConfirm}
            disabled={tempMotifs.length === 0 || (tempMotifs.includes('autre') && !tempPrecision.trim())}
            className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Confirmer le refus
          </button>
        </div>
      </div>
    </div>
  );
}
