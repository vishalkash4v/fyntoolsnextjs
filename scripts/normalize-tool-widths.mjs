#!/usr/bin/env node
/**
 * Strip per-tool root max-width / double padding so ToolPageShell max-w-6xl owns width.
 * Also soften obvious page-level gray backgrounds toward theme tokens.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const dir = path.join(root, 'src/components/tools');
const skip = new Set([
  'ToolPageShell.tsx',
  'ToolSeoSections.tsx',
  'ToolCrawlerFallback.tsx',
  'InteractiveToolLoader.tsx',
  'ToolFAQ.tsx',
  'ToolFeedbackLazy.tsx',
  'ToolRatingServer.tsx',
  'ToolSearch.tsx',
]);

const files = fs.readdirSync(dir).filter((f) => f.endsWith('.tsx'));
let changed = 0;
const report = [];

for (const f of files) {
  if (skip.has(f)) continue;
  const p = path.join(dir, f);
  let s = fs.readFileSync(p, 'utf8');
  const before = s;

  const replacements = [
    // Root width: max-w-2xl through max-w-7xl
    [/className="w-full max-w-(?:[2-7]xl|lg|md|sm) mx-auto /g, 'className="w-full '],
    [/className="max-w-(?:[2-7]xl|lg|md|sm) mx-auto /g, 'className="w-full '],
    [/className="space-y-6 max-w-(?:[2-7]xl|lg|md|sm)"/g, 'className="w-full space-y-6"'],
    [/className="space-y-6 max-w-(?:[2-7]xl|lg|md|sm) /g, 'className="w-full space-y-6 '],
    [/className="container mx-auto (?:px-4 )?(?:py-8 )?(?:max-w-(?:[2-7]xl|lg) )?/g, 'className="w-full '],
    [/className="w-full max-w-(?:[2-7]xl|lg|md|sm) mx-auto"/g, 'className="w-full"'],
    [/className="max-w-(?:[2-7]xl|lg|md|sm) mx-auto"/g, 'className="w-full"'],
    [/className="max-w-(?:[2-7]xl|lg|md|sm) mx-auto space-y-(\d)"/g, 'className="w-full space-y-$1"'],
    [/className="space-y-6 p-4 max-w-(?:[2-7]xl|lg) mx-auto"/g, 'className="w-full space-y-6"'],
    [/className="space-y-4 p-4 max-w-(?:[2-7]xl|lg) mx-auto"/g, 'className="w-full space-y-4"'],
    [/className="max-w-(?:[2-7]xl|lg) mx-auto space-y-6 p-4 sm:p-6"/g, 'className="w-full space-y-6"'],
    [/className="max-w-(?:[2-7]xl|lg) mx-auto space-y-6 p-4"/g, 'className="w-full space-y-6"'],
    [/className="max-w-(?:[2-7]xl|lg) mx-auto space-y-6 px-1"/g, 'className="w-full space-y-6"'],
    [/className="w-full space-y-6 p-4 sm:p-6"/g, 'className="w-full space-y-6"'],
    [/className="w-full space-y-6 p-4"/g, 'className="w-full space-y-6"'],
    [/className="space-y-6 p-4 sm:p-6"/g, 'className="w-full space-y-6"'],
    [/className="space-y-6 p-4"/g, 'className="w-full space-y-6"'],
  ];
  for (const [re, to] of replacements) s = s.replace(re, to);

  s = s.replace(/min-h-screen bg-gray-100 dark:bg-gray-900/g, 'w-full bg-background');
  s = s.replace(/bg-white dark:bg-gray-800(?=[\s"])/g, 'bg-card');
  s = s.replace(/bg-gray-50 dark:bg-gray-900(?=[\s"])/g, 'bg-muted/40');
  s = s.replace(/bg-gray-100 dark:bg-gray-900(?=[\s"])/g, 'bg-muted');

  if (s !== before) {
    fs.writeFileSync(p, s);
    changed++;
    report.push(f);
  }
}

console.log(`Updated ${changed} files`);
console.log(report.join(', '));
