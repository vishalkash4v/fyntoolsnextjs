import type { Metadata } from 'next';
import ToolStaticPage, { buildToolPageMetadata } from '@/lib/tools/toolStaticPage';
import UrlShortenerClient from '@/app/url-shortener/UrlShortenerClient';

export const dynamic = 'force-static';

export function generateMetadata(): Metadata {
  return buildToolPageMetadata('url-shortener');
}

export default function UrlShortenerPage() {
  return <ToolStaticPage slug="url-shortener" toolClient={<UrlShortenerClient />} />;
}
