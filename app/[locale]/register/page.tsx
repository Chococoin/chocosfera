'use client';

import { useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import Link from 'next/link';

interface ValidationErrors {
  nick?: string;
  email?: string;
  password?: string;
}

export default function RegisterPage() {
  const t = useTranslations('register');
  const locale = useLocale();
  const [formData, setFormData] = useState({
    nick: '',
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState<ValidationErrors>({});

  const validatePassword = (password: string): string | null => {
    if (password.length < 15) {
      return t('errors.passwordTooShort');
    }
    if (!/[A-Z]/.test(password)) {
      return t('errors.passwordNoUppercase');
    }
    if (!/[a-z]/.test(password)) {
      return t('errors.passwordNoLowercase');
    }
    if (!/[0-9]/.test(password)) {
      return t('errors.passwordNoNumber');
    }
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
      return t('errors.passwordNoSpecial');
    }
    return null;
  };

  const validateEmail = (email: string): string | null => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return t('errors.emailInvalid');
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: ValidationErrors = {};

    // Validar nick
    if (!formData.nick.trim()) {
      newErrors.nick = t('errors.nickRequired');
    }

    // Validar email
    if (!formData.email.trim()) {
      newErrors.email = t('errors.emailRequired');
    } else {
      const emailError = validateEmail(formData.email);
      if (emailError) {
        newErrors.email = emailError;
      }
    }

    // Validar password
    if (!formData.password) {
      newErrors.password = t('errors.passwordRequired');
    } else {
      const passwordError = validatePassword(formData.password);
      if (passwordError) {
        newErrors.password = passwordError;
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // TODO: Implementar lógica de registro
    console.log('Register attempt:', formData);
    setErrors({});
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });

    // Limpiar error del campo mientras el usuario escribe
    if (errors[name as keyof ValidationErrors]) {
      setErrors({
        ...errors,
        [name]: undefined,
      });
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background-light px-4 py-12 dark:bg-background-dark">
      <div className="w-full max-w-md rounded-xl bg-white p-8 shadow-2xl dark:bg-gray-800">
        <h1 className="mb-6 text-center text-3xl font-bold text-gray-900 dark:text-white">
          {t('title')}
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="nick"
              className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              {t('nick')}
            </label>
            <input
              type="text"
              id="nick"
              name="nick"
              value={formData.nick}
              onChange={handleChange}
              className={`w-full rounded-lg border px-4 py-2 text-gray-900 focus:outline-none focus:ring-2 dark:text-white ${
                errors.nick
                  ? 'border-red-500 bg-red-50 focus:border-red-500 focus:ring-red-500 dark:border-red-500 dark:bg-red-900/20'
                  : 'border-gray-300 bg-white focus:border-primary focus:ring-primary dark:border-gray-600 dark:bg-gray-700'
              }`}
            />
            {errors.nick && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                {errors.nick}
              </p>
            )}
          </div>

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
              value={formData.email}
              onChange={handleChange}
              className={`w-full rounded-lg border px-4 py-2 text-gray-900 focus:outline-none focus:ring-2 dark:text-white ${
                errors.email
                  ? 'border-red-500 bg-red-50 focus:border-red-500 focus:ring-red-500 dark:border-red-500 dark:bg-red-900/20'
                  : 'border-gray-300 bg-white focus:border-primary focus:ring-primary dark:border-gray-600 dark:bg-gray-700'
              }`}
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                {errors.email}
              </p>
            )}
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
              className={`w-full rounded-lg border px-4 py-2 text-gray-900 focus:outline-none focus:ring-2 dark:text-white ${
                errors.password
                  ? 'border-red-500 bg-red-50 focus:border-red-500 focus:ring-red-500 dark:border-red-500 dark:bg-red-900/20'
                  : 'border-gray-300 bg-white focus:border-primary focus:ring-primary dark:border-gray-600 dark:bg-gray-700'
              }`}
            />
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              {t('passwordRequirements')}
            </p>
            {errors.password && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                {errors.password}
              </p>
            )}
          </div>

          <button
            type="submit"
            className="w-full rounded-full bg-primary px-6 py-3 font-bold text-white shadow-lg transition-transform duration-200 hover:scale-105"
          >
            {t('submit')}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
          {t('hasAccount')}{' '}
          <Link
            href={`/${locale}/login`}
            className="font-medium text-primary hover:underline"
          >
            {t('loginLink')}
          </Link>
        </div>
      </div>
    </div>
  );
}
