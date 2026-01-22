'use client';

import { useTranslations } from 'next-intl';
import { Product, PaymentMode } from '../data';

interface ProductCardProps {
  product: Product;
  paymentMode: PaymentMode;
  userCoins: number;
  onBuy: (product: Product) => void;
}

export function ProductCard({ product, paymentMode, userCoins, onBuy }: ProductCardProps) {
  const t = useTranslations('dashboard.marketplace');

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'text-gray-600 dark:text-gray-400 border-gray-400';
      case 'rare': return 'text-blue-600 dark:text-blue-400 border-blue-400';
      case 'epic': return 'text-purple-600 dark:text-purple-400 border-purple-400';
      case 'legendary': return 'text-yellow-600 dark:text-yellow-400 border-yellow-400';
      default: return '';
    }
  };

  const getRarityBg = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'from-gray-500/20 to-gray-600/10';
      case 'rare': return 'from-blue-500/20 to-blue-600/10';
      case 'epic': return 'from-purple-500/20 to-purple-600/10';
      case 'legendary': return 'from-yellow-500/20 to-yellow-600/10';
      default: return '';
    }
  };

  const canAfford = paymentMode === 'fiat' || userCoins >= product.priceCoins;

  return (
    <div className="surface-panel p-4 sm:p-6 hover:scale-[1.02] transition-all group cursor-pointer">
      {/* Product Image/Icon */}
      <div className={`relative mb-3 sm:mb-4 h-40 sm:h-48 rounded-2xl bg-gradient-to-br ${getRarityBg(product.rarity)} flex items-center justify-center overflow-hidden`}>
        <span className="text-6xl sm:text-8xl group-hover:scale-110 transition-transform">
          {product.image}
        </span>
        {product.rarity !== 'common' && (
          <div className={`absolute top-2 right-2 sm:top-3 sm:right-3 px-2 py-0.5 sm:px-3 sm:py-1 rounded-full text-[10px] sm:text-xs font-bold border ${getRarityColor(product.rarity)} bg-white/90 dark:bg-black/90`}>
            {product.rarity === 'legendary' && '⭐ '}
            {product.rarity === 'epic' && '💜 '}
            {product.rarity === 'rare' && '💎 '}
            {product.rarity.toUpperCase()}
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="space-y-2 sm:space-y-3">
        <div>
          <h3 className="text-base sm:text-lg font-bold text-heading mb-1" style={{ fontFamily: 'var(--font-heading)' }}>
            {product.name}
          </h3>
          <p className="text-[11px] sm:text-xs text-muted mb-2 line-clamp-2">{product.description}</p>
          <div className="flex items-center gap-1.5 sm:gap-2 text-[11px] sm:text-xs">
            <span className="text-muted">{t('product.by')}</span>
            <span className="font-semibold text-heading truncate">{product.creator}</span>
          </div>
        </div>

        {/* Stock/Sold */}
        {product.stock !== undefined && (
          <div className="flex items-center gap-1.5 sm:gap-2 text-[11px] sm:text-xs text-muted">
            <span>📦</span>
            <span>{product.stock} {t('product.available')}</span>
          </div>
        )}
        {product.sold !== undefined && (
          <div className="flex items-center gap-1.5 sm:gap-2 text-[11px] sm:text-xs text-muted">
            <span>🔥</span>
            <span>{product.sold} {t('product.sold')}</span>
          </div>
        )}

        {/* Price and Buy Button */}
        <div className="pt-2 sm:pt-3 border-t border-[var(--color-border)] space-y-2">
          {/* Primary Price (according to payment mode) */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <span className="text-xl sm:text-2xl">
                {paymentMode === 'fiat' ? '💳' : '🪙'}
              </span>
              <span className="text-xl sm:text-2xl font-bold text-heading" style={{ fontFamily: 'var(--font-heading)' }}>
                {paymentMode === 'fiat'
                  ? `€${product.priceEUR.toFixed(2)}`
                  : `${product.priceCoins}`
                }
              </span>
            </div>
            {/* Secondary Price (alternative) */}
            <span className="text-[10px] sm:text-xs text-muted">
              {t('product.or')} {paymentMode === 'fiat'
                ? `${product.priceCoins} 🪙`
                : `€${product.priceEUR.toFixed(2)}`
              }
            </span>
          </div>

          {/* Buy Button */}
          <button
            type="button"
            disabled={!canAfford}
            onClick={() => onBuy(product)}
            className={`w-full px-3 py-2 rounded-2xl text-xs sm:text-sm font-semibold transition-all ${
              canAfford
                ? 'bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary-alt)] text-white hover:scale-105 shadow-lg'
                : 'bg-gray-300 dark:bg-gray-700 text-gray-500 cursor-not-allowed'
            }`}
          >
            {paymentMode === 'fiat'
              ? `${t('product.buy')} €${product.priceEUR.toFixed(2)}`
              : canAfford
                ? `${t('product.buy')} ${product.priceCoins} 🪙`
                : t('product.noCoins')
            }
          </button>
        </div>
      </div>
    </div>
  );
}
