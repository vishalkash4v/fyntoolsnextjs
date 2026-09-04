#!/usr/bin/env node
/**
 * Append missing TOOL_FACT_CARDS entries from toolsData descriptions.
 * Does not overwrite existing cards.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const toolsSrc = fs.readFileSync(path.join(root, 'src/data/toolsData.ts'), 'utf8');
const factsPath = path.join(root, 'src/data/tool-content/toolFactCards.ts');
let factsSrc = fs.readFileSync(factsPath, 'utf8');

function extractTools(src) {
  const tools = [];
  for (const block of src.split(/\{\s*id:/).slice(1)) {
    const id = block.match(/['"]([^'"]+)['"]/)?.[1];
    const name = block.match(/name:\s*['"]([^'"]+)['"]/)?.[1];
    const description = block.match(/description:\s*['"]([^'"]+)['"]/)?.[1];
    const category = block.match(/category:\s*['"]([^'"]+)['"]/)?.[1];
    const pathM = block.match(/path:\s*['"](\/[^'"]+)['"]/);
    const features = block.match(/features:\s*['"]([^'"]+)['"]/)?.[1];
    if (!id || !name || !pathM) continue;
    tools.push({
      id,
      name,
      description: description || name,
      category: category || 'Tools',
      path: pathM[1],
      features: features || '',
    });
  }
  return tools;
}

function esc(s) {
  return s.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
}

const HAND = {
  '/word-counter': {
    whatItDoes: 'Counts words, characters, sentences, and reading time as you type or paste',
    inputs: 'Any plain text in the box',
    outputs: 'Live word/character/sentence totals and reading-time estimate',
    oneMistake: 'Pasting HTML and expecting tags not to count — strip markup first',
    cases: [
      ['Essay length check', 'Paste a draft and watch words update as you trim'],
      ['Caption limit', 'Use character count before you hit a platform cap'],
      ['Reading-time estimate', 'Check estimated minutes for a blog post'],
    ],
  },
  '/image-compressor': {
    whatItDoes: 'Shrinks JPG/PNG/WebP in the browser with quality or target-size modes',
    inputs: 'Image file plus quality or KB target',
    outputs: 'Smaller image download with before/after size',
    oneMistake: 'Expecting huge lossless cuts on already-tiny screenshots',
    cases: [
      ['Email under 2MB', 'Use Target Size so a camera JPG fits the mailbox'],
      ['Instagram preset', 'Pick the social preset instead of guessing sliders'],
      ['WebP for a blog', 'Auto mode often picks WebP for the CMS'],
    ],
  },
  '/url-shortener': {
    whatItDoes: 'Turns long URLs into short FYN links with optional UTM, bulk, and QR',
    inputs: 'Full https URL, optional alias and UTM fields',
    outputs: 'Short link, copy button, optional QR',
    oneMistake: 'Shortening a tracking redirect instead of the final destination',
    cases: [
      ['Campaign UTM', 'Build source/medium/campaign then shorten for ads'],
      ['Bulk paste', 'Drop up to 20 URLs and copy the short set'],
      ['QR for print', 'Generate a QR after the short URL exists'],
    ],
  },
  '/password-generator': {
    whatItDoes: 'Creates strong random passwords with length and character-set controls',
    inputs: 'Length plus toggles for upper/lower/numbers/symbols',
    outputs: 'One or more passwords you can copy',
    oneMistake: 'Reusing the same generated password across sites',
    cases: [
      ['New account signup', 'Generate 16+ chars with symbols and copy once'],
      ['No-symbol policy', 'Turn symbols off when a bank rejects them'],
      ['Batch fill', 'Generate a few options and pick the readable one'],
    ],
  },
  '/text-to-handwriting': {
    whatItDoes: 'Renders typed text as realistic handwriting fonts and exports PDF/image',
    inputs: 'Text, font style, page/line settings',
    outputs: 'Handwriting preview plus PDF or image export',
    oneMistake: 'Pasting huge essays without page breaks — split long homework',
    cases: [
      ['Homework page', 'Type answers, pick a school-like font, export PDF'],
      ['Lined paper look', 'Enable ruled lines before export'],
      ['Signature block', 'Short name in a cursive font for a cover sheet'],
    ],
  },
  '/income-tax-calculator': {
    whatItDoes: 'Estimates Indian income tax under old vs new regimes from salary and deductions',
    inputs: 'Gross income, deductions, regime choice',
    outputs: 'Tax liability comparison and breakdown',
    oneMistake: 'Treating the estimate as a filed return without a CA for complex cases',
    cases: [
      ['Old vs new regime', 'Enter salary and 80C then compare both regimes'],
      ['HRA sketch', 'Add HRA so old regime is not a blank slate'],
      ['FY planning', 'Use current slabs as a planning sketch'],
    ],
  },
  '/emi-calculator': {
    whatItDoes: 'Calculates loan EMI, interest, and amortization with optional prepayment',
    inputs: 'Principal, annual rate, tenure, optional extra payments',
    outputs: 'Monthly EMI, interest totals, schedule tables',
    oneMistake: 'Forgetting processing fees are excluded from simple EMI math',
    cases: [
      ['Home loan sketch', 'Enter amount, rate, years before bank visits'],
      ['Prepayment impact', 'Add yearly extra and watch tenure drop'],
      ['Car loan budget', 'Check if EMI fits monthly cash flow'],
    ],
  },
  '/gst-calculator': {
    whatItDoes: 'Splits GST inclusive/exclusive amounts across Indian slabs with CGST/SGST/IGST',
    inputs: 'Amount, GST rate, inclusive or exclusive mode',
    outputs: 'Base, tax, total, and tax split',
    oneMistake: 'Using intra-state CGST/SGST labels for an interstate IGST invoice',
    cases: [
      ['Invoice exclusive', 'Enter taxable value at 18% and copy the split'],
      ['MRP inclusive', 'Back out base from a GST-inclusive price'],
      ['IGST interstate', 'Use IGST view for cross-state supply'],
    ],
  },
  '/sip-calculator': {
    whatItDoes: 'Projects SIP or lumpsum mutual-fund growth from amount, rate, and years',
    inputs: 'Monthly SIP or lumpsum, expected return %, tenure',
    outputs: 'Future value, invested amount, estimated gains',
    oneMistake: 'Assuming past returns equal future returns',
    cases: [
      ['Monthly SIP goal', '₹5,000 × 12% × 10 years for a corpus sketch'],
      ['Lumpsum compare', 'Switch to lumpsum to compare one-time invest'],
      ['Goal reverse', 'Adjust SIP until the future value hits your target'],
    ],
  },
  '/fd-calculator': {
    whatItDoes: 'Estimates fixed-deposit maturity from principal, rate, and tenure',
    inputs: 'Deposit amount, annual rate, tenure, compounding',
    outputs: 'Maturity amount and interest earned',
    oneMistake: 'Ignoring TDS or bank compounding frequency differences',
    cases: [
      ['1-year FD', 'Enter principal and bank rate for maturity'],
      ['Compare tenures', 'Try 1 vs 3 years at the same rate'],
      ['Senior rate', 'Use the higher senior-citizen rate your bank quotes'],
    ],
  },
  '/ppf-calculator': {
    whatItDoes: 'Projects Public Provident Fund growth from yearly deposits and rate',
    inputs: 'Annual deposit, years, PPF rate',
    outputs: 'Maturity corpus and total interest',
    oneMistake: 'Depositing above the annual PPF limit in the model',
    cases: [
      ['Max yearly deposit', 'Model the annual cap for 15 years'],
      ['Partial years', 'See corpus if you start mid-decade'],
      ['Rate sensitivity', 'Nudge the rate to see how maturity moves'],
    ],
  },
  '/pregnancy-due-date-calculator': {
    whatItDoes: 'Estimates due date from LMP or conception date with trimester markers',
    inputs: 'LMP or conception date',
    outputs: 'Estimated due date and trimester dates',
    oneMistake: 'Treating the estimate as exact without clinician confirmation',
    cases: [
      ['LMP due date', 'Pick last period and read EDD'],
      ['Conception mode', 'Switch when LMP is uncertain'],
      ['Week for visits', 'Read gestational week before an appointment'],
    ],
  },
  '/bmi-calculator': {
    whatItDoes: 'Computes Body Mass Index from height and weight with a category label',
    inputs: 'Height and weight (metric or imperial)',
    outputs: 'BMI number and underweight/normal/overweight category',
    oneMistake: 'Using BMI alone for athletes with high muscle mass',
    cases: [
      ['Metric check', 'Enter cm and kg for a quick category'],
      ['Imperial', 'Use ft/in and lb when that is how you measure'],
      ['Trend only', 'Recheck monthly — not a diagnosis'],
    ],
  },
  '/age-calculator': {
    whatItDoes: 'Calculates exact age in years, months, and days from a birth date',
    inputs: 'Date of birth (and optional “as of” date)',
    outputs: 'Age breakdown',
    oneMistake: 'Using tomorrow’s date when forms want age as of today',
    cases: [
      ['Form age', 'Enter DOB to fill years/months on an application'],
      ['As-of date', 'Compute age on a past exam date'],
      ['Next birthday', 'See days remaining until the next birthday'],
    ],
  },
};

const tools = extractTools(toolsSrc);
const missing = tools.filter((t) => !factsSrc.includes(`'${t.path}'`));
console.log('Appending', missing.length, 'fact cards');

const chunks = [];
for (const t of missing) {
  const hand = HAND[t.path];
  const feat = t.features.split(',')[0]?.trim();
  const what = hand?.whatItDoes || t.description.replace(/\.$/, '');
  const inputs = hand?.inputs || (feat ? `${feat} via the panel` : `Labeled fields on ${t.name}`);
  const outputs = hand?.outputs || `Live ${t.name.toLowerCase()} result you can copy or download`;
  const mistake =
    hand?.oneMistake || `Skipping field labels on ${t.name} and feeding the wrong unit or format`;
  const cases =
    hand?.cases ||
    [
      [`Run ${t.name}`, `${t.description} Stay on this page to tweak inputs.`],
      ['Double-check output', 'Verify units, dates, or file size before sharing.'],
      ['Next related step', `Use related ${t.category.toLowerCase()} links when you need a follow-up.`],
    ];

  const caseLines = cases
    .map(
      ([title, description]) =>
        `      { title: '${esc(title)}', description: '${esc(description)}' },`
    )
    .join('\n');

  chunks.push(`  '${t.path}': {
    whatItDoes: '${esc(what)}',
    inputs: '${esc(inputs)}',
    outputs: '${esc(outputs)}',
    oneMistake: '${esc(mistake)}.',
    cases: [
${caseLines}
    ],
  },`);
}

const insertAt = factsSrc.lastIndexOf('\n};');
if (insertAt < 0) throw new Error('Could not find TOOL_FACT_CARDS closing');
factsSrc = factsSrc.slice(0, insertAt) + '\n' + chunks.join('\n') + factsSrc.slice(insertAt);
fs.writeFileSync(factsPath, factsSrc);
console.log('Wrote', factsPath);
