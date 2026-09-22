import SchemaMarkup from '@/components/seo/SchemaMarkup';
import {
  buildToolJsonLd,
  mergeJsonLdGraph,
  personSchema,
} from '@/lib/seo/schemas';
import { getCanonicalUrl, SEO_DATE_MODIFIED } from '@/lib/seo-config';
import type { FaqItem } from '@/lib/seo/schemas';

type Related = { name: string; url: string };

type AuthorInput = {
  name: string;
  url: string;
  description?: string;
  jobTitle?: string;
  image?: string;
  sameAs?: string[];
};

type Props = {
  title: string;
  description: string;
  slug: string;
  category: string;
  howToSteps: string[];
  features: string[];
  faqs: FaqItem[];
  keywords?: string[];
  relatedTools?: Related[];
  datePublished?: string;
  dateModified?: string;
  author?: AuthorInput | null;
  ratingValue?: number;
  ratingCount?: number;
};

/**
 * Reusable tool JSON-LD: WebPage + SoftwareApplication + BreadcrumbList +
 * FAQPage + HowTo. All URLs forced through getCanonicalUrl (fyntools.com).
 */
export default function ToolSchemas({
  title,
  description,
  slug,
  category,
  howToSteps,
  features,
  faqs,
  keywords,
  relatedTools = [],
  datePublished,
  dateModified = SEO_DATE_MODIFIED,
  author,
  ratingValue,
  ratingCount,
}: Props) {
  const related = relatedTools.map((t) => ({
    name: t.name,
    url: t.url.startsWith('http') ? t.url : getCanonicalUrl(t.url),
  }));

  const parts = [
    ...buildToolJsonLd({
      title,
      description,
      slug,
      category,
      howToSteps,
      features,
      faqs,
      includeHowTo: howToSteps.length >= 3,
      relatedTools: related,
      keywords,
      datePublished: datePublished || SEO_DATE_MODIFIED,
      dateModified,
      authorUrl: author?.url,
      authorName: author?.name,
      ratingValue,
      ratingCount,
    }),
    author
      ? personSchema({
          name: author.name,
          url: author.url,
          description: author.description || '',
          jobTitle: author.jobTitle,
          image: author.image,
          sameAs: author.sameAs,
        })
      : null,
  ].filter(Boolean) as Record<string, unknown>[];

  return <SchemaMarkup data={mergeJsonLdGraph(parts)} />;
}
