'use client';

import { useTranslations } from 'next-intl';
import Header from '../components/Header';
import Footer from '../components/Footer';

const categories = [
  { key: 'brand', icon: '/media-kit/brand/', emoji: '🎨' },
  { key: 'screenshots', icon: '/media-kit/screenshots/', emoji: '📸' },
  { key: 'press', icon: '/media-kit/press/', emoji: '📰' },
] as const;

export default function MediaKitPage() {
  const t = useTranslations('mediaKit');

  return (
    <>
      <Header />
      <main className="min-h-screen pt-32 pb-16 px-4 bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-10">
            <div className="text-5xl mb-4">📦</div>
            <h1 className="text-3xl font-bold text-heading dark:text-white mb-2">
              {t('title')}
            </h1>
            <p className="text-muted">
              {t('subtitle')}
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-3">
            {categories.map(({ key, emoji }) => (
              <div
                key={key}
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 text-center"
              >
                <div className="text-4xl mb-3">{emoji}</div>
                <h2 className="text-lg font-semibold text-heading dark:text-white mb-1">
                  {t(key)}
                </h2>
                <p className="text-sm text-muted mb-4">
                  {t(`${key}Desc` as 'brandDesc' | 'screenshotsDesc' | 'pressDesc')}
                </p>
                <span className="inline-block text-xs bg-gray-100 dark:bg-gray-700 text-muted px-3 py-1 rounded-full">
                  {t('comingSoon')}
                </span>
              </div>
            ))}
          </div>

          <div className="mt-10 text-center">
            <p className="text-sm text-muted">
              {t('contact')}{' '}
              <a
                href="mailto:press@chocosfera.com"
                className="text-blue-600 hover:underline"
              >
                press@chocosfera.com
              </a>
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
