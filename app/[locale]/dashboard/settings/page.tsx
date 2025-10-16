'use client';

import { useTranslations, useLocale } from 'next-intl';
import { useState, useTransition } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { UserStatus } from '@prisma/client';
import { RestartOnboardingButton } from '@/components/Onboarding';

export default function SettingsPage() {
  const t = useTranslations('dashboard.settings');
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const { user, isMinor, refreshUser } = useAuth();
  const [isPending, startTransition] = useTransition();
  const [activeTab, setActiveTab] = useState<string>('profile');
  const [showCoinPackages, setShowCoinPackages] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [selectedAvatar, setSelectedAvatar] = useState<string>(user?.avatarUrl || '👤');
  const [isSavingAvatar, setIsSavingAvatar] = useState(false);
  const [showTelegramLinkModal, setShowTelegramLinkModal] = useState(false);
  const [telegramUsername, setTelegramUsername] = useState('');
  const [isLinkingTelegram, setIsLinkingTelegram] = useState(false);

  // User profile data from auth context
  const userProfile = {
    nick: user?.nick || '',
    email: user?.email || '',
    avatar: selectedAvatar,
  };

  const subscriptions = [
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

  const chococoinsTransactions = [
    {
      id: 1,
      type: t('chococoins.transactions.earnedSubscription'),
      date: '2024-10-01',
      amount: '+50',
    },
    {
      id: 2,
      type: t('chococoins.transactions.redeemedChocolate'),
      date: '2024-09-28',
      amount: '-30',
    },
    {
      id: 3,
      type: t('chococoins.transactions.earnedTree'),
      date: '2024-09-15',
      amount: '+100',
    },
  ];

  const activeSessions = [
    {
      id: 1,
      device: 'MacBook Pro - Chrome',
      location: t('privacy.sessionLocation'),
      lastActive: t('privacy.sessionNow'),
      current: true,
    },
    {
      id: 2,
      device: 'iPhone 15 - Safari',
      location: t('privacy.sessionLocation'),
      lastActive: t('privacy.sessionHoursAgo', { hours: 2 }),
      current: false,
    },
  ];

  const tabs = [
    { id: 'profile', label: t('profile.title'), icon: '👤' },
    { id: 'verification', label: t('verification.tabLabel'), icon: '✅' },
    { id: 'subscriptions', label: t('subscriptions.title'), icon: '💳' },
    { id: 'account', label: t('account.title'), icon: '⚙️' },
    { id: 'notifications', label: t('notifications.title'), icon: '🔔' },
    { id: 'telegram', label: t('telegram.title'), icon: '📱' },
    { id: 'chococoins', label: t('chococoins.title'), icon: '🪙' },
    { id: 'privacy', label: t('privacy.title'), icon: '🔒' },
  ];

  const chococoinPackages = [
    {
      id: 'starter',
      name: '100 ChocoCoins',
      price: '€5.00',
      coins: 100,
      description: t('chococoins.packages.starterDescription'),
    },
    {
      id: 'popular',
      name: '500 ChocoCoins',
      price: '€20.00',
      coins: 500,
      description: t('chococoins.packages.popularDescription'),
      discount: true,
      popular: true,
    },
    {
      id: 'premium',
      name: '1200 ChocoCoins',
      price: '€40.00',
      coins: 1200,
      description: t('chococoins.packages.premiumDescription'),
      discount: true,
    },
    {
      id: 'mega',
      name: '3000 ChocoCoins',
      price: '€90.00',
      coins: 3000,
      description: t('chococoins.packages.megaDescription'),
      discount: true,
    },
  ];

  const handleBuyCoins = async (packageId: string) => {
    try {
      setIsProcessingPayment(true);
      const response = await fetch('/api/chococoins/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ packageId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || t('chococoins.errors.paymentInitError'));
      }

      // Redirect to Stripe checkout
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error('Error buying coins:', error);
      alert(t('chococoins.errors.paymentProcessError'));
    } finally {
      setIsProcessingPayment(false);
    }
  };

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

      // Success feedback could be added here (toast notification, etc.)
    } catch (error) {
      console.error('Error updating avatar:', error);
      // Revert on error
      setSelectedAvatar(user?.avatarUrl || '👤');
      alert(t('profile.errors.avatarUpdateRetry'));
    } finally {
      setIsSavingAvatar(false);
    }
  };

  const handleLanguageChange = (newLocale: string) => {
    startTransition(() => {
      // Replace the current locale in the pathname with the new one
      const newPathname = pathname.replace(`/${locale}`, `/${newLocale}`);
      router.replace(newPathname);
    });
  };

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
        await refreshUser(); // Update auth context
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
        await refreshUser(); // Update auth context
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
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl text-white p-6 shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
              <span>⚙️</span>
              {t('title')}
            </h1>
            <p className="text-white/90">{t('subtitle')}</p>
          </div>
          <div className="hidden md:block text-6xl">🛠️</div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm">
        <div className="flex overflow-x-auto scrollbar-hide">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 min-w-[120px] px-4 py-4 text-sm font-medium transition-all ${
                activeTab === tab.id
                  ? 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 border-b-2 border-purple-600'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/50'
              }`}
            >
              <span className="flex items-center gap-2 justify-center">
                <span>{tab.icon}</span>
                <span className="hidden sm:inline">{tab.label}</span>
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Profile Tab */}
      {activeTab === 'profile' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
              {t('profile.title')}
            </h2>

            {/* Avatar - Emoji Selector */}
            <div className="flex items-center gap-6 mb-6 pb-6 border-b border-gray-200 dark:border-gray-700">
              <div className="w-24 h-24 bg-gradient-to-br from-purple-100 to-indigo-100 dark:from-purple-900/30 dark:to-indigo-900/30 rounded-full flex items-center justify-center text-5xl">
                {userProfile.avatar}
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  {t('profile.avatarPrompt')}
                </p>
                <div className="grid grid-cols-8 gap-2 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 max-w-md">
                  {['😊', '🎉', '🌟', '🚀', '🎨', '🎭', '🎪', '🎬', '🎮', '🎯', '🎲', '🎸', '🍫', '🍪', '🍰', '🧁', '🌈', '🌸', '🌺', '🌻', '🌷', '🌹', '💐', '🌼', '🦄', '🦋', '🐝', '🐙', '🦊', '🐻', '🐼', '🐨'].map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => handleAvatarUpdate(emoji)}
                      disabled={isSavingAvatar}
                      className={`text-2xl p-2 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                        userProfile.avatar === emoji ? 'bg-purple-200 dark:bg-purple-900/50 ring-2 ring-purple-500' : ''
                      }`}
                      title={t('profile.selectEmoji', { emoji })}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                  {t('profile.avatarDescription')}
                </p>
              </div>
            </div>

            {/* Profile Form */}
            <div className="space-y-4">
              {/* Info Banner for Minors */}
              {isMinor && (
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                  <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2 flex items-center gap-2">
                    <span>🔒</span>
                    {t('profile.identityProtectionTitle')}
                  </h4>
                  <p className="text-xs text-blue-800 dark:text-blue-200">
                    {t('profile.identityProtectionDescription')}
                  </p>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {isMinor ? t('profile.nickLabel') : t('profile.username')}
                </label>
                <input
                  type="text"
                  defaultValue={userProfile.nick}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder={t('profile.nickPlaceholder')}
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {t('profile.nickDescription')}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('profile.email')}
                </label>
                <input
                  type="email"
                  defaultValue={userProfile.email}
                  disabled
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-900 text-gray-600 dark:text-gray-400 cursor-not-allowed"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {t('profile.emailSecurityNote')}
                </p>
              </div>

              {/* Only show name fields for verified adults */}
              {!isMinor && user?.status === UserStatus.ADULT_VERIFIED && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {t('profile.firstNameOptional')}
                    </label>
                    <input
                      type="text"
                      defaultValue={user?.firstName || ''}
                      placeholder={t('profile.firstNamePlaceholder')}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {t('profile.lastNameOptional')}
                    </label>
                    <input
                      type="text"
                      defaultValue={user?.lastName || ''}
                      placeholder={t('profile.lastNamePlaceholder')}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                </>
              )}

              <div className="pt-4">
                <button
                  type="button"
                  className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg transition-all"
                >
                  {t('profile.saveChanges')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Verification Tab - Age/KYC Verification */}
      {activeTab === 'verification' && (
        <div className="space-y-6">
          {/* Current Status Card */}
          <div className={`rounded-xl border-2 p-8 ${
            user?.status === UserStatus.MINOR
              ? 'bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 border-yellow-300 dark:border-yellow-700'
              : user?.status === UserStatus.ADULT_PENDING
              ? 'bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 border-blue-300 dark:border-blue-700'
              : 'bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-green-300 dark:border-green-700'
          }`}>
            <div className="text-center mb-6">
              <span className="text-7xl block mb-4">
                {user?.status === UserStatus.MINOR ? '🎓' : user?.status === UserStatus.ADULT_PENDING ? '⏳' : '✅'}
              </span>
              <h2 className="text-2xl font-bold mb-2" style={{
                color: user?.status === UserStatus.MINOR
                  ? 'var(--tw-prose-bold)'
                  : user?.status === UserStatus.ADULT_PENDING
                  ? 'var(--tw-prose-bold)'
                  : 'var(--tw-prose-bold)'
              }}>
                {t('verification.statusLabel')}{' '}
                {user?.status === UserStatus.MINOR && t('verification.statusStudent')}
                {user?.status === UserStatus.ADULT_PENDING && t('verification.statusPending')}
                {user?.status === UserStatus.ADULT_VERIFIED && t('verification.statusVerified')}
              </h2>
              <p className="text-sm opacity-90">
                {user?.status === UserStatus.MINOR && t('verification.statusStudentDescription')}
                {user?.status === UserStatus.ADULT_PENDING && t('verification.statusPendingDescription')}
                {user?.status === UserStatus.ADULT_VERIFIED && t('verification.statusVerifiedDescription')}
              </p>
            </div>

            {/* Status-specific information */}
            {user?.status === UserStatus.MINOR && (
              <div className="bg-white/50 dark:bg-gray-800/50 rounded-lg p-6 space-y-4">
                <h3 className="font-bold text-lg mb-3">🚫 {t('verification.restrictedFeaturesTitle')}</h3>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <span className="text-lg">🗨️</span>
                    <span>{t('verification.restrictedFeature1')}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-lg">👨‍👩‍👧‍👦</span>
                    <span>{t('verification.restrictedFeature2')}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-lg">🎭</span>
                    <span>{t('verification.restrictedFeature3')}</span>
                  </li>
                </ul>
                <div className="mt-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                  <p className="text-xs text-blue-800 dark:text-blue-200">
                    💡 {t('verification.adultPrompt')}
                  </p>
                </div>
              </div>
            )}

            {user?.status === UserStatus.ADULT_PENDING && (
              <div className="bg-white/50 dark:bg-gray-800/50 rounded-lg p-6">
                <h3 className="font-bold text-lg mb-3">⏰ {t('verification.reviewTimeTitle')}</h3>
                <p className="text-sm mb-4">
                  {t('verification.reviewTimeDescription')}
                </p>
                <div className="flex items-center gap-2 text-sm">
                  <div className="h-2 flex-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div className="h-full w-2/3 bg-blue-500 animate-pulse"></div>
                  </div>
                  <span className="font-medium">{t('verification.inProgress')}</span>
                </div>
              </div>
            )}

            {user?.status === UserStatus.ADULT_VERIFIED && (
              <div className="bg-white/50 dark:bg-gray-800/50 rounded-lg p-6 space-y-4">
                <h3 className="font-bold text-lg mb-3">🎉 {t('verification.unlockedFeaturesTitle')}</h3>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <span className="text-lg">✅</span>
                    <span>{t('verification.unlockedFeature1')}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-lg">✅</span>
                    <span>{t('verification.unlockedFeature2')}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-lg">✅</span>
                    <span>{t('verification.unlockedFeature3')}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-lg">✅</span>
                    <span>{t('verification.unlockedFeature4')}</span>
                  </li>
                </ul>
              </div>
            )}
          </div>

          {/* Verification Form - Only show if MINOR */}
          {user?.status === UserStatus.MINOR && (
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                📄 {t('verification.formTitle')}
              </h2>
              <div className="bg-orange-50 dark:bg-orange-900/20 border-2 border-orange-300 dark:border-orange-700 rounded-lg p-4 mb-6">
                <p className="text-sm font-bold text-orange-900 dark:text-orange-100 mb-2">
                  {t('verification.importantAdultOnly')}
                </p>
                <p className="text-xs text-orange-800 dark:text-orange-200">
                  {t('verification.studentWarning')}
                </p>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                {t('verification.formDescription')}
              </p>

              <form className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t('verification.documentType')}
                  </label>
                  <select className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent">
                    <option value="">{t('verification.selectDocumentType')}</option>
                    <option value="dni">{t('verification.dni')}</option>
                    <option value="passport">{t('verification.passport')}</option>
                    <option value="license">{t('verification.license')}</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t('verification.uploadFront')}
                  </label>
                  <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center hover:border-purple-500 transition-colors cursor-pointer">
                    <input type="file" className="hidden" id="document-front" accept="image/*" />
                    <label htmlFor="document-front" className="cursor-pointer">
                      <span className="text-4xl block mb-2">📸</span>
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {t('verification.uploadPrompt')}
                      </span>
                      <span className="block text-xs text-gray-500 dark:text-gray-500 mt-1">
                        {t('verification.uploadFileTypes')}
                      </span>
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t('verification.uploadBack')}
                  </label>
                  <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center hover:border-purple-500 transition-colors cursor-pointer">
                    <input type="file" className="hidden" id="document-back" accept="image/*" />
                    <label htmlFor="document-back" className="cursor-pointer">
                      <span className="text-4xl block mb-2">📸</span>
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {t('verification.uploadPrompt')}
                      </span>
                    </label>
                  </div>
                </div>

                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                  <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2 flex items-center gap-2">
                    {t('verification.securityTitle')}
                  </h4>
                  <ul className="text-xs text-blue-800 dark:text-blue-200 space-y-1">
                    <li>• {t('verification.securityNote1')}</li>
                    <li>• {t('verification.securityNote2')}</li>
                    <li>• {t('verification.securityNote3')}</li>
                  </ul>
                </div>

                <div className="pt-4">
                  <button
                    type="submit"
                    className="w-full px-6 py-3 bg-gradient-to-r from-primary to-orange-600 hover:from-primary/90 hover:to-orange-600/90 text-white font-bold rounded-lg transition-all shadow-md hover:shadow-lg"
                  >
                    {t('verification.submitButton')}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Information Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                <span>❓</span>
                {t('verification.whyVerifyTitle')}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {t('verification.whyVerifyDescription')}
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                <span>⏱️</span>
                {t('verification.howLongTitle')}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {t('verification.howLongDescription')}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Subscriptions Tab */}
      {activeTab === 'subscriptions' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
              {t('subscriptions.title')}
            </h2>

            {subscriptions.length > 0 ? (
              <div className="space-y-4">
                {subscriptions.map((sub) => (
                  <div
                    key={sub.id}
                    className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-all"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-bold text-gray-900 dark:text-white">
                            {sub.plan}
                          </h3>
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium ${
                              sub.status === 'active'
                                ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                                : 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300'
                            }`}
                          >
                            {sub.status === 'active'
                              ? t('subscriptions.active')
                              : t('subscriptions.inactive')}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {t('subscriptions.nextPayment')}: {sub.nextPayment}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                          {sub.price}
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
          </div>
        </div>
      )}

      {/* Account Tab */}
      {activeTab === 'account' && (
        <div className="space-y-6">
          {/* Change Password */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
              {t('account.changePassword')}
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('account.currentPassword')}
                </label>
                <input
                  type="password"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('account.newPassword')}
                </label>
                <input
                  type="password"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('account.confirmPassword')}
                </label>
                <input
                  type="password"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              <div className="pt-4">
                <button
                  type="button"
                  className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg transition-all"
                >
                  {t('profile.saveChanges')}
                </button>
              </div>
            </div>
          </div>

          {/* Preferences */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
              {t('account.preferences')}
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('account.language')}
                </label>
                <select
                  value={locale}
                  onChange={(e) => handleLanguageChange(e.target.value)}
                  disabled={isPending}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <option value="es">🇪🇸 Español</option>
                  <option value="en">🇬🇧 English</option>
                  <option value="it">🇮🇹 Italiano</option>
                  <option value="fr">🇫🇷 Français</option>
                  <option value="de">🇩🇪 Deutsch</option>
                  <option value="pt">🇵🇹 Português</option>
                  <option value="ro">🇷🇴 Română</option>
                  <option value="ja">🇯🇵 日本語</option>
                  <option value="zh">🇨🇳 中文</option>
                </select>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {t('account.languageUpdateNote')}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('account.timezone')}
                </label>
                <select className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent">
                  <option value="Europe/Madrid">Madrid (GMT+1)</option>
                  <option value="America/New_York">New York (GMT-5)</option>
                  <option value="America/Los_Angeles">Los Angeles (GMT-8)</option>
                  <option value="Asia/Tokyo">Tokyo (GMT+9)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('account.dateFormat')}
                </label>
                <select className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent">
                  <option value="dd/mm/yyyy">DD/MM/YYYY</option>
                  <option value="mm/dd/yyyy">MM/DD/YYYY</option>
                  <option value="yyyy-mm-dd">YYYY-MM-DD</option>
                </select>
              </div>

              {/* Onboarding Tutorial */}
              <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  {t('account.onboardingTutorial')}
                </label>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                  {t('account.onboardingDescription')}
                </p>
                <RestartOnboardingButton />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Notifications Tab */}
      {activeTab === 'notifications' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
              {t('notifications.title')}
            </h2>

            <div className="space-y-4">
              {[
                { id: 'email', label: t('notifications.email') },
                { id: 'push', label: t('notifications.push') },
                { id: 'newsletter', label: t('notifications.newsletter') },
                { id: 'treeUpdates', label: t('notifications.treeUpdates') },
                { id: 'marketingEmails', label: t('notifications.marketingEmails') },
                { id: 'productUpdates', label: t('notifications.productUpdates') },
              ].map((notification) => (
                <div
                  key={notification.id}
                  className="flex items-center justify-between py-3 border-b border-gray-200 dark:border-gray-700 last:border-0"
                >
                  <span className="text-gray-900 dark:text-white font-medium">
                    {notification.label}
                  </span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      defaultChecked={['email', 'treeUpdates', 'productUpdates'].includes(
                        notification.id
                      )}
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 dark:peer-focus:ring-purple-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-purple-600"></div>
                  </label>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ChocoCoins Tab */}
      {activeTab === 'chococoins' && (
        <div className="space-y-6">
          {/* Balance Card */}
          <div className="bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl text-white p-8 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/90 mb-2">{t('chococoins.balance')}</p>
                <p className="text-5xl font-bold">120 🪙</p>
              </div>
              <button
                type="button"
                onClick={() => setShowCoinPackages(true)}
                className="px-6 py-3 bg-white text-orange-600 font-medium rounded-lg hover:bg-orange-50 transition-all shadow-md hover:shadow-lg"
              >
                {t('chococoins.buyMore')}
              </button>
            </div>
          </div>

          {/* ChocoCoin Packages Modal */}
          {showCoinPackages && (
            <>
              {/* Backdrop */}
              <div
                className="fixed inset-0 bg-black/50 z-40"
                onClick={() => !isProcessingPayment && setShowCoinPackages(false)}
              />

              {/* Modal */}
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
                  {/* Modal Header */}
                  <div className="sticky top-0 bg-gradient-to-r from-amber-500 to-orange-600 text-white p-6 rounded-t-2xl">
                    <div className="flex items-center justify-between">
                      <div>
                        <h2 className="text-2xl font-bold mb-1">{t('chococoins.buyCoinsTitle')}</h2>
                        <p className="text-white/90 text-sm">{t('chococoins.buyCoinsSubtitle')}</p>
                      </div>
                      {!isProcessingPayment && (
                        <button
                          onClick={() => setShowCoinPackages(false)}
                          className="text-white hover:bg-white/20 rounded-full p-2 transition-colors"
                        >
                          <span className="text-2xl">✕</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Packages Grid */}
                  <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                    {chococoinPackages.map((pkg) => (
                      <div
                        key={pkg.id}
                        className={`relative border-2 rounded-xl p-6 hover:shadow-lg transition-all ${
                          pkg.popular
                            ? 'border-orange-500 bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20'
                            : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900'
                        }`}
                      >
                        {pkg.popular && (
                          <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                            {t('chococoins.mostPopular')}
                          </div>
                        )}

                        <div className="text-center mb-4">
                          <span className="text-5xl block mb-2">🪙</span>
                          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                            {pkg.coins}
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                            {pkg.description}
                          </p>
                          <p className="text-3xl font-bold text-orange-600 dark:text-orange-400">
                            {pkg.price}
                          </p>
                        </div>

                        <button
                          onClick={() => handleBuyCoins(pkg.id)}
                          disabled={isProcessingPayment}
                          className={`w-full py-3 rounded-lg font-bold transition-all ${
                            pkg.popular
                              ? 'bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white shadow-md hover:shadow-lg'
                              : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-700'
                          } disabled:opacity-50 disabled:cursor-not-allowed`}
                        >
                          {isProcessingPayment ? t('chococoins.processing') : t('chococoins.buyNow')}
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* Info Footer */}
                  <div className="bg-blue-50 dark:bg-blue-900/20 border-t border-blue-200 dark:border-blue-800 p-6">
                    <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2 flex items-center gap-2">
                      <span>🔒</span>
                      {t('chococoins.securePayment')}
                    </h4>
                    <ul className="text-xs text-blue-800 dark:text-blue-200 space-y-1">
                      <li>• {t('chococoins.paymentInfo1')}</li>
                      <li>• {t('chococoins.paymentInfo2')}</li>
                      <li>• {t('chococoins.paymentInfo3')}</li>
                      <li>• {t('chococoins.paymentInfo4')}</li>
                    </ul>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Transaction History */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
              {t('chococoins.history')}
            </h2>

            {chococoinsTransactions.length > 0 ? (
              <div className="space-y-3">
                {chococoinsTransactions.map((transaction) => (
                  <div
                    key={transaction.id}
                    className="flex items-center justify-between py-3 border-b border-gray-200 dark:border-gray-700 last:border-0"
                  >
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {transaction.type}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {transaction.date}
                      </p>
                    </div>
                    <span
                      className={`text-lg font-bold ${
                        transaction.amount.startsWith('+')
                          ? 'text-green-600 dark:text-green-400'
                          : 'text-red-600 dark:text-red-400'
                      }`}
                    >
                      {transaction.amount} 🪙
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <span className="text-6xl block mb-4">🪙</span>
                <p className="text-gray-600 dark:text-gray-400">
                  {t('chococoins.noTransactions')}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Telegram Tab */}
      {activeTab === 'telegram' && (
        <div className="space-y-6">
          {/* Telegram Account Linking */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
              <span>📱</span>
              {t('telegram.title')}
            </h2>

            {/* Account Status */}
            <div className="mb-6">
              <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">
                    {user?.telegramId ? '✅' : '❌'}
                  </span>
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {user?.telegramId
                        ? t('telegram.linked')
                        : t('telegram.notLinked')
                      }
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
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6 mb-6">
                <h3 className="font-bold text-blue-900 dark:text-blue-100 mb-4 flex items-center gap-2">
                  <span>📋</span>
                  {t('telegram.howToLink')}
                </h3>
                <ol className="space-y-3 text-sm text-blue-800 dark:text-blue-200">
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
              </div>
            )}

            {/* Bot Features */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 rounded-lg border border-purple-200 dark:border-purple-800 p-4">
                <h4 className="font-semibold text-purple-900 dark:text-purple-100 mb-2 flex items-center gap-2">
                  <span>🔔</span>
                  {t('telegram.features.notifications')}
                </h4>
                <p className="text-sm text-purple-800 dark:text-purple-200">
                  {t('telegram.features.notificationsDesc')}
                </p>
              </div>

              <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg border border-green-200 dark:border-green-800 p-4">
                <h4 className="font-semibold text-green-900 dark:text-green-100 mb-2 flex items-center gap-2">
                  <span>🤖</span>
                  {t('telegram.features.commands')}
                </h4>
                <p className="text-sm text-green-800 dark:text-green-200">
                  {t('telegram.features.commandsDesc')}
                </p>
              </div>

              <div className="bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 rounded-lg border border-orange-200 dark:border-orange-800 p-4">
                <h4 className="font-semibold text-orange-900 dark:text-orange-100 mb-2 flex items-center gap-2">
                  <span>🌳</span>
                  {t('telegram.features.treeUpdates')}
                </h4>
                <p className="text-sm text-orange-800 dark:text-orange-200">
                  {t('telegram.features.treeUpdatesDesc')}
                </p>
              </div>

              <div className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-lg border border-blue-200 dark:border-blue-800 p-4">
                <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2 flex items-center gap-2">
                  <span>💬</span>
                  {t('telegram.features.community')}
                </h4>
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  {t('telegram.features.communityDesc')}
                </p>
              </div>
            </div>
          </div>

          {/* Notification Preferences */}
          {user?.telegramId && (
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                {t('telegram.preferences.title')}
              </h3>
              <div className="space-y-3">
                {[
                  { id: 'tree_updates', label: t('telegram.preferences.treeUpdates') },
                  { id: 'community_messages', label: t('telegram.preferences.communityMessages') },
                  { id: 'marketplace_alerts', label: t('telegram.preferences.marketplaceAlerts') },
                  { id: 'subscription_reminders', label: t('telegram.preferences.subscriptionReminders') },
                ].map((pref) => (
                  <div
                    key={pref.id}
                    className="flex items-center justify-between py-3 border-b border-gray-200 dark:border-gray-700 last:border-0"
                  >
                    <span className="text-gray-900 dark:text-white">
                      {pref.label}
                    </span>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        className="sr-only peer"
                        defaultChecked
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Telegram Link Modal */}
          {showTelegramLinkModal && (
            <>
              {/* Backdrop */}
              <div
                className="fixed inset-0 bg-black/50 z-40"
                onClick={() => !isLinkingTelegram && setShowTelegramLinkModal(false)}
              />

              {/* Modal */}
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-md w-full shadow-2xl">
                  {/* Modal Header */}
                  <div className="bg-gradient-to-r from-blue-500 to-cyan-600 text-white p-6 rounded-t-2xl">
                    <div className="flex items-center justify-between">
                      <div>
                        <h2 className="text-2xl font-bold mb-1">Link Telegram Account</h2>
                        <p className="text-white/90 text-sm">Enter your Telegram username</p>
                      </div>
                      {!isLinkingTelegram && (
                        <button
                          onClick={() => setShowTelegramLinkModal(false)}
                          className="text-white hover:bg-white/20 rounded-full p-2 transition-colors"
                        >
                          <span className="text-2xl">✕</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Modal Body */}
                  <div className="p-6">
                    <div className="mb-4">
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

                    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-4">
                      <p className="text-xs text-blue-800 dark:text-blue-200">
                        <strong>Note:</strong> This is a mock integration. In production, you would need to verify your account through the Telegram bot.
                      </p>
                    </div>

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
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* Privacy Tab */}
      {activeTab === 'privacy' && (
        <div className="space-y-6">
          {/* Two-Factor Authentication */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
              {t('privacy.twoFactor')}
            </h2>

            <div className="flex items-center justify-between py-4 border-b border-gray-200 dark:border-gray-700">
              <div>
                <p className="font-medium text-gray-900 dark:text-white mb-1">
                  {t('privacy.twoFactor')}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Estado:{' '}
                  <span className="text-red-600 dark:text-red-400">
                    {t('privacy.twoFactorDisabled')}
                  </span>
                </p>
              </div>
              <button
                type="button"
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium rounded-lg transition-all"
              >
                {t('privacy.enable')}
              </button>
            </div>
          </div>

          {/* Active Sessions */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
              {t('privacy.sessions')}
            </h2>

            <div className="space-y-4">
              {activeSessions.map((session) => (
                <div
                  key={session.id}
                  className="flex items-center justify-between py-4 border-b border-gray-200 dark:border-gray-700 last:border-0"
                >
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">💻</span>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {session.device}
                        {session.current && (
                          <span className="ml-2 px-2 py-1 text-xs bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 rounded-full">
                            {t('privacy.currentSession')}
                          </span>
                        )}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {session.location} • {session.lastActive}
                      </p>
                    </div>
                  </div>
                  {!session.current && (
                    <button
                      type="button"
                      className="px-3 py-1 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all"
                    >
                      {t('privacy.revokeSession')}
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Delete Account */}
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6">
            <h2 className="text-xl font-bold text-red-900 dark:text-red-400 mb-2">
              {t('privacy.deleteAccount')}
            </h2>
            <p className="text-sm text-red-700 dark:text-red-300 mb-4">
              {t('privacy.deleteWarning')}
            </p>
            <button
              type="button"
              className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-all"
            >
              {t('privacy.confirmDelete')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
