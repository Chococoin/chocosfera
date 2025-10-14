'use client';

/**
 * Error Boundary
 * Catches errors in the app and displays a nice error page
 */

import { useEffect } from 'react';
import Link from 'next/link';
import { useLocale } from 'next-intl';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const locale = useLocale();

  useEffect(() => {
    // Log the error to console
    console.error('Application error:', error);
  }, [error]);

  const content = {
    es: {
      title: 'Algo salió mal',
      subtitle: '500',
      message: 'Lo sentimos, ha ocurrido un error inesperado.',
      description: 'Nuestro equipo ha sido notificado y trabajará para solucionarlo pronto.',
      tryAgain: 'Intentar de nuevo',
      goHome: 'Volver al inicio',
      errorDetails: 'Detalles del error',
    },
    en: {
      title: 'Something went wrong',
      subtitle: '500',
      message: "Sorry, an unexpected error has occurred.",
      description: 'Our team has been notified and will work to fix it soon.',
      tryAgain: 'Try again',
      goHome: 'Go home',
      errorDetails: 'Error details',
    },
    it: {
      title: 'Qualcosa è andato storto',
      subtitle: '500',
      message: 'Spiacenti, si è verificato un errore imprevisto.',
      description: 'Il nostro team è stato avvisato e lavorerà per risolverlo presto.',
      tryAgain: 'Riprova',
      goHome: 'Torna alla home',
      errorDetails: 'Dettagli errore',
    },
  };

  const t = content[locale as keyof typeof content] || content.es;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 dark:from-gray-900 dark:via-red-900/20 dark:to-orange-900/20 p-6">
      <div className="max-w-2xl w-full text-center">
        {/* Animated Error Icon */}
        <div className="mb-8 animate-pulse">
          <span className="text-9xl block">💥</span>
        </div>

        {/* Error Code */}
        <h1 className="text-8xl font-black text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-orange-600 mb-4">
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

        {/* Error Details (in development) */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mb-8 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-left">
            <p className="text-sm font-semibold text-red-900 dark:text-red-100 mb-2">
              {t.errorDetails}:
            </p>
            <pre className="text-xs text-red-800 dark:text-red-200 overflow-auto max-h-40">
              {error.message}
              {error.digest && `\n\nDigest: ${error.digest}`}
            </pre>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <button
            onClick={reset}
            className="px-8 py-4 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white font-bold rounded-lg transition-all shadow-md hover:shadow-lg flex items-center gap-2"
          >
            <span>🔄</span>
            {t.tryAgain}
          </button>
          <Link
            href={`/${locale}/dashboard`}
            className="px-8 py-4 border-2 border-red-600 text-red-600 dark:text-red-400 font-semibold rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-all flex items-center gap-2"
          >
            <span>🏠</span>
            {t.goHome}
          </Link>
        </div>

        {/* Help Message */}
        <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <p className="text-sm text-blue-800 dark:text-blue-200">
              💡 Si el problema persiste, por favor contacta al soporte en{' '}
              <a
                href="mailto:support@chocosfera.com"
                className="font-semibold underline hover:text-blue-600"
              >
                support@chocosfera.com
              </a>
            </p>
          </div>
        </div>

        {/* Fun Message */}
        <div className="mt-8 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
          <p className="text-sm text-amber-800 dark:text-amber-200">
            🍫 Mientras resolvemos esto, toma un respiro y disfruta de un chocolate
          </p>
        </div>
      </div>
    </div>
  );
}
