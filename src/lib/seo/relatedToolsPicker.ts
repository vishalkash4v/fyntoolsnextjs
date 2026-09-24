import { allTools, type Tool } from '@/data/toolsData';
import { getCategoryHubPath } from '@/utils/breadcrumbs';
import { getPriorityClusterPeers } from '@/lib/seo/priorityClusters';

export type RelatedToolEntry = { name: string; href: string; description: string };

/**
 * Functionally related tools — never random cross-category picks.
 * Mirrors relatedByPath + COMPARISON_COMPATIBLE in toolSeoContent.ts plus pregnancy/period clusters.
 */
const WORKFLOW_LINKS: Record<string, string[]> = {
  '/word-counter': ['/text-case-converter', '/whitespace-remover', '/meta-tag-previewer'],
  '/text-case-converter': ['/word-counter', '/whitespace-remover', '/text-reverser'],
  '/whitespace-remover': ['/duplicate-line-remover', '/text-case-converter'],
  '/duplicate-line-remover': ['/whitespace-remover'],
  '/text-reverser': ['/text-case-converter', '/word-counter'],
  '/text-font-changer': ['/text-case-converter', '/word-counter'],
  '/ai-text-rewriter': ['/text-case-converter', '/word-counter'],
  '/regex-tester': ['/word-counter', '/text-case-converter', '/whitespace-remover'],
  '/lorem-ipsum-generator': ['/word-counter', '/text-case-converter', '/list-randomizer'],
  '/image-compressor': ['/image-resizer', '/image-cropper', '/image-format-converter', '/pdf-compressor'],
  '/image-cropper': ['/image-compressor', '/image-resizer'],
  '/image-resizer': ['/image-compressor', '/image-cropper', '/pdf-compressor', '/photo-annotation-tool'],
  '/image-format-converter': ['/image-compressor', '/image-resizer', '/photo-annotation-tool'],
  '/image-upscaler': ['/image-resizer', '/image-compressor', '/photo-annotation-tool'],
  '/background-remover': ['/image-compressor', '/image-resizer', '/photo-annotation-tool'],
  '/flip-image': ['/image-resizer', '/image-compressor'],
  '/merge-images': ['/split-image', '/image-compressor'],
  '/split-image': ['/merge-images', '/image-compressor'],
  '/pixelate-tool': ['/blur-image', '/invert-image-colors', '/image-compressor'],
  '/blur-image': ['/pixelate-tool', '/invert-image-colors', '/image-compressor'],
  '/invert-image-colors': ['/blur-image', '/pixelate-tool', '/image-format-converter'],
  '/photo-annotation-tool': ['/image-resizer', '/image-compressor', '/blur-image', '/background-remover'],
  '/svg-optimizer': ['/image-format-converter', '/image-compressor', '/logo-to-favicon'],
  '/image-metadata-viewer': ['/image-compressor', '/image-format-converter', '/photo-annotation-tool'],
  '/color-palette-generator': ['/color-picker-tool', '/color-converter', '/gradient-generator'],
  '/pdf-compressor': ['/pdf-text-extractor', '/image-compressor', '/image-resizer'],
  '/pdf-text-extractor': ['/pdf-compressor', '/image-to-text'],
  '/image-to-text': ['/pdf-text-extractor', '/pdf-compressor', '/photo-annotation-tool'],
  '/logo-to-favicon': ['/image-resizer', '/image-format-converter'],
  '/placeholder-image-generator': ['/image-resizer'],
  '/json-formatter': ['/json-validator'],
  '/json-validator': ['/json-formatter'],
  '/qr-code-generator': ['/qr-scanner', '/url-shortener'],
  '/qr-scanner': ['/qr-code-generator'],
  '/url-shortener': ['/qr-code-generator'],
  '/password-generator': ['/hash-generator', '/random-number-generator'],
  '/hash-generator': ['/password-generator'],
  '/base64-converter': ['/url-encode-decode', '/jwt-decoder'],
  '/url-encode-decode': ['/base64-converter'],
  '/jwt-decoder': ['/base64-converter'],
  '/timestamp-converter': ['/date-difference-calculator', '/future-date-calculator', '/age-calculator'],
  '/date-difference-calculator': ['/timestamp-converter', '/age-calculator', '/future-date-calculator'],
  '/future-date-calculator': ['/timestamp-converter', '/date-difference-calculator'],
  '/age-calculator': ['/date-difference-calculator', '/timestamp-converter', '/bmi-calculator'],
  '/color-picker-tool': ['/color-converter', '/border-radius-generator', '/box-shadow-generator'],
  '/color-converter': ['/color-picker-tool', '/color-palette-generator'],
  '/border-radius-generator': ['/box-shadow-generator', '/button-generator', '/color-picker-tool'],
  '/box-shadow-generator': ['/border-radius-generator', '/button-generator'],
  '/button-generator': ['/border-radius-generator', '/box-shadow-generator'],
  '/gradient-generator': ['/color-picker-tool', '/color-palette-generator', '/css-minifier'],
  '/barcode-generator': ['/barcode-scanner-online'],
  '/barcode-scanner-online': ['/barcode-generator'],
  '/sip-calculator': ['/ppf-calculator', '/fd-calculator', '/emi-calculator', '/gst-calculator'],
  '/ppf-calculator': ['/sip-calculator', '/fd-calculator', '/income-tax-calculator'],
  '/fd-calculator': ['/sip-calculator', '/ppf-calculator', '/simple-calculator'],
  '/emi-calculator': ['/sip-calculator', '/simple-calculator', '/gst-calculator'],
  '/simple-calculator': ['/percentage-calculator', '/emi-calculator', '/gst-calculator'],
  '/percentage-calculator': ['/simple-calculator', '/gst-calculator'],
  '/gst-calculator': ['/emi-calculator', '/sip-calculator', '/simple-calculator', '/income-tax-calculator'],
  '/income-tax-calculator': ['/gst-calculator', '/sip-calculator', '/ppf-calculator', '/simple-calculator'],
  '/bmi-calculator': ['/age-calculator', '/pregnancy-weight-gain-calculator'],
  '/currency-converter': ['/unit-converter', '/enhanced-unit-converter'],
  '/unit-converter': ['/enhanced-unit-converter', '/temperature-converter', '/currency-converter'],
  '/enhanced-unit-converter': ['/unit-converter', '/temperature-converter'],
  '/temperature-converter': ['/unit-converter', '/enhanced-unit-converter'],
  '/meta-tag-previewer': ['/url-slug-generator', '/word-counter', '/xml-sitemap-tester'],
  '/url-slug-generator': ['/meta-tag-previewer'],
  '/markdown-editor': ['/html-formatter', '/live-preview', '/javascript-minifier'],
  '/javascript-minifier': ['/css-minifier', '/html-formatter', '/json-formatter'],
  '/css-minifier': ['/javascript-minifier', '/html-formatter', '/gradient-generator'],
  '/html-formatter': ['/markdown-editor', '/css-minifier', '/live-preview'],
  '/live-preview': ['/html-formatter', '/markdown-editor', '/css-minifier'],
  '/dummy-api-generator': ['/json-formatter', '/json-validator', '/table-to-json-converter'],
  '/xml-sitemap-tester': ['/meta-tag-previewer', '/url-slug-generator'],
  '/stopwatch': ['/countdown-timer', '/timestamp-converter', '/date-difference-calculator', '/future-date-calculator'],
  '/countdown-timer': ['/stopwatch', '/timestamp-converter', '/date-difference-calculator'],
  '/typing-tutor': ['/typing-competition', '/typing-test', '/typing-games'],
  '/typing-competition': ['/typing-tutor', '/typing-test', '/typing-games'],
  '/typing-test': ['/typing-tutor', '/typing-competition', '/typing-games'],
  '/typing-games': ['/typing-tutor', '/typing-test', '/typing-competition'],
  '/todo-list': ['/notes', '/daily-task-report-saver'],
  '/notes': ['/todo-list'],
  '/daily-task-report-saver': ['/todo-list'],
  '/timetable-maker': ['/todo-list', '/notes'],
  '/period-calculator': ['/ovulation-calculator', '/safe-days-calculator', '/period-tracker', '/pms-symptom-tracker'],
  '/ovulation-calculator': ['/period-calculator', '/safe-days-calculator', '/conception-date-calculator'],
  '/safe-days-calculator': ['/ovulation-calculator', '/period-calculator'],
  '/period-tracker': ['/period-calculator', '/pms-symptom-tracker', '/ovulation-calculator'],
  '/pms-symptom-tracker': ['/period-tracker', '/period-calculator'],
  '/pregnancy-due-date-calculator': [
    '/pregnancy-week-calculator',
    '/conception-date-calculator',
    '/pregnancy-weight-gain-calculator',
    '/pregnancy-diet-planner',
    '/baby-kick-counter',
    '/contraction-timer',
  ],
  '/pregnancy-week-calculator': [
    '/pregnancy-due-date-calculator',
    '/conception-date-calculator',
    '/pregnancy-weight-gain-calculator',
    '/pregnancy-diet-planner',
  ],
  '/conception-date-calculator': [
    '/pregnancy-due-date-calculator',
    '/pregnancy-week-calculator',
    '/ovulation-calculator',
  ],
  '/pregnancy-weight-gain-calculator': [
    '/pregnancy-week-calculator',
    '/pregnancy-due-date-calculator',
    '/bmi-calculator',
  ],
  '/pregnancy-diet-planner': [
    '/pregnancy-week-calculator',
    '/pregnancy-weight-gain-calculator',
  ],
  '/baby-kick-counter': ['/contraction-timer', '/pregnancy-week-calculator'],
  '/contraction-timer': ['/baby-kick-counter', '/pregnancy-due-date-calculator'],
  '/coin-flip': ['/dice-roller', '/random-number-generator', '/yes-no-generator'],
  '/dice-roller': ['/coin-flip', '/random-number-generator'],
  '/random-number-generator': ['/password-generator', '/dice-roller', '/list-randomizer'],
  '/yes-no-generator': ['/coin-flip', '/list-randomizer', '/random-number-generator'],
  '/list-randomizer': ['/random-number-generator', '/yes-no-generator', '/name-generator'],
  '/name-generator': ['/username-generator', '/list-randomizer', '/business-idea-generator'],
  '/username-generator': ['/name-generator', '/password-generator', '/hashtag-generator'],
  '/hashtag-generator': ['/username-generator', '/social-media-planner', '/discord-formatter'],
  '/discord-formatter': ['/hashtag-generator', '/markdown-editor', '/text-case-converter'],
  '/business-idea-generator': ['/name-generator', '/invoice-generator'],
  '/ip-lookup': ['/ip-address-to-location-finder', '/weather-forecast'],
  '/ip-address-to-location-finder': ['/ip-lookup', '/weather-forecast'],
  '/weather-forecast': ['/ip-lookup', '/ip-address-to-location-finder'],
  '/social-media-planner': ['/social-media-deep-link-generator', '/social-media-downloader', '/hashtag-generator'],
  '/social-media-deep-link-generator': ['/social-media-planner', '/url-shortener'],
  '/social-media-downloader': ['/social-media-planner', '/social-media-db-viewer'],
  '/social-media-db-viewer': ['/social-media-downloader', '/social-media-planner'],
  '/text-to-speech': ['/word-counter', '/text-case-converter'],
  '/invoice-generator': ['/trip-expense-splitter', '/business-idea-generator'],
  '/trip-expense-splitter': ['/invoice-generator', '/simple-calculator'],
  '/table-to-json-converter': ['/json-formatter', '/json-validator', '/dummy-api-generator'],
  '/text-to-handwriting': ['/text-font-changer'],
};

const SKIP_RELATED = new Set(['/enhanced-unit-converter', '/add-name-date-photo', '/themes']);

/** Soft-dupe groups: max picks from a sibling stem family when filling. */
const SOFT_DUPE_GROUPS: { paths: string[]; max: number }[] = [
  { paths: ['/unit-converter', '/enhanced-unit-converter'], max: 1 },
  { paths: ['/typing-tutor', '/typing-test', '/typing-games', '/typing-competition'], max: 2 },
  { paths: ['/add-name-date-photo', '/photo-annotation-tool'], max: 1 },
];

const HIDDEN_TOOL_IDS = new Set(['enhanced-unit-converter', 'add-name-date-photo']);

function canonicalizeToolHref(href: string): string {
  if (href === '/add-name-date-photo') return '/photo-annotation-tool';
  if (href === '/enhanced-unit-converter') return '/unit-converter';
  return href;
}

function softDupeGroupFor(path: string): { paths: string[]; max: number } | null {
  return SOFT_DUPE_GROUPS.find((g) => g.paths.includes(path)) ?? null;
}

function softDupeAllows(picked: Set<string>, candidate: string): boolean {
  const group = softDupeGroupFor(candidate);
  if (!group) return true;
  const already = group.paths.filter((p) => picked.has(p)).length;
  if (already >= group.max && !picked.has(candidate)) return false;
  return true;
}

/** Stable hash for fair rotation (not Math.random). */
function stableHash(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/** Inbound mention count across WORKFLOW_LINKS values. */
function inboundWorkflowCount(path: string): number {
  let n = 0;
  for (const targets of Object.values(WORKFLOW_LINKS)) {
    if (targets.includes(path)) n++;
  }
  return n;
}

/** Word-boundary trim to ≤ maxLen (default 110). */
export function trimIntentBlurb(text: string, maxLen = 110): string {
  const t = text.trim().replace(/\s+/g, ' ');
  if (t.length <= maxLen) return t;
  const slice = t.slice(0, maxLen);
  const lastSpace = slice.lastIndexOf(' ');
  const cut = lastSpace > 40 ? slice.slice(0, lastSpace) : slice;
  return `${cut.replace(/[.,;:!?-]+$/, '')}…`;
}

export function relatedToolDescription(name: string, description: string): string {
  const first = description.trim().replace(/\s+/g, ' ').slice(0, 90);
  const trimmed = trimIntentBlurb(first, 90);
  return trimIntentBlurb(`Continue with ${name}: ${trimmed}`, 110);
}

/** Bidirectional workflow link check. */
export function isWorkflowLinked(from: string, to: string): boolean {
  if (WORKFLOW_LINKS[from]?.includes(to)) return true;
  if (WORKFLOW_LINKS[to]?.includes(from)) return true;
  return false;
}

export function isRelatedToolValid(tool: Tool, href: string): boolean {
  const canonical = canonicalizeToolHref(href);
  if (canonical === tool.path || SKIP_RELATED.has(href) || SKIP_RELATED.has(canonical)) return false;
  const other = allTools.find((t) => t.path === canonical && !HIDDEN_TOOL_IDS.has(t.id));
  if (!other) return false;
  if (other.category === tool.category) return true;
  return isWorkflowLinked(tool.path, canonical);
}

function toEntry(href: string): RelatedToolEntry | null {
  const canonical = canonicalizeToolHref(href);
  const t = allTools.find((x) => x.path === canonical && !HIDDEN_TOOL_IDS.has(x.id));
  if (!t) return null;
  return {
    name: t.name,
    href: canonical,
    description: relatedToolDescription(t.name, t.description),
  };
}

/** Build related tools: workflow links → fair same-category fill → hub CTA. Never random cross-category. */
export function getRelatedToolsForPage(path: string, limit = 10): RelatedToolEntry[] {
  const tool = allTools.find((t) => t.path === path);
  if (!tool) return [];

  const seen = new Set<string>([path]);
  const out: RelatedToolEntry[] = [];

  const add = (href: string, respectSoftDupe = false) => {
    if (seen.has(href) || !isRelatedToolValid(tool, href)) return;
    if (respectSoftDupe && !softDupeAllows(seen, href)) return;
    const entry = toEntry(href);
    if (!entry) return;
    seen.add(href);
    out.push(entry);
  };

  for (const href of WORKFLOW_LINKS[path] ?? []) add(href);

  // Give validated priority clusters stronger internal-link support than generic
  // same-category rotation. This concentrates equity without deleting long-tail tools.
  for (const href of getPriorityClusterPeers(path)) add(href, true);

  const sameCat = allTools
    .filter(
      (t) =>
        t.path !== path &&
        t.category === tool.category &&
        !HIDDEN_TOOL_IDS.has(t.id) &&
        !SKIP_RELATED.has(t.path)
    )
    .map((t) => t.path)
    .sort((a, b) => {
      const inboundDiff = inboundWorkflowCount(a) - inboundWorkflowCount(b);
      if (inboundDiff !== 0) return inboundDiff;
      return stableHash(`${a}|${path}`) - stableHash(`${b}|${path}`);
    });

  for (const href of sameCat) {
    if (out.length >= limit) break;
    add(href, true);
  }

  if (out.length < limit) {
    const hub = getCategoryHubPath(tool.category);
    if (hub && !seen.has(hub)) {
      out.push({
        name: `All ${tool.category}`,
        href: hub,
        description: `Browse the full ${tool.category} hub on FYN Tools`,
      });
    }
  }

  return out.slice(0, limit);
}

/** Filter candidate related tools; return only valid entries. */
export function filterValidRelatedTools(
  tool: Tool,
  candidates: { name: string; href: string; description?: string }[] | undefined
): RelatedToolEntry[] {
  if (!candidates?.length) return [];
  const out: RelatedToolEntry[] = [];
  const seen = new Set<string>([tool.path]);
  for (const c of candidates) {
    const href = canonicalizeToolHref(c.href);
    if (seen.has(href) || !isRelatedToolValid(tool, href)) continue;
    seen.add(href);
    const desc =
      c.description ?? allTools.find((t) => t.path === href && !HIDDEN_TOOL_IDS.has(t.id))?.description ?? '';
    out.push({
      name: c.name,
      href,
      description: relatedToolDescription(c.name, desc),
    });
  }
  return out;
}

/** Exported for CI: paths that appear as keys in WORKFLOW_LINKS. */
export function getWorkflowLinkKeys(): string[] {
  return Object.keys(WORKFLOW_LINKS);
}
