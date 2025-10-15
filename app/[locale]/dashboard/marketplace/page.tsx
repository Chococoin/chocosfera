'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';

interface Product {
  id: string;
  name: string;
  type: 'nft' | 'book' | 'plush' | 'chocolate' | 'trees';
  priceEUR: number; // Price in EUR (primary - for Stripe)
  priceCoins: number; // Price in ChocoCoins (secondary - for wallet)
  image: string;
  creator: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  character: string;
  stock?: number;
  sold?: number;
  description: string;
}

export default function MarketplacePage() {
  const t = useTranslations('dashboard.marketplace');
  const searchParams = useSearchParams();
  const categoryParam = searchParams.get('category');
  const locale = useLocale();

  const [selectedCategory, setSelectedCategory] = useState<string>(categoryParam || 'all');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000]);
  const [selectedRarity, setSelectedRarity] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(true);
  const [paymentMode, setPaymentMode] = useState<'fiat' | 'chococoins'>('fiat'); // Primary: fiat, Secondary: chococoins

  // Update category when URL param changes
  useEffect(() => {
    if (categoryParam) {
      setSelectedCategory(categoryParam);
    }
  }, [categoryParam]);

  // Usuario data (mock - in production will come from session/auth)
  const userCoins = 850; // ChocoCoins balance
  const userFiatBalance = 45.0; // EUR balance
  const userEmail = 'maria@example.com'; // Pre-filled in Stripe
  const userName = 'María García'; // For metadata

  // Function to handle Stripe checkout
  const handleStripeCheckout = async (product: Product) => {
    try {
      const response = await fetch('/api/stripe/create-marketplace-checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productId: product.id,
          productName: product.name,
          productType: product.type,
          priceEUR: product.priceEUR,
          locale,
          userEmail, // Pre-fill email in Stripe Checkout
          userName, // For Stripe metadata
        }),
      });

      const data = await response.json();

      if (data.url) {
        // Redirect to Stripe Checkout
        window.location.href = data.url;
      } else {
        alert(t('errors.createSession'));
      }
    } catch (error) {
      console.error('Error:', error);
      alert(t('errors.processPayment'));
    }
  };

  const products: Product[] = [
    // NFT Cards
    {
      id: 'nft-001',
      name: t('products.nft001.name'),
      type: 'nft',
      priceEUR: 25.0,
      priceCoins: 250,
      image: '🦸‍♂️',
      creator: '@maria_designs',
      rarity: 'legendary',
      character: t('products.nft001.character'),
      sold: 3,
      description: t('products.nft001.description'),
    },
    {
      id: 'nft-002',
      name: t('products.nft002.name'),
      type: 'nft',
      priceEUR: 18.0,
      priceCoins: 180,
      image: '🧚‍♀️',
      creator: '@carlos_art',
      rarity: 'epic',
      character: t('products.nft002.character'),
      sold: 12,
      description: t('products.nft002.description'),
    },
    {
      id: 'nft-003',
      name: t('products.nft003.name'),
      type: 'nft',
      priceEUR: 12.0,
      priceCoins: 120,
      image: '🛡️',
      creator: '@ana_creative',
      rarity: 'rare',
      character: t('products.nft003.character'),
      sold: 28,
      description: t('products.nft003.description'),
    },
    {
      id: 'nft-004',
      name: t('products.nft004.name'),
      type: 'nft',
      priceEUR: 30.0,
      priceCoins: 300,
      image: '🐉',
      creator: '@pedro_nft',
      rarity: 'legendary',
      character: t('products.nft004.character'),
      sold: 2,
      description: t('products.nft004.description'),
    },
    // Libros para colorear
    {
      id: 'book-001',
      name: t('products.book001.name'),
      type: 'book',
      priceEUR: 4.5,
      priceCoins: 45,
      image: '📚',
      creator: '@laura_illustrator',
      rarity: 'common',
      character: t('products.book001.character'),
      stock: 50,
      description: t('products.book001.description'),
    },
    {
      id: 'book-002',
      name: t('products.book002.name'),
      type: 'book',
      priceEUR: 5.5,
      priceCoins: 55,
      image: '📖',
      creator: '@jose_books',
      rarity: 'common',
      character: t('products.book002.character'),
      stock: 35,
      description: t('products.book002.description'),
    },
    {
      id: 'book-003',
      name: t('products.book003.name'),
      type: 'book',
      priceEUR: 6.5,
      priceCoins: 65,
      image: '📕',
      creator: '@maria_designs',
      rarity: 'rare',
      character: t('products.book003.character'),
      stock: 20,
      description: t('products.book003.description'),
    },
    // Peluches
    {
      id: 'plush-001',
      name: t('products.plush001.name'),
      type: 'plush',
      priceEUR: 15.0,
      priceCoins: 150,
      image: '🧸',
      creator: '@sofia_crafts',
      rarity: 'rare',
      character: t('products.plush001.character'),
      stock: 15,
      description: t('products.plush001.description'),
    },
    {
      id: 'plush-002',
      name: t('products.plush002.name'),
      type: 'plush',
      priceEUR: 9.5,
      priceCoins: 95,
      image: '🧚',
      creator: '@carmen_toys',
      rarity: 'common',
      character: t('products.plush002.character'),
      stock: 40,
      description: t('products.plush002.description'),
    },
    {
      id: 'plush-003',
      name: t('products.plush003.name'),
      type: 'plush',
      priceEUR: 45.0,
      priceCoins: 450,
      image: '🐲',
      creator: '@ricardo_plush',
      rarity: 'legendary',
      character: t('products.plush003.character'),
      stock: 3,
      description: t('products.plush003.description'),
    },
    // Chocolates especiales
    {
      id: 'choco-001',
      name: t('products.choco001.name'),
      type: 'chocolate',
      priceEUR: 8.5,
      priceCoins: 85,
      image: '🍫',
      creator: '@chocolateria_premium',
      rarity: 'epic',
      character: t('products.choco001.character'),
      stock: 25,
      description: t('products.choco001.description'),
    },
    {
      id: 'choco-002',
      name: t('products.choco002.name'),
      type: 'chocolate',
      priceEUR: 7.5,
      priceCoins: 75,
      image: '🍬',
      creator: '@chocolateria_premium',
      rarity: 'rare',
      character: t('products.choco002.character'),
      stock: 35,
      description: t('products.choco002.description'),
    },
    {
      id: 'choco-003',
      name: t('products.choco003.name'),
      type: 'chocolate',
      priceEUR: 12.0,
      priceCoins: 120,
      image: '🌟',
      creator: '@chocolateria_premium',
      rarity: 'legendary',
      character: t('products.choco003.character'),
      stock: 10,
      description: t('products.choco003.description'),
    },
    // Árboles de cacao para adopción
    {
      id: 'tree-001',
      name: t('products.tree001.name'),
      type: 'trees',
      priceEUR: 2.99,
      priceCoins: 30,
      image: '🌱',
      creator: '@chocosfera_farm',
      rarity: 'common',
      character: t('products.tree001.character'),
      stock: 15,
      description: t('products.tree001.description'),
    },
    {
      id: 'tree-002',
      name: t('products.tree002.name'),
      type: 'trees',
      priceEUR: 4.99,
      priceCoins: 50,
      image: '🌳',
      creator: '@chocosfera_farm',
      rarity: 'rare',
      character: t('products.tree002.character'),
      stock: 8,
      description: t('products.tree002.description'),
    },
    {
      id: 'tree-003',
      name: t('products.tree003.name'),
      type: 'trees',
      priceEUR: 6.99,
      priceCoins: 70,
      image: '🌳',
      creator: '@chocosfera_farm',
      rarity: 'epic',
      character: t('products.tree003.character'),
      stock: 5,
      description: t('products.tree003.description'),
    },
    {
      id: 'tree-004',
      name: t('products.tree004.name'),
      type: 'trees',
      priceEUR: 8.99,
      priceCoins: 90,
      image: '🌳',
      creator: '@chocosfera_farm',
      rarity: 'legendary',
      character: t('products.tree004.character'),
      stock: 2,
      description: t('products.tree004.description'),
    },
    {
      id: 'tree-005',
      name: t('products.tree005.name'),
      type: 'trees',
      priceEUR: 3.99,
      priceCoins: 40,
      image: '🌿',
      creator: '@chocosfera_farm',
      rarity: 'common',
      character: t('products.tree005.character'),
      stock: 12,
      description: t('products.tree005.description'),
    },
    {
      id: 'tree-006',
      name: t('products.tree006.name'),
      type: 'trees',
      priceEUR: 5.99,
      priceCoins: 60,
      image: '🌳',
      creator: '@chocosfera_farm',
      rarity: 'rare',
      character: t('products.tree006.character'),
      stock: 6,
      description: t('products.tree006.description'),
    },
  ];

  const categories = [
    { id: 'all', name: t('categories.all'), icon: '🌟', count: products.length },
    { id: 'trees', name: t('categories.trees'), icon: '🌳', count: products.filter(p => p.type === 'trees').length },
    { id: 'nft', name: t('categories.nft'), icon: '🃏', count: products.filter(p => p.type === 'nft').length },
    { id: 'book', name: t('categories.books'), icon: '📚', count: products.filter(p => p.type === 'book').length },
    { id: 'plush', name: t('categories.plush'), icon: '🧸', count: products.filter(p => p.type === 'plush').length },
    { id: 'chocolate', name: t('categories.chocolate'), icon: '🍫', count: products.filter(p => p.type === 'chocolate').length },
  ];

  const rarities = [
    { id: 'all', name: t('rarities.all'), color: 'gray' },
    { id: 'common', name: t('rarities.common'), color: 'gray' },
    { id: 'rare', name: t('rarities.rare'), color: 'blue' },
    { id: 'epic', name: t('rarities.epic'), color: 'purple' },
    { id: 'legendary', name: t('rarities.legendary'), color: 'yellow' },
  ];

  const filteredProducts = products.filter(product => {
    const categoryMatch = selectedCategory === 'all' || product.type === selectedCategory;

    // Price matching depends on payment mode
    const productPrice = paymentMode === 'fiat' ? product.priceEUR * 10 : product.priceCoins;
    const priceMatch = productPrice >= priceRange[0] && productPrice <= priceRange[1];

    const rarityMatch = selectedRarity === 'all' || product.rarity === selectedRarity;
    return categoryMatch && priceMatch && rarityMatch;
  });

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

  return (
    <div className="p-3 sm:p-6 space-y-4 sm:space-y-6">
      {/* Header */}
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

      {/* Main Layout */}
      <div className="flex flex-col lg:flex-row gap-4 sm:gap-6">
        {/* Filters Sidebar */}
        {showFilters && (
          <div className={`${
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
                      <span className={`text-xl sm:text-2xl ${
                        rarity.color === 'yellow' ? '⭐' :
                        rarity.color === 'purple' ? '💜' :
                        rarity.color === 'blue' ? '💎' : '⚪'
                      }`}>
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
        )}

        {/* Products Grid */}
        <div className="flex-1">
          <div className="mb-3 sm:mb-4 flex flex-col sm:flex-row sm:items-center gap-2 sm:justify-between">
            <p className="text-xs sm:text-sm text-muted">
              {filteredProducts.length} {t('products')}
            </p>
            <select className="px-3 py-2 sm:px-4 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] text-heading text-xs sm:text-sm focus:outline-none cursor-pointer">
              <option>{t('sort.newest')}</option>
              <option>{t('sort.priceLowHigh')}</option>
              <option>{t('sort.priceHighLow')}</option>
              <option>{t('sort.popular')}</option>
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-6">
            {filteredProducts.map(product => (
              <div
                key={product.id}
                className="surface-panel p-4 sm:p-6 hover:scale-[1.02] transition-all group cursor-pointer"
              >
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
                      disabled={paymentMode === 'chococoins' && userCoins < product.priceCoins}
                      onClick={() => {
                        if (paymentMode === 'fiat') {
                          handleStripeCheckout(product);
                        } else {
                          alert(t('product.buyingWithCoins', { coins: product.priceCoins }));
                          // TODO: Purchase with ChocoCoins from wallet
                        }
                      }}
                      className={`w-full px-3 py-2 rounded-2xl text-xs sm:text-sm font-semibold transition-all ${
                        (paymentMode === 'chococoins' && userCoins >= product.priceCoins) ||
                        paymentMode === 'fiat'
                          ? 'bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary-alt)] text-white hover:scale-105 shadow-lg'
                          : 'bg-gray-300 dark:bg-gray-700 text-gray-500 cursor-not-allowed'
                      }`}
                    >
                      {paymentMode === 'fiat'
                        ? `${t('product.buy')} €${product.priceEUR.toFixed(2)}`
                        : userCoins >= product.priceCoins
                          ? `${t('product.buy')} ${product.priceCoins} 🪙`
                          : t('product.noCoins')
                      }
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredProducts.length === 0 && (
            <div className="text-center py-12 sm:py-20">
              <div className="text-5xl sm:text-6xl mb-3 sm:mb-4">🔍</div>
              <p className="text-lg sm:text-xl font-semibold text-heading mb-2">{t('empty.title')}</p>
              <p className="text-sm sm:text-base text-muted">{t('empty.description')}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
