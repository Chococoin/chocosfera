import createMiddleware from 'next-intl/middleware';
import { locales } from './i18n';

export default createMiddleware({
  locales,
  defaultLocale: 'en', // Inglés por defecto para idiomas no soportados
  localePrefix: 'always',
  localeDetection: true, // Habilitar detección automática del idioma del navegador
});

export const config = {
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)'],
};
