import type { Metadata } from 'next';
import { buildPageMetadata } from '@/lib/seo/metadata';
import { absoluteUrl } from '@/lib/seo/site';
import SchemaMarkup from '@/components/seo/SchemaMarkup';
import { buildToolJsonLd, personSchema } from '@/lib/seo/schemas';
import { getFullSeoPage } from '@/data/seo-pages';
import { getAuthor, PRIMARY_AUTHOR_SLUG } from '@/data/authors';
import { allTools } from '@/data/toolsData';
import ToolPageShell from '@/components/tools/ToolPageShell';

export const dynamic = 'force-static';

const PATH = '/json-formatter';
const SLUG = 'json-formatter';

export async function generateMetadata(): Promise<Metadata> {
  const seo = getFullSeoPage(PATH);
  return buildPageMetadata({
    title: seo?.title || 'Free JSON Formatter & Validator',
    description:
      seo?.metaDescription ||
      'Format, validate, beautify, and minify JSON online free. Catch syntax errors instantly. No signup required.',
    path: PATH,
    keywords: seo?.keywords || [
      'json formatter',
      'json validator',
      'json beautifier',
      'minify json',
      'pretty print json',
    ],
    ogImageAlt: 'FYN Tools JSON Formatter',
  });
}

export default function JsonFormatterPage() {
  const tool = allTools.find((t) => t.path === PATH)!;
  const fullSeo = getFullSeoPage(PATH);
  const author = getAuthor(PRIMARY_AUTHOR_SLUG);
  const displayTitle = fullSeo?.h1 || tool.name;
  const displayDescription = fullSeo?.metaDescription || tool.description;
  const howTo = fullSeo?.howToUse?.length ? fullSeo.howToUse : [];
  const features = fullSeo?.features?.length ? fullSeo.features : [];
  const faqs = fullSeo?.faqs?.length ? fullSeo.faqs : [];

  const schemas = [
    ...buildToolJsonLd({
      title: displayTitle,
      description: displayDescription,
      slug: SLUG,
      category: tool.category,
      howToSteps: howTo,
      features,
      faqs,
      includeHowTo: howTo.length >= 3,
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
        slug={SLUG}
        title={tool.name}
        description={tool.description}
        category={tool.category}
        howToUse={howTo}
        features={features}
        faqs={faqs}
        fullSeo={fullSeo}
      />
    </>
  );
}
