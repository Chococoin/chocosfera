'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { useTranslations } from 'next-intl';
import UserProfile from './UserProfile';


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
      name: 'Mi Familia',
      href: '/dashboard/family',
      icon: '👨‍👩‍👧‍👦',
      current: false,
    },
    {
      name: 'Mis Personajes',
      href: '/dashboard/characters',
      icon: '🎭',
      current: false,
    },
    {
      name: 'Explorar',
      href: '/dashboard/explore',
      icon: '🔍',
      current: false,
    },
    {
      name: t('traceability'),
      href: '/dashboard/traceability',
      icon: '🔗',
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
      name: t('pricing'),
      href: '/pricing',
      icon: '💳',
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
      className={`relative bg-[rgba(255,255,255,0.85)] dark:bg-[rgba(16,18,29,0.85)] border-r border-[var(--color-border)] backdrop-blur-xl transition-all duration-300 ${
        isCollapsed ? 'w-16' : 'w-64'
      }`}
    >
      {/* User Profile */}
      <div className="p-4 border-b border-[var(--color-border)]">
        <UserProfile isCollapsed={isCollapsed} />
      </div>

      {/* Logo and collapse button */}
      <div className="flex items-center justify-between p-4 border-b border-[var(--color-border)]">
        {!isCollapsed && (
          <Link
            href={`/${locale}/dashboard`}
            className="flex items-center gap-2 text-xl font-bold text-heading"
            style={{ fontFamily: 'var(--font-heading)' }}
          >
            <span className="text-3xl">🍫</span>
            <span className="bg-gradient-to-r from-primary to-[var(--color-primary-alt)] bg-clip-text text-transparent">
              Chocósfera
            </span>
          </Link>
        )}
        <button
          type="button"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-2 rounded-full hover:bg-[rgba(223,134,170,0.12)] text-heading transition-colors"
          aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <span className="text-xl">{isCollapsed ? '☰' : '✕'}</span>
        </button>
      </div>

      {/* Navigation */}
      <nav className="mt-6 px-3 pb-6">
        <ul className="space-y-2">
          {filteredNavigation.map((item) => (
            <li key={item.name}>
              <Link
                href={`/${locale}${item.href}`}
                className={`flex items-center ${isCollapsed ? 'justify-center' : ''} px-3 py-2.5 text-sm font-semibold rounded-2xl transition-all ${
                  item.current
                    ? 'bg-gradient-to-r from-[rgba(223,134,170,0.18)] to-[rgba(87,41,214,0.18)] text-[var(--color-primary-alt)] border border-[rgba(223,134,170,0.35)] shadow-sm'
                    : 'text-muted hover:bg-[rgba(223,134,170,0.08)] hover:text-heading'
                }`}
                title={isCollapsed ? item.name : undefined}
              >
                <span className={`flex items-center justify-center text-2xl leading-none ${isCollapsed ? '' : 'mr-3'}`}>{item.icon}</span>
                {!isCollapsed && <span>{item.name}</span>}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}
