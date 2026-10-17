#!/usr/bin/env node
/**
 * Regression guard for the service worker: stale document/chunk caches can
 * cause users (and rendered snapshots) to request deleted Next.js chunks.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const swPath = path.join(root, 'public/sw.js');
const sw = fs.readFileSync(swPath, 'utf8');
const errors = [];

if (/caches\.match\(request\)[\s\S]{0,250}return cachedResponse/.test(sw)) {
  errors.push('Do not serve arbitrary cached responses before the network.');
}
if (/STATIC_ASSETS\s*=\s*\[[\s\S]*?['"]\/_next\//.test(sw)) {
  errors.push('Do not pin build-specific Next.js assets in a persistent service-worker cache.');
}
if (!/url\.pathname\.startsWith\('\/_next\/'\)/.test(sw)) {
  errors.push('Next.js assets must bypass service-worker response caching.');
}
if (!/request\.mode === 'navigate'/.test(sw)) {
  errors.push('Navigation requests must be handled explicitly.');
}
if (/caches\.open\(DYNAMIC_CACHE\)[\s\S]{0,200}cache\.put\(request/.test(sw)) {
  errors.push('Do not persist arbitrary dynamic responses in the service worker.');
}

if (errors.length) {
  console.error('Service worker safety check failed:');
  for (const error of errors) console.error(' - ' + error);
  process.exit(1);
}
console.log('Service worker safety check passed.');
