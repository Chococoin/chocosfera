'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Card, CardHeader, ToggleSwitch } from '@/components/ui';

interface NotificationSetting {
  id: string;
  label: string;
  enabled: boolean;
}

export function NotificationsTab() {
  const t = useTranslations('dashboard.settings');

  const [notifications, setNotifications] = useState<NotificationSetting[]>([
    { id: 'email', label: t('notifications.email'), enabled: true },
    { id: 'push', label: t('notifications.push'), enabled: false },
    { id: 'newsletter', label: t('notifications.newsletter'), enabled: false },
    { id: 'treeUpdates', label: t('notifications.treeUpdates'), enabled: true },
    { id: 'marketingEmails', label: t('notifications.marketingEmails'), enabled: false },
    { id: 'productUpdates', label: t('notifications.productUpdates'), enabled: true },
  ]);

  const handleToggle = (id: string, checked: boolean) => {
    setNotifications(prev =>
      prev.map(n => (n.id === id ? { ...n, enabled: checked } : n))
    );
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader title={t('notifications.title')} />

        <div className="space-y-4">
          {notifications.map((notification) => (
            <div
              key={notification.id}
              className="flex items-center justify-between py-3 border-b border-gray-200 dark:border-gray-700 last:border-0"
            >
              <ToggleSwitch
                id={notification.id}
                label={notification.label}
                checked={notification.enabled}
                onChange={(checked) => handleToggle(notification.id, checked)}
              />
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
