import type { Metadata } from 'next';
import { absoluteUrl, SITE_URL } from './site';

export type PageMetaInput = {
  title: string;
  description: string;
  path: string;
  keywords?: string | string[];
  noIndex?: boolean;
  ogImage?: string;
  ogImageAlt?: string;
  /** Open Graph type — use "article" for blog posts */
  ogType?: 'website' | 'article';
  publishedTime?: string;
  modifiedTime?: string;
  authors?: string[];
};

/**
 * Build Next.js Metadata with absolute titles (avoids layout template doubling),
 * canonical (query-stripped path), robots, Open Graph, and Twitter cards.
 */
export function buildPageMetadata({
  title,
  description,
  path,
  keywords,
  noIndex = false,
  ogImage = absoluteUrl('/opengraph-image'),
  ogImageAlt,
  ogType = 'website',
  publishedTime,
  modifiedTime,
  authors,
}: PageMetaInput): Metadata {
  // Strip any accidental query/hash from path before canonicalizing
  const cleanPath = (path.split('?')[0] || '/').split('#')[0] || '/';
  const canonical = absoluteUrl(cleanPath === '/' ? '/' : cleanPath);
  const kw = Array.isArray(keywords) ? keywords.join(', ') : keywords;

  // Absolute title — keep roughly 50–65 chars when possible (front-loaded keyword + short brand)
  const brandSuffix = ' | FYN Tools';
  let fullTitle = title.includes('FYN Tools') ? title : `${title}${brandSuffix}`;
  if (fullTitle.length > 65 && !title.includes('FYN Tools')) {
    const maxCore = 65 - brandSuffix.length;
    const core = title.length > maxCore ? `${title.slice(0, maxCore - 1).trim()}…` : title;
    fullTitle = `${core}${brandSuffix}`;
  }

  let finalDesc =
    description.length > 160
      ? `${description.slice(0, 157)}...`
      : description.length < 110
        ? `${description} Free on FYN Tools — no signup.`
        : description;
  if (finalDesc.length > 160) finalDesc = `${finalDesc.slice(0, 157)}...`;

  return {
    title: { absolute: fullTitle },
    description: finalDesc,
    keywords: kw,
    authors: [{ name: 'FYN Tools Worldwide' }],
    creator: 'FYN Tools Worldwide',
    publisher: 'FYN Tools Worldwide',
    category: 'Technology',
    robots: noIndex
      ? { index: false, follow: false, nocache: true }
      : {
          index: true,
          follow: true,
          googleBot: {
            index: true,
            follow: true,
            'max-image-preview': 'large',
            'max-snippet': -1,
            'max-video-preview': -1,
          },
        },
    alternates: {
      canonical,
      languages: { 'en-US': canonical },
    },
    openGraph: {
      title: fullTitle,
      description: finalDesc,
      url: canonical,
      siteName: 'FYN Tools Worldwide',
      locale: 'en_US',
      type: ogType,
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: ogImageAlt || fullTitle,
        },
      ],
      ...(ogType === 'article'
        ? {
            publishedTime,
            modifiedTime: modifiedTime || publishedTime,
            authors: authors || ['FYN Tools Worldwide'],
          }
        : {}),
    },
    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
      description: finalDesc,
      images: [ogImage],
      site: '@fyntoolsworldwide',
      creator: '@fyntoolsworldwide',
    },
    other: {
      'application-name': 'FYN Tools Worldwide',
    },
  };
}

export { SITE_URL };
