import type { Metadata } from 'next';
import { Suspense } from 'react';
import RedirectHelperClient from '@/components/deeplink/RedirectHelperClient';

export const metadata: Metadata = {
  robots: { index: false, follow: false },
  title: 'Redirect | FYN Tools',
};

export default function RedirectToolPage() {
  return (
    <div className="container mx-auto px-4 py-16 max-w-xl text-center">
      <h1 className="text-2xl font-bold mb-4">Secure Redirect</h1>
      <p className="text-muted-foreground mb-8">
        Preparing your destination link. This helper page is not indexed.
      </p>
      <Suspense
        fallback={
          <div className="min-h-[40vh] flex items-center justify-center text-muted-foreground">
            Redirecting…
          </div>
        }
      >
        <RedirectHelperClient />
      </Suspense>
    </div>
  );
}
