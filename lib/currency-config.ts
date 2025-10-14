export type SupportedCurrency = 'EUR' | 'USD' | 'GBP' | 'JPY' | 'CNY';
export type SupportedLocale = 'es' | 'en' | 'it' | 'fr' | 'de' | 'pt' | 'ro' | 'ja' | 'zh';

export interface CurrencyInfo {
  code: SupportedCurrency;
  symbol: string;
  name: string;
  decimalPlaces: number;
  locale: string; // For Intl.NumberFormat
}

// Currency definitions
export const currencies: Record<SupportedCurrency, CurrencyInfo> = {
  EUR: {
    code: 'EUR',
    symbol: '€',
    name: 'Euro',
    decimalPlaces: 2,
    locale: 'es-ES',
  },
  USD: {
    code: 'USD',
    symbol: '$',
    name: 'US Dollar',
    decimalPlaces: 2,
    locale: 'en-US',
  },
  GBP: {
    code: 'GBP',
    symbol: '£',
    name: 'British Pound',
    decimalPlaces: 2,
    locale: 'en-GB',
  },
  JPY: {
    code: 'JPY',
    symbol: '¥',
    name: 'Japanese Yen',
    decimalPlaces: 0,
    locale: 'ja-JP',
  },
  CNY: {
    code: 'CNY',
    symbol: '¥',
    name: 'Chinese Yuan',
    decimalPlaces: 2,
    locale: 'zh-CN',
  },
};

// Locale to currency mapping
export const localeToCurrency: Record<SupportedLocale, SupportedCurrency> = {
  es: 'EUR', // Spain → Euro
  it: 'EUR', // Italy → Euro
  fr: 'EUR', // France → Euro
  de: 'EUR', // Germany → Euro
  pt: 'EUR', // Portugal → Euro
  ro: 'EUR', // Romania → Euro (planning to adopt)
  en: 'USD', // English (generic) → US Dollar
  ja: 'JPY', // Japan → Yen
  zh: 'CNY', // China → Yuan
};

// Price conversion rates (base: EUR)
// These can be updated regularly or fetched from an API
export const conversionRates: Record<SupportedCurrency, number> = {
  EUR: 1.0,
  USD: 1.08, // 1 EUR = 1.08 USD
  GBP: 0.86, // 1 EUR = 0.86 GBP
  JPY: 163.0, // 1 EUR = 163 JPY
  CNY: 7.85, // 1 EUR = 7.85 CNY
};

/**
 * Get currency for a given locale
 */
export function getCurrencyForLocale(locale: string): SupportedCurrency {
  const baseLocale = locale.split('-')[0] as SupportedLocale;
  return localeToCurrency[baseLocale] || 'EUR'; // Default to EUR
}

/**
 * Format price according to currency and locale
 */
export function formatPrice(
  amount: number,
  currency: SupportedCurrency,
  locale?: string
): string {
  const currencyInfo = currencies[currency];
  const formatLocale = locale || currencyInfo.locale;

  return new Intl.NumberFormat(formatLocale, {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: currencyInfo.decimalPlaces,
    maximumFractionDigits: currencyInfo.decimalPlaces,
  }).format(amount);
}

/**
 * Convert EUR base price to target currency
 */
export function convertPrice(
  eurPrice: number,
  targetCurrency: SupportedCurrency
): number {
  const rate = conversionRates[targetCurrency];
  const converted = eurPrice * rate;

  // Round to appropriate decimal places
  const decimalPlaces = currencies[targetCurrency].decimalPlaces;
  return Math.round(converted * Math.pow(10, decimalPlaces)) / Math.pow(10, decimalPlaces);
}

/**
 * Get price in all supported currencies
 */
export function getPriceInAllCurrencies(eurPrice: number): Record<SupportedCurrency, number> {
  return {
    EUR: eurPrice,
    USD: convertPrice(eurPrice, 'USD'),
    GBP: convertPrice(eurPrice, 'GBP'),
    JPY: convertPrice(eurPrice, 'JPY'),
    CNY: convertPrice(eurPrice, 'CNY'),
  };
}

/**
 * Get Stripe currency code (lowercase as required by Stripe)
 */
export function getStripeCurrency(currency: SupportedCurrency): string {
  return currency.toLowerCase();
}

/**
 * Convert amount to Stripe's smallest unit (cents for EUR/USD, yen for JPY)
 */
export function toStripeAmount(amount: number, currency: SupportedCurrency): number {
  const decimalPlaces = currencies[currency].decimalPlaces;
  return Math.round(amount * Math.pow(10, decimalPlaces));
}

/**
 * Convert from Stripe's smallest unit to decimal amount
 */
export function fromStripeAmount(amount: number, currency: SupportedCurrency): number {
  const decimalPlaces = currencies[currency].decimalPlaces;
  return amount / Math.pow(10, decimalPlaces);
}
