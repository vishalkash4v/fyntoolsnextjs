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
 * canonical, robots, Open Graph, and Twitter cards.
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
  const canonical = absoluteUrl(path === '/' ? '/' : path);
  const kw = Array.isArray(keywords) ? keywords.join(', ') : keywords;

  // Absolute title — do NOT rely on layout template (prevents " | FYN … | FYN …")
  const fullTitle = title.includes('FYN Tools')
    ? title
    : `${title} | FYN Tools Worldwide`;

  const desc =
    description.length > 160
      ? `${description.slice(0, 157)}...`
      : description.length < 70
        ? `${description} Free online on FYN Tools Worldwide — no signup required.`
        : description;

  return {
    title: { absolute: fullTitle },
    description: desc,
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
      description: desc,
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
      description: desc,
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
