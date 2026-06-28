import React from 'react';
import { ChevronDown } from 'lucide-react';

interface SelectorProps {
  label: string;
  value: string;
  onPress: () => void;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
}

export default function Selector({
  label,
  value,
  onPress,
  placeholder = 'Sélectionner une option',
  required = false,
  disabled = false,
}: SelectorProps) {
  return (
    <div className="w-full flex flex-col gap-2">
      <label className="text-xs font-extrabold text-slate-700 tracking-wide flex items-center gap-1 select-none">
        <span>{label}</span>
        {required && <span className="text-rose-500 font-extrabold">*</span>}
      </label>
      
      <button
        type="button"
        disabled={disabled}
        onClick={onPress}
        className={`
          w-full flex items-center justify-between gap-3 px-4 py-2.5 rounded-xl border text-xs font-bold bg-white text-left transition-all select-none
          ${disabled
            ? 'bg-slate-50 border-slate-150 text-slate-400 cursor-not-allowed opacity-75'
            : 'border-slate-200 text-slate-800 hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 cursor-pointer'}
        `}
      >
        <span className={!value ? 'text-slate-400 font-bold' : 'text-slate-800'}>
          {value || placeholder}
        </span>
        <ChevronDown className={`h-4 w-4 shrink-0 ${disabled ? 'text-slate-300' : 'text-slate-500'}`} />
      </button>
    </div>
  );
}
