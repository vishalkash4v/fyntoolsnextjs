#!/usr/bin/env node
/**
 * Generate PATH_EXAMPLES entries for tools missing concrete I/O samples.
 * Prefer existing hand-written rows; only append missing paths.
 * Run: node scripts/generate-path-examples.mjs
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const examplesPath = path.join(root, 'src/data/tool-content/toolExamples.ts');
const factsPath = path.join(root, 'src/data/tool-content/toolFactCards.ts');
const toolsPath = path.join(root, 'src/data/toolsData.ts');

function extractTools(src) {
  const tools = [];
  for (const block of src.split(/\{\s*id:/).slice(1)) {
    const name = block.match(/name:\s*['"]([^'"]+)['"]/)?.[1];
    const description = block.match(/description:\s*['"]([^'"]+)['"]/)?.[1];
    const category = block.match(/category:\s*['"]([^'"]+)['"]/)?.[1];
    const pathM = block.match(/path:\s*['"](\/[^'"]+)['"]/);
    if (!name || !pathM) continue;
    tools.push({ name, description: description || name, category: category || 'Tools', path: pathM[1] });
  }
  return tools;
}

function parseFactCards(src) {
  const cards = {};
  const pathRe = /'(\/[^']+)':\s*\{/g;
  const indices = [];
  let m;
  while ((m = pathRe.exec(src))) indices.push({ route: m[1], index: m.index });
  for (let i = 0; i < indices.length; i++) {
    const { route, index } = indices[i];
    const next = i + 1 < indices.length ? indices[i + 1].index : src.indexOf('\nexport type FactSeoBits');
    const chunk = src.slice(index, next > index ? next : index + 800);
    const field = (name) => {
      const hit = chunk.match(new RegExp(`${name}:\\s*(?:\\n\\s*)?'((?:\\\\'|[^'])*)'`));
      return hit ? hit[1].replace(/\\'/g, "'") : '';
    };
    cards[route] = {
      whatItDoes: field('whatItDoes'),
      inputs: field('inputs'),
      outputs: field('outputs'),
      limit: field('limit'),
      oneMistake: field('oneMistake'),
    };
  }
  return cards;
}

function esc(s) {
  return s.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
}

/** Category-aware concrete example pairs */
function examplesFor(tool, card) {
  const n = tool.name;
  const cat = tool.category;
  const inputs = card?.inputs || `Typical ${n} input`;
  const outputs = card?.outputs || `${n} result`;

  const HAND = {
    '/image-resizer': [
      { input: '2000×1500 JPG → width 800 (keep aspect)', output: '800×600 JPG download · size dropped for web/email' },
      { input: 'Passport photo → 413×531 px', output: 'Exact dimension export for form upload' },
    ],
    '/image-cropper': [
      { input: 'Upload photo → free crop to subject', output: 'Cropped PNG/JPG download of the selected region' },
      { input: '1:1 Instagram crop', output: 'Square crop ready for social upload' },
    ],
    '/qr-code-generator': [
      { input: 'URL https://fyntools.com/tools · size 256', output: 'PNG QR code download that opens the URL when scanned' },
      { input: 'Wi‑Fi SSID + password text', output: 'QR encoding the Wi‑Fi join string' },
    ],
    '/json-formatter': [
      { input: '{"a":1,"b":[2,3]} minified', output: 'Pretty-printed JSON with indentation; optional validate errors' },
      { input: 'Paste invalid trailing comma JSON', output: 'Parse error highlighted so you can fix before shipping' },
    ],
    '/bmi-calculator': [
      { input: 'Height 170 cm · Weight 68 kg', output: 'BMI ≈ 23.5 · Normal range label' },
      { input: 'Height 5′10″ · Weight 180 lb', output: 'BMI with imperial inputs + category' },
    ],
    '/age-calculator': [
      { input: 'DOB: 15 Mar 1998 · as of today', output: 'Years, months, and days of age' },
      { input: 'DOB + as-of exam date 01 Jun 2024', output: 'Age on that exact date for forms' },
    ],
    '/unit-converter': [
      { input: 'Length: 5 km → miles', output: '5 km = 3.10686 miles' },
      { input: 'Data: 2048 MB → GB', output: 'Converted GB value in the panel' },
    ],
    '/currency-converter': [
      { input: '1000 INR → USD', output: 'Converted USD at latest available mid-market style rate' },
      { input: '50 EUR → INR', output: 'INR amount with rate timestamp note' },
    ],
    '/text-font-changer': [
      { input: 'Hello World → bold unicode / cursive styles', output: 'Copy-ready fancy text variants for bio/social' },
      { input: 'Name for Instagram bio', output: 'Multiple font styles listed with one-click copy' },
    ],
    '/ai-text-rewriter': [
      { input: 'Paste a stiff paragraph · tone: clearer', output: 'Rewritten draft you can copy (browser session)' },
      { input: 'Marketing blurb · shorter', output: 'Condensed rewrite keeping the core claim' },
    ],
    '/invoice-generator': [
      { input: 'Client Acme · 10 hrs × ₹800 · GST 18%', output: 'Invoice preview + PDF/image with totals' },
      { input: 'Two line items + due date', output: 'Itemized invoice ready to download' },
    ],
    '/typing-test': [
      { input: 'Start 60s English test → type the prompt', output: 'WPM, accuracy %, and characters typed' },
      { input: 'Finish early / time up', output: 'Final score card with restart' },
    ],
    '/ip-lookup': [
      { input: 'Leave blank → my IP', output: 'Your public IP + ISP/geo fields when available' },
      { input: '8.8.8.8', output: 'Lookup lookup for that address (provider/location)' },
    ],
    '/gst-calculator': [
      { input: 'Taxable ₹10,000 · GST 18% · exclusive', output: 'GST ₹1,800 · Total ₹11,800 · CGST/SGST split' },
      { input: 'Inclusive MRP ₹1,180 · 18%', output: 'Base ≈ ₹1,000 · GST ≈ ₹180' },
    ],
    '/pregnancy-week-calculator': [
      { input: 'LMP: 1 Jan 2026', output: 'Gestational week + trimester label (educational)' },
      { input: 'Update LMP after ultrasound dating', output: 'Revised week count for appointment planning' },
    ],
  };

  if (HAND[tool.path]) return HAND[tool.path];

  // Always return 2 concrete pairs from fact card
  return [
    {
      input: inputs,
      output: outputs,
    },
    {
      input: `Open ${tool.path} and run a second sample`,
      output: `${outputs} (iterate settings if the tool has options)`,
    },
  ];
}

const tools = extractTools(fs.readFileSync(toolsPath, 'utf8')).filter((t) => t.path !== '/redirect');
const cards = parseFactCards(fs.readFileSync(factsPath, 'utf8'));
let examplesSrc = fs.readFileSync(examplesPath, 'utf8');

const existing = new Set([...examplesSrc.matchAll(/'(\/[^']+)':\s*\[/g)].map((m) => m[1]));
const missing = tools.filter((t) => !existing.has(t.path) || !examplesSrc.includes(`'${t.path}': [`));

// Also find paths with only 1 example — we'll leave hand ones; generate only fully missing
const toAdd = tools.filter((t) => !existing.has(t.path));

const chunks = [];
for (const tool of toAdd) {
  const pairs = examplesFor(tool, cards[tool.path]);
  const body = pairs
    .map(
      (p) => `    {
      input: '${esc(p.input)}',
      output: '${esc(p.output)}',
    }`
    )
    .join(',\n');
  chunks.push(`  '${tool.path}': [\n${body},\n  ]`);
}

if (!chunks.length) {
  console.log('No missing PATH_EXAMPLES');
  process.exit(0);
}

const insertAt = examplesSrc.lastIndexOf('\n};');
if (insertAt < 0) throw new Error('PATH_EXAMPLES close not found');
// PATH_EXAMPLES ends before getPathExamples — find the closing of the Record
const recordEnd = examplesSrc.indexOf('\n};\n\nexport function getPathExamples');
const end = recordEnd > 0 ? recordEnd : insertAt;

const before = examplesSrc.slice(0, end).replace(/,\s*$/, '');
const after = examplesSrc.slice(end);
const needsComma = !before.trimEnd().endsWith(',');
const injection = (needsComma ? ',\n' : '\n') + chunks.join(',\n') + '\n';

examplesSrc = before + injection + after;
fs.writeFileSync(examplesPath, examplesSrc);
console.log(`Added PATH_EXAMPLES for ${toAdd.length} tools`);
