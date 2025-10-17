import { getRequestConfig } from 'next-intl/server';

export const locales = ['es', 'en', 'it', 'fr', 'de', 'pt', 'ro', 'ja', 'zh'] as const;
export type Locale = (typeof locales)[number];

export const isSupportedLocale = (value: string): value is Locale =>
  locales.includes(value as Locale);

export default getRequestConfig(async ({ requestLocale }) => {
  // Obtener el locale desde requestLocale (puede ser Promise en Next.js 15)
  let locale = await requestLocale;

  // Si el locale no es válido, usar el locale por defecto
  // El middleware ya maneja la redirección, aquí solo cargamos los mensajes
  if (!locale || !isSupportedLocale(locale)) {
    locale = 'en';
  }

  return {
    locale,
    messages: (await import(`./messages/${locale}.json`)).default,
  };
});
