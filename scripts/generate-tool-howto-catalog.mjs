#!/usr/bin/env node
/**
 * Generate src/data/tool-content/toolHowToCatalog.ts — tool-specific How to Use steps
 * for every canonical tool. Merges curated batch content; fills gaps from features + category.
 * Run: node scripts/generate-tool-howto-catalog.mjs
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const outFile = path.join(root, 'src/data/tool-content/toolHowToCatalog.ts');

const WEAK = [
  /^Use the .+ form above\.$/i,
  /^Review the on-screen result\.$/i,
  /^Copy or download for your workflow\.$/i,
  /^Enter amounts and rates in/i,
  /^Compare scenarios by changing inputs\.$/i,
  /^Verify with your bank or advisor when needed\.$/i,
  /^Enter dates or symptoms in/i,
  /^Review the estimate or log\.$/i,
  /^Confirm medical decisions with your clinician\.$/i,
  /^Upload your image\.$/i,
  /^Adjust settings and preview\.$/i,
  /^Download the result\.$/i,
  /^Review the on-screen controls and enter your input\.$/i,
  /^Adjust options if available, then run or update the result\.$/i,
  /^Enter or upload .+ using the controls in the panel above\.$/i,
];

function extractTools(src) {
  const tools = [];
  for (const block of src.split(/\{\s*id:/).slice(1)) {
    const pathM = block.match(/path:\s*['"](\/[^'"]+)['"]/);
    const name = block.match(/name:\s*['"]([^'"]+)['"]/)?.[1];
    const category = block.match(/category:\s*['"]([^'"]+)['"]/)?.[1];
    const description = block.match(/description:\s*['"]([^'"]+)['"]/)?.[1];
    const features = block.match(/features:\s*['"]([^'"]+)['"]/)?.[1];
    if (pathM && name) {
      tools.push({
        path: pathM[1],
        slug: pathM[1].slice(1),
        name,
        category: category || 'Tools',
        description: description || '',
        features: (features || '').split(',').map((f) => f.trim()).filter(Boolean),
      });
    }
  }
  return tools;
}

function extractHowToFromTs(filePath) {
  const map = new Map();
  if (!fs.existsSync(filePath)) return map;
  const src = fs.readFileSync(filePath, 'utf8');
  const re = /['"](\/[^'"]+)['"]\s*:\s*\{([\s\S]*?)\n\s*\},?\n/g;
  let m;
  while ((m = re.exec(src))) {
    const p = m[1];
    const body = m[2];
    const hm = body.match(/howToUse:\s*\[([\s\S]*?)\]/);
    if (!hm) continue;
    const steps = [...hm[1].matchAll(/["']([^"']+)["']/g)].map((x) => x[1].trim()).filter(Boolean);
    if (steps.length >= 3 && !isWeakSteps(steps)) map.set(p, steps);
  }
  return map;
}

function isWeakSteps(steps) {
  if (steps.length < 3) return true;
  const weakCount = steps.filter((s) => WEAK.some((re) => re.test(s))).length;
  return weakCount >= 2;
}

function featAction(f) {
  const lower = f.toLowerCase();
  if (lower.startsWith('generate ')) return `Click to ${lower}.`;
  if (lower.startsWith('calculate ')) return `${f} using the form fields.`;
  if (lower.startsWith('convert ')) return `${f} — values update as you type.`;
  if (lower.startsWith('track ')) return `${f} in the daily log panel.`;
  if (lower.startsWith('download ')) return `${f} when the preview looks correct.`;
  if (lower.startsWith('copy ')) return `${f} from the output area.`;
  if (lower.startsWith('upload ')) return `${f} via the file picker or drag-and-drop zone.`;
  if (lower.startsWith('paste ')) return `${f} into the editor above.`;
  if (lower.startsWith('set ')) return `${f} using the timer controls.`;
  if (lower.startsWith('enter ')) return `${f}.`;
  if (lower.startsWith('select ')) return `${f} from the dropdown.`;
  if (lower.startsWith('pick ')) return `${f}.`;
  if (lower.startsWith('scan ')) return `${f}.`;
  if (lower.startsWith('flip ')) return `Tap ${f} and preview the change instantly.`;
  if (lower.startsWith('roll ')) return `Tap to ${lower}.`;
  if (lower.startsWith('start ')) return `${f}.`;
  if (lower.startsWith('enable ')) return `${f} before submitting.`;
  if (lower.includes('preview')) return `${f} in the live preview panel.`;
  if (lower.includes('export')) return `${f} when finished.`;
  return `Use ${f} as shown in the tool panel.`;
}

/** Per-slug overrides — verified against live tool UI where possible. */
const SLUG_STEPS = {
  'url-shortener': [
    'Paste your destination https:// URL in the main field (or one URL per line in bulk mode).',
    'Optionally set a custom alias (3–20 chars), UTM fields, expiry preset, or password lock.',
    'Click Shorten — your link appears as fyntools.com/s/{code} with a copy button and QR icon.',
    'Open /s/{code}/stats later to see click totals for that link.',
  ],
  'json-formatter': [
    'Paste raw JSON into the editor (or upload a .json file if the UI offers it).',
    'Click Beautify/Format to indent with syntax highlighting, or Minify to compress.',
    'Fix any validation errors shown inline — invalid JSON is highlighted with line hints.',
    'Copy the formatted output or download it for your API or config file.',
  ],
  'word-counter': [
    'Paste or type text in the input area — counts update in real time.',
    'Review word count, character count (with/without spaces), sentences, and paragraphs.',
    'Check reading-time estimate and frequency stats if displayed in the dashboard.',
    'Copy statistics or clear the text to start a new document.',
  ],
  'image-compressor': [
    'Upload an image via drag-and-drop or the file picker (JPG, PNG, WebP).',
    'Choose Auto, Target Size (50/100/150/200/500 KB or Email 1MB chips), or Manual quality.',
    'Compare before/after file size in the preview, then download the compressed image.',
    'Use Target Size for photo KB resize and email-friendly compression.',
  ],
  'qr-code-generator': [
    'Enter a URL or text string in the content field.',
    'Customize size, colors, error-correction level, or embed a logo if available.',
    'Preview the QR code live, then download as PNG or SVG.',
    'Scan with your phone to verify it resolves before printing.',
  ],
  'password-generator': [
    'Set password length and toggle character sets (uppercase, lowercase, numbers, symbols).',
    'Optionally enable memorable-word mode or view the strength indicator.',
    'Click Generate — copy the password immediately (it is not stored server-side).',
    'Regenerate until strength and format match your policy.',
  ],
  'emi-calculator': [
    'Enter loan principal (₹), annual interest rate (%), and tenure in months or years.',
    'View monthly EMI, total interest, and the amortization table instantly.',
    'Optional: add monthly prepayment and choose reduce-tenure vs reduce-EMI strategy.',
    'Download or screenshot the schedule — confirm figures with your lender before signing.',
  ],
  'gst-calculator': [
    'Choose Add GST (exclusive base) or Remove GST (inclusive price).',
    'Enter amount in ₹ and select GST slab (5%, 12%, 18%, 28%, or custom).',
    'Review base amount, GST amount, CGST/SGST split, and gross total.',
    'Copy results for invoices — verify with your CA for filing.',
  ],
  'period-tracker': [
    'Log period start date, flow level, mood, and symptoms for today.',
    'Save the entry — history builds a timeline chart in your browser.',
    'Review past cycles to spot patterns before appointments.',
    'Export or screenshot logs before clearing browser data (stored locally only).',
  ],
  'pms-symptom-tracker': [
    "Select today's date and tick PMS symptoms you are experiencing.",
    'Set pain scale (1–10), mood, and optional notes, then save the log.',
    'Review the symptom history timeline for cycle patterns.',
    'Share trends with your clinician — not for diagnosis or emergency use.',
  ],
  'pregnancy-due-date-calculator': [
    'Choose calculation method: last menstrual period (LMP), conception date, or ultrasound date.',
    'Enter the date and cycle length if prompted.',
    'Review estimated due date, current pregnancy week, and trimester.',
    'Confirm dates with your prenatal provider — calendar math is an estimate only.',
  ],
  'contraction-timer': [
    'Tap Start when a contraction begins.',
    'Tap Stop when it ends — duration is logged automatically.',
    'Repeat for each contraction; interval between starts is calculated.',
    'Review history and average interval — call your provider per their labor guidance.',
  ],
  'baby-kick-counter': [
    'Tap the button on each fetal movement — the session timer starts on first kick.',
    'Set kick target (5–20) if the control is shown.',
    'Tap Save Session to store start time, end time, count, and duration locally.',
    'Review session history by date before prenatal visits.',
  ],
  'xml-sitemap-tester': [
    'Paste your sitemap URL or raw XML into the input field.',
    'Run the test — each <loc> URL is fetched for HTTP status and redirect chain.',
    'Sort/filter by 404, 301, or slow responses in the results table.',
    'Export CSV/JSON to fix broken URLs before resubmitting in Google Search Console.',
  ],
  'barcode-scanner-online': [
    'Allow camera access or upload a photo containing a barcode.',
    'Hold steady until decode succeeds — format (EAN-13, UPC, Code 128, QR) is shown.',
    'Copy the raw payload or add to scan history.',
    'Export history as CSV for inventory batches.',
  ],
  'typing-test': [
    'Choose a text sample or time limit if options are shown.',
    'Start typing when the countdown begins — errors are highlighted live.',
    'Finish the passage to see WPM, accuracy, and error count.',
    'Retry or share results; use Typing Tutor for guided lessons.',
  ],
  'typing-tutor': [
    'Pick a lesson language (English/Hindi) and difficulty level.',
    'Follow finger-position hints and type the prompted characters.',
    'Complete exercises to unlock the next lesson — progress saves locally.',
    'Switch to Typing Test when ready for a timed WPM score.',
  ],
  'typing-competition': [
    'Join a room or match with a random opponent when the queue connects.',
    'Type the shared prompt as fast and accurately as possible.',
    'Watch live WPM ranking update until the round ends.',
    'Play again or practice in Typing Tutor between matches.',
  ],
  'typing-games': [
    'Select a game mode from the menu (e.g. word fall, race, or challenge).',
    'Type the on-screen words before time runs out to score points.',
    'Complete rounds to increase level difficulty.',
    'Use Typing Test afterward to measure raw WPM improvement.',
  ],
  'invoice-generator': [
    'Fill business details, client info, and line items (description, qty, rate).',
    'Apply tax/discount fields if your invoice needs them.',
    'Preview the layout, then generate PDF or image export.',
    'Auto-save keeps drafts locally — download before clearing browser storage.',
  ],
  'social-media-downloader': [
    'Paste a public Instagram or Facebook post/reel/story URL.',
    'Submit — the tool resolves media links server-side.',
    'Pick quality/format (MP4/image) when multiple options appear.',
    'Download only content you have rights to — respect platform terms.',
  ],
  'currency-converter': [
    'Select source and target currencies from the dropdowns.',
    'Enter the amount — converted value updates using live exchange rates.',
    'Swap currencies with the swap button to reverse direction.',
    'Rates are indicative — confirm with your bank for large transfers.',
  ],
  'weather-forecast': [
    'Search a city or allow location access for current coordinates.',
    'View current conditions, hourly outlook, and multi-day forecast.',
    'Scroll extended details for humidity, wind, and icons.',
    'Refresh for updated data — powered by a third-party weather API.',
  ],
  'ip-lookup': [
    'Open the page — your public IPv4/IPv6 is detected automatically.',
    'Review ISP, country, city, and connection metadata shown.',
    'Click copy next to the IP address if you need it for support tickets.',
    'Use IP Address to Location Finder to look up a different IP.',
  ],
  'ai-text-rewriter': [
    'Paste the source text and pick a writing style (professional, casual, academic, etc.).',
    'Set creativity level if the slider is shown.',
    'Click Rewrite — output appears in the result panel (processed server-side).',
    'Copy rewritten text; review for accuracy before publishing.',
  ],
  'table-to-json-converter': [
    'Paste HTML table markup or spreadsheet-exported table HTML.',
    'Choose array vs object JSON output format if offered.',
    'Click Convert — validate pretty-printed JSON in the output pane.',
    'Copy or download JSON for API fixtures or database imports.',
  ],
  'trip-expense-splitter': [
    'Add trip participants and assign who paid each expense.',
    'Enter expense amount, category, and split mode (equal or custom shares).',
    'Review who owes whom in the settlement summary.',
    'Export calculations for reimbursement after the trip.',
  ],
  'notes': [
    'Click New Note and type content in the editor.',
    'Add tags or color labels to organize entries.',
    'Search/filter notes from the sidebar; edit or delete as needed.',
    'Export notes before clearing browser data — stored locally only.',
  ],
  'todo-list': [
    'Add a task with optional priority, due date, or category.',
    'Mark items complete or edit inline.',
    'Filter by status/tag; search when the list grows.',
    'Export tasks if the tool offers backup — data stays in local storage.',
  ],
  'list-randomizer': [
    'Paste your list with one item per line in the text area.',
    'Click Shuffle to randomize the order — each click produces a new sequence.',
    'Copy the randomized list from the output panel.',
    'Run again for a different order; original list stays in the input until you change it.',
  ],
  'ovulation-calculator': [
    'Enter the first day of your last menstrual period (LMP).',
    'Set your average cycle length in days (default is often 28).',
    'Review estimated ovulation day and the highlighted fertile window.',
    'Treat results as calendar estimates — confirm with LH tests or your clinician if trying to conceive.',
  ],
  'period-calculator': [
    'Enter the first day of your last period and your typical cycle length.',
    'View predicted next period date and cycle calendar.',
    'Adjust cycle length if your history varies month to month.',
    'Use for planning only — not contraception or medical diagnosis.',
  ],
  'safe-days-calculator': [
    'Enter last period date and cycle length.',
    'Review marked safe days vs fertile days on the calendar.',
    'Read the pregnancy-risk indicator for each phase.',
    'Do not rely on this alone for contraception — consult a healthcare provider.',
  ],
  'photo-annotation-tool': [
    'Upload your passport or application photo.',
    'Type name, date, and optional signature text in the overlay fields.',
    'Drag text boxes to position name/date on the image preview.',
    'Download the annotated photo when alignment looks correct.',
  ],
  'add-name-date-photo': [
    'Upload your passport or application photo.',
    'Type name, date, and optional signature text in the overlay fields.',
    'Drag text boxes to position name/date on the image preview.',
    'Download the annotated photo when alignment looks correct.',
  ],
  'barcode-generator': [
    'Enter one barcode value per line (or paste a bulk list).',
    'Pick symbology (Code 128, EAN-13, UPC, etc.) and visual style.',
    'Choose Avery sheet layout if printing label sheets.',
    'Download PNG or ZIP of all generated barcodes.',
  ],
  'merge-images': [
    'Upload two or more images using the file picker.',
    'Choose layout: horizontal row, vertical stack, or grid.',
    'Adjust spacing/alignment if controls are shown, then preview the combined canvas.',
    'Download the merged image as a single PNG/JPEG file.',
  ],
  'split-image': [
    'Upload the image you want to divide.',
    'Set number of rows and columns for the grid split.',
    'Preview the pieces, then download all slices as a ZIP.',
    'Use equal divisions — uneven crops may need Image Cropper first.',
  ],
  'image-to-text': [
    'Upload a photo or scanned document containing text.',
    'Select language if OCR language options are shown.',
    'Run extraction — recognized text appears in the output editor.',
    'Copy or download the text; proofread OCR output before publishing.',
  ],
  'pdf-text-extractor': [
    'Upload a PDF file via drag-and-drop or the file picker.',
    'Wait for text extraction to complete page by page.',
    'Review extracted plain text in the output panel.',
    'Copy or download as .txt for editing elsewhere.',
  ],
  'pdf-compressor': [
    'Choose Single or Bulk mode and upload PDF file(s) up to 40MB each.',
    'Select a compression level (Full Quality → Compact, or Compress to ~150 KB) and check estimated size.',
    'Click Compress and wait for page progress.',
    'Download each compressed PDF or use Download all for bulk jobs.',
  ],
  'box-shadow-generator': [
    'Adjust X offset, Y offset, blur, spread, and shadow color with the sliders.',
    'Toggle inset shadow if you need an inner shadow effect.',
    'Preview the box live in the demo area.',
    'Copy the generated CSS snippet into your stylesheet.',
  ],
  'border-radius-generator': [
    'Drag corner handles or enter radius values for each corner.',
    'Switch between uniform and individual corner control.',
    'Preview the rounded box in the live demo panel.',
    'Copy the CSS border-radius declaration.',
  ],
  'button-generator': [
    'Pick a preset style or customize colors, padding, border radius, and hover state.',
    'Edit button label text in the preview.',
    'Fine-tune shadow and font settings until the preview matches your design.',
    'Copy CSS and HTML together for drop-in use.',
  ],
  'gradient-generator': [
    'Add color stops and pick linear or radial gradient type.',
    'Set angle or direction for linear gradients.',
    'Preview the gradient on the sample box.',
    'Copy the CSS background property.',
  ],
  'dummy-api-generator': [
    'Browse available REST endpoints (auth, CRUD, users) in the docs panel.',
    'Copy the base URL and sample Bearer token for testing.',
    'Use the live API tester tab to send login/register or CRUD requests.',
    'Copy cURL, fetch, or Axios examples into your project.',
  ],
  'daily-task-report-saver': [
    'Pick today\'s date or jump to a saved date from history.',
    'Fill timetable, routine, work report, and notes sections.',
    'Save — entries persist in browser local storage by date.',
    'Export or copy the report before clearing browser data.',
  ],
  'timetable-maker': [
    'Enter hobbies, goals, job hours, and preferences in the profile form.',
    'Generate a draft weekly timetable from your inputs.',
    'Edit individual time slots inline, then regenerate if needed.',
    'Save locally and export/print the finished schedule.',
  ],
  'social-media-deep-link-generator': [
    'Paste the original YouTube, Instagram, Facebook, or other platform URL.',
    'Select target platform behavior (open in app vs web fallback).',
    'Generate the smart deep link.',
    'Copy and test on mobile — app opens when installed, browser otherwise.',
  ],
  'social-media-planner': [
    'Create a draft post with caption, platform tags, and scheduled date.',
    'Add posts to the content calendar view by day/week.',
    'Edit or duplicate drafts; mark published when live.',
    'Export calendar summary if the tool offers download.',
  ],
  'social-media-db-viewer': [
    'Enter a public Instagram or Facebook username/URL.',
    'Submit to fetch publicly visible profile stats shown by the tool.',
    'Review follower/post counts and profile metadata in the results card.',
    'Use only for public accounts you are authorized to look up.',
  ],
  'fd-calculator': [
    'Enter FD principal (₹), annual interest rate, and tenure.',
    'Select compounding frequency (monthly, quarterly, yearly).',
    'View maturity amount and total interest earned.',
    'Compare tenures — bank TDS and schemes may differ from this estimate.',
  ],
  'sip-calculator': [
    'Choose SIP or lumpsum mode.',
    'Enter monthly SIP amount or one-time investment, expected return (%), and years.',
    'Review estimated corpus, total invested, and wealth gained.',
    'Adjust return assumption — markets vary; this is illustrative only.',
  ],
  'ppf-calculator': [
    'Enter yearly PPF deposit (up to ₹1.5 lakh) and current interest rate.',
    'Set tenure (default 15-year PPF term).',
    'View maturity balance and interest breakdown.',
    'Verify with your bank passbook before tax planning.',
  ],
  'income-tax-calculator': [
    'Enter annual income and applicable deductions (80C, 80D, etc.).',
    'Select old vs new tax regime to compare liability.',
    'Review taxable income, tax payable, and effective rate.',
    'File through the official portal for final figures.',
  ],
  'simple-calculator': [
    'Click number and operator buttons like a physical calculator.',
    'Chain operations with + − × ÷ and use Clear (C) to reset.',
    'Use memory keys (M+, M−, MR) if shown for running totals.',
    'Copy the display value if a copy button is available.',
  ],
  'date-difference-calculator': [
    'Pick start date and end date from the date pickers.',
    'Toggle include/exclude end date if the option is shown.',
    'Read difference in days, months, and years.',
    'Swap dates mentally or re-enter to measure reverse spans.',
  ],
  'future-date-calculator': [
    'Select a base date from the picker.',
    'Enter days, months, or years to add or subtract.',
    'View the computed future or past date instantly.',
    'Use for deadlines, contract dates, or project planning.',
  ],
  'temperature-converter': [
    'Enter a value in Celsius, Fahrenheit, or Kelvin.',
    'Other units update automatically as you type.',
    'Copy the converted values from the output fields.',
    'Clear and enter a new value for the next conversion.',
  ],
  'unit-converter': [
    'Choose measurement category (length, weight, volume, etc.).',
    'Select from-unit and to-unit.',
    'Enter the quantity — converted result updates live.',
    'Copy the result or swap units for reverse conversion.',
  ],
  'enhanced-unit-converter': [
    'Pick a category: length, weight, temperature, time, data size, or speed.',
    'Select source and target units from the dropdowns.',
    'Type the value — conversion updates in real time.',
    'Copy result; history may list recent conversions if enabled.',
  ],
  'color-converter': [
    'Enter a HEX, RGB, or HSL value — or use the color picker.',
    'All formats sync instantly in the output fields.',
    'Copy the code format your CSS or design tool needs.',
    'Pick a new swatch to convert another color.',
  ],
  'coin-flip': [
    'Click Flip to toss the virtual coin.',
    'View Heads or Tails result with animation.',
    'Flip again for independent trials; check history if shown.',
  ],
  'dice-roller': [
    'Set number of dice and sides (e.g. 2d6).',
    'Click Roll to generate random dice values.',
    'Read individual die results and the sum total.',
    'Roll again — history may list recent throws.',
  ],
  'yes-no-generator': [
    'Click Generate for a random Yes or No answer.',
    'Use for quick decisions — not for serious legal or medical choices.',
    'Generate again for a new random answer.',
  ],
  'business-idea-generator': [
    'Select industry, budget, or interest filters if shown.',
    'Click Generate to receive creative business ideas.',
    'Copy ideas you like; regenerate for more variations.',
    'Validate any idea with market research before investing.',
  ],
  'text-font-changer': [
    'Type text in the input box — preview updates in multiple Unicode fonts.',
    'Pick a font style (bold, bubble, cursive) from the gallery.',
    'Check character limits for Instagram, Discord, or TikTok presets if shown.',
    'Copy styled text or export PNG when available.',
  ],
  'pregnancy-week-calculator': [
    'Enter the first day of your last menstrual period (LMP).',
    'View current gestational week, trimester, and baby size milestone.',
    'Compare with ultrasound dating at prenatal visits.',
  ],
  'conception-date-calculator': [
    'Enter due date or LMP plus cycle length depending on mode.',
    'Review estimated conception window dates.',
    'Use for curiosity/planning — ultrasound dating is more precise.',
  ],
  'pregnancy-weight-gain-calculator': [
    'Enter pre-pregnancy weight and height to compute BMI.',
    'View recommended total weight gain range for your BMI category.',
    'Track by trimester if trimester breakdown is shown.',
    'Follow guidance from your prenatal provider.',
  ],
  'pregnancy-diet-planner': [
    'Select current trimester.',
    'Review suggested calorie range, food lists, and foods to limit.',
    'Use as educational guidance — personalize with your dietitian or OB.',
  ],
  'countdown-timer': [
    'Set hours, minutes, and seconds for the countdown duration.',
    'Start the timer — pause or reset with on-screen controls.',
    'Allow sound/notification when countdown reaches zero.',
    'Reset and run another countdown session.',
  ],
  'stopwatch': [
    'Press Start to begin elapsed time tracking.',
    'Tap Lap to record split times without stopping.',
    'Press Stop to end; copy total time or review lap list.',
    'Reset to clear and start a new session.',
  ],
  'background-remover': [
    'Upload a JPG or PNG photo via drag-and-drop or the file picker.',
    'Wait for automatic background removal — preview updates with transparent background.',
    'Use manual refine/erase brush if available to fix edges around hair or details.',
    'Download the cutout as PNG with transparency.',
  ],
  'base64-converter': [
    'Paste plain text in the input area for encoding, or paste a Base64 string to decode.',
    'Click Encode or Decode — output appears in the opposite panel.',
    'Use URL-safe mode if encoding data for query strings.',
    'Copy the result; verify decoded text before using in production configs.',
  ],
  'bmi-calculator': [
    'Choose metric (kg/cm) or imperial (lb/ft-in) units.',
    'Enter your weight and height in the form fields.',
    'Read BMI value and category (underweight, normal, overweight, obese).',
    'Use for screening only — consult a clinician for health advice.',
  ],
  'age-calculator': [
    'Enter your date of birth using the date picker.',
    'View exact age in years, months, and days.',
    'Check bonus outputs: total days lived, weeks, or next birthday countdown if shown.',
    'Change the date to calculate someone else\'s age.',
  ],
  'blur-image': [
    'Upload the image you want to blur.',
    'Adjust blur intensity with the slider — preview updates live.',
    'Use selective/regional blur if the tool lets you paint a mask area.',
    'Download the blurred image when the effect looks right.',
  ],
  'color-picker-tool': [
    'Pick a color from the palette or use the eyedropper on an uploaded image.',
    'Copy HEX, RGB, or HSL codes from the readout panels.',
    'Save colors to history for reuse in your design session.',
  ],
  'hash-generator': [
    'Paste text or upload a file to hash (MD5, SHA-1, SHA-256, SHA-512).',
    'Select algorithm tabs to compare outputs side by side.',
    'For verification: paste known hash in Compare mode with your plain text.',
    'Copy the hash digest for checksums or password-verify workflows.',
  ],
  'html-formatter': [
    'Paste messy HTML into the input editor.',
    'Click Format/Beautify to apply indentation and line breaks.',
    'Fix any validation warnings shown for unclosed tags.',
    'Copy pretty-printed HTML or download the formatted file.',
  ],
  'javascript-minifier': [
    'Paste JavaScript source into the input panel.',
    'Click Minify to strip whitespace and comments.',
    'Compare before/after byte size in the stats line.',
    'Copy minified JS for production script tags.',
  ],
  'css-minifier': [
    'Paste CSS into the editor.',
    'Run Minify — comments and extra spaces are removed; colors may compress.',
    'Review size reduction percentage.',
    'Copy optimized CSS into your bundle.',
  ],
  'json-validator': [
    'Paste JSON into the editor.',
    'Validation runs automatically — errors show line/column hints.',
    'Fix syntax issues until the valid indicator turns green.',
    'Copy cleaned JSON for API requests or config files.',
  ],
  'url-encode-decode': [
    'Paste a URL or string with special characters.',
    'Click Encode for safe transmission or Decode for readable text.',
    'Copy output — encoded URLs are safe for query parameters.',
  ],
  'jwt-decoder': [
    'Paste a JWT token (header.payload.signature) into the field.',
    'View decoded header and payload JSON without verifying signature.',
    'Check exp/iat claims for expiration debugging.',
    'Never paste production secrets into shared machines.',
  ],
  'meta-tag-previewer': [
    'Enter page title, description, and URL for your page.',
    'Preview Google search snippet and social card layouts.',
    'Adjust OG/Twitter tags until previews look correct.',
    'Copy generated meta tag HTML into your <head>.',
  ],
  'image-resizer': [
    'Upload your image.',
    'Pick Education, Social, Email/Photo KB Resize (50–150KB, 1MB), or Manual dimensions.',
    'Preview dimensions and estimated file size; tune quality if needed.',
    'Download the resized email-friendly or exam-ready photo.',
  ],
  'image-format-converter': [
    'Upload JPG, PNG, or WebP source file.',
    'Choose target format and quality/compression setting.',
    'Preview converted output.',
    'Download in the new format.',
  ],
  'image-cropper': [
    'Upload an image and drag the crop box to the desired region.',
    'Pick a social preset (Instagram, Facebook, etc.) or enter custom pixels.',
    'Lock aspect ratio if required by the platform.',
    'Download the cropped result.',
  ],
  'logo-to-favicon': [
    'Upload your square logo or brand mark.',
    'Select favicon sizes to generate (16, 32, 180, etc.).',
    'Preview icons at each size.',
    'Download ICO/PNG pack for web and PWA manifests.',
  ],
  'markdown-editor': [
    'Write Markdown in the left editor pane.',
    'See rendered HTML preview update live on the right.',
    'Copy Markdown or export HTML when finished.',
  ],
  'discord-formatter': [
    'Type message text and apply Discord markdown (bold, italic, code blocks).',
    'Preview formatted output as it will appear in Discord.',
    'Copy the formatted string into your Discord chat.',
  ],
  'hashtag-generator': [
    'Enter a topic, keyword, or short caption.',
    'Generate relevant hashtag sets for your platform.',
    'Copy the tag block into Instagram, TikTok, or LinkedIn posts.',
  ],
  'name-generator': [
    'Choose category (person, business, character) and optional filters.',
    'Click Generate for a batch of names.',
    'Copy names you like; regenerate for fresh ideas.',
  ],
  'username-generator': [
    'Set length options and whether to include numbers/symbols.',
    'Generate username ideas for gaming or social profiles.',
    'Copy an available-style handle; verify availability on the target platform.',
  ],
  'qr-scanner': [
    'Allow camera access or upload a photo containing a QR code.',
    'Hold steady until decode succeeds.',
    'Open URL results in a new tab or copy decoded text.',
    'Review scan history for repeated lookups.',
  ],
  'ip-address-to-location-finder': [
    'Enter any IPv4 or IPv6 address in the search field.',
    'Submit to fetch geolocation, ISP, timezone, and map pin.',
    'Copy location fields for firewall logs or analytics debugging.',
  ],
  'random-number-generator': [
    'Set minimum and maximum range.',
    'Choose how many random numbers to generate.',
    'Click Generate and copy the results.',
  ],
  'percentage-calculator': [
    'Pick calculation mode (X% of Y, increase/decrease, ratio).',
    'Enter the values requested by that mode.',
    'Read the computed percentage result instantly.',
  ],
  'text-case-converter': [
    'Paste text into the input box.',
    'Click Uppercase, Lowercase, Title Case, or Sentence case.',
    'Copy converted text from the output panel.',
  ],
  'whitespace-remover': [
    'Paste text with extra spaces, tabs, or blank lines.',
    'Choose trim mode: extra spaces, all whitespace, or leading/trailing only.',
    'Copy cleaned text for code, CSV, or document paste.',
  ],
  'duplicate-line-remover': [
    'Paste a line-separated list.',
    'Choose case-sensitive or insensitive deduplication.',
    'Copy unique lines preserving first occurrence order.',
  ],
  'text-reverser': [
    'Paste text to reverse characters, words, or lines.',
    'Select reverse mode from the controls.',
    'Copy reversed output.',
  ],
  'regex-tester': [
    'Enter a regex pattern and flags (g, i, m).',
    'Paste sample text in the test string field.',
    'View matches highlighted with capture groups listed.',
  ],
  'lorem-ipsum-generator': [
    'Set word, sentence, or paragraph count.',
    'Click Generate for placeholder Latin text.',
    'Copy output into design mockups or CMS drafts.',
  ],
  'text-to-handwriting': [
    'Type or paste text to convert.',
    'Pick handwriting style, pen color, and paper background.',
    'Download the rendered handwriting image.',
  ],
  'text-to-speech': [
    'Paste text and select voice/language.',
    'Adjust speed or pitch if sliders are available.',
    'Click Play to hear audio; download MP3 when offered.',
  ],
  'timestamp-converter': [
    'Paste a Unix timestamp or pick a date/time.',
    'Select timezone for human-readable output.',
    'Copy ISO 8601 or epoch value for logs and APIs.',
  ],
  'url-slug-generator': [
    'Type a page title or phrase.',
    'Edit the generated slug (lowercase, hyphen-separated).',
    'Copy SEO-friendly slug for CMS or blog URLs.',
  ],
};

function buildSteps(tool) {
  if (SLUG_STEPS[tool.slug]) return SLUG_STEPS[tool.slug];

  const cat = tool.category.toLowerCase();
  const f = tool.features;
  const name = tool.name;

  if (
    cat.includes('image') &&
    f.some((x) =>
      /upload|compress|crop|resize|merge|split|flip|blur|pixelate|remove|convert|extract|upscale|ocr|annotate|favicon|placeholder|metadata|svg|background/i.test(
        x
      )
    )
  ) {
    const steps = [
      'Upload your image via drag-and-drop or the file picker (supported formats shown on the tool).',
    ];
    const mid = f.filter((x) => !/upload|download|copy/i.test(x)).slice(0, 2);
    for (const feat of mid) steps.push(featAction(feat));
    steps.push(
      f.find((x) => /download/i.test(x))
        ? featAction(f.find((x) => /download/i.test(x)))
        : 'Download the processed image when the preview looks correct.'
    );
    return steps.slice(0, 5);
  }

  if (cat.includes('text') || cat.includes('writing')) {
    const steps = [
      f.find((x) => /paste|type|enter|write/i.test(x))
        ? featAction(f.find((x) => /paste|type|enter|write/i.test(x)))
        : `Paste or type your text in the ${name} editor.`,
    ];
    for (const feat of f.filter((x) => !/copy|paste|local storage|export|import/i.test(x)).slice(0, 2)) {
      steps.push(featAction(feat));
    }
    steps.push(
      f.find((x) => /copy/i.test(x))
        ? featAction(f.find((x) => /copy/i.test(x)))
        : 'Copy the transformed output from the result panel.'
    );
    return steps.slice(0, 5);
  }

  if (cat.includes('development') || cat.includes('developer')) {
    if (/minif|formatter|validator|optimizer|encoder|decoder|converter|preview|tester|generator|editor/i.test(tool.slug)) {
      const inputLabel = /json/i.test(tool.slug)
        ? 'JSON'
        : /html/i.test(tool.slug)
          ? 'HTML'
          : /css/i.test(tool.slug)
            ? 'CSS'
            : /javascript|js/i.test(tool.slug)
              ? 'JavaScript'
              : 'code or input';
      const steps = [`Paste your ${inputLabel} into the editor.`];
      for (const feat of f.slice(0, 2)) steps.push(featAction(feat));
      steps.push(
        f.find((x) => /copy/i.test(x))
          ? featAction(f.find((x) => /copy/i.test(x)))
          : 'Copy or download the processed output.'
      );
      return steps.slice(0, 5);
    }
  }

  if (cat.includes('number') || cat.includes('finance') || cat.includes('calculat')) {
    const steps = [
      `Open ${name} and enter the required values (${f.slice(0, 3).join(', ') || 'amounts and rates'}).`,
    ];
    for (const feat of f.filter((x) => /display|calculate|show|breakdown|schedule|chart/i.test(x)).slice(0, 2)) {
      steps.push(featAction(feat));
    }
    steps.push('Change inputs to compare scenarios — results are planning estimates, not official quotes.');
    return steps.slice(0, 5);
  }

  if (cat.includes('pregnancy') || cat.includes('period') || cat.includes('cycle')) {
    return [
      `Enter dates, cycle length, or symptoms in ${name}.`,
      f[0] ? featAction(f[0]) : 'Review the calendar estimate or saved log.',
      f[1] ? featAction(f[1]) : 'Adjust inputs to see updated predictions.',
      'Use output for planning only — confirm health decisions with a qualified clinician.',
    ];
  }

  if (cat.includes('converter')) {
    return [
      'Select source unit/format and target unit/format from the dropdowns.',
      'Enter the value to convert — output updates in real time.',
      f.find((x) => /copy/i.test(x))
        ? featAction(f.find((x) => /copy/i.test(x)))
        : 'Copy the converted result.',
      'Swap direction if you need reverse conversion.',
    ];
  }

  if (cat.includes('typing')) {
    return (
      SLUG_STEPS[tool.slug] || [
        `Start ${name} and read the on-screen prompt.`,
        'Type accurately — errors may reduce your score.',
        'Finish the round to view speed and accuracy metrics.',
        'Repeat or try a related typing tool from Related Tools below.',
      ]
    );
  }

  if (cat.includes('timer') || cat.includes('stopwatch') || cat.includes('countdown')) {
    return [
      tool.slug.includes('countdown')
        ? 'Set hours, minutes, and seconds for the countdown.'
        : 'Press Start to begin timing.',
      tool.slug.includes('countdown')
        ? 'Start the countdown — pause or reset if buttons are shown.'
        : 'Press Lap to record split times or Stop to end.',
      tool.slug.includes('countdown')
        ? 'Allow notification/alarm when the timer reaches zero.'
        : 'Copy elapsed time or review lap history.',
      'Reset to run another session.',
    ];
  }

  if (cat.includes('network')) {
    return (
      SLUG_STEPS[tool.slug] || [
        `Enter a query (IP, location, or search term) in ${name}.`,
        'Submit or wait for auto-detection on page load.',
        'Review the returned network or location metadata.',
        'Copy fields you need for debugging or support tickets.',
      ]
    );
  }

  if (cat.includes('social') || cat.includes('video')) {
    return [
      'Paste the profile URL, post link, or content identifier in the input field.',
      f[0] ? featAction(f[0]) : 'Submit and wait for the tool to resolve public metadata or media.',
      'Copy deep link, download, or planner entry from the results panel.',
      'Use only for content you are authorized to access.',
    ];
  }

  if (cat.includes('utility')) {
    if (/coin|dice|yes|random|list-random|flip/i.test(tool.slug)) {
      return [
        `Configure options (${f.slice(0, 2).join(', ') || 'range or count'}) if shown.`,
        `Click the main action button to run ${name}.`,
        'View the random outcome in the display area.',
        f.find((x) => /copy|history/i.test(x))
          ? featAction(f.find((x) => /copy|history/i.test(x)))
          : 'Run again for a new result.',
      ];
    }
  }

  const steps = [`Open ${name} at https://fyntools.com${tool.path}.`];
  for (const feat of f.slice(0, 3)) steps.push(featAction(feat));
  if (steps.length < 4) steps.push('Review the live output and copy or download when ready.');
  return steps.slice(0, 5);
}

const existing = new Map();
for (const f of [
  'src/data/tool-content/pageOverrides.ts',
  'src/data/tool-content/batch1.ts',
  'src/data/tool-content/batch2.ts',
  'src/data/tool-content/batch3.ts',
  'src/data/tool-content/batch4.ts',
  'src/data/tool-content/batch5.ts',
  'src/data/tool-content/batch6.ts',
  'src/data/tool-content/batch7.ts',
]) {
  for (const [p, steps] of extractHowToFromTs(path.join(root, f))) {
    existing.set(p, steps);
  }
}

const tools = extractTools(fs.readFileSync(path.join(root, 'src/data/toolsData.ts'), 'utf8'));
const catalog = {};

for (const tool of tools) {
  const curated = existing.get(tool.path);
  catalog[tool.path] =
    curated && curated.length >= 3 && !isWeakSteps(curated) ? curated : buildSteps(tool);
}

const lines = [
  '/**',
  ' * Tool-specific How to Use steps for SEO pages and llms.txt.',
  ' * AUTO-GENERATED — run: node scripts/generate-tool-howto-catalog.mjs',
  ' */',
  '',
  'export const toolHowToCatalog: Record<string, string[]> = {',
];

for (const tool of tools.sort((a, b) => a.path.localeCompare(b.path))) {
  const steps = catalog[tool.path];
  lines.push(`  '${tool.path}': [`);
  for (const s of steps) {
    lines.push(`    ${JSON.stringify(s)},`);
  }
  lines.push('  ],');
}

lines.push(
  '};',
  '',
  'export function getToolHowToSteps(path: string): string[] | undefined {',
  '  return toolHowToCatalog[path];',
  '}',
  ''
);

fs.writeFileSync(outFile, lines.join('\n'));
console.log(`Wrote ${outFile} — ${tools.length} tools`);
