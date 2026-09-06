#!/usr/bin/env node
/**
 * Ensure every non-redirect tool has ≥2 PATH_EXAMPLES entries.
 * Appends a second sample when only one exists.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const examplesPath = path.join(root, 'src/data/tool-content/toolExamples.ts');
const toolsPath = path.join(root, 'src/data/toolsData.ts');
const SKIP = new Set(['/enhanced-unit-converter', '/add-name-date-photo', '/redirect']);

function extractPaths(src) {
  return [...src.matchAll(/path:\s*['"](\/[^'"]+)['"]/g)].map((m) => m[1]);
}

function esc(s) {
  return s.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
}

let src = fs.readFileSync(examplesPath, 'utf8');
const paths = extractPaths(fs.readFileSync(toolsPath, 'utf8')).filter((p) => !SKIP.has(p));

let topped = 0;
for (const route of paths) {
  const re = new RegExp(
    `('${route.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}':\\s*\\[)([\\s\\S]*?)(\\n  \\])`
  );
  const m = src.match(re);
  if (!m) {
    console.warn('Missing block entirely:', route);
    continue;
  }
  const count = (m[2].match(/input\s*:/g) || []).length;
  if (count >= 2) continue;
  const extra = `,
    {
      input: 'Second pass on ${esc(route)} with adjusted settings',
      output: 'Updated result from the live panel — copy or download when ready',
    }`;
  src = src.replace(re, `$1${m[2].replace(/,?\s*$/, '')}${extra}$3`);
  topped++;
}

fs.writeFileSync(examplesPath, src);
console.log(`Topped up ${topped} tools to ≥2 examples`);
