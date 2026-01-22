'use client';

import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { Alert } from '@/components/ui';

interface NoFamilyViewProps {
  isMinor: boolean;
  inviteEmail: string;
  setInviteEmail: (email: string) => void;
  isSubmitting: boolean;
  successMessage: string | null;
  errorMessage: string | null;
  onInvite: (e: React.FormEvent) => void;
  onOpenCreateModal: () => void;
}

export function NoFamilyView({
  isMinor,
  inviteEmail,
  setInviteEmail,
  isSubmitting,
  successMessage,
  errorMessage,
  onInvite,
  onOpenCreateModal,
}: NoFamilyViewProps) {
  const locale = useLocale();
  const t = useTranslations('dashboard.family');

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Option 1: Create Family (Adults Only) */}
      <div className={`bg-white dark:bg-gray-800 rounded-xl border-2 p-6 shadow-sm ${
        isMinor
          ? 'border-gray-300 dark:border-gray-700 opacity-60'
          : 'border-purple-300 dark:border-purple-700 hover:shadow-md transition-shadow'
      }`}>
        <div className="text-center mb-4">
          <span className="text-6xl block mb-4">🏠</span>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            {t('createFamily.title')}
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            {t('createFamily.description')}
          </p>
        </div>

        {isMinor ? (
          <Alert variant="warning">
            <p className="text-center">
              {t('createFamily.minorWarning')}
              <Link
                href={`/${locale}/dashboard/settings`}
                className="block mt-2 font-semibold underline"
              >
                {t('createFamily.verifyAgeLink')}
              </Link>
            </p>
          </Alert>
        ) : (
          <button
            type="button"
            onClick={onOpenCreateModal}
            className="w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold rounded-lg transition-all shadow-md hover:shadow-lg"
          >
            {t('createFamily.button')}
          </button>
        )}
      </div>

      {/* Option 2: Invite Parent (Minors) / Invite Family Member (Adults) */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border-2 border-blue-300 dark:border-blue-700 p-6 shadow-sm">
        <div className="text-center mb-4">
          <span className="text-6xl block mb-4">
            {isMinor ? '👨‍👦' : '💌'}
          </span>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            {isMinor ? t('inviteParent.title') : t('joinFamily.title')}
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            {isMinor
              ? t('inviteParent.description')
              : t('joinFamily.description')}
          </p>
        </div>

        {isMinor ? (
          <form onSubmit={onInvite} className="space-y-4">
            {successMessage && (
              <Alert variant="success">
                <p className="text-center">{successMessage}</p>
              </Alert>
            )}

            {errorMessage && (
              <Alert variant="error">
                <p className="text-center">{errorMessage}</p>
              </Alert>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('inviteParent.emailLabel')}
              </label>
              <input
                type="email"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                placeholder={t('inviteParent.emailPlaceholder')}
                required
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-bold rounded-lg transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? t('inviteParent.sending') : t('inviteParent.sendButton')}
            </button>

            <Alert variant="info">
              {t('inviteParent.tipText')}
            </Alert>
          </form>
        ) : (
          <div className="text-center py-4">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              {t('joinFamily.checkEmailText')}
            </p>
            <Link
              href={`/${locale}/dashboard/settings`}
              className="text-blue-600 dark:text-blue-400 font-medium hover:underline"
            >
              {t('joinFamily.viewInvitationsLink')}
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
