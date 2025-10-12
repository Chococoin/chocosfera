'use client';

import Link from 'next/link';
import { useTranslations, useLocale } from 'next-intl';
import ThemeToggle from './ThemeToggle';
import LanguageSelector from './LanguageSelector';

const NAV_TARGETS = [
  { key: 'home', href: '#home' },
  { key: 'traceability', href: '#feature' },
  { key: 'impact', href: '#impact' },
  { key: 'create', href: '#cta' },
] as const;

export default function Header() {
  const tHeader = useTranslations('header');
  const tNavigation = useTranslations('navigation');
  const locale = useLocale();
  const loginHref = `/${locale}/login`;
  const registerHref = `/${locale}/register`;

  const handleAnchorClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const href = e.currentTarget.getAttribute('href');
    if (!href) return;

    const targetId = href.replace('#', '');
    const targetElement = document.getElementById(targetId);

    if (targetElement) {
      const headerHeight = 104; // Altura aproximada del header en píxeles
      const targetPosition = targetElement.getBoundingClientRect().top + window.scrollY - headerHeight;

      window.scrollTo({
        top: targetPosition,
        behavior: 'smooth'
      });
    }
  };

  return (
    <header className="fixed left-0 right-0 top-0 z-50">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-6 iko-header">
        <Link href={`/${locale}`} className="flex items-center gap-3">
          <span className="iko-header__brand">{tHeader('title')}</span>
        </Link>

        <nav className="iko-header__nav">
          {NAV_TARGETS.map(({ key, href }) => (
            <a
              key={key}
              href={href}
              className="text-xs tracking-[0.28em]"
              onClick={handleAnchorClick}
            >
              {tNavigation(key)}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <LanguageSelector currentLocale={locale} />
            <ThemeToggle />
          </div>
          <Link href={loginHref} className="iko-button-secondary text-xs header-auth-btn">
            {tHeader('login')}
          </Link>
          <Link href={registerHref} className="iko-button-primary text-xs header-auth-btn">
            {tHeader('register')}
          </Link>
        </div>
      </div>
    </header>
  );
}
