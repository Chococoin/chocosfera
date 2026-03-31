'use client';

import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { PageHeader, TabNavigation, TabPanel } from '@/components/ui';
import {
  ProfileTab,
  VerificationTab,
  SubscriptionsTab,
  AccountTab,
  NotificationsTab,
  TelegramTab,
  ChococoinsTab,
  PrivacyTab,
  WalletTab,
} from './components';

export default function SettingsPage() {
  const t = useTranslations('dashboard.settings');
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<string>('profile');
  const [selectedAvatar, setSelectedAvatar] = useState<string>(user?.avatarUrl || '👤');
  const [isSavingAvatar, setIsSavingAvatar] = useState(false);

  const tabs = [
    { id: 'profile', label: t('profile.title'), icon: '👤' },
    { id: 'verification', label: t('verification.tabLabel'), icon: '✅' },
    { id: 'subscriptions', label: t('subscriptions.title'), icon: '💳' },
    { id: 'account', label: t('account.title'), icon: '⚙️' },
    { id: 'notifications', label: t('notifications.title'), icon: '🔔' },
    { id: 'telegram', label: t('telegram.title'), icon: '📱' },
    { id: 'chococoins', label: t('chococoins.title'), icon: '🪙' },
    { id: 'wallet', label: 'Wallet', icon: '🔗' },
    { id: 'privacy', label: t('privacy.title'), icon: '🔒' },
  ];

  const handleAvatarUpdate = async (emoji: string) => {
    try {
      setIsSavingAvatar(true);
      setSelectedAvatar(emoji);

      const response = await fetch('/api/user/avatar', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ avatarUrl: emoji }),
      });

      if (!response.ok) {
        throw new Error(t('profile.errors.avatarUpdateError'));
      }
    } catch (error) {
      console.error('Error updating avatar:', error);
      setSelectedAvatar(user?.avatarUrl || '👤');
      alert(t('profile.errors.avatarUpdateRetry'));
    } finally {
      setIsSavingAvatar(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <PageHeader
        title={t('title')}
        subtitle={t('subtitle')}
        icon="⚙️"
        gradient="from-purple-600 to-indigo-600"
        decorativeIcon="🛠️"
      />

      <TabNavigation
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      <TabPanel activeTab={activeTab} tabId="profile">
        <ProfileTab
          selectedAvatar={selectedAvatar}
          onAvatarChange={handleAvatarUpdate}
          isSavingAvatar={isSavingAvatar}
        />
      </TabPanel>

      <TabPanel activeTab={activeTab} tabId="verification">
        <VerificationTab />
      </TabPanel>

      <TabPanel activeTab={activeTab} tabId="subscriptions">
        <SubscriptionsTab />
      </TabPanel>

      <TabPanel activeTab={activeTab} tabId="account">
        <AccountTab />
      </TabPanel>

      <TabPanel activeTab={activeTab} tabId="notifications">
        <NotificationsTab />
      </TabPanel>

      <TabPanel activeTab={activeTab} tabId="telegram">
        <TelegramTab />
      </TabPanel>

      <TabPanel activeTab={activeTab} tabId="chococoins">
        <ChococoinsTab />
      </TabPanel>

      <TabPanel activeTab={activeTab} tabId="wallet">
        <WalletTab />
      </TabPanel>

      <TabPanel activeTab={activeTab} tabId="privacy">
        <PrivacyTab />
      </TabPanel>
    </div>
  );
}
