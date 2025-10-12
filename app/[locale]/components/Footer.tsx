'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';

const SOCIAL_LINKS = [
  { label: 'Facebook', symbol: '📘', href: 'https://www.facebook.com/' },
  { label: 'Instagram', symbol: '📸', href: 'https://instagram.com/chocosfera' },
  { label: 'LinkedIn', symbol: '💼', href: 'https://linkedin.com/company/chocosfera' },
  { label: 'YouTube', symbol: '▶️', href: 'https://youtube.com/@chocosfera' },
];

export default function Footer() {
  const t = useTranslations('footer');

  return (
    <footer className="relative mt-24 border-t border-[rgba(24,26,38,0.08)] bg-[rgba(255,255,255,0.88)] py-16 backdrop-blur-xl dark:border-[rgba(255,255,255,0.06)] dark:bg-[rgba(16,18,29,0.85)]">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-24 top-0 h-64 w-64 rounded-full bg-[rgba(223,134,170,0.18)] blur-3xl" />
        <div className="absolute -right-20 bottom-10 h-72 w-72 rounded-full bg-[rgba(87,41,214,0.18)] blur-[120px]" />
      </div>

      <div className="relative mx-auto flex max-w-6xl flex-col gap-12 px-6 lg:px-8">
        <div className="flex flex-col gap-10 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-md space-y-4">
            <div className="flex items-center gap-3">
              <span className="text-3xl">🍫</span>
              <span className="text-xl font-bold uppercase tracking-[0.2em] text-heading dark:text-white">
                Chocósfera
              </span>
            </div>
            <p className="text-sm leading-relaxed text-muted">
              {t('about')}
            </p>
          </div>

          <div className="grid gap-6 text-sm text-muted sm:grid-cols-2 dark:text-[rgba(255,255,255,0.7)]">
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-[0.3em] text-muted dark:text-[rgba(255,255,255,0.6)]">
                {t('links')}
              </h4>
              <ul className="mt-3 space-y-2">
                <li>
                  <Link href="/" className="transition hover:text-heading dark:hover:text-white">
                    {t('aboutUs')}
                  </Link>
                </li>
                <li>
                  <Link href="#feature" className="transition hover:text-heading dark:hover:text-white">
                    {t('howItWorks')}
                  </Link>
                </li>
                <li>
                  <Link href="#impact" className="transition hover:text-heading dark:hover:text-white">
                    {t('faqs')}
                  </Link>
                </li>
                <li>
                  <Link href="#cta" className="transition hover:text-heading dark:hover:text-white">
                    {t('contact')}
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-[0.3em] text-muted dark:text-[rgba(255,255,255,0.6)]">
                {t('followUs')}
              </h4>
              <div className="mt-3 flex flex-wrap gap-3">
                {SOCIAL_LINKS.map((link) => (
                  <a
                    key={link.href}
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex h-11 w-11 items-center justify-center rounded-full border border-[rgba(24,26,38,0.12)] text-muted transition hover:border-[rgba(87,41,214,0.35)] hover:text-heading dark:border-[rgba(255,255,255,0.08)] dark:text-[rgba(255,255,255,0.75)] dark:hover:border-white/40 dark:hover:text-white"
                    aria-label={link.label}
                  >
                    <span aria-hidden="true">{link.symbol}</span>
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-[rgba(24,26,38,0.12)] pt-6 text-sm text-muted dark:border-[rgba(255,255,255,0.06)] dark:text-[rgba(255,255,255,0.6)]">
          <div className="flex flex-col items-center gap-3 text-center md:flex-row md:justify-between md:text-left">
            <p>
              © {new Date().getFullYear()} Chocósfera. {t('rights')}
            </p>
            <p className="text-xs uppercase tracking-[0.3em] text-muted dark:text-[rgba(255,255,255,0.45)]">
              {t('madeWith')}
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
