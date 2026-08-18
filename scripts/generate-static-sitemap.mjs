/**
 * One-shot generator for public/sitemap.xml — run manually when URLs change.
 * Usage: node scripts/generate-static-sitemap.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SITE = 'https://fyntools.com';
const LASTMOD = '2026-08-18';

const TOP = new Set([
  '/period-calculator',
  '/ip-lookup',
  '/future-date-calculator',
  '/date-difference-calculator',
  '/barcode-generator',
  '/url-shortener',
  '/image-upscaler',
  '/word-counter',
  '/password-generator',
  '/yes-no-generator',
  '/whitespace-remover',
]);

const TOP_BLOGS = new Set([
  '/blog/know-my-next-period',
  '/blog/tinyurl-vs-bitly-vs-fyntools-best-url-shortener',
]);

/** Soft-duplicate aliases — 301 elsewhere, never list in sitemap */
const SKIP = new Set(['enhanced-unit-converter', 'add-name-date-photo']);

const TOOL_SLUGS = [
  'age-calculator', 'ai-text-rewriter', 'baby-kick-counter', 'background-remover',
  'barcode-generator', 'barcode-scanner-online', 'base64-converter', 'blur-image',
  'bmi-calculator', 'border-radius-generator', 'box-shadow-generator',
  'business-idea-generator', 'button-generator', 'coin-flip', 'color-converter',
  'color-palette-generator', 'color-picker-tool', 'conception-date-calculator',
  'contraction-timer', 'countdown-timer', 'css-minifier', 'currency-converter',
  'daily-task-report-saver', 'date-difference-calculator', 'dice-roller',
  'discord-formatter', 'dummy-api-generator', 'duplicate-line-remover',
  'emi-calculator', 'fd-calculator', 'flip-image', 'future-date-calculator',
  'gradient-generator', 'gst-calculator', 'hash-generator', 'hashtag-generator',
  'html-formatter', 'image-compressor', 'image-cropper', 'image-format-converter',
  'image-metadata-viewer', 'image-resizer', 'image-to-text', 'image-upscaler',
  'income-tax-calculator', 'invert-image-colors', 'invoice-generator',
  'ip-address-to-location-finder', 'ip-lookup', 'javascript-minifier',
  'json-formatter', 'json-validator', 'jwt-decoder', 'list-randomizer',
  'live-preview', 'logo-to-favicon', 'lorem-ipsum-generator', 'markdown-editor',
  'merge-images', 'meta-tag-previewer', 'name-generator', 'notes',
  'ovulation-calculator', 'password-generator', 'pdf-text-extractor',
  'percentage-calculator', 'period-calculator', 'period-tracker',
  'photo-annotation-tool', 'pixelate-tool', 'placeholder-image-generator',
  'pms-symptom-tracker', 'ppf-calculator', 'pregnancy-diet-planner',
  'pregnancy-due-date-calculator', 'pregnancy-week-calculator',
  'pregnancy-weight-gain-calculator', 'qr-code-generator', 'qr-scanner',
  'random-number-generator', 'regex-tester', 'safe-days-calculator',
  'simple-calculator', 'sip-calculator', 'social-media-db-viewer',
  'social-media-deep-link-generator', 'social-media-downloader',
  'social-media-planner', 'split-image', 'stopwatch', 'svg-optimizer',
  'table-to-json-converter', 'temperature-converter', 'text-case-converter',
  'text-font-changer', 'text-reverser', 'text-to-handwriting', 'text-to-speech',
  'timestamp-converter', 'timetable-maker', 'todo-list', 'trip-expense-splitter',
  'typing-competition', 'typing-games', 'typing-test', 'typing-tutor',
  'unit-converter', 'url-encode-decode', 'url-shortener', 'url-slug-generator',
  'username-generator', 'weather-forecast', 'whitespace-remover', 'word-counter',
  'xml-sitemap-tester', 'yes-no-generator',
];

const HUBS = [
  'image-tools', 'text-tools', 'developer-tools', 'network-tools', 'pdf-tools',
  'seo-tools', 'security-tools', 'converter-tools', 'finance-tools', 'typing-tools',
  'pregnancy-tools', 'period-cycle-tools', 'utility-tools', 'timer-tools',
  'social-media-tools', 'business-tools', 'number-tools',
];

const GUIDES = [
  'url-shortener-best-practices',
  'json-formatter-api-debugging',
  'word-count-seo-writing',
  'password-generator-hygiene',
  'qr-codes-for-print-and-packaging',
  'browser-privacy-free-online-tools',
];

const BLOGS = [
  { slug: '7-best-free-bitly-alternatives-in-2026-no-limits', date: '2026-06-30' },
  { slug: 'best-barcode-generator-2026-top-picks', date: '2026-05-17' },
  { slug: 'iphone-67w-charger-safe-for-iphone-2026-guide', date: '2026-05-10' },
  { slug: 'know-my-next-period', date: '2026-03-11' },
  { slug: 'india-vs-nz-t20-wc-final-2026-our-pick', date: '2026-03-09' },
  { slug: 'tinyurl-vs-bitly-vs-fyntools-best-url-shortener', date: '2026-03-07' },
  { slug: 'fyn-tools-top-ai-rewriter-for-2026', date: '2026-03-07' },
];

const entries = [];

function add(loc, priority, changefreq, lastmod = LASTMOD) {
  entries.push({
    loc: loc === '' ? SITE + '/' : SITE + loc,
    priority,
    changefreq,
    lastmod,
  });
}

add('', 1.0, 'daily');
add('/tools', 0.9, 'daily');
add('/guides', 0.85, 'weekly');
add('/blog', 0.85, 'weekly');
add('/about', 0.7, 'monthly');
add('/contact', 0.65, 'monthly');
add('/ai-domain-name-generator', 0.75, 'weekly');
add('/author/fyn-editorial', 0.6, 'monthly');

for (const h of HUBS) add(`/${h}`, 0.85, 'weekly');
for (const g of GUIDES) add(`/guides/${g}`, 0.8, 'monthly');

for (const b of BLOGS) {
  const p = `/blog/${b.slug}`;
  add(p, TOP_BLOGS.has(p) ? 0.95 : 0.75, 'monthly', b.date);
}

for (const slug of TOOL_SLUGS) {
  if (SKIP.has(slug)) continue;
  const p = `/${slug}`;
  add(p, TOP.has(p) ? 0.95 : 0.8, 'weekly');
}

let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';
for (const e of entries) {
  xml += '  <url>\n';
  xml += `    <loc>${e.loc}</loc>\n`;
  xml += `    <lastmod>${e.lastmod}</lastmod>\n`;
  xml += `    <changefreq>${e.changefreq}</changefreq>\n`;
  xml += `    <priority>${e.priority.toFixed(2)}</priority>\n`;
  xml += '  </url>\n';
}
xml += '</urlset>\n';

const out = path.join(__dirname, '..', 'public', 'sitemap.xml');
fs.writeFileSync(out, xml, 'utf8');
console.log(`Wrote ${entries.length} URLs to ${out}`);
