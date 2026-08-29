#!/usr/bin/env node
/**
 * Generate batch7.ts — hand-tuned premium SEO for remaining pipeline-only tools.
 * Run: node scripts/generate-batch7-content.mjs
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const toolsSrc = fs.readFileSync(path.join(root, "src/data/toolsData.ts"), "utf8");

const PENDING = [
  "add-name-date-photo", "border-radius-generator", "box-shadow-generator", "business-idea-generator",
  "button-generator", "coin-flip", "color-converter", "conception-date-calculator", "contraction-timer",
  "countdown-timer", "currency-converter", "daily-task-report-saver", "date-difference-calculator",
  "dice-roller", "emi-calculator", "enhanced-unit-converter", "fd-calculator", "flip-image",
  "future-date-calculator", "gst-calculator", "image-to-text", "image-upscaler", "income-tax-calculator",
  "invoice-generator", "merge-images", "notes", "pdf-text-extractor", "period-calculator", "period-tracker",
  "pms-symptom-tracker", "ppf-calculator", "pregnancy-diet-planner", "pregnancy-due-date-calculator",
  "pregnancy-week-calculator", "pregnancy-weight-gain-calculator", "safe-days-calculator", "simple-calculator",
  "sip-calculator", "social-media-db-viewer", "social-media-deep-link-generator", "social-media-downloader",
  "social-media-planner", "split-image", "table-to-json-converter", "temperature-converter", "text-font-changer",
  "timetable-maker", "todo-list", "trip-expense-splitter", "typing-competition", "typing-tutor", "unit-converter",
  "weather-forecast",
];

function extractTools(src) {
  const tools = [];
  for (const block of src.split(/\{\s*id:/).slice(1)) {
    const id = block.match(/['"]([^'"]+)['"]/)?.[1];
    const name = block.match(/name:\s*['"]([^'"]+)['"]/)?.[1];
    const description = block.match(/description:\s*['"]([^'"]+)['"]/)?.[1];
    const category = block.match(/category:\s*['"]([^'"]+)['"]/)?.[1];
    const pathM = block.match(/path:\s*['"](\/[^'"]+)['"]/);
    if (!id || !name || !pathM) continue;
    tools.push({ id, name, description: description || name, category: category || "Tools", path: pathM[1] });
  }
  return tools;
}

const allTools = extractTools(toolsSrc);
const bySlug = Object.fromEntries(allTools.map((t) => [t.path.slice(1), t]));

/** Per-slug accuracy overrides — must match real tool behavior. */
const SLUG = {
  "emi-calculator": {
    title: "EMI Calculator — Loan EMI, Amortization & Prepayment",
    h1: "EMI Calculator — Monthly Installment & Interest Breakdown",
    metaDescription:
      "Calculate loan EMI, total interest, and amortization schedule. Compare prepayment strategies to reduce tenure or EMI. Free, instant, browser-based.",
    tldr: "Enter principal, annual interest rate, and tenure to see monthly EMI, total interest, yearly summary, and optional prepayment savings — all computed in your browser.",
    processingNote: "Loan math runs locally in your browser. Figures are planning estimates — confirm rates and fees with your lender before signing.",
    ioContract: {
      inputs: "Loan amount (₹), annual interest rate (%), tenure (months/years); optional monthly prepayment and strategy (reduce tenure vs reduce EMI)",
      outputs: "Monthly EMI, total payment, total interest, year-wise breakdown, amortization table, prepayment comparison charts",
      formats: "INR amounts; rate as annual percentage",
      limits: "Does not include processing fees, insurance, or tax benefits — educational projection only",
      processing: "Client-side (browser)",
    },
    howItWorks:
      "EMI uses the standard reducing-balance formula: monthly rate = annual rate ÷ 12, then EMI = P × r × (1+r)^n ÷ ((1+r)^n − 1). Prepayment adds extra principal each month and recalculates the schedule.",
    examples: [
      { input: "₹10,00,000 · 8.5% · 20 years", output: "EMI ≈ ₹8,678 · total interest ≈ ₹10,82,720" },
      { input: "Same loan + ₹5,000/month prepay (reduce tenure)", output: "Shows months saved and interest saved vs base schedule" },
    ],
    useCases: [
      { title: "Home loan comparison", description: "Model two rate quotes side by side before visiting the bank." },
      { title: "Prepayment planning", description: "See whether extra payments save more by cutting tenure or lowering EMI." },
      { title: "Car loan budgeting", description: "Check if the monthly EMI fits your budget at different tenures." },
    ],
    faqs: [
      { question: "Is the EMI formula accurate?", answer: "It uses the standard reducing-balance EMI formula lenders commonly apply. Your bank may round differently or add fees not modeled here." },
      { question: "Can I export the amortization table?", answer: "Use the download option in the tool to save the schedule for offline review." },
      { question: "Does prepayment always reduce tenure?", answer: "You can choose reduce-tenure or reduce-EMI strategy in the tool — outcomes differ." },
    ],
  },
  "gst-calculator": {
    title: "GST Calculator — Add or Remove GST (India)",
    h1: "GST Calculator — Inclusive & Exclusive Tax Amounts",
    metaDescription: "Calculate GST for India: add tax to a base price or extract GST from an inclusive amount. Supports 5%, 12%, 18%, 28% slabs. Free online.",
    tldr: "Pick GST rate and enter either pre-tax or tax-inclusive amount to get CGST/SGST split, net price, and gross total — instant browser math.",
    ioContract: {
      inputs: "Amount (₹), GST rate (5/12/18/28% or custom), mode: add GST or remove GST from inclusive price",
      outputs: "Base amount, GST amount, CGST, SGST, total",
      formats: "INR; percentage rate",
      limits: "Simple slab calculator — not for compound invoices or multi-line returns filing",
      processing: "Client-side (browser)",
    },
    examples: [{ input: "₹1,000 + 18% GST (exclusive)", output: "GST ₹180 · total ₹1,180 · CGST ₹90 · SGST ₹90" }],
  },
  "fd-calculator": {
    title: "FD Calculator — Fixed Deposit Maturity & Interest",
    h1: "FD Calculator — Fixed Deposit Returns",
    metaDescription: "Estimate fixed deposit maturity amount and interest for quarterly/monthly/yearly compounding. Free FD calculator for India.",
    ioContract: {
      inputs: "Principal (₹), annual interest rate (%), tenure (years/months), compounding frequency",
      outputs: "Maturity amount, total interest earned",
      formats: "INR; rate as annual %",
      limits: "Estimate only — bank TDS and special schemes not included",
      processing: "Client-side (browser)",
    },
    examples: [{ input: "₹5,00,000 · 7% · 5 years · quarterly", output: "Maturity ≈ ₹7,03,891 · interest ≈ ₹2,03,891" }],
  },
  "sip-calculator": {
    title: "SIP & Lumpsum Calculator — Mutual Fund Returns",
    h1: "SIP & Lumpsum Calculator — Investment Growth",
    metaDescription: "Project SIP or lumpsum mutual fund returns with expected annual return and tenure. Free investment calculator — educational estimates.",
    ioContract: {
      inputs: "Monthly SIP or one-time lumpsum, expected annual return (%), investment period (years)",
      outputs: "Estimated corpus, total invested, wealth gained",
      formats: "INR; annual return assumption",
      limits: "Market returns vary — projection assumes constant return",
      processing: "Client-side (browser)",
    },
    examples: [{ input: "₹5,000/month SIP · 12% · 10 years", output: "Estimated corpus ≈ ₹11.6 lakh (illustrative)" }],
  },
  "ppf-calculator": {
    title: "PPF Calculator — Public Provident Fund Maturity",
    h1: "PPF Calculator — 15-Year PPF Projection",
    metaDescription: "Calculate PPF maturity with annual contributions and current PPF interest rate. Free PPF calculator for long-term tax-saving planning.",
    ioContract: {
      inputs: "Yearly deposit (up to ₹1.5L limit), interest rate (%), tenure (15 years default)",
      outputs: "Maturity balance, total interest",
      formats: "INR; annual contribution",
      limits: "Uses simplified annual compounding — verify with bank passbook",
      processing: "Client-side (browser)",
    },
  },
  "income-tax-calculator": {
    title: "Income Tax Calculator — Old vs New Regime (India)",
    h1: "Income Tax Calculator — Estimate Tax Liability",
    metaDescription: "Estimate income tax under old and new tax regimes for India. Enter salary, deductions, and compare payable tax — free, educational.",
    ioContract: {
      inputs: "Annual income, deductions (80C, 80D, etc.), regime selection, age slab if applicable",
      outputs: "Taxable income, tax payable, effective rate comparison",
      formats: "INR annual figures",
      limits: "Simplified slabs for planning — file through official portal for final liability",
      processing: "Client-side (browser)",
    },
  },
  "period-tracker": {
    title: "Period Tracker — Log Flow, Mood & Symptoms",
    h1: "Period Tracker — Cycle Log with History",
    metaDescription: "Log period days with flow level, mood, symptoms, and notes. History saves locally in your browser — free, private, no account.",
    processingNote: "Entries store in browser localStorage only. Not medical advice — share patterns with your clinician.",
    ioContract: {
      inputs: "Date, flow (light/medium/heavy), mood, symptom checkboxes, notes, optional reminder flag",
      outputs: "Dated log entries grouped in history",
      formats: "Local JSON in browser storage",
      limits: "Educational tracking — not a diagnostic tool",
      processing: "Client-side (browser localStorage)",
    },
    howItWorks: "Pick a date, set flow and mood, tick symptoms, add notes, then save. Entries persist in localStorage and appear in the history list below.",
    examples: [{ input: "Mar 12 · Medium flow · Cramps + Fatigue · mood Low", output: "Saved entry visible in history for that date" }],
  },
  "contraction-timer": {
    title: "Contraction Timer — Duration & Intervals",
    h1: "Contraction Timer — Track Labor Contractions",
    metaDescription: "Time contraction duration and intervals with one tap. History log for labor patterns — free, private, browser-based. Not medical advice.",
    processingNote: "Contraction data stays in your browser. Call your maternity unit per local guidance — this tool does not diagnose labor stage.",
    ioContract: {
      inputs: "Start/stop tap for each contraction",
      outputs: "Duration, time since last contraction, session history",
      formats: "Timestamped log in browser",
      limits: "Educational timing aid only",
      processing: "Client-side (browser localStorage)",
    },
    howItWorks: "Tap start when a contraction begins and stop when it ends. The tool records duration and calculates the gap since the previous contraction.",
  },
  "pregnancy-week-calculator": {
    title: "Pregnancy Week Calculator — Week & Trimester",
    h1: "Pregnancy Week Calculator — How Many Weeks Pregnant",
    metaDescription: "Calculate current pregnancy week and trimester from last menstrual period (LMP) or due date. Educational — confirm with ultrasound dating.",
    processingNote: "Calendar-based estimate only. Clinical dating may differ — follow your prenatal provider.",
    ioContract: {
      inputs: "LMP date or due date",
      outputs: "Gestational week, trimester, estimated due date",
      formats: "Calendar dates",
      limits: "Not a substitute for ultrasound or clinical assessment",
      processing: "Client-side (browser)",
    },
  },
  "pregnancy-due-date-calculator": {
    title: "Pregnancy Due Date Calculator — EDD from LMP",
    h1: "Due Date Calculator — Estimated Delivery Date",
    metaDescription: "Estimate baby due date from last period or conception date using Naegele-style calendar math. Free, educational, not medical advice.",
    processingNote: "EDD is an estimate — only about 5% of babies arrive on the exact date. Confirm with prenatal care.",
  },
  "pregnancy-weight-gain-calculator": {
    title: "Pregnancy Weight Gain Calculator — BMI Ranges",
    h1: "Pregnancy Weight Gain Calculator — Healthy Range by BMI",
    metaDescription: "See educational weight-gain ranges by pre-pregnancy BMI (IOM-style). Track progress — discuss targets with your OB or midwife.",
    processingNote: "Educational BMI-based ranges. Twins, medical conditions, and individual plans require clinician guidance.",
  },
  "conception-date-calculator": {
    title: "Conception Date Calculator — Estimate from Due Date",
    h1: "Conception Date Calculator — Reverse Due Date Math",
    metaDescription: "Estimate conception window from due date and cycle length. Educational calendar tool — ultrasound dating is more precise.",
    processingNote: "Reverse calendar estimate — not paternity or clinical dating.",
  },
  "safe-days-calculator": {
    title: "Safe Days Calculator — Fertile Window Estimate",
    h1: "Safe Days Calculator — Cycle Day Estimates",
    metaDescription: "Estimate fertile and lower-risk days from cycle length and last period. Rhythm method is not reliable contraception — educational only.",
    processingNote: "Calendar rhythm estimates fail often for contraception. Not medical advice — use approved birth control and clinician guidance.",
  },
  "period-calculator": {
    title: "Period Calculator — Next Period Prediction",
    h1: "Period Calculator — Predict Next Cycle Date",
    metaDescription: "Predict next period from last cycle start and average length. Free calendar estimate — cycles vary with stress and health.",
    ioContract: {
      inputs: "Last period start date, average cycle length (days)",
      outputs: "Predicted next period date, cycle day reference",
      formats: "Calendar dates",
      limits: "Prediction only — irregular cycles reduce accuracy",
      processing: "Client-side (browser)",
    },
  },
  "pms-symptom-tracker": {
    title: "PMS Symptom Tracker — Daily Symptom Log",
    h1: "PMS Symptom Tracker — Track Pain & Mood",
    metaDescription: "Log PMS symptoms, pain scale, and daily changes. History stored locally — bring logs to your healthcare visit.",
    processingNote: "Symptom logs stay in your browser. Not a diagnosis tool.",
    ioContract: {
      inputs: "Date, symptoms, pain scale, notes",
      outputs: "Historical symptom timeline",
      formats: "Local browser storage",
      limits: "Educational self-tracking",
      processing: "Client-side (browser localStorage)",
    },
  },
  "unit-converter": {
    title: "Unit Converter — Length, Weight, Temp & More",
    h1: "Unit Converter — Measurement Conversion",
    metaDescription: "Convert length, weight, volume, temperature, data size, speed, and more. Free instant unit converter in your browser.",
    ioContract: {
      inputs: "Value + source unit + target unit category",
      outputs: "Converted value with unit label",
      formats: "Metric, imperial, and digital units supported in tool",
      limits: "Standard conversion factors — not for regulated trade metrology",
      processing: "Client-side (browser)",
    },
    examples: [{ input: "5 miles → kilometers", output: "8.04672 km" }],
  },
  "enhanced-unit-converter": {
    title: "Enhanced Unit Converter — Multi-Category Units",
    h1: "Enhanced Unit Converter — All Measurement Types",
    metaDescription: "Convert units across length, weight, temperature, time, data size, and speed in one place. Same engine as Unit Converter.",
    ioContract: {
      inputs: "Numeric value, unit category, from/to units",
      outputs: "Converted result",
      formats: "Multiple unit systems",
      limits: "Redirects to canonical /unit-converter page",
      processing: "Client-side (browser)",
    },
  },
  "image-to-text": {
    title: "Image to Text (OCR) — Extract Text from Photos",
    h1: "Image to Text — OCR Online",
    metaDescription: "Extract text from images and scans using browser OCR. Upload PNG/JPG — copy recognized text. Private processing where supported.",
    processingNote: "OCR runs in your browser when supported. Clear photos improve accuracy; always proofread output.",
    ioContract: {
      inputs: "Image upload (PNG, JPG, etc.)",
      outputs: "Recognized plain text for copy",
      formats: "Common raster images",
      limits: "Handwriting and low-contrast images may reduce accuracy",
      processing: "Client-side (browser)",
    },
  },
  "invoice-generator": {
    title: "Invoice Generator — PDF & Image Export",
    h1: "Invoice Generator — Professional Invoices",
    metaDescription: "Create invoices with client details, line items, tax, and logo. Export PDF or image. Auto-save in browser — free for freelancers.",
    ioContract: {
      inputs: "Business info, client, line items, tax rate, currency, logo upload",
      outputs: "Formatted invoice preview; PDF/PNG download",
      formats: "PDF and image export",
      limits: "Template tool — verify tax numbering rules in your jurisdiction",
      processing: "Client-side (browser); optional local auto-save",
    },
  },
  "social-media-downloader": {
    title: "Instagram & Facebook Downloader",
    h1: "Social Media Downloader — Reels & Posts",
    metaDescription: "Download public Instagram reels, posts, stories, and Facebook videos via URL. Respect copyright and platform terms of use.",
    processingNote: "Only download content you have rights to use. FYN Tools does not store your downloads on a server beyond the fetch step.",
    ioContract: {
      inputs: "Public post/reel/story URL",
      outputs: "Media file download link or preview",
      formats: "Platform-dependent video/image",
      limits: "Private accounts and DRM-protected content may fail",
      processing: "Server-assisted fetch (URL required)",
    },
  },
  "weather-forecast": {
    title: "Weather Forecast — City Weather Lookup",
    h1: "Weather Forecast — Current & Weekly",
    metaDescription: "Check weather forecast by city name. Temperature, conditions, and multi-day outlook — free online.",
    ioContract: {
      inputs: "City or location search",
      outputs: "Current conditions, hourly/daily forecast",
      formats: "Location name",
      limits: "Depends on third-party weather API availability",
      processing: "Server/API fetch for forecast data",
    },
  },
  "trip-expense-splitter": {
    title: "Trip Expense Splitter — Split Bills with Friends",
    h1: "Trip Expense Splitter — Who Owes What",
    metaDescription: "Track group trip expenses, assign shares, and calculate settlements. Free expense splitter with roles and balance summary.",
    ioContract: {
      inputs: "Trip members, expenses, payer, split rules",
      outputs: "Per-person balance and settlement suggestions",
      formats: "Currency amounts",
      limits: "Planning tool — verify settlements manually",
      processing: "Client-side (browser)",
    },
  },
  "typing-tutor": {
    title: "Typing Tutor — Touch Typing Lessons",
    h1: "Typing Tutor — Learn Keyboard Skills",
    metaDescription: "Guided touch typing lessons in English and Hindi. Finger placement drills and accuracy tracking — free in browser.",
    ioContract: {
      inputs: "Lesson selection, keyboard input",
      outputs: "Accuracy, speed, lesson progress",
      formats: "On-screen prompts",
      limits: "Practice tool — progress may reset if browser data cleared",
      processing: "Client-side (browser)",
    },
  },
  "typing-competition": {
    title: "Typing Competition — Real-Time Races",
    h1: "Typing Competition — Multiplayer Typing",
    metaDescription: "Compete in real-time typing races against random players. Track WPM and accuracy — free browser game.",
    ioContract: {
      inputs: "Keyboard input during matched prompt",
      outputs: "WPM, accuracy, rank vs opponent",
      formats: "Live text prompt",
      limits: "Requires network for matchmaking",
      processing: "Client + realtime match service",
    },
  },
  "border-radius-generator": {
    title: "Border Radius Generator — CSS Rounded Corners",
    h1: "Border Radius Generator — Live CSS Preview",
    metaDescription: "Drag sliders to build border-radius CSS with live preview. Copy one rule or four-corner syntax — free for web developers.",
    howItWorks: "Adjust radius per corner or link all corners; the preview box and CSS output update together for copy-paste into your stylesheet.",
    examples: [{ input: "Top-left 12px · others 4px", output: "border-radius: 12px 4px 4px 4px;" }],
  },
  "box-shadow-generator": {
    title: "Box Shadow Generator — CSS Shadow Builder",
    h1: "Box Shadow Generator — Visual CSS Shadows",
    metaDescription: "Design CSS box-shadow with offset, blur, spread, and color. Live preview and copy-ready code — free dev tool.",
    howItWorks: "Tweak shadow layers on the preview card; the tool outputs the full box-shadow declaration including inset shadows when enabled.",
  },
  "button-generator": {
    title: "Button Generator — CSS Button Styles",
    h1: "Button Generator — Custom CSS Buttons",
    metaDescription: "Design button colors, padding, radius, and hover states. Copy CSS and HTML snippet — free UI dev tool.",
  },
  "color-converter": {
    title: "Color Converter — HEX, RGB, HSL",
    h1: "Color Converter — Convert Color Formats",
    metaDescription: "Convert colors between HEX, RGB, and HSL with live preview swatch. Free for designers and developers.",
    examples: [{ input: "#3B82F6", output: "rgb(59, 130, 246) · hsl(217, 91%, 60%)" }],
  },
  "temperature-converter": {
    title: "Temperature Converter — Celsius ↔ Fahrenheit",
    h1: "Temperature Converter — °C and °F",
    metaDescription: "Convert Celsius to Fahrenheit and back instantly. Free temperature converter for cooking, travel, and science homework.",
    examples: [{ input: "100 °C", output: "212 °F" }, { input: "98.6 °F", output: "37 °C" }],
  },
  "text-font-changer": {
    title: "Fancy Text Generator — Unicode Fonts",
    h1: "Text Font Changer — 35+ Unicode Styles",
    metaDescription: "Turn plain text into bold, cursive, bubble, and aesthetic Unicode fonts for Instagram, Discord, TikTok, and bios. Copy-paste free.",
    howItWorks: "Type in the box; each style row shows a Unicode transformation you can copy — works anywhere Unicode is supported.",
    examples: [{ input: "Hello World", output: "𝐇𝐞𝐥𝐥𝐨 𝐖𝐨𝐫𝐥𝐝 · 𝓗𝓮𝓵𝓵𝓸 𝓦𝓸𝓻𝓵𝓭 · 🅗🅔🅛🅛🅞" }],
  },
  "add-name-date-photo": {
    title: "Add Name & Date on Passport Photo",
    h1: "Add Name & Date on Photo — Passport Size",
    metaDescription: "Overlay name and date on passport photos for online application forms. Browser-based editor with download — free.",
    processingNote: "Photo editing runs in your browser. Verify final dimensions against the official portal you are applying through.",
    ioContract: {
      inputs: "Passport photo upload, name text, date text, position/font size",
      outputs: "Composited image download",
      formats: "JPG/PNG upload",
      limits: "Check target portal specs (size, DPI, background) before submit",
      processing: "Client-side (browser canvas)",
    },
  },
  "table-to-json-converter": {
    title: "Table to JSON Converter — HTML Table Parser",
    h1: "Table to JSON — Convert HTML Tables",
    metaDescription: "Paste an HTML table and get JSON array output. Free for scraping cleanup and API fixtures.",
    howItWorks: "Parses table rows and cells into an array of objects using header row keys when present.",
    examples: [{ input: "<table><tr><th>Name</th></tr><tr><td>Ada</td></tr></table>", output: '[{"Name":"Ada"}]' }],
  },
  "coin-flip": {
    title: "Coin Flip — Heads or Tails",
    h1: "Coin Flip Simulator — Random Decision",
    metaDescription: "Flip a virtual coin for heads or tails. Fair random outcome in the browser — free decision maker.",
    howItWorks: "Uses browser randomness to pick heads or tails with animation feedback.",
  },
  "dice-roller": {
    title: "Dice Roller — Custom Dice Online",
    h1: "Dice Roller — Roll Virtual Dice",
    metaDescription: "Roll d6, d20, or custom dice with quantity. Sum results for tabletop games — free in browser.",
    examples: [{ input: "2d6", output: "Two six-sided rolls with total (e.g. 4 + 6 = 10)" }],
  },
  "countdown-timer": {
    title: "Countdown Timer — Set Target Time",
    h1: "Countdown Timer — Time Remaining",
    metaDescription: "Set hours, minutes, and seconds to count down to zero with alert. Free browser timer.",
  },
  "notes": {
    title: "Notes — Personal Notes with Tags",
    h1: "Notes — Browser Note Organizer",
    metaDescription: "Create color-coded notes with tags. Saved locally in your browser — free, private quick notes.",
    processingNote: "Notes persist in localStorage on this device only — export important notes before clearing browser data.",
  },
  "todo-list": {
    title: "To-Do List — Simple Task Manager",
    h1: "To-Do List — Tasks in Your Browser",
    metaDescription: "Add, complete, and delete tasks. Local browser storage — free minimalist todo list.",
    processingNote: "Tasks save locally; they do not sync across devices unless you export them.",
  },
  "currency-converter": {
    title: "Currency Converter — Live Exchange Rates",
    h1: "Currency Converter — FX Conversion",
    metaDescription: "Convert amounts between world currencies using fetched exchange rates. Free currency calculator.",
    processingNote: "Rates come from a public API and are indicative — banks use different spreads.",
    ioContract: {
      inputs: "Amount, from currency, to currency",
      outputs: "Converted amount at latest fetched rate",
      formats: "ISO currency codes",
      limits: "Rates delayed/indicative — not for regulated trading",
      processing: "Client fetch from exchange-rate API",
    },
  },
  "date-difference-calculator": {
    title: "Date Difference Calculator — Days Between Dates",
    h1: "Date Difference Calculator — Count Days",
    metaDescription: "Find days, weeks, and months between two calendar dates. Free date math tool.",
    examples: [{ input: "2025-01-01 to 2025-12-31", output: "364 days (365 in leap years depending on range)" }],
  },
  "future-date-calculator": {
    title: "Future Date Calculator — Add or Subtract Days",
    h1: "Future Date Calculator — Date Arithmetic",
    metaDescription: "Add or subtract days, months, or years from any date. Plan deadlines and reminders — free.",
    examples: [{ input: "Today + 90 days", output: "Calendar date 90 days ahead" }],
  },
  "simple-calculator": {
    title: "Simple Calculator — Basic Arithmetic",
    h1: "Simple Calculator — Add, Subtract, Multiply, Divide",
    metaDescription: "Online calculator for everyday arithmetic. Keyboard-friendly — free, no download.",
  },
  "business-idea-generator": {
    title: "Business Idea Generator — Startup Prompts",
    h1: "Business Idea Generator — Creative Ideas",
    metaDescription: "Generate business ideas from your interests, skills, and market preferences. Brainstorming aid — free.",
    howItWorks: "Combines your selected tags and preferences into idea prompts you can refine offline.",
  },
  "daily-task-report-saver": {
    title: "Daily Task Report Saver — Routine & Reports",
    h1: "Daily Task Report Saver — Log by Date",
    metaDescription: "Save daily timetable, routine, work report, and notes by date. Local browser storage — free planner.",
    processingNote: "Reports save in localStorage — back up important logs externally.",
  },
  "timetable-maker": {
    title: "Timetable Maker — Personal Schedule Builder",
    h1: "Timetable Maker — Custom Weekly Schedule",
    metaDescription: "Build a weekly timetable from hobbies, goals, and job hours. Printable layout — free schedule maker.",
  },
  "social-media-deep-link-generator": {
    title: "Deep Link Generator — Open in App or Web",
    h1: "Social Media Deep Link Generator",
    metaDescription: "Create smart links for YouTube, Instagram, Facebook, Twitter, WhatsApp, Telegram, and LinkedIn that open apps when installed.",
    howItWorks: "Enter a platform URL; the tool outputs a deep-link pattern that tries the native app URI scheme with web fallback.",
  },
  "social-media-db-viewer": {
    title: "Social Media Profile Viewer",
    h1: "Instagram & Facebook Public Profile Viewer",
    metaDescription: "View public profile information from Instagram and Facebook URLs. Public data only — respect privacy and platform terms.",
    processingNote: "Only works for public profiles. Do not use to harass or scrape private data.",
  },
  "social-media-planner": {
    title: "Social Media Planner — Post Schedule Board",
    h1: "Social Media Planner — Content Calendar",
    metaDescription: "Draft and organize social posts by date and platform. Browser-based planning board — free.",
    processingNote: "Planner data may store locally — does not auto-publish to networks.",
  },
  "pdf-text-extractor": {
    title: "PDF Text Extractor — Copy Text from PDF",
    h1: "PDF Text Extractor — PDF to Plain Text",
    metaDescription: "Extract selectable text from PDF files in the browser. Copy plain text for editing — free.",
    processingNote: "Scanned image-only PDFs need OCR — try Image to Text if extraction is empty.",
  },
  "flip-image": {
    title: "Flip Image — Horizontal & Vertical Flip",
    h1: "Flip Image Online — Mirror Photos",
    metaDescription: "Flip images horizontally or vertically with live preview. Download result — free browser tool.",
  },
  "merge-images": {
    title: "Merge Images — Combine Photos Online",
    h1: "Merge Images — Horizontal, Vertical, Grid",
    metaDescription: "Combine multiple images into one layout. Horizontal, vertical, or grid merge — download PNG.",
  },
  "split-image": {
    title: "Split Image — Grid Slice & ZIP Download",
    h1: "Split Image — Cut into Rows & Columns",
    metaDescription: "Split an image into equal tiles by rows and columns. Download all pieces as ZIP — free.",
  },
  "image-upscaler": {
    title: "Image Upscaler — Increase Resolution",
    h1: "Image Upscaler — Enlarge & Sharpen",
    metaDescription: "Upscale images with interpolation to increase pixel dimensions. Browser-based — best for moderate enlargement.",
    processingNote: "Extreme upscaling cannot invent detail — results are interpolated estimates.",
  },
  "pregnancy-diet-planner": {
    title: "Pregnancy Diet Planner (Educational)",
    h1: "Pregnancy Diet Planner — Trimester Foods, Nutrients & Safety",
    metaDescription:
      "Educational pregnancy diet planner with trimester meal ideas, key nutrients (folate, iron, calcium), foods to avoid, and medical disclaimers. Not a substitute for prenatal care.",
    processingNote:
      "Planner logic runs in your browser. Outputs are educational only — not a diagnosis, prescription, or substitute for prenatal care.",
    tldr:
      "Pick a trimester for educational meal ideas, nutrient themes, and foods-to-avoid lists — then confirm everything with your prenatal clinician. Not medical advice.",
    howItWorks:
      "Choose your trimester, optionally enter weight and activity for a rough calorie estimate, then review priorities, sample meals, nutrient cards, foods to avoid, cautions, and terms.",
    faqs: [
      { question: "Is this pregnancy diet planner medical advice?", answer: "No. It is educational only — confirm all nutrition changes with your prenatal clinician." },
      { question: "Which foods should I avoid?", answer: "Alcohol, high-mercury fish, raw/undercooked meats, unpasteurized dairy, and raw sprouts are commonly listed — see the tool for the full educational list." },
    ],
  },
};

function processingFor(category, slug) {
  if (/pregnancy|period|conception|safe-days|contraction|pms|kick/.test(slug))
    return "Educational estimates only — confirm with your prenatal or women's health clinician.";
  if (category === "Image Tools" && /compress|resize|crop|flip|merge|split|blur|pixel|invert|placeholder|annotation|format-converter|metadata|background|upscal|add-name/.test(slug))
    return "Image processing runs in your browser. Original files are not uploaded to FYN Tools servers unless the tool states otherwise.";
  if (category === "Number Tools" || category === "Finance Tools")
    return "Calculations run locally in your browser. Results are planning estimates — verify with your bank, CA, or advisor.";
  if (/social-media|weather|ip-lookup|currency/.test(slug))
    return "This tool may call external APIs to fetch public data. Do not submit secrets or private credentials.";
  return "Runs in your browser on FYN Tools — no account required for basic use.";
}

function ioFor(tool, o) {
  if (o.ioContract) return o.ioContract;
  const s = tool.path.slice(1);
  if (tool.category === "Image Tools")
    return {
      inputs: "Image upload (drag-drop or file picker)",
      outputs: "Processed image preview and download",
      formats: "PNG, JPG, WebP where supported",
      limits: "Very large files may slow browser processing",
      processing: "Client-side (browser)",
    };
  if (tool.category === "Development Tools")
    return {
      inputs: "CSS parameters or markup/table paste",
      outputs: "Generated CSS snippet or JSON output",
      formats: "Copy-paste code",
      limits: "Preview in tool — paste into your project manually",
      processing: "Client-side (browser)",
    };
  if (tool.category === "Converter Tools")
    return {
      inputs: "Value and unit/color format selectors",
      outputs: "Converted value in target format",
      formats: "Category-specific units or color codes",
      limits: "Standard conversion precision",
      processing: "Client-side (browser)",
    };
  if (tool.category === "Utility Tools" || tool.category === "Timer Tools")
    return {
      inputs: "Tool-specific fields (lists, timers, preferences)",
      outputs: "On-screen result; optional local save",
      formats: "Browser session or localStorage",
      limits: "Data may clear if browser storage is wiped",
      processing: "Client-side (browser)",
    };
  return {
    inputs: "Fields shown in the tool form above",
    outputs: "Instant on-screen results",
    formats: "Copy-paste friendly text or numbers",
    limits: "Educational use — verify critical decisions independently",
    processing: "Client-side (browser)",
  };
}

function buildEntry(slug) {
  const tool = bySlug[slug];
  if (!tool) throw new Error(`Missing tool: ${slug}`);
  const o = SLUG[slug] || {};
  const name = tool.name;
  const desc = tool.description;
  const cat = tool.category;

  const title = o.title || `${name} — Free Online Tool`;
  const h1 = o.h1 || `${name} — Free Online`;
  const metaDescription =
    o.metaDescription ||
    (desc.length > 155 ? `${desc.slice(0, 152)}…` : `${desc} Free on FYN Tools — no signup.`);

  const tldr =
    o.tldr ||
    `${name} lets you ${desc.charAt(0).toLowerCase()}${desc.slice(1).replace(/\.$/, "")}. Open the tool above, enter your data, and copy results instantly in the browser.`;

  const processingNote = o.processingNote || processingFor(cat, slug);
  const ioContract = ioFor(tool, o);

  const intro1 =
    o.introParagraphs?.[0] ||
    `${name} on FYN Tools is built for ${cat.toLowerCase()} tasks: ${desc} The interactive panel loads above this guide so you can try it immediately without creating an account.`;

  const intro2 =
    o.introParagraphs?.[1] ||
    (cat === "Pregnancy Tools" || cat === "Period & Cycle Tools"
      ? "Cycle and pregnancy tools vary person to person. Use these results for planning and discussion with your clinician — not as a diagnosis or emergency guide."
      : cat === "Number Tools" || cat === "Finance Tools"
        ? "Adjust inputs to compare scenarios — for example different tenures, tax regimes, or deposit amounts — before you commit to a financial decision elsewhere."
        : cat === "Image Tools"
          ? "Upload from your device; processing stays local when the tool uses browser canvas APIs. Download the output when the preview looks correct."
          : "Results update as you type. Bookmark the page if you reuse this workflow often — everything runs in one tab.");

  const howItWorks =
    o.howItWorks ||
    (cat === "Image Tools"
      ? `Upload an image into ${name}; the canvas pipeline applies the selected transform and shows a preview you can download as PNG or JPG.`
      : cat === "Development Tools"
        ? `${name} updates a live preview and CSS/code output as you change controls — copy the snippet into your project.`
        : cat === "Pregnancy Tools" || cat === "Period & Cycle Tools"
          ? `${name} applies calendar or logging logic from the dates and options you enter. Outputs are educational — confirm clinically important decisions with your provider.`
          : `The ${name} form reads your inputs, runs the built-in formulas or conversions, and shows results immediately in the page.`);

  const commonMistakes =
    o.commonMistakes ||
    (cat === "Number Tools" || cat === "Finance Tools"
      ? [
          "Confusing annual vs monthly rate when entering loan or investment fields",
          "Treating rounded calculator output as a bank-approved quote",
          "Forgetting that tax and fee line items are excluded from simple calculators",
        ]
      : cat === "Image Tools"
        ? [
            "Uploading the wrong aspect ratio then blaming the tool for crop mismatch",
            "Expecting OCR-level text from blurry uploads",
            "Not downloading the result before navigating away",
          ]
        : cat === "Pregnancy Tools" || cat === "Period & Cycle Tools"
          ? [
              "Using calendar predictions as contraception without clinician guidance",
              "Ignoring severe symptoms because an app log looks normal",
              "Expecting cloud backup when data is stored only in this browser",
            ]
          : [
              "Skipping unit or format checks before sharing results",
              "Assuming local browser data syncs across devices",
              "Using educational output as professional advice without verification",
            ]);

  const howToUse = o.howToUse || [
    `Open ${name} and locate the input fields at the top of the page.`,
    "Enter the values or upload the file your task requires.",
    "Review the live output — copy, download, or adjust inputs as needed.",
    "Read the tips and FAQs below if you need examples or troubleshooting.",
    "For saved history tools, export data before clearing browser storage.",
  ];

  const whenToUse = o.whenToUse || [
    `When you need ${desc.toLowerCase().replace(/\.$/, "")} without installing software`,
    `For quick ${cat.toLowerCase()} checks on mobile or desktop`,
    "Before sharing results in a doc, ticket, or chat — copy from the tool",
    "As a free alternative to one-off paid utilities for the same task",
  ];

  const useCases =
    o.useCases ||
    [
      { title: "Personal use", description: `Handle everyday ${cat.toLowerCase()} needs in one browser tab.` },
      { title: "Work & study", description: `Produce numbers, text, or files you can paste into reports and assignments.` },
      { title: "Mobile quick check", description: "Responsive layout for phone browsers when you are away from desktop." },
    ];

  const examples =
    o.examples ||
    [
      {
        input: `Typical ${name} input`,
        output: "Instant on-screen result you can copy or download",
      },
    ];

  const tips =
    o.tips ||
    [
      "Double-check units (currency, dates, measurements) before acting on results.",
      "Use a modern browser for best performance with canvas and file uploads.",
      cat.includes("Pregnancy") || cat.includes("Period")
        ? "Contact a clinician if symptoms are severe or unusual — online tools cannot triage emergencies."
        : "Save or screenshot important outputs before closing the tab.",
    ];

  const advantages =
    o.advantages ||
    [
      "Free access with no signup for core features",
      "Fast browser-based processing",
      "Mobile-friendly layout",
      "Clear how-to steps and FAQs on the same page",
    ];

  const faqs =
    o.faqs ||
    [
      {
        question: `Is ${name} free?`,
        answer: "Yes — core features on FYN Tools are free to use in your browser without an account.",
      },
      {
        question: "Is my data uploaded?",
        answer:
          ioContract.processing.includes("Client-side")
            ? "Core processing runs in your browser. Check the processing note above for any API-backed tools."
            : "This tool may fetch public data from external services when you submit a URL or location.",
      },
      {
        question: "Can I use this on mobile?",
        answer: "Yes — the layout is responsive. Very large uploads may be slower on mobile networks.",
      },
    ];

  const conclusion =
    o.conclusion ||
    `Use ${name} above for ${desc.toLowerCase().replace(/\.$/, "")}, then explore related ${cat} tools linked on this page when you need the next step in your workflow.`;

  return {
    title,
    h1,
    metaDescription,
    dateModified: "2026-08-29",
    tldr,
    processingNote,
    ioContract,
    keywords: o.keywords || [
      name.toLowerCase(),
      `${name.toLowerCase()} online`,
      `free ${name.toLowerCase()}`,
      cat.toLowerCase(),
      "fyn tools",
    ],
    introParagraphs: [intro1, intro2],
    overview: o.overview || desc,
    howItWorks,
    howToUse,
    whenToUse,
    useCases,
    examples,
    tips,
    commonMistakes,
    advantages,
    benefits: o.benefits || advantages.slice(0, 3),
    features: o.features || [`Interactive ${name}`, "Copy-friendly output", "No signup", "Mobile-friendly UI"],
    faqs,
    conclusion,
  };
}

function emitTs(entries) {
  const lines = [
    "/**",
    " * Phase 3 — Remaining pipeline tools: hand-tuned premium SEO (batch 7).",
    " * AUTO-GENERATED by scripts/generate-batch7-content.mjs — re-run after tool changes.",
    " */",
    "import type { PremiumPartial } from '@/data/seo-pages/types';",
    "",
    "export const batch7ToolSeo: Record<string, PremiumPartial> = {",
  ];

  for (const slug of PENDING) {
    const e = entries[slug];
    lines.push(`  '/${slug}': ${JSON.stringify(e, null, 4).replace(/^/gm, "  ").slice(2)},`);
  }

  lines.push("};", "");
  return lines.join("\n");
}

const entries = {};
for (const slug of PENDING) entries[slug] = buildEntry(slug);

const out = path.join(root, "src/data/tool-content/batch7.ts");
fs.writeFileSync(out, emitTs(entries));
console.log(`Wrote ${out}: ${PENDING.length} tools`);
