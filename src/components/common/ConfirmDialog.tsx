import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AlertTriangle, X } from 'lucide-react';

interface ConfirmDialogProps {
  visible: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  confirmVariant?: 'danger' | 'primary' | 'warning';
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmDialog({
  visible,
  title,
  message,
  confirmText = 'Confirmer',
  cancelText = 'Annuler',
  confirmVariant = 'primary',
  loading = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const getConfirmButtonClasses = () => {
    switch (confirmVariant) {
      case 'danger':
        return 'bg-rose-600 hover:bg-rose-700 focus:ring-rose-500/20';
      case 'warning':
        return 'bg-amber-500 hover:bg-amber-600 focus:ring-amber-500/20';
      case 'primary':
      default:
        return 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500/20';
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

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ type: 'spring', duration: 0.3 }}
            className="relative bg-white w-full max-w-md rounded-2xl p-6 shadow-2xl border border-slate-100 z-10"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-50 pb-3.5 mb-4">
              <div className="flex items-center gap-2.5">
                {confirmVariant === 'danger' && (
                  <div className="w-8 h-8 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center">
                    <AlertTriangle size={18} />
                  </div>
                )}
                <h3 className="text-sm font-extrabold text-slate-800">{title}</h3>
              </div>
              <button
                onClick={onCancel}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
                disabled={loading}
              >
                <X size={18} />
              </button>
            </div>

            {/* Message */}
            <p className="text-xs font-bold text-slate-500 leading-relaxed mb-6">
              {message}
            </p>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={onCancel}
                className="flex-1 py-2.5 rounded-xl text-xs font-extrabold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-slate-500/10 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={loading}
              >
                {cancelText}
              </button>
              <button
                onClick={onConfirm}
                className={`flex-1 py-2.5 rounded-xl text-xs font-extrabold text-white transition-all cursor-pointer focus:outline-none focus:ring-2 flex items-center justify-center gap-2 ${getConfirmButtonClasses()} disabled:opacity-75 disabled:cursor-not-allowed`}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <span>Chargement...</span>
                  </>
                ) : (
                  <span>{confirmText}</span>
                )}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
