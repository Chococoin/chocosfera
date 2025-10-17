'use client';

import { useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import Header from '../components/Header';
import Footer from '../components/Footer';
import ConsentCheckbox from '../components/ConsentCheckbox';

export default function AdoptPage() {
  const t = useTranslations('adopt');
  const tForms = useTranslations('forms');
  const locale = useLocale();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [country, setCountry] = useState('');
  const [trees, setTrees] = useState(1);
  const [consent, setConsent] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [adoptionData, setAdoptionData] = useState<any>(null);

  const isValid = name.trim() && email.trim() && country.trim() && trees > 0 && consent;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) return;

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/adopt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, country, trees, consent, locale }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error submitting form');
      }

      setAdoptionData(data);
      setSubmitted(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (submitted && adoptionData) {
    return (
      <>
        <Header />
        <main className="min-h-screen pt-32 pb-16 px-4 bg-gradient-to-br from-green-50 to-emerald-100 dark:from-gray-900 dark:to-gray-800">
          <div className="max-w-md mx-auto bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
            <div className="text-center mb-6">
              <div className="text-6xl mb-4">🌳</div>
              <h1 className="text-2xl font-bold text-heading dark:text-white mb-2">
                {t('success', { name })}
              </h1>
              <p className="text-muted mb-4">
                {t('successMessage')}
              </p>
            </div>

            <div className="bg-amber-50 dark:bg-gray-700 rounded-lg p-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted">{t('treesAdopted')}:</span>
                <span className="font-semibold text-heading dark:text-white">{adoptionData.numberOfTrees}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted">{tForms('country')}:</span>
                <span className="font-semibold text-heading dark:text-white">{country}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted">{t('annualCost')}:</span>
                <span className="font-semibold text-heading dark:text-white">€{adoptionData.annualCost}/year</span>
              </div>
            </div>

            <button
              onClick={() => {
                setSubmitted(false);
                setName('');
                setEmail('');
                setCountry('');
                setTrees(1);
                setConsent(false);
                setAdoptionData(null);
              }}
              className="mt-6 w-full text-green-600 hover:underline"
            >
              {t('adoptMore')}
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
      <main className="min-h-screen pt-32 pb-16 px-4 bg-gradient-to-br from-green-50 to-emerald-100 dark:from-gray-900 dark:to-gray-800">
        <div className="max-w-md mx-auto bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
          <div className="text-center mb-6">
            <div className="text-5xl mb-4">🌳</div>
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
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
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
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              />
            </div>

            <div>
              <label htmlFor="country" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {tForms('country')}
              </label>
              <input
                type="text"
                id="country"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                required
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              />
            </div>

            <div>
              <label htmlFor="trees" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('numberOfTrees')}
              </label>
              <input
                type="number"
                id="trees"
                min="1"
                value={trees}
                onChange={(e) => setTrees(Number(e.target.value))}
                required
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              />
              <p className="text-xs text-muted mt-1">{t('pricePerTree')}</p>
            </div>

            <ConsentCheckbox checked={consent} onChange={setConsent} />

            <button
              type="submit"
              disabled={!isValid || loading}
              className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition"
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
