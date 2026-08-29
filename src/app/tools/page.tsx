import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { allTools } from '@/data/toolsData';
import { categoryToHubPath, CATEGORY_HUBS } from '@/data/categoriesData';
import { buildPageMetadata } from '@/lib/seo/metadata';
import { JsonLd } from '@/lib/seo/jsonld';
import {
  breadcrumbSchema,
  collectionPageSchema,
  itemListSchema,
} from '@/lib/seo/schemas';
import { absoluteUrl } from '@/lib/seo/site';
import { resolveCategoryHub } from '@/lib/seo/categoryHubRedirects';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export const metadata: Metadata = buildPageMetadata({
  title: 'All Free Online Tools',
  description:
    'Browse 90+ free online tools on FYNTools: text, image, developer, finance, typing, converters, and more. No registration required.',
  path: '/tools',
  keywords: 'online tools, free tools, fyntools, calculators, converters, image tools, text tools',
});

type Props = { searchParams: Promise<{ category?: string; search?: string }> };

export default async function ToolsPage({ searchParams }: Props) {
  const sp = await searchParams;
  if (sp.category) {
    const decoded = decodeURIComponent(sp.category);
    const dest = resolveCategoryHub(decoded);
    if (dest) redirect(dest);
  }

  const q = (sp.search || '').toLowerCase().trim();
  const HIDDEN_PATHS = new Set(['/enhanced-unit-converter', '/add-name-date-photo']);
  const tools = (q
    ? allTools.filter(
        (t) =>
          t.name.toLowerCase().includes(q) ||
          t.description.toLowerCase().includes(q) ||
          t.category.toLowerCase().includes(q) ||
          t.keywords.toLowerCase().includes(q)
      )
    : allTools
  ).filter((t) => !HIDDEN_PATHS.has(t.path));

  const byCategory = new Map<string, typeof allTools>();
  for (const tool of tools) {
    const list = byCategory.get(tool.category) || [];
    list.push(tool);
    byCategory.set(tool.category, list);
  }

  const schemas = [
    breadcrumbSchema([
      { name: 'Home', url: absoluteUrl('/') },
      { name: 'Tools', url: absoluteUrl('/tools') },
    ]),
    collectionPageSchema({
      name: 'All Free Online Tools',
      description: 'Browse 90+ free online tools on FYNTools.',
      url: absoluteUrl('/tools'),
      items: tools.map((t) => ({ name: t.name, url: absoluteUrl(t.path) })),
    }),
    itemListSchema(
      'FYN Tools Categories',
      CATEGORY_HUBS.map((h) => ({ name: h.name, url: absoluteUrl(h.path) }))
    ),
  ];

  return (
    <div className="container mx-auto px-4 py-10">
      <JsonLd data={schemas} />
      <h1 className="text-3xl md:text-4xl font-bold mb-4 text-center">All Tools</h1>
      <p className="text-center text-muted-foreground mb-10 max-w-2xl mx-auto">
        {tools.length} free browser tools. Use category hubs for indexable collections.
      </p>
      {[...byCategory.entries()].map(([cat, list]) => (
        <section key={cat} className="mb-10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-semibold">{cat}</h2>
            {categoryToHubPath(cat) && (
              <Link href={categoryToHubPath(cat)!} className="text-sm text-primary hover:underline">
                View hub
              </Link>
            )}
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {list.map((tool) => {
              const Icon = tool.icon;
              return (
                <Link key={tool.path} href={tool.path} prefetch={false}>
                  <Card className="h-full hover:border-primary/40">
                    <CardHeader>
                      <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 rounded-lg bg-primary/10">
                          <Icon className="h-5 w-5 text-primary" />
                        </div>
                        <Badge variant="secondary" className="text-xs">
                          {tool.category.split(' ')[0]}
                        </Badge>
                      </div>
                      <CardTitle className="text-lg">{tool.name}</CardTitle>
                      <CardDescription className="line-clamp-2">{tool.description}</CardDescription>
                    </CardHeader>
                  </Card>
                </Link>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}
