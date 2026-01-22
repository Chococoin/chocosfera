'use client';

import { useTranslations } from 'next-intl';
import { Product, PaymentMode } from '../data';
import { ProductCard } from './ProductCard';

interface ProductGridProps {
  products: Product[];
  paymentMode: PaymentMode;
  userCoins: number;
  onBuy: (product: Product) => void;
}

export function ProductGrid({ products, paymentMode, userCoins, onBuy }: ProductGridProps) {
  const t = useTranslations('dashboard.marketplace');

  return (
    <div className="flex-1">
      <div className="mb-3 sm:mb-4 flex flex-col sm:flex-row sm:items-center gap-2 sm:justify-between">
        <p className="text-xs sm:text-sm text-muted">
          {products.length} {t('productsCount')}
        </p>
        <select className="px-3 py-2 sm:px-4 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] text-heading text-xs sm:text-sm focus:outline-none cursor-pointer">
          <option>{t('sort.newest')}</option>
          <option>{t('sort.priceLowHigh')}</option>
          <option>{t('sort.priceHighLow')}</option>
          <option>{t('sort.popular')}</option>
        </select>
      </div>

      {products.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-6">
          {products.map(product => (
            <ProductCard
              key={product.id}
              product={product}
              paymentMode={paymentMode}
              userCoins={userCoins}
              onBuy={onBuy}
            />
          ))}
        </div>
      ) : (
        <EmptyState />
      )}
    </div>
  );
}

function EmptyState() {
  const t = useTranslations('dashboard.marketplace');

  return (
    <div className="text-center py-12 sm:py-20">
      <div className="text-5xl sm:text-6xl mb-3 sm:mb-4">🔍</div>
      <p className="text-lg sm:text-xl font-semibold text-heading mb-2">{t('empty.title')}</p>
      <p className="text-sm sm:text-base text-muted">{t('empty.description')}</p>
    </div>
  );
}
