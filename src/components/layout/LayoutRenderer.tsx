
"use client";

import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Toaster } from "@/components/ui/toaster";

export function LayoutRenderer({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isAuthPage = pathname === '/login' || pathname === '/register';

  return (
    <>
      {isAuthPage ? (
        <>
          {children}
        </>
      ) : (
        <AppLayout>
          {children}
        </AppLayout>
      )}
      {/* Render Toaster once globally; it will be available on all pages */}
      <Toaster />
    </>
  );
}
