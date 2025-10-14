import type React from 'react';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import DashboardProtectedLayout from './components/DashboardProtectedLayout';

export default async function DashboardLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const messages = await getMessages({ locale });

  return (
    <NextIntlClientProvider messages={messages}>
      <DashboardProtectedLayout>
        {children}
      </DashboardProtectedLayout>
    </NextIntlClientProvider>
  );
}
