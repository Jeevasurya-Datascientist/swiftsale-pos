
import type { Metadata } from 'next';
import { GeistSans } from 'geist/font/sans';
import './globals.css';
import { SettingsProvider } from '@/context/SettingsContext';
import { LayoutRenderer } from '@/components/layout/LayoutRenderer'; // New component to handle path-based rendering

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
          <LayoutRenderer>{children}</LayoutRenderer>
        </SettingsProvider>
      </body>
    </html>
  );
}
