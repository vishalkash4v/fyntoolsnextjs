#!/usr/bin/env node
/**
 * Verify robots.txt is configured for reliable Google crawling.
 * Static public/robots.txt is required (CDN edge) — not a dynamic app route.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
let errors = 0;

const staticRobots = path.join(root, 'public/robots.txt');
const dynamicRobots = path.join(root, 'src/app/robots.ts');

if (!fs.existsSync(staticRobots)) {
  console.error('❌ Missing public/robots.txt — Google needs a static edge-served robots file');
  errors++;
}

if (fs.existsSync(dynamicRobots)) {
  console.error('❌ Remove src/app/robots.ts — use public/robots.txt only (avoids serverless timeouts in GSC)');
  errors++;
}

if (fs.existsSync(staticRobots)) {
  const txt = fs.readFileSync(staticRobots, 'utf8');
  if (/disallow:\s*\/\*\?/i.test(txt)) {
    console.error('❌ Remove Disallow: /*? from robots.txt — breaks Google parser');
    errors++;
  }
  if (/^host:/im.test(txt)) {
    console.error('❌ Remove Host: from robots.txt — not a Google directive');
    errors++;
  }
  if (!/sitemap:\s*https:\/\/fyntools\.com\/sitemap\.xml/i.test(txt)) {
    console.error('❌ robots.txt must include Sitemap: https://fyntools.com/sitemap.xml');
    errors++;
  }
  if (!/disallow:\s*\/s\//im.test(txt)) {
    console.error('❌ robots.txt must Disallow: /s/ — user-generated short links must not be crawled');
    errors++;
  }
  if (txt.length > 500_000) {
    console.error('❌ robots.txt exceeds 500KB Google limit');
    errors++;
  }
}

if (errors) {
  console.error(`\n❌ robots.txt check failed (${errors} error(s))`);
  process.exit(1);
}

console.log('✅ robots.txt OK — static public/robots.txt, no dynamic route, no /*? rule');
