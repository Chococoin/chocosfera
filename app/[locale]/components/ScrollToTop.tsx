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

    // Detectar Safari y forzar ocultar gradientes cuando la página vuelve al foreground
    const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);

    if (isSafari) {
      const handleVisibilityChange = () => {
        if (!document.hidden) {
          // Página volvió al foreground, forzar clase Safari
          document.documentElement.classList.add('is-safari');

          // Forzar re-flow para aplicar CSS inmediatamente
          const gradients = document.querySelectorAll('.iko-hero__gradient');
          gradients.forEach(gradient => {
            if (gradient instanceof HTMLElement) {
              gradient.style.display = 'none';
              gradient.style.visibility = 'hidden';
            }
          });
        }
      };

      document.addEventListener('visibilitychange', handleVisibilityChange);
      window.addEventListener('focus', handleVisibilityChange);

      return () => {
        document.removeEventListener('visibilitychange', handleVisibilityChange);
        window.removeEventListener('focus', handleVisibilityChange);
      };
    }
  }, []);

  return null;
}
