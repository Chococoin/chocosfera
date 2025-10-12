import type { Metadata } from "next";
import Script from 'next/script';
import { Outfit, Plus_Jakarta_Sans } from "next/font/google";
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { isSupportedLocale } from '@/i18n';
import ScrollToTop from './components/ScrollToTop';
import "./globals.css";

const outfit = Outfit({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const plusJakarta = Plus_Jakarta_Sans({
  variable: "--font-heading",
  subsets: ["latin"],
  weight: ["600", "700", "800"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Chocósfera",
  description: "Descubre el mundo donde el chocolate, la tecnología blockchain y la justicia social se unen para crear un impacto positivo.",
};

export default async function RootLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  const { locale } = await params;

  if (!isSupportedLocale(locale)) {
    notFound();
  }

  const messages = await getMessages({ locale });

  return (
    <html lang={locale} suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if (typeof window !== 'undefined') {
                history.scrollRestoration = 'manual';
                window.scrollTo(0, 0);

                // Detectar Safari inmediatamente
                const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
                if (isSafari) {
                  document.documentElement.classList.add('is-safari');
                }
              }
            `,
          }}
        />
      </head>
      <body
        className={`${outfit.variable} ${plusJakarta.variable} antialiased theme-root`}
        suppressHydrationWarning
      >
        <Script src="/theme-init.js" strategy="beforeInteractive" />
        <ScrollToTop />
        <NextIntlClientProvider messages={messages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
