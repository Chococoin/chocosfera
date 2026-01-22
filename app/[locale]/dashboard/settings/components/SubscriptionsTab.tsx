'use client';

import { useTranslations } from 'next-intl';
import { Card, CardHeader, StatusBadge } from '@/components/ui';

interface Subscription {
  id: number;
  plan: string;
  status: string;
  price: string;
  nextPayment: string;
}

interface SubscriptionsTabProps {
  subscriptions?: Subscription[];
}

export function SubscriptionsTab({ subscriptions = [] }: SubscriptionsTabProps) {
  const t = useTranslations('dashboard.settings');

  // Mock data if no subscriptions provided
  const defaultSubscriptions: Subscription[] = [
    {
      id: 1,
      plan: 'Seed - Sprout',
      status: 'active',
      price: '€2.99/mes',
      nextPayment: '2024-11-14',
    },
    {
      id: 2,
      plan: 'Fruit - Cacao Pod',
      status: 'active',
      price: '€15.99/mes',
      nextPayment: '2024-11-20',
    },
  ];

  const displaySubscriptions = subscriptions.length > 0 ? subscriptions : defaultSubscriptions;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader title={t('subscriptions.title')} />

        {displaySubscriptions.length > 0 ? (
          <div className="space-y-4">
            {displaySubscriptions.map((sub) => (
              <SubscriptionCard key={sub.id} subscription={sub} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <span className="text-6xl block mb-4">💳</span>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {t('subscriptions.noSubscriptions')}
            </p>
            <button
              type="button"
              className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg transition-all"
            >
              {t('subscriptions.viewPlans')}
            </button>
          </div>
        )}
      </Card>
    </div>
  );
}

interface SubscriptionCardProps {
  subscription: Subscription;
}

function SubscriptionCard({ subscription }: SubscriptionCardProps) {
  const t = useTranslations('dashboard.settings');

  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-all">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="font-bold text-gray-900 dark:text-white">
              {subscription.plan}
            </h3>
            <StatusBadge variant={subscription.status === 'active' ? 'success' : 'default'}>
              {subscription.status === 'active'
                ? t('subscriptions.active')
                : t('subscriptions.inactive')}
            </StatusBadge>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {t('subscriptions.nextPayment')}: {subscription.nextPayment}
          </p>
        </div>
        <div className="text-right">
          <p className="text-lg font-bold text-gray-900 dark:text-white mb-2">
            {subscription.price}
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              className="px-3 py-1 text-sm text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg transition-all"
            >
              {t('subscriptions.manage')}
            </button>
            <button
              type="button"
              className="px-3 py-1 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all"
            >
              {t('subscriptions.cancel')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
