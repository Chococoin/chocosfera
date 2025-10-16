'use client';

import { useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { pricingSchemes, type PricingPlan } from '@/lib/pricing-plans';
import {
  getCurrencyForLocale,
  formatPrice,
  convertPrice,
} from '@/lib/currency-config';

export default function PricingPage() {
  const t = useTranslations('dashboard.pricing');
  const locale = useLocale();
  const currency = getCurrencyForLocale(locale);
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const [selectedPlans, setSelectedPlans] = useState<string[]>([]);

  /**
   * Get price in user's currency
   */
  const getPriceInCurrency = (plan: PricingPlan): number => {
    return convertPrice(plan.priceEUR, currency);
  };

  /**
   * Format price for display
   */
  const formatPriceDisplay = (plan: PricingPlan): string => {
    const amount = getPriceInCurrency(plan);
    return formatPrice(amount, currency, locale);
  };

  const handleSubscribe = async (planId: string) => {
    setLoadingPlan(planId);

    try {
      const response = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId, locale }),
      });

      if (!response.ok) {
        throw new Error('Failed to create checkout session');
      }

      const { sessionId } = await response.json();

      if (sessionId) {
        // TODO: Redirect to Stripe Checkout
        console.log('Checkout session created:', sessionId);
        alert(`Checkout session created! ID: ${sessionId}\nStripe redirect will be implemented soon.`);
      }
    } catch (error) {
      console.error('Error:', error);
      alert(t('errors.paymentError'));
    } finally {
      setLoadingPlan(null);
    }
  };

  const togglePlanSelection = (planId: string) => {
    setSelectedPlans((prev) =>
      prev.includes(planId)
        ? prev.filter((id) => id !== planId)
        : [...prev, planId]
    );
  };

  const getPriceColorClass = (color: string) => {
    const colors: Record<string, string> = {
      green: 'from-green-500 to-emerald-500',
      emerald: 'from-emerald-500 to-teal-500',
      teal: 'from-teal-500 to-cyan-500',
      amber: 'from-amber-500 to-orange-500',
      orange: 'from-orange-500 to-red-500',
      brown: 'from-amber-700 to-orange-900',
    };
    return colors[color] || 'from-[var(--color-primary)] to-[var(--color-primary-alt)]';
  };

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 mb-6 rounded-full bg-[rgba(223,134,170,0.18)] border border-[rgba(223,134,170,0.35)]">
            <span className="text-2xl">💰</span>
            <span className="text-sm font-semibold text-heading uppercase tracking-wider">
              {t('badge')}
            </span>
          </div>
          <h1
            className="text-4xl sm:text-5xl font-bold text-heading mb-6"
            style={{ fontFamily: 'var(--font-heading)' }}
          >
            {t('title')}{' '}
            <span className="bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary-alt)] bg-clip-text text-transparent">
              {t('titleHighlight')}
            </span>
          </h1>
          <p className="text-lg text-muted max-w-3xl mx-auto leading-relaxed">
            {t('subtitle')}
          </p>
        </div>

        {/* Pricing Schemes */}
        <div className="space-y-20">
          {pricingSchemes.map((scheme) => (
            <div key={scheme.id}>
              {/* Scheme Header */}
              <div className="text-center mb-12">
                <div className="inline-flex items-center gap-3 mb-4">
                  <span className="text-5xl">{scheme.icon}</span>
                  <h2
                    className="text-3xl sm:text-4xl font-bold text-heading"
                    style={{ fontFamily: 'var(--font-heading)' }}
                  >
                    {t(`schemes.${scheme.id}.name`)}
                  </h2>
                </div>
                <p className="text-lg text-muted mb-2">{t(`schemes.${scheme.id}.description`)}</p>
                <p className="text-sm font-semibold text-[var(--color-primary-alt)] uppercase tracking-wide">
                  {t(`schemes.${scheme.id}.tagline`)}
                </p>
              </div>

              {/* Plans Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {scheme.plans.map((plan) => (
                  <div
                    key={plan.id}
                    className={`relative overflow-hidden rounded-3xl border transition-all hover:scale-[1.02] ${
                      plan.popular
                        ? 'border-[var(--color-primary-alt)] shadow-xl'
                        : 'border-[var(--color-border)]'
                    } ${
                      selectedPlans.includes(plan.id)
                        ? 'ring-2 ring-[var(--color-primary-alt)] ring-offset-2 ring-offset-[var(--color-background)]'
                        : ''
                    }`}
                  >
                    {/* Popular Badge */}
                    {plan.popular && (
                      <div className="absolute top-4 right-4 z-10">
                        <div className="px-3 py-1 rounded-full bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary-alt)] text-white text-xs font-bold uppercase tracking-wide">
                          {t('popular')}
                        </div>
                      </div>
                    )}

                    {/* Background Gradient */}
                    <div className="absolute inset-0 bg-[var(--color-surface)] backdrop-blur-xl" />
                    <div
                      className={`absolute inset-0 bg-gradient-to-br ${getPriceColorClass(
                        plan.color
                      )} opacity-5`}
                    />

                    {/* Content */}
                    <div className="relative p-8 space-y-6">
                      {/* Icon & Name */}
                      <div className="text-center">
                        <div className="text-6xl mb-4">{plan.icon}</div>
                        <h3
                          className="text-2xl font-bold text-heading mb-2"
                          style={{ fontFamily: 'var(--font-heading)' }}
                        >
                          {t(`schemes.${scheme.id}.plans.${plan.id.replace(`${scheme.id}-`, '')}.name`)}
                        </h3>
                      </div>

                      {/* Price */}
                      <div className="text-center py-4">
                        <div className="flex items-baseline justify-center gap-2">
                          <span className="text-4xl font-bold text-heading">
                            {formatPriceDisplay(plan)}
                          </span>
                          <span className="text-lg text-muted">
                            /{plan.interval === 'month' ? t('perMonth') : t('perYear')}
                          </span>
                        </div>
                      </div>

                      {/* Key Metrics (for Fruit plans) */}
                      {scheme.id === 'fruit' && (
                        <div className="grid grid-cols-2 gap-3 py-4 border-y border-[var(--color-border)]">
                          {plan.trees && (
                            <div className="text-center">
                              <div className="text-2xl font-bold text-heading">
                                {plan.trees}
                              </div>
                              <div className="text-xs text-muted">{t('metrics.trees')}</div>
                            </div>
                          )}
                          {plan.chococoins && (
                            <div className="text-center">
                              <div className="text-2xl font-bold text-heading">
                                {plan.chococoins}
                              </div>
                              <div className="text-xs text-muted">{t('metrics.chococoins')}</div>
                            </div>
                          )}
                          {plan.discount && (
                            <div className="text-center col-span-2">
                              <div className="text-2xl font-bold text-heading">
                                {plan.discount}%
                              </div>
                              <div className="text-xs text-muted">{t('metrics.discount')}</div>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Features */}
                      <ul className="space-y-3">
                        {(t.raw(`schemes.${scheme.id}.plans.${plan.id.replace(`${scheme.id}-`, '')}.features`) as string[]).map((feature, index) => (
                          <li key={index} className="flex items-start gap-3">
                            <span className="flex-shrink-0 w-5 h-5 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center text-white text-xs mt-0.5">
                              ✓
                            </span>
                            <span className="text-sm text-muted flex-1">
                              {feature}
                            </span>
                          </li>
                        ))}
                      </ul>

                      {/* CTA Button */}
                      <button
                        type="button"
                        onClick={() => handleSubscribe(plan.id)}
                        disabled={loadingPlan === plan.id}
                        className={`w-full py-4 px-6 rounded-2xl font-semibold text-white transition-all ${
                          plan.popular
                            ? 'bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary-alt)] hover:shadow-xl hover:scale-105'
                            : 'bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800'
                        } disabled:opacity-50 disabled:cursor-not-allowed`}
                      >
                        {loadingPlan === plan.id ? (
                          <span className="flex items-center justify-center gap-2">
                            <span className="animate-spin">⏳</span>
                            {t('processing')}
                          </span>
                        ) : (
                          t('subscribeNow')
                        )}
                      </button>

                      {/* Selection Checkbox (for multi-plan selection) */}
                      <button
                        type="button"
                        onClick={() => togglePlanSelection(plan.id)}
                        className="w-full py-2 text-sm text-muted hover:text-heading transition-colors flex items-center justify-center gap-2"
                      >
                        <span
                          className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                            selectedPlans.includes(plan.id)
                              ? 'border-[var(--color-primary-alt)] bg-[var(--color-primary-alt)]'
                              : 'border-[var(--color-border)]'
                          }`}
                        >
                          {selectedPlans.includes(plan.id) && (
                            <span className="text-white text-xs">✓</span>
                          )}
                        </span>
                        {t('comparePlan')}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Multiple Plans Selection Summary */}
        {selectedPlans.length > 0 && (
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2rem)] max-w-2xl">
            <div className="surface-panel p-6 shadow-2xl">
              <div className="flex items-center justify-between gap-4">
                <div className="flex-1">
                  <div className="font-semibold text-heading mb-1">
                    {selectedPlans.length} {selectedPlans.length === 1 ? t('multiPlan.selected') : t('multiPlan.selectedPlural')}
                  </div>
                  <div className="text-sm text-muted">
                    {t('multiPlan.total')}:{' '}
                    <span className="font-bold text-heading">
                      {formatPrice(
                        selectedPlans.reduce((total, planId) => {
                          const scheme = pricingSchemes.find((s) =>
                            s.plans.some((p) => p.id === planId)
                          );
                          const plan = scheme?.plans.find((p) => p.id === planId);
                          if (!plan) return total;
                          return total + convertPrice(plan.priceEUR, currency);
                        }, 0),
                        currency,
                        locale
                      )}
                      /{t('perMonth')}
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    console.log('Subscribe to multiple plans:', selectedPlans)
                  }
                  className="px-6 py-3 rounded-2xl bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary-alt)] text-white font-semibold hover:shadow-xl transition-all"
                >
                  {t('multiPlan.subscribeAll')}
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedPlans([])}
                  className="p-3 rounded-full hover:bg-[rgba(223,134,170,0.12)] text-muted hover:text-heading transition-all"
                  aria-label={t('multiPlan.clearSelection')}
                >
                  ✕
                </button>
              </div>
            </div>
          </div>
        )}

        {/* FAQ Section */}
        <div className="mt-20 max-w-4xl mx-auto">
          <h2
            className="text-3xl font-bold text-heading text-center mb-12"
            style={{ fontFamily: 'var(--font-heading)' }}
          >
            {t('faq.title')}
          </h2>
          <div className="space-y-6">
            <div className="surface-panel p-6">
              <h3 className="text-lg font-bold text-heading mb-2">
                {t('faq.q1.question')}
              </h3>
              <p className="text-muted">
                {t('faq.q1.answer')}
              </p>
            </div>
            <div className="surface-panel p-6">
              <h3 className="text-lg font-bold text-heading mb-2">
                {t('faq.q2.question')}
              </h3>
              <p className="text-muted">
                {t('faq.q2.answer')}
              </p>
            </div>
            <div className="surface-panel p-6">
              <h3 className="text-lg font-bold text-heading mb-2">
                {t('faq.q3.question')}
              </h3>
              <p className="text-muted">
                {t('faq.q3.answer')}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
