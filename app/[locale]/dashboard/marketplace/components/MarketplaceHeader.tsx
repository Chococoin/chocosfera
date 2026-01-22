'use client';

import { useTranslations } from 'next-intl';
import { PaymentMode } from '../data';

interface MarketplaceHeaderProps {
  paymentMode: PaymentMode;
  setPaymentMode: (mode: PaymentMode) => void;
  userFiatBalance: number;
  userCoins: number;
  showFilters: boolean;
  setShowFilters: (show: boolean) => void;
}

export function MarketplaceHeader({
  paymentMode,
  setPaymentMode,
  userFiatBalance,
  userCoins,
  showFilters,
  setShowFilters,
}: MarketplaceHeaderProps) {
  const t = useTranslations('dashboard.marketplace');

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-heading mb-1 sm:mb-2" style={{ fontFamily: 'var(--font-heading)' }}>
          🛒 Marketplace
        </h1>
        <p className="text-sm sm:text-base text-muted">
          {t('subtitle')}
        </p>
      </div>
      <div className="flex items-center gap-3">
        {/* Dual Balance Panel with Payment Mode Toggle */}
        <div className="surface-panel px-4 py-3 sm:px-6 sm:py-4 flex-1 sm:flex-initial">
          {/* Payment Mode Toggle */}
          <div className="flex items-center justify-center gap-2 mb-3">
            <button
              type="button"
              onClick={() => setPaymentMode('fiat')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                paymentMode === 'fiat'
                  ? 'bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary-alt)] text-white shadow-sm'
                  : 'text-muted hover:bg-[rgba(223,134,170,0.08)]'
              }`}
            >
              <span>💳</span>
              <span>Fiat</span>
            </button>
            <button
              type="button"
              onClick={() => setPaymentMode('chococoins')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                paymentMode === 'chococoins'
                  ? 'bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary-alt)] text-white shadow-sm'
                  : 'text-muted hover:bg-[rgba(223,134,170,0.08)]'
              }`}
            >
              <span>🪙</span>
              <span>Coins</span>
            </button>
          </div>

          {/* Balance Display */}
          <div className="flex items-center gap-2 sm:gap-3">
            <span className="text-2xl sm:text-3xl">
              {paymentMode === 'fiat' ? '💳' : '🪙'}
            </span>
            <div>
              <p className="text-[10px] sm:text-xs text-muted">
                {paymentMode === 'fiat' ? t('balance.fiat') : t('balance.coins')}
              </p>
              <p className="text-xl sm:text-2xl font-bold text-heading" style={{ fontFamily: 'var(--font-heading)' }}>
                {paymentMode === 'fiat' ? `€${userFiatBalance.toFixed(2)}` : userCoins}
              </p>
            </div>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setShowFilters(!showFilters)}
          className="lg:hidden px-3 py-2 sm:px-4 rounded-2xl border border-[var(--color-border)] text-heading hover:bg-[rgba(223,134,170,0.08)] transition-all text-sm"
        >
          {showFilters ? '✕' : '☰'}
        </button>
      </div>
    </div>
  );
}
