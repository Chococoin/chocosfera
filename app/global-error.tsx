'use client';

/**
 * Global Error Handler
 * Catches errors in the root layout
 */

import { useEffect } from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to error reporting service
    console.error('Global error:', error);
  }, [error]);

  return (
    <html lang="es">
      <body>
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 p-6">
          <div className="max-w-2xl w-full text-center">
            {/* Error Icon */}
            <div className="mb-8">
              <span className="text-9xl block animate-pulse">⚠️</span>
            </div>

            {/* Title */}
            <h1 className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-orange-600 mb-4">
              Error Crítico
            </h1>

            {/* Message */}
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              La aplicación encontró un problema
            </h2>

            <p className="text-xl text-gray-600 mb-8">
              Algo salió mal al cargar la aplicación. Por favor, intenta recargar la página.
            </p>

            {/* Error Details (in development) */}
            {process.env.NODE_ENV === 'development' && (
              <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-lg text-left">
                <p className="text-sm font-semibold text-red-900 mb-2">
                  Detalles del error:
                </p>
                <pre className="text-xs text-red-800 overflow-auto max-h-40">
                  {error.message}
                  {error.stack && `\n\n${error.stack}`}
                  {error.digest && `\n\nDigest: ${error.digest}`}
                </pre>
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <button
                onClick={reset}
                className="px-8 py-4 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white font-bold rounded-lg transition-all shadow-md hover:shadow-lg"
              >
                🔄 Intentar de nuevo
              </button>
              <button
                onClick={() => window.location.href = '/'}
                className="px-8 py-4 border-2 border-red-600 text-red-600 font-semibold rounded-lg hover:bg-red-50 transition-all"
              >
                🏠 Ir al inicio
              </button>
            </div>

            {/* Support Info */}
            <div className="mt-12 pt-8 border-t border-gray-200">
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800">
                  💡 Si el problema persiste, contacta al soporte en{' '}
                  <a
                    href="mailto:support@chocosfera.com"
                    className="font-semibold underline hover:text-blue-600"
                  >
                    support@chocosfera.com
                  </a>
                </p>
              </div>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
