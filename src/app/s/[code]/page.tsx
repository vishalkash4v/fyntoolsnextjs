import type { Metadata } from 'next';
import ShortUrlRedirectClient from '@/components/shorturl/ShortUrlRedirectClient';

type Props = { params: Promise<{ code: string }> };

export const metadata: Metadata = {
  title: 'Redirecting… | FYN Tools',
  robots: { index: false, follow: false },
};

// Never block the HTML response on the short-url API.
// Waiting here keeps new tabs on about:blank for many seconds (Render cold start + retries).
export default async function ShortUrlRedirectPage({ params }: Props) {
  const { code } = await params;
  return <ShortUrlRedirectClient code={code} />;
}
