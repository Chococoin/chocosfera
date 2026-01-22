'use client';

import { useTranslations } from 'next-intl';
import { GradientCard } from '@/components/ui';

export function FamilyInfoCard() {
  const t = useTranslations('dashboard.family');

  return (
    <GradientCard gradient="from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20" border="border-blue-200 dark:border-blue-800">
      <h3 className="text-lg font-bold text-blue-900 dark:text-blue-100 mb-3 flex items-center gap-2">
        <span>💡</span>
        {t('info.title')}
      </h3>
      <ul className="space-y-2 text-sm text-blue-800 dark:text-blue-200">
        <li className="flex items-start gap-2">
          <span>✅</span>
          <span>{t('info.point1')}</span>
        </li>
        <li className="flex items-start gap-2">
          <span>✅</span>
          <span>{t('info.point2')}</span>
        </li>
        <li className="flex items-start gap-2">
          <span>✅</span>
          <span>{t('info.point3')}</span>
        </li>
        <li className="flex items-start gap-2">
          <span>✅</span>
          <span>{t('info.point4')}</span>
        </li>
      </ul>
    </GradientCard>
  );
}
