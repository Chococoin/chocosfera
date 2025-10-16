'use client';

import { useTranslations, useLocale } from 'next-intl';
import { useAuth } from '@/contexts/AuthContext';
import { TelegramChat } from '@/components/TelegramChat';
import Link from 'next/link';

export default function CommunityPage() {
  const t = useTranslations('dashboard.community');
  const locale = useLocale();
  const { isMinor, hasTelegramAccess } = useAuth();

  // Get Telegram channel from environment variable
  const TELEGRAM_CHANNEL = process.env.NEXT_PUBLIC_TELEGRAM_CHANNEL || 'chocosfera_community';

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary to-orange-600 rounded-xl text-white p-6 shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
              <span>🗨️</span>
              {t('title')}
            </h1>
            <p className="text-white/90">{t('description')}</p>
          </div>
          <div className="hidden md:block text-6xl">💬</div>
        </div>
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center gap-3">
            <span className="text-3xl">🤖</span>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">
                {t('features.bot.title')}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {t('features.bot.description')}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center gap-3">
            <span className="text-3xl">👨‍🌾</span>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">
                {t('features.farmers.title')}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {t('features.farmers.description')}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center gap-3">
            <span className="text-3xl">🌍</span>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">
                {t('features.community.title')}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {t('features.community.description')}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Telegram Widget */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <div className="mb-4">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            {t('chatTitle')}
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {t('chatDescription')}
          </p>
        </div>

        {/* Minor Restriction Check */}
        {(isMinor || !hasTelegramAccess) ? (
          <div className="bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 border-2 border-yellow-300 dark:border-yellow-700 rounded-lg p-8 text-center">
            <div className="mb-4">
              <span className="text-6xl block">🔒</span>
            </div>
            <h3 className="text-2xl font-bold text-yellow-900 dark:text-yellow-100 mb-3">
              {t('restricted.title')}
            </h3>
            <p className="text-base text-yellow-800 dark:text-yellow-200 mb-6 max-w-md mx-auto">
              {t('restricted.description')}
            </p>

            <div className="bg-white/50 dark:bg-gray-800/50 rounded-lg p-4 mb-6 max-w-md mx-auto">
              <h4 className="font-semibold text-yellow-900 dark:text-yellow-100 mb-2 flex items-center justify-center gap-2">
                <span>✨</span>
                {t('restricted.whyTitle')}
              </h4>
              <ul className="text-sm text-yellow-800 dark:text-yellow-200 text-left space-y-2">
                <li className="flex items-start gap-2">
                  <span className="text-lg">👶</span>
                  <span>{t('restricted.reason1')}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-lg">🛡️</span>
                  <span>{t('restricted.reason2')}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-lg">🌱</span>
                  <span>{t('restricted.reason3')}</span>
                </li>
              </ul>
            </div>

            <div className="space-y-3">
              <p className="text-sm font-semibold text-yellow-900 dark:text-yellow-100">
                {t('restricted.adultQuestion')}
              </p>
              <Link
                href={`/${locale}/dashboard/settings`}
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary to-orange-600 hover:from-primary/90 hover:to-orange-600/90 text-white font-bold rounded-lg transition-all shadow-md hover:shadow-lg hover:scale-105"
              >
                <span>✅</span>
                {t('restricted.verifyButton')}
              </Link>
            </div>
          </div>
        ) : (
          <>
            {/* Telegram Chat Component - Replica visual del chat de Telegram */}
            <TelegramChat channelName="Chocósfera Community" height={500} />

            {/* Join Button */}
            <div className="mt-4 flex justify-center">
              <a
                href={`https://t.me/${TELEGRAM_CHANNEL}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 text-white font-medium rounded-lg transition-all shadow-md hover:shadow-lg"
              >
                <span>📱</span>
                {t('joinButton')}
              </a>
            </div>
          </>
        )}
      </div>

      {/* Guidelines */}
      <div className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-xl border border-blue-200 dark:border-blue-800 p-6">
        <h3 className="text-lg font-bold text-blue-900 dark:text-blue-100 mb-3 flex items-center gap-2">
          <span>📋</span>
          {t('guidelines.title')}
        </h3>
        <ul className="space-y-2 text-sm text-blue-800 dark:text-blue-200">
          <li className="flex items-start gap-2">
            <span>✅</span>
            <span>{t('guidelines.rule1')}</span>
          </li>
          <li className="flex items-start gap-2">
            <span>✅</span>
            <span>{t('guidelines.rule2')}</span>
          </li>
          <li className="flex items-start gap-2">
            <span>✅</span>
            <span>{t('guidelines.rule3')}</span>
          </li>
          <li className="flex items-start gap-2">
            <span>❌</span>
            <span>{t('guidelines.rule4')}</span>
          </li>
        </ul>
      </div>
    </div>
  );
}
