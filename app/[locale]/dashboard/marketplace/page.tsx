'use client';

import { useState } from 'react';

interface Product {
  id: string;
  name: string;
  type: 'nft' | 'book' | 'plush' | 'chocolate';
  price: number;
  image: string;
  creator: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  character: string;
  stock?: number;
  sold?: number;
  description: string;
}

export default function MarketplacePage() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000]);
  const [selectedRarity, setSelectedRarity] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(true);

  // Usuario coins
  const userCoins = 850;

  const products: Product[] = [
    // NFT Cards
    {
      id: 'nft-001',
      name: 'Cacao Warrior',
      type: 'nft',
      price: 250,
      image: '🦸‍♂️',
      creator: '@maria_designs',
      rarity: 'legendary',
      character: 'Guerrero del Cacao',
      sold: 3,
      description: 'Carta legendaria de edición limitada',
    },
    {
      id: 'nft-002',
      name: 'Chocolate Fairy',
      type: 'nft',
      price: 180,
      image: '🧚‍♀️',
      creator: '@carlos_art',
      rarity: 'epic',
      character: 'Hada del Chocolate',
      sold: 12,
      description: 'Criatura mágica del bosque de cacao',
    },
    {
      id: 'nft-003',
      name: 'Cocoa Guardian',
      type: 'nft',
      price: 120,
      image: '🛡️',
      creator: '@ana_creative',
      rarity: 'rare',
      character: 'Guardián del Cacao',
      sold: 28,
      description: 'Protector de los árboles sagrados',
    },
    {
      id: 'nft-004',
      name: 'Sweet Dragon',
      type: 'nft',
      price: 300,
      image: '🐉',
      creator: '@pedro_nft',
      rarity: 'legendary',
      character: 'Dragón Dulce',
      sold: 2,
      description: 'El dragón más raro de la colección',
    },
    // Libros para colorear
    {
      id: 'book-001',
      name: 'Aventuras de Cacaito',
      type: 'book',
      price: 45,
      image: '📚',
      creator: '@laura_illustrator',
      rarity: 'common',
      character: 'Cacaito',
      stock: 50,
      description: '32 páginas de aventuras para colorear',
    },
    {
      id: 'book-002',
      name: 'El Reino del Cacao',
      type: 'book',
      price: 55,
      image: '📖',
      creator: '@jose_books',
      rarity: 'common',
      character: 'Rey Cacao',
      stock: 35,
      description: 'Explora el mágico reino del chocolate',
    },
    {
      id: 'book-003',
      name: 'Leyendas Chocolatinas',
      type: 'book',
      price: 65,
      image: '📕',
      creator: '@maria_designs',
      rarity: 'rare',
      character: 'Varios',
      stock: 20,
      description: 'Edición especial con 48 páginas',
    },
    // Peluches
    {
      id: 'plush-001',
      name: 'Peluche Cacaito',
      type: 'plush',
      price: 150,
      image: '🧸',
      creator: '@sofia_crafts',
      rarity: 'rare',
      character: 'Cacaito',
      stock: 15,
      description: 'Peluche de 30cm hecho a mano',
    },
    {
      id: 'plush-002',
      name: 'Mini Hada del Chocolate',
      type: 'plush',
      price: 95,
      image: '🧚',
      creator: '@carmen_toys',
      rarity: 'common',
      character: 'Hada del Chocolate',
      stock: 40,
      description: 'Adorable peluche de 15cm',
    },
    {
      id: 'plush-003',
      name: 'Dragón Dulce Gigante',
      type: 'plush',
      price: 450,
      image: '🐲',
      creator: '@ricardo_plush',
      rarity: 'legendary',
      character: 'Dragón Dulce',
      stock: 3,
      description: 'Peluche premium de 60cm',
    },
    // Chocolates especiales
    {
      id: 'choco-001',
      name: 'Tableta Guerrero',
      type: 'chocolate',
      price: 85,
      image: '🍫',
      creator: '@chocolateria_premium',
      rarity: 'epic',
      character: 'Guerrero del Cacao',
      stock: 25,
      description: 'Chocolate 85% cacao, diseño exclusivo',
    },
    {
      id: 'choco-002',
      name: 'Dulce Hada',
      type: 'chocolate',
      price: 75,
      image: '🍬',
      creator: '@chocolateria_premium',
      rarity: 'rare',
      character: 'Hada del Chocolate',
      stock: 35,
      description: 'Chocolate con leche y frutos rojos',
    },
    {
      id: 'choco-003',
      name: 'Edición Dragón',
      type: 'chocolate',
      price: 120,
      image: '🌟',
      creator: '@chocolateria_premium',
      rarity: 'legendary',
      character: 'Dragón Dulce',
      stock: 10,
      description: 'Set premium con 6 tabletas temáticas',
    },
  ];

  const categories = [
    { id: 'all', name: 'Todos', icon: '🌟', count: products.length },
    { id: 'nft', name: 'Cartas NFT', icon: '🃏', count: products.filter(p => p.type === 'nft').length },
    { id: 'book', name: 'Libros', icon: '📚', count: products.filter(p => p.type === 'book').length },
    { id: 'plush', name: 'Peluches', icon: '🧸', count: products.filter(p => p.type === 'plush').length },
    { id: 'chocolate', name: 'Chocolates', icon: '🍫', count: products.filter(p => p.type === 'chocolate').length },
  ];

  const rarities = [
    { id: 'all', name: 'Todas', color: 'gray' },
    { id: 'common', name: 'Común', color: 'gray' },
    { id: 'rare', name: 'Rara', color: 'blue' },
    { id: 'epic', name: 'Épica', color: 'purple' },
    { id: 'legendary', name: 'Legendaria', color: 'yellow' },
  ];

  const filteredProducts = products.filter(product => {
    const categoryMatch = selectedCategory === 'all' || product.type === selectedCategory;
    const priceMatch = product.price >= priceRange[0] && product.price <= priceRange[1];
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
            Productos únicos de la comunidad
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="surface-panel px-4 py-2 sm:px-6 sm:py-3 flex-1 sm:flex-initial">
            <div className="flex items-center gap-2 sm:gap-3">
              <span className="text-2xl sm:text-3xl">🪙</span>
              <div>
                <p className="text-[10px] sm:text-xs text-muted">Tus ChocoCoins</p>
                <p className="text-xl sm:text-2xl font-bold text-heading" style={{ fontFamily: 'var(--font-heading)' }}>
                  {userCoins}
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
                Categorías
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
                Rareza
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
                Rango de Precio
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between text-sm text-muted">
                  <span>{priceRange[0]} 🪙</span>
                  <span>{priceRange[1]} 🪙</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1000"
                  step="50"
                  value={priceRange[1]}
                  onChange={(e) => setPriceRange([0, parseInt(e.target.value)])}
                  className="w-full h-2 rounded-full appearance-none cursor-pointer"
                  style={{
                    background: `linear-gradient(to right, var(--color-primary) 0%, var(--color-primary-alt) ${(priceRange[1] / 1000) * 100}%, rgba(0,0,0,0.1) ${(priceRange[1] / 1000) * 100}%, rgba(0,0,0,0.1) 100%)`
                  }}
                />
              </div>
            </div>

            {/* Featured Creator */}
            <div className="hidden sm:block relative overflow-hidden rounded-3xl border border-[var(--color-border)] bg-[var(--color-surface)] backdrop-blur-[16px] p-6">
              <div className="absolute inset-0 bg-gradient-to-br from-[rgba(223,134,170,0.15)] to-[rgba(87,41,214,0.15)]" />
              <div className="relative">
                <div className="text-center">
                  <div className="text-5xl mb-3">🎨</div>
                  <p className="text-sm font-semibold text-heading mb-1">Creador Destacado</p>
                  <p className="text-lg font-bold text-heading mb-2">@maria_designs</p>
                  <p className="text-xs text-muted">24 productos creados</p>
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
              {filteredProducts.length} productos
            </p>
            <select className="px-3 py-2 sm:px-4 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] text-heading text-xs sm:text-sm focus:outline-none cursor-pointer">
              <option>Más recientes</option>
              <option>Precio: Menor a Mayor</option>
              <option>Precio: Mayor a Menor</option>
              <option>Más populares</option>
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
                      <span className="text-muted">Por</span>
                      <span className="font-semibold text-heading truncate">{product.creator}</span>
                    </div>
                  </div>

                  {/* Stock/Sold */}
                  {product.stock !== undefined && (
                    <div className="flex items-center gap-1.5 sm:gap-2 text-[11px] sm:text-xs text-muted">
                      <span>📦</span>
                      <span>{product.stock} disponibles</span>
                    </div>
                  )}
                  {product.sold !== undefined && (
                    <div className="flex items-center gap-1.5 sm:gap-2 text-[11px] sm:text-xs text-muted">
                      <span>🔥</span>
                      <span>{product.sold} vendidos</span>
                    </div>
                  )}

                  {/* Price and Buy Button */}
                  <div className="flex items-center justify-between pt-2 sm:pt-3 border-t border-[var(--color-border)]">
                    <div className="flex items-center gap-1.5 sm:gap-2">
                      <span className="text-xl sm:text-2xl">🪙</span>
                      <span className="text-xl sm:text-2xl font-bold text-heading" style={{ fontFamily: 'var(--font-heading)' }}>
                        {product.price}
                      </span>
                    </div>
                    <button
                      type="button"
                      disabled={userCoins < product.price}
                      className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-2xl text-xs sm:text-sm font-semibold transition-all ${
                        userCoins >= product.price
                          ? 'bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary-alt)] text-white hover:scale-105 shadow-lg'
                          : 'bg-gray-300 dark:bg-gray-700 text-gray-500 cursor-not-allowed'
                      }`}
                    >
                      {userCoins >= product.price ? 'Comprar' : 'Sin coins'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredProducts.length === 0 && (
            <div className="text-center py-12 sm:py-20">
              <div className="text-5xl sm:text-6xl mb-3 sm:mb-4">🔍</div>
              <p className="text-lg sm:text-xl font-semibold text-heading mb-2">No hay productos</p>
              <p className="text-sm sm:text-base text-muted">Intenta ajustar los filtros</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
