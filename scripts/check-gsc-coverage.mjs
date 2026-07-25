/**
 * One-off coverage check: every gsc-exports product URL maps to a Next route.
 * Run: node scripts/check-gsc-coverage.mjs
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '../..');
const j = JSON.parse(fs.readFileSync(path.join(root, 'gsc-exports/affected-urls.json'), 'utf8'));
const tools = fs.readFileSync(path.join(root, 'frontend-next/src/data/toolsData.ts'), 'utf8');
const reg = fs.readFileSync(
  path.join(root, 'frontend-next/src/lib/tools/registry.generated.ts'),
  'utf8'
);
const hubs = [
  'image-tools',
  'text-tools',
  'period-cycle-tools',
  'developer-tools',
  'seo-tools',
  'finance-tools',
  'typing-tools',
  'pregnancy-tools',
  'utility-tools',
  'timer-tools',
  'social-media-tools',
  'business-tools',
  'number-tools',
  'converter-tools',
  'network-tools',
];

const urls = [...j.groupA.urls, ...j.groupB.urls];
const tech = new Set(j.technicalOnly || []);
const aliases = j.canonicalAliases || {};
const miss = [];
let ok = 0;

for (const u of urls) {
  let p = u.replace('https://fyntools.com', '');
  if (
    tech.has(p) ||
    p.includes('?') ||
    p.startsWith('/fyntoolsadmin') ||
    p.includes('google2')
  ) {
    ok++;
    continue;
  }
  p = aliases[p] || p;
  if (['/about', '/contact', '/themes'].includes(p) || p.startsWith('/blog')) {
    ok++;
    continue;
  }
  const slug = p.slice(1);
  if (hubs.includes(slug)) {
    ok++;
    continue;
  }
  if (reg.includes(`"${slug}"`) || tools.includes(`/${slug}`)) ok++;
  else miss.push(p);
}

console.log(`GSC coverage: ${ok}/${urls.length}`);
console.log(miss.length ? `Missing: ${miss.join(', ')}` : 'Missing: none');
process.exit(miss.length ? 1 : 0);
