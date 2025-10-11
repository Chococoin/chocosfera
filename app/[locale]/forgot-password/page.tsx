'use client';

import { useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import Link from 'next/link';

export default function ForgotPasswordPage() {
  const t = useTranslations('forgotPassword');
  const locale = useLocale();
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implementar lógica de recuperación de contraseña
    console.log('Password recovery for:', email);
    setSubmitted(true);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background-light px-4 dark:bg-background-dark">
      <div className="w-full max-w-md rounded-xl bg-white p-8 shadow-2xl dark:bg-gray-800">
        <h1 className="mb-6 text-center text-3xl font-bold text-gray-900 dark:text-white">
          {t('title')}
        </h1>

        {!submitted ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="email"
                className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                {t('email')}
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              />
            </div>

            <button
              type="submit"
              className="w-full rounded-full bg-primary px-6 py-3 font-bold text-white shadow-lg transition-transform duration-200 hover:scale-105"
            >
              {t('submit')}
            </button>
          </form>
        ) : (
          <div className="rounded-lg bg-green-100 p-4 text-center dark:bg-green-900/30">
            <p className="text-green-800 dark:text-green-300">
              Hemos enviado las instrucciones de recuperación a tu email.
            </p>
          </div>
        )}

        <div className="mt-6 text-center">
          <Link
            href={`/${locale}/login`}
            className="text-sm text-primary hover:underline"
          >
            {t('backToLogin')}
          </Link>
        </div>
      </div>
    </div>
  );
}
