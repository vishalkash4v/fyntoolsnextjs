#!/usr/bin/env node
/**
 * Ensure Tier-1 pageOverrides have useCases (≥3) when missing.
 * Does not invent testimonials.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const overridesPath = path.join(root, 'src/data/tool-content/pageOverrides.ts');

const USE_CASES = {
  '/image-resizer': [
    { title: 'Email-friendly width', description: 'Drop a large photo to 800px wide so attachments stay small.' },
    { title: 'Passport dimensions', description: 'Set exact pixel size required by a government form.' },
    { title: 'Keep aspect ratio', description: 'Lock ratio, change one side, download without stretching faces.' },
  ],
  '/image-cropper': [
    { title: 'Subject crop', description: 'Drag a free crop around the face or product before upload.' },
    { title: 'Square social crop', description: 'Use 1:1 for Instagram-ready exports.' },
    { title: 'Remove edges', description: 'Trim borders from a scanned document photo.' },
  ],
  '/qr-code-generator': [
    { title: 'Link on print', description: 'Encode your landing URL and print the PNG on a flyer.' },
    { title: 'Wi‑Fi share', description: 'Encode network join text so guests scan instead of typing passwords.' },
    { title: 'Event check-in', description: 'Generate a unique QR per ticket URL.' },
  ],
  '/json-formatter': [
    { title: 'Pretty-print API payload', description: 'Paste minified JSON and copy indented output for debugging.' },
    { title: 'Catch syntax errors', description: 'Invalid JSON shows a parse error before you ship it.' },
    { title: 'Diff-friendly format', description: 'Normalize spacing so Git diffs stay readable.' },
  ],
  '/bmi-calculator': [
    { title: 'Metric check', description: 'Enter cm and kg for a quick BMI category.' },
    { title: 'Imperial inputs', description: 'Use ft/in and lb when that is how you measure.' },
    { title: 'Trend only', description: 'Recheck monthly — BMI is not a diagnosis.' },
  ],
  '/age-calculator': [
    { title: 'Form age', description: 'Enter DOB to fill years/months on an application.' },
    { title: 'As-of date', description: 'Compute age on a past exam or enrollment date.' },
    { title: 'Next birthday', description: 'See how many days until the next birthday.' },
  ],
  '/unit-converter': [
    { title: 'Travel distance', description: 'Convert km to miles for a road trip plan.' },
    { title: 'File size', description: 'Convert MB to GB against an upload limit.' },
    { title: 'Kitchen / DIY', description: 'Switch length or weight units while following a guide.' },
  ],
  '/currency-converter': [
    { title: 'Trip budget', description: 'Convert INR to EUR for a weekend estimate.' },
    { title: 'Invoice check', description: 'See USD→INR before sending an international invoice.' },
    { title: 'Not a bank quote', description: 'Use the rate as a sketch — confirm with your bank for wires.' },
  ],
  '/text-font-changer': [
    { title: 'Instagram bio', description: 'Generate a cursive or bold unicode name and copy once.' },
    { title: 'Discord nickname', description: 'Try a few styles and paste into Discord.' },
    { title: 'Keep a backup plain name', description: 'Some platforms strip fancy unicode — keep ASCII ready.' },
  ],
  '/ai-text-rewriter': [
    { title: 'Clarify a stiff draft', description: 'Paste a paragraph, pick a clearer tone, copy the rewrite.' },
    { title: 'Shorten marketing copy', description: 'Ask for shorter and trim fluff before publish.' },
    { title: 'Human edit after', description: 'Treat output as a draft — fact-check before you ship.' },
  ],
  '/invoice-generator': [
    { title: 'Freelancer invoice', description: 'Add client, hours, GST, export PDF.' },
    { title: 'Multi-line items', description: 'List products/services with quantities and totals.' },
    { title: 'Due date reminder', description: 'Set due date on the invoice before you send it.' },
  ],
  '/typing-test': [
    { title: '60-second WPM check', description: 'Start the timer and type the prompt for a live score.' },
    { title: 'Accuracy focus', description: 'Slow down to raise accuracy % before chasing speed.' },
    { title: 'Practice daily', description: 'Retake and compare WPM week over week.' },
  ],
  '/ip-lookup': [
    { title: 'What is my IP', description: 'Leave the field blank to see your public IP.' },
    { title: 'Investigate an address', description: 'Paste 8.8.8.8-style IPs for provider/geo fields.' },
    { title: 'Support ticket', description: 'Copy IP details into a network support form.' },
  ],
  '/pregnancy-week-calculator': [
    { title: 'LMP week count', description: 'Enter last period date for gestational week (educational).' },
    { title: 'Appointment prep', description: 'Note the week before a prenatal visit.' },
    { title: 'Not ultrasound dating', description: 'Confirm dates with your clinician when they differ.' },
  ],
};

function esc(s) {
  return s.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
}

let src = fs.readFileSync(overridesPath, 'utf8');
let added = 0;

for (const [route, cases] of Object.entries(USE_CASES)) {
  const key = `"${route}"`;
  const start = src.indexOf(key);
  if (start < 0) {
    console.warn('Missing override block', route);
    continue;
  }
  // Find end of this tool object — next "\n  \"/" or end
  const rest = src.slice(start);
  const nextTool = rest.search(/\n  "\//);
  const blockEnd = nextTool > 0 ? start + nextTool : src.length;
  const block = src.slice(start, blockEnd);
  if (block.includes('"useCases"')) continue;

  const json = cases
    .map(
      (c) => `      {
        "title": "${esc(c.title)}",
        "description": "${esc(c.description)}"
      }`
    )
    .join(',\n');
  const injection = `\n    "useCases": [\n${json}\n    ],`;

  // Insert before relatedTools or faqs closing — prefer before "relatedTools"
  let insertAt;
  if (block.includes('"relatedTools"')) {
    insertAt = start + block.indexOf('"relatedTools"');
    src = src.slice(0, insertAt) + injection.trimStart() + '\n    ' + src.slice(insertAt);
  } else if (block.includes('"faqs"')) {
    // after features if present, else after howToUse
    const feat = block.indexOf('"features"');
    if (feat > 0) {
      // find end of features array
      const afterFeat = block.indexOf('],', feat);
      insertAt = start + afterFeat + 2;
      src = src.slice(0, insertAt) + ',' + injection + src.slice(insertAt);
    } else {
      insertAt = start + block.indexOf('"faqs"');
      src = src.slice(0, insertAt) + injection.trimStart() + '\n    ' + src.slice(insertAt);
    }
  } else {
    console.warn('No insert point', route);
    continue;
  }
  added++;
}

fs.writeFileSync(overridesPath, src);
console.log(`Added useCases to ${added} Tier-1 overrides`);
