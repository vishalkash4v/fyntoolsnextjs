import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dir = path.resolve(__dirname, '../../frontend/src/pages/tools');
const out = path.resolve(__dirname, '../src/data/tool-content/toolTestimonials.ts');

function extractBalanced(src, startIdx) {
  const open = src[startIdx];
  const close = open === '[' ? ']' : '}';
  let depth = 0;
  for (let i = startIdx; i < src.length; i++) {
    if (src[i] === open) depth++;
    else if (src[i] === close) {
      depth--;
      if (depth === 0) return src.slice(startIdx, i + 1);
    }
  }
  return null;
}

function filenameToPath(file) {
  const base = file.replace(/Page\.tsx$/, '');
  return (
    '/' +
    base
      .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
      .replace(/([A-Z])([A-Z][a-z])/g, '$1-$2')
      .toLowerCase()
  );
}

const map = {};
for (const file of fs.readdirSync(dir).filter((f) => f.endsWith('Page.tsx'))) {
  const src = fs.readFileSync(path.join(dir, file), 'utf8');
  const m = /(?:const|let)\s+testimonials\s*=\s*(\[)/.exec(src);
  if (!m) continue;
  const block = extractBalanced(src, m.index + m[0].length - 1);
  if (!block) continue;
  let data;
  try {
    data = Function(`"use strict"; return (${block});`)();
  } catch {
    continue;
  }
  let toolPath = null;
  const cm = src.match(/canonicalUrl=["']https?:\/\/[^"']+(\/[^"']+)["']/);
  if (cm) toolPath = cm[1].replace(/\/$/, '');
  if (!toolPath) {
    const cm2 = src.match(/canonicalUrl:\s*["']https?:\/\/[^"']+(\/[^"']+)["']/);
    if (cm2) toolPath = cm2[1].replace(/\/$/, '');
  }
  if (!toolPath) toolPath = filenameToPath(file);
  if (Array.isArray(data) && data.length) {
    map[toolPath] = data.map((t) => ({
      name: t.name,
      rating: t.rating || 5,
      text: t.text,
      title: t.title || undefined,
    }));
  }
}

const header = `/** Auto-generated from Vite *Page.tsx testimonials — scripts/extract-testimonials.mjs */
export type ToolTestimonial = {
  name: string;
  rating: number;
  text: string;
  title?: string;
};

export const toolTestimonials: Record<string, ToolTestimonial[]> = `;

fs.writeFileSync(out, `${header}${JSON.stringify(map, null, 2)} as const;\n`);
console.log('tools with testimonials', Object.keys(map).length);
