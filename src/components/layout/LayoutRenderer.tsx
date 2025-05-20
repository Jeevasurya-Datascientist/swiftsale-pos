
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
  const [authChecked, setAuthChecked] = useState(false); // To prevent rendering children before auth check

  useEffect(() => {
    setIsClient(true); // Component has mounted, safe to access localStorage
  }, []);

  useEffect(() => {
    if (isClient) { // Only run on client-side after mount
      const isAuthenticated = localStorage.getItem('isAuthenticated');
      const isAuthPagePath = pathname === '/login' || pathname === '/register';

      if (isAuthenticated !== 'true' && !isAuthPagePath) {
        router.push('/login');
      } else {
        setAuthChecked(true); // Auth check complete
      }
    }
  }, [pathname, router, isClient]);

  const isAuthPageLayout = pathname === '/login' || pathname === '/register';

  // If auth check is not complete and it's not an auth page, show a loader or nothing
  // This prevents a flash of protected content before redirection
  if (!authChecked && !isAuthPageLayout && isClient) {
    return (
      <>
        {/* Optional: Add a global loading spinner here */}
        <div className="flex items-center justify-center min-h-screen bg-background">
          <p>Loading...</p> {/* Or a spinner component */}
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
