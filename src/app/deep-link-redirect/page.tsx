import type { Metadata } from 'next';
import { Suspense } from 'react';
import DeepLinkRedirectClient from '@/components/deeplink/DeepLinkRedirectClient';

export const metadata: Metadata = {
  robots: { index: false, follow: false },
  title: 'Deep Link Redirect | FYN Tools',
};

export default function DeepLinkRedirectPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center text-muted-foreground">
          Preparing deep link…
        </div>
      }
    >
      <DeepLinkRedirectClient />
    </Suspense>
  );
}
