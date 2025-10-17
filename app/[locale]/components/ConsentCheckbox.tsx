'use client';

import { useTranslations } from 'next-intl';

interface ConsentCheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
}

export default function ConsentCheckbox({ checked, onChange }: ConsentCheckboxProps) {
  const t = useTranslations('forms');

  return (
    <div className="flex items-start gap-3">
      <input
        type="checkbox"
        id="consent"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-1 h-4 w-4 rounded border-gray-300 text-amber-600 focus:ring-amber-500 dark:border-gray-600 dark:bg-gray-700"
        required
      />
      <label htmlFor="consent" className="text-sm text-muted">
        {t('consentText')}
      </label>
    </div>
  );
}
