'use client';

import { useTranslations } from 'next-intl';
import { GradientCard, StatsCard, LoadingState } from '@/components/ui';
import { FamilyMember } from './types';

interface FamilyOverviewCardProps {
  familyName: string;
  familyMembers: FamilyMember[];
  isLoading: boolean;
}

export function FamilyOverviewCard({
  familyName,
  familyMembers,
  isLoading,
}: FamilyOverviewCardProps) {
  const t = useTranslations('dashboard.family');

  const totalTrees = familyMembers.reduce((sum, member) => sum + (member.treesCount || 0), 0);

  if (isLoading) {
    return (
      <GradientCard gradient="from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20" border="border-purple-200 dark:border-purple-800">
        <LoadingState message={t('loadingFamily')} size="sm" />
      </GradientCard>
    );
  }

  return (
    <GradientCard gradient="from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20" border="border-purple-200 dark:border-purple-800">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
            {familyName}
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {familyMembers.length} {familyMembers.length !== 1 ? t('overview.membersPlural') : t('overview.members')}
          </p>
        </div>
        <div className="text-right">
          <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">
            {totalTrees}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {t('overview.totalTrees')}
          </p>
        </div>
      </div>

      {/* Family Stats */}
      <StatsCard
        stats={[
          { icon: '🌳', value: totalTrees, label: t('overview.trees') },
          { icon: '🌍', value: '2.5', label: t('overview.co2') },
          { icon: '💧', value: '5,200', label: t('overview.water') },
        ]}
        columns={3}
      />
    </GradientCard>
  );
}
