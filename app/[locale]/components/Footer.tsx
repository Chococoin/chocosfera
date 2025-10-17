'use client';

import Link from 'next/link';
import { useTranslations, useLocale } from 'next-intl';

export default function Footer() {
  const t = useTranslations('footer');
  const locale = useLocale();

  return (
    <footer className="relative mt-10 border-t border-[rgba(24,26,38,0.08)] bg-[rgba(255,255,255,0.88)] pt-6 pb-16 backdrop-blur-xl dark:border-[rgba(255,255,255,0.06)] dark:bg-[rgba(16,18,29,0.85)]">
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
                  <Link href={`/${locale}`} className="transition hover:text-heading dark:hover:text-white">
                    {t('aboutUs')}
                  </Link>
                </li>
                <li>
                  <Link href={`/${locale}/newsletter`} className="transition hover:text-heading dark:hover:text-white">
                    {t('newsletter')}
                  </Link>
                </li>
                <li>
                  <Link href={`/${locale}/adopt`} className="transition hover:text-heading dark:hover:text-white">
                    {t('adopt')}
                  </Link>
                </li>
                <li>
                  <Link href={`/${locale}/contact`} className="transition hover:text-heading dark:hover:text-white">
                    {t('contact')}
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-[0.3em] text-muted dark:text-[rgba(255,255,255,0.6)]">
                {t('followUs')}
              </h4>
              <div className="mt-3 grid grid-cols-3 gap-3">
                {/* YouTube */}
                <a
                  href="https://youtube.com/@chocosfera"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="social-youtube group flex h-14 w-14 items-center justify-center rounded-2xl bg-[rgba(24,26,38,0.04)] transition-all duration-300 hover:scale-110 hover:bg-red-600 hover:shadow-lg hover:shadow-red-600/50 dark:bg-[rgba(255,255,255,0.05)] dark:hover:bg-red-600"
                  aria-label="YouTube"
                >
                  <svg
                    className="h-7 w-7 text-[rgba(24,26,38,0.6)] transition-colors group-hover:text-white dark:text-[rgba(255,255,255,0.6)]"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                  </svg>
                </a>

                {/* Instagram */}
                <a
                  href="https://instagram.com/chocosfera"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="social-instagram group flex h-14 w-14 items-center justify-center rounded-2xl bg-[rgba(24,26,38,0.04)] transition-all duration-300 hover:scale-110 hover:bg-gradient-to-br hover:from-purple-600 hover:via-pink-600 hover:to-orange-500 hover:shadow-lg hover:shadow-pink-600/50 dark:bg-[rgba(255,255,255,0.05)]"
                  aria-label="Instagram"
                >
                  <svg
                    className="h-7 w-7 text-[rgba(24,26,38,0.6)] transition-colors group-hover:text-white dark:text-[rgba(255,255,255,0.6)]"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                </a>

                {/* TikTok */}
                <a
                  href="https://tiktok.com/@chocosfera"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="social-tiktok group flex h-14 w-14 items-center justify-center rounded-2xl bg-[rgba(24,26,38,0.04)] transition-all duration-300 hover:scale-110 hover:bg-black hover:shadow-lg hover:shadow-black/50 dark:bg-[rgba(255,255,255,0.05)] dark:hover:bg-black"
                  aria-label="TikTok"
                >
                  <svg
                    className="h-7 w-7 text-[rgba(24,26,38,0.6)] transition-colors group-hover:text-white dark:text-[rgba(255,255,255,0.6)]"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
                  </svg>
                </a>

                {/* Facebook */}
                <a
                  href="https://facebook.com/chocosfera"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="social-facebook group flex h-14 w-14 items-center justify-center rounded-2xl bg-[rgba(24,26,38,0.04)] transition-all duration-300 hover:scale-110 hover:bg-blue-600 hover:shadow-lg hover:shadow-blue-600/50 dark:bg-[rgba(255,255,255,0.05)] dark:hover:bg-blue-600"
                  aria-label="Facebook"
                >
                  <svg
                    className="h-7 w-7 text-[rgba(24,26,38,0.6)] transition-colors group-hover:text-white dark:text-[rgba(255,255,255,0.6)]"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                </a>

                {/* Twitter/X */}
                <a
                  href="https://twitter.com/chocosfera"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="social-twitter group flex h-14 w-14 items-center justify-center rounded-2xl bg-[rgba(24,26,38,0.04)] transition-all duration-300 hover:scale-110 hover:bg-black hover:shadow-lg hover:shadow-gray-600/50 dark:bg-[rgba(255,255,255,0.05)] dark:hover:bg-black"
                  aria-label="Twitter/X"
                >
                  <svg
                    className="h-6 w-6 text-[rgba(24,26,38,0.6)] transition-colors group-hover:text-white dark:text-[rgba(255,255,255,0.6)]"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                  </svg>
                </a>

                {/* LinkedIn */}
                <a
                  href="https://linkedin.com/company/chocosfera"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="social-linkedin group flex h-14 w-14 items-center justify-center rounded-2xl bg-[rgba(24,26,38,0.04)] transition-all duration-300 hover:scale-110 hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-700/50 dark:bg-[rgba(255,255,255,0.05)] dark:hover:bg-blue-700"
                  aria-label="LinkedIn"
                >
                  <svg
                    className="h-7 w-7 text-[rgba(24,26,38,0.6)] transition-colors group-hover:text-white dark:text-[rgba(255,255,255,0.6)]"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                  </svg>
                </a>
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
