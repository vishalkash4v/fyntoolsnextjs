/** Hand-written Input/Output examples — never use “Sample input for …” placeholders. */

export type ToolIoExample = { input: string; output: string };

export const PATH_EXAMPLES: Record<string, ToolIoExample[]> = {
  '/weather-forecast': [
    {
      input: 'Search: Una, Himachal Pradesh, India  (or tap GPS)',
      output:
        'Current: 29°C · Feels like 35°C · Overcast\nHigh 31°C / Low 23°C · Humidity 80% · Wind 1.3 m/s E\nSunrise 06:02 · Sunset 18:47\n7-day outlook + hourly rain % + US AQI + UV + what-to-wear tips',
    },
    {
      input: 'Search: Mumbai  · unit °C  · refresh',
      output:
        'FYN Weather Gateway forecast (Open-Meteo multi-model)\nToday rain probability chart, 24-hour hourly temps, AQI badge, activity planner',
    },
  ],
  '/button-generator': [
    {
      input: 'Preset: Neon Cyberpunk  · text ENTER  · hover: pulse  · glow 14px',
      output:
        'HTML: <button class="fyn-btn">⚡ ENTER</button>\nCSS: dark bg, neon border, Orbitron, glow, hover pulse keyframes — copy-ready',
    },
    {
      input: 'Preset: Sunset Gradient  · hover gradient on  · sticker 🛒 Shop Now',
      output:
        'Button preview + HTML/CSS/React snippet with linear-gradient, hover gradient, and icon',
    },
  ],
  '/pdf-compressor': [
    {
      input: '2.4 MB scanned form PDF → level: Compress to ~150 KB',
      output: 'Compressed PDF ≈ 140–150 KB · download (client-side, not uploaded)',
    },
    {
      input: 'Bulk: 3 × ~5 MB PDFs → Optimized',
      output: 'Per-file before/after sizes + Download all ZIP/list of compressed PDFs',
    },
  ],
  '/box-shadow-generator': [
    {
      input: 'Offset X 4px · Y 8px · Blur 16px · Spread 0 · Color rgba(0,0,0,0.18)',
      output: 'box-shadow: 4px 8px 16px 0 rgba(0,0,0,0.18);  + live preview card',
    },
  ],
  '/business-idea-generator': [
    {
      input: 'Industry: education  · Budget: low  · Audience: students',
      output: 'Idea list: e.g. “micro-course marketplace for exam prep” with angle + next step',
    },
  ],
  '/countdown-timer': [
    {
      input: 'Target: 25:00 (Pomodoro) → Start',
      output: 'Counts down to 00:00 with alert at zero; tab can show remaining time',
    },
  ],
  '/daily-task-report-saver': [
    {
      input: 'Date: 3 Sep 2026 · Tasks: shipped weather search, reviewed PRs · Notes: deploy pending',
      output: 'Saved local daily report you can reopen by date and copy as text',
    },
  ],
  '/enhanced-unit-converter': [
    {
      input: 'Length: 5 km → miles',
      output: '5 km = 3.10686 miles (plus other length units in the same panel)',
    },
  ],
  '/invoice-generator': [
    {
      input: 'Client: Acme Pvt Ltd · Item: Design 10 hrs × ₹800 · Tax 18%',
      output: 'Invoice preview + PDF/image export with subtotal, GST, and grand total',
    },
  ],
  '/notes': [
    {
      input: 'Title: Sprint notes  · Tag: work  · Color: yellow',
      output: 'Note saved in browser with tag filter; searchable in the notes list',
    },
  ],
  '/social-media-db-viewer': [
    {
      input: 'Public Instagram or Facebook profile URL / username',
      output: 'Public profile fields the tool can display (no private/login data)',
    },
  ],
  '/social-media-deep-link-generator': [
    {
      input: 'Platform: YouTube · URL: https://youtube.com/watch?v=abc123',
      output: 'App deep link (opens YouTube app if installed) + web fallback URL',
    },
  ],
  '/social-media-downloader': [
    {
      input: 'Paste public Instagram Reel or Facebook post URL',
      output: 'Downloadable media file(s) when the public URL is supported',
    },
  ],
  '/social-media-planner': [
    {
      input: 'Post: “Launch Friday 6pm” · Platform: Instagram · Date: 5 Sep',
      output: 'Planned slot on the calendar with caption draft stored locally',
    },
  ],
  '/timetable-maker': [
    {
      input: 'Job 9–5 · Goal: gym 5×/week · Sleep 11pm',
      output: 'Weekly timetable blocks (work, gym, sleep, free time) you can copy',
    },
  ],
  '/todo-list': [
    {
      input: 'Add: “Ship weather examples” · due today · priority high',
      output: 'Task appears in the list; check off to mark complete (saved locally)',
    },
  ],
  '/typing-competition': [
    {
      input: 'Join / start a round → type the prompt as fast as possible',
      output: 'WPM, accuracy %, and place vs other players for that round',
    },
  ],
  '/typing-tutor': [
    {
      input: 'Lesson: home row (English) → type shown keys',
      output: 'Accuracy + WPM for the lesson; next lesson unlocks on pass',
    },
  ],
  '/word-counter': [
    {
      input: 'Paste a 520-word blog draft',
      output: 'Words: 520 · Characters (with spaces): ~3,100 · Sentences · ~ Reading time 2 min',
    },
    {
      input: 'Instagram caption draft under a 2,200 character cap',
      output: 'Live character count updates as you trim; words and paragraphs shown beside it',
    },
  ],
  '/image-compressor': [
    {
      input: '4.2 MB camera JPG → Target size 500 KB',
      output: 'Compressed JPG ≈ 480–500 KB · before/after preview · download in browser',
    },
    {
      input: 'PNG screenshot → Auto / WebP',
      output: 'Smaller WebP (or optimized PNG) with quality slider and size delta',
    },
  ],
  '/url-shortener': [
    {
      input: 'https://example.com/landing?utm_source=ig&utm_medium=bio&utm_campaign=launch',
      output: 'Short FYN link + copy · optional QR with logo overlay',
    },
    {
      input: 'Bulk: 5 long product URLs, one per line',
      output: 'Five short links listed with copy actions for a spreadsheet paste',
    },
  ],
  '/password-generator': [
    {
      input: 'Length 20 · upper + lower + numbers + symbols',
      output: 'e.g. K9#mP2$vLqx… — copy once into a password manager',
    },
    {
      input: 'Length 12 · symbols off (bank form)',
      output: 'Alphanumeric-only password that passes “no special chars” rules',
    },
  ],
  '/text-to-handwriting': [
    {
      input: 'Homework paragraph · font: school cursive · lined paper on',
      output: 'Handwriting page preview → Export PDF / image',
    },
    {
      input: 'Short cover note · Amatic-style font · A4',
      output: 'Single-page handwriting render ready to print',
    },
  ],
  '/income-tax-calculator': [
    {
      input: 'Gross ₹12,00,000 · 80C ₹1,50,000 · compare old vs new regime',
      output: 'Side-by-side tax estimate and which regime looks lower for this sketch',
    },
    {
      input: 'Salary + HRA fields filled · new regime',
      output: 'Tax breakdown using current slabs (planning estimate, not a filed return)',
    },
  ],
  '/emi-calculator': [
    {
      input: '₹10,00,000 · 8.5% · 20 years',
      output: 'EMI ≈ ₹8,678 · total interest ≈ ₹10,82,720 · amortization table',
    },
    {
      input: 'Same loan + ₹5,000/month prepay (reduce tenure)',
      output: 'Months saved and interest saved vs base schedule',
    },
  ],
  '/gst-calculator': [
    {
      input: 'Taxable ₹10,000 · GST 18% · exclusive',
      output: 'GST ₹1,800 · Total ₹11,800 · CGST/SGST ₹900 each (intra-state sketch)',
    },
    {
      input: 'Inclusive MRP ₹1,180 · 18%',
      output: 'Base ≈ ₹1,000 · GST ≈ ₹180',
    },
  ],
  '/sip-calculator': [
    {
      input: 'SIP ₹5,000/mo · 12% · 10 years',
      output: 'Invested ₹6,00,000 · estimated corpus ≈ ₹11.6L (illustrative)',
    },
    {
      input: 'Lumpsum ₹2,00,000 · 10% · 5 years',
      output: 'Future value and gain vs amount invested',
    },
  ],
  '/fd-calculator': [
    {
      input: '₹1,00,000 · 7% · 1 year · quarterly compounding',
      output: 'Maturity amount and interest earned for the term',
    },
  ],
  '/ppf-calculator': [
    {
      input: '₹1,50,000/year · 15 years · current PPF rate',
      output: 'Projected maturity corpus and total interest (illustrative)',
    },
  ],
  '/pregnancy-due-date-calculator': [
    {
      input: 'LMP: 1 Jan 2026',
      output: 'EDD ≈ 8 Oct 2026 · trimester date markers',
    },
    {
      input: 'Conception date known → conception mode',
      output: 'Due date shifted from conception instead of LMP',
    },
  ],
  '/bmi-calculator': [
    {
      input: 'Height 170 cm · Weight 68 kg',
      output: 'BMI ≈ 23.5 · Normal range label',
    },
  ],
  '/age-calculator': [
    {
      input: 'DOB: 15 Mar 1998 · as of today',
      output: 'Years, months, and days of age',
    },
  ],
};

export function getPathExamples(path: string): ToolIoExample[] | null {
  const list = PATH_EXAMPLES[path];
  return list?.length ? list : null;
}
