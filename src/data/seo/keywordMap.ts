/**
 * Semrush-backed SEO opportunity map.
 *
 * This is an editorial planning dataset, not a claim that these keywords
 * will rank or that search volume is guaranteed traffic. Refresh from
 * Semrush before making a new page or large content batch.
 */
export type SeoKeywordOpportunity = {
  keyword: string;
  cluster: string;
  targetPath: string;
  database: 'us' | 'in';
  volume: number;
  difficulty: number;
  intent: string;
  action: 'optimize-existing' | 'consider-new-page' | 'supporting-content';
};

export const SEO_KEYWORD_OPPORTUNITIES: SeoKeywordOpportunity[] = [
  {
    keyword: 'url shortener',
    cluster: 'url-sharing',
    targetPath: '/url-shortener',
    database: 'us',
    volume: 49500,
    difficulty: 97,
    intent: 'informational',
    action: 'optimize-existing',
  },
  {
    keyword: 'best url shortener',
    cluster: 'url-sharing',
    targetPath: '/url-shortener',
    database: 'us',
    volume: 1000,
    difficulty: 36,
    intent: 'informational',
    action: 'optimize-existing',
  },
  {
    keyword: 'kutt url shortener',
    cluster: 'url-sharing',
    targetPath: '/url-shortener',
    database: 'us',
    volume: 260,
    difficulty: 11,
    intent: 'informational',
    action: 'supporting-content',
  },
  {
    keyword: 'how do url shorteners work',
    cluster: 'url-sharing',
    targetPath: '/url-shortener',
    database: 'us',
    volume: 90,
    difficulty: 33,
    intent: 'informational',
    action: 'optimize-existing',
  },
  {
    keyword: 'pdf compressor',
    cluster: 'pdf-workflows',
    targetPath: '/pdf-compressor',
    database: 'us',
    volume: 74000,
    difficulty: 67,
    intent: 'informational',
    action: 'optimize-existing',
  },
  {
    keyword: 'pdf file compressor',
    cluster: 'pdf-workflows',
    targetPath: '/pdf-compressor',
    database: 'us',
    volume: 22200,
    difficulty: 65,
    intent: 'informational',
    action: 'optimize-existing',
  },
  {
    keyword: 'compress pdf to 150kb',
    cluster: 'pdf-workflows',
    targetPath: '/pdf-compressor',
    database: 'us',
    volume: 20,
    difficulty: 0,
    intent: 'informational',
    action: 'optimize-existing',
  },
  {
    keyword: 'image resizer',
    cluster: 'image-optimization',
    targetPath: '/image-resizer',
    database: 'us',
    volume: 673000,
    difficulty: 84,
    intent: 'informational',
    action: 'optimize-existing',
  },
  {
    keyword: 'how to resize an image',
    cluster: 'image-optimization',
    targetPath: '/image-resizer',
    database: 'us',
    volume: 6600,
    difficulty: 82,
    intent: 'informational',
    action: 'optimize-existing',
  },
  {
    keyword: 'barcode generator',
    cluster: 'barcode-scanning',
    targetPath: '/barcode-generator',
    database: 'us',
    volume: 823000,
    difficulty: 60,
    intent: 'informational',
    action: 'optimize-existing',
  },
  {
    keyword: 'upc barcode generator',
    cluster: 'barcode-scanning',
    targetPath: '/barcode-generator',
    database: 'us',
    volume: 18100,
    difficulty: 48,
    intent: 'transactional',
    action: 'optimize-existing',
  },
  {
    keyword: 'shopify barcode generator',
    cluster: 'barcode-scanning',
    targetPath: '/barcode-generator',
    database: 'us',
    volume: 2900,
    difficulty: 34,
    intent: 'transactional',
    action: 'supporting-content',
  },
];
