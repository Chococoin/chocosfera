'use client';

/**
 * 404 Not Found Page
 * Custom error page for when a page is not found
 */

import Link from 'next/link';
import { useLocale } from 'next-intl';

export default function NotFound() {
  const locale = useLocale();

  const content = {
    es: {
      title: 'Página no encontrada',
      subtitle: '404',
      message: 'Lo sentimos, no pudimos encontrar la página que buscas.',
      description: 'Es posible que el enlace esté roto o que la página haya sido movida.',
      goHome: 'Volver al inicio',
      goBack: 'Volver atrás',
    },
    en: {
      title: 'Page not found',
      subtitle: '404',
      message: "Sorry, we couldn't find the page you're looking for.",
      description: 'The link might be broken or the page may have been moved.',
      goHome: 'Go home',
      goBack: 'Go back',
    },
    it: {
      title: 'Pagina non trovata',
      subtitle: '404',
      message: 'Spiacenti, non siamo riusciti a trovare la pagina che stai cercando.',
      description: 'Il link potrebbe essere rotto o la pagina potrebbe essere stata spostata.',
      goHome: 'Torna alla home',
      goBack: 'Torna indietro',
    },
  };

  const t = content[locale as keyof typeof content] || content.es;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-pink-900/20 p-6">
      <div className="max-w-2xl w-full text-center">
        {/* Animated 404 Icon */}
        <div className="mb-8 animate-bounce">
          <span className="text-9xl block">🍫</span>
        </div>

        {/* Error Code */}
        <h1 className="text-8xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600 mb-4">
          {t.subtitle}
        </h1>

        {/* Title */}
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
          {t.title}
        </h2>

        {/* Message */}
        <p className="text-xl text-gray-600 dark:text-gray-400 mb-2">
          {t.message}
        </p>
        <p className="text-gray-500 dark:text-gray-500 mb-8">
          {t.description}
        </p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link
            href={`/${locale}/dashboard`}
            className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold rounded-lg transition-all shadow-md hover:shadow-lg flex items-center gap-2"
          >
            <span>🏠</span>
            {t.goHome}
          </Link>
          <button
            onClick={() => window.history.back()}
            className="px-8 py-4 border-2 border-purple-600 text-purple-600 dark:text-purple-400 font-semibold rounded-lg hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all flex items-center gap-2"
          >
            <span>←</span>
            {t.goBack}
          </button>
        </div>

        {/* Helpful Links */}
        <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Páginas populares:
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link
              href={`/${locale}/dashboard`}
              className="text-sm text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 underline"
            >
              Dashboard
            </Link>
            <span className="text-gray-400">•</span>
            <Link
              href={`/${locale}/dashboard/characters`}
              className="text-sm text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 underline"
            >
              Personajes
            </Link>
            <span className="text-gray-400">•</span>
            <Link
              href={`/${locale}/dashboard/family`}
              className="text-sm text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 underline"
            >
              Familia
            </Link>
            <span className="text-gray-400">•</span>
            <Link
              href={`/${locale}/dashboard/settings`}
              className="text-sm text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 underline"
            >
              Configuración
            </Link>
          </div>
        </div>

        {/* Fun Message */}
        <div className="mt-8 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
          <p className="text-sm text-amber-800 dark:text-amber-200">
            🍫 Mientras tanto, ¿por qué no disfrutas de un chocolate?
          </p>
        </div>
      </div>
    </div>
  );
}
