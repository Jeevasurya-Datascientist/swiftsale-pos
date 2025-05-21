
"use client";

import { usePathname, useRouter } from 'next/navigation';
import type { ReactNode } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Toaster } from "@/components/ui/toaster";
import { useEffect, useState } from 'react';

export function LayoutRenderer({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (isClient) {
      const isAuthenticated = localStorage.getItem('isAuthenticated');
      const isAuthPagePath = pathname === '/login' || pathname === '/register' || pathname === '/forgot-password' || pathname === '/reset-password';

      if (isAuthenticated !== 'true' && !isAuthPagePath) {
        router.push('/register');
      } else {
        setAuthChecked(true);
      }
    }
  }, [pathname, router, isClient]);

  const isAuthPageLayout = pathname === '/login' || pathname === '/register' || pathname === '/forgot-password' || pathname === '/reset-password';

  if (!authChecked && !isAuthPageLayout && isClient) {
    return (
      <>
        <div className="flex items-center justify-center min-h-screen bg-background">
          <p>Loading...</p>
        </div>
        <Toaster />
      </>
    );
  }

  return (
    <>
      {isAuthPageLayout ? (
        <>
          {children}
        </>
      ) : (
        <AppLayout>
          {children}
        </AppLayout>
      )}
      <Toaster />
    </>
  );
}
