// /src/components/ui/Portal.tsx
// Composant Portal pour le rendu en dehors de la hiérarchie DOM

import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

interface PortalProps {
  children: React.ReactNode;
  container?: HTMLElement | null;
}

export function Portal({ children, container }: PortalProps) {
  const [mounted, setMounted] = useState(false);
  const portalContainerRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    setMounted(true);
    // Créer un conteneur si nécessaire
    if (!container) {
      const div = document.createElement('div');
      div.setAttribute('data-portal', '');
      document.body.appendChild(div);
      portalContainerRef.current = div;
    } else {
      portalContainerRef.current = container;
    }

    return () => {
      if (portalContainerRef.current && !container) {
        document.body.removeChild(portalContainerRef.current);
      }
    };
  }, [container]);

  if (!mounted || !portalContainerRef.current) {
    return null;
  }

  return createPortal(children, portalContainerRef.current);
}

// Export par défaut pour la compatibilité avec les imports existants
export default Portal;
