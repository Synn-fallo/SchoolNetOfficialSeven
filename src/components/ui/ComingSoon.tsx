import React from 'react';
import { Wrench } from 'lucide-react';

export interface ComingSoonProps {
  title?: string;
  description?: string;
}

export default function ComingSoon({
  title = "Page en construction",
  description = "Cette fonctionnalité sera bientôt disponible."
}: ComingSoonProps) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center bg-slate-50/50 p-8 min-h-[400px] text-center rounded-2xl border border-dashed border-slate-200">
      <div className="w-20 h-20 rounded-full bg-blue-50 flex items-center justify-center mb-6 shadow-sm border border-blue-100">
        <Wrench className="h-10 w-10 text-blue-600" />
      </div>
      <h3 className="text-lg font-extrabold text-slate-800 mb-2">{title}</h3>
      <p className="text-xs font-bold text-slate-400 max-w-sm leading-relaxed">{description}</p>
    </div>
  );
}
