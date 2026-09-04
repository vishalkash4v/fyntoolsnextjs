import type { Tool } from '@/data/toolsData';
import { getPathExamples } from '@/data/tool-content/toolExamples';

export type ToolFactCard = {
  whatItDoes: string;
  inputs: string;
  outputs: string;
  limit?: string;
  oneMistake: string;
  cases: { title: string; description: string }[];
};

/** Per-path facts for tools that still had category-clone SEO. */
export const TOOL_FACT_CARDS: Record<string, ToolFactCard> = {
  '/weather-forecast': {
    whatItDoes:
      'Looks up a village, town, or city (Google Places when a key is set) and returns a live forecast through the FYN Weather Gateway.',
    inputs: 'Place search, GPS, or IP region fallback',
    outputs: 'Current temp, feels-like, 7-day, hourly rain %, AQI, UV, clothing tips',
    limit: 'Forecast quality depends on open weather models; search quality depends on geocoders',
    oneMistake: 'Searching only a common name like “Amb” without state — add Himachal or India.',
    cases: [
      { title: 'Village before a trip', description: 'Type a Himachal village, pick the Google suggestion, read rain % for the next 24 hours.' },
      { title: 'GPS at the current spot', description: 'Tap GPS so reverse-geocode fills the search bar and the hero card matches where you stand.' },
      { title: 'AQI before outdoor work', description: 'Check US AQI and UV on the same card as temperature so you are not opening a second weather app.' },
    ],
  },
  '/button-generator': {
    whatItDoes:
      'Builds HTML/CSS/React for a button from presets (neon, glass, Instagram) plus fonts, hover gradients, glow, and stickers.',
    inputs: 'Preset click or manual text, colors, radius, animations, emoji/logo',
    outputs: 'Live preview plus copyable HTML, CSS keyframes, and React snippet',
    oneMistake: 'Leaving a previous glow/gradient on — click a preset to fully replace settings, or Reset all.',
    cases: [
      { title: 'CTA in five seconds', description: 'Click Primary CTA or Sunset Gradient; export CSS into your landing page.' },
      { title: 'Neon with hover pulse', description: 'Load Neon Cyberpunk, keep glow, copy the keyframes block with the button class.' },
      { title: 'Icon + pill', description: 'Pick Pill Success, add a sticker, set position left/right, copy HTML.' },
    ],
  },
  '/pdf-compressor': {
    whatItDoes: 'Re-encodes PDF pages in the browser so scanned forms fit ~150KB upload caps.',
    inputs: 'One PDF or up to 12 files, 40MB each, six quality levels',
    outputs: 'Compressed PDF download with before/after sizes',
    limit: 'Photo-heavy multi-page files may stay slightly above 150KB at the quality floor',
    oneMistake: 'Using Full Quality when the portal wants 150KB — pick Compress to ~150 KB.',
    cases: [
      { title: 'Exam portal cap', description: 'Upload a 2MB scan, choose Compress to ~150 KB, download for the form.' },
      { title: 'Bulk supporting docs', description: 'Switch to Bulk, drop several PDFs, use Optimized, Download all.' },
      { title: 'Email attachment', description: 'Use Compact so the file sits under common mailbox limits.' },
    ],
  },
  '/image-compressor': {
    whatItDoes: 'Shrinks JPG/PNG/WebP in the browser with a quality slider and size target.',
    inputs: 'Image file + quality or KB target',
    outputs: 'Smaller image download, same format or converted',
    oneMistake: 'Expecting lossless 90% cuts on already-tiny screenshots — compress photos, not 20KB icons.',
    cases: [
      { title: 'Email photo', description: 'Drop a camera JPG, pull quality down until the estimate fits your mailbox.' },
      { title: 'WebP for a blog', description: 'Compress then convert if you need WebP for the CMS.' },
      { title: 'Batch screenshots', description: 'Run several PNGs at a moderate quality so the zip stays small.' },
    ],
  },
  '/word-counter': {
    whatItDoes: 'Counts words, characters, sentences, and reading time as you paste or type.',
    inputs: 'Any plain text',
    outputs: 'Live word/character totals and reading-time estimate',
    oneMistake: 'Pasting HTML and expecting tags not to count — strip markup first if you need “visible words only”.',
    cases: [
      { title: 'Meta description length', description: 'Paste a draft and watch character count against a 155-character target.' },
      { title: 'Essay word limit', description: 'Keep the panel open while you write so you do not overshoot 500 or 1000 words.' },
      { title: 'Caption trim', description: 'Paste an Instagram caption and cut until the counter matches the platform cap.' },
    ],
  },
  '/url-shortener': {
    whatItDoes: 'Turns a long URL into a short FYN link you can share.',
    inputs: 'Full https URL, optional alias',
    outputs: 'Short link plus copy button',
    oneMistake: 'Shortening a URL that already has a tracking redirect — shorten the final destination.',
    cases: [
      { title: 'Campaign UTM', description: 'Paste a long UTM URL, copy the short link into SMS or WhatsApp.' },
      { title: 'Print QR pair', description: 'Shorten first, then generate a QR from the short URL so the print stays clean.' },
      { title: 'Bio link', description: 'Use a stable short path for an Instagram bio instead of a raw query string.' },
    ],
  },
  '/border-radius-generator': {
    whatItDoes: 'Lets you drag four corners and copy the CSS border-radius shorthand.',
    inputs: 'Per-corner pixel or percent values',
    outputs: 'border-radius CSS + live box preview',
    oneMistake: 'Copying only one corner when you needed the 8-value ellipsis form.',
    cases: [
      { title: 'Card chip', description: 'Set 12px all around and paste into a card class.' },
      { title: 'Pill button', description: 'Push radius to 999px and copy the one-line rule.' },
      { title: 'Asymmetric blob', description: 'Uneven corners for a hero image mask.' },
    ],
  },
  '/box-shadow-generator': {
    whatItDoes: 'Builds box-shadow from offset, blur, spread, and color with a live preview.',
    inputs: 'X/Y offset, blur, spread, RGBA color, inset toggle',
    outputs: 'box-shadow CSS declaration',
    oneMistake: 'Stacking a huge blur with 100% black — shadows look like a smudge, not elevation.',
    cases: [
      { title: 'Soft card lift', description: 'Y 8px blur 16px 18% black — typical dashboard card.' },
      { title: 'Neumorph inset', description: 'Toggle inset for a pressed control.' },
      { title: 'Layered glow', description: 'Copy two shadows: a tight dark one plus a colored glow.' },
    ],
  },
  '/business-idea-generator': {
    whatItDoes: 'Suggests business ideas from industry, budget, and audience filters.',
    inputs: 'Industry, budget band, audience',
    outputs: 'Idea list with a short angle',
    oneMistake: 'Treating a generated idea as a validated market — it is a prompt, not a business plan.',
    cases: [
      { title: 'Side hustle filter', description: 'Set budget low and industry education for exam-prep ideas.' },
      { title: 'Local services', description: 'Pick a city-friendly audience and skim service-style ideas.' },
      { title: 'Brainstorm dump', description: 'Generate a batch, copy three lines into a notes app, discard the rest.' },
    ],
  },
  '/coin-flip': {
    whatItDoes: 'Animates a coin toss with a 50/50 result and a short history.',
    inputs: 'Click Flip',
    outputs: 'Heads or Tails plus session counts',
    oneMistake: 'Using it as a cryptographic random source — it is a fair UI toss, not a security RNG.',
    cases: [
      { title: 'Two-option pick', description: 'Assign heads/tails to two restaurants and flip once.' },
      { title: 'Best of three', description: 'Flip three times and read the history counts.' },
      { title: 'Classroom demo', description: 'Show a visible random choice without a physical coin.' },
    ],
  },
  '/color-converter': {
    whatItDoes: 'Converts HEX, RGB, HSL, and related color strings both ways.',
    inputs: 'A color in one notation',
    outputs: 'The same color in the other notations',
    oneMistake: 'Pasting a 3-digit hex without # and wondering why it failed — include # or expand to 6 digits.',
    cases: [
      { title: 'Design token', description: 'Paste #2563eb and copy rgb() for a CSS variable.' },
      { title: 'Figma to CSS', description: 'Convert HSL from a design file into HEX for Tailwind.' },
      { title: 'Opacity check', description: 'Move through RGB to confirm the same hue before adding alpha.' },
    ],
  },
  '/countdown-timer': {
    whatItDoes: 'Counts down from a duration you set and alerts at zero.',
    inputs: 'Minutes/seconds or a target duration',
    outputs: 'Live remaining time, optional tab title',
    oneMistake: 'Closing the tab and expecting the timer to keep running on the server — it is in-browser.',
    cases: [
      { title: 'Pomodoro 25:00', description: 'Set 25 minutes, start, work until the alert.' },
      { title: 'Exam section', description: 'Set the remaining minutes for a paper section.' },
      { title: 'Kitchen backup', description: 'Use it when the phone timer is already busy.' },
    ],
  },
  '/currency-converter': {
    whatItDoes: 'Converts an amount between currencies using a public rate feed.',
    inputs: 'Amount, from currency, to currency',
    outputs: 'Converted amount at the latest available mid-market style rate',
    limit: 'Not a bank quote — spreads differ',
    oneMistake: 'Using the result as a wire-transfer quote without checking your bank’s rate.',
    cases: [
      { title: 'Travel cash guess', description: 'Convert INR to EUR for a weekend budget.' },
      { title: 'Invoice check', description: 'See USD→INR before you send an international invoice.' },
      { title: 'Compare two pairs', description: 'Flip from/to to sanity-check the inverse.' },
    ],
  },
  '/daily-task-report-saver': {
    whatItDoes: 'Stores a dated work/report note in localStorage on this device.',
    inputs: 'Date, tasks, notes',
    outputs: 'Saved daily log you can reopen and copy',
    oneMistake: 'Clearing site data and expecting the log to survive — export first.',
    cases: [
      { title: 'EOD standup', description: 'Write shipped items, save, paste into Slack tomorrow.' },
      { title: 'Client hours', description: 'Log tasks per day before invoicing.' },
      { title: 'Habit trail', description: 'Keep a simple dated diary without another app.' },
    ],
  },
  '/date-difference-calculator': {
    whatItDoes: 'Counts days, weeks, and months between two calendar dates.',
    inputs: 'Start date and end date',
    outputs: 'Elapsed duration breakdown',
    oneMistake: 'Including or excluding the end date inconsistently — check whether you need “nights” vs “days”.',
    cases: [
      { title: 'Notice period', description: 'From resignation date to last working day.' },
      { title: 'Project span', description: 'Kickoff to delivery for a status slide.' },
      { title: 'Age in days', description: 'Birthday to today when a form wants exact days.' },
    ],
  },
  '/dice-roller': {
    whatItDoes: 'Rolls one or more dice and shows the total.',
    inputs: 'Die type and count',
    outputs: 'Face values and sum',
    oneMistake: 'Assuming cryptographic fairness for gambling — this is a casual roller.',
    cases: [
      { title: 'Board game', description: 'Roll 2d6 without hunting physical dice.' },
      { title: 'RPG check', description: 'Roll a d20 and read the face.' },
      { title: 'Classroom random', description: 'Pick a number 1–6 for a student.' },
    ],
  },
  '/emi-calculator': {
    whatItDoes: 'Computes monthly EMI, total interest, and total payable from principal, rate, and tenure.',
    inputs: 'Loan amount, annual rate, years/months',
    outputs: 'EMI, interest outgo, amortization-style totals',
    oneMistake: 'Forgetting processing fees — the EMI is the installment, not the all-in cost.',
    cases: [
      { title: 'Home loan sketch', description: 'Try ₹50 lakh at 8.5% for 20 years and read EMI.' },
      { title: 'Shorter tenure', description: 'Drop years and watch EMI jump vs interest drop.' },
      { title: 'Car loan compare', description: 'Change rate by 0.5% to see monthly impact.' },
    ],
  },
  '/fd-calculator': {
    whatItDoes: 'Estimates fixed-deposit maturity for a principal, rate, and term.',
    inputs: 'Deposit, rate, tenure, compounding if shown',
    outputs: 'Maturity amount and interest earned',
    oneMistake: 'Comparing bank ads that quote differently (quarterly vs annual) without matching the compounding field.',
    cases: [
      { title: '1-year FD', description: 'Enter the bank’s rate and see maturity before you book.' },
      { title: 'Ladder idea', description: 'Run 1y vs 3y to see the extra interest.' },
      { title: 'Senior rate', description: 'Bump the rate and compare against a regular FD.' },
    ],
  },
  '/flip-image': {
    whatItDoes: 'Mirrors an image horizontally or vertically in the browser.',
    inputs: 'PNG/JPG upload + flip axis',
    outputs: 'Flipped image download',
    oneMistake: 'Flipping a photo with text and expecting the letters to stay readable — they reverse.',
    cases: [
      { title: 'Selfie mirror', description: 'Flip horizontal so it matches what you saw in the camera.' },
      { title: 'Layout asset', description: 'Flip a product shot to face the other way in a banner.' },
      { title: 'Print proof', description: 'Check a design that must face a binding edge.' },
    ],
  },
  '/future-date-calculator': {
    whatItDoes: 'Adds days/weeks/months to a start date.',
    inputs: 'Start date + offset',
    outputs: 'Resulting calendar date',
    oneMistake: 'Adding 30 days and calling it “one month” — months vary; use the month field when you mean calendar months.',
    cases: [
      { title: 'Follow-up reminder', description: 'Today + 14 days for a callback.' },
      { title: 'Warranty end', description: 'Purchase date + 12 months.' },
      { title: 'Visa window', description: 'Entry date + allowed stay days.' },
    ],
  },
  '/gst-calculator': {
    whatItDoes: 'Adds or removes Indian GST (5/12/18/28%) from an amount.',
    inputs: 'Base or inclusive amount + slab',
    outputs: 'GST amount and exclusive/inclusive totals',
    oneMistake: 'Applying 18% when the HSN is 5% — pick the slab that matches the invoice, not a default.',
    cases: [
      { title: 'Quote exclusive', description: 'Enter services net and add 18% for the client total.' },
      { title: 'Back-out GST', description: 'Paste an inclusive MRP and see the tax component.' },
      { title: 'Slab compare', description: 'Toggle 12 vs 18 to explain a price change.' },
    ],
  },
  '/image-to-text': {
    whatItDoes: 'Runs OCR on a photo or scan in the browser when supported.',
    inputs: 'Image with printed text',
    outputs: 'Extracted plain text',
    oneMistake: 'Expecting handwriting or a blurry night photo to OCR cleanly — use a sharp, high-contrast shot.',
    cases: [
      { title: 'Receipt line', description: 'Snap a printed bill and copy totals into a sheet.' },
      { title: 'Whiteboard', description: 'Photograph notes and paste into a doc.' },
      { title: 'ID field', description: 'OCR a printed number, then proofread every digit.' },
    ],
  },
  '/image-upscaler': {
    whatItDoes: 'Enlarges an image with interpolation — it cannot invent real detail.',
    inputs: 'Image + scale factor',
    outputs: 'Larger image download',
    oneMistake: 'Upscaling a tiny blurry face and expecting a sharp ID photo.',
    cases: [
      { title: 'Print a small logo', description: 'Scale 2× for a poster mock, then judge artifacts.' },
      { title: 'Old screenshot', description: 'Enlarge UI captures for a slide deck.' },
      { title: 'Stop at 2×', description: 'Compare 2× vs 4×; stop when edges smear.' },
    ],
  },
  '/income-tax-calculator': {
    whatItDoes: 'Estimates Indian income tax from income and the selected regime/year rules in the form.',
    inputs: 'Taxable income, FY, deductions if the form shows them',
    outputs: 'Estimated tax, cess, and take-home style totals',
    oneMistake: 'Skipping 87A or regime choice — the number is only as good as the fields you filled.',
    cases: [
      { title: 'Salary sketch', description: 'Enter CTC-style income and compare new vs old if both are listed.' },
      { title: 'Raise check', description: 'Bump income and see the extra tax, not just the gross raise.' },
      { title: 'Not a filing', description: 'Use it to plan; file with your CA or the income-tax portal.' },
    ],
  },
  '/invoice-generator': {
    whatItDoes: 'Fills a professional invoice (client, lines, tax) and exports PDF/image.',
    inputs: 'Seller/client fields, line items, tax %',
    outputs: 'Preview + PDF or image',
    oneMistake: 'Forgetting GSTIN or invoice number required by your client’s AP team.',
    cases: [
      { title: 'Freelance hour block', description: 'Add hours × rate, 18% GST, export PDF.' },
      { title: 'Retain client', description: 'Reuse saved client details for the next month.' },
      { title: 'Image for WhatsApp', description: 'Export an image when the client will not open PDF on phone.' },
    ],
  },
  '/merge-images': {
    whatItDoes: 'Stitches multiple images into one canvas (grid or strip).',
    inputs: 'Two or more images + layout',
    outputs: 'Merged image download',
    oneMistake: 'Mixing wildly different resolutions — resize first or the collage looks jagged.',
    cases: [
      { title: 'Before/after', description: 'Place two photos side by side for a review.' },
      { title: 'Product strip', description: 'Combine three SKUs for a marketplace banner.' },
      { title: 'Meme layout', description: 'Stack panels then download.' },
    ],
  },
  '/notes': {
    whatItDoes: 'Keeps tagged, colored notes in this browser’s localStorage.',
    inputs: 'Title, body, tag, color',
    outputs: 'Searchable note list on this device',
    oneMistake: 'Assuming notes sync to your phone — they do not leave this browser profile.',
    cases: [
      { title: 'Meeting dump', description: 'Title + tag work, color yellow, search later.' },
      { title: 'Snippet stash', description: 'Paste a CSS snippet you keep reusing.' },
      { title: 'Errand list', description: 'Quick notes without a to-do structure.' },
    ],
  },
  '/pdf-text-extractor': {
    whatItDoes: 'Pulls selectable text out of a text-based PDF.',
    inputs: 'PDF file',
    outputs: 'Plain text to copy or download',
    oneMistake: 'Uploading a scan-only PDF — use Image to Text / OCR if extraction is empty.',
    cases: [
      { title: 'Contract clause', description: 'Extract and search for a payment term.' },
      { title: 'Paper notes', description: 'Copy a digital paper into your editor.' },
      { title: 'Form dump', description: 'Pull fields from a fillable PDF.' },
    ],
  },
  '/period-calculator': {
    whatItDoes: 'Estimates next period and fertile window from last start date and cycle length — educational only.',
    inputs: 'LMP date, cycle length',
    outputs: 'Predicted dates on a calendar',
    oneMistake: 'Using it as contraception — cycles shift; follow clinical guidance.',
    cases: [
      { title: 'Pack a trip', description: 'See if a predicted period overlaps travel.' },
      { title: 'Irregular note', description: 'If cycles vary a lot, treat dates as a guess only.' },
      { title: 'Share with clinician', description: 'Bring the date list to an appointment, not as a diagnosis.' },
    ],
  },
  '/period-tracker': {
    whatItDoes: 'Logs period start, flow, and symptoms locally.',
    inputs: 'Date, flow, mood/symptoms',
    outputs: 'History on this device',
    oneMistake: 'Clearing cookies and losing the log — screenshot or export if you rely on it.',
    cases: [
      { title: 'Monthly log', description: 'Mark start day and flow before you forget.' },
      { title: 'Symptom pattern', description: 'Add cramps/mood to show a clinician later.' },
      { title: 'Not medical advice', description: 'Use it as a diary, not a diagnosis.' },
    ],
  },
  '/pms-symptom-tracker': {
    whatItDoes: 'Records PMS symptom intensity by date in localStorage.',
    inputs: 'Symptom, severity, date',
    outputs: 'Local history for pattern review',
    oneMistake: 'Self-diagnosing from a week of logs — show a clinician if symptoms are severe.',
    cases: [
      { title: 'Headache scale', description: 'Log 1–10 with the date after a tough day.' },
      { title: 'Bloating note', description: 'Track alongside period dates if you also use the tracker.' },
      { title: 'Appointment prep', description: 'Copy a week of entries before a visit.' },
    ],
  },
  '/ppf-calculator': {
    whatItDoes: 'Projects PPF corpus from yearly contribution, rate, and years.',
    inputs: 'Annual deposit, rate, tenure',
    outputs: 'Maturity estimate',
    oneMistake: 'Assuming today’s rate lasts 15 years unchanged — treat it as a scenario.',
    cases: [
      { title: '₹1.5L ceiling', description: 'Run the max annual contribution for 15 years.' },
      { title: 'Lower deposit', description: 'Compare ₹50k vs ₹1.5L yearly.' },
      { title: 'Rate sensitivity', description: 'Nudge the rate to see corpus swing.' },
    ],
  },
  '/pregnancy-diet-planner': {
    whatItDoes: 'Suggests educational meal ideas by trimester — not a prescription.',
    inputs: 'Trimester / preferences in the form',
    outputs: 'Food ideas and notes',
    oneMistake: 'Following a web meal list instead of your obstetrician’s plan, especially with gestational diabetes.',
    cases: [
      { title: 'First-trimester nausea', description: 'Look for bland ideas the form lists, then confirm with your clinician.' },
      { title: 'Iron-rich ideas', description: 'Use it as a brainstorm, not a diet chart.' },
      { title: 'Allergies', description: 'Skip any listed food you cannot eat.' },
    ],
  },
  '/pregnancy-due-date-calculator': {
    whatItDoes: 'Estimates EDD from LMP using Naegele-style dating — only ~5% of births land on the exact day.',
    inputs: 'First day of last period, cycle length if asked',
    outputs: 'Estimated due date and gestational week',
    oneMistake: 'Ignoring a dating scan that disagrees with LMP.',
    cases: [
      { title: 'LMP entry', description: 'Enter the first day of bleeding, not the last.' },
      { title: 'Long cycle', description: 'Adjust cycle length if the form allows it.' },
      { title: 'Confirm clinically', description: 'Treat the date as a planning window until ultrasound.' },
    ],
  },
  '/conception-date-calculator': {
    whatItDoes: 'Works backward from a due date or gestational age to a conception window — educational.',
    inputs: 'EDD or week of pregnancy',
    outputs: 'Approximate conception range',
    oneMistake: 'Using it for legal paternity — windows are wide and ovulation varies.',
    cases: [
      { title: 'Curiosity range', description: 'From a given EDD, see a two-week-ish window.' },
      { title: 'Scan vs LMP', description: 'If dates conflict, follow the clinician’s dating.' },
      { title: 'Not forensic', description: 'Do not treat the output as proof of a calendar day.' },
    ],
  },
  '/contraction-timer': {
    whatItDoes: 'Times contraction start/stop locally so you can describe frequency to a maternity unit.',
    inputs: 'Tap start/stop per contraction',
    outputs: 'Duration and interval log',
    oneMistake: 'Using the timer instead of calling your unit when contractions are strong or you are concerned.',
    cases: [
      { title: 'Early labor log', description: 'Record a few contractions and note the gap.' },
      { title: 'Share timestamps', description: 'Read durations to a nurse on the phone.' },
      { title: 'Not a diagnosis', description: 'It does not tell you if you are in active labor.' },
    ],
  },
  '/pregnancy-week-calculator': {
    whatItDoes: 'Maps LMP or a given date to gestational week and trimester.',
    inputs: 'LMP or current gestational info',
    outputs: 'Week number + trimester label',
    oneMistake: 'Mixing embryonic age with gestational age (gestational is ~2 weeks ahead).',
    cases: [
      { title: 'How many weeks', description: 'Enter LMP and read week + trimester.' },
      { title: 'Appointment talk', description: 'Use the same week your clinic uses if they gave you one.' },
      { title: 'App mismatch', description: 'If this disagrees with your prenatal app, ask the clinic which dating they use.' },
    ],
  },
  '/pregnancy-weight-gain-calculator': {
    whatItDoes: 'Shows educational BMI-based weight-gain ranges — not a personal medical target.',
    inputs: 'Pre-pregnancy weight/height, current week if asked',
    outputs: 'Range guidance',
    oneMistake: 'Crash-dieting to “hit” a chart — twins and conditions change targets; ask your clinician.',
    cases: [
      { title: 'BMI band', description: 'Enter height/weight to see which educational range applies.' },
      { title: 'Twins', description: 'Ignore the singleton chart if you are carrying multiples.' },
      { title: 'Trend not number', description: 'Use clinic weigh-ins as the source of truth.' },
    ],
  },
  '/safe-days-calculator': {
    whatItDoes: 'Marks calendar rhythm “lower risk” days — this method fails often and is not reliable contraception.',
    inputs: 'LMP, cycle length',
    outputs: 'Calendar coloring',
    oneMistake: 'Relying on rhythm alone to avoid pregnancy.',
    cases: [
      { title: 'Education only', description: 'See why mid-cycle days cluster as higher risk.' },
      { title: 'Irregular cycles', description: 'The map is even less meaningful — use proven contraception.' },
      { title: 'Talk to a clinician', description: 'Ask about methods that actually work for you.' },
    ],
  },
  '/simple-calculator': {
    whatItDoes: 'Four-function and typical scientific keys in the browser.',
    inputs: 'Keypad expression',
    outputs: 'Numeric result',
    oneMistake: 'Pasting Excel formulas with commas as decimals — use the keypad’s decimal style.',
    cases: [
      { title: 'Quick split', description: 'Divide a bill by 3 without unlocking the phone calc.' },
      { title: 'Percent off', description: 'Compute a discount before you buy.' },
      { title: 'Chain ops', description: 'Keep using the result as the next operand.' },
    ],
  },
  '/sip-calculator': {
    whatItDoes: 'Projects SIP corpus from monthly amount, expected return, and years.',
    inputs: 'Monthly SIP, annual return %, tenure',
    outputs: 'Invested amount vs estimated corpus',
    oneMistake: 'Treating 12% as a guarantee — markets vary; this is compounding math, not a fund quote.',
    cases: [
      { title: '₹5,000 × 10 years', description: 'See corpus vs money invested.' },
      { title: 'Raise SIP', description: 'Step monthly amount and compare.' },
      { title: 'Return shock', description: 'Drop expected return from 12% to 8%.' },
    ],
  },
  '/social-media-db-viewer': {
    whatItDoes: 'Shows public profile fields for Instagram/Facebook usernames you enter — public only.',
    inputs: 'Public username or profile URL',
    outputs: 'Public fields the tool can display',
    oneMistake: 'Trying to pull private accounts or using it to harass someone.',
    cases: [
      { title: 'Public handle check', description: 'Paste a public username and read what is already visible.' },
      { title: 'Brand lookup', description: 'Confirm a public page name before you message it.' },
      { title: 'Stop at public', description: 'If it is private, the tool should not invent data.' },
    ],
  },
  '/social-media-deep-link-generator': {
    whatItDoes: 'Builds app deep links with web fallbacks for YouTube, Instagram, WhatsApp, etc.',
    inputs: 'Platform + content URL',
    outputs: 'Deep link + https fallback',
    oneMistake: 'Using a mobile-only scheme in an email client that cannot open it — always keep the web fallback.',
    cases: [
      { title: 'YouTube watch', description: 'Paste a watch URL, copy both links into a campaign.' },
      { title: 'WhatsApp click-to-chat', description: 'Generate the wa.me style link the form produces.' },
      { title: 'Instagram profile', description: 'Deep link to a public profile with web backup.' },
    ],
  },
  '/social-media-downloader': {
    whatItDoes: 'Attempts to download public Instagram/Facebook media from a URL you paste.',
    inputs: 'Public post/reel URL',
    outputs: 'File download when the URL is supported',
    oneMistake: 'Pasting a private or expired story — it will fail; do not use it to steal private content.',
    cases: [
      { title: 'Your own reel backup', description: 'Paste a public reel you posted and save a copy.' },
      { title: 'Public reference', description: 'Save a public post you have rights to reuse.' },
      { title: 'If it 404s', description: 'The URL is private, region-locked, or unsupported — stop retrying logins here.' },
    ],
  },
  '/social-media-planner': {
    whatItDoes: 'Stores captions and dates for planned posts locally.',
    inputs: 'Caption, platform, date',
    outputs: 'Calendar-style plan on this device',
    oneMistake: 'Thinking it auto-publishes to Instagram — it is a planner, not a scheduler API.',
    cases: [
      { title: 'Friday launch', description: 'Write the caption, set Friday, copy it when you actually post.' },
      { title: 'Week grid', description: 'Park three ideas so you are not blank on Monday.' },
      { title: 'Export before wipe', description: 'Copy captions out if you will clear the browser.' },
    ],
  },
  '/split-image': {
    whatItDoes: 'Cuts one image into tiles or halves.',
    inputs: 'Image + rows/columns',
    outputs: 'Pieces to download (often as a set)',
    oneMistake: 'Splitting a tiny image into 16 tiles — each piece will be unusable.',
    cases: [
      { title: 'Carousel crop', description: 'Slice a wide banner into Instagram carousel frames.' },
      { title: 'Print puzzle', description: 'Make a simple grid for a craft print.' },
      { title: 'Halves', description: 'Split left/right for a comparison slide.' },
    ],
  },
  '/table-to-json-converter': {
    whatItDoes: 'Turns a pasted TSV/CSV/HTML table into JSON.',
    inputs: 'Delimited text or HTML table',
    outputs: 'JSON array of objects',
    oneMistake: 'Headers with spaces/duplicates — clean column names before converting.',
    cases: [
      { title: 'Excel dump', description: 'Paste TSV from a sheet, copy JSON into an API mock.' },
      { title: 'HTML scrape', description: 'Paste a simple table and get objects.' },
      { title: 'Validate after', description: 'Run the JSON through the formatter/validator next.' },
    ],
  },
  '/temperature-converter': {
    whatItDoes: 'Converts °C, °F, and K.',
    inputs: 'Value + from/to units',
    outputs: 'Converted temperature',
    oneMistake: 'Mixing weather °C with oven °F without switching the unit control.',
    cases: [
      { title: 'Fever note', description: 'Convert 101°F to °C for a record.' },
      { title: 'Recipe', description: 'Oven 180°C to °F.' },
      { title: 'Science class', description: '°C to kelvin for a lab sheet.' },
    ],
  },
  '/text-font-changer': {
    whatItDoes: 'Maps your letters to Unicode “fancy” fonts for bios and captions.',
    inputs: 'Plain text + style',
    outputs: 'Copyable Unicode string (not a real installed font file)',
    oneMistake: 'Expecting the style to survive in a system that strips Unicode — some banks/forms will flatten it.',
    cases: [
      { title: 'Instagram bio', description: 'Type a name, pick a style, paste into the bio (watch the 150 cap).' },
      { title: 'Discord nick', description: 'Copy a bold unicode line.' },
      { title: 'PNG export', description: 'If the platform strips fonts, export an image instead.' },
    ],
  },
  '/timetable-maker': {
    whatItDoes: 'Builds a weekly block timetable from job hours, goals, and sleep.',
    inputs: 'Constraints (work, gym, sleep)',
    outputs: 'Week grid you can copy',
    oneMistake: 'Filling 18 productive hours — the maker cannot invent extra time; cut goals.',
    cases: [
      { title: '9–5 plus gym', description: 'Set job hours and 5 gym slots, copy the grid.' },
      { title: 'Study blocks', description: 'Protect sleep 11pm then place study around it.' },
      { title: 'Revise weekly', description: 'Regenerate when shifts change.' },
    ],
  },
  '/todo-list': {
    whatItDoes: 'Simple local to-do list with due/priority if the UI shows them.',
    inputs: 'Task title, optional due date',
    outputs: 'Checklist on this device',
    oneMistake: 'Relying on it across devices — it is not a cloud todo.',
    cases: [
      { title: 'Today list', description: 'Add three tasks, check them off at EOD.' },
      { title: 'Priority', description: 'Mark one high so it sits on top if sorting exists.' },
      { title: 'Clear done', description: 'Remove completed items so the list stays short.' },
    ],
  },
  '/trip-expense-splitter': {
    whatItDoes: 'Splits trip costs among people and shows who owes whom.',
    inputs: 'People, expenses, payers',
    outputs: 'Settlement amounts',
    oneMistake: 'Forgetting someone paid a shared Uber — missing payers skew the settle-up.',
    cases: [
      { title: 'Goa trip', description: 'Add hotel, dinner, fuel; see net per person.' },
      { title: 'Uneven payers', description: 'Mark who paid the Airbnb vs who paid food.' },
      { title: 'Settle in UPI', description: 'Copy the “X pays Y” lines into chat.' },
    ],
  },
  '/typing-competition': {
    whatItDoes: 'Times a typing round and scores WPM/accuracy against the prompt.',
    inputs: 'Start round, type the shown text',
    outputs: 'WPM, accuracy, placement if multiplayer',
    oneMistake: 'Refreshing mid-round and expecting the score to save.',
    cases: [
      { title: 'Warm-up', description: 'Play one round before a long writing session.' },
      { title: 'Compare friends', description: 'Share WPM after the same prompt if the mode allows.' },
      { title: 'Accuracy first', description: 'Slow down if accuracy is under 90%.' },
    ],
  },
  '/typing-tutor': {
    whatItDoes: 'Walks through guided lessons (e.g. home row) in English/Hindi as offered.',
    inputs: 'Lesson selection + typed keys',
    outputs: 'WPM and accuracy for that lesson',
    oneMistake: 'Looking at the keyboard the whole time — the point is to look at the screen.',
    cases: [
      { title: 'Home row first', description: 'Finish the home-row lesson before jumping to speed tests.' },
      { title: 'Hindi layout', description: 'Pick Hindi if that is the layout you need at work.' },
      { title: 'Daily 10 minutes', description: 'Repeat a lesson until accuracy holds.' },
    ],
  },
  '/unit-converter': {
    whatItDoes: 'Converts length, weight, temperature, data size, speed, and similar units in one panel.',
    inputs: 'Value + category + from/to unit',
    outputs: 'Converted value',
    oneMistake: 'Leaving the category on length while converting megabytes.',
    cases: [
      { title: 'km to miles', description: '5 km → miles for a running app.' },
      { title: 'MB to GB', description: 'Check a file-size limit.' },
      { title: 'kg to lb', description: 'Luggage estimate before a flight.' },
    ],
  },
  '/enhanced-unit-converter': {
    whatItDoes: 'Same family as Unit Converter — convert SI/imperial values in-browser (canonical tool is /unit-converter).',
    inputs: 'Value + units',
    outputs: 'Converted value',
    oneMistake: 'Using this URL if it redirects — bookmark /unit-converter.',
    cases: [
      { title: 'Length', description: 'Meters to feet.' },
      { title: 'Data', description: 'GiB to GB if both exist.' },
      { title: 'Speed', description: 'km/h to mph.' },
    ],
  },
  '/add-name-date-photo': {
    whatItDoes: 'Overlays name and date on a passport-style photo for portal uploads.',
    inputs: 'Photo + name + date',
    outputs: 'Annotated image download',
    oneMistake: 'Covering the face with text — keep the overlay in the margin the portal allows.',
    cases: [
      { title: 'Visa form', description: 'Add name/date as the embassy PDF specifies.' },
      { title: 'Exam portal', description: 'Match their sample overlay position.' },
      { title: 'Check DPI', description: 'Do not upscale a tiny selfie until it blurs.' },
    ],
  },
'/text-case-converter': {
    whatItDoes: 'Convert text between uppercase, lowercase, and title case',
    inputs: 'Uppercase conversion via the panel',
    outputs: 'Live text case converter result you can copy or download',
    oneMistake: 'Skipping field labels on Text Case Converter and feeding the wrong unit or format.',
    cases: [
      { title: 'Run Text Case Converter', description: 'Convert text between uppercase, lowercase, and title case. Stay on this page to tweak inputs.' },
      { title: 'Double-check output', description: 'Verify units, dates, or file size before sharing.' },
      { title: 'Next related step', description: 'Use related text & writing tools links when you need a follow-up.' },
    ],
  },
  '/ai-text-rewriter': {
    whatItDoes: 'Rewrite your content to make it unique and avoid AI detection',
    inputs: 'Multiple writing styles via the panel',
    outputs: 'Live ai text rewriter result you can copy or download',
    oneMistake: 'Skipping field labels on AI Text Rewriter and feeding the wrong unit or format.',
    cases: [
      { title: 'Run AI Text Rewriter', description: 'Rewrite your content to make it unique and avoid AI detection. Stay on this page to tweak inputs.' },
      { title: 'Double-check output', description: 'Verify units, dates, or file size before sharing.' },
      { title: 'Next related step', description: 'Use related text & writing tools links when you need a follow-up.' },
    ],
  },
  '/lorem-ipsum-generator': {
    whatItDoes: 'Generate placeholder text for your designs',
    inputs: 'Customizable word count via the panel',
    outputs: 'Live lorem ipsum generator result you can copy or download',
    oneMistake: 'Skipping field labels on Lorem Ipsum Generator and feeding the wrong unit or format.',
    cases: [
      { title: 'Run Lorem Ipsum Generator', description: 'Generate placeholder text for your designs. Stay on this page to tweak inputs.' },
      { title: 'Double-check output', description: 'Verify units, dates, or file size before sharing.' },
      { title: 'Next related step', description: 'Use related text & writing tools links when you need a follow-up.' },
    ],
  },
  '/whitespace-remover': {
    whatItDoes: 'Remove extra spaces and tabs from your text',
    inputs: 'Remove extra spaces via the panel',
    outputs: 'Live whitespace remover result you can copy or download',
    oneMistake: 'Skipping field labels on Whitespace Remover and feeding the wrong unit or format.',
    cases: [
      { title: 'Run Whitespace Remover', description: 'Remove extra spaces and tabs from your text. Stay on this page to tweak inputs.' },
      { title: 'Double-check output', description: 'Verify units, dates, or file size before sharing.' },
      { title: 'Next related step', description: 'Use related text & writing tools links when you need a follow-up.' },
    ],
  },
  '/duplicate-line-remover': {
    whatItDoes: 'Remove duplicate lines from your text',
    inputs: 'Remove duplicate lines via the panel',
    outputs: 'Live duplicate line remover result you can copy or download',
    oneMistake: 'Skipping field labels on Duplicate Line Remover and feeding the wrong unit or format.',
    cases: [
      { title: 'Run Duplicate Line Remover', description: 'Remove duplicate lines from your text. Stay on this page to tweak inputs.' },
      { title: 'Double-check output', description: 'Verify units, dates, or file size before sharing.' },
      { title: 'Next related step', description: 'Use related text & writing tools links when you need a follow-up.' },
    ],
  },
  '/text-reverser': {
    whatItDoes: 'Reverse text, words, or lines in your text',
    inputs: 'Reverse entire text via the panel',
    outputs: 'Live text reverser result you can copy or download',
    oneMistake: 'Skipping field labels on Text Reverser and feeding the wrong unit or format.',
    cases: [
      { title: 'Run Text Reverser', description: 'Reverse text, words, or lines in your text. Stay on this page to tweak inputs.' },
      { title: 'Double-check output', description: 'Verify units, dates, or file size before sharing.' },
      { title: 'Next related step', description: 'Use related text & writing tools links when you need a follow-up.' },
    ],
  },
  '/regex-tester': {
    whatItDoes: 'Test regular expressions against your text',
    inputs: 'Test regex patterns via the panel',
    outputs: 'Live regex tester result you can copy or download',
    oneMistake: 'Skipping field labels on Regex Tester and feeding the wrong unit or format.',
    cases: [
      { title: 'Run Regex Tester', description: 'Test regular expressions against your text. Stay on this page to tweak inputs.' },
      { title: 'Double-check output', description: 'Verify units, dates, or file size before sharing.' },
      { title: 'Next related step', description: 'Use related text & writing tools links when you need a follow-up.' },
    ],
  },
  '/base64-converter': {
    whatItDoes: 'Encode and decode Base64 strings',
    inputs: 'Encode text to Base64 via the panel',
    outputs: 'Live base64 converter result you can copy or download',
    oneMistake: 'Skipping field labels on Base64 Converter and feeding the wrong unit or format.',
    cases: [
      { title: 'Run Base64 Converter', description: 'Encode and decode Base64 strings. Stay on this page to tweak inputs.' },
      { title: 'Double-check output', description: 'Verify units, dates, or file size before sharing.' },
      { title: 'Next related step', description: 'Use related text & writing tools links when you need a follow-up.' },
    ],
  },
  '/text-to-handwriting': {
    whatItDoes: 'Renders typed text as realistic handwriting fonts and exports PDF/image',
    inputs: 'Text, font style, page/line settings',
    outputs: 'Handwriting preview plus PDF or image export',
    oneMistake: 'Pasting huge essays without page breaks — split long homework.',
    cases: [
      { title: 'Homework page', description: 'Type answers, pick a school-like font, export PDF' },
      { title: 'Lined paper look', description: 'Enable ruled lines before export' },
      { title: 'Signature block', description: 'Short name in a cursive font for a cover sheet' },
    ],
  },
  '/url-slug-generator': {
    whatItDoes: 'Convert text into SEO-friendly URL slugs',
    inputs: 'Generate SEO-friendly slugs via the panel',
    outputs: 'Live url slug generator result you can copy or download',
    oneMistake: 'Skipping field labels on URL Slug Generator and feeding the wrong unit or format.',
    cases: [
      { title: 'Run URL Slug Generator', description: 'Convert text into SEO-friendly URL slugs. Stay on this page to tweak inputs.' },
      { title: 'Double-check output', description: 'Verify units, dates, or file size before sharing.' },
      { title: 'Next related step', description: 'Use related text & writing tools links when you need a follow-up.' },
    ],
  },
  '/timestamp-converter': {
    whatItDoes: 'Convert Unix timestamps to dates and dates to timestamps with timezone support',
    inputs: 'Convert timestamp to date via the panel',
    outputs: 'Live timestamp converter result you can copy or download',
    oneMistake: 'Skipping field labels on Timestamp Converter and feeding the wrong unit or format.',
    cases: [
      { title: 'Run Timestamp Converter', description: 'Convert Unix timestamps to dates and dates to timestamps with timezone support. Stay on this page to tweak inputs.' },
      { title: 'Double-check output', description: 'Verify units, dates, or file size before sharing.' },
      { title: 'Next related step', description: 'Use related converter tools links when you need a follow-up.' },
    ],
  },
  '/logo-to-favicon': {
    whatItDoes: 'Convert your logo into multiple favicon sizes for websites and apps. Generate 16x16, 32x32, 180x180 and more favicon formats',
    inputs: 'Multiple favicon sizes via the panel',
    outputs: 'Live logo to favicon converter result you can copy or download',
    oneMistake: 'Skipping field labels on Logo to Favicon Converter and feeding the wrong unit or format.',
    cases: [
      { title: 'Run Logo to Favicon Converter', description: 'Convert your logo into multiple favicon sizes for websites and apps. Generate 16x16, 32x32, 180x180 and more favicon formats. Stay on this page to tweak inputs.' },
      { title: 'Double-check output', description: 'Verify units, dates, or file size before sharing.' },
      { title: 'Next related step', description: 'Use related image tools links when you need a follow-up.' },
    ],
  },
  '/image-cropper': {
    whatItDoes: 'Crop and resize images for social media platforms. Perfect dimensions for Instagram, Facebook, Twitter, LinkedIn posts and stories',
    inputs: 'Crop images via the panel',
    outputs: 'Live image cropper & resizer result you can copy or download',
    oneMistake: 'Skipping field labels on Image Cropper & Resizer and feeding the wrong unit or format.',
    cases: [
      { title: 'Run Image Cropper & Resizer', description: 'Crop and resize images for social media platforms. Perfect dimensions for Instagram, Facebook, Twitter, LinkedIn posts and stories. Stay on this page to tweak inputs.' },
      { title: 'Double-check output', description: 'Verify units, dates, or file size before sharing.' },
      { title: 'Next related step', description: 'Use related image tools links when you need a follow-up.' },
    ],
  },
  '/image-format-converter': {
    whatItDoes: 'Convert images between JPG, PNG, WebP formats with quality control. Fast and secure online image converter',
    inputs: 'JPG to PNG conversion via the panel',
    outputs: 'Live image format converter result you can copy or download',
    oneMistake: 'Skipping field labels on Image Format Converter and feeding the wrong unit or format.',
    cases: [
      { title: 'Run Image Format Converter', description: 'Convert images between JPG, PNG, WebP formats with quality control. Fast and secure online image converter. Stay on this page to tweak inputs.' },
      { title: 'Double-check output', description: 'Verify units, dates, or file size before sharing.' },
      { title: 'Next related step', description: 'Use related image tools links when you need a follow-up.' },
    ],
  },
  '/svg-optimizer': {
    whatItDoes: 'Optimize SVG files by removing unused attributes, comments, and metadata. Reduce file size while maintaining quality',
    inputs: 'Remove unused attributes via the panel',
    outputs: 'Live svg optimizer result you can copy or download',
    oneMistake: 'Skipping field labels on SVG Optimizer and feeding the wrong unit or format.',
    cases: [
      { title: 'Run SVG Optimizer', description: 'Optimize SVG files by removing unused attributes, comments, and metadata. Reduce file size while maintaining quality. Stay on this page to tweak inputs.' },
      { title: 'Double-check output', description: 'Verify units, dates, or file size before sharing.' },
      { title: 'Next related step', description: 'Use related image tools links when you need a follow-up.' },
    ],
  },
  '/image-metadata-viewer': {
    whatItDoes: 'View and extract EXIF data and metadata from images. See camera settings, GPS location, and technical details',
    inputs: 'View EXIF data via the panel',
    outputs: 'Live image metadata viewer result you can copy or download',
    oneMistake: 'Skipping field labels on Image Metadata Viewer and feeding the wrong unit or format.',
    cases: [
      { title: 'Run Image Metadata Viewer', description: 'View and extract EXIF data and metadata from images. See camera settings, GPS location, and technical details. Stay on this page to tweak inputs.' },
      { title: 'Double-check output', description: 'Verify units, dates, or file size before sharing.' },
      { title: 'Next related step', description: 'Use related image tools links when you need a follow-up.' },
    ],
  },
  '/placeholder-image-generator': {
    whatItDoes: 'Generate custom placeholder images with specified dimensions, colors, and text. Perfect for web design mockups',
    inputs: 'Custom dimensions via the panel',
    outputs: 'Live placeholder image generator result you can copy or download',
    oneMistake: 'Skipping field labels on Placeholder Image Generator and feeding the wrong unit or format.',
    cases: [
      { title: 'Run Placeholder Image Generator', description: 'Generate custom placeholder images with specified dimensions, colors, and text. Perfect for web design mockups. Stay on this page to tweak inputs.' },
      { title: 'Double-check output', description: 'Verify units, dates, or file size before sharing.' },
      { title: 'Next related step', description: 'Use related image tools links when you need a follow-up.' },
    ],
  },
  '/pixelate-tool': {
    whatItDoes: 'Apply pixelation effects to specific areas of your images with customizable strength and size',
    inputs: 'Pixelate specific areas via the panel',
    outputs: 'Live pixelate tool result you can copy or download',
    oneMistake: 'Skipping field labels on Pixelate Tool and feeding the wrong unit or format.',
    cases: [
      { title: 'Run Pixelate Tool', description: 'Apply pixelation effects to specific areas of your images with customizable strength and size. Stay on this page to tweak inputs.' },
      { title: 'Double-check output', description: 'Verify units, dates, or file size before sharing.' },
      { title: 'Next related step', description: 'Use related image tools links when you need a follow-up.' },
    ],
  },
  '/photo-annotation-tool': {
    whatItDoes: 'Add name, date, signature, and fingerprint to photos. Perfect for passport photos and applications',
    inputs: 'Add name to photo via the panel',
    outputs: 'Live photo annotation tool result you can copy or download',
    oneMistake: 'Skipping field labels on Photo Annotation Tool and feeding the wrong unit or format.',
    cases: [
      { title: 'Run Photo Annotation Tool', description: 'Add name, date, signature, and fingerprint to photos. Perfect for passport photos and applications. Stay on this page to tweak inputs.' },
      { title: 'Double-check output', description: 'Verify units, dates, or file size before sharing.' },
      { title: 'Next related step', description: 'Use related image tools links when you need a follow-up.' },
    ],
  },
  '/background-remover': {
    whatItDoes: 'Remove background from photos automatically. Create transparent backgrounds instantly',
    inputs: 'Automatic background removal via the panel',
    outputs: 'Live background remover result you can copy or download',
    oneMistake: 'Skipping field labels on Background Remover and feeding the wrong unit or format.',
    cases: [
      { title: 'Run Background Remover', description: 'Remove background from photos automatically. Create transparent backgrounds instantly. Stay on this page to tweak inputs.' },
      { title: 'Double-check output', description: 'Verify units, dates, or file size before sharing.' },
      { title: 'Next related step', description: 'Use related image tools links when you need a follow-up.' },
    ],
  },
  '/blur-image': {
    whatItDoes: 'Blur image online with adjustable blur intensity. Create soft backgrounds and privacy blur effects',
    inputs: 'Adjustable blur intensity via the panel',
    outputs: 'Live blur image result you can copy or download',
    oneMistake: 'Skipping field labels on Blur Image and feeding the wrong unit or format.',
    cases: [
      { title: 'Run Blur Image', description: 'Blur image online with adjustable blur intensity. Create soft backgrounds and privacy blur effects. Stay on this page to tweak inputs.' },
      { title: 'Double-check output', description: 'Verify units, dates, or file size before sharing.' },
      { title: 'Next related step', description: 'Use related image tools links when you need a follow-up.' },
    ],
  },
  '/invert-image-colors': {
    whatItDoes: 'Invert image colors online to create negative effects with adjustable intensity',
    inputs: 'Color inversion via the panel',
    outputs: 'Live invert image colors result you can copy or download',
    oneMistake: 'Skipping field labels on Invert Image Colors and feeding the wrong unit or format.',
    cases: [
      { title: 'Run Invert Image Colors', description: 'Invert image colors online to create negative effects with adjustable intensity. Stay on this page to tweak inputs.' },
      { title: 'Double-check output', description: 'Verify units, dates, or file size before sharing.' },
      { title: 'Next related step', description: 'Use related image tools links when you need a follow-up.' },
    ],
  },
  '/image-resizer': {
    whatItDoes: 'Manually resize image dimensions and file size. Perfect for documents and web images',
    inputs: 'Manual resize via the panel',
    outputs: 'Live image resizer result you can copy or download',
    oneMistake: 'Skipping field labels on Image Resizer and feeding the wrong unit or format.',
    cases: [
      { title: 'Run Image Resizer', description: 'Manually resize image dimensions and file size. Perfect for documents and web images. Stay on this page to tweak inputs.' },
      { title: 'Double-check output', description: 'Verify units, dates, or file size before sharing.' },
      { title: 'Next related step', description: 'Use related image tools links when you need a follow-up.' },
    ],
  },
  '/qr-scanner': {
    whatItDoes: 'Scan QR codes using camera or upload image to decode QR codes',
    inputs: 'Camera scanning via the panel',
    outputs: 'Live qr scanner result you can copy or download',
    oneMistake: 'Skipping field labels on QR Scanner and feeding the wrong unit or format.',
    cases: [
      { title: 'Run QR Scanner', description: 'Scan QR codes using camera or upload image to decode QR codes. Stay on this page to tweak inputs.' },
      { title: 'Double-check output', description: 'Verify units, dates, or file size before sharing.' },
      { title: 'Next related step', description: 'Use related image tools links when you need a follow-up.' },
    ],
  },
  '/typing-test': {
    whatItDoes: 'Test your typing speed and accuracy with various text samples',
    inputs: 'Typing speed test via the panel',
    outputs: 'Live typing test result you can copy or download',
    oneMistake: 'Skipping field labels on Typing Test and feeding the wrong unit or format.',
    cases: [
      { title: 'Run Typing Test', description: 'Test your typing speed and accuracy with various text samples. Stay on this page to tweak inputs.' },
      { title: 'Double-check output', description: 'Verify units, dates, or file size before sharing.' },
      { title: 'Next related step', description: 'Use related typing tools links when you need a follow-up.' },
    ],
  },
  '/typing-games': {
    whatItDoes: 'Fun typing games to improve your skills while playing',
    inputs: 'Multiple typing games via the panel',
    outputs: 'Live typing games result you can copy or download',
    oneMistake: 'Skipping field labels on Typing Games and feeding the wrong unit or format.',
    cases: [
      { title: 'Run Typing Games', description: 'Fun typing games to improve your skills while playing. Stay on this page to tweak inputs.' },
      { title: 'Double-check output', description: 'Verify units, dates, or file size before sharing.' },
      { title: 'Next related step', description: 'Use related typing tools links when you need a follow-up.' },
    ],
  },
  '/qr-code-generator': {
    whatItDoes: 'Generate QR codes from text or URLs',
    inputs: 'Generate QR codes via the panel',
    outputs: 'Live qr code generator result you can copy or download',
    oneMistake: 'Skipping field labels on QR Code Generator and feeding the wrong unit or format.',
    cases: [
      { title: 'Run QR Code Generator', description: 'Generate QR codes from text or URLs. Stay on this page to tweak inputs.' },
      { title: 'Double-check output', description: 'Verify units, dates, or file size before sharing.' },
      { title: 'Next related step', description: 'Use related utility tools links when you need a follow-up.' },
    ],
  },
  '/password-generator': {
    whatItDoes: 'Creates strong random passwords with length and character-set controls',
    inputs: 'Length plus toggles for upper/lower/numbers/symbols',
    outputs: 'One or more passwords you can copy',
    oneMistake: 'Reusing the same generated password across sites.',
    cases: [
      { title: 'New account signup', description: 'Generate 16+ chars with symbols and copy once' },
      { title: 'No-symbol policy', description: 'Turn symbols off when a bank rejects them' },
      { title: 'Batch fill', description: 'Generate a few options and pick the readable one' },
    ],
  },
  '/json-formatter': {
    whatItDoes: 'Beautify, format, validate, and minify JSON data online. Free JSON beautifier and minifier tool',
    inputs: 'Beautify JSON via the panel',
    outputs: 'Live json beautifier & formatter result you can copy or download',
    oneMistake: 'Skipping field labels on JSON Beautifier & Formatter and feeding the wrong unit or format.',
    cases: [
      { title: 'Run JSON Beautifier & Formatter', description: 'Beautify, format, validate, and minify JSON data online. Free JSON beautifier and minifier tool. Stay on this page to tweak inputs.' },
      { title: 'Double-check output', description: 'Verify units, dates, or file size before sharing.' },
      { title: 'Next related step', description: 'Use related development tools links when you need a follow-up.' },
    ],
  },
  '/color-picker-tool': {
    whatItDoes: 'Pick colors from a palette or image',
    inputs: 'Color picker from palette via the panel',
    outputs: 'Live color picker result you can copy or download',
    oneMistake: 'Skipping field labels on Color Picker and feeding the wrong unit or format.',
    cases: [
      { title: 'Run Color Picker', description: 'Pick colors from a palette or image. Stay on this page to tweak inputs.' },
      { title: 'Double-check output', description: 'Verify units, dates, or file size before sharing.' },
      { title: 'Next related step', description: 'Use related utility tools links when you need a follow-up.' },
    ],
  },
  '/list-randomizer': {
    whatItDoes: 'Randomize the order of items in any list',
    inputs: 'Shuffle list items via the panel',
    outputs: 'Live list randomizer result you can copy or download',
    oneMistake: 'Skipping field labels on List Randomizer and feeding the wrong unit or format.',
    cases: [
      { title: 'Run List Randomizer', description: 'Randomize the order of items in any list. Stay on this page to tweak inputs.' },
      { title: 'Double-check output', description: 'Verify units, dates, or file size before sharing.' },
      { title: 'Next related step', description: 'Use related utility tools links when you need a follow-up.' },
    ],
  },
  '/barcode-generator': {
    whatItDoes: 'Bulk 1D barcodes with visual styles, Avery print sheets (A4/Letter), and PNG/ZIP export',
    inputs: 'Visual 1D style picker via the panel',
    outputs: 'Live barcode generator result you can copy or download',
    oneMistake: 'Skipping field labels on Barcode Generator and feeding the wrong unit or format.',
    cases: [
      { title: 'Run Barcode Generator', description: 'Bulk 1D barcodes with visual styles, Avery print sheets (A4/Letter), and PNG/ZIP export. Stay on this page to tweak inputs.' },
      { title: 'Double-check output', description: 'Verify units, dates, or file size before sharing.' },
      { title: 'Next related step', description: 'Use related utility tools links when you need a follow-up.' },
    ],
  },
  '/barcode-scanner-online': {
    whatItDoes: 'Scan barcodes using camera or image upload with history and CSV export',
    inputs: 'Camera scanner via the panel',
    outputs: 'Live barcode scanner result you can copy or download',
    oneMistake: 'Skipping field labels on Barcode Scanner and feeding the wrong unit or format.',
    cases: [
      { title: 'Run Barcode Scanner', description: 'Scan barcodes using camera or image upload with history and CSV export. Stay on this page to tweak inputs.' },
      { title: 'Double-check output', description: 'Verify units, dates, or file size before sharing.' },
      { title: 'Next related step', description: 'Use related utility tools links when you need a follow-up.' },
    ],
  },
  '/age-calculator': {
    whatItDoes: 'Calculates exact age in years, months, and days from a birth date',
    inputs: 'Date of birth (and optional “as of” date)',
    outputs: 'Age breakdown',
    oneMistake: 'Using tomorrow’s date when forms want age as of today.',
    cases: [
      { title: 'Form age', description: 'Enter DOB to fill years/months on an application' },
      { title: 'As-of date', description: 'Compute age on a past exam date' },
      { title: 'Next birthday', description: 'See days remaining until the next birthday' },
    ],
  },
  '/bmi-calculator': {
    whatItDoes: 'Computes Body Mass Index from height and weight with a category label',
    inputs: 'Height and weight (metric or imperial)',
    outputs: 'BMI number and underweight/normal/overweight category',
    oneMistake: 'Using BMI alone for athletes with high muscle mass.',
    cases: [
      { title: 'Metric check', description: 'Enter cm and kg for a quick category' },
      { title: 'Imperial', description: 'Use ft/in and lb when that is how you measure' },
      { title: 'Trend only', description: 'Recheck monthly — not a diagnosis' },
    ],
  },
  '/percentage-calculator': {
    whatItDoes: 'Calculate percentages and ratios',
    inputs: 'Calculate percentage via the panel',
    outputs: 'Live percentage calculator result you can copy or download',
    oneMistake: 'Skipping field labels on Percentage Calculator and feeding the wrong unit or format.',
    cases: [
      { title: 'Run Percentage Calculator', description: 'Calculate percentages and ratios. Stay on this page to tweak inputs.' },
      { title: 'Double-check output', description: 'Verify units, dates, or file size before sharing.' },
      { title: 'Next related step', description: 'Use related number tools links when you need a follow-up.' },
    ],
  },
  '/ovulation-calculator': {
    whatItDoes: 'Find your ovulation day and fertile window easily',
    inputs: 'Calculate ovulation day via the panel',
    outputs: 'Live ovulation calculator result you can copy or download',
    oneMistake: 'Skipping field labels on Ovulation Calculator and feeding the wrong unit or format.',
    cases: [
      { title: 'Run Ovulation Calculator', description: 'Find your ovulation day and fertile window easily. Stay on this page to tweak inputs.' },
      { title: 'Double-check output', description: 'Verify units, dates, or file size before sharing.' },
      { title: 'Next related step', description: 'Use related period & cycle tools links when you need a follow-up.' },
    ],
  },
  '/baby-kick-counter': {
    whatItDoes: 'Count baby kicks, track movement, and save daily history',
    inputs: 'Count baby kicks via the panel',
    outputs: 'Live baby kick counter result you can copy or download',
    oneMistake: 'Skipping field labels on Baby Kick Counter and feeding the wrong unit or format.',
    cases: [
      { title: 'Run Baby Kick Counter', description: 'Count baby kicks, track movement, and save daily history. Stay on this page to tweak inputs.' },
      { title: 'Double-check output', description: 'Verify units, dates, or file size before sharing.' },
      { title: 'Next related step', description: 'Use related pregnancy tools links when you need a follow-up.' },
    ],
  },
  '/hash-generator': {
    whatItDoes: 'Generate and compare cryptographic hashes using MD5, SHA-1, SHA-256, and SHA-512 algorithms. Verify encrypted data by comparing plain text with hash values',
    inputs: 'Generate MD5 hash via the panel',
    outputs: 'Live hash generator & comparator result you can copy or download',
    oneMistake: 'Skipping field labels on Hash Generator & Comparator and feeding the wrong unit or format.',
    cases: [
      { title: 'Run Hash Generator & Comparator', description: 'Generate and compare cryptographic hashes using MD5, SHA-1, SHA-256, and SHA-512 algorithms. Verify encrypted data by comparing plain text with hash values. Stay on this page to tweak inputs.' },
      { title: 'Double-check output', description: 'Verify units, dates, or file size before sharing.' },
      { title: 'Next related step', description: 'Use related development tools links when you need a follow-up.' },
    ],
  },
  '/jwt-decoder': {
    whatItDoes: 'Decode and parse JWT (JSON Web Token) headers, payloads, and signatures',
    inputs: 'Decode JWT tokens via the panel',
    outputs: 'Live jwt token decoder result you can copy or download',
    oneMistake: 'Skipping field labels on JWT Token Decoder and feeding the wrong unit or format.',
    cases: [
      { title: 'Run JWT Token Decoder', description: 'Decode and parse JWT (JSON Web Token) headers, payloads, and signatures. Stay on this page to tweak inputs.' },
      { title: 'Double-check output', description: 'Verify units, dates, or file size before sharing.' },
      { title: 'Next related step', description: 'Use related development tools links when you need a follow-up.' },
    ],
  },
  '/meta-tag-previewer': {
    whatItDoes: 'Preview how your website appears in search results and generate SEO meta tags',
    inputs: 'Preview search results via the panel',
    outputs: 'Live meta tag previewer result you can copy or download',
    oneMistake: 'Skipping field labels on Meta Tag Previewer and feeding the wrong unit or format.',
    cases: [
      { title: 'Run Meta Tag Previewer', description: 'Preview how your website appears in search results and generate SEO meta tags. Stay on this page to tweak inputs.' },
      { title: 'Double-check output', description: 'Verify units, dates, or file size before sharing.' },
      { title: 'Next related step', description: 'Use related development tools links when you need a follow-up.' },
    ],
  },
  '/live-preview': {
    whatItDoes: 'Instantly preview HTML, CSS, and JavaScript code online. Real-time HTML preview, test HTML code online, HTML editor with live preview',
    inputs: 'Live HTML preview via the panel',
    outputs: 'Live live html previewer result you can copy or download',
    oneMistake: 'Skipping field labels on Live HTML Previewer and feeding the wrong unit or format.',
    cases: [
      { title: 'Run Live HTML Previewer', description: 'Instantly preview HTML, CSS, and JavaScript code online. Real-time HTML preview, test HTML code online, HTML editor with live preview. Stay on this page to tweak inputs.' },
      { title: 'Double-check output', description: 'Verify units, dates, or file size before sharing.' },
      { title: 'Next related step', description: 'Use related development tools links when you need a follow-up.' },
    ],
  },
  '/javascript-minifier': {
    whatItDoes: 'Minify JavaScript code to reduce file size',
    inputs: 'Minify JavaScript via the panel',
    outputs: 'Live javascript minifier result you can copy or download',
    oneMistake: 'Skipping field labels on JavaScript Minifier and feeding the wrong unit or format.',
    cases: [
      { title: 'Run JavaScript Minifier', description: 'Minify JavaScript code to reduce file size. Stay on this page to tweak inputs.' },
      { title: 'Double-check output', description: 'Verify units, dates, or file size before sharing.' },
      { title: 'Next related step', description: 'Use related development tools links when you need a follow-up.' },
    ],
  },
  '/xml-sitemap-tester': {
    whatItDoes: 'Test and validate your XML sitemap for SEO issues. Analyze URLs, detect broken links, check redirects, and get actionable recommendations',
    inputs: 'Test XML sitemap via the panel',
    outputs: 'Live xml sitemap tester & validator result you can copy or download',
    oneMistake: 'Skipping field labels on XML Sitemap Tester & Validator and feeding the wrong unit or format.',
    cases: [
      { title: 'Run XML Sitemap Tester & Validator', description: 'Test and validate your XML sitemap for SEO issues. Analyze URLs, detect broken links, check redirects, and get actionable recommendations. Stay on this page to tweak inputs.' },
      { title: 'Double-check output', description: 'Verify units, dates, or file size before sharing.' },
      { title: 'Next related step', description: 'Use related development tools links when you need a follow-up.' },
    ],
  },
  '/stopwatch': {
    whatItDoes: 'Track elapsed time with a stopwatch',
    inputs: 'Start stopwatch via the panel',
    outputs: 'Live stopwatch result you can copy or download',
    oneMistake: 'Skipping field labels on Stopwatch and feeding the wrong unit or format.',
    cases: [
      { title: 'Run Stopwatch', description: 'Track elapsed time with a stopwatch. Stay on this page to tweak inputs.' },
      { title: 'Double-check output', description: 'Verify units, dates, or file size before sharing.' },
      { title: 'Next related step', description: 'Use related timer tools links when you need a follow-up.' },
    ],
  },
  '/ip-lookup': {
    whatItDoes: 'Find your public IP address and location information',
    inputs: 'Display public IP address via the panel',
    outputs: 'Live what result you can copy or download',
    oneMistake: 'Skipping field labels on What and feeding the wrong unit or format.',
    cases: [
      { title: 'Run What', description: 'Find your public IP address and location information. Stay on this page to tweak inputs.' },
      { title: 'Double-check output', description: 'Verify units, dates, or file size before sharing.' },
      { title: 'Next related step', description: 'Use related network tools links when you need a follow-up.' },
    ],
  },
  '/ip-address-to-location-finder': {
    whatItDoes: 'Find the location of any IP address with detailed geolocation data',
    inputs: 'Find IP location via the panel',
    outputs: 'Live ip address to location finder result you can copy or download',
    oneMistake: 'Skipping field labels on IP Address to Location Finder and feeding the wrong unit or format.',
    cases: [
      { title: 'Run IP Address to Location Finder', description: 'Find the location of any IP address with detailed geolocation data. Stay on this page to tweak inputs.' },
      { title: 'Double-check output', description: 'Verify units, dates, or file size before sharing.' },
      { title: 'Next related step', description: 'Use related network tools links when you need a follow-up.' },
    ],
  },
  '/css-minifier': {
    whatItDoes: 'Free CSS minifier online tool to compress and optimize CSS code. Best CSS minifier with color optimization, comment removal, and size reduction',
    inputs: 'Minify CSS code via the panel',
    outputs: 'Live css minifier result you can copy or download',
    oneMistake: 'Skipping field labels on CSS Minifier and feeding the wrong unit or format.',
    cases: [
      { title: 'Run CSS Minifier', description: 'Free CSS minifier online tool to compress and optimize CSS code. Best CSS minifier with color optimization, comment removal, and size reduction. Stay on this page to tweak inputs.' },
      { title: 'Double-check output', description: 'Verify units, dates, or file size before sharing.' },
      { title: 'Next related step', description: 'Use related development tools links when you need a follow-up.' },
    ],
  },
  '/gradient-generator': {
    whatItDoes: 'Create custom CSS gradients with multiple colors and directions',
    inputs: 'Linear gradient via the panel',
    outputs: 'Live gradient generator result you can copy or download',
    oneMistake: 'Skipping field labels on Gradient Generator and feeding the wrong unit or format.',
    cases: [
      { title: 'Run Gradient Generator', description: 'Create custom CSS gradients with multiple colors and directions. Stay on this page to tweak inputs.' },
      { title: 'Double-check output', description: 'Verify units, dates, or file size before sharing.' },
      { title: 'Next related step', description: 'Use related development tools links when you need a follow-up.' },
    ],
  },
  '/html-formatter': {
    whatItDoes: 'Format and beautify HTML code for better readability',
    inputs: 'Format HTML code via the panel',
    outputs: 'Live html formatter result you can copy or download',
    oneMistake: 'Skipping field labels on HTML Formatter and feeding the wrong unit or format.',
    cases: [
      { title: 'Run HTML Formatter', description: 'Format and beautify HTML code for better readability. Stay on this page to tweak inputs.' },
      { title: 'Double-check output', description: 'Verify units, dates, or file size before sharing.' },
      { title: 'Next related step', description: 'Use related development tools links when you need a follow-up.' },
    ],
  },
  '/json-validator': {
    whatItDoes: 'Validate and format JSON data for accuracy and readability',
    inputs: 'Validate JSON via the panel',
    outputs: 'Live json validator result you can copy or download',
    oneMistake: 'Skipping field labels on JSON Validator and feeding the wrong unit or format.',
    cases: [
      { title: 'Run JSON Validator', description: 'Validate and format JSON data for accuracy and readability. Stay on this page to tweak inputs.' },
      { title: 'Double-check output', description: 'Verify units, dates, or file size before sharing.' },
      { title: 'Next related step', description: 'Use related development tools links when you need a follow-up.' },
    ],
  },
  '/url-encode-decode': {
    whatItDoes: 'Encode URLs for safe transmission or decode URL-encoded strings instantly',
    inputs: 'URL encode via the panel',
    outputs: 'Live url encode decode result you can copy or download',
    oneMistake: 'Skipping field labels on URL Encode Decode and feeding the wrong unit or format.',
    cases: [
      { title: 'Run URL Encode Decode', description: 'Encode URLs for safe transmission or decode URL-encoded strings instantly. Stay on this page to tweak inputs.' },
      { title: 'Double-check output', description: 'Verify units, dates, or file size before sharing.' },
      { title: 'Next related step', description: 'Use related development tools links when you need a follow-up.' },
    ],
  },
  '/random-number-generator': {
    whatItDoes: 'Generate random numbers within a specified range',
    inputs: 'Generate random numbers via the panel',
    outputs: 'Live random number generator result you can copy or download',
    oneMistake: 'Skipping field labels on Random Number Generator and feeding the wrong unit or format.',
    cases: [
      { title: 'Run Random Number Generator', description: 'Generate random numbers within a specified range. Stay on this page to tweak inputs.' },
      { title: 'Double-check output', description: 'Verify units, dates, or file size before sharing.' },
      { title: 'Next related step', description: 'Use related utility tools links when you need a follow-up.' },
    ],
  },
  '/yes-no-generator': {
    whatItDoes: 'Generate a random Yes or No answer for decision-making',
    inputs: 'Random Yes or No via the panel',
    outputs: 'Live yes/no generator result you can copy or download',
    oneMistake: 'Skipping field labels on Yes/No Generator and feeding the wrong unit or format.',
    cases: [
      { title: 'Run Yes/No Generator', description: 'Generate a random Yes or No answer for decision-making. Stay on this page to tweak inputs.' },
      { title: 'Double-check output', description: 'Verify units, dates, or file size before sharing.' },
      { title: 'Next related step', description: 'Use related utility tools links when you need a follow-up.' },
    ],
  },
  '/discord-formatter': {
    whatItDoes: 'Format text for Discord with markdown and emojis',
    inputs: 'Format Discord text via the panel',
    outputs: 'Live discord formatter result you can copy or download',
    oneMistake: 'Skipping field labels on Discord Formatter and feeding the wrong unit or format.',
    cases: [
      { title: 'Run Discord Formatter', description: 'Format text for Discord with markdown and emojis. Stay on this page to tweak inputs.' },
      { title: 'Double-check output', description: 'Verify units, dates, or file size before sharing.' },
      { title: 'Next related step', description: 'Use related text & writing tools links when you need a follow-up.' },
    ],
  },
  '/hashtag-generator': {
    whatItDoes: 'Generate relevant hashtags for social media posts',
    inputs: 'Generate hashtags via the panel',
    outputs: 'Live hashtag generator result you can copy or download',
    oneMistake: 'Skipping field labels on Hashtag Generator and feeding the wrong unit or format.',
    cases: [
      { title: 'Run Hashtag Generator', description: 'Generate relevant hashtags for social media posts. Stay on this page to tweak inputs.' },
      { title: 'Double-check output', description: 'Verify units, dates, or file size before sharing.' },
      { title: 'Next related step', description: 'Use related text & writing tools links when you need a follow-up.' },
    ],
  },
  '/markdown-editor': {
    whatItDoes: 'Write and preview markdown text with real-time rendering',
    inputs: 'Markdown editor via the panel',
    outputs: 'Live markdown editor result you can copy or download',
    oneMistake: 'Skipping field labels on Markdown Editor and feeding the wrong unit or format.',
    cases: [
      { title: 'Run Markdown Editor', description: 'Write and preview markdown text with real-time rendering. Stay on this page to tweak inputs.' },
      { title: 'Double-check output', description: 'Verify units, dates, or file size before sharing.' },
      { title: 'Next related step', description: 'Use related text & writing tools links when you need a follow-up.' },
    ],
  },
  '/name-generator': {
    whatItDoes: 'Generate random names for people, businesses, or projects',
    inputs: 'Generate random names via the panel',
    outputs: 'Live name generator result you can copy or download',
    oneMistake: 'Skipping field labels on Name Generator and feeding the wrong unit or format.',
    cases: [
      { title: 'Run Name Generator', description: 'Generate random names for people, businesses, or projects. Stay on this page to tweak inputs.' },
      { title: 'Double-check output', description: 'Verify units, dates, or file size before sharing.' },
      { title: 'Next related step', description: 'Use related text & writing tools links when you need a follow-up.' },
    ],
  },
  '/username-generator': {
    whatItDoes: 'Create unique usernames for social media or gaming platforms',
    inputs: 'Generate usernames via the panel',
    outputs: 'Live username generator result you can copy or download',
    oneMistake: 'Skipping field labels on Username Generator and feeding the wrong unit or format.',
    cases: [
      { title: 'Run Username Generator', description: 'Create unique usernames for social media or gaming platforms. Stay on this page to tweak inputs.' },
      { title: 'Double-check output', description: 'Verify units, dates, or file size before sharing.' },
      { title: 'Next related step', description: 'Use related text & writing tools links when you need a follow-up.' },
    ],
  },
  '/color-palette-generator': {
    whatItDoes: 'Generate color palettes from images or custom inputs',
    inputs: 'Generate color palettes via the panel',
    outputs: 'Live color palette generator result you can copy or download',
    oneMistake: 'Skipping field labels on Color Palette Generator and feeding the wrong unit or format.',
    cases: [
      { title: 'Run Color Palette Generator', description: 'Generate color palettes from images or custom inputs. Stay on this page to tweak inputs.' },
      { title: 'Double-check output', description: 'Verify units, dates, or file size before sharing.' },
      { title: 'Next related step', description: 'Use related image tools links when you need a follow-up.' },
    ],
  },
  '/text-to-speech': {
    whatItDoes: 'Convert text to audio with natural-sounding voices',
    inputs: 'Convert text to speech via the panel',
    outputs: 'Live text to speech result you can copy or download',
    oneMistake: 'Skipping field labels on Text to Speech and feeding the wrong unit or format.',
    cases: [
      { title: 'Run Text to Speech', description: 'Convert text to audio with natural-sounding voices. Stay on this page to tweak inputs.' },
      { title: 'Double-check output', description: 'Verify units, dates, or file size before sharing.' },
      { title: 'Next related step', description: 'Use related video & social media tools links when you need a follow-up.' },
    ],
  },
  '/dummy-api-generator': {
    whatItDoes: 'Free dummy REST API for students and developers to practice login, CRUD, and authentication testing with live endpoints',
    inputs: 'REST endpoints via the panel',
    outputs: 'Live dummy api generator result you can copy or download',
    oneMistake: 'Skipping field labels on Dummy API Generator and feeding the wrong unit or format.',
    cases: [
      { title: 'Run Dummy API Generator', description: 'Free dummy REST API for students and developers to practice login, CRUD, and authentication testing with live endpoints. Stay on this page to tweak inputs.' },
      { title: 'Double-check output', description: 'Verify units, dates, or file size before sharing.' },
      { title: 'Next related step', description: 'Use related development tools links when you need a follow-up.' },
    ],
  },
};

export type FactSeoBits = {
  introParagraphs: string[];
  useCases: { title: string; description: string }[];
  examples: { input: string; output: string }[];
  faqs: { question: string; answer: string }[];
  commonMistakes: string[];
  tldr: string;
  howItWorks: string;
  whenToUse: string[];
  tips: string[];
};

export function synthesizeFactCard(tool: Tool): ToolFactCard {
  const feat = tool.features?.split(',')[0]?.trim();
  return {
    whatItDoes: tool.description.replace(/\.$/, ''),
    inputs: feat ? `${feat} via the panel on this page` : `Whatever ${tool.name} labels in the form`,
    outputs: `A live ${tool.name.toLowerCase()} result you can copy or download`,
    oneMistake: `Skipping the field labels on ${tool.name} and feeding the wrong unit or file type.`,
    cases: [
      {
        title: `Run ${tool.name} on a real sample`,
        description: `${tool.description} Stay on this page so you can tweak inputs without installing an app.`,
      },
      {
        title: 'Check the output twice',
        description: `Look at units, dates, or file size before you send the result onward.`,
      },
      {
        title: 'Pair a related tool',
        description: `If this job has a next step, use the related ${tool.category.toLowerCase()} links under the FAQs.`,
      },
    ],
  };
}

export function interpolateFactSeo(tool: Tool, card?: ToolFactCard): FactSeoBits {
  const f = card || TOOL_FACT_CARDS[tool.path] || synthesizeFactCard(tool);
  const pathExamples = getPathExamples(tool.path);
  const examples =
    pathExamples?.length
      ? pathExamples
      : [
          { input: f.inputs, output: f.outputs },
          {
            input: `Open ${tool.path} and use the live controls`,
            output: f.outputs,
          },
        ];

  return {
    introParagraphs: [
      `${tool.name}: ${f.whatItDoes.replace(/\.$/, '')}.`,
      `Inputs: ${f.inputs}. Outputs: ${f.outputs}.${f.limit ? ` ${f.limit}` : ''} Mistake to avoid: ${f.oneMistake.charAt(0).toLowerCase()}${f.oneMistake.slice(1).replace(/\.$/, '')}.`,
    ],
    useCases: f.cases,
    examples,
    faqs: [
      {
        question: `What does ${tool.name} actually take as input?`,
        answer: f.inputs.endsWith('.') ? f.inputs : `${f.inputs}.`,
      },
      {
        question: `What do I get out of ${tool.name}?`,
        answer: f.outputs.endsWith('.') ? f.outputs : `${f.outputs}.`,
      },
      {
        question: `Does ${tool.name} upload my files to FYN servers?`,
        answer: `Follow the Privacy & processing note on this page. Many FYN tools run in the browser; ones that call an API (weather, rates) say so in that note.`,
      },
      {
        question: `What is a common mistake with ${tool.name}?`,
        answer: f.oneMistake,
      },
    ],
    commonMistakes: [
      f.oneMistake,
      'Treating one run as final without checking units or a second sample.',
      'Ignoring related tools when the next step is resize, compress, or convert.',
    ],
    tldr: `${tool.name}: ${f.whatItDoes.replace(/\.$/, '')}. Input: ${f.inputs}. Output: ${f.outputs}.`,
    howItWorks: `You set ${f.inputs.toLowerCase()} in the live panel. ${tool.name} then ${f.whatItDoes.charAt(0).toLowerCase()}${f.whatItDoes.slice(1).replace(/\.$/, '')}. Results show as ${f.outputs.toLowerCase()}.`,
    whenToUse: [
      `When you need ${f.whatItDoes.charAt(0).toLowerCase()}${f.whatItDoes.slice(1)} without another app`,
      `When your input looks like: ${f.inputs}`,
    ],
    tips: [
      `Read the Privacy & processing note before you paste secrets.`,
      f.oneMistake.replace(/^./, (c) => c.toUpperCase()),
      `Copy the output immediately if you will close the tab.`,
    ],
  };
}
