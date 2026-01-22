'use client';

import { useTranslations } from 'next-intl';
import { Category, Rarity, PaymentMode, Product } from '../data';

interface FiltersSidebarProps {
  showFilters: boolean;
  setShowFilters: (show: boolean) => void;
  categories: Category[];
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
  rarities: Rarity[];
  selectedRarity: string;
  setSelectedRarity: (rarity: string) => void;
  priceRange: [number, number];
  setPriceRange: (range: [number, number]) => void;
  paymentMode: PaymentMode;
}

export function FiltersSidebar({
  showFilters,
  setShowFilters,
  categories,
  selectedCategory,
  setSelectedCategory,
  rarities,
  selectedRarity,
  setSelectedRarity,
  priceRange,
  setPriceRange,
  paymentMode,
}: FiltersSidebarProps) {
  const t = useTranslations('dashboard.marketplace');

  if (!showFilters) return null;

  return (
    <div
      className={`${
        showFilters ? 'fixed inset-0 z-50 bg-black/50 lg:relative lg:bg-transparent' : 'hidden'
      } lg:block`}
      onClick={(e) => {
        if (e.target === e.currentTarget) setShowFilters(false);
      }}
    >
      <div className="fixed lg:relative inset-y-0 left-0 w-[85vw] sm:w-96 lg:w-80 bg-[var(--color-background)] lg:bg-transparent overflow-y-auto space-y-4 sm:space-y-6 flex-shrink-0 p-4 sm:p-0 lg:p-0">
        {/* Close button for mobile */}
        <button
          type="button"
          onClick={() => setShowFilters(false)}
          className="lg:hidden absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-[var(--color-surface)] border border-[var(--color-border)] text-heading"
        >
          ✕
        </button>

        {/* Categories */}
        <div className="surface-panel p-4 sm:p-6">
          <h3 className="text-base sm:text-lg font-bold text-heading mb-3 sm:mb-4" style={{ fontFamily: 'var(--font-heading)' }}>
            {t('filters.categories')}
          </h3>
          <div className="space-y-2">
            {categories.map(category => (
              <button
                key={category.id}
                type="button"
                onClick={() => {
                  setSelectedCategory(category.id);
                  if (window.innerWidth < 1024) setShowFilters(false);
                }}
                className={`w-full flex items-center justify-between p-2.5 sm:p-3 rounded-2xl transition-all ${
                  selectedCategory === category.id
                    ? 'bg-gradient-to-r from-[rgba(223,134,170,0.18)] to-[rgba(87,41,214,0.18)] border border-[rgba(223,134,170,0.35)]'
                    : 'hover:bg-[rgba(223,134,170,0.08)] border border-transparent'
                }`}
              >
                <div className="flex items-center gap-2 sm:gap-3">
                  <span className="text-xl sm:text-2xl">{category.icon}</span>
                  <span className="text-sm sm:text-base font-medium text-heading">{category.name}</span>
                </div>
                <span className="text-xs sm:text-sm text-muted">{category.count}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Rarity Filter */}
        <div className="surface-panel p-4 sm:p-6">
          <h3 className="text-base sm:text-lg font-bold text-heading mb-3 sm:mb-4" style={{ fontFamily: 'var(--font-heading)' }}>
            {t('filters.rarity')}
          </h3>
          <div className="space-y-2">
            {rarities.map(rarity => (
              <button
                key={rarity.id}
                type="button"
                onClick={() => {
                  setSelectedRarity(rarity.id);
                  if (window.innerWidth < 1024) setShowFilters(false);
                }}
                className={`w-full flex items-center justify-between p-2.5 sm:p-3 rounded-2xl transition-all ${
                  selectedRarity === rarity.id
                    ? 'bg-gradient-to-r from-[rgba(223,134,170,0.18)] to-[rgba(87,41,214,0.18)] border border-[rgba(223,134,170,0.35)]'
                    : 'hover:bg-[rgba(223,134,170,0.08)] border border-transparent'
                }`}
              >
                <span className="text-sm sm:text-base font-medium text-heading">{rarity.name}</span>
                {rarity.id !== 'all' && (
                  <span className="text-xl sm:text-2xl">
                    {rarity.color === 'yellow' ? '⭐' :
                     rarity.color === 'purple' ? '💜' :
                     rarity.color === 'blue' ? '💎' : '⚪'}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Price Range */}
        <div className="surface-panel p-4 sm:p-6">
          <h3 className="text-base sm:text-lg font-bold text-heading mb-3 sm:mb-4" style={{ fontFamily: 'var(--font-heading)' }}>
            {t('filters.priceRange')}
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between text-sm text-muted">
              <span>
                {paymentMode === 'fiat' ? '€0' : '0 🪙'}
              </span>
              <span>
                {paymentMode === 'fiat'
                  ? `€${priceRange[1] / 10}`
                  : `${priceRange[1]} 🪙`
                }
              </span>
            </div>
            <input
              type="range"
              min="0"
              max={paymentMode === 'fiat' ? 500 : 1000}
              step={paymentMode === 'fiat' ? 10 : 50}
              value={priceRange[1]}
              onChange={(e) => setPriceRange([0, parseInt(e.target.value)])}
              className="w-full h-2 rounded-full appearance-none cursor-pointer"
              style={{
                background: `linear-gradient(to right, var(--color-primary) 0%, var(--color-primary-alt) ${(priceRange[1] / (paymentMode === 'fiat' ? 500 : 1000)) * 100}%, rgba(0,0,0,0.1) ${(priceRange[1] / (paymentMode === 'fiat' ? 500 : 1000)) * 100}%, rgba(0,0,0,0.1) 100%)`
              }}
            />
            <p className="text-[10px] text-muted text-center">
              {t('filters.filteringBy')} {paymentMode === 'fiat' ? 'EUR' : 'ChocoCoins'}
            </p>
          </div>
        </div>

        {/* Featured Creator */}
        <div className="hidden sm:block relative overflow-hidden rounded-3xl border border-[var(--color-border)] bg-[var(--color-surface)] backdrop-blur-[16px] p-6">
          <div className="absolute inset-0 bg-gradient-to-br from-[rgba(223,134,170,0.15)] to-[rgba(87,41,214,0.15)]" />
          <div className="relative">
            <div className="text-center">
              <div className="text-5xl mb-3">🎨</div>
              <p className="text-sm font-semibold text-heading mb-1">{t('featured.creator')}</p>
              <p className="text-lg font-bold text-heading mb-2">@maria_designs</p>
              <p className="text-xs text-muted">{t('featured.productsCreated', { count: '24' })}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper function to build categories
export function buildCategories(products: Product[], t: (key: string) => string): Category[] {
  return [
    { id: 'all', name: t('categories.all'), icon: '🌟', count: products.length },
    { id: 'trees', name: t('categories.trees'), icon: '🌳', count: products.filter(p => p.type === 'trees').length },
    { id: 'nft', name: t('categories.nft'), icon: '🃏', count: products.filter(p => p.type === 'nft').length },
    { id: 'book', name: t('categories.books'), icon: '📚', count: products.filter(p => p.type === 'book').length },
    { id: 'plush', name: t('categories.plush'), icon: '🧸', count: products.filter(p => p.type === 'plush').length },
    { id: 'chocolate', name: t('categories.chocolate'), icon: '🍫', count: products.filter(p => p.type === 'chocolate').length },
  ];
}

// Helper function to build rarities
export function buildRarities(t: (key: string) => string): Rarity[] {
  return [
    { id: 'all', name: t('rarities.all'), color: 'gray' },
    { id: 'common', name: t('rarities.common'), color: 'gray' },
    { id: 'rare', name: t('rarities.rare'), color: 'blue' },
    { id: 'epic', name: t('rarities.epic'), color: 'purple' },
    { id: 'legendary', name: t('rarities.legendary'), color: 'yellow' },
  ];
}
