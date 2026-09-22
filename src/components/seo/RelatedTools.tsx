import Link from 'next/link';
import { getCategoryHubPath } from '@/utils/breadcrumbs';
import { getRelatedToolsForPage } from '@/lib/seo/relatedToolsPicker';

type Props = {
  category: string;
  currentToolSlug: string;
  /** Optional pre-resolved list (from fullSeo). Falls back to picker. */
  tools?: { name: string; href: string; description?: string }[];
  minCount?: number;
};

/**
 * Internal linking block for AEO/SEO — category peers + hub crawl path.
 * Used on every tool page via ToolSeoSections.
 */
export default function RelatedTools({
  category,
  currentToolSlug,
  tools,
  minCount = 3,
}: Props) {
  const slug = currentToolSlug.replace(/^\//, '');
  const path = `/${slug}`;
  const hubPath = getCategoryHubPath(category) || '/tools';

  const resolved =
    tools && tools.length >= minCount
      ? tools.slice(0, 12)
      : getRelatedToolsForPage(path, 12);

  // Always show the section when we can surface at least one peer or hub CTA
  const list =
    resolved.length >= 1
      ? resolved
      : [
          {
            name: `All ${category}`,
            href: hubPath,
            description: `Browse the full ${category} hub on FYN Tools`,
          },
          {
            name: 'All FYN Tools',
            href: '/tools',
            description: 'Open the complete free tools catalog',
          },
          {
            name: 'Guides',
            href: '/guides',
            description: 'How-to guides for FYN Tools workflows',
          },
        ];

  return (
    <section id="related-tools" className="mb-8 sm:mb-10 md:mb-12 px-4 sm:px-6 md:px-8">
      <h2 className="text-xl sm:text-2xl font-semibold tracking-tight mb-4">
        Next steps — related tools
      </h2>
      <p className="text-sm text-muted-foreground mb-4">
        Browse more{' '}
        <Link href={hubPath} className="text-primary underline-offset-2 hover:underline">
          free {category}
        </Link>{' '}
        or the full{' '}
        <Link href="/tools" className="text-primary underline-offset-2 hover:underline">
          FYN Tools catalog
        </Link>
        .
      </p>
      <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 list-none p-0 m-0">
        {list.slice(0, 12).map((t) => (
          <li key={t.href}>
            <Link
              href={t.href}
              className="h-full p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:border-primary/50 hover:bg-muted/40 transition-colors block"
            >
              <span className="font-medium text-primary">{t.name}</span>
              {t.description ? (
                <span className="block text-xs text-muted-foreground mt-1 line-clamp-2">
                  {t.description}
                </span>
              ) : null}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
