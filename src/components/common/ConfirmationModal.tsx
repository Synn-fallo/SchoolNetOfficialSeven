import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, AlertTriangle, Trash2, Info } from 'lucide-react';

interface ConfirmationModalProps {
  visible: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'info';
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmationModal({
  visible,
  title,
  message,
  confirmText = 'Confirmer',
  cancelText = 'Annuler',
  variant = 'danger',
  onConfirm,
  onCancel,
}: ConfirmationModalProps) {
  const getButtonBgColor = () => {
    switch (variant) {
      case 'danger':
        return 'bg-rose-600 hover:bg-rose-700 focus:ring-rose-500/20';
      case 'warning':
        return 'bg-amber-500 hover:bg-amber-600 focus:ring-amber-500/20';
      case 'info':
        return 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500/20';
      default:
        return 'bg-rose-600 hover:bg-rose-700 focus:ring-rose-500/20';
    }
  };

  const getIcon = () => {
    switch (variant) {
      case 'danger':
        return (
          <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mb-4">
            <Trash2 size={24} />
          </div>
        );
      case 'warning':
        return (
          <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-500 flex items-center justify-center mb-4">
            <AlertTriangle size={24} />
          </div>
        );
      default:
        return (
          <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mb-4">
            <Info size={24} />
          </div>
        );
    }
  };

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
            onClick={onCancel}
          />

          {/* Modal Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ type: 'spring', duration: 0.3 }}
            className="relative bg-white w-full max-w-md rounded-2xl p-6 shadow-2xl border border-slate-100 z-10 flex flex-col items-center text-center"
          >
            {/* Close Button */}
            <button
              onClick={onCancel}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>

            {/* Icon */}
            {getIcon()}

            {/* Title & Message */}
            <h3 className="text-base font-extrabold text-slate-800 mb-2">{title}</h3>
            <p className="text-xs font-bold text-slate-500 leading-relaxed mb-6 max-w-sm">
              {message}
            </p>

            {/* Action Buttons */}
            <div className="flex gap-3 w-full">
              <button
                onClick={onCancel}
                className="flex-1 py-2.5 rounded-xl text-xs font-extrabold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-slate-500/10"
              >
                {cancelText}
              </button>
              <button
                onClick={onConfirm}
                className={`flex-1 py-2.5 rounded-xl text-xs font-extrabold text-white transition-all cursor-pointer focus:outline-none focus:ring-2 ${getButtonBgColor()}`}
              >
                {confirmText}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
