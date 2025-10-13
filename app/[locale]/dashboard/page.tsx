'use client';

import { useLocale, useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';

export default function DashboardPage() {
  const t = useTranslations('dashboard.main');
  const locale = useLocale();
  const router = useRouter();

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
  const recentActivityFormatter = new Intl.DateTimeFormat(locale, {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const quickActions = [
    { name: t('actions.adoptTree'), icon: '🌳', href: '/dashboard/trees' },
    { name: t('actions.viewTraceability'), icon: '🔍', href: '/dashboard/traceability' },
    { name: t('actions.seeImpact'), icon: '🌍', href: '/dashboard/impact' },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-[var(--color-border)] bg-[var(--color-surface)] backdrop-blur-[16px] p-8 shadow-lg">
        <div className="absolute inset-0 bg-gradient-to-br from-[rgba(223,134,170,0.2)] via-transparent to-[rgba(87,41,214,0.2)]" />
        <div className="relative flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2 text-heading" style={{ fontFamily: 'var(--font-heading)' }}>
              {t('welcome')}
            </h1>
            <p className="text-muted">{t('welcomeMessage')}</p>
          </div>
          <div className="hidden md:block text-6xl">🍫</div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div
            key={stat.title}
            className="surface-panel p-6 hover:shadow-xl transition-all hover:scale-[1.02]"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-muted mb-1">
                  {stat.title}
                </p>
                <p className="text-2xl font-bold text-heading" style={{ fontFamily: 'var(--font-heading)' }}>
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
                    <span className="text-muted ml-1">
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
        <div className="lg:col-span-2 surface-panel">
          <div className="px-6 py-4 border-b border-[var(--color-border)]">
            <h3 className="text-lg font-semibold text-heading" style={{ fontFamily: 'var(--font-heading)' }}>
              {t('recentActivity')}
            </h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {recentActivity.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-center space-x-4 p-4 rounded-2xl hover:bg-[rgba(223,134,170,0.08)] transition-all"
                >
                  <div className="text-3xl">{activity.icon}</div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-heading">
                      {activity.action}
                    </p>
                    <p className="text-xs text-muted">
                      {recentActivityFormatter.format(new Date(activity.date))}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="space-y-6">
          <div className="surface-panel">
            <div className="px-6 py-4 border-b border-[var(--color-border)]">
              <h3 className="text-lg font-semibold text-heading" style={{ fontFamily: 'var(--font-heading)' }}>
                {t('quickActions')}
              </h3>
            </div>
            <div className="p-6 space-y-3">
              {quickActions.map((action) => {
                const localizedHref = `/${locale}${action.href}`;

                return (
                  <button
                    key={action.name}
                    type="button"
                    onClick={() => router.push(localizedHref)}
                    className="w-full flex items-center justify-between p-3 text-left rounded-2xl border border-[var(--color-border)] hover:bg-gradient-to-r hover:from-[rgba(223,134,170,0.1)] hover:to-[rgba(87,41,214,0.1)] hover:border-[rgba(223,134,170,0.3)] transition-all"
                  >
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">{action.icon}</span>
                      <span className="font-medium text-heading">
                        {action.name}
                      </span>
                    </div>
                    <span className="text-muted">→</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Impact Summary */}
          <div className="relative overflow-hidden rounded-3xl border border-green-200 dark:border-green-800 bg-[var(--color-surface)] backdrop-blur-[16px] p-6">
            <div className="absolute inset-0 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20" />
            <div className="relative">
              <h4 className="text-sm font-semibold text-green-900 dark:text-green-100 mb-3" style={{ fontFamily: 'var(--font-heading)' }}>
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
    </div>
  );
}
