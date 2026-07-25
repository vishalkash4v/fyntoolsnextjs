import type { Metadata } from 'next';

export const metadata: Metadata = {
  robots: { index: false, follow: false },
  title: 'Redirect',
};

export default function RedirectToolPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-2xl font-bold">Redirect Helper</h1>
      <p className="text-muted-foreground mt-2">Internal redirect utility (noindex).</p>
    </div>
  );
}
