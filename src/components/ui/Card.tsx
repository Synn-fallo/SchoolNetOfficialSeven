import React from 'react';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  variant?: 'default' | 'elevated' | 'bordered';
  borderedTop?: boolean;
  borderedTopColor?: string;
  hoverable?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

export function Card({
  children,
  variant = 'default',
  borderedTop = false,
  borderedTopColor,
  hoverable = false,
  className = '',
  style,
  ...props
}: CardProps) {
  const getVariantClasses = () => {
    switch (variant) {
      case 'elevated':
        return 'shadow-md border border-slate-100/50';
      case 'bordered':
        return 'border border-slate-200 shadow-sm';
      default:
        return 'shadow-sm border border-slate-100';
    }
  };

  const borderTopStyle = borderedTop
    ? {
        borderTopWidth: '4px',
        borderTopColor: borderedTopColor || 'var(--color-schoolnet-primary)',
      }
    : {};

  return (
    <div
      className={`
        bg-white rounded-2xl p-5
        transition-all duration-300
        ${getVariantClasses()}
        ${hoverable ? 'hover:shadow-lg hover:-translate-y-0.5 hover:border-slate-200' : ''}
        ${className}
      `}
      style={{ ...borderTopStyle, ...style }}
      {...props}
    >
      {children}
    </div>
  );
}
