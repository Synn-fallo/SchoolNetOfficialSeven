import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, XCircle, AlertTriangle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastProps {
  visible: boolean;
  message: string;
  type: ToastType;
  duration?: number;
  onHide: () => void;
}

const getToastPortalRoot = () => {
  if (typeof document === 'undefined') return null;
  let toastPortalRoot = document.getElementById('toast-portal-root');
  if (!toastPortalRoot) {
    toastPortalRoot = document.createElement('div');
    toastPortalRoot.id = 'toast-portal-root';
    toastPortalRoot.style.position = 'fixed';
    toastPortalRoot.style.top = '0';
    toastPortalRoot.style.left = '0';
    toastPortalRoot.style.right = '0';
    toastPortalRoot.style.bottom = '0';
    toastPortalRoot.style.pointerEvents = 'none';
    toastPortalRoot.style.zIndex = '999999';
    document.body.appendChild(toastPortalRoot);
  }
  return toastPortalRoot;
};

export default function Toast({ visible, message, type, duration = 3000, onHide }: ToastProps) {
  useEffect(() => {
    if (visible) {
      const timer = setTimeout(() => {
        onHide();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [visible, duration, onHide]);

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />;
      case 'error':
        return <XCircle className="h-5 w-5 text-rose-600 shrink-0" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0" />;
      case 'info':
        return <Info className="h-5 w-5 text-blue-600 shrink-0" />;
    }
  };

  const getColorClasses = () => {
    switch (type) {
      case 'success':
        return 'bg-emerald-50 border-emerald-150 text-emerald-900 shadow-emerald-100/40';
      case 'error':
        return 'bg-rose-50 border-rose-150 text-rose-900 shadow-rose-100/40';
      case 'warning':
        return 'bg-amber-50 border-amber-150 text-amber-900 shadow-amber-100/40';
      case 'info':
        return 'bg-blue-50 border-blue-150 text-blue-900 shadow-blue-100/40';
    }
  };

  const portalRoot = getToastPortalRoot();
  if (!portalRoot) return null;

  return createPortal(
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: -20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -15, scale: 0.95 }}
          transition={{ type: "spring", stiffness: 350, damping: 25 }}
          className={`
            fixed top-[88px] left-4 right-4 md:left-auto md:right-6 md:w-96
            flex items-center justify-between gap-3 p-4 rounded-xl border shadow-lg
            pointer-events-auto z-[999999]
            ${getColorClasses()}
          `}
        >
          <div className="flex items-center gap-3 flex-1 min-w-0">
            {getIcon()}
            <p className="text-xs font-bold leading-relaxed truncate md:whitespace-normal md:break-words">
              {message}
            </p>
          </div>
          <button
            onClick={onHide}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-black/5 transition-colors shrink-0"
          >
            <X className="h-4 w-4" />
          </button>
        </motion.div>
      )}
    </AnimatePresence>,
    portalRoot
  );
}
