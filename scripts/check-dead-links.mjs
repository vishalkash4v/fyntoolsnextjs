#!/usr/bin/env node
/**
 * Guard against known dead external links in source + author profiles.
 * Run: node scripts/check-dead-links.mjs
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');

const BANNED = [
  'https://twitter.com/fyntoolsworldwide',
  'https://github.com/fyntools',
  'developer.mozilla.org/en-US/docs/Web/API/Canvas_API/Tutorial/Pixel_manipulation"',
  'www.nhs.uk/conditions/period-tracker',
];

const files = [
  'src/data/authors.ts',
  'src/lib/seo/schemas.ts',
  'src/lib/content/fixExternalLinks.ts',
];

let errors = 0;
for (const rel of files) {
  const full = path.join(root, rel);
  const text = fs.readFileSync(full, 'utf8');
  for (const banned of BANNED) {
    if (text.includes(banned) && rel !== 'src/lib/content/fixExternalLinks.ts') {
      console.error(`❌ ${rel} contains banned dead link: ${banned}`);
      errors++;
    }
  }
}

const authors = fs.readFileSync(path.join(root, 'src/data/authors.ts'), 'utf8');
if (/twitter\.com\/fyntoolsworldwide/.test(authors)) {
  console.error('❌ authors.ts still links to dead Twitter profile');
  errors++;
}
if (/github\.com\/fyntools[^w]/.test(authors)) {
  console.error('❌ authors.ts still links to dead GitHub org');
  errors++;
}

if (errors) {
  console.error(`\n❌ Dead link check failed (${errors} issues)`);
  process.exit(1);
}

console.log('✅ Dead link guard OK — author profiles and fix map verified');
