#!/usr/bin/env node
/**
 * Full-site SEO + content audit — scans ALL built HTML after `npm run build`.
 * Run: node scripts/check-full-site-audit.mjs
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const serverApp = path.join(root, '.next/server/app');

const GENERIC_PHRASES = [
  'Are there usage limits on',
  'How is FYN Tools',
  'different from random free sites',
  'bookmarked on my work laptop',
  'Search intent for',
  'locate the input fields at the top of the page',
  'Typical inputs for',
  'with a realistic sample',
  'Compare results side-by-side in your notes',
  'Get an instant result you can copy or download — no signup required',
  'Transformed output based on the selected operation',
  'Handle everyday pregnancy tools needs',
  'Handle everyday number tools needs',
  'Copy-friendly output',
  'When you provide input',
  'covers a need that comes up',
];

const INTERNAL_PAGES = new Set([
  '/_global-error',
  '/_not-found',
  '/fyntoolsadmin',
  '/opengraph-image',
  '/apple-icon.png',
]);

function findHtmlFiles(dir) {
  const out = [];
  if (!fs.existsSync(dir)) return out;
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, ent.name);
    if (ent.isFile() && ent.name.endsWith('.html')) out.push(p);
    else if (ent.isDirectory() && !ent.name.startsWith('_')) out.push(...findHtmlFiles(p));
  }
  return out;
}

function slugFromPath(filePath) {
  const rel = path.relative(serverApp, filePath).replace(/\\/g, '/');
  if (rel === 'index.html') return '/';
  return '/' + rel.replace(/\/index\.html$/, '').replace(/\.html$/, '');
}

function extract(html, re) {
  const m = html.match(re);
  return m ? m[1].trim() : null;
}

function extractAllJsonLd(html) {
  const blocks = [];
  const re = /<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi;
  let m;
  while ((m = re.exec(html)) !== null) {
    try {
      blocks.push(JSON.parse(m[1]));
    } catch {
      blocks.push(null);
    }
  }
  return blocks.filter(Boolean);
}

function getTypes(jsonLdBlocks) {
  const types = new Set();
  for (const block of jsonLdBlocks) {
    const walk = (obj) => {
      if (!obj || typeof obj !== 'object') return;
      if (obj['@type']) {
        const t = obj['@type'];
        if (Array.isArray(t)) t.forEach((x) => types.add(x));
        else types.add(t);
      }
      if (obj['@graph']) obj['@graph'].forEach(walk);
      else Object.values(obj).forEach((v) => (Array.isArray(v) ? v.forEach(walk) : walk(v)));
    };
    walk(block);
  }
  return types;
}

function isToolPage(slug) {
  const skip = [
    '/',
    '/about',
    '/contact',
    '/privacy',
    '/tools',
    '/guides',
    '/blog',
    '/themes',
    '/redirect',
    '/deep-link-redirect',
    '/ai-domain-name-generator',
    '/opengraph-image',
    '/apple-icon.png',
    '/fyntoolsadmin',
  ];
  if (skip.includes(slug)) return false;
  if (slug.startsWith('/blog/') || slug.startsWith('/guides/') || slug.startsWith('/author/')) return false;
  if (slug.startsWith('/s/')) return false;
  if (slug.endsWith('-tools')) return false; // category hub
  return true;
}

function main() {
  if (!fs.existsSync(serverApp)) {
    console.error('❌ Run npm run build first — .next/server/app not found');
    process.exit(1);
  }

  const files = findHtmlFiles(serverApp);
  const issues = [];
  const titles = new Map();
  const descriptions = new Map();
  const stats = {
    total: files.length,
    tools: 0,
    hubs: 0,
    marketing: 0,
    withJsonLd: 0,
    withFaq: 0,
    withHowTo: 0,
    withSoftwareApp: 0,
    genericHits: 0,
    missingMeta: 0,
  };

  for (const file of files) {
    const html = fs.readFileSync(file, 'utf8');
    const slug = slugFromPath(file);
    const pageIssues = [];

    const title = extract(html, /<title>([^<]+)<\/title>/i);
    const desc = extract(html, /<meta\s+name="description"\s+content="([^"]*)"/i);
    const canonical = extract(html, /<link\s+rel="canonical"\s+href="([^"]*)"/i);
    const h1 = extract(html, /<h1[^>]*>([^<]+)<\/h1>/i);
    const ogTitle = extract(html, /<meta\s+property="og:title"\s+content="([^"]*)"/i);
    const ogDesc = extract(html, /<meta\s+property="og:description"\s+content="([^"]*)"/i);
    const robots = extract(html, /<meta\s+name="robots"\s+content="([^"]*)"/i);
    const jsonLd = extractAllJsonLd(html);
    const types = getTypes(jsonLd);

    const tool = isToolPage(slug);
    const hub = slug.endsWith('-tools');
    if (tool) stats.tools++;
    else if (hub) stats.hubs++;
    else stats.marketing++;

    if (jsonLd.length) stats.withJsonLd++;
    if (types.has('FAQPage')) stats.withFaq++;
    if (types.has('HowTo')) stats.withHowTo++;
    if (types.has('SoftwareApplication')) stats.withSoftwareApp++;

    // Meta checks
    if (!title) pageIssues.push({ severity: 'error', msg: 'Missing <title>' });
    else {
      if (title.length < 20) pageIssues.push({ severity: 'warn', msg: `Title too short (${title.length} chars)` });
      if (title.length > 70) pageIssues.push({ severity: 'warn', msg: `Title too long (${title.length} chars)` });
      const key = title.toLowerCase();
      if (!titles.has(key)) titles.set(key, []);
      titles.get(key).push(slug);
    }

    if (!desc) pageIssues.push({ severity: 'error', msg: 'Missing meta description' });
    else {
      if (desc.length < 80) pageIssues.push({ severity: 'warn', msg: `Description short (${desc.length} chars)` });
      if (desc.length > 165) pageIssues.push({ severity: 'warn', msg: `Description long (${desc.length} chars)` });
      const key = desc.slice(0, 80).toLowerCase();
      if (!descriptions.has(key)) descriptions.set(key, []);
      descriptions.get(key).push(slug);
    }

    if (!canonical && !INTERNAL_PAGES.has(slug) && !slug.startsWith('/fyntoolsadmin') && !slug.startsWith('/s/') && slug !== '/themes' && slug !== '/redirect' && slug !== '/deep-link-redirect') {
      pageIssues.push({ severity: 'error', msg: 'Missing canonical' });
    }

    if (!h1 && !INTERNAL_PAGES.has(slug) && !slug.startsWith('/fyntoolsadmin') && !slug.startsWith('/s/')) {
      pageIssues.push({ severity: 'warn', msg: 'Missing visible H1' });
    }

    if (!ogTitle && !INTERNAL_PAGES.has(slug)) pageIssues.push({ severity: 'warn', msg: 'Missing og:title' });
    if (!ogDesc && !INTERNAL_PAGES.has(slug)) pageIssues.push({ severity: 'warn', msg: 'Missing og:description' });

    if (!jsonLd.length && !INTERNAL_PAGES.has(slug) && !slug.startsWith('/fyntoolsadmin') && !slug.startsWith('/s/') && slug !== '/themes' && slug !== '/redirect' && slug !== '/deep-link-redirect') {
      pageIssues.push({ severity: 'error', msg: 'Missing JSON-LD' });
    }

    // Tool-specific schema
    if (tool) {
      if (!types.has('SoftwareApplication')) pageIssues.push({ severity: 'warn', msg: 'Missing SoftwareApplication schema' });
      if (!types.has('WebPage')) pageIssues.push({ severity: 'warn', msg: 'Missing WebPage schema' });
      if (!types.has('BreadcrumbList')) pageIssues.push({ severity: 'warn', msg: 'Missing BreadcrumbList schema' });
      if (!types.has('FAQPage')) pageIssues.push({ severity: 'warn', msg: 'Missing FAQPage schema' });
      if (!html.includes('id="examples"') && !html.includes('Examples')) {
        pageIssues.push({ severity: 'warn', msg: 'Examples section may be missing' });
      }
      if (!html.includes('id="faqs"') && !html.includes('FAQ')) {
        pageIssues.push({ severity: 'warn', msg: 'FAQ section may be missing' });
      }
      if (!html.includes('id="related-tools"') && !html.includes('related tools')) {
        pageIssues.push({ severity: 'warn', msg: 'Related tools section may be missing' });
      }
    }

    if (hub) {
      if (!types.has('CollectionPage')) pageIssues.push({ severity: 'warn', msg: 'Missing CollectionPage schema' });
    }

    // Generic content
    for (const phrase of GENERIC_PHRASES) {
      if (html.includes(phrase)) {
        pageIssues.push({ severity: 'error', msg: `Generic phrase: "${phrase}"` });
        stats.genericHits++;
      }
    }

    // noindex check
    if (slug === '/themes' && robots && !/noindex/i.test(robots)) {
      pageIssues.push({ severity: 'error', msg: '/themes should be noindex' });
    }

    if (pageIssues.length) {
      issues.push({ slug, issues: pageIssues });
      if (pageIssues.some((i) => i.severity === 'error')) stats.missingMeta++;
    }
  }

  // Duplicate titles
  const dupTitles = [...titles.entries()].filter(([, slugs]) => slugs.length > 1);
  const dupDescs = [...descriptions.entries()].filter(([, slugs]) => slugs.length > 1 && slugs.length > 2);

  // Report
  console.log('\n═══════════════════════════════════════════════════');
  console.log('  FYN TOOLS — FULL SITE SEO AUDIT');
  console.log('═══════════════════════════════════════════════════\n');
  console.log(`Pages scanned:        ${stats.total}`);
  console.log(`Tool pages:           ${stats.tools}`);
  console.log(`Category hubs:        ${stats.hubs}`);
  console.log(`Other pages:          ${stats.marketing}`);
  console.log(`With JSON-LD:         ${stats.withJsonLd}`);
  console.log(`With FAQ schema:      ${stats.withFaq}`);
  console.log(`With HowTo schema:    ${stats.withHowTo}`);
  console.log(`With SoftwareApp:     ${stats.withSoftwareApp}`);
  console.log(`Generic phrase hits:  ${stats.genericHits}`);
  console.log(`Pages with errors:    ${issues.filter((i) => i.issues.some((x) => x.severity === 'error')).length}`);
  console.log(`Duplicate titles:     ${dupTitles.length} groups`);
  console.log(`Duplicate descs:      ${dupDescs.length} groups (3+ pages)`);

  const errors = issues.filter((i) => i.issues.some((x) => x.severity === 'error'));
  const warns = issues.filter((i) => i.issues.every((x) => x.severity === 'warn') || i.issues.some((x) => x.severity === 'warn'));

  if (errors.length) {
    console.log('\n── ERRORS (must fix) ──\n');
    for (const { slug, issues: iss } of errors.slice(0, 50)) {
      console.log(`  ${slug}`);
      for (const i of iss.filter((x) => x.severity === 'error')) console.log(`    ✗ ${i.msg}`);
    }
    if (errors.length > 50) console.log(`  ... +${errors.length - 50} more pages with errors`);
  }

  const warnOnly = issues.filter((i) => !i.issues.some((x) => x.severity === 'error'));
  if (warnOnly.length) {
    console.log('\n── WARNINGS (improve) ──\n');
    const warnSummary = {};
    for (const { slug, issues: iss } of warnOnly) {
      for (const i of iss) {
        warnSummary[i.msg] = (warnSummary[i.msg] || 0) + 1;
      }
    }
    for (const [msg, count] of Object.entries(warnSummary).sort((a, b) => b[1] - a[1]).slice(0, 15)) {
      console.log(`  [${count}x] ${msg}`);
    }
  }

  if (dupTitles.length) {
    console.log('\n── DUPLICATE TITLES ──\n');
    for (const [title, slugs] of dupTitles.slice(0, 10)) {
      console.log(`  "${title.slice(0, 55)}..." → ${slugs.join(', ')}`);
    }
  }

  // Write JSON report
  const report = {
    scannedAt: new Date().toISOString(),
    stats,
    duplicateTitles: dupTitles.map(([t, s]) => ({ title: t, pages: s })),
    pagesWithErrors: errors.map(({ slug, issues: iss }) => ({ slug, errors: iss.filter((x) => x.severity === 'error') })),
    pagesWithWarnings: warnOnly.length,
  };
  fs.writeFileSync(path.join(root, 'scripts/.full-site-audit-report.json'), JSON.stringify(report, null, 2));

  const exitCode = errors.filter((e) => !INTERNAL_PAGES.has(e.slug)).length || dupTitles.filter(([, s]) => !s.every((p) => INTERNAL_PAGES.has(p))).length ? 1 : 0;
  console.log(`\n${exitCode ? '❌' : '✅'} Audit complete — report: scripts/.full-site-audit-report.json\n`);
  process.exit(exitCode);
}

main();
