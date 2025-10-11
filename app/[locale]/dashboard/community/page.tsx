'use client';

import { useTranslations } from 'next-intl';
import { TelegramWidget } from '../components/TelegramWidget';

export default function CommunityPage() {
  const t = useTranslations('dashboard.community');

  // IMPORTANTE: Reemplaza esto con el username real de tu grupo/canal de Telegram
  // Ejemplo: Si tu grupo es https://t.me/chocosfera_community
  // entonces el channelUsername es "chocosfera_community"
  const TELEGRAM_CHANNEL = 'tu_grupo_telegram'; // ⚠️ CAMBIAR ESTO

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

        {/* Widget de Telegram */}
        {TELEGRAM_CHANNEL === 'tu_grupo_telegram' ? (
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border-2 border-yellow-200 dark:border-yellow-800 rounded-lg p-6 text-center">
            <span className="text-4xl mb-4 block">⚠️</span>
            <h3 className="text-lg font-bold text-yellow-900 dark:text-yellow-100 mb-2">
              Configuración Requerida
            </h3>
            <p className="text-sm text-yellow-800 dark:text-yellow-200">
              Para ver el chat de Telegram aquí, necesitas:
            </p>
            <ol className="mt-3 text-left text-sm text-yellow-800 dark:text-yellow-200 max-w-md mx-auto space-y-2">
              <li className="flex items-start gap-2">
                <span>1.</span>
                <span>Crear un grupo o canal público en Telegram</span>
              </li>
              <li className="flex items-start gap-2">
                <span>2.</span>
                <span>Obtener el username (ej: @chocosfera_community)</span>
              </li>
              <li className="flex items-start gap-2">
                <span>3.</span>
                <span>
                  Actualizar la constante <code className="bg-yellow-100 dark:bg-yellow-800 px-1 rounded">TELEGRAM_CHANNEL</code> en{' '}
                  <code className="bg-yellow-100 dark:bg-yellow-800 px-1 rounded">
                    dashboard/community/page.tsx
                  </code>
                </span>
              </li>
            </ol>
          </div>
        ) : (
          <TelegramWidget channelUsername={TELEGRAM_CHANNEL} height={500} />
        )}

        {/* Join Button */}
        {TELEGRAM_CHANNEL !== 'tu_grupo_telegram' && (
          <div className="mt-4 flex justify-center">
            <a
              href={`https://t.me/${TELEGRAM_CHANNEL}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary to-orange-600 hover:from-primary/90 hover:to-orange-600/90 text-white font-medium rounded-lg transition-all shadow-sm hover:shadow-md"
            >
              <span>📱</span>
              {t('joinButton')}
            </a>
          </div>
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
