import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Short URL Stats',
  robots: { index: false, follow: false },
};

type Props = { params: Promise<{ code: string }> };

export default async function ShortUrlStatsPage({ params }: Props) {
  const { code } = await params;
  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-2xl font-bold mb-4">Short URL Stats</h1>
      <p className="text-muted-foreground">Stats for code: {code}</p>
      <p className="text-sm mt-4">
        Detailed analytics are available via the FYNTools short URL API.
      </p>
    </div>
  );
}
