'use client';

import { useLocale, useTranslations } from 'next-intl';
import { Card, CardHeader, StatusBadge } from '@/components/ui';
import { Invitation } from './types';

interface PendingInvitationsProps {
  invitations: Invitation[];
  onCancel: (invitationId: string) => void;
}

export function PendingInvitations({ invitations, onCancel }: PendingInvitationsProps) {
  const locale = useLocale();
  const t = useTranslations('dashboard.family');

  if (invitations.length === 0) return null;

  return (
    <Card>
      <CardHeader title={t('invitations.title')} icon="📨" />

      <div className="space-y-3">
        {invitations.map((invitation) => (
          <div
            key={invitation.id}
            className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <span className="text-3xl">📧</span>
              <div>
                <p className="font-medium text-gray-900 dark:text-white">
                  {invitation.recipientEmail}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {t('invitations.sent')} {invitation.sentAt.toLocaleDateString(locale)}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-500">
                  {t('invitations.expires')} {invitation.expiresAt.toLocaleDateString(locale)}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <StatusBadge variant="warning">
                {t('invitations.pending')}
              </StatusBadge>
              <button
                type="button"
                onClick={() => onCancel(invitation.id)}
                className="px-3 py-1 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all"
              >
                {t('invitations.cancelButton')}
              </button>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
