import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronDown, Building2, Check, X } from 'lucide-react';
import { useActiveEtablissement } from '@/hooks/useActiveEtablissement';

interface EtablissementSelectorProps {
  variant?: 'header' | 'sidebar';
  onSelect?: () => void;
}

export default function EtablissementSelector({ variant = 'header', onSelect }: EtablissementSelectorProps) {
  const { activeEtablissement, allEtablissements, switchToEtablissement, loading } = useActiveEtablissement();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  if (loading || !activeEtablissement) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 border border-slate-100 rounded-xl text-slate-400">
        <Building2 className="h-4 w-4 animate-pulse" />
        <span className="text-xs font-bold animate-pulse">Chargement...</span>
      </div>
    );
  }

  const handleSelect = async (etablissementId: string) => {
    await switchToEtablissement(etablissementId);
    setIsOpen(false);
    if (onSelect) onSelect();
  };

  const currentActiveName = activeEtablissement?.nom || "Sélectionner un établissement";

  if (variant === 'sidebar') {
    return (
      <div className="relative w-full px-2" ref={containerRef}>
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="w-full flex items-center gap-2.5 px-4 py-3 rounded-xl text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-150 transition-all text-left focus:outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer group"
        >
          <Building2 className="h-4 w-4 text-slate-500 shrink-0 group-hover:text-slate-700" />
          <span className="flex-1 text-xs font-extrabold truncate pr-2">
            {currentActiveName}
          </span>
          <ChevronDown className={`h-4 w-4 text-slate-400 shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        {/* Dropdown list */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: 8, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="absolute left-2 right-2 bottom-full mb-2 bg-white rounded-xl border border-slate-200 shadow-xl overflow-hidden z-50 max-h-60 overflow-y-auto divide-y divide-slate-50"
            >
              <div className="px-3.5 py-2.5 bg-slate-50/50">
                <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Changer d'établissement</span>
              </div>
              <div className="p-1.5 flex flex-col gap-1">
                {allEtablissements.map((etab) => {
                  const isActive = activeEtablissement.id === etab.id;
                  return (
                    <button
                      key={etab.id}
                      onClick={() => handleSelect(etab.id)}
                      className={`
                        w-full text-left px-3 py-2.5 rounded-lg flex items-center justify-between gap-3 transition-colors cursor-pointer
                        ${isActive ? 'bg-blue-50 text-blue-600' : 'text-slate-700 hover:bg-slate-50'}
                      `}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <Building2 className={`h-4 w-4 shrink-0 ${isActive ? 'text-blue-600' : 'text-slate-400'}`} />
                        <div className="truncate">
                          <p className={`text-xs font-extrabold ${isActive ? 'text-blue-600' : 'text-slate-800'}`}>
                            {etab.nom}
                          </p>
                          {etab.ville && (
                            <p className="text-[10px] font-medium text-slate-400 mt-0.5">{etab.ville}</p>
                          )}
                        </div>
                      </div>
                      {isActive && <Check className="h-4 w-4 text-blue-600 shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  // Header Variant
  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-150 transition-all text-left focus:outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer group"
      >
        <Building2 className="h-4 w-4 text-slate-500 group-hover:text-slate-700" />
        <span className="text-xs font-extrabold max-w-[150px] md:max-w-[200px] truncate">
          {currentActiveName}
        </span>
        <ChevronDown className={`h-3.5 w-3.5 text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown list */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 mt-2 w-72 bg-white rounded-2xl border border-slate-150 shadow-xl overflow-hidden z-50 max-h-80 overflow-y-auto divide-y divide-slate-100"
          >
            <div className="px-4 py-3 bg-slate-50/50 border-b border-slate-100 flex items-center justify-between">
              <span className="text-xs font-extrabold text-slate-800">Changer d'établissement</span>
              <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="p-2 flex flex-col gap-1 max-h-64 overflow-y-auto">
              {allEtablissements.map((etab) => {
                const isActive = activeEtablissement.id === etab.id;
                return (
                  <button
                    key={etab.id}
                    onClick={() => handleSelect(etab.id)}
                    className={`
                      w-full text-left p-2.5 rounded-xl flex items-center justify-between gap-3 transition-colors cursor-pointer
                      ${isActive ? 'bg-blue-50 text-blue-600' : 'text-slate-700 hover:bg-slate-50'}
                    `}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <Building2 className={`h-4.5 w-4.5 shrink-0 ${isActive ? 'text-blue-600' : 'text-slate-400'}`} />
                      <div className="truncate">
                        <p className={`text-xs font-extrabold ${isActive ? 'text-blue-600' : 'text-slate-800'}`}>
                          {etab.nom}
                        </p>
                        {etab.ville && (
                          <p className="text-[10px] font-medium text-slate-400 mt-0.5">{etab.ville}</p>
                        )}
                      </div>
                    </div>
                    {isActive && <Check className="h-4 w-4 text-blue-600 shrink-0" />}
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
