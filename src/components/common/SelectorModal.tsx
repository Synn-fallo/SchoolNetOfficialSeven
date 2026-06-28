import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Check } from 'lucide-react';

interface SelectorModalProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  items: any[];
  selectedId: string;
  onSelect: (id: string) => void;
  getItemLabel: (item: any) => string;
  getItemSubLabel?: (item: any) => string;
}

export default function SelectorModal({
  visible,
  onClose,
  title,
  items,
  selectedId,
  onSelect,
  getItemLabel,
  getItemSubLabel,
}: SelectorModalProps) {
  return (
    <AnimatePresence>
      {visible && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ type: 'spring', duration: 0.3 }}
            className="relative bg-white w-full max-w-md rounded-2xl flex flex-col shadow-2xl border border-slate-100 z-10 overflow-hidden max-h-[80vh]"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-slate-50/50">
              <h3 className="text-sm font-extrabold text-slate-800">{title}</h3>
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto p-3.5 flex flex-col gap-1.5 scrollbar-thin max-h-[50vh]">
              {items.map((item) => {
                const itemId = item.id;
                const isSelected = selectedId === itemId;
                return (
                  <button
                    key={itemId}
                    onClick={() => {
                      onSelect(itemId);
                      onClose();
                    }}
                    className={`
                      w-full text-left px-4 py-3 rounded-xl flex items-center justify-between gap-3 transition-colors cursor-pointer select-none
                      ${isSelected ? 'bg-blue-50 text-blue-600 font-extrabold' : 'hover:bg-slate-50 text-slate-700'}
                    `}
                  >
                    <div className="min-w-0 flex-1">
                      <p className={`text-xs font-bold leading-normal ${isSelected ? 'text-blue-600' : 'text-slate-800'}`}>
                        {getItemLabel(item)}
                      </p>
                      {getItemSubLabel && (
                        <p className="text-[10px] font-medium text-slate-400 mt-1 leading-normal">
                          {getItemSubLabel(item)}
                        </p>
                      )}
                    </div>
                    {isSelected && <Check size={16} className="text-blue-600 shrink-0 stroke-[3px]" />}
                  </button>
                );
              })}
              {items.length === 0 && (
                <div className="py-8 text-center text-xs font-bold text-slate-400">
                  Aucune option disponible
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
