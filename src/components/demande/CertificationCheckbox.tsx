import React from 'react';
import { Check } from 'lucide-react';

interface CertificationCheckboxProps {
  checked: boolean;
  onToggle: () => void;
  label?: string;
}

export default function CertificationCheckbox({ 
  checked, 
  onToggle, 
  label = "Je certifie sur l'honneur l'exactitude des informations fournies et je m'engage à respecter les conditions générales d'utilisation." 
}: CertificationCheckboxProps) {
  return (
    <button
      onClick={onToggle}
      className="flex items-start gap-3 p-4 bg-amber-50 rounded-xl border border-amber-200 w-full text-left transition-colors hover:bg-amber-100/50"
    >
      <div className={`w-5 h-5 rounded border-2 flex items-center justify-center mt-0.5 flex-shrink-0 transition-colors ${
        checked ? 'bg-blue-600 border-blue-600' : 'border-slate-300 bg-white'
      }`}>
        {checked && <Check className="h-3.5 w-3.5 text-white stroke-[3]" />}
      </div>
      <span className="text-sm text-slate-700 leading-relaxed">{label}</span>
    </button>
  );
}
