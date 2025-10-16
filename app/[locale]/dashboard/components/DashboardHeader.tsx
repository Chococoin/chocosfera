'use client';

import { useEffect, useMemo, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import ThemeToggle from '../../components/ThemeToggle';
import { NotificationBell } from './NotificationBell';

export function DashboardHeader() {
  const [currentTime, setCurrentTime] = useState<Date | null>(null);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const t = useTranslations('dashboard.header');
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const { logout } = useAuth();
  const dateTimeFormatter = useMemo(
    () =>
      new Intl.DateTimeFormat(locale, {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
      }),
    [locale],
  );

  useEffect(() => {
    setCurrentTime(new Date());
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (showProfileMenu && !target.closest('.profile-dropdown')) {
        setShowProfileMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showProfileMenu]);

  const handleLogout = async () => {
    console.log('=== LOGOUT CLICKED FROM HEADER ===');
    console.log('Current pathname:', pathname);
    console.log('Locale:', locale);
    await logout();
    sessionStorage.setItem('showQuoteOnLoad', 'true');
    console.log('After logout, navigating to:', `/${locale}`);
    router.push(`/${locale}`);
  };

  return (
    <header className="relative z-50 bg-gradient-to-r from-[rgba(255,255,255,0.92)] to-[rgba(255,255,255,0.65)] dark:from-[rgba(16,18,29,0.75)] dark:to-[rgba(16,18,29,0.08)] border-b border-[var(--color-border)] backdrop-blur-[20px] px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Left side - Title */}
        <div className="flex items-center space-x-4">
          <h1 className="text-2xl font-bold" style={{ fontFamily: 'var(--font-heading)' }}>
            <span className="bg-gradient-to-r from-primary to-[var(--color-primary-alt)] bg-clip-text text-transparent">
              {t('title')}
            </span>
          </h1>
        </div>

        {/* Right side - Actions */}
        <div className="flex items-center space-x-4">
          {/* Current time */}
          <div className="hidden md:block text-sm text-muted">
            {currentTime ? dateTimeFormatter.format(currentTime) : '...'}
          </div>

          {/* Notifications */}
          <NotificationBell />

          {/* Theme toggle */}
          <ThemeToggle />

          {/* Profile dropdown */}
          <div className="relative profile-dropdown">
            <button
              type="button"
              onClick={() => setShowProfileMenu((prev) => !prev)}
              className="flex items-center space-x-2 px-3 py-2 rounded-full hover:bg-[rgba(223,134,170,0.12)] text-heading transition-all"
            >
              <div className="w-8 h-8 bg-gradient-to-br from-primary to-[var(--color-primary-alt)] rounded-full flex items-center justify-center shadow-md">
                <span className="text-white text-lg">👤</span>
              </div>
              <span className="hidden md:inline text-sm font-medium">
                {t('profile')}
              </span>
              <span className="text-sm">▼</span>
            </button>

            {showProfileMenu && (
              <div className="fixed mt-2 w-56 surface-panel shadow-xl z-[100]" style={{
                right: '1rem',
                top: '4rem'
              }}>
                <div className="px-4 py-3 border-b border-[var(--color-border)]">
                  <p className="text-sm font-semibold text-heading">
                    Usuario Demo
                  </p>
                  <p className="text-xs text-muted truncate">
                    demo@chocosfera.com
                  </p>
                </div>
                <div className="py-2">
                  <button
                    type="button"
                    onClick={() => {
                      console.log('=== SETTINGS CLICKED FROM HEADER ===');
                      console.log('Navigating to:', `/${locale}/dashboard/settings`);
                      setShowProfileMenu(false);
                      router.push(`/${locale}/dashboard/settings`);
                    }}
                    className="w-full px-4 py-2 text-left text-sm text-heading hover:bg-[rgba(223,134,170,0.12)] transition-colors flex items-center gap-2"
                  >
                    <span>⚙️</span>
                    {t('settings')}
                  </button>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="w-full px-4 py-2 text-left text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors flex items-center gap-2"
                  >
                    <span>🚪</span>
                    {t('logout')}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
