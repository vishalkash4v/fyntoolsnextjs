import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { allTools } from '@/data/toolsData';
import { CATEGORY_HUBS, getCategoryHub, getToolsForHub } from '@/data/categoriesData';
import { buildPageMetadata } from '@/lib/seo/metadata';
import { JsonLd } from '@/lib/seo/jsonld';
import { absoluteUrl } from '@/lib/seo/site';
import {
  breadcrumbSchema,
  collectionPageSchema,
  faqPageSchema,
  buildToolJsonLd,
} from '@/lib/seo/schemas';
import { isReservedSlug } from '@/lib/tools/reserved';
import { resolveToolPage } from '@/lib/tools/resolveToolPage';
import { getToolLoader, TOOL_SLUGS, TOOL_CANONICAL_REDIRECTS } from '@/lib/tools/registry.generated';
import ToolPageShell from '@/components/tools/ToolPageShell';
import { ArrowRight, Layers } from 'lucide-react';
import { redirect } from 'next/navigation';

type Props = { params: Promise<{ slug: string }> };

const HUB_SLUGS = new Set(CATEGORY_HUBS.map((h) => h.slug));
const REDIRECT_SLUGS = new Set(Object.keys(TOOL_CANONICAL_REDIRECTS));

export async function generateStaticParams() {
  const toolSlugs = allTools.map((t) => t.path.replace(/^\//, '')).filter(Boolean);
  const slugs = new Set([...toolSlugs, ...TOOL_SLUGS, ...CATEGORY_HUBS.map((h) => h.slug)]);
  return [...slugs]
    .filter((slug) => {
      if (REDIRECT_SLUGS.has(slug)) return false;
      if (
        [
          'about',
          'contact',
          'tools',
          'themes',
          'blog',
          's',
          'fyntoolsadmin',
          'api',
          'redirect',
          'deep-link-redirect',
          // Dedicated App Router pages (more specific than [slug])
          'json-formatter',
          'url-shortener',
          'guides',
          'author',
        ].includes(slug)
      ) {
        return false;
      }
      return HUB_SLUGS.has(slug) || getToolLoader(slug) || allTools.some((t) => t.path === `/${slug}`);
    })
    .map((slug) => ({ slug }));
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
  if (isReservedSlug(slug) && !HUB_SLUGS.has(slug)) return {};
  const resolved = resolveToolPage(slug);
  if (!resolved) return { title: { absolute: 'Not Found | FYN Tools Worldwide' } };
  const { tool, fullSeo } = resolved;
  return buildPageMetadata({
    title: fullSeo?.title || `${tool.name} – Free Online Tool`,
    description: fullSeo?.metaDescription || tool.description,
    path: `/${slug}`,
    keywords: fullSeo?.keywords || tool.keywords,
    ogImageAlt: fullSeo?.ogTitle || tool.name,
  });
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
      <JsonLd data={schemas as Record<string, unknown>[]} />
      <nav className="text-sm text-muted-foreground mb-6 flex flex-wrap gap-2" aria-label="Breadcrumb">
        <Link href="/" className="hover:text-primary">
          Home
        </Link>
        <span>/</span>
        <Link href="/tools" className="hover:text-primary">
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
            const Icon = tool.icon;
            return (
              <Link key={tool.path} href={tool.path} className="group">
                <Card className="h-full group-hover:border-primary/50">
                  <CardHeader className="pb-2">
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <Icon className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-base group-hover:text-primary">{tool.name}</CardTitle>
                        <CardDescription className="line-clamp-2">{tool.description}</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <span className="text-sm text-primary inline-flex items-center gap-1">
                      Open tool <ArrowRight className="h-3 w-3" />
                    </span>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      </section>
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">Frequently Asked Questions</h2>
        <div className="space-y-4">
          {hub.faqs.map((faq) => (
            <Card key={faq.question}>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">{faq.question}</CardTitle>
              </CardHeader>
              <CardContent>{faq.answer}</CardContent>
            </Card>
          ))}
        </div>
      </section>
      <div className="flex flex-wrap gap-2">
        {otherHubs.map((h) => (
          <Link key={h.path} href={h.path} className="px-3 py-1.5 rounded-full bg-muted text-sm">
            {h.name}
          </Link>
        ))}
      </div>
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

  if (isReservedSlug(slug)) notFound();
  const resolved = resolveToolPage(slug);
  if (!resolved) notFound();

  const { tool, fullSeo, howToUse, features, faqs } = resolved;
  const displayTitle = fullSeo?.h1 || tool.name;
  const displayDescription = fullSeo?.metaDescription || tool.description;
  const displayHowTo = fullSeo?.howToUse?.length ? fullSeo.howToUse : howToUse;
  const displayFeatures = fullSeo?.features?.length ? fullSeo.features : features;
  const displayFaqs = fullSeo?.faqs?.length ? fullSeo.faqs : faqs;

  const schemas = buildToolJsonLd({
    title: displayTitle,
    description: displayDescription,
    slug,
    category: tool.category,
    howToSteps: displayHowTo,
    features: displayFeatures,
    faqs: displayFaqs,
    includeHowTo: displayHowTo.length >= 3,
    relatedTools: (fullSeo?.relatedTools || []).map((t) => ({
      name: t.name,
      url: absoluteUrl(t.href),
    })),
  });

  return (
    <>
      <JsonLd data={schemas} />
      <ToolPageShell
        slug={slug}
        title={tool.name}
        description={tool.description}
        category={tool.category}
        howToUse={howToUse}
        features={features}
        faqs={faqs}
        fullSeo={fullSeo}
      />
    </>
  );
}