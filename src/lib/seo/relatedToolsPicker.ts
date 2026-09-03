import { allTools, type Tool } from '@/data/toolsData';

export type RelatedToolEntry = { name: string; href: string; description: string };

/**
 * Functionally related tools — never random cross-category picks.
 * Mirrors relatedByPath + COMPARISON_COMPATIBLE in toolSeoContent.ts plus pregnancy/period clusters.
 */
const WORKFLOW_LINKS: Record<string, string[]> = {
  '/word-counter': ['/text-case-converter', '/whitespace-remover'],
  '/text-case-converter': ['/word-counter', '/whitespace-remover', '/text-reverser'],
  '/whitespace-remover': ['/duplicate-line-remover', '/text-case-converter'],
  '/duplicate-line-remover': ['/whitespace-remover'],
  '/text-reverser': ['/text-case-converter', '/word-counter'],
  '/text-font-changer': ['/text-case-converter', '/word-counter'],
  '/ai-text-rewriter': ['/text-case-converter', '/word-counter'],
  '/image-compressor': ['/image-resizer', '/image-cropper', '/image-format-converter', '/pdf-compressor'],
  '/image-cropper': ['/image-compressor', '/image-resizer'],
  '/image-resizer': ['/image-compressor', '/image-cropper', '/pdf-compressor'],
  '/image-format-converter': ['/image-compressor', '/image-resizer'],
  '/image-upscaler': ['/image-resizer', '/image-compressor'],
  '/background-remover': ['/image-compressor', '/image-resizer'],
  '/flip-image': ['/image-resizer', '/image-compressor'],
  '/merge-images': ['/split-image', '/image-compressor'],
  '/split-image': ['/merge-images', '/image-compressor'],
  '/pdf-compressor': ['/pdf-text-extractor', '/image-compressor', '/image-resizer'],
  '/pdf-text-extractor': ['/pdf-compressor', '/image-to-text'],
  '/image-to-text': ['/pdf-text-extractor', '/pdf-compressor'],
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
  '/color-converter': ['/color-picker-tool'],
  '/border-radius-generator': ['/box-shadow-generator', '/button-generator', '/color-picker-tool'],
  '/box-shadow-generator': ['/border-radius-generator', '/button-generator'],
  '/button-generator': ['/border-radius-generator', '/box-shadow-generator'],
  '/barcode-generator': ['/barcode-scanner-online'],
  '/sip-calculator': ['/ppf-calculator', '/fd-calculator', '/emi-calculator'],
  '/ppf-calculator': ['/sip-calculator', '/fd-calculator'],
  '/fd-calculator': ['/sip-calculator', '/ppf-calculator'],
  '/emi-calculator': ['/sip-calculator', '/simple-calculator'],
  '/simple-calculator': ['/percentage-calculator', '/emi-calculator'],
  '/percentage-calculator': ['/simple-calculator'],
  '/bmi-calculator': ['/age-calculator', '/pregnancy-weight-gain-calculator'],
  '/currency-converter': ['/unit-converter', '/enhanced-unit-converter'],
  '/unit-converter': ['/enhanced-unit-converter', '/temperature-converter', '/currency-converter'],
  '/enhanced-unit-converter': ['/unit-converter', '/temperature-converter'],
  '/temperature-converter': ['/unit-converter', '/enhanced-unit-converter'],
  '/meta-tag-previewer': ['/url-slug-generator'],
  '/url-slug-generator': ['/meta-tag-previewer'],
  '/stopwatch': ['/countdown-timer'],
  '/countdown-timer': ['/stopwatch'],
  '/typing-tutor': ['/typing-competition'],
  '/typing-competition': ['/typing-tutor'],
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
  '/coin-flip': ['/dice-roller', '/random-number-generator'],
  '/dice-roller': ['/coin-flip', '/random-number-generator'],
  '/random-number-generator': ['/password-generator', '/dice-roller'],
  '/social-media-planner': ['/social-media-deep-link-generator', '/social-media-downloader'],
  '/social-media-deep-link-generator': ['/social-media-planner', '/url-shortener'],
  '/social-media-downloader': ['/social-media-planner'],
  '/invoice-generator': ['/trip-expense-splitter'],
  '/trip-expense-splitter': ['/invoice-generator', '/simple-calculator'],
  '/table-to-json-converter': ['/json-formatter', '/json-validator'],
  '/text-to-handwriting': ['/text-font-changer'],
  '/add-name-date-photo': ['/image-resizer', '/image-compressor'],
};

const SKIP_RELATED = new Set(['/enhanced-unit-converter', '/themes']);

/** Bidirectional workflow link check. */
export function isWorkflowLinked(from: string, to: string): boolean {
  if (WORKFLOW_LINKS[from]?.includes(to)) return true;
  if (WORKFLOW_LINKS[to]?.includes(from)) return true;
  return false;
}

export function isRelatedToolValid(tool: Tool, href: string): boolean {
  if (href === tool.path || SKIP_RELATED.has(href)) return false;
  const other = allTools.find((t) => t.path === href);
  if (!other) return false;
  if (other.category === tool.category) return true;
  return isWorkflowLinked(tool.path, href);
}

function toEntry(href: string): RelatedToolEntry | null {
  const t = allTools.find((x) => x.path === href);
  if (!t) return null;
  return { name: t.name, href: t.path, description: t.description.slice(0, 110) };
}

/** Build related tools: workflow links → same category. Never random cross-category. */
export function getRelatedToolsForPage(path: string, limit = 10): RelatedToolEntry[] {
  const tool = allTools.find((t) => t.path === path);
  if (!tool) return [];

  const seen = new Set<string>([path]);
  const out: RelatedToolEntry[] = [];

  const add = (href: string) => {
    if (seen.has(href) || !isRelatedToolValid(tool, href)) return;
    const entry = toEntry(href);
    if (!entry) return;
    seen.add(href);
    out.push(entry);
  };

  for (const href of WORKFLOW_LINKS[path] ?? []) add(href);

  for (const t of allTools) {
    if (out.length >= limit) break;
    if (t.path === path || t.category !== tool.category || SKIP_RELATED.has(t.path)) continue;
    add(t.path);
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
    if (seen.has(c.href) || !isRelatedToolValid(tool, c.href)) continue;
    seen.add(c.href);
    out.push({
      name: c.name,
      href: c.href,
      description: (c.description ?? allTools.find((t) => t.path === c.href)?.description ?? '').slice(0, 110),
    });
  }
  return out;
}
