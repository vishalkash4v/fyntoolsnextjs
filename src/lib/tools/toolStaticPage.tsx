import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { buildPageMetadata } from '@/lib/seo/metadata';
import { getCanonicalUrl, SEO_DATE_MODIFIED } from '@/lib/seo-config';
import ToolSchemas from '@/components/seo/ToolSchemas';
import { getAuthor, PRIMARY_AUTHOR_SLUG } from '@/data/authors';
import { resolveToolPage } from '@/lib/tools/resolveToolPage';
import { getToolReviewStats } from '@/lib/tools/toolReviewStats';
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
    modifiedTime: fullSeo?.dateModified || SEO_DATE_MODIFIED,
    publishedTime: fullSeo?.datePublished || SEO_DATE_MODIFIED,
  });
}

type ToolStaticPageProps = {
  slug: string;
  toolClient: React.ReactNode;
};

/**
 * Server shell shared by every dedicated tool route.
 * Schema + metadata URLs always resolve to https://fyntools.com via seo-config.
 */
export default async function ToolStaticPage({ slug, toolClient }: ToolStaticPageProps) {
  const resolved = resolveToolPage(slug);
  if (!resolved) notFound();

  const { tool, fullSeo, howToUse, features, faqs } = resolved;
  const displayTitle = fullSeo?.h1 || tool.name;
  const displayDescription = fullSeo?.metaDescription || tool.description;
  const author = getAuthor(PRIMARY_AUTHOR_SLUG);
  const authorUrl = author ? getCanonicalUrl(`/author/${author.slug}`) : undefined;
  const reviewStats = await getToolReviewStats(tool.name, slug);

  return (
    <>
      <ToolSchemas
        title={displayTitle}
        description={displayDescription}
        slug={slug}
        category={tool.category}
        howToSteps={howToUse}
        features={features}
        faqs={faqs}
        keywords={fullSeo?.keywords}
        relatedTools={(fullSeo?.relatedTools || []).map((t) => ({
          name: t.name,
          url: getCanonicalUrl(t.href),
        }))}
        datePublished={fullSeo?.datePublished || SEO_DATE_MODIFIED}
        dateModified={fullSeo?.dateModified || SEO_DATE_MODIFIED}
        author={
          author && authorUrl
            ? {
                name: author.name,
                url: authorUrl,
                description: author.shortBio,
                jobTitle: author.role,
                image: author.avatar,
                sameAs: author.sameAs,
              }
            : null
        }
        ratingValue={
          reviewStats &&
          reviewStats.ratingCount >= 1 &&
          reviewStats.ratingValue >= 1 &&
          reviewStats.ratingValue <= 5
            ? reviewStats.ratingValue
            : undefined
        }
        ratingCount={
          reviewStats && reviewStats.ratingCount >= 1
            ? reviewStats.ratingCount
            : undefined
        }
      />
      <ToolPageShell
        slug={slug}
        title={tool.name}
        description={tool.description}
        category={tool.category}
        howToUse={howToUse}
        features={features}
        faqs={faqs}
        fullSeo={fullSeo}
        reviewStats={reviewStats}
        toolClient={toolClient}
      />
    </>
  );
}
