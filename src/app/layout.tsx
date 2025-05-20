import type { Metadata } from 'next';
import { GeistSans } from 'geist/font/sans';
import './globals.css';
import { AppLayout } from '@/components/layout/AppLayout';
import { Toaster } from "@/components/ui/toaster";
import { SettingsProvider } from '@/context/SettingsContext';

export const metadata: Metadata = {
  title: 'SwiftSale POS',
  description: 'Modern POS Billing Software',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${GeistSans.variable} font-sans antialiased`} suppressHydrationWarning={true}>
        <SettingsProvider>
          <AppLayout>
            {children}
          </AppLayout>
          <Toaster />
        </SettingsProvider>
      </body>
    </html>
  );
}
