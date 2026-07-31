import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { buildPageMetadata } from '@/lib/seo/metadata';
import { absoluteUrl } from '@/lib/seo/site';
import SchemaMarkup from '@/components/seo/SchemaMarkup';
import { buildToolJsonLd, personSchema } from '@/lib/seo/schemas';
import { getAuthor, PRIMARY_AUTHOR_SLUG } from '@/data/authors';
import { resolveToolPage } from '@/lib/tools/resolveToolPage';
import ToolPageShell from '@/components/tools/ToolPageShell';

/** Metadata for a statically generated tool route (parity with /url-shortener). */
export function buildToolPageMetadata(slug: string): Metadata {
  const resolved = resolveToolPage(slug);
  if (!resolved) {
    return { title: { absolute: 'Not Found | FYN Tools Worldwide' } };
  }
  const { tool, fullSeo } = resolved;
  return buildPageMetadata({
    title: fullSeo?.title || `${tool.name} – Free Online Tool`,
    description: fullSeo?.metaDescription || tool.description,
    path: `/${slug}`,
    keywords: fullSeo?.keywords || tool.keywords,
    ogImageAlt: fullSeo?.ogTitle || tool.name,
  });
}

type ToolStaticPageProps = {
  slug: string;
  toolClient: React.ReactNode;
};

/**
 * Server shell shared by every dedicated tool route.
 * Matches /url-shortener: SchemaMarkup + personSchema + ToolPageShell + client island.
 */
export default function ToolStaticPage({ slug, toolClient }: ToolStaticPageProps) {
  const resolved = resolveToolPage(slug);
  if (!resolved) notFound();

  const { tool, fullSeo, howToUse, features, faqs } = resolved;
  const displayTitle = fullSeo?.h1 || tool.name;
  const displayDescription = fullSeo?.metaDescription || tool.description;
  const author = getAuthor(PRIMARY_AUTHOR_SLUG);

  const schemas = [
    ...buildToolJsonLd({
      title: displayTitle,
      description: displayDescription,
      slug,
      category: tool.category,
      howToSteps: howToUse,
      features,
      faqs,
      includeHowTo: howToUse.length >= 3,
      relatedTools: (fullSeo?.relatedTools || []).map((t) => ({
        name: t.name,
        url: absoluteUrl(t.href),
      })),
    }),
    author
      ? personSchema({
          name: author.name,
          url: absoluteUrl(`/author/${author.slug}`),
          description: author.shortBio,
          jobTitle: author.role,
          image: author.avatar,
          sameAs: author.sameAs,
        })
      : null,
  ].filter(Boolean) as object[];

  return (
    <>
      <SchemaMarkup data={schemas} />
      <ToolPageShell
        slug={slug}
        title={tool.name}
        description={tool.description}
        category={tool.category}
        howToUse={howToUse}
        features={features}
        faqs={faqs}
        fullSeo={fullSeo}
        toolClient={toolClient}
      />
    </>
  );
}
