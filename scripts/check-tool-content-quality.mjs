#!/usr/bin/env node
/**
 * Audit tool page sections after build — scans static HTML for generic content.
 * Run: npm run build && node scripts/check-tool-content-quality.mjs
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');

const GENERIC_FAQ = [
  'Are there usage limits on',
  'How is FYN Tools',
  'different from random free sites',
];

const GENERIC_EXAMPLE = [
  'Typical inputs for',
  'with a realistic sample',
  'Compare results side-by-side in your notes',
  'Get an instant result you can copy or download — no signup required',
  'Transformed output based on the selected operation',
  'Your input in the form above',
  'Instant result shown below the controls',
  'Before a prenatal visit, tax filing, or project handoff',
];

const FAKE_TESTIMONIAL = [
  'bookmarked on my work laptop',
  'I switched from a cluttered extension to FYN Tools',
  'saves me a few minutes every week',
];

function hasMarker(text, markers) {
  const lower = text.toLowerCase();
  return markers.some((m) => lower.includes(m.toLowerCase()));
}

function findHtmlFiles(dir) {
  const out = [];
  if (!fs.existsSync(dir)) return out;
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, ent.name);
    if (ent.isFile() && ent.name.endsWith('.html')) out.push(p);
    else if (ent.isDirectory()) out.push(...findHtmlFiles(p));
  }
  return out;
}

function slugFromPath(filePath, baseDir) {
  const rel = path.relative(baseDir, filePath).replace(/\\/g, '/');
  if (rel === 'index.html') return '/';
  return '/' + rel.replace(/\/index\.html$/, '').replace(/\.html$/, '');
}

function main() {
  const outDir = path.join(root, 'out');
  const nextDir = path.join(root, '.next/server/app');
  const baseDir = fs.existsSync(outDir) ? outDir : nextDir;
  const files = findHtmlFiles(baseDir).filter((f) => {
    const slug = slugFromPath(f, baseDir);
    return slug !== '/' && !slug.startsWith('/_') && !['/about', '/contact', '/tools', '/privacy', '/terms'].includes(slug);
  });

  if (!files.length) {
    console.warn('⚠ No built HTML found — run npm run build first');
    process.exit(0);
  }

  const issues = [];

  for (const file of files) {
    const html = fs.readFileSync(file, 'utf8');
    const slug = slugFromPath(file, baseDir);

    for (const m of GENERIC_FAQ) {
      if (html.includes(m)) {
        issues.push({ slug, section: 'faqs', detail: `Generic FAQ phrase: "${m}"` });
        break;
      }
    }

    for (const m of GENERIC_EXAMPLE) {
      if (html.includes(m)) {
        issues.push({ slug, section: 'examples', detail: `Generic example phrase: "${m}"` });
        break;
      }
    }

    for (const m of FAKE_TESTIMONIAL) {
      if (html.includes(m)) {
        issues.push({ slug, section: 'testimonials', detail: `Fake testimonial phrase: "${m}"` });
        break;
      }
    }
  }

  if (issues.length) {
    console.error(`\n❌ Tool content quality: ${issues.length} issue(s) in built HTML\n`);
    for (const i of issues.slice(0, 40)) {
      console.error(`  ${i.slug} [${i.section}] ${i.detail}`);
    }
    if (issues.length > 40) console.error(`  ... and ${issues.length - 40} more`);
    process.exit(1);
  }

  console.log(`✅ Tool content quality OK — ${files.length} tool HTML pages scanned`);
}

main();
