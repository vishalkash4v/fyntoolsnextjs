import type { Metadata } from 'next';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export const metadata: Metadata = {
  title: { absolute: '404 — Page Not Found | FYN Tools' },
  description:
    'This FYN Tools page could not be found. Browse free online tools, guides, or return home.',
  robots: { index: false, follow: true },
};

export default function NotFound() {
  return (
    <div className="container mx-auto px-4 py-24 text-center">
      <h1 className="text-4xl font-bold mb-4">404 – Page Not Found</h1>
      <p className="text-muted-foreground mb-8 max-w-lg mx-auto">
        The page you requested does not exist. It may have been moved or the URL is incorrect.
      </p>
      <div className="flex gap-3 justify-center">
        <Button asChild>
          <Link href="/">Go Home</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/tools">Browse Tools</Link>
        </Button>
      </div>
    </div>
  );
}
