'use client';

import { useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import Link from 'next/link';

export default function LoginPage() {
  const t = useTranslations('login');
  const locale = useLocale();
  const [formData, setFormData] = useState({
    usernameOrEmail: '',
    password: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implementar lógica de login
    console.log('Login attempt:', formData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background-light px-4 dark:bg-background-dark">
      <div className="w-full max-w-md rounded-xl bg-white p-8 shadow-2xl dark:bg-gray-800">
        <h1 className="mb-6 text-center text-3xl font-bold text-gray-900 dark:text-white">
          {t('title')}
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="usernameOrEmail"
              className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              {t('usernameOrEmail')}
            </label>
            <input
              type="text"
              id="usernameOrEmail"
              name="usernameOrEmail"
              value={formData.usernameOrEmail}
              onChange={handleChange}
              required
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              {t('password')}
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            />
          </div>

          <div className="text-right">
            <Link
              href={`/${locale}/forgot-password`}
              className="text-sm text-primary hover:underline"
            >
              {t('forgotPassword')}
            </Link>
          </div>

          <button
            type="submit"
            className="w-full rounded-full bg-primary px-6 py-3 font-bold text-white shadow-lg transition-transform duration-200 hover:scale-105"
          >
            {t('submit')}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
          {t('noAccount')}{' '}
          <Link
            href={`/${locale}/register`}
            className="font-medium text-primary hover:underline"
          >
            {t('registerLink')}
          </Link>
        </div>
      </div>
    </div>
  );
}
