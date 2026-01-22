'use client';

import { useTranslations } from 'next-intl';
import { useAuth } from '@/contexts/AuthContext';
import { UserStatus } from '@prisma/client';
import { Card, CardHeader, Alert } from '@/components/ui';
import { AvatarSelector, AvatarDisplay } from './AvatarSelector';

interface ProfileTabProps {
  selectedAvatar: string;
  onAvatarChange: (emoji: string) => void;
  isSavingAvatar: boolean;
}

export function ProfileTab({ selectedAvatar, onAvatarChange, isSavingAvatar }: ProfileTabProps) {
  const t = useTranslations('dashboard.settings');
  const { user, isMinor } = useAuth();

  const userProfile = {
    nick: user?.nick || '',
    email: user?.email || '',
    avatar: selectedAvatar,
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader title={t('profile.title')} />

        {/* Avatar - Emoji Selector */}
        <div className="flex items-center gap-6 mb-6 pb-6 border-b border-gray-200 dark:border-gray-700">
          <AvatarDisplay avatar={userProfile.avatar} />
          <div>
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              {t('profile.avatarPrompt')}
            </p>
            <AvatarSelector
              currentAvatar={userProfile.avatar}
              onSelect={onAvatarChange}
              isLoading={isSavingAvatar}
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              {t('profile.avatarDescription')}
            </p>
          </div>
        </div>

        {/* Profile Form */}
        <div className="space-y-4">
          {/* Info Banner for Minors */}
          {isMinor && (
            <Alert variant="info" title={t('profile.identityProtectionTitle')} icon="🔒">
              {t('profile.identityProtectionDescription')}
            </Alert>
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
      </Card>
    </div>
  );
}
