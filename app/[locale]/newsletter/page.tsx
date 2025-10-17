'use client';

import { useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import Header from '../components/Header';
import Footer from '../components/Footer';
import ConsentCheckbox from '../components/ConsentCheckbox';

export default function NewsletterPage() {
  const t = useTranslations('newsletter');
  const tForms = useTranslations('forms');
  const locale = useLocale();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [consent, setConsent] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const isValid = name.trim() && email.trim() && consent;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) return;

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, consent, locale }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error submitting form');
      }

      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <>
        <Header />
        <main className="min-h-screen pt-32 pb-16 px-4 bg-gradient-to-br from-amber-50 to-orange-100 dark:from-gray-900 dark:to-gray-800">
          <div className="max-w-md mx-auto bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 text-center">
            <div className="text-6xl mb-4">🍫</div>
            <h1 className="text-2xl font-bold text-heading dark:text-white mb-2">
              {t('success')}
            </h1>
            <p className="text-muted mb-6">
              {t('successMessage')}
            </p>
            <button
              onClick={() => {
                setSubmitted(false);
                setName('');
                setEmail('');
                setConsent(false);
              }}
              className="text-amber-600 hover:underline"
            >
              {t('subscribeAnother')}
            </button>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <main className="min-h-screen pt-32 pb-16 px-4 bg-gradient-to-br from-amber-50 to-orange-100 dark:from-gray-900 dark:to-gray-800">
        <div className="max-w-md mx-auto bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
          <div className="text-center mb-6">
            <div className="text-5xl mb-4">📬</div>
            <h1 className="text-3xl font-bold text-heading dark:text-white mb-2">
              {t('title')}
            </h1>
            <p className="text-muted">
              {t('subtitle')}
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-800 dark:text-red-200 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {tForms('name')}
              </label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {tForms('email')}
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              />
            </div>

            <ConsentCheckbox checked={consent} onChange={setConsent} />

            <button
              type="submit"
              disabled={!isValid || loading}
              className="w-full bg-amber-600 text-white py-3 rounded-lg font-semibold hover:bg-amber-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition"
            >
              {loading ? tForms('submitting') : t('button')}
            </button>
          </form>
        </div>
      </main>
      <Footer />
    </>
  );
}
