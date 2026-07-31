import type { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CATEGORY_HUBS, getCategoryHub, getToolsForHub } from '@/data/categoriesData';
import { buildPageMetadata } from '@/lib/seo/metadata';
import { absoluteUrl } from '@/lib/seo/site';
import {
  breadcrumbSchema,
  collectionPageSchema,
  faqPageSchema,
} from '@/lib/seo/schemas';
import SchemaMarkup from '@/components/seo/SchemaMarkup';
import { isReservedSlug } from '@/lib/tools/reserved';
import { TOOL_CANONICAL_REDIRECTS, isKnownToolSlug } from '@/lib/tools/tool-slugs.generated';
import ToolStaticPage, { buildToolPageMetadata } from '@/lib/tools/toolStaticPage';
import InteractiveToolLoader from '@/components/tools/InteractiveToolLoader';
import { ArrowRight, Layers } from 'lucide-react';

type Props = { params: Promise<{ slug: string }> };

const HUB_SLUGS = new Set(CATEGORY_HUBS.map((h) => h.slug));
const REDIRECT_SLUGS = new Set(Object.keys(TOOL_CANONICAL_REDIRECTS));

/** Allow unknown slugs at runtime (required when generateStaticParams is empty in dev). */
export const dynamicParams = true;

/**
 * Tools are prerendered as dedicated `(generated-tools)/{slug}` routes
 * (same pattern as /url-shortener). `[slug]` only prerenders category hubs.
 */
export async function generateStaticParams() {
  if (process.env.NODE_ENV === 'development') {
    return [];
  }
  return CATEGORY_HUBS.map((h) => ({ slug: h.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const hub = getCategoryHub(slug);
  if (hub) {
    return buildPageMetadata({
      title: hub.title,
      description: hub.metaDescription,
      path: hub.path,
      keywords: hub.keywords,
    });
  }
  if (TOOL_CANONICAL_REDIRECTS[slug]) {
    return {};
  }
  if (isKnownToolSlug(slug)) {
    return buildToolPageMetadata(slug);
  }
  if (isReservedSlug(slug)) return {};
  return { title: { absolute: 'Not Found | FYN Tools Worldwide' } };
}

function HubPage({ slug }: { slug: string }) {
  const hub = getCategoryHub(slug);
  if (!hub) return null;
  const tools = getToolsForHub(hub);
  const canonical = absoluteUrl(hub.path);
  const schemas = [
    breadcrumbSchema([
      { name: 'Home', url: absoluteUrl('/') },
      { name: 'Tools', url: absoluteUrl('/tools') },
      { name: hub.name, url: canonical },
    ]),
    collectionPageSchema({
      name: hub.title,
      description: hub.metaDescription,
      url: canonical,
      items: tools.map((t) => ({ name: t.name, url: absoluteUrl(t.path) })),
    }),
    faqPageSchema(hub.faqs),
  ].filter(Boolean);

  const otherHubs = CATEGORY_HUBS.filter((h) => h.path !== hub.path).slice(0, 12);

  return (
    <div className="container mx-auto px-4 py-8 md:py-12 max-w-6xl">
      <SchemaMarkup data={schemas as object[]} />
      <nav className="text-sm text-muted-foreground mb-6 flex flex-wrap gap-2" aria-label="Breadcrumb">
        <Link href="/" className="hover:text-primary" prefetch={false}>
          Home
        </Link>
        <span>/</span>
        <Link href="/tools" className="hover:text-primary" prefetch={false}>
          Tools
        </Link>
        <span>/</span>
        <span className="text-foreground">{hub.name}</span>
      </nav>
      <div className="text-center mb-10">
        <Badge variant="secondary" className="mb-4">
          {hub.name}
        </Badge>
        <h1 className="text-3xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
          {hub.h1}
        </h1>
        <p className="text-lg text-zinc-700 dark:text-zinc-300 max-w-3xl mx-auto">{hub.intro}</p>
        <p className="mt-3 text-sm text-muted-foreground">{tools.length} tools</p>
      </div>
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <Layers className="h-6 w-6 text-primary" />
          All {hub.name}
        </h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {tools.map((tool) => {
            return (
              <Link key={tool.path} href={tool.path} prefetch={false} className="group">
                <Card className="h-full transition-colors group-hover:border-primary/50">
                  <CardHeader>
                    <CardTitle className="text-lg group-hover:text-primary transition-colors">
                      {tool.name}
                    </CardTitle>
                    <CardDescription className="line-clamp-2">{tool.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <span className="text-sm text-primary inline-flex items-center gap-1">
                      Open tool <ArrowRight className="h-3.5 w-3.5" />
                    </span>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      </section>
      {otherHubs.length > 0 && (
        <section>
          <h2 className="text-xl font-bold mb-4">More categories</h2>
          <div className="flex flex-wrap gap-2">
            {otherHubs.map((h) => (
              <Link key={h.path} href={h.path} prefetch={false}>
                <Badge variant="outline" className="hover:bg-muted">
                  {h.name}
                </Badge>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

export default async function DynamicSlugPage({ params }: Props) {
  const { slug } = await params;

  const canonicalSlug = TOOL_CANONICAL_REDIRECTS[slug];
  if (canonicalSlug) {
    redirect(`/${canonicalSlug}`);
  }

  if (HUB_SLUGS.has(slug)) {
    return <HubPage slug={slug} />;
  }

  // Safety net: dedicated `(generated-tools)` routes normally win.
  // If a tool somehow lands here, still serve full SEO + client island.
  if (isKnownToolSlug(slug)) {
    return (
      <ToolStaticPage
        slug={slug}
        toolClient={<InteractiveToolLoader slug={slug} />}
      />
    );
  }

  if (isReservedSlug(slug)) notFound();
  notFound();
}
