'use client';

import { useTranslations } from 'next-intl';
import { What3WordsAddress } from './components/What3WordsAddress';

export default function TreesPage() {
  const t = useTranslations('dashboard.trees');

  // Datos de ejemplo - en producción vendrían de una API
  const myTrees = [
    {
      id: 1,
      name: 'Cacao #001',
      location: 'Valle del Cauca, Colombia',
      adoptedDate: '2024-01-15',
      age: '2 años',
      production: '45 kg',
      status: 'healthy',
      image: '🌳',
      farmer: 'Juan Pérez',
      coordinates: { lat: 3.4516, lng: -76.5320 },
      what3words: {
        address: 'árbol.chocolate.dulce',
        language: 'es',
        languageName: 'Español',
      },
    },
    {
      id: 2,
      name: 'Cacao #002',
      location: 'Cusco, Perú',
      adoptedDate: '2024-03-20',
      age: '1.5 años',
      production: '32 kg',
      status: 'growing',
      image: '🌱',
      farmer: 'María González',
      coordinates: { lat: -13.5319, lng: -71.9675 },
      what3words: {
        address: 'montaña.cacao.sembrado',
        language: 'es',
        languageName: 'Español',
      },
    },
    {
      id: 3,
      name: 'Cacao #003',
      location: 'Tabasco, México',
      adoptedDate: '2024-06-10',
      age: '8 meses',
      production: '0 kg',
      status: 'young',
      image: '🌿',
      farmer: 'Carlos Ramírez',
      coordinates: { lat: 17.9895, lng: -92.9475 },
      what3words: {
        address: 'verde.tierra.fresco',
        language: 'es',
        languageName: 'Español',
      },
    },
    {
      id: 4,
      name: 'Cacao #004',
      location: 'Kilimanjaro, Tanzania',
      adoptedDate: '2023-11-05',
      age: '3 años',
      production: '58 kg',
      status: 'healthy',
      image: '🌳',
      farmer: 'Amani Mkali',
      coordinates: { lat: -3.3869, lng: 37.3490 },
      what3words: {
        address: 'mti.kahawa.tamu',
        language: 'sw',
        languageName: 'Kiswahili',
      },
    },
    {
      id: 5,
      name: 'Cacao #005',
      location: 'Barlovento, Venezuela',
      adoptedDate: '2024-02-28',
      age: '1 año',
      production: '28 kg',
      status: 'growing',
      image: '🌱',
      farmer: 'Rosa Medina',
      coordinates: { lat: 10.4692, lng: -66.0176 },
      what3words: {
        address: 'brotes.selva.cosecha',
        language: 'es',
        languageName: 'Español',
      },
    },
    {
      id: 6,
      name: 'Cacao #006',
      location: 'Esmeraldas, Ecuador',
      adoptedDate: '2024-05-12',
      age: '10 meses',
      production: '15 kg',
      status: 'young',
      image: '🌿',
      farmer: 'Pedro Quiñónez',
      coordinates: { lat: 0.9592, lng: -79.6517 },
      what3words: {
        address: 'plantación.joven.esperanza',
        language: 'es',
        languageName: 'Español',
      },
    },
  ];

  const stats = [
    { label: t('stats.totalTrees'), value: myTrees.length, icon: '🌳' },
    { label: t('stats.totalProduction'), value: '178 kg', icon: '🍫' },
    { label: t('stats.co2Offset'), value: '2.4 ton', icon: '🌍' },
    { label: t('stats.farmersSupported'), value: '6', icon: '👨‍🌾' },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      case 'growing':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
      case 'young':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'healthy':
        return t('status.healthy');
      case 'growing':
        return t('status.growing');
      case 'young':
        return t('status.young');
      default:
        return status;
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl text-white p-6 shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
              <span>🌳</span>
              {t('title')}
            </h1>
            <p className="text-white/90">{t('description')}</p>
          </div>
          <div className="hidden md:block text-6xl">🌿</div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <div
            key={index}
            className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                  {stat.label}
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stat.value}
                </p>
              </div>
              <div className="text-4xl">{stat.icon}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Trees Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {myTrees.map((tree) => (
          <div
            key={tree.id}
            className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-lg transition-all overflow-hidden"
          >
            {/* Tree Image/Icon */}
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 p-8 flex items-center justify-center">
              <span className="text-8xl">{tree.image}</span>
            </div>

            {/* Tree Info */}
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
                    {tree.name}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-1">
                    <span>📍</span>
                    {tree.location}
                  </p>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                    tree.status
                  )}`}
                >
                  {getStatusText(tree.status)}
                </span>
              </div>

              {/* Tree Details */}
              <div className="space-y-3 mb-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">
                    {t('treeCard.age')}
                  </span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {tree.age}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">
                    {t('treeCard.production')}
                  </span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {tree.production}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">
                    {t('treeCard.farmer')}
                  </span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {tree.farmer}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">
                    {t('treeCard.adopted')}
                  </span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {new Date(tree.adoptedDate).toLocaleDateString('es-ES', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </span>
                </div>
              </div>

              {/* what3words Location */}
              <div className="mb-4">
                <What3WordsAddress
                  address={tree.what3words.address}
                  languageName={tree.what3words.languageName}
                />
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <button
                  type="button"
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white text-sm font-medium rounded-lg transition-all"
                >
                  {t('treeCard.viewDetails')}
                </button>
                <button
                  type="button"
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 text-sm font-medium rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-all"
                >
                  📍
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Adopt New Tree CTA */}
      <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl border border-green-200 dark:border-green-800 p-8 text-center">
        <span className="text-6xl mb-4 block">🌱</span>
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          {t('adoptCta.title')}
        </h3>
        <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
          {t('adoptCta.description')}
        </p>
        <button
          type="button"
          className="px-8 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-medium rounded-lg transition-all shadow-sm hover:shadow-md"
        >
          {t('adoptCta.button')}
        </button>
      </div>
    </div>
  );
}
