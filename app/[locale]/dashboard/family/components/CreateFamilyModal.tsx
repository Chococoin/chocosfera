'use client';

import { useTranslations } from 'next-intl';
import { Modal, Alert, FormInput } from '@/components/ui';

interface CreateFamilyModalProps {
  isOpen: boolean;
  onClose: () => void;
  familyName: string;
  setFamilyName: (name: string) => void;
  isSubmitting: boolean;
  errorMessage: string | null;
  onSubmit: (e: React.FormEvent) => void;
}

export function CreateFamilyModal({
  isOpen,
  onClose,
  familyName,
  setFamilyName,
  isSubmitting,
  errorMessage,
  onSubmit,
}: CreateFamilyModalProps) {
  const t = useTranslations('dashboard.family');

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => !isSubmitting && onClose()}
      title={t('createFamily.modalTitle')}
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
          label={t('createFamily.nameLabel')}
          value={familyName}
          onChange={(e) => setFamilyName(e.target.value)}
          placeholder={t('createFamily.namePlaceholder')}
          required
          minLength={2}
          maxLength={50}
          disabled={isSubmitting}
          hint={t('createFamily.nameDescription')}
        />

        <Alert variant="info" icon="💡">
          <strong>{t('createFamily.tipLabel')}</strong> {t('createFamily.tipText')}
        </Alert>

        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-all disabled:opacity-50"
          >
            {t('createFamily.cancelButton')}
          </button>
          <button
            type="submit"
            disabled={isSubmitting || familyName.trim().length < 2}
            className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? t('createFamily.creating') : t('createFamily.createButton')}
          </button>
        </div>
      </form>
    </Modal>
  );
}
