import type { Metadata } from 'next';
import { Suspense } from 'react';
import RedirectHelperClient from '@/components/deeplink/RedirectHelperClient';

export const metadata: Metadata = {
  robots: { index: false, follow: false },
  title: 'Redirect | FYN Tools',
};

export default function RedirectToolPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[60vh] flex items-center justify-center text-muted-foreground">
          Redirecting…
        </div>
      }
    >
      <RedirectHelperClient />
    </Suspense>
  );
}
