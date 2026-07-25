import type { Metadata } from 'next';

export const metadata: Metadata = {
  robots: { index: false, follow: false },
  title: 'Deep Link Redirect',
};

export default function DeepLinkRedirectPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-2xl font-bold">Deep Link Redirect</h1>
      <p className="text-muted-foreground mt-2">Internal deep-link helper (noindex).</p>
    </div>
  );
}
