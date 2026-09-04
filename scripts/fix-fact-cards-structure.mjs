#!/usr/bin/env node
/**
 * Fix toolFactCards.ts: misplaced cards were inserted into FactSeoBits type.
 * Move them into TOOL_FACT_CARDS and restore FactSeoBits.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const factsPath = path.join(root, 'src/data/tool-content/toolFactCards.ts');
let src = fs.readFileSync(factsPath, 'utf8');

const typeStart = src.indexOf('export type FactSeoBits = {');
if (typeStart < 0) {
  console.error('FactSeoBits not found');
  process.exit(1);
}

const tipsIdx = src.indexOf('tips: string[];', typeStart);
if (tipsIdx < 0) {
  console.error('tips field not found');
  process.exit(1);
}
const afterTips = tipsIdx + 'tips: string[];'.length;

const synthIdx = src.indexOf('export function synthesizeFactCard', afterTips);
if (synthIdx < 0) {
  console.error('synthesizeFactCard not found');
  process.exit(1);
}

let middle = src.slice(afterTips, synthIdx).trim();
// Strip trailing };
if (middle.endsWith('};')) {
  middle = middle.slice(0, -2).trim();
}

if (!middle.includes("'/text-case-converter'")) {
  console.error('Expected misplaced cards not found');
  console.log(middle.slice(0, 200));
  process.exit(1);
}

// Find TOOL_FACT_CARDS closing }; just before FactSeoBits
const cardsClose = src.lastIndexOf('\n};', typeStart);
if (cardsClose < 0) {
  console.error('TOOL_FACT_CARDS close not found');
  process.exit(1);
}

const beforeClose = src.slice(0, cardsClose);
const afterSynth = src.slice(synthIdx);

const nl = src.includes('\r\n') ? '\r\n' : '\n';
const restoredType = [
  'export type FactSeoBits = {',
  '  introParagraphs: string[];',
  '  useCases: { title: string; description: string }[];',
  '  examples: { input: string; output: string }[];',
  '  faqs: { question: string; answer: string }[];',
  '  commonMistakes: string[];',
  '  tldr: string;',
  '  howItWorks: string;',
  '  whenToUse: string[];',
  '  tips: string[];',
  '};',
  '',
  '',
].join(nl);

const fixed =
  beforeClose +
  nl +
  middle +
  nl +
  '};' +
  nl +
  nl +
  restoredType +
  afterSynth.trimStart();

fs.writeFileSync(factsPath, fixed);

const keys = [...fixed.matchAll(/'(\/[^']+)':\s*\{/g)].map((m) => m[1]);
const stillBroken = /tips: string\[\];\s*'\/text-case-converter'/.test(fixed);
console.log('keys', keys.length, 'stillBroken', stillBroken);
const typeOk = fixed.includes('tips: string[];\r\n};') || fixed.includes('tips: string[];\n};');
console.log('typeOk', typeOk);
