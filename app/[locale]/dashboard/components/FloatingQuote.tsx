'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';

export function FloatingQuote() {
  const [isVisible, setIsVisible] = useState(false);
  const t = useTranslations('dashboard.sidebar');

  useEffect(() => {
    // Show the quote after 3 seconds
    const showTimer = setTimeout(() => {
      setIsVisible(true);
    }, 3000);

    // Hide the quote after 8 seconds (visible for 5 seconds)
    const hideTimer = setTimeout(() => {
      setIsVisible(false);
    }, 8000);

    // Repeat the cycle every 20 seconds
    const interval = setInterval(() => {
      setIsVisible(true);
      setTimeout(() => {
        setIsVisible(false);
      }, 5000);
    }, 20000);

    return () => {
      clearTimeout(showTimer);
      clearTimeout(hideTimer);
      clearInterval(interval);
    };
  }, []);

  return (
    <div
      className={`fixed bottom-6 left-1/2 transform -translate-x-1/2 z-40 transition-all duration-700 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
      }`}
    >
      <div className="surface-panel px-6 py-3 shadow-lg backdrop-blur-lg border border-[var(--color-border)]">
        <p className="text-sm text-muted italic flex items-center gap-2">
          <span className="text-xl">🍫</span>
          &ldquo;{t('quote')}&rdquo;
        </p>
      </div>
    </div>
  );
}
