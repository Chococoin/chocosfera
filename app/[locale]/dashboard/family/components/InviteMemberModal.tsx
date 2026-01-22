'use client';

import { useTranslations } from 'next-intl';
import { Modal, Alert, FormInput, FormSelect } from '@/components/ui';
import { FamilyMember } from './types';

interface InviteMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  email: string;
  setEmail: (email: string) => void;
  selectedParentId: string;
  setSelectedParentId: (id: string) => void;
  familyMembers: FamilyMember[];
  isSubmitting: boolean;
  errorMessage: string | null;
  onSubmit: (e: React.FormEvent) => void;
}

export function InviteMemberModal({
  isOpen,
  onClose,
  email,
  setEmail,
  selectedParentId,
  setSelectedParentId,
  familyMembers,
  isSubmitting,
  errorMessage,
  onSubmit,
}: InviteMemberModalProps) {
  const t = useTranslations('dashboard.family');

  const parentOptions = [
    { value: '', label: t('inviteMember.noParent') },
    ...familyMembers.map((member) => ({
      value: member.id,
      label: `${member.firstName || member.nick}${member.role === 'creator' ? ' 👑' : ''}`,
    })),
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => !isSubmitting && onClose()}
      title={t('inviteMember.modalTitle')}
      headerGradient=""
      disabled={isSubmitting}
    >
      <form onSubmit={onSubmit} className="space-y-4">
        {errorMessage && (
          <Alert variant="error">
            {errorMessage}
          </Alert>
        )}

        <FormInput
          label={t('inviteMember.emailLabel')}
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder={t('inviteMember.emailPlaceholder')}
          required
          disabled={isSubmitting}
        />

        <FormSelect
          label={t('inviteMember.parentLabel')}
          value={selectedParentId}
          onChange={(e) => setSelectedParentId(e.target.value)}
          disabled={isSubmitting}
          options={parentOptions}
          hint={t('inviteMember.parentDescription')}
        />

        <Alert variant="info" icon="💡">
          <strong>{t('createFamily.tipLabel')}</strong> {t('inviteMember.tipText')}
        </Alert>

        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-all disabled:opacity-50"
          >
            {t('inviteMember.cancelButton')}
          </button>
          <button
            type="submit"
            disabled={isSubmitting || email.trim().length < 3}
            className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? t('inviteMember.sending') : t('inviteMember.sendButton')}
          </button>
        </div>
      </form>
    </Modal>
  );
}
