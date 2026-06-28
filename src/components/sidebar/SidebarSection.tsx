import React from 'react';

interface SidebarSectionProps {
  title: string;
  isOpen: boolean;
  children: React.ReactNode;
}

export default function SidebarSection({ title, isOpen, children }: SidebarSectionProps) {
  if (!isOpen) {
    return <div className="mb-2">{children}</div>;
  }

  return (
    <div className="mb-2">
      <span className="block px-4 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
        {title}
      </span>
      <div className="mt-1">{children}</div>
    </div>
  );
}