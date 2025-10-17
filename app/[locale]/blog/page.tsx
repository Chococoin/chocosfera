'use client';

import { useTranslations, useLocale } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import LanguageSelector from '../components/LanguageSelector';
import ThemeToggle from '../components/ThemeToggle';

export default function BlogPage() {
  const t = useTranslations();
  const router = useRouter();
  const locale = useLocale();
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-pink-900/20">
      {/* Header */}
      <header className="border-b border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <button
            onClick={() => router.push(user ? `/${locale}/dashboard` : `/${locale}`)}
            className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white inline-flex items-center gap-2"
          >
            <span>←</span>
            {user ? t('dashboard.sidebar.dashboard') : t('navigation.home')}
          </button>

          {/* Language Selector and Theme Toggle */}
          <div className="flex items-center gap-3">
            <LanguageSelector currentLocale={locale} />
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-6 py-12">
        {/* Blog Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-4">
            {t('blog.title')}
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400">
            {t('blog.subtitle')}
          </p>
        </div>

        {/* ChocoCrypto Article */}
        <article className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 mb-8">
          {/* Article Header */}
          <div className="mb-8">
            <div className="inline-block px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-sm font-semibold rounded-full mb-4">
              🎉 {t('notifications.chococrypto.readMore')}
            </div>
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              {t('notifications.chococrypto.title')}
            </h2>
            <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
              <span>17 Octubre 2025</span>
              <span>•</span>
              <span>Equipo Chocósfera</span>
            </div>
          </div>

          {/* Featured Image Placeholder */}
          <div className="mb-8 rounded-xl overflow-hidden bg-gradient-to-br from-purple-500 to-pink-500 aspect-video flex items-center justify-center">
            <span className="text-9xl">🍫</span>
          </div>

          {/* Article Content */}
          <div className="prose prose-lg dark:prose-invert max-w-none">
            <p className="text-xl text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
              {t('notifications.chococrypto.message')}
            </p>

            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-8 mb-4">
              ¿Qué es ChocoCrypto?
            </h3>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
              ChocoCrypto es nuestro primer lote especial de tabletas de chocolate artesanales,
              disponibles exclusivamente para nuestra comunidad. Cada tableta ha sido elaborada
              con el cacao más fino de nuestros árboles adoptados.
            </p>

            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-8 mb-4">
              ¿Cómo conseguir tu ChocoCrypto?
            </h3>
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl p-6 mb-6">
              <ol className="space-y-4">
                <li className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold">
                    1
                  </span>
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">Acumula ChocoCoins</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Gana ChocoCoins adoptando árboles, participando en la comunidad o comprando paquetes.
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold">
                    2
                  </span>
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">Visita el Marketplace</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Ve a la sección de Marketplace en tu dashboard.
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold">
                    3
                  </span>
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">Canjea tus ChocoCoins</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Usa tus ChocoCoins para obtener descuentos en las tabletas ChocoCrypto.
                    </p>
                  </div>
                </li>
              </ol>
            </div>

            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-8 mb-4">
              Características especiales
            </h3>
            <ul className="space-y-3 mb-6">
              <li className="flex items-start gap-3">
                <span className="text-purple-600 dark:text-purple-400 text-xl">✓</span>
                <span className="text-gray-700 dark:text-gray-300">
                  Cacao 100% orgánico de nuestros árboles adoptados
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-purple-600 dark:text-purple-400 text-xl">✓</span>
                <span className="text-gray-700 dark:text-gray-300">
                  Trazabilidad completa desde el árbol hasta tu mesa
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-purple-600 dark:text-purple-400 text-xl">✓</span>
                <span className="text-gray-700 dark:text-gray-300">
                  Empaque sostenible y biodegradable
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-purple-600 dark:text-purple-400 text-xl">✓</span>
                <span className="text-gray-700 dark:text-gray-300">
                  Edición limitada exclusiva para la comunidad
                </span>
              </li>
            </ul>

            <div className="bg-amber-50 dark:bg-amber-900/20 border-l-4 border-amber-500 p-6 rounded-r-xl mt-8">
              <p className="text-amber-900 dark:text-amber-100 font-semibold mb-2">
                🎁 Oferta de lanzamiento
              </p>
              <p className="text-amber-800 dark:text-amber-200">
                Durante el primer mes, todas las tabletas ChocoCrypto tienen un 20% de descuento adicional
                al pagar con ChocoCoins. ¡No te lo pierdas!
              </p>
            </div>
          </div>

          {/* CTA */}
          <div className="mt-12 text-center">
            <button
              onClick={() => router.push(`/${locale}/dashboard/marketplace`)}
              className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all"
            >
              <span>🛒</span>
              Ir al Marketplace
            </button>
          </div>
        </article>

        {/* More articles placeholder */}
        <div className="text-center text-gray-500 dark:text-gray-400 py-8">
          <p>Más artículos próximamente...</p>
        </div>
      </main>
    </div>
  );
}
