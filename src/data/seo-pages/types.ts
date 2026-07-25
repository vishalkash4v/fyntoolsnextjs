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

export interface FullSeoPageContent {
  /** Unique SEO title (without site suffix) */
  title: string;
  /** Unique meta description 140–160 chars preferred */
  metaDescription: string;
  /** Unique H1 */
  h1: string;
  keywords: string[];
  canonicalPath: string;
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
  conclusion: string;
  whenToUse: string[];
  howItWorks: string;
  advantages: string[];
  internalLinkInIntro: SeoInternalLink;
  ogTitle?: string;
  ogDescription?: string;
  twitterTitle?: string;
  twitterDescription?: string;
}
