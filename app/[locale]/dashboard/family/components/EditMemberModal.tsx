'use client';

import { useTranslations } from 'next-intl';
import { Modal, Alert, FormSelect, GradientCard } from '@/components/ui';
import { FamilyMember } from './types';

interface EditMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  memberId: string;
  memberName: string;
  parentId: string;
  setParentId: (id: string) => void;
  familyMembers: FamilyMember[];
  isSubmitting: boolean;
  errorMessage: string | null;
  onSubmit: (e: React.FormEvent) => void;
}

export function EditMemberModal({
  isOpen,
  onClose,
  memberId,
  memberName,
  parentId,
  setParentId,
  familyMembers,
  isSubmitting,
  errorMessage,
  onSubmit,
}: EditMemberModalProps) {
  const t = useTranslations('dashboard.family');

  const parentOptions = [
    { value: '', label: t('editMember.noParent') },
    ...familyMembers
      .filter((member) => member.id !== memberId)
      .map((member) => ({
        value: member.id,
        label: `${member.firstName || member.nick}${member.role === 'creator' ? ' 👑' : ''}`,
      })),
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => !isSubmitting && onClose()}
      title={t('editMember.modalTitle')}
      headerGradient=""
      disabled={isSubmitting}
    >
      <form onSubmit={onSubmit} className="space-y-4">
        {errorMessage && (
          <Alert variant="error">
            {errorMessage}
          </Alert>
        )}

        <GradientCard gradient="from-purple-50 to-purple-50 dark:from-purple-900/20 dark:to-purple-900/20" border="border-purple-200 dark:border-purple-800" padding="sm">
          <p className="text-sm text-purple-800 dark:text-purple-200">
            <strong>{t('editMember.editing')}</strong> {memberName}
          </p>
        </GradientCard>

        <FormSelect
          label={t('editMember.parentLabel')}
          value={parentId}
          onChange={(e) => setParentId(e.target.value)}
          disabled={isSubmitting}
          options={parentOptions}
          hint={t('editMember.parentDescription')}
        />

        <Alert variant="info" icon="💡">
          <strong>{t('createFamily.tipLabel')}</strong> {t('editMember.tipText')}
        </Alert>

        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-all disabled:opacity-50"
          >
            {t('editMember.cancelButton')}
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? t('editMember.saving') : t('editMember.saveButton')}
          </button>
        </div>
      </form>
    </Modal>
  );
}
