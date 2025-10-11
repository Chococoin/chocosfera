'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { useTranslations } from 'next-intl';

export function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const pathname = usePathname();
  const t = useTranslations('dashboard.sidebar');

  const navigation = [
    {
      name: t('dashboard'),
      href: '/dashboard',
      icon: '📊',
      current: false,
    },
    {
      name: t('myTrees'),
      href: '/dashboard/trees',
      icon: '🌳',
      current: false,
    },
    {
      name: t('traceability'),
      href: '/dashboard/traceability',
      icon: '🔍',
      current: false,
    },
    {
      name: t('impact'),
      href: '/dashboard/impact',
      icon: '🌍',
      current: false,
    },
    {
      name: t('community'),
      href: '/dashboard/community',
      icon: '🗨️',
      current: false,
    },
    {
      name: t('marketplace'),
      href: '/dashboard/marketplace',
      icon: '🛒',
      current: false,
    },
    {
      name: t('settings'),
      href: '/dashboard/settings',
      icon: '⚙️',
      current: false,
    },
  ];

  // Extract locale from pathname (e.g., /es/dashboard -> es)
  const locale = pathname.split('/')[1];

  const filteredNavigation = navigation.map((item) => ({
    ...item,
    current: pathname === `/${locale}${item.href}`,
  }));

  return (
    <div
      className={`relative bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 transition-all duration-300 ${
        isCollapsed ? 'w-16' : 'w-64'
      }`}
    >
      {/* Logo and collapse button */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        {!isCollapsed && (
          <Link
            href={`/${locale}/dashboard`}
            className="flex items-center gap-2 text-xl font-bold text-gray-900 dark:text-white"
          >
            <span className="text-3xl">🍫</span>
            <span className="bg-gradient-to-r from-primary to-orange-600 bg-clip-text text-transparent">
              Chocósfera
            </span>
          </Link>
        )}
        <button
          type="button"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400 transition-colors"
          aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <span className="text-xl">{isCollapsed ? '☰' : '✕'}</span>
        </button>
      </div>

      {/* Navigation */}
      <nav className="mt-6 px-3">
        <ul className="space-y-1">
          {filteredNavigation.map((item) => (
            <li key={item.name}>
              <Link
                href={`/${locale}${item.href}`}
                className={`flex items-center px-3 py-3 text-sm font-medium rounded-lg transition-all ${
                  item.current
                    ? 'bg-gradient-to-r from-primary/10 to-orange-600/10 text-primary dark:text-primary border-r-2 border-primary shadow-sm'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
                title={isCollapsed ? item.name : undefined}
              >
                <span className="text-2xl mr-3">{item.icon}</span>
                {!isCollapsed && <span>{item.name}</span>}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {/* Chocolate quote */}
      {!isCollapsed && (
        <div className="absolute bottom-6 left-3 right-3 p-4 bg-gradient-to-br from-primary/10 to-orange-600/10 rounded-lg border border-primary/20">
          <p className="text-xs text-gray-600 dark:text-gray-400 italic">
            “{t('quote')}”
          </p>
        </div>
      )}
    </div>
  );
}
