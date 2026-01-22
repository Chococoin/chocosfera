'use client';

import { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { getProducts, PaymentMode, Product } from './data';
import {
  MarketplaceHeader,
  FiltersSidebar,
  ProductGrid,
  buildCategories,
  buildRarities,
} from './components';

export default function MarketplacePage() {
  const t = useTranslations('dashboard.marketplace');
  const searchParams = useSearchParams();
  const categoryParam = searchParams.get('category');
  const locale = useLocale();

  // Filter states
  const [selectedCategory, setSelectedCategory] = useState<string>(categoryParam || 'all');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000]);
  const [selectedRarity, setSelectedRarity] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(true);
  const [paymentMode, setPaymentMode] = useState<PaymentMode>('fiat');

  // User data (mock - in production will come from session/auth)
  const userCoins = 850;
  const userFiatBalance = 45.0;
  const userEmail = 'maria@example.com';
  const userName = 'María García';

  // Update category when URL param changes
  useEffect(() => {
    if (categoryParam) {
      setSelectedCategory(categoryParam);
    }
  }, [categoryParam]);

  // Build products, categories, and rarities with translations
  const products = useMemo(() => getProducts(t), [t]);
  const categories = useMemo(() => buildCategories(products, t), [products, t]);
  const rarities = useMemo(() => buildRarities(t), [t]);

  // Filter products
  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      const categoryMatch = selectedCategory === 'all' || product.type === selectedCategory;

      // Price matching depends on payment mode
      const productPrice = paymentMode === 'fiat' ? product.priceEUR * 10 : product.priceCoins;
      const priceMatch = productPrice >= priceRange[0] && productPrice <= priceRange[1];

      const rarityMatch = selectedRarity === 'all' || product.rarity === selectedRarity;
      return categoryMatch && priceMatch && rarityMatch;
    });
  }, [products, selectedCategory, paymentMode, priceRange, selectedRarity]);

  // Handle Stripe checkout
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
          userEmail,
          userName,
        }),
      });

      const data = await response.json();

      if (data.url) {
        window.location.href = data.url;
      } else {
        alert(t('errors.createSession'));
      }
    } catch (error) {
      console.error('Error:', error);
      alert(t('errors.processPayment'));
    }
  };

  // Handle buy action
  const handleBuy = (product: Product) => {
    if (paymentMode === 'fiat') {
      handleStripeCheckout(product);
    } else {
      alert(t('product.buyingWithCoins', { coins: product.priceCoins }));
      // TODO: Purchase with ChocoCoins from wallet
    }
  };

  return (
    <div className="p-3 sm:p-6 space-y-4 sm:space-y-6">
      <MarketplaceHeader
        paymentMode={paymentMode}
        setPaymentMode={setPaymentMode}
        userFiatBalance={userFiatBalance}
        userCoins={userCoins}
        showFilters={showFilters}
        setShowFilters={setShowFilters}
      />

      {/* Main Layout */}
      <div className="flex flex-col lg:flex-row gap-4 sm:gap-6">
        <FiltersSidebar
          showFilters={showFilters}
          setShowFilters={setShowFilters}
          categories={categories}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          rarities={rarities}
          selectedRarity={selectedRarity}
          setSelectedRarity={setSelectedRarity}
          priceRange={priceRange}
          setPriceRange={setPriceRange}
          paymentMode={paymentMode}
        />

        <ProductGrid
          products={filteredProducts}
          paymentMode={paymentMode}
          userCoins={userCoins}
          onBuy={handleBuy}
        />
      </div>
    </div>
  );
}
