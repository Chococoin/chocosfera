'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardHeader, Modal, ToggleSwitch, Alert, GradientCard } from '@/components/ui';

export function TelegramTab() {
  const t = useTranslations('dashboard.settings');
  const { user, refreshUser } = useAuth();
  const [showTelegramLinkModal, setShowTelegramLinkModal] = useState(false);
  const [telegramUsername, setTelegramUsername] = useState('');
  const [isLinkingTelegram, setIsLinkingTelegram] = useState(false);

  const handleTelegramLink = async () => {
    if (!telegramUsername.trim()) {
      alert('Please enter your Telegram username');
      return;
    }

    setIsLinkingTelegram(true);
    try {
      const response = await fetch('/api/telegram/link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ telegramUsername: telegramUsername.trim() }),
      });

      if (response.ok) {
        await refreshUser();
        setShowTelegramLinkModal(false);
        setTelegramUsername('');
        alert('Telegram account linked successfully!');
      } else {
        const data = await response.json();
        alert(data.error || 'Error linking Telegram account');
      }
    } catch (error) {
      console.error('Error linking Telegram:', error);
      alert('Error linking Telegram account');
    } finally {
      setIsLinkingTelegram(false);
    }
  };

  const handleTelegramUnlink = async () => {
    if (!confirm('Are you sure you want to unlink your Telegram account?')) {
      return;
    }

    try {
      const response = await fetch('/api/telegram/link', {
        method: 'DELETE',
      });

      if (response.ok) {
        await refreshUser();
        alert('Telegram account unlinked successfully!');
      } else {
        const data = await response.json();
        alert(data.error || 'Error unlinking Telegram account');
      }
    } catch (error) {
      console.error('Error unlinking Telegram:', error);
      alert('Error unlinking Telegram account');
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader title={t('telegram.title')} icon="📱" />

        {/* Account Status */}
        <div className="mb-6">
          <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <div className="flex items-center gap-3">
              <span className="text-3xl">
                {user?.telegramId ? '✅' : '❌'}
              </span>
              <div>
                <p className="font-semibold text-gray-900 dark:text-white">
                  {user?.telegramId ? t('telegram.linked') : t('telegram.notLinked')}
                </p>
                {user?.telegramId && user?.telegramUsername && (
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    @{user.telegramUsername}
                  </p>
                )}
              </div>
            </div>
            {user?.telegramId ? (
              <button
                type="button"
                onClick={handleTelegramUnlink}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition-all"
              >
                {t('telegram.unlink')}
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setShowTelegramLinkModal(true)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-all"
              >
                {t('telegram.link')}
              </button>
            )}
          </div>
        </div>

        {/* How to Link Instructions */}
        {!user?.telegramId && (
          <Alert variant="info" title={t('telegram.howToLink')} icon="📋" className="mb-6">
            <ol className="space-y-2 mt-2">
              <li className="flex items-start gap-3">
                <span className="font-bold min-w-[24px]">1.</span>
                <span>{t('telegram.step1')}</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="font-bold min-w-[24px]">2.</span>
                <span>{t('telegram.step2')}</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="font-bold min-w-[24px]">3.</span>
                <span>{t('telegram.step3')}</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="font-bold min-w-[24px]">4.</span>
                <span>{t('telegram.step4')}</span>
              </li>
            </ol>
          </Alert>
        )}

        {/* Bot Features */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <GradientCard gradient="from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20" border="border-purple-200 dark:border-purple-800" padding="sm">
            <h4 className="font-semibold text-purple-900 dark:text-purple-100 mb-2 flex items-center gap-2">
              <span>🔔</span>
              {t('telegram.features.notifications')}
            </h4>
            <p className="text-sm text-purple-800 dark:text-purple-200">
              {t('telegram.features.notificationsDesc')}
            </p>
          </GradientCard>

          <GradientCard gradient="from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20" border="border-green-200 dark:border-green-800" padding="sm">
            <h4 className="font-semibold text-green-900 dark:text-green-100 mb-2 flex items-center gap-2">
              <span>🤖</span>
              {t('telegram.features.commands')}
            </h4>
            <p className="text-sm text-green-800 dark:text-green-200">
              {t('telegram.features.commandsDesc')}
            </p>
          </GradientCard>

          <GradientCard gradient="from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20" border="border-orange-200 dark:border-orange-800" padding="sm">
            <h4 className="font-semibold text-orange-900 dark:text-orange-100 mb-2 flex items-center gap-2">
              <span>🌳</span>
              {t('telegram.features.treeUpdates')}
            </h4>
            <p className="text-sm text-orange-800 dark:text-orange-200">
              {t('telegram.features.treeUpdatesDesc')}
            </p>
          </GradientCard>

          <GradientCard gradient="from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20" border="border-blue-200 dark:border-blue-800" padding="sm">
            <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2 flex items-center gap-2">
              <span>💬</span>
              {t('telegram.features.community')}
            </h4>
            <p className="text-sm text-blue-800 dark:text-blue-200">
              {t('telegram.features.communityDesc')}
            </p>
          </GradientCard>
        </div>
      </Card>

      {/* Notification Preferences */}
      {user?.telegramId && (
        <Card>
          <CardHeader title={t('telegram.preferences.title')} />
          <TelegramPreferences />
        </Card>
      )}

      {/* Telegram Link Modal */}
      <Modal
        isOpen={showTelegramLinkModal}
        onClose={() => setShowTelegramLinkModal(false)}
        title="Link Telegram Account"
        subtitle="Enter your Telegram username"
        headerGradient="from-blue-500 to-cyan-600"
        disabled={isLinkingTelegram}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Telegram Username
            </label>
            <input
              type="text"
              value={telegramUsername}
              onChange={(e) => setTelegramUsername(e.target.value)}
              placeholder="@username or username"
              disabled={isLinkingTelegram}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Enter your Telegram username (with or without @)
            </p>
          </div>

          <Alert variant="info">
            <strong>Note:</strong> This is a mock integration. In production, you would need to verify your account through the Telegram bot.
          </Alert>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setShowTelegramLinkModal(false)}
              disabled={isLinkingTelegram}
              className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white font-medium rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleTelegramLink}
              disabled={isLinkingTelegram || !telegramUsername.trim()}
              className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLinkingTelegram ? 'Linking...' : 'Link Account'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

function TelegramPreferences() {
  const t = useTranslations('dashboard.settings');
  const [preferences, setPreferences] = useState({
    tree_updates: true,
    community_messages: true,
    marketplace_alerts: true,
    subscription_reminders: true,
  });

  const handleToggle = (key: keyof typeof preferences, checked: boolean) => {
    setPreferences(prev => ({ ...prev, [key]: checked }));
  };

  const items = [
    { id: 'tree_updates', label: t('telegram.preferences.treeUpdates') },
    { id: 'community_messages', label: t('telegram.preferences.communityMessages') },
    { id: 'marketplace_alerts', label: t('telegram.preferences.marketplaceAlerts') },
    { id: 'subscription_reminders', label: t('telegram.preferences.subscriptionReminders') },
  ];

  return (
    <div className="space-y-3">
      {items.map((item) => (
        <div
          key={item.id}
          className="flex items-center justify-between py-3 border-b border-gray-200 dark:border-gray-700 last:border-0"
        >
          <ToggleSwitch
            id={item.id}
            label={item.label}
            checked={preferences[item.id as keyof typeof preferences]}
            onChange={(checked) => handleToggle(item.id as keyof typeof preferences, checked)}
            color="blue"
          />
        </div>
      ))}
    </div>
  );
}
