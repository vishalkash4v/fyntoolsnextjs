#!/usr/bin/env node
/**
 * Export SEO inventory for all catalog tools.
 * Run: node scripts/export-seo-inventory.mjs
 * Writes: reports/seo-tool-inventory.json + .csv
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const reportsDir = path.join(root, 'reports');

const TIER1 = new Set([
  '/weather-forecast',
  '/pdf-compressor',
  '/image-compressor',
  '/button-generator',
  '/text-to-handwriting',
  '/word-counter',
  '/url-shortener',
  '/password-generator',
  '/income-tax-calculator',
  '/emi-calculator',
  '/gst-calculator',
  '/sip-calculator',
  '/fd-calculator',
  '/ppf-calculator',
  '/pregnancy-due-date-calculator',
  '/pregnancy-week-calculator',
  '/social-media-downloader',
  '/image-resizer',
  '/image-cropper',
  '/qr-code-generator',
  '/json-formatter',
  '/bmi-calculator',
  '/age-calculator',
  '/unit-converter',
  '/currency-converter',
  '/text-font-changer',
  '/ai-text-rewriter',
  '/invoice-generator',
  '/typing-test',
  '/ip-lookup',
]);

const REDIRECT_ONLY = {
  '/enhanced-unit-converter': '/unit-converter',
  '/add-name-date-photo': '/photo-annotation-tool',
};

const HANDWRITTEN = new Set(['/url-shortener', '/json-formatter']);

function extractTools(src) {
  const tools = [];
  for (const block of src.split(/\{\s*id:/).slice(1)) {
    if (block.trimStart().startsWith('//')) continue;
    const id = block.match(/['"]([^'"]+)['"]/)?.[1];
    const name = block.match(/name:\s*['"]([^'"]+)['"]/)?.[1];
    const description = block.match(/description:\s*['"]([^'"]+)['"]/)?.[1];
    const category = block.match(/category:\s*['"]([^'"]+)['"]/)?.[1];
    const pathM = block.match(/path:\s*['"](\/[^'"]+)['"]/);
    if (!id || !name || !pathM) continue;
    // Skip if the path line is inside a comment block near the match
    const pathLine = block.slice(0, pathM.index).split('\n').pop() || '';
    if (pathLine.includes('//')) continue;
    tools.push({
      id,
      name,
      description: description || name,
      category: category || 'Tools',
      path: pathM[1],
    });
  }
  return tools;
}

function countKeys(src, pattern) {
  return [...src.matchAll(pattern)].map((m) => m[1]);
}

function exampleCountForPath(examplesSrc, route) {
  const re = new RegExp(
    `['"]${route.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}['"]\\s*:\\s*\\[([\\s\\S]*?)\\n  \\]`,
    'm'
  );
  const m = examplesSrc.match(re);
  if (!m) return 0;
  return (m[1].match(/input\s*:/g) || []).length;
}

const toolsSrc = fs.readFileSync(path.join(root, 'src/data/toolsData.ts'), 'utf8');
const factsSrc = fs.readFileSync(path.join(root, 'src/data/tool-content/toolFactCards.ts'), 'utf8');
const examplesSrc = fs.readFileSync(path.join(root, 'src/data/tool-content/toolExamples.ts'), 'utf8');
const overridesSrc = fs.readFileSync(path.join(root, 'src/data/tool-content/pageOverrides.ts'), 'utf8');

const tools = extractTools(toolsSrc).filter((t) => t.path !== '/redirect');
const factKeys = new Set(countKeys(factsSrc, /'(\/[^']+)':\s*\{/g));

const rows = tools.map((t) => {
  const canonical = REDIRECT_ONLY[t.path] || t.path;
  const pageKind = REDIRECT_ONLY[t.path]
    ? 'redirect-only'
    : HANDWRITTEN.has(t.path)
      ? 'handwritten'
      : 'generated';
  const hasFactCard = factKeys.has(t.path);
  const exampleCount = exampleCountForPath(examplesSrc, t.path);
  const hasPathExamples = exampleCount >= 1;
  const hasOverride = overridesSrc.includes(`"${t.path}"`) || overridesSrc.includes(`'${t.path}'`);
  const tier = REDIRECT_ONLY[t.path] ? 'skip' : TIER1.has(t.path) ? '1' : '2';

  let seoStatus = 'tier2_needed';
  if (pageKind === 'redirect-only') seoStatus = 'redirect_skip';
  else if (hasFactCard && exampleCount >= 2 && hasOverride) seoStatus = 'complete';
  else if (TIER1.has(t.path)) seoStatus = 'tier1_needed';
  else seoStatus = 'tier2_needed';

  // Soft complete when examples ≥2 and fact card even without deep override polish
  if (pageKind !== 'redirect-only' && hasFactCard && exampleCount >= 2) {
    seoStatus = TIER1.has(t.path) && !hasOverride ? 'tier1_needed' : 'complete';
  }
  if (pageKind !== 'redirect-only' && hasFactCard && exampleCount >= 2) {
    seoStatus = 'complete';
  } else if (pageKind === 'redirect-only') {
    seoStatus = 'redirect_skip';
  } else if (TIER1.has(t.path)) {
    seoStatus = 'tier1_needed';
  } else {
    seoStatus = 'tier2_needed';
  }

  return {
    name: t.name,
    route: t.path,
    category: t.category,
    canonical,
    pageKind,
    hasFactCard,
    hasPathExamples,
    exampleCount,
    hasOverride,
    hasJsonLdTypes: 'assert-at-build',
    seoStatus,
    tier,
  };
});

fs.mkdirSync(reportsDir, { recursive: true });
const jsonPath = path.join(reportsDir, 'seo-tool-inventory.json');
fs.writeFileSync(jsonPath, JSON.stringify({ generatedAt: new Date().toISOString(), total: rows.length, tools: rows }, null, 2));

const csvHeader = 'name,route,category,canonical,pageKind,hasFactCard,hasPathExamples,exampleCount,hasOverride,seoStatus,tier\n';
const csvBody = rows
  .map((r) =>
    [r.name, r.route, r.category, r.canonical, r.pageKind, r.hasFactCard, r.hasPathExamples, r.exampleCount, r.hasOverride, r.seoStatus, r.tier]
      .map((v) => `"${String(v).replace(/"/g, '""')}"`)
      .join(',')
  )
  .join('\n');
fs.writeFileSync(path.join(reportsDir, 'seo-tool-inventory.csv'), csvHeader + csvBody);

const summary = {
  total: rows.length,
  complete: rows.filter((r) => r.seoStatus === 'complete').length,
  tier1_needed: rows.filter((r) => r.seoStatus === 'tier1_needed').length,
  tier2_needed: rows.filter((r) => r.seoStatus === 'tier2_needed').length,
  redirect_skip: rows.filter((r) => r.seoStatus === 'redirect_skip').length,
  withFactCard: rows.filter((r) => r.hasFactCard).length,
  withExamples2plus: rows.filter((r) => r.exampleCount >= 2).length,
};
console.log(JSON.stringify(summary, null, 2));
console.log('Wrote', jsonPath);
