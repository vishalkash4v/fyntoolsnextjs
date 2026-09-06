#!/usr/bin/env node
/**
 * Ensure Tier-1 tools have high-quality PATH_EXAMPLES (overwrite weak auto pairs).
 * Run: node scripts/deepen-tier1-examples.mjs
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const examplesPath = path.join(root, 'src/data/tool-content/toolExamples.ts');

const TIER1 = {
  '/weather-forecast': [
    {
      input: 'Search: Una, Himachal Pradesh, India  (or allow GPS)',
      output:
        'Current temp, feels-like, 7-day, hourly rain %, AQI, UV, what-to-wear via FYN Weather Gateway',
    },
    {
      input: 'Deny GPS → IP region fallback · unit °C',
      output: 'Regional forecast until you search a city or tap GPS again',
    },
  ],
  '/pdf-compressor': [
    {
      input: '2.4 MB scanned form PDF → Compress to ~150 KB',
      output: 'Compressed PDF ≈ 140–150 KB · download (client-side)',
    },
    {
      input: 'Bulk: 3 × ~5 MB PDFs → Optimized',
      output: 'Per-file before/after sizes + Download all',
    },
  ],
  '/image-compressor': [
    {
      input: '4.2 MB camera JPG → Target size 500 KB',
      output: 'Compressed JPG ≈ 480–500 KB · before/after preview',
    },
    {
      input: 'PNG screenshot → Auto / WebP',
      output: 'Smaller WebP or optimized PNG with size delta',
    },
  ],
  '/button-generator': [
    {
      input: 'Preset: Neon Cyberpunk · text ENTER · glow on',
      output: 'HTML/CSS/React snippet with neon border + keyframes',
    },
    {
      input: 'Preset: Sunset Gradient · sticker Shop Now',
      output: 'Gradient button + hover styles + icon span',
    },
  ],
  '/text-to-handwriting': [
    {
      input: 'Homework paragraph · lined paper · school cursive',
      output: 'Handwriting preview → Export PDF / image',
    },
    {
      input: 'Short cover note · A4 · Amatic-style font',
      output: 'Single-page handwriting render ready to print',
    },
  ],
  '/word-counter': [
    {
      input: 'Paste a 520-word blog draft',
      output: 'Words: 520 · characters · sentences · ~2 min reading time',
    },
    {
      input: 'Caption under a 2,200 character cap',
      output: 'Live character count as you trim',
    },
  ],
  '/url-shortener': [
    {
      input: 'Long UTM campaign URL + custom alias',
      output: 'Short FYN link + copy + optional QR',
    },
    {
      input: 'Bulk: 5 product URLs, one per line',
      output: 'Five short links listed for spreadsheet paste',
    },
  ],
  '/password-generator': [
    {
      input: 'Length 20 · upper+lower+numbers+symbols',
      output: 'Strong random password — copy once; nothing stored',
    },
    {
      input: 'Length 12 · symbols off (bank form)',
      output: 'Alphanumeric password matching no-symbol policy',
    },
  ],
  '/income-tax-calculator': [
    {
      input: 'Gross ₹12,00,000 · 80C ₹1,50,000 · old vs new',
      output: 'Side-by-side tax estimate for both regimes',
    },
    {
      input: 'Salary + HRA · new regime',
      output: 'Tax breakdown using current slabs (planning only)',
    },
  ],
  '/emi-calculator': [
    {
      input: '₹10,00,000 · 8.5% · 20 years',
      output: 'EMI ≈ ₹8,678 · interest total · amortization table',
    },
    {
      input: 'Same loan + ₹5,000/mo prepay',
      output: 'Months and interest saved vs base schedule',
    },
  ],
  '/gst-calculator': [
    {
      input: '₹10,000 exclusive · 18%',
      output: 'GST ₹1,800 · Total ₹11,800 · CGST/SGST split',
    },
    {
      input: 'Inclusive ₹1,180 · 18%',
      output: 'Base ≈ ₹1,000 · GST ≈ ₹180',
    },
  ],
  '/sip-calculator': [
    {
      input: 'SIP ₹5,000/mo · 12% · 10 years',
      output: 'Invested vs estimated corpus (illustrative)',
    },
    {
      input: 'Lumpsum ₹2,00,000 · 10% · 5 years',
      output: 'Future value and gains vs amount invested',
    },
  ],
  '/fd-calculator': [
    {
      input: '₹1,00,000 · 7% · 1 year · quarterly',
      output: 'Maturity amount + interest earned',
    },
    {
      input: 'Same principal · 3 years',
      output: 'Higher maturity from longer compounding',
    },
  ],
  '/ppf-calculator': [
    {
      input: '₹1,50,000/year · 15 years · current PPF rate',
      output: 'Projected maturity corpus (illustrative)',
    },
    {
      input: 'Lower annual deposit · 15 years',
      output: 'Smaller corpus — compare before you commit',
    },
  ],
  '/pregnancy-due-date-calculator': [
    {
      input: 'LMP: 1 Jan 2026',
      output: 'EDD ≈ Oct 2026 · trimester markers',
    },
    {
      input: 'Conception mode with known date',
      output: 'Due date from conception instead of LMP',
    },
  ],
  '/pregnancy-week-calculator': [
    {
      input: 'LMP: 1 Jan 2026',
      output: 'Gestational week + trimester (educational)',
    },
    {
      input: 'Update after ultrasound dating',
      output: 'Revised week count for appointments',
    },
  ],
  '/social-media-downloader': [
    {
      input: 'Public Instagram Reel URL',
      output: 'Downloadable media when the public URL is supported',
    },
    {
      input: 'Public Facebook video URL',
      output: 'Video file options for personal offline use',
    },
  ],
  '/image-resizer': [
    {
      input: '2000×1500 JPG → width 800 keep aspect',
      output: '800×600 JPG download for web/email',
    },
    {
      input: 'Passport size 413×531',
      output: 'Exact dimension export for forms',
    },
  ],
  '/image-cropper': [
    {
      input: 'Free crop around subject',
      output: 'Cropped PNG/JPG of selected region',
    },
    {
      input: '1:1 Instagram crop',
      output: 'Square crop ready for social',
    },
  ],
  '/qr-code-generator': [
    {
      input: 'https://fyntools.com/tools · 256px',
      output: 'PNG QR that opens the URL when scanned',
    },
    {
      input: 'Plain text contact note',
      output: 'QR encoding the text payload',
    },
  ],
  '/json-formatter': [
    {
      input: '{"a":1,"b":[2,3]} minified',
      output: 'Pretty-printed JSON with indentation',
    },
    {
      input: 'JSON with trailing comma',
      output: 'Parse error so you can fix before shipping',
    },
  ],
  '/bmi-calculator': [
    {
      input: '170 cm · 68 kg',
      output: 'BMI ≈ 23.5 · Normal range',
    },
    {
      input: '5′10″ · 180 lb',
      output: 'BMI from imperial inputs + category',
    },
  ],
  '/age-calculator': [
    {
      input: 'DOB 15 Mar 1998 · as of today',
      output: 'Years, months, days of age',
    },
    {
      input: 'DOB · as-of exam date',
      output: 'Age on that exact date for forms',
    },
  ],
  '/unit-converter': [
    {
      input: '5 km → miles',
      output: '5 km = 3.10686 miles',
    },
    {
      input: '2048 MB → GB',
      output: 'Converted GB in the panel',
    },
  ],
  '/currency-converter': [
    {
      input: '1000 INR → USD',
      output: 'USD at latest available rate (not a bank quote)',
    },
    {
      input: '50 EUR → INR',
      output: 'INR amount for budgeting',
    },
  ],
  '/text-font-changer': [
    {
      input: 'Hello World → bold / cursive unicode',
      output: 'Copy-ready fancy text for bio/social',
    },
    {
      input: 'Name for Instagram bio',
      output: 'Multiple styles with one-click copy',
    },
  ],
  '/ai-text-rewriter': [
    {
      input: 'Stiff paragraph · tone clearer',
      output: 'Rewritten draft to copy',
    },
    {
      input: 'Marketing blurb · shorter',
      output: 'Condensed rewrite keeping the core claim',
    },
  ],
  '/invoice-generator': [
    {
      input: 'Client Acme · 10 hrs × ₹800 · GST 18%',
      output: 'Invoice preview + PDF/image with totals',
    },
    {
      input: 'Two line items + due date',
      output: 'Itemized invoice ready to download',
    },
  ],
  '/typing-test': [
    {
      input: '60s English test → type the prompt',
      output: 'WPM, accuracy %, characters typed',
    },
    {
      input: 'Time up / finish early',
      output: 'Score card with restart',
    },
  ],
  '/ip-lookup': [
    {
      input: 'Blank → my IP',
      output: 'Public IP + ISP/geo when available',
    },
    {
      input: '8.8.8.8',
      output: 'Lookup fields for that address',
    },
  ],
};

function esc(s) {
  return s.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
}

function block(route, pairs) {
  const body = pairs
    .map(
      (p) => `    {
      input: '${esc(p.input)}',
      output: '${esc(p.output)}',
    }`
    )
    .join(',\n');
  return `  '${route}': [\n${body},\n  ]`;
}

let src = fs.readFileSync(examplesPath, 'utf8');
let replaced = 0;
for (const [route, pairs] of Object.entries(TIER1)) {
  const re = new RegExp(
    `  '${route.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}': \\[[\\s\\S]*?\\n  \\]`,
    'm'
  );
  const neo = block(route, pairs);
  if (re.test(src)) {
    src = src.replace(re, neo);
    replaced++;
  } else {
    // insert before closing
    const end = src.indexOf('\n};\n\nexport function getPathExamples');
    src = src.slice(0, end) + ',\n' + neo + src.slice(end);
    replaced++;
  }
}
fs.writeFileSync(examplesPath, src);
console.log(`Deepened PATH_EXAMPLES for ${replaced} Tier-1 tools`);
