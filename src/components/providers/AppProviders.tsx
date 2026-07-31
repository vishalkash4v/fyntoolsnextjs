'use client';

import { Toaster } from 'sonner';

/** Root client providers — keep lean; do not mount React Query globally. */
export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <Toaster richColors position="top-right" />
    </>
  );
}
