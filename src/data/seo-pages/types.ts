/**
 * Full-page SEO content types for indexability recovery.
 */

export interface SeoFaq {
  question: string;
  answer: string;
}

export interface SeoUseCase {
  title: string;
  description: string;
}

export interface SeoExample {
  input: string;
  output: string;
}

export interface SeoInternalLink {
  before: string;
  linkText: string;
  href: string;
  after: string;
}

export interface SeoRelatedTool {
  name: string;
  href: string;
  description?: string;
}

/** Visible input/output contract for E-E-A-T / GEO snippets */
export interface SeoIoContract {
  inputs: string;
  outputs: string;
  formats: string;
  limits: string;
  /** e.g. "Client-side (browser)" — must match real behavior */
  processing: string;
}

export interface FullSeoPageContent {
  /** Unique SEO title (without site suffix) */
  title: string;
  /** Unique meta description 140–160 chars preferred */
  metaDescription: string;
  /** Unique H1 */
  h1: string;
  keywords: string[];
  canonicalPath: string;
  /** 40–50 word GEO / AI Overview snippet under H1 */
  tldr: string;
  /** Truthful processing / privacy note (visible badge) */
  processingNote: string;
  /** Data input/output contract table rows */
  ioContract: SeoIoContract;
  /** ISO date YYYY-MM-DD — set when page content first published */
  datePublished?: string;
  /** ISO date YYYY-MM-DD — bump only when SEO body meaningfully changes */
  dateModified?: string;
  /** Multi-paragraph introduction (rendered as shortIntro / what-is) */
  introParagraphs: string[];
  overview: string;
  features: string[];
  benefits: string[];
  howToUse: string[];
  examples: SeoExample[];
  useCases: SeoUseCase[];
  tips: string[];
  commonMistakes: string[];
  faqs: SeoFaq[];
  relatedTools: SeoRelatedTool[];
  relatedGuides?: { title: string; href: string }[];
  testimonials?: Array<{ name: string; rating: number; text: string; title?: string }>;
  conclusion: string;
  whenToUse: string[];
  howItWorks: string;
  advantages: string[];
  internalLinkInIntro: SeoInternalLink;
  toolComparisons?: Array<{
    toolAName: string;
    toolAHref: string;
    toolBName: string;
    toolBHref: string;
    description: string;
  }>;
  relatedSearches?: Array<{ phrase: string; href?: string }>;
  ogTitle?: string;
  ogDescription?: string;
  twitterTitle?: string;
  twitterDescription?: string;
}

/** Partial override shape used by hand-tuned premium content batches. */
export type PremiumPartial = Partial<FullSeoPageContent> & {
  /** Extra body paragraphs rendered after overview (information gain) */
  deepParagraphs?: string[];
};
