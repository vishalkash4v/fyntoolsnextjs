import type { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import ShortUrlRedirectClient from '@/components/shorturl/ShortUrlRedirectClient';
import { resolveShortUrl } from '@/lib/shorturl/api';

type Props = { params: Promise<{ code: string }> };

export const metadata: Metadata = {
  title: 'Redirecting… | FYN Tools',
  robots: { index: false, follow: false },
};

export default async function ShortUrlRedirectPage({ params }: Props) {
  const { code } = await params;
  const result = await resolveShortUrl(code);

  if (result.type === 'redirect') {
    redirect(result.destination);
  }

  if (result.type === 'not_found') {
    notFound();
  }

  if (result.type === 'expired') {
    return (
      <ShortUrlRedirectClient
        code={code}
        initialPhase="error"
        initialError="This short link has expired."
        skipResolve
      />
    );
  }

  if (result.type === 'password') {
    return <ShortUrlRedirectClient code={code} initialPhase="password" skipResolve />;
  }

  // SSR resolve can fail (cold start / transient network). Let the browser retry
  // with a normal Origin header instead of freezing on "Link unavailable".
  if (result.type === 'error') {
    return <ShortUrlRedirectClient code={code} />;
  }

  return <ShortUrlRedirectClient code={code} />;
}
