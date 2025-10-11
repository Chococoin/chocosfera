'use client';

import Link from 'next/link';
import { useTranslations, useLocale } from 'next-intl';
import ThemeToggle from './ThemeToggle';
import LanguageSelector from './LanguageSelector';

export default function Header() {
  const t = useTranslations('header');
  const locale = useLocale();
  const loginHref = `/${locale}/login`;
  const registerHref = `/${locale}/register`;

  return (
    <header className="fixed left-0 right-0 top-0 z-10 flex items-center justify-between bg-background-light p-4 shadow-md dark:bg-background-dark">
      <h1 className="text-xl font-bold text-gray-900 dark:text-white">
        {t('title')}
      </h1>

      <div className="flex items-center gap-3">
        <ThemeToggle />
        <LanguageSelector currentLocale={locale} />
        <Link
          href={loginHref}
          className="text-sm font-medium text-gray-700 transition-colors hover:text-primary dark:text-gray-300 dark:hover:text-primary"
        >
          {t('login')}
        </Link>
        <Link
          href={registerHref}
          className="cursor-pointer rounded-full bg-primary px-4 py-2 text-sm font-bold text-white shadow-lg transition-transform duration-200 hover:scale-105"
        >
          {t('register')}
        </Link>
      </div>
    </header>
  );
}
