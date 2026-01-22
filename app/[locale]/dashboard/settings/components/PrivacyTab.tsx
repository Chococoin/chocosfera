'use client';

import { useTranslations } from 'next-intl';
import { Card, CardHeader, StatusBadge } from '@/components/ui';

interface Session {
  id: number;
  device: string;
  location: string;
  lastActive: string;
  current: boolean;
}

export function PrivacyTab() {
  const t = useTranslations('dashboard.settings');

  const activeSessions: Session[] = [
    {
      id: 1,
      device: 'MacBook Pro - Chrome',
      location: t('privacy.sessionLocation'),
      lastActive: t('privacy.sessionNow'),
      current: true,
    },
    {
      id: 2,
      device: 'iPhone 15 - Safari',
      location: t('privacy.sessionLocation'),
      lastActive: t('privacy.sessionHoursAgo', { hours: 2 }),
      current: false,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Two-Factor Authentication */}
      <Card>
        <CardHeader title={t('privacy.twoFactor')} />

        <div className="flex items-center justify-between py-4 border-b border-gray-200 dark:border-gray-700">
          <div>
            <p className="font-medium text-gray-900 dark:text-white mb-1">
              {t('privacy.twoFactor')}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Estado:{' '}
              <span className="text-red-600 dark:text-red-400">
                {t('privacy.twoFactorDisabled')}
              </span>
            </p>
          </div>
          <button
            type="button"
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium rounded-lg transition-all"
          >
            {t('privacy.enable')}
          </button>
        </div>
      </Card>

      {/* Active Sessions */}
      <Card>
        <CardHeader title={t('privacy.sessions')} />

        <div className="space-y-4">
          {activeSessions.map((session) => (
            <SessionItem key={session.id} session={session} />
          ))}
        </div>
      </Card>

      {/* Delete Account */}
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6">
        <h2 className="text-xl font-bold text-red-900 dark:text-red-400 mb-2">
          {t('privacy.deleteAccount')}
        </h2>
        <p className="text-sm text-red-700 dark:text-red-300 mb-4">
          {t('privacy.deleteWarning')}
        </p>
        <button
          type="button"
          className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-all"
        >
          {t('privacy.confirmDelete')}
        </button>
      </div>
    </div>
  );
}

interface SessionItemProps {
  session: Session;
}

function SessionItem({ session }: SessionItemProps) {
  const t = useTranslations('dashboard.settings');

  return (
    <div className="flex items-center justify-between py-4 border-b border-gray-200 dark:border-gray-700 last:border-0">
      <div className="flex items-start gap-3">
        <span className="text-2xl">💻</span>
        <div>
          <p className="font-medium text-gray-900 dark:text-white flex items-center gap-2">
            {session.device}
            {session.current && (
              <StatusBadge variant="success" size="sm">
                {t('privacy.currentSession')}
              </StatusBadge>
            )}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {session.location} • {session.lastActive}
          </p>
        </div>
      </div>
      {!session.current && (
        <button
          type="button"
          className="px-3 py-1 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all"
        >
          {t('privacy.revokeSession')}
        </button>
      )}
    </div>
  );
}
