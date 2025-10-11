import { getRequestConfig } from 'next-intl/server';
import { notFound } from 'next/navigation';

export const locales = ['es', 'en', 'it', 'fr', 'de', 'pt', 'ro', 'ja', 'zh'] as const;
export type Locale = (typeof locales)[number];

export default getRequestConfig(async ({ requestLocale }) => {
  // Obtener el locale desde requestLocale (puede ser Promise en Next.js 15)
  let locale = await requestLocale;

  // Validar que el locale sea válido
  if (!locale || !locales.includes(locale as Locale)) {
    notFound();
  }

  return {
    locale,
    messages: (await import(`./messages/${locale}.json`)).default,
  };
});
