import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dir = path.resolve(__dirname, '../../frontend/src/pages/tools');
const outTs = path.resolve(__dirname, '../src/data/tool-content/pageOverrides.ts');
const outJson = path.resolve(__dirname, '_pageOverrides.raw.json');

const files = fs.readdirSync(dir).filter((f) => f.endsWith('Page.tsx'));

function extractBalanced(src, startIdx) {
  const open = src[startIdx];
  const close = open === '[' ? ']' : open === '{' ? '}' : null;
  if (!close) return null;
  let depth = 0;
  for (let i = startIdx; i < src.length; i++) {
    const c = src[i];
    if (c === open) depth++;
    else if (c === close) {
      depth--;
      if (depth === 0) return src.slice(startIdx, i + 1);
    }
  }
  return null;
}

function extractConstArrayOrObject(src, name) {
  const re = new RegExp(`(?:const|let)\\s+${name}\\s*=\\s*([\\[\\{])`);
  const m = re.exec(src);
  if (!m) return null;
  const block = extractBalanced(src, m.index + m[0].length - 1);
  if (!block) return null;
  try {
    return Function(`"use strict"; return (${block});`)();
  } catch {
    return null;
  }
}

function extractConstString(src, name) {
  const re = new RegExp(`(?:const|let)\\s+${name}\\s*=\\s*"([^"]*)"`);
  const m = src.match(re);
  return m ? m[1] : null;
}

function extractJsxPropString(src, prop) {
  // title="..." or title={'...'} — prefer double-quoted JSX attrs on ToolPageLayout
  const layoutIdx = src.indexOf('<ToolPageLayout');
  const slice = layoutIdx >= 0 ? src.slice(layoutIdx, layoutIdx + 2500) : src;
  const re = new RegExp(`${prop}=\\"([^\\"]*)\\"`);
  const m = slice.match(re);
  return m ? m[1] : null;
}

function extractObjectFieldString(src, key) {
  // Only inside toolData-like objects: key: "..."
  // Prefer first occurrence after `toolData` or `const tool`
  const anchor = src.search(/toolData|const\s+tool\s*=|const\s+data\s*=/);
  const slice = anchor >= 0 ? src.slice(anchor, anchor + 4000) : src.slice(0, 4000);
  const re = new RegExp(`${key}\\s*:\\s*"([^"]*)"`);
  const m = slice.match(re);
  return m ? m[1] : null;
}

function extractObjectFieldArray(src, key) {
  const anchor = src.search(/toolData|const\s+tool\s*=/);
  const slice = anchor >= 0 ? src.slice(anchor) : src;
  const re = new RegExp(`${key}\\s*:\\s*([\\[\\{])`);
  const m = re.exec(slice);
  if (!m) return null;
  const block = extractBalanced(slice, m.index + m[0].length - 1);
  if (!block) return null;
  try {
    return Function(`"use strict"; return (${block});`)();
  } catch {
    return null;
  }
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

const overrides = {};
let ok = 0;

for (const file of files) {
  const src = fs.readFileSync(path.join(dir, file), 'utf8');
  if (!src.includes('ToolPageLayout')) continue;

  let toolPath = null;
  const pathMatch = src.match(/canonicalUrl=["']https?:\/\/[^"']+(\/[^"']+)["']/);
  if (pathMatch) toolPath = pathMatch[1].replace(/\/$/, '');
  if (!toolPath) {
    const m2 = src.match(/canonicalUrl:\s*["']https?:\/\/[^"']+(\/[^"']+)["']/);
    if (m2) toolPath = m2[1].replace(/\/$/, '');
  }
  if (!toolPath) toolPath = filenameToPath(file);

  const title =
    extractJsxPropString(src, 'title') ||
    extractObjectFieldString(src, 'title');
  const description =
    extractJsxPropString(src, 'description') ||
    extractObjectFieldString(src, 'description');
  const shortIntro =
    extractJsxPropString(src, 'shortIntro') ||
    extractObjectFieldString(src, 'shortIntro');
  const keywords =
    extractJsxPropString(src, 'keywords') ||
    extractObjectFieldString(src, 'keywords');
  const category =
    extractJsxPropString(src, 'category') ||
    extractObjectFieldString(src, 'category');
  const introText =
    extractConstString(src, 'introText') ||
    extractObjectFieldString(src, 'introText');

  const howToUse =
    extractConstArrayOrObject(src, 'howToUse') ||
    extractObjectFieldArray(src, 'howToUse');
  const features =
    extractConstArrayOrObject(src, 'features') ||
    extractObjectFieldArray(src, 'features');
  const faqs =
    extractConstArrayOrObject(src, 'faqs') ||
    extractObjectFieldArray(src, 'faqs');
  const relatedTools =
    extractConstArrayOrObject(src, 'relatedTools') ||
    extractObjectFieldArray(src, 'relatedTools');
  const useCases =
    extractConstArrayOrObject(src, 'useCases') ||
    extractObjectFieldArray(src, 'useCases');
  const examples =
    extractConstArrayOrObject(src, 'examples') ||
    extractObjectFieldArray(src, 'examples');
  const whenToUse =
    extractConstArrayOrObject(src, 'whenToUse') ||
    extractObjectFieldArray(src, 'whenToUse');
  const tips =
    extractConstArrayOrObject(src, 'tips') ||
    extractObjectFieldArray(src, 'tips');

  if (!title && !howToUse && !faqs && !shortIntro) continue;

  overrides[toolPath] = {
    ...(title && { title }),
    ...(description && { description }),
    ...(shortIntro && { shortIntro }),
    ...(introText && { introText }),
    ...(keywords && { keywords }),
    ...(category && { category }),
    ...(howToUse && { howToUse }),
    ...(features && { features }),
    ...(faqs && { faqs }),
    ...(relatedTools && { relatedTools }),
    ...(useCases && { useCases }),
    ...(examples && { examples }),
    ...(whenToUse && { whenToUse }),
    ...(tips && { tips }),
  };
  ok++;
}

fs.writeFileSync(outJson, JSON.stringify(overrides, null, 2));

const header = `/**
 * Page-level SEO overrides ported from Vite frontend ToolPageLayout props.
 * Auto-generated by scripts/extract-page-overrides.mjs — re-run to refresh.
 */
export type PageOverride = {
  title?: string;
  description?: string;
  shortIntro?: string;
  introText?: string;
  keywords?: string;
  category?: string;
  howToUse?: string[];
  features?: string[];
  faqs?: { question: string; answer: string }[];
  relatedTools?: { name: string; href: string; description?: string }[];
  useCases?: { title: string; description: string }[];
  examples?: { input: string; output: string }[];
  whenToUse?: string[];
  tips?: string[];
};

export const pageOverrides: Record<string, PageOverride> = `;

fs.writeFileSync(outTs, `${header}${JSON.stringify(overrides, null, 2)} as const;\n`);

const wc = overrides['/word-counter'];
const us = overrides['/url-shortener'];
console.log(`ok=${ok} keys=${Object.keys(overrides).length}`);
console.log('word-counter:', wc?.title, 'howTo=', wc?.howToUse?.length, 'faqs=', wc?.faqs?.length, 'useCases=', wc?.useCases?.length);
console.log('url-shortener:', us?.title, 'howTo=', us?.howToUse?.length);
