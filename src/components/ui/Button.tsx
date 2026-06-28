import { motion } from 'motion/react';
import React from 'react';

export interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'success' | 'secondary-outline';
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  icon?: React.ReactNode;
}

export function Button({
  title,
  onPress,
  variant = 'primary',
  loading = false,
  disabled = false,
  fullWidth = false,
  icon,
}: ButtonProps) {
  const isDisabled = disabled || loading;

  const getVariantClasses = () => {
    switch (variant) {
      case 'primary':
        return 'bg-schoolnet-primary hover:bg-schoolnet-primary-light text-white shadow-sm';
      case 'secondary':
        return 'bg-slate-500 hover:bg-slate-600 text-white shadow-sm';
      case 'outline':
        return 'bg-transparent border-2 border-schoolnet-primary text-schoolnet-primary hover:bg-schoolnet-primary/5';
      case 'danger':
        return 'bg-red-600 hover:bg-red-700 text-white shadow-sm';
      case 'success':
        return 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm';
      case 'secondary-outline':
        return 'bg-transparent border-2 border-schoolnet-secondary text-schoolnet-secondary hover:bg-schoolnet-secondary/5';
      default:
        return 'bg-schoolnet-primary hover:bg-schoolnet-primary-light text-white shadow-sm';
    }
  };

  return (
    <motion.button
      whileTap={!isDisabled ? { scale: 0.98 } : undefined}
      onClick={onPress}
      disabled={isDisabled}
      className={`
        inline-flex items-center justify-center gap-2
        px-6 py-3.5 rounded-xl text-xs font-bold tracking-wide
        transition-colors duration-200 cursor-pointer
        min-h-[48px] select-none
        ${fullWidth ? 'w-full' : ''}
        ${getVariantClasses()}
        ${isDisabled ? 'opacity-50 cursor-not-allowed pointer-events-none' : ''}
      `}
    >
      {loading ? (
        <svg className="animate-spin h-5 w-5 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      ) : (
        <>
          {icon && <span className="inline-flex">{icon}</span>}
          <span>{title}</span>
        </>
      )}
    </motion.button>
  );
}
