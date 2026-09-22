import type { Metadata } from 'next';
import { Suspense } from 'react';
import DeepLinkRedirectClient from '@/components/deeplink/DeepLinkRedirectClient';

export const metadata: Metadata = {
  robots: { index: false, follow: false },
  title: 'Deep Link Redirect | FYN Tools',
};

export default function DeepLinkRedirectPage() {
  return (
    <div className="min-h-screen">
      <h1 className="sr-only">Deep Link Redirect</h1>
      <Suspense
        fallback={
          <div className="min-h-screen flex items-center justify-center text-muted-foreground">
            Preparing deep link…
          </div>
        }
      >
        <DeepLinkRedirectClient />
      </Suspense>
    </div>
  );
}
