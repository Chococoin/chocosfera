import { getRequestConfig } from 'next-intl/server';
import { notFound } from 'next/navigation';

export const locales = ['es', 'en', 'it', 'fr', 'de', 'pt', 'ro', 'ja', 'zh'] as const;
export type Locale = (typeof locales)[number];

const isSupportedLocale = (value: string): value is Locale =>
  locales.includes(value as Locale);

export default getRequestConfig(async ({ requestLocale }) => {
  // Obtener el locale desde requestLocale (puede ser Promise en Next.js 15)
  const locale = await requestLocale;

  // Validar que el locale sea válido
  if (!locale || !isSupportedLocale(locale)) {
    notFound();
  }

  return {
    locale,
    messages: (await import(`./messages/${locale}.json`)).default,
  };
});
