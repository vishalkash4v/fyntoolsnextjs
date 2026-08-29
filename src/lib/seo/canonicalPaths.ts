import type { FullSeoPageContent } from '@/data/seo-pages/types';

/** Legacy or marketing aliases → single canonical tool path */
export const CANONICAL_TOOL_PATHS: Record<string, string> = {
  '/enhanced-unit-converter': '/unit-converter',
  '/add-name-date-photo': '/photo-annotation-tool',
  '/pregnancy-weight-gain': '/pregnancy-weight-gain-calculator',
};

export function canonicalToolPath(path: string): string {
  const normalized = path.startsWith('/')
    ? path.replace(/\/$/, '') || '/'
    : `/${path.replace(/\/$/, '')}`;
  return CANONICAL_TOOL_PATHS[normalized] ?? normalized;
}

const PATH_REPLACEMENTS = Object.entries(CANONICAL_TOOL_PATHS);

function rewritePathStrings(value: string): string {
  let out = value;
  for (const [from, to] of PATH_REPLACEMENTS) {
    out = out.split(from).join(to);
    out = out.split(`https://fyntools.com${from}`).join(`https://fyntools.com${to}`);
  }
  return out;
}

function canonicalizeValue<T>(value: T): T {
  if (typeof value === 'string') return rewritePathStrings(value) as T;
  if (Array.isArray(value)) return value.map(canonicalizeValue) as T;
  if (value && typeof value === 'object') {
    const obj = value as Record<string, unknown>;
    const next: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(obj)) {
      if (k === 'href' && typeof v === 'string') {
        next[k] = canonicalToolPath(v);
      } else {
        next[k] = canonicalizeValue(v);
      }
    }
    return next as T;
  }
  return value;
}

/** Rewrite legacy paths in generated SEO content before render. */
export function canonicalizeSeoContent(content: FullSeoPageContent): FullSeoPageContent {
  return canonicalizeValue({
    ...content,
    canonicalPath: canonicalToolPath(content.canonicalPath),
  });
}
