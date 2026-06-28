import React from 'react';
import { CheckCircle, Clock, XCircle, AlertCircle } from 'lucide-react';

export type StatusType = 'active' | 'inactive' | 'expired' | 'pending' | 'temporary';

interface StatusBadgeProps {
  status: StatusType;
  showIcon?: boolean;
  size?: 'small' | 'medium' | 'large';
  label?: string;
}

const statusConfig: Record<StatusType, { defaultLabel: string; colorClass: string; bgClass: string; icon: React.ReactNode }> = {
  active: {
    defaultLabel: 'Actif',
    colorClass: 'text-emerald-700',
    bgClass: 'bg-emerald-50 border-emerald-150',
    icon: <CheckCircle className="h-3 w-3" />,
  },
  inactive: {
    defaultLabel: 'Inactif',
    colorClass: 'text-slate-600',
    bgClass: 'bg-slate-50 border-slate-200',
    icon: <XCircle className="h-3 w-3" />,
  },
  expired: {
    defaultLabel: 'Expiré',
    colorClass: 'text-amber-700',
    bgClass: 'bg-amber-50 border-amber-150',
    icon: <AlertCircle className="h-3 w-3" />,
  },
  pending: {
    defaultLabel: 'En attente',
    colorClass: 'text-blue-700',
    bgClass: 'bg-blue-50 border-blue-150',
    icon: <Clock className="h-3 w-3" />,
  },
  temporary: {
    defaultLabel: 'Temporaire',
    colorClass: 'text-purple-700',
    bgClass: 'bg-purple-50 border-purple-150',
    icon: <Clock className="h-3 w-3" />,
  },
};

const sizeStyles = {
  small: { paddingClass: 'px-2 py-0.5', fontClass: 'text-[10px]', iconSizeClass: 'h-3 w-3 mr-1' },
  medium: { paddingClass: 'px-2.5 py-1', fontClass: 'text-[11px]', iconSizeClass: 'h-3.5 w-3.5 mr-1.5' },
  large: { paddingClass: 'px-3.5 py-1.5', fontClass: 'text-xs', iconSizeClass: 'h-4 w-4 mr-2' },
};

export default function StatusBadge({ status, showIcon = true, size = 'medium', label }: StatusBadgeProps) {
  const config = statusConfig[status];
  const sizeConfig = sizeStyles[size];

  if (!config) return null;

  return (
    <div
      className={`
        inline-flex items-center rounded-full border select-none font-extrabold tracking-wide uppercase
        ${config.bgClass} ${config.colorClass} ${sizeConfig.paddingClass} ${sizeConfig.fontClass}
      `}
    >
      {showIcon && (
        <div className="shrink-0 flex items-center justify-center">
          {React.cloneElement(config.icon as React.ReactElement, {
            className: sizeConfig.iconSizeClass,
          })}
        </div>
      )}
      <span>{label || config.defaultLabel}</span>
    </div>
  );
}
