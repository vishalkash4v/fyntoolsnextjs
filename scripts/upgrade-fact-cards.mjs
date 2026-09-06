#!/usr/bin/env node
/**
 * Upgrade weak TOOL_FACT_CARDS entries (generic "Run X" / "via the panel").
 * Run: node scripts/upgrade-fact-cards.mjs
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const factsPath = path.join(root, 'src/data/tool-content/toolFactCards.ts');
const toolsPath = path.join(root, 'src/data/toolsData.ts');

function extractTools(src) {
  const tools = {};
  for (const block of src.split(/\{\s*id:/).slice(1)) {
    const name = block.match(/name:\s*['"]([^'"]+)['"]/)?.[1];
    const description = block.match(/description:\s*['"]([^'"]+)['"]/)?.[1];
    const category = block.match(/category:\s*['"]([^'"]+)['"]/)?.[1];
    const pathM = block.match(/path:\s*['"](\/[^'"]+)['"]/);
    const features = block.match(/features:\s*['"]([^'"]+)['"]/)?.[1];
    if (!name || !pathM) continue;
    tools[pathM[1]] = {
      name,
      description: description || name,
      category: category || 'Tools',
      features: features || '',
    };
  }
  return tools;
}

function esc(s) {
  return s.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
}

function isWeak(chunk) {
  return (
    /title: 'Run /.test(chunk) ||
    /via the panel/.test(chunk) ||
    /Stay on this page to tweak inputs/.test(chunk) ||
    /Next related step/.test(chunk)
  );
}

function betterCard(route, tool) {
  const feat = tool.features.split(',')[0]?.trim();
  const cat = tool.category.replace(/ Tools$/, '');
  const what = tool.description.replace(/\.$/, '');
  let inputs = feat || `Labeled fields for ${tool.name}`;
  let outputs = `Result from ${tool.name} you can copy or download`;
  let mistake = `Skipping labels on ${tool.name} and using the wrong unit, format, or file type`;
  let cases = [
    [`Everyday ${cat.toLowerCase()} task`, `Use ${tool.name} when you need: ${what}.`],
    ['Second pass check', `Change one input and confirm ${tool.name} updates before you copy.`],
    ['Share carefully', `Copy the output once; do not treat educational estimates as legal/medical advice.`],
  ];

  if (/Image/i.test(tool.category)) {
    inputs = 'Image file upload (PNG/JPG/WebP as supported) + on-screen settings';
    outputs = 'Processed image preview + download';
    mistake = 'Uploading a tiny or wrong-aspect file and expecting a portal-perfect export';
    cases = [
      ['Web or form upload', `Process with ${tool.name}, then download for the portal or CMS.`],
      ['Preview before save', 'Check the preview, tweak settings, download once.'],
      ['Privacy', 'Most image tools run in-browser — confirm the privacy note on the page.'],
    ];
  } else if (/Text|Writing/i.test(tool.category)) {
    inputs = 'Plain text paste or type-in';
    outputs = 'Transformed text ready to copy';
    mistake = 'Pasting rich HTML and expecting tags to be ignored';
    cases = [
      ['Draft cleanup', `Paste into ${tool.name} and copy the cleaned result.`],
      ['Social / SEO length', 'Use counts or transforms before you publish.'],
      ['No account needed', 'Work in the browser panel on this page.'],
    ];
  } else if (/Number|Finance|Business/i.test(tool.category)) {
    inputs = 'Amounts, rates, and dates in the labeled fields';
    outputs = 'Calculated totals / schedule you can screenshot or copy';
    mistake = 'Treating rounded calculator output as a bank-approved quote';
    cases = [
      ['Scenario A', `Enter your real numbers in ${tool.name} for a first estimate.`],
      ['Compare B', 'Change one field (rate or tenure) and compare.'],
      ['Verify offline', 'Confirm critical figures with your bank or advisor.'],
    ];
  } else if (/Pregnancy|Period|Cycle/i.test(tool.category)) {
    inputs = 'Cycle or pregnancy dates / symptoms as labeled';
    outputs = 'Educational estimate or log (not a diagnosis)';
    mistake = 'Using calendar predictions as medical advice without a clinician';
    cases = [
      ['Date estimate', `Enter dates in ${tool.name} for planning only.`],
      ['Appointment prep', 'Note the estimate before you see a clinician.'],
      ['Privacy', 'Data typically stays in this browser unless the note says otherwise.'],
    ];
  } else if (/Development/i.test(tool.category)) {
    inputs = 'Code, CSS values, or structured text in the editor';
    outputs = 'Formatted / generated code you can copy';
    mistake = 'Shipping minified or generated output without a quick visual check';
    cases = [
      ['Paste and format', `Drop a snippet into ${tool.name} and copy the result.`],
      ['Iterate settings', 'Tweak options and re-copy.'],
      ['Pair next tool', 'Use related development tools linked below when needed.'],
    ];
  }

  const caseLines = cases
    .map(([title, description]) => `      { title: '${esc(title)}', description: '${esc(description)}' },`)
    .join('\n');

  return `  '${route}': {
    whatItDoes: '${esc(what)}',
    inputs: '${esc(inputs)}',
    outputs: '${esc(outputs)}',
    oneMistake: '${esc(mistake)}.',
    cases: [
${caseLines}
    ],
  },`;
}

const tools = extractTools(fs.readFileSync(toolsPath, 'utf8'));
let src = fs.readFileSync(factsPath, 'utf8');
const typeStart = src.indexOf('export type FactSeoBits');
const cardsRegion = src.slice(0, typeStart);

const pathRe = /'(\/[^']+)':\s*\{/g;
const indices = [];
let m;
while ((m = pathRe.exec(cardsRegion))) indices.push({ route: m[1], index: m.index });

let upgraded = 0;
const replacements = [];
for (let i = 0; i < indices.length; i++) {
  const { route, index } = indices[i];
  const next = i + 1 < indices.length ? indices[i + 1].index : cardsRegion.lastIndexOf('\n};');
  const chunk = cardsRegion.slice(index, next);
  if (!isWeak(chunk)) continue;
  const tool = tools[route];
  if (!tool) continue;
  replacements.push({ index, next, route, neo: betterCard(route, tool) });
}

// Apply from end to start
let out = src;
for (let i = replacements.length - 1; i >= 0; i--) {
  const { index, next, neo } = replacements[i];
  out = out.slice(0, index) + neo + '\n' + out.slice(next);
  upgraded++;
}

fs.writeFileSync(factsPath, out);
console.log(`Upgraded ${upgraded} weak fact cards`);
