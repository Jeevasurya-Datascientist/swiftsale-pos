
import type { Metadata } from 'next';
import { GeistSans } from 'geist/font/sans';
import './globals.css';
import { SettingsProvider } from '@/context/SettingsContext';
import { NotificationProvider } from '@/context/NotificationContext'; // Import NotificationProvider
import { LayoutRenderer } from '@/components/layout/LayoutRenderer'; 

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
          <NotificationProvider> {/* Wrap with NotificationProvider */}
            <LayoutRenderer>{children}</LayoutRenderer>
          </NotificationProvider>
        </SettingsProvider>
      </body>
    </html>
  );
}
