'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';

interface What3WordsAddressProps {
  address: string;
  language: string;
  languageName: string;
  coordinates: { lat: number; lng: number };
}

export function What3WordsAddress({
  address,
  language,
  languageName,
  coordinates,
}: What3WordsAddressProps) {
  const t = useTranslations('dashboard.trees.what3words');
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(`///${address}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleViewOnMap = () => {
    window.open(`https://what3words.com/${address}`, '_blank');
  };

  return (
    <div className="space-y-2">
      {/* Title */}
      <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
        <span className="text-red-600 dark:text-red-400">📍</span>
        <span className="font-medium">{t('title')}</span>
      </div>

      {/* what3words Address */}
      <div className="group relative">
        <div className="flex items-center justify-between p-3 bg-gradient-to-r from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-medium text-red-900 dark:text-red-100">
                {languageName}
              </span>
              <span className="px-1.5 py-0.5 text-xs bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300 rounded">
                {t('localLanguage')}
              </span>
            </div>
            <code className="text-sm font-mono font-bold text-red-700 dark:text-red-300">
              ///{address}
            </code>
          </div>
          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              type="button"
              onClick={handleCopy}
              className="p-2 hover:bg-red-100 dark:hover:bg-red-900/40 rounded-md transition-colors"
              title={t('copyAddress')}
            >
              {copied ? (
                <span className="text-green-600 dark:text-green-400">✓</span>
              ) : (
                <span className="text-red-600 dark:text-red-400">📋</span>
              )}
            </button>
            <button
              type="button"
              onClick={handleViewOnMap}
              className="p-2 hover:bg-red-100 dark:hover:bg-red-900/40 rounded-md transition-colors"
              title={t('viewOnMap')}
            >
              <span className="text-red-600 dark:text-red-400">🗺️</span>
            </button>
          </div>
        </div>
      </div>

      {/* Explanation */}
      <p className="text-xs text-gray-500 dark:text-gray-500 italic">
        {t('explanation')}
      </p>
    </div>
  );
}
