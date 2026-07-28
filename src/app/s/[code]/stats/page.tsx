import type { Metadata } from 'next';
import ShortUrlStatsClient from '@/components/shorturl/ShortUrlStatsClient';

type Props = { params: Promise<{ code: string }> };

export const metadata: Metadata = {
  title: 'Short URL Stats',
  robots: { index: false, follow: false },
};

export default async function ShortUrlStatsPage({ params }: Props) {
  const { code } = await params;
  return <ShortUrlStatsClient code={code} />;
}
