#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');

function extractTools(src) {
  const tools = [];
  for (const block of src.split(/\{\s*id:/).slice(1)) {
    const pathM = block.match(/path:\s*['"](\/[^'"]+)['"]/);
    const name = block.match(/name:\s*['"]([^'"]+)['"]/);
    const category = block.match(/category:\s*['"]([^'"]+)['"]/);
    if (pathM && name) tools.push({ path: pathM[1], name: name[1], category: category || 'Tools' });
  }
  return tools;
}

function extractHowToFromFile(filePath) {
  const map = new Map();
  if (!fs.existsSync(filePath)) return map;
  const src = fs.readFileSync(filePath, 'utf8');
  const pathBlocks = src.split(/^\s*'(\/[^']+)':\s*\{/gm);
  for (let i = 1; i < pathBlocks.length; i += 2) {
    const p = pathBlocks[i];
    const body = pathBlocks[i + 1] || '';
    const m = body.match(/howToUse:\s*\[([\s\S]*?)\n\s*\]/);
    if (m && m[1].includes("'")) {
      const steps = [...m[1].matchAll(/'([^']+)'/g)].map((x) => x[1]);
      if (steps.length >= 3) map.set(p, steps);
    }
  }
  return map;
}

const tools = extractTools(fs.readFileSync(path.join(root, 'src/data/toolsData.ts'), 'utf8'));
const howTo = new Map();
const files = [
  'src/data/tool-content/pageOverrides.ts',
  'src/data/tool-content/batch1.ts',
  'src/data/tool-content/batch2.ts',
  'src/data/tool-content/batch3.ts',
  'src/data/tool-content/batch4.ts',
  'src/data/tool-content/batch5.ts',
  'src/data/tool-content/batch6.ts',
  'src/data/tool-content/batch7.ts',
  'src/data/tool-content/premium/generated.ts',
];
for (const f of files) {
  for (const [p, steps] of extractHowToFromFile(path.join(root, f))) {
    howTo.set(p, steps);
  }
}

const missing = tools.filter((t) => !howTo.has(t.path));
console.log(`Tools: ${tools.length}, with curated howToUse (3+ steps): ${howTo.size}, missing: ${missing.length}`);
for (const t of missing) console.log(`  ${t.path} — ${t.name} (${t.category})`);
