'use client';

import { useTranslations, useLocale } from 'next-intl';
import { useRouter, usePathname } from 'next/navigation';
import { useTransition } from 'react';
import { RestartOnboardingButton } from '@/components/Onboarding';
import { Card, CardHeader, LanguageSelector, TimezoneSelector, FormSelect } from '@/components/ui';

export function AccountTab() {
  const t = useTranslations('dashboard.settings');
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  const handleLanguageChange = (newLocale: string) => {
    startTransition(() => {
      const newPathname = pathname.replace(`/${locale}`, `/${newLocale}`);
      router.replace(newPathname);
    });
  };

  return (
    <div className="space-y-6">
      {/* Change Password */}
      <Card>
        <CardHeader title={t('account.changePassword')} />

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
      </Card>

      {/* Preferences */}
      <Card>
        <CardHeader title={t('account.preferences')} />

        <div className="space-y-4">
          <div>
            <LanguageSelector
              value={locale}
              onChange={handleLanguageChange}
              disabled={isPending}
              label={t('account.language')}
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {t('account.languageUpdateNote')}
            </p>
          </div>

          <TimezoneSelector
            value="Europe/Madrid"
            onChange={() => {}}
            label={t('account.timezone')}
          />

          <FormSelect
            label={t('account.dateFormat')}
            value="dd/mm/yyyy"
            onChange={() => {}}
            options={[
              { value: 'dd/mm/yyyy', label: 'DD/MM/YYYY' },
              { value: 'mm/dd/yyyy', label: 'MM/DD/YYYY' },
              { value: 'yyyy-mm-dd', label: 'YYYY-MM-DD' },
            ]}
          />

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
      </Card>
    </div>
  );
}
