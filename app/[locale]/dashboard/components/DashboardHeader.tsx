'use client';

import { useEffect, useMemo, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import ThemeToggle from '../../components/ThemeToggle';

export function DashboardHeader() {
  const [currentTime, setCurrentTime] = useState<Date | null>(null);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const t = useTranslations('dashboard.header');
  const locale = useLocale();
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

  const handleLogout = () => {
    // TODO: Implement logout logic
    console.log('Logout');
  };

  return (
    <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Left side - Title */}
        <div className="flex items-center space-x-4">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-orange-600 bg-clip-text text-transparent">
            {t('title')}
          </h1>
        </div>

        {/* Right side - Actions */}
        <div className="flex items-center space-x-4">
          {/* Current time */}
          <div className="hidden md:block text-sm text-gray-500 dark:text-gray-400">
            {currentTime ? dateTimeFormatter.format(currentTime) : '...'}
          </div>

          {/* Theme toggle */}
          <ThemeToggle />

          {/* Profile dropdown */}
          <div className="relative profile-dropdown">
            <button
              type="button"
              onClick={() => setShowProfileMenu((prev) => !prev)}
              className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 transition-colors"
            >
              <div className="w-8 h-8 bg-gradient-to-br from-primary to-orange-600 rounded-full flex items-center justify-center shadow-sm">
                <span className="text-white text-lg">👤</span>
              </div>
              <span className="hidden md:inline text-sm font-medium">
                {t('profile')}
              </span>
              <span className="text-sm">▼</span>
            </button>

            {showProfileMenu && (
              <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50">
                <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">
                    Usuario Demo
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                    demo@chocosfera.com
                  </p>
                </div>
                <div className="py-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShowProfileMenu(false);
                      // Navigate to settings
                    }}
                    className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center gap-2"
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
