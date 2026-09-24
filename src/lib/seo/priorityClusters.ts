/**
 * SEO priority clusters — a small set of commercially/usefully coherent hubs
 * that receive the strongest internal-link support. This does NOT remove tools
 * from the catalog; it concentrates crawl equity around validated demand assets.
 */
export type SeoPriorityCluster = {
  id: string;
  pillar: string;
  paths: string[];
};

export const SEO_PRIORITY_CLUSTERS: SeoPriorityCluster[] = [
  {
    id: 'url-sharing',
    pillar: '/url-shortener',
    paths: ['/url-shortener', '/qr-code-generator', '/url-slug-generator', '/qr-scanner'],
  },
  {
    id: 'image-optimization',
    pillar: '/image-compressor',
    paths: ['/image-compressor', '/image-resizer', '/image-upscaler', '/image-format-converter', '/image-cropper'],
  },
  {
    id: 'pdf-workflows',
    pillar: '/pdf-compressor',
    paths: ['/pdf-compressor', '/pdf-text-extractor', '/image-to-text'],
  },
  {
    id: 'barcode-scanning',
    pillar: '/barcode-generator',
    paths: ['/barcode-generator', '/barcode-scanner-online'],
  },
  {
    id: 'developer-json',
    pillar: '/json-formatter',
    paths: ['/json-formatter', '/json-validator', '/jwt-decoder', '/base64-converter', '/url-encode-decode', '/dummy-api-generator'],
  },
  {
    id: 'writing-text',
    pillar: '/word-counter',
    paths: ['/word-counter', '/text-case-converter', '/text-font-changer', '/whitespace-remover', '/text-reverser'],
  },
  {
    id: 'finance-calculators',
    pillar: '/income-tax-calculator',
    paths: ['/income-tax-calculator', '/emi-calculator', '/sip-calculator', '/ppf-calculator', '/fd-calculator', '/gst-calculator', '/percentage-calculator'],
  },
  {
    id: 'date-health-calculators',
    pillar: '/period-calculator',
    paths: ['/period-calculator', '/ovulation-calculator', '/safe-days-calculator', '/age-calculator', '/date-difference-calculator', '/future-date-calculator'],
  },
];

const PATH_TO_CLUSTER = new Map<string, SeoPriorityCluster>();
for (const cluster of SEO_PRIORITY_CLUSTERS) {
  for (const path of cluster.paths) PATH_TO_CLUSTER.set(path, cluster);
}

export function getPriorityCluster(path: string): SeoPriorityCluster | null {
  return PATH_TO_CLUSTER.get(path) ?? null;
}

export function getPriorityClusterPeers(path: string): string[] {
  const cluster = getPriorityCluster(path);
  if (!cluster) return [];
  return cluster.paths.filter((candidate) => candidate !== path);
}
