import type { Metadata } from 'next';
import Link from 'next/link';
import { buildPageMetadata } from '@/lib/seo/metadata';
import SchemaMarkup from '@/components/seo/SchemaMarkup';
import { breadcrumbSchema, collectionPageSchema } from '@/lib/seo/schemas';
import { absoluteUrl } from '@/lib/seo/site';
import { guides } from '@/data/guides/guidesData';
import { getAuthor } from '@/data/authors';

export const metadata: Metadata = buildPageMetadata({
  title: 'Guides — Free Tool Tutorials & Best Practices',
  description:
    'In-depth FYN Tools guides on URL shorteners, JSON debugging, passwords, QR print, SEO word count, and browser privacy. Learn then open the free tools.',
  path: '/guides',
  keywords: 'fyntools guides, online tool tutorials, url shortener guide, json formatter guide',
});

export default function GuidesIndexPage() {
  const canonical = absoluteUrl('/guides');
  return (
    <div className="container mx-auto px-4 py-10 max-w-5xl">
      <SchemaMarkup
        data={[
          breadcrumbSchema([
            { name: 'Home', url: absoluteUrl('/') },
            { name: 'Guides', url: canonical },
          ]),
          collectionPageSchema({
            name: 'FYN Tools Guides',
            description: 'Technical guides that funnel into free browser utilities.',
            url: canonical,
            items: guides.map((g) => ({
              name: g.title,
              url: absoluteUrl(`/guides/${g.slug}`),
            })),
          }),
        ]}
      />

      <header className="mb-10 text-center">
        <h1 className="text-3xl md:text-5xl font-bold mb-4">Guides</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Long-form explainers that teach the concepts behind our tools—then link you into the free utilities when you are ready to work.
        </p>
      </header>

      <ul className="grid gap-4 list-none p-0 m-0">
        {guides.map((g) => {
          const author = getAuthor(g.authorSlug);
          return (
            <li key={g.slug}>
              <Link
                href={`/guides/${g.slug}`}
                className="block rounded-xl border border-zinc-200 dark:border-zinc-800 bg-card p-6 hover:border-primary/50 transition-colors"
              >
                <h2 className="text-xl font-semibold text-primary mb-2">{g.title}</h2>
                <p className="text-sm text-muted-foreground mb-3">{g.description}</p>
                <p className="text-xs text-muted-foreground">
                  {author?.name ?? 'FYN Tools'} · Updated {g.updatedAt}
                </p>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
