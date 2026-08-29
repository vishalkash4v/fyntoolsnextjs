import { absoluteUrl, SITE_URL } from './site';
import { buildToolBreadcrumbs } from '@/utils/breadcrumbs';

export type FaqItem = { question: string; answer: string };

const ORG_ID = `${SITE_URL}/#organization`;
const WEBSITE_ID = `${SITE_URL}/#website`;

const ORG = {
  '@type': 'Organization' as const,
  '@id': ORG_ID,
  name: 'FYN Tools Worldwide',
  url: SITE_URL,
  logo: {
    '@type': 'ImageObject' as const,
    url: absoluteUrl('/logo.png'),
  },
  sameAs: ['https://twitter.com/fyntoolsworldwide'],
  contactPoint: {
    '@type': 'ContactPoint' as const,
    contactType: 'customer support',
    email: 'support@fyntools.com',
    availableLanguage: 'English',
  },
};

export function organizationSchema() {
  return {
    '@context': 'https://schema.org',
    ...ORG,
  };
}

export function websiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': WEBSITE_ID,
    name: 'FYN Tools Worldwide',
    url: SITE_URL,
    description:
      'Free professional online tools — calculators, text tools, image editors, converters, and developer utilities.',
    publisher: { '@id': ORG_ID },
    // No query-string SearchAction — robots disallows /*? (crawl budget). Browse via /tools.
  };
}

export function breadcrumbSchema(
  items: { name: string; url: string }[]
): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

export function faqPageSchema(faqs: FaqItem[]): Record<string, unknown> | null {
  if (!faqs.length) return null;
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((f) => ({
      '@type': 'Question',
      name: f.question,
      acceptedAnswer: { '@type': 'Answer', text: f.answer },
    })),
  };
}

export function howToSchema(opts: {
  name: string;
  description: string;
  url: string;
  steps: string[];
}): Record<string, unknown> | null {
  if (opts.steps.length < 3) return null;
  return {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: `How to use ${opts.name}`,
    description: opts.description,
    url: opts.url,
    step: opts.steps.map((text, i) => ({
      '@type': 'HowToStep',
      position: i + 1,
      name: `Step ${i + 1}`,
      text,
    })),
  };
}

export function softwareApplicationSchema(opts: {
  name: string;
  description: string;
  url: string;
  category: string;
  features?: string[];
}): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: opts.name,
    description: opts.description,
    url: opts.url,
    applicationCategory: 'UtilityApplication',
    applicationSubCategory: opts.category,
    operatingSystem: 'Any',
    browserRequirements: 'Requires a modern browser with JavaScript',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
      availability: 'https://schema.org/InStock',
    },
    isAccessibleForFree: true,
    provider: { '@id': ORG_ID },
    ...(opts.features?.length
      ? { featureList: opts.features.slice(0, 12).join(', ') }
      : {}),
  };
}

/**
 * Tool JSON-LD: WebPage + SoftwareApplication + ConsumeAction + Breadcrumb
 * + FAQ + HowTo (when visible). Prefer one coherent graph over thin duplicates.
 */
export function buildToolJsonLd(opts: {
  title: string;
  description: string;
  slug: string;
  category: string;
  howToSteps: string[];
  features: string[];
  faqs: FaqItem[];
  includeHowTo?: boolean;
  relatedTools?: { name: string; url: string }[];
  ratingValue?: number;
  ratingCount?: number;
  datePublished?: string;
  dateModified?: string;
  authorUrl?: string;
  authorName?: string;
}): Record<string, unknown>[] {
  const toolUrl = absoluteUrl(`/${opts.slug}`);
  const pageId = `${toolUrl}#webpage`;
  const appId = `${toolUrl}#app`;
  const crumbs = buildToolBreadcrumbs(opts.title, `/${opts.slug}`, opts.category);
  const includeHowTo =
    opts.includeHowTo !== false && opts.howToSteps.length >= 3;
  const published = opts.datePublished || opts.dateModified;
  const modified = opts.dateModified || opts.datePublished;

  const webPage: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    '@id': pageId,
    url: toolUrl,
    name: opts.title,
    description: opts.description,
    isPartOf: { '@id': WEBSITE_ID },
    about: { '@id': appId },
    primaryImageOfPage: absoluteUrl('/opengraph-image'),
    inLanguage: 'en-US',
    isAccessibleForFree: true,
    ...(published ? { datePublished: published } : {}),
    ...(modified ? { dateModified: modified } : {}),
    publisher: { '@id': ORG_ID },
    ...(opts.authorUrl
      ? {
          author: {
            '@type': 'Person',
            name: opts.authorName || 'FYN Tools Editorial',
            url: opts.authorUrl,
          },
        }
      : { author: { '@id': ORG_ID } }),
    potentialAction: {
      '@type': 'ConsumeAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${toolUrl}#tool`,
        actionPlatform: [
          'http://schema.org/DesktopWebPlatform',
          'http://schema.org/MobileWebPlatform',
        ],
      },
      expectsAcceptanceOf: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'USD',
      },
    },
  };

  const softwareApp: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': ['SoftwareApplication', 'WebApplication'],
    '@id': appId,
    name: opts.title,
    description: opts.description,
    url: toolUrl,
    applicationCategory: 'UtilityApplication',
    applicationSubCategory: opts.category,
    operatingSystem: 'Any',
    browserRequirements: 'Requires a modern browser with JavaScript',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
      availability: 'https://schema.org/InStock',
    },
    isAccessibleForFree: true,
    provider: { '@id': ORG_ID },
    mainEntityOfPage: { '@id': pageId },
    ...(opts.features?.length
      ? { featureList: opts.features.slice(0, 12).join(', ') }
      : {}),
    ...(opts.ratingValue
      ? {
          aggregateRating: {
            '@type': 'AggregateRating',
            ratingValue: opts.ratingValue,
            ratingCount: opts.ratingCount || 24,
            bestRating: 5,
            worstRating: 1,
          },
        }
      : {}),
  };

  const schemas: Record<string, unknown>[] = [
    webPage,
    softwareApp,
    breadcrumbSchema(crumbs),
  ];

  if (includeHowTo) {
    const howTo = howToSchema({
      name: opts.title,
      description: opts.description,
      url: toolUrl,
      steps: opts.howToSteps,
    });
    if (howTo) schemas.push(howTo);
  }
  const faq = faqPageSchema(opts.faqs);
  if (faq) schemas.push(faq);
  if (opts.relatedTools?.length) {
    schemas.push(itemListSchema(`Related tools for ${opts.title}`, opts.relatedTools));
  }
  return schemas;
}

export function collectionPageSchema(opts: {
  name: string;
  description: string;
  url: string;
  items: { name: string; url: string }[];
}): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: opts.name,
    description: opts.description,
    url: opts.url,
    isPartOf: { '@id': WEBSITE_ID },
    mainEntity: {
      '@type': 'ItemList',
      numberOfItems: opts.items.length,
      itemListElement: opts.items.slice(0, 50).map((item, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        name: item.name,
        url: item.url,
      })),
    },
  };
}

export function aboutPageSchema(): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'AboutPage',
    name: 'About FYN Tools Worldwide',
    description:
      'Learn about FYN Tools Worldwide — free, secure, browser-based tools for developers, students, and professionals.',
    url: absoluteUrl('/about'),
    mainEntity: { '@id': ORG_ID },
  };
}

export function contactPageSchema(): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'ContactPage',
    name: 'Contact FYN Tools',
    description: 'Contact FYN Tools Worldwide for support, feedback, or partnership inquiries.',
    url: absoluteUrl('/contact'),
    mainEntity: { '@id': ORG_ID },
  };
}

export function blogIndexSchema(
  posts: { title: string; url: string; datePublished?: string }[]
): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'Blog',
    name: 'FYN Tools Blog',
    description: 'Guides, comparisons, and tips for free online tools.',
    url: absoluteUrl('/blog'),
    publisher: { '@id': ORG_ID },
    blogPost: posts.map((p) => ({
      '@type': 'BlogPosting',
      headline: p.title,
      url: p.url,
      ...(p.datePublished ? { datePublished: p.datePublished } : {}),
    })),
  };
}

export function articleSchema(opts: {
  headline: string;
  description: string;
  url: string;
  datePublished: string;
  dateModified?: string;
  author?: string;
  image?: string;
  keywords?: string[];
}): Record<string, unknown>[] {
  const article = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: opts.headline,
    description: opts.description,
    datePublished: opts.datePublished,
    dateModified: opts.dateModified || opts.datePublished,
    author: {
      '@type': 'Organization',
      name: opts.author || 'FYN Tools Worldwide',
      url: SITE_URL,
    },
    publisher: { '@id': ORG_ID },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': opts.url,
    },
    url: opts.url,
    image: opts.image || absoluteUrl('/opengraph-image'),
    ...(opts.keywords?.length ? { keywords: opts.keywords.join(', ') } : {}),
    isAccessibleForFree: true,
  };
  const crumbs = breadcrumbSchema([
    { name: 'Home', url: absoluteUrl('/') },
    { name: 'Blog', url: absoluteUrl('/blog') },
    { name: opts.headline, url: opts.url },
  ]);
  return [article, crumbs];
}

export function itemListSchema(
  name: string,
  items: { name: string; url: string }[]
): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name,
    numberOfItems: items.length,
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      url: item.url,
    })),
  };
}

export function personSchema(opts: {
  name: string;
  url: string;
  description?: string;
  jobTitle?: string;
  image?: string;
  sameAs?: string[];
  email?: string;
  worksFor?: boolean;
}): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    '@id': `${opts.url}#person`,
    name: opts.name,
    url: opts.url,
    ...(opts.description ? { description: opts.description } : {}),
    ...(opts.jobTitle ? { jobTitle: opts.jobTitle } : {}),
    ...(opts.image
      ? { image: { '@type': 'ImageObject', url: absoluteUrl(opts.image) } }
      : {}),
    ...(opts.sameAs?.length ? { sameAs: opts.sameAs } : {}),
    ...(opts.email ? { email: opts.email } : {}),
    ...(opts.worksFor !== false ? { worksFor: { '@id': ORG_ID } } : {}),
  };
}

export function guideArticleSchema(opts: {
  headline: string;
  description: string;
  url: string;
  datePublished: string;
  dateModified?: string;
  keywords?: string[];
  authorName: string;
  authorUrl: string;
}): Record<string, unknown>[] {
  const article = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: opts.headline,
    description: opts.description,
    datePublished: opts.datePublished,
    dateModified: opts.dateModified || opts.datePublished,
    author: {
      '@type': 'Person',
      name: opts.authorName,
      url: opts.authorUrl,
    },
    publisher: { '@id': ORG_ID },
    mainEntityOfPage: { '@type': 'WebPage', '@id': opts.url },
    url: opts.url,
    image: absoluteUrl('/opengraph-image'),
    isAccessibleForFree: true,
    ...(opts.keywords?.length ? { keywords: opts.keywords.join(', ') } : {}),
  };
  const crumbs = breadcrumbSchema([
    { name: 'Home', url: absoluteUrl('/') },
    { name: 'Guides', url: absoluteUrl('/guides') },
    { name: opts.headline, url: opts.url },
  ]);
  return [article, crumbs];
}

/** Merge multiple JSON-LD objects into one readable @graph block for view source. */
export function mergeJsonLdGraph(schemas: Record<string, unknown>[]): Record<string, unknown> {
  const graph = schemas
    .filter(Boolean)
    .map((schema) => {
      const { '@context': _ctx, ...rest } = schema;
      return rest;
    });
  return {
    '@context': 'https://schema.org',
    '@graph': graph,
  };
}
