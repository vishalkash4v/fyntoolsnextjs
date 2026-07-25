import type { Metadata } from 'next';
import { buildPageMetadata } from '@/lib/seo/metadata';
import ThemesClient from '@/components/themes/ThemesClient';

/** Utility preference page — keep out of Google index (soft thin page / GSC noise). */
export const metadata: Metadata = buildPageMetadata({
  title: 'Theme Manager - Customize FYN Tools',
  description:
    'Customize your FYN Tools experience with light, dark, and system themes. Settings save locally in your browser.',
  path: '/themes',
  keywords: 'theme manager, dark mode, light mode, fyntools appearance',
  noIndex: true,
});

export default function ThemesPage() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-3xl">
      <h1 className="text-3xl font-bold mb-4 text-center">Theme Manager</h1>
      <p className="text-center text-muted-foreground mb-8">
        Choose light, dark, or system theme. Preferences are stored in your browser.
      </p>
      <ThemesClient />
    </div>
  );
}
