import React from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  className?: string;
}

export function Input({ label, error, className = '', ...props }: InputProps) {
  return (
    <div className="flex flex-col gap-2 mb-4 w-full text-left">
      {label && (
        <label className="text-xs font-bold text-slate-700 tracking-wide">
          {label}
        </label>
      )}
      <input
        className={`
          w-full px-4 py-3 rounded-xl border text-sm font-medium
          bg-white text-slate-800 placeholder-slate-400
          outline-none transition-all duration-200 min-h-[48px]
          ${error 
            ? 'border-red-500 focus:ring-4 focus:ring-red-50/50 focus:border-red-500' 
            : 'border-slate-200 focus:ring-4 focus:ring-schoolnet-primary/10 focus:border-schoolnet-primary'
          }
          ${className}
        `}
        {...props}
      />
      {error && (
        <span className="text-xs font-semibold text-red-500 animate-in fade-in-50 slide-in-from-top-1 duration-150">
          {error}
        </span>
      )}
    </div>
  );
}
