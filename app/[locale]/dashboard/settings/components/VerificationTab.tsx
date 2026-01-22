'use client';

import { useTranslations } from 'next-intl';
import { useAuth } from '@/contexts/AuthContext';
import { UserStatus } from '@prisma/client';
import { Alert, AlertList, Card, FileUpload } from '@/components/ui';

export function VerificationTab() {
  const t = useTranslations('dashboard.settings');
  const { user } = useAuth();

  const getStatusConfig = () => {
    switch (user?.status) {
      case UserStatus.MINOR:
        return {
          gradient: 'from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20',
          border: 'border-yellow-300 dark:border-yellow-700',
          icon: '🎓',
          label: t('verification.statusStudent'),
          description: t('verification.statusStudentDescription'),
        };
      case UserStatus.ADULT_PENDING:
        return {
          gradient: 'from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20',
          border: 'border-blue-300 dark:border-blue-700',
          icon: '⏳',
          label: t('verification.statusPending'),
          description: t('verification.statusPendingDescription'),
        };
      case UserStatus.ADULT_VERIFIED:
        return {
          gradient: 'from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20',
          border: 'border-green-300 dark:border-green-700',
          icon: '✅',
          label: t('verification.statusVerified'),
          description: t('verification.statusVerifiedDescription'),
        };
      default:
        return {
          gradient: 'from-gray-50 to-gray-50 dark:from-gray-900/20 dark:to-gray-900/20',
          border: 'border-gray-300 dark:border-gray-700',
          icon: '❓',
          label: 'Unknown',
          description: '',
        };
    }
  };

  const statusConfig = getStatusConfig();

  return (
    <div className="space-y-6">
      {/* Current Status Card */}
      <div className={`rounded-xl border-2 p-8 bg-gradient-to-br ${statusConfig.gradient} ${statusConfig.border}`}>
        <div className="text-center mb-6">
          <span className="text-7xl block mb-4">{statusConfig.icon}</span>
          <h2 className="text-2xl font-bold mb-2">
            {t('verification.statusLabel')} {statusConfig.label}
          </h2>
          <p className="text-sm opacity-90">{statusConfig.description}</p>
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
            <Alert variant="info" icon="💡">
              {t('verification.adultPrompt')}
            </Alert>
          </div>
        )}

        {user?.status === UserStatus.ADULT_PENDING && (
          <div className="bg-white/50 dark:bg-gray-800/50 rounded-lg p-6">
            <h3 className="font-bold text-lg mb-3">⏰ {t('verification.reviewTimeTitle')}</h3>
            <p className="text-sm mb-4">{t('verification.reviewTimeDescription')}</p>
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
        <Card>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            📄 {t('verification.formTitle')}
          </h2>
          <Alert variant="warning" className="mb-6">
            <p className="font-bold mb-1">{t('verification.importantAdultOnly')}</p>
            <p className="text-xs">{t('verification.studentWarning')}</p>
          </Alert>
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

            <FileUpload
              id="document-front"
              label={t('verification.uploadFront')}
              accept="image/*"
              hint={t('verification.uploadPrompt')}
            />

            <FileUpload
              id="document-back"
              label={t('verification.uploadBack')}
              accept="image/*"
              hint={t('verification.uploadPrompt')}
            />

            <AlertList
              variant="info"
              title={t('verification.securityTitle')}
              items={[
                t('verification.securityNote1'),
                t('verification.securityNote2'),
                t('verification.securityNote3'),
              ]}
            />

            <div className="pt-4">
              <button
                type="submit"
                className="w-full px-6 py-3 bg-gradient-to-r from-primary to-orange-600 hover:from-primary/90 hover:to-orange-600/90 text-white font-bold rounded-lg transition-all shadow-md hover:shadow-lg"
              >
                {t('verification.submitButton')}
              </button>
            </div>
          </form>
        </Card>
      )}

      {/* Information Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <h3 className="font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
            <span>❓</span>
            {t('verification.whyVerifyTitle')}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {t('verification.whyVerifyDescription')}
          </p>
        </Card>

        <Card>
          <h3 className="font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
            <span>⏱️</span>
            {t('verification.howLongTitle')}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {t('verification.howLongDescription')}
          </p>
        </Card>
      </div>
    </div>
  );
}
