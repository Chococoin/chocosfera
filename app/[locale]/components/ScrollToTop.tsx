'use client';

import { useEffect, useRef } from 'react';

export default function ScrollToTop() {
  const hasScrolled = useRef(false);

  useEffect(() => {
    if (hasScrolled.current) return;
    hasScrolled.current = true;

    // Desactivar restauración automática del scroll
    if ('scrollRestoration' in history) {
      history.scrollRestoration = 'manual';
    }

    // Forzar scroll al top inmediatamente
    window.scrollTo(0, 0);
  }, []);

  return null;
}
