import type { Metadata } from "next";
import Script from 'next/script';
import { Epilogue } from "next/font/google";
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { locales, type Locale } from '@/i18n';
import "./globals.css";

const epilogue = Epilogue({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400", "500", "700", "900"],
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
  params: { locale: string };
}>) {
  const { locale } = params;

  if (!locales.includes(locale as Locale)) {
    notFound();
  }

  const messages = await getMessages({ locale });

  return (
    <html lang={locale} suppressHydrationWarning>
      <head>
        <Script src="/theme-init.js" strategy="beforeInteractive" />
      </head>
      <body className={`${epilogue.variable} antialiased`} suppressHydrationWarning>
        <NextIntlClientProvider messages={messages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
