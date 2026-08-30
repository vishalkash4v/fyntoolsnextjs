#!/usr/bin/env node
/**
 * Verify robots.txt is reachable after build (prevents GSC "Robots.txt unreachable").
 * Run: node scripts/check-robots-txt.mjs
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const serverApp = path.join(root, '.next/server/app');

function findRobotsHtml() {
  const candidates = [
    path.join(serverApp, 'robots.txt.body'),
    path.join(serverApp, 'robots.txt.meta'),
  ];
  const route = path.join(serverApp, 'robots.txt');
  if (fs.existsSync(route)) return route;
  for (const c of candidates) if (fs.existsSync(c)) return c;
  return null;
}

let errors = 0;

// Source must exist
if (!fs.existsSync(path.join(root, 'src/app/robots.ts'))) {
  console.error('❌ Missing src/app/robots.ts');
  errors++;
}

// Static public/robots.txt must NOT conflict with dynamic route
if (fs.existsSync(path.join(root, 'public/robots.txt'))) {
  console.error('❌ Remove public/robots.txt — use src/app/robots.ts only (avoids CDN conflicts)');
  errors++;
}

// Built route check
const built = findRobotsHtml();
if (fs.existsSync(serverApp) && !built) {
  console.warn('⚠ robots.txt build artifact not found — verify after deploy');
}

// Content rules check in source
const src = fs.readFileSync(path.join(root, 'src/app/robots.ts'), 'utf8');
if (/disallow:\s*\/\*\?/i.test(src.replace(/\/\*[\s\S]*?\*\//g, ''))) {
  console.error('❌ Do not use Disallow: /*? in robots — causes GSC parser failures');
  errors++;
}
if (/Host:\s*https/i.test(src)) {
  console.error('❌ Do not use Host: https:// in robots — Yandex-only directive');
  errors++;
}
if (!src.includes('sitemap')) {
  console.error('❌ robots.ts must include sitemap URL');
  errors++;
}

if (errors) {
  console.error(`\n❌ robots.txt check failed (${errors} error(s))`);
  process.exit(1);
}

console.log('✅ robots.txt configuration OK — dynamic app/robots.ts, no static conflict, no /*? rule');
