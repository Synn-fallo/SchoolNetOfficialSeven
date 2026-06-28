import React from 'react';
import { Check } from 'lucide-react';

export interface CheckboxProps {
  checked: boolean;
  onPress: () => void;
  label?: string;
  disabled?: boolean;
}

export function Checkbox({ checked, onPress, label, disabled = false }: CheckboxProps) {
  return (
    <button
      type="button"
      onClick={onPress}
      disabled={disabled}
      className={`flex items-center gap-2.5 select-none text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/20 rounded-lg ${
        disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
      }`}
    >
      <div
        className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all duration-150 ${
          checked
            ? 'bg-blue-600 border-blue-600 text-white shadow-sm shadow-blue-500/10'
            : 'border-slate-300 bg-white hover:border-slate-400'
        }`}
      >
        {checked && <Check className="h-3.5 w-3.5 text-white stroke-[3px]" />}
      </div>
      {label && (
        <span
          className={`text-xs font-bold tracking-wide ${
            disabled ? 'text-slate-400' : 'text-slate-700'
          }`}
        >
          {label}
        </span>
      )}
    </button>
  );
}
