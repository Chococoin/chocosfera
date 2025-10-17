'use client';

import { useTranslations, useLocale } from 'next-intl';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import LanguageSelector from '../../components/LanguageSelector';
import ThemeToggle from '../../components/ThemeToggle';

export default function BlogArticlePage() {
  const t = useTranslations();
  const router = useRouter();
  const locale = useLocale();
  const { user } = useAuth();
  const params = useParams();
  const slug = params.slug as string;

  // Render Venezuela container article
  if (slug === 'venezuela-container') {
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
          {/* Article */}
          <article className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 mb-8">
            {/* Article Header */}
            <div className="mb-8">
              <div className="inline-block px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-sm font-semibold rounded-full mb-4">
                📦 {t('notifications.venezuelaContainer.readMore')}
              </div>
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
                {t('notifications.venezuelaContainer.title')}
              </h1>
              <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                <span>17 Octubre 2025</span>
                <span>•</span>
                <span>Equipo Chocósfera</span>
              </div>
            </div>

            {/* Featured Image Placeholder */}
            <div className="mb-8 rounded-xl overflow-hidden bg-gradient-to-br from-yellow-400 via-red-500 to-blue-600 aspect-video flex items-center justify-center relative">
              <span className="text-9xl">🚢</span>
              <div className="absolute bottom-4 right-4 bg-white/90 dark:bg-gray-800/90 px-3 py-1 rounded-full text-xs font-semibold">
                🇻🇪 Venezuela → 🇮🇹 Italia
              </div>
            </div>

            {/* Article Content */}
            <div className="prose prose-lg dark:prose-invert max-w-none">
              <p className="text-xl text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
                {t('notifications.venezuelaContainer.message')}
              </p>

              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt-8 mb-4">
                Una Historia de Conexión y Comercio Justo
              </h2>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
                Los cacaocultores de las montañas venezolanas han logrado un hito histórico: enviar
                su primer container de cacao fino de aroma directamente a Italia, sin intermediarios.
                Este logro representa años de trabajo, dedicación y la construcción de una red de
                comercio justo que conecta directamente a los productores con los consumidores finales.
              </p>

              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt-8 mb-4">
                El Viaje del Cacao
              </h2>
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl p-6 mb-6">
                <ol className="space-y-4">
                  <li className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-8 h-8 bg-yellow-600 text-white rounded-full flex items-center justify-center font-bold">
                      1
                    </span>
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white">Cultivo y Cosecha</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        En las fincas de Barlovento y Paria, los agricultores cultivan cacao criollo y trinitario
                        con métodos tradicionales y orgánicos.
                      </p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-8 h-8 bg-red-600 text-white rounded-full flex items-center justify-center font-bold">
                      2
                    </span>
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white">Fermentación y Secado</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Un proceso cuidadoso de 7 días que desarrolla los aromas característicos del cacao venezolano.
                      </p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                      3
                    </span>
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white">Travesía Marítima</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        15 toneladas de cacao de primera calidad navegaron durante 3 semanas desde Puerto Cabello
                        hasta el puerto de Génova.
                      </p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center font-bold">
                      4
                    </span>
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white">Llegada a Italia</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        El cacao llegó a talleres artesanales en Turín y Milán, donde se transformará en
                        chocolates premium.
                      </p>
                    </div>
                  </li>
                </ol>
              </div>

              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt-8 mb-4">
                Impacto en las Comunidades
              </h2>
              <ul className="space-y-3 mb-6">
                <li className="flex items-start gap-3">
                  <span className="text-purple-600 dark:text-purple-400 text-xl">✓</span>
                  <span className="text-gray-700 dark:text-gray-300">
                    <strong>35 familias</strong> de cacaocultores beneficiadas directamente
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-purple-600 dark:text-purple-400 text-xl">✓</span>
                  <span className="text-gray-700 dark:text-gray-300">
                    <strong>Precio justo:</strong> 40% por encima del precio de mercado convencional
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-purple-600 dark:text-purple-400 text-xl">✓</span>
                  <span className="text-gray-700 dark:text-gray-300">
                    <strong>Trazabilidad completa</strong> desde el árbol hasta el chocolate final
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-purple-600 dark:text-purple-400 text-xl">✓</span>
                  <span className="text-gray-700 dark:text-gray-300">
                    <strong>Certificación orgánica</strong> y prácticas sostenibles verificadas
                  </span>
                </li>
              </ul>

              <div className="bg-gradient-to-r from-yellow-50 via-red-50 to-blue-50 dark:from-yellow-900/20 dark:via-red-900/20 dark:to-blue-900/20 border-l-4 border-yellow-500 p-6 rounded-r-xl mt-8">
                <p className="text-gray-900 dark:text-gray-100 font-semibold mb-2 flex items-center gap-2">
                  <span>🌟</span>
                  Próximos Pasos
                </p>
                <p className="text-gray-800 dark:text-gray-200">
                  Este es solo el comienzo. Ya está en preparación el segundo container,
                  y estamos trabajando en establecer una ruta comercial regular que beneficie
                  a más comunidades cacaoteras de Venezuela. ¡Sé parte de esta historia!
                </p>
              </div>
            </div>

            {/* CTA */}
            <div className="mt-12 text-center">
              <button
                onClick={() => router.push(`/${locale}/adopt`)}
                className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-yellow-500 via-red-500 to-blue-600 hover:from-yellow-600 hover:via-red-600 hover:to-blue-700 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all"
              >
                <span>🌱</span>
                Adopta un Árbol en Venezuela
              </button>
            </div>
          </article>

          {/* More articles link */}
          <div className="text-center">
            <button
              onClick={() => router.push(`/${locale}/blog`)}
              className="text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 font-semibold"
            >
              ← Ver todos los artículos
            </button>
          </div>
        </main>
      </div>
    );
  }

  // 404 for unknown slugs
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-pink-900/20 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
          Artículo no encontrado
        </h1>
        <button
          onClick={() => router.push(`/${locale}/blog`)}
          className="text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 font-semibold"
        >
          ← Volver al blog
        </button>
      </div>
    </div>
  );
}
