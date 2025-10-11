'use client';

import { useTranslations } from 'next-intl';

export default function DashboardPage() {
  const t = useTranslations('dashboard.main');

  const stats = [
    {
      title: t('stats.adoptedTrees'),
      value: '12',
      icon: '🌳',
      change: { value: 3, type: 'increase' as const },
      color: 'green',
    },
    {
      title: t('stats.cocoaProduced'),
      value: '248 kg',
      icon: '🍫',
      change: { value: 15, type: 'increase' as const },
      color: 'primary',
    },
    {
      title: t('stats.carbonOffset'),
      value: '1.2 ton',
      icon: '🌍',
      change: { value: 8, type: 'increase' as const },
      color: 'blue',
    },
    {
      title: t('stats.communitiesHelped'),
      value: '5',
      icon: '👥',
      change: { value: 2, type: 'increase' as const },
      color: 'orange',
    },
  ];

  const recentActivity = [
    { id: 1, action: t('activity.treeAdopted'), date: '2025-03-15', icon: '🌱' },
    { id: 2, action: t('activity.harvestRecorded'), date: '2025-03-10', icon: '📦' },
    { id: 3, action: t('activity.impactUpdated'), date: '2025-03-05', icon: '📊' },
  ];

  const quickActions = [
    { name: t('actions.adoptTree'), icon: '🌳', href: '/dashboard/trees' },
    { name: t('actions.viewTraceability'), icon: '🔍', href: '/dashboard/traceability' },
    { name: t('actions.seeImpact'), icon: '🌍', href: '/dashboard/impact' },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-primary to-orange-600 rounded-xl text-white p-6 shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">{t('welcome')}</h1>
            <p className="text-white/90">{t('welcomeMessage')}</p>
          </div>
          <div className="hidden md:block text-6xl">🍫</div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div
            key={stat.title}
            className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                  {stat.title}
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stat.value}
                </p>
                {stat.change && (
                  <div className="flex items-center mt-2 text-sm">
                    <span
                      className={`${
                        stat.change.type === 'increase'
                          ? 'text-green-600 dark:text-green-400'
                          : 'text-red-600 dark:text-red-400'
                      }`}
                    >
                      {stat.change.type === 'increase' ? '↑' : '↓'} {stat.change.value}%
                    </span>
                    <span className="text-gray-500 dark:text-gray-400 ml-1">
                      {t('stats.thisMonth')}
                    </span>
                  </div>
                )}
              </div>
              <div className="text-4xl">{stat.icon}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {t('recentActivity')}
            </h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {recentActivity.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-center space-x-4 p-4 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                >
                  <div className="text-3xl">{activity.icon}</div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {activity.action}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {new Date(activity.date).toLocaleDateString('es-ES', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                      })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {t('quickActions')}
              </h3>
            </div>
            <div className="p-6 space-y-3">
              {quickActions.map((action) => (
                <button
                  key={action.name}
                  type="button"
                  onClick={() => (window.location.href = action.href)}
                  className="w-full flex items-center justify-between p-3 text-left rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gradient-to-r hover:from-primary/10 hover:to-orange-600/10 hover:border-primary/30 transition-all"
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">{action.icon}</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {action.name}
                    </span>
                  </div>
                  <span className="text-gray-400">→</span>
                </button>
              ))}
            </div>
          </div>

          {/* Impact Summary */}
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl border border-green-200 dark:border-green-800 p-6">
            <h4 className="text-sm font-semibold text-green-900 dark:text-green-100 mb-3">
              {t('impactSummary.title')}
            </h4>
            <div className="space-y-2 text-sm text-green-800 dark:text-green-200">
              <p>🌳 {t('impactSummary.treesGrowing')}</p>
              <p>👨‍🌾 {t('impactSummary.farmersSupported')}</p>
              <p>♻️ {t('impactSummary.sustainablePractices')}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
