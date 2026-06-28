import React, { ReactNode, useRef, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

export interface PortalProps {
  children: ReactNode;
  isVisible: boolean;
}

export default function Portal({ children, isVisible }: PortalProps) {
  const [mounted, setMounted] = useState(false);
  const portalRootRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    setMounted(true);
    let root = document.getElementById('toast-portal-root');
    if (!root && typeof document !== 'undefined') {
      root = document.createElement('div');
      root.id = 'toast-portal-root';
      root.style.position = 'fixed';
      root.style.top = '0';
      root.style.left = '0';
      root.style.right = '0';
      root.style.bottom = '0';
      root.style.pointerEvents = 'none';
      root.style.zIndex = '999999';
      document.body.appendChild(root);
    }
    portalRootRef.current = root;
  }, []);

  if (!isVisible || !mounted || !portalRootRef.current) {
    return null;
  }

  return createPortal(
    <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 999999 }}>
      <div className="pointer-events-auto">
        {children}
      </div>
    </div>,
    portalRootRef.current
  );
}
