'use client';

import { Toaster } from 'sonner';
import { CurrencyProvider } from '@/contexts/CurrencyContext';

/** Root client providers — keep lean; do not mount React Query globally. */
export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <CurrencyProvider>
      {children}
      <Toaster richColors position="top-right" />
    </CurrencyProvider>
  );
}
