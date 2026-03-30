'use client';

import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { What3WordsAddress } from './components/What3WordsAddress';
import { useTreeRegistry } from '@/hooks/useTreeRegistry';

// On-chain status → display mapping
const STATUS_MAP: Record<string, { display: string; color: string; icon: string }> = {
  planted: { display: 'young', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300', icon: '🌿' },
  growing: { display: 'growing', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300', icon: '🌱' },
  producing: { display: 'healthy', color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300', icon: '🌳' },
  dead: { display: 'dead', color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300', icon: '💀' },
};

export default function TreesPage() {
  const t = useTranslations('dashboard.trees');
  const router = useRouter();
  const { trees: onChainTrees, total, isLoading, error } = useTreeRegistry();

  // Map on-chain trees to display format
  const myTrees = onChainTrees.map((tree) => {
    const statusInfo = STATUS_MAP[tree.status] || STATUS_MAP.planted;
    return {
      id: tree.id,
      name: `Cacao #${String(tree.id).padStart(3, '0')}`,
      location: tree.farmer !== '0x0000000000000000000000000000000000000000'
        ? `Farmer ${tree.farmer.slice(0, 6)}...${tree.farmer.slice(-4)}`
        : 'Unknown',
      adoptedDate: tree.adoptedAt || '',
      status: statusInfo.display,
      image: statusInfo.icon,
      farmer: tree.farmer !== '0x0000000000000000000000000000000000000000'
        ? `${tree.farmer.slice(0, 6)}...${tree.farmer.slice(-4)}`
        : '-',
      adopter: tree.adopter !== '0x0000000000000000000000000000000000000000'
        ? `${tree.adopter.slice(0, 6)}...${tree.adopter.slice(-4)}`
        : null,
      onChainStatus: tree.status,
      lastAuditBlock: tree.lastAuditBlock,
    };
  });

  const adoptedCount = myTrees.filter((t) => t.adopter).length;
  const uniqueFarmers = new Set(onChainTrees.map((t) => t.farmer).filter((f) => f !== '0x0000000000000000000000000000000000000000'));

  const stats = [
    { label: t('stats.totalTrees'), value: isLoading ? '...' : total, icon: '🌳' },
    { label: t('stats.totalProduction'), value: `${adoptedCount} adopted`, icon: '🍫' },
    { label: t('stats.co2Offset'), value: `${(total * 0.2).toFixed(1)} ton`, icon: '🌍' },
    { label: t('stats.farmersSupported'), value: isLoading ? '...' : uniqueFarmers.size, icon: '👨‍🌾' },
  ];

  const getStatusColor = (status: string) => {
    const entry = Object.values(STATUS_MAP).find((s) => s.display === status);
    return entry?.color || 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300';
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'healthy': return t('status.healthy');
      case 'growing': return t('status.growing');
      case 'young': return t('status.young');
      case 'dead': return 'Dead';
      default: return status;
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

      {/* Loading / Error / Empty states */}
      {isLoading && (
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">
          Loading trees from blockchain...
        </div>
      )}
      {error && (
        <div className="text-center py-12">
          <p className="text-red-500 mb-2">Blockchain unavailable</p>
          <p className="text-sm text-gray-500">{error}</p>
        </div>
      )}

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
                    {t('treeCard.farmer')}
                  </span>
                  <span className="font-medium font-mono text-gray-900 dark:text-white">
                    {tree.farmer}
                  </span>
                </div>
                {tree.adopter && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">
                      Adopter
                    </span>
                    <span className="font-medium font-mono text-gray-900 dark:text-white">
                      {tree.adopter}
                    </span>
                  </div>
                )}
                {tree.adoptedDate && (
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
                )}
                {tree.lastAuditBlock > 0 && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">
                      Last Audit
                    </span>
                    <span className="font-medium text-green-600 dark:text-green-400">
                      Block #{tree.lastAuditBlock}
                    </span>
                  </div>
                )}
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">
                    On-chain Status
                  </span>
                  <span className="font-medium text-xs font-mono text-gray-500 dark:text-gray-400">
                    {tree.onChainStatus}
                  </span>
                </div>
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
          onClick={() => router.push('marketplace?category=trees')}
          className="px-8 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-medium rounded-lg transition-all shadow-sm hover:shadow-md"
        >
          {t('adoptCta.button')}
        </button>
      </div>
    </div>
  );
}
