import type { PageOverride } from '@/data/tool-content/pageOverrides';

/**
 * Tier 1 Batch 1 — GSC pending/failed URLs first, then next priority tools.
 * Merged last into pageOverrides so this content wins for useCases (≥3), faqs (≥4), examples.
 */
export const TIER1_BATCH1_PATHS = [
  '/jwt-decoder',
  '/safe-days-calculator',
  '/dummy-api-generator',
  '/html-formatter',
  '/lorem-ipsum-generator',
  '/percentage-calculator',
  '/json-validator',
  '/ovulation-calculator',
  '/typing-test',
  '/xml-sitemap-tester',
] as const;

export const tier1Batch1Overrides: Record<(typeof TIER1_BATCH1_PATHS)[number], PageOverride> = {
  '/jwt-decoder': {
    title: 'JWT Decoder Online – Inspect Header, Payload & Expiry | FYN Tools',
    description:
      'Paste a JWT to decode header and payload claims in your browser. Check exp/iat/nbf, see alg/typ, and copy JSON — tokens never leave your device.',
    shortIntro:
      'Decode a JSON Web Token into readable header and payload JSON. Inspect claims like exp, sub, and roles before you debug an API — processing stays in your browser.',
    keywords:
      'jwt decoder, decode jwt online, jwt debugger, inspect jwt claims, jwt exp checker, json web token decoder, jwt payload viewer',
    category: 'Development Tools',
    howToUse: [
      'Paste the full JWT (three base64url segments separated by dots).',
      'Read the decoded header (alg, typ, kid) and payload claims.',
      'Compare exp / iat / nbf timestamps with your clock when debugging auth failures.',
      'Copy header or payload JSON into your notes or JSON Formatter.',
      'Never paste production secrets or private signing keys into any online tool.',
    ],
    useCases: [
      {
        title: 'Debug 401 after login',
        description:
          'Paste the Bearer token from DevTools → Network. Confirm exp has not passed and aud/iss match what your API gateway expects before blaming CORS.',
      },
      {
        title: 'Verify role claims in staging',
        description:
          'Open a staging access token and check custom claims (role, tenantId, permissions) after a permission change — without calling a verify endpoint.',
      },
      {
        title: 'Spot wrong algorithm assumptions',
        description:
          'Read header.alg (HS256 vs RS256 vs none). Catch “alg=none” or unexpected kid values before you wire a mobile client to the wrong JWKS URL.',
      },
      {
        title: 'Support ticket evidence',
        description:
          'Decode a redacted customer token (strip PII claims first) and screenshot exp/iat for a ticket — still run decode locally so the raw JWT never hits a pastebin.',
      },
    ],
    examples: [
      {
        input:
          'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0IiwibmFtZSI6IkRlbW8iLCJleHAiOjE3MzU2ODkwMDB9.signature',
        output:
          'Header: {"alg":"HS256","typ":"JWT"} · Payload: sub=1234, name=Demo, exp=1735689000 (readable UTC) · Signature: shown as opaque (not verified)',
      },
      {
        input: 'Expired access token from localStorage (three segments)',
        output:
          'Payload shows exp in the past → explains 401 Unauthorized; iat/nbf listed for clock-skew checks',
      },
    ],
    faqs: [
      {
        question: 'Does this JWT decoder verify the signature?',
        answer:
          'No. Verification needs your secret or public key, which must never be pasted into a public page. FYN Tools only base64url-decodes the header and payload so you can inspect claims safely.',
      },
      {
        question: 'Is my JWT uploaded to a server?',
        answer:
          'Decoding runs in your browser. The token is not stored in a FYN account. Still treat production tokens as sensitive — clear the field when you are done.',
      },
      {
        question: 'Why do I see “Invalid token” for a real JWT?',
        answer:
          'Most failures are a missing segment, line breaks/spaces, or a truncated copy from logs. JWTs must be exactly three base64url parts separated by dots with no Bearer prefix.',
      },
      {
        question: 'How do I read the exp claim?',
        answer:
          'exp is a Unix timestamp (seconds). Compare it to the current UTC time. If exp is in the past, APIs should reject the token even if the signature was once valid.',
      },
      {
        question: 'Can I decode encrypted JWTs (JWE)?',
        answer:
          'This tool targets compact JWS tokens (header.payload.signature). Encrypted JWE strings need decryption keys and a different workflow — use your backend crypto stack instead.',
      },
    ],
    tips: [
      'Strip the “Bearer ” prefix before pasting.',
      'Pair with JSON Formatter if you want indented claim JSON.',
      'Use Dummy API Generator + JWT Decoder when practicing auth flows.',
    ],
    whenToUse: [
      'When an API returns 401/403 and you need claim-level evidence.',
      'When comparing tokens issued by two environments (staging vs prod).',
      'When onboarding docs mention custom claims you have never seen.',
    ],
    relatedTools: [
      { name: 'JSON Formatter', href: '/json-formatter', description: 'Pretty-print decoded claims' },
      { name: 'Base64 Converter', href: '/base64-converter', description: 'Encode/decode segments manually' },
      { name: 'Hash Generator', href: '/hash-generator', description: 'Checksum secrets offline' },
      { name: 'Dummy API Generator', href: '/dummy-api-generator', description: 'Practice Bearer auth flows' },
    ],
  },

  '/safe-days-calculator': {
    title: 'Safe Days Calculator – Fertile vs Lower-Risk Days | FYN Tools',
    description:
      'Estimate fertile and lower-risk days from last period date and cycle length. Educational calendar only — not contraception or medical advice.',
    shortIntro:
      'Enter last period start and average cycle length to highlight estimated fertile days and lower-risk (“safe”) days on a calendar. For planning education only — not a birth-control method.',
    keywords:
      'safe days calculator, fertile days calendar, safe period calculator, rhythm method estimate, pregnancy risk days',
    category: 'Period & Cycle Tools',
    howToUse: [
      'Select the first day of your last menstrual period (LMP).',
      'Enter your typical cycle length in days (e.g. 28).',
      'Add period length if the UI asks, so bleeding days are marked clearly.',
      'Review fertile vs lower-risk days on the calendar.',
      'Tap any date to see the estimated pregnancy-risk label for that day.',
    ],
    useCases: [
      {
        title: 'Irregular-cycle sanity check',
        description:
          'If your cycles swing 26–32 days, run the calculator twice with both lengths and compare fertile windows before you rely on a single 28-day assumption.',
      },
      {
        title: 'Trip or event planning',
        description:
          'Mark a wedding week or travel dates against the estimated fertile window so you can discuss backup contraception with a clinician — not as a standalone method.',
      },
      {
        title: 'Trying-to-conceive cross-check',
        description:
          'Use fertile-day highlighting alongside Ovulation Calculator; track LH strips or BBT separately because calendar math alone misses late ovulation.',
      },
      {
        title: 'Postpartum / new cycle restart',
        description:
          'After periods return postpartum, re-enter the new LMP and length — old saved assumptions from pregnancy are often wrong.',
      },
    ],
    examples: [
      {
        input: 'LMP: 1 Sep 2026 · Cycle length: 28 days · Period length: 5 days',
        output:
          'Approx ovulation ~ day 14 · Fertile window ~ days 10–16 · Lower-risk days clustered early/late cycle (educational estimate)',
      },
      {
        input: 'LMP: 10 Aug 2026 · Cycle length: 32 days',
        output:
          'Fertile window shifts later than a 28-day model; calendar labels update for the longer luteal/follicular split used by the tool',
      },
    ],
    faqs: [
      {
        question: 'Are “safe days” a reliable contraceptive method?',
        answer:
          'No. Calendar estimates miss early/late ovulation, sperm lifespan, and cycle variability. Use clinician-recommended contraception if avoiding pregnancy. This page is educational only.',
      },
      {
        question: 'How does the safe days calculator estimate fertile days?',
        answer:
          'It uses your LMP and average cycle length to approximate ovulation (often ~14 days before the next period) and marks a fertile window around that day. Stress, illness, and PCOS can shift real ovulation.',
      },
      {
        question: 'What cycle length should I enter if I am irregular?',
        answer:
          'Use your recent average, or run two scenarios (shortest and longest recent cycles). Wide swings mean calendar methods are especially unreliable.',
      },
      {
        question: 'Is my period data stored on FYN servers?',
        answer:
          'Calculations run in your browser for this tool. We do not require an account to estimate days. Clear the page if you share a device.',
      },
      {
        question: 'Should I use this instead of ovulation tests?',
        answer:
          'No. LH strips, ultrasound, or medical advice beat calendar math. Pair this tool with Ovulation Calculator and Period Tracker for journaling — not diagnosis.',
      },
    ],
    tips: [
      'Track at least 3 cycles before trusting any pattern.',
      'Open Ovulation Calculator for a dedicated fertile-window view.',
      'Seek medical care for sudden cycle changes or pain.',
    ],
    whenToUse: [
      'When you want a quick educational calendar from LMP + length.',
      'When comparing a 28-day vs longer-cycle assumption.',
      'When preparing questions for a clinic visit — not as birth control.',
    ],
    relatedTools: [
      { name: 'Ovulation Calculator', href: '/ovulation-calculator', description: 'Fertile window focus' },
      { name: 'Period Calculator', href: '/period-calculator', description: 'Next period estimate' },
      { name: 'Period Tracker', href: '/period-tracker', description: 'Log flow and symptoms' },
      { name: 'PMS Symptom Tracker', href: '/pms-symptom-tracker', description: 'Monthly symptom notes' },
    ],
  },

  '/dummy-api-generator': {
    title: 'Dummy API Generator – Free Mock REST Endpoints | FYN Tools',
    description:
      'Practice login, Bearer tokens, and CRUD against free dummy REST endpoints. Copy cURL/Fetch/Axios samples — for learning and staging tests, not production.',
    shortIntro:
      'Hit free dummy REST endpoints for register/login, Bearer auth, and user CRUD. Use the live tester and copy cURL, Fetch, or Axios snippets for classwork or frontend stubs.',
    keywords:
      'dummy api generator, mock rest api, free api for testing, bearer token practice, fake api endpoints, api tester online',
    category: 'Developer Tools',
    howToUse: [
      'Register or log in via the auth endpoints to receive a Bearer token.',
      'Paste the token into the tester’s Authorization field.',
      'Pick an endpoint (GET/POST/PUT/PATCH/DELETE users) and send a request.',
      'Inspect the JSON response and status code.',
      'Copy the matching cURL, Fetch, or Axios sample into your project.',
    ],
    useCases: [
      {
        title: 'Frontend auth wiring without a backend',
        description:
          'Point a React/Vue login form at POST /auth/login, store the returned JWT, and attach Authorization: Bearer … on protected GETs before your real API exists.',
      },
      {
        title: 'Postman / Hoppscotch classroom lab',
        description:
          'Students share the same dummy base URL, practice 401 vs 200 responses, and learn expiresIn options (15m–7d) without provisioning cloud sandboxes.',
      },
      {
        title: 'CRUD homework checklist',
        description:
          'Create a user, list users, update fields, toggle status, then delete — verify each verb against the live tester and screenshot responses for submission.',
      },
      {
        title: 'Decode the practice JWT',
        description:
          'After login, paste the token into JWT Decoder to confirm claims and expiry while learning how Bearer auth connects to JSON Web Tokens.',
      },
    ],
    examples: [
      {
        input: 'POST /auth/login · body {"email":"demo@fyn.dev","password":"••••"} · expiresIn: "1h"',
        output: '200 · {"token":"eyJ…","expiresIn":"1h"} — paste token as Authorization: Bearer eyJ…',
      },
      {
        input: 'GET /users with valid Bearer token',
        output: '200 · JSON array of dummy users (id, name, status) for UI table binding',
      },
    ],
    faqs: [
      {
        question: 'Can I use the dummy API in production?',
        answer:
          'No. Data is for practice and may be reset. Build real auth, rate limits, and persistence on your own backend before shipping.',
      },
      {
        question: 'How do I authenticate requests?',
        answer:
          'Call login/register to receive a JWT, then send Authorization: Bearer <token> on protected routes. Tokens can expire in 15m, 1h, 12h, 1d, or 7d depending on expiresIn.',
      },
      {
        question: 'Which CRUD routes exist?',
        answer:
          'Typical practice routes include creating users, listing users, fetching the current account, updating by id, deleting by id, and patching status. Use the on-page endpoint list as the source of truth.',
      },
      {
        question: 'Why am I getting 401 Unauthorized?',
        answer:
          'Usually the token expired, the Bearer prefix is missing, or you are calling a protected route before login. Re-login, copy a fresh token, and retry.',
      },
      {
        question: 'Is there a signup fee or API key for FYN’s dummy API?',
        answer:
          'The practice surface is free for learning. Treat credentials you create here as disposable test accounts — never reuse real production passwords.',
      },
    ],
    tips: [
      'Pretty-print responses in JSON Formatter / JSON Validator.',
      'Keep expiresIn short while learning so you practice refresh/re-login.',
      'Do not put PII in dummy payloads.',
    ],
    whenToUse: [
      'When teaching REST + JWT without standing up Express/FastAPI.',
      'When a frontend needs a stub API for demos.',
      'When validating client error-handling for 401/404.',
    ],
    relatedTools: [
      { name: 'JWT Decoder', href: '/jwt-decoder', description: 'Inspect practice tokens' },
      { name: 'JSON Formatter', href: '/json-formatter', description: 'Pretty-print API bodies' },
      { name: 'JSON Validator', href: '/json-validator', description: 'Catch JSON syntax errors' },
      { name: 'Table to JSON', href: '/table-to-json-converter', description: 'Build sample payloads' },
    ],
  },

  '/html-formatter': {
    title: 'HTML Formatter & Beautifier Online | FYN Tools',
    description:
      'Beautify minified or messy HTML with consistent indentation. Preserve tags and attributes, then copy clean markup for reviews and debugging.',
    shortIntro:
      'Paste minified or inconsistent HTML and get indented, readable markup. Whitespace-only formatting — structure and attributes stay intact for safer reviews.',
    keywords:
      'html formatter, html beautifier, format html online, unminify html, beautify html, html indentation tool',
    category: 'Developer Tools',
    howToUse: [
      'Paste HTML (snippets or full documents) into the input.',
      'Run Format / Beautify to apply indentation.',
      'Scan nested tags for missing closers now that structure is visible.',
      'Copy the formatted HTML back into your editor or CMS.',
      'Follow with Live Preview if you need a quick visual check.',
    ],
    useCases: [
      {
        title: 'Unminify production HTML dumps',
        description:
          'Paste a single-line view-source dump from Chrome and expand it so you can find the offending <div> before filing a layout bug.',
      },
      {
        title: 'Email template review',
        description:
          'Beautify table-based newsletter HTML so nested <td> and inline styles are reviewable in a PR without fighting minified noise.',
      },
      {
        title: 'CMS paste cleanup',
        description:
          'Editors often paste Word/Google Docs HTML with erratic spacing. Format first, then strip unused spans in your editor.',
      },
      {
        title: 'Student assignment readability',
        description:
          'Before grading, auto-indent submitted index.html files so nesting depth and indentation style are visible at a glance.',
      },
    ],
    examples: [
      {
        input: '<div class="card"><h1>Hi</h1><p>Welcome<em>friend</em></p></div>',
        output:
          '<div class="card">\n  <h1>Hi</h1>\n  <p>Welcome<em>friend</em></p>\n</div>',
      },
      {
        input: 'Minified homepage: <!doctype html><html><head><title>X</title></head><body><main id="app"></main></body></html>',
        output: 'Indented doctype → html → head/title → body/main with one tag per logical level',
      },
    ],
    faqs: [
      {
        question: 'Does formatting change how the page renders?',
        answer:
          'In normal HTML, extra whitespace between tags does not change layout. Rare cases (preformatted text or sensitive inline spacing) should be checked in Live Preview after formatting.',
      },
      {
        question: 'Can it format HTML that includes <script> and <style>?',
        answer:
          'Yes — embedded CSS/JS stay inside their tags. For dedicated CSS/JS cleanup use CSS Minifier or JavaScript Minifier after you finish HTML structure work.',
      },
      {
        question: 'Will the formatter fix invalid HTML?',
        answer:
          'It prioritizes readability, not full HTML5 error repair. Invalid nesting may still be invalid — use the indented view to spot problems faster.',
      },
      {
        question: 'Is my HTML uploaded when I format it?',
        answer:
          'Formatting is designed to run in your browser session for this tool. Avoid pasting secrets (API keys in inline scripts) onto shared machines.',
      },
      {
        question: 'What is the difference between format and minify?',
        answer:
          'Format adds indentation for humans. Minify removes whitespace for transfer size. Beautify here, minify later in your build pipeline if needed.',
      },
    ],
    tips: [
      'Format before asking teammates to review a markup PR.',
      'Use Markdown Editor when the source is .md, not raw HTML.',
      'Validate JSON-LD script blocks separately with JSON Validator.',
    ],
    whenToUse: [
      'When view-source is one long line.',
      'When email/HTML templates are unreadable in diffs.',
      'When teaching semantic nesting in class.',
    ],
    relatedTools: [
      { name: 'HTML Live Preview', href: '/live-preview', description: 'Render formatted markup' },
      { name: 'CSS Minifier', href: '/css-minifier', description: 'Compress stylesheets' },
      { name: 'JavaScript Minifier', href: '/javascript-minifier', description: 'Compress scripts' },
      { name: 'Markdown Editor', href: '/markdown-editor', description: 'Write MD with preview' },
    ],
  },

  '/lorem-ipsum-generator': {
    title: 'Lorem Ipsum Generator – Placeholder Words & Paragraphs | FYN Tools',
    description:
      'Generate classic Lorem Ipsum words, sentences, or paragraphs for wireframes, Figma mockups, and HTML templates. Copy instantly — replace before publish.',
    shortIntro:
      'Generate classic Lorem Ipsum placeholder copy by words, sentences, or paragraphs. Built for designers and developers who need neutral filler that does not steal attention from layout.',
    keywords:
      'lorem ipsum generator, placeholder text generator, dummy text online, lorem ipsum paragraphs, mockup text',
    category: 'Text Tools',
    howToUse: [
      'Choose words, sentences, or paragraphs.',
      'Set how many units you need (e.g. 3 paragraphs).',
      'Generate and copy the placeholder text.',
      'Paste into Figma, Webflow, or your HTML template.',
      'Replace every placeholder before you publish or submit SEO content.',
    ],
    useCases: [
      {
        title: 'Figma wireframe fill',
        description:
          'Generate 2–3 short paragraphs for a blog card grid so typography and line-clamp CSS can be judged without real draft copy.',
      },
      {
        title: 'Email layout stress test',
        description:
          'Fill a newsletter hero + two columns with sentence-mode Ipsum to catch overflow on mobile breakpoints before copywriters deliver final text.',
      },
      {
        title: 'CMS theme screenshot',
        description:
          'Populate title + body fields with consistent Ipsum lengths when capturing theme demos so every screenshot uses the same visual density.',
      },
      {
        title: 'Character-limit UI QA',
        description:
          'Generate a long paragraph, paste into a 160-character meta field or bio input, and verify truncation with Word Counter afterward.',
      },
    ],
    examples: [
      {
        input: 'Mode: paragraphs · Count: 2',
        output:
          'Two Lorem Ipsum paragraphs starting with “Lorem ipsum dolor sit amet…” ready to paste into a mock article body',
      },
      {
        input: 'Mode: words · Count: 12',
        output: 'Twelve-word Ipsum snippet for a button label or short card subtitle test',
      },
    ],
    faqs: [
      {
        question: 'Why do designers still use Lorem Ipsum?',
        answer:
          'Readable English distracts reviewers into editing tone instead of spacing, hierarchy, and contrast. Pseudo-Latin keeps the focus on layout.',
      },
      {
        question: 'Can I publish a site that still contains Lorem Ipsum?',
        answer:
          'You should not. Search engines and users treat leftover Ipsum as unfinished content. Replace it with real copy and run Word Counter / Meta Tag Previewer before launch.',
      },
      {
        question: 'Does the generator create unique paragraphs every time?',
        answer:
          'It draws from classic Ipsum vocabulary. Treat output as disposable filler, not original writing. For drafts, switch to AI Text Rewriter after structure is approved.',
      },
      {
        question: 'Word count vs paragraph count — which should I pick?',
        answer:
          'Use paragraphs for article bodies, sentences for blurbs, and words for tight UI chips. Match the control you are testing in the design file.',
      },
      {
        question: 'Is there a length limit?',
        answer:
          'Generate what you need for the mock. Extremely large dumps are unnecessary — create sections as you design rather than one giant blob.',
      },
    ],
    tips: [
      'Search your repo for “Lorem ipsum” before release.',
      'After copy arrives, polish case with Text Case Converter.',
      'Check meta length with Word Counter (spaces matter).',
    ],
    whenToUse: [
      'When layout is ready but copy is not.',
      'When you need repeatable filler length across screenshots.',
      'When QA needs overflow samples without confidential drafts.',
    ],
    relatedTools: [
      { name: 'Word Counter', href: '/word-counter', description: 'Count final copy length' },
      { name: 'AI Text Rewriter', href: '/ai-text-rewriter', description: 'Draft real paragraphs' },
      { name: 'Text Case Converter', href: '/text-case-converter', description: 'Fix title case' },
      { name: 'Meta Tag Previewer', href: '/meta-tag-previewer', description: 'Preview SERP snippets' },
    ],
  },

  '/percentage-calculator': {
    title: 'Percentage Calculator – Increase, Decrease & Of | FYN Tools',
    description:
      'Calculate percentage of a number, percent change, and reverse percentages for discounts, marks, GST sketches, and growth rates — free in your browser.',
    shortIntro:
      'Solve “X% of Y”, percent increase/decrease, and “what percent is A of B” instantly. Handy for discounts, exam scores, and quick finance sketches.',
    keywords:
      'percentage calculator, percent increase calculator, percent of calculator, discount percentage, marks percentage calculator',
    category: 'Calculator Tools',
    howToUse: [
      'Pick the mode: percent of, change, or reverse (A is what % of B).',
      'Enter the values in the labeled fields.',
      'Read the result instantly — adjust inputs to compare scenarios.',
      'Screenshot or note the result for invoices, marksheets, or budgets.',
      'Use GST Calculator when you need tax-inclusive/exclusive Indian GST flows.',
    ],
    useCases: [
      {
        title: 'Store discount check',
        description:
          'A jacket lists ₹2,499 with 18% off — compute the discount amount and payable total before you reach the till (verify POS rounding separately).',
      },
      {
        title: 'Exam marks to percentage',
        description:
          'Scored 67/80 → find percentage for a college form that only accepts %. Cross-check section cutoffs the same way.',
      },
      {
        title: 'Salary hike / price rise',
        description:
          'Old CTC ₹6,00,000 → new ₹6,90,000: calculate percent increase for HR negotiation notes.',
      },
      {
        title: 'Tip or fee sketch',
        description:
          'Find 12% of a ₹3,450 bill for a service fee estimate when the app UI only shows a slider.',
      },
    ],
    examples: [
      {
        input: 'Mode: % of · 18% of 2499',
        output: '449.82 (discount) · Payable ≈ 2049.18 before tax/rounding',
      },
      {
        input: 'Mode: change · old 600000 → new 690000',
        output: 'Increase = 15% ((690000−600000)/600000×100)',
      },
    ],
    faqs: [
      {
        question: 'How do I calculate what percentage A is of B?',
        answer:
          'Compute (A ÷ B) × 100. Example: 25 is what percent of 200? (25 ÷ 200) × 100 = 12.5%.',
      },
      {
        question: 'How is percent increase different from percent of?',
        answer:
          'Percent of answers “X% × amount”. Percent increase answers “how much did it grow relative to the old value”: ((new − old) / old) × 100.',
      },
      {
        question: 'Can I calculate a reverse percentage (find the original)?',
        answer:
          'If you know the final amount after an increase/discount, rearrange algebraically or use the mode that solves for the base. Double-check with a second calculation.',
      },
      {
        question: 'Is this suitable for GST invoices?',
        answer:
          'Use it for quick percent math. For Indian GST line items and tax-inclusive prices, prefer the dedicated GST Calculator so CGST/SGST assumptions stay clear.',
      },
      {
        question: 'Why does my result differ from a spreadsheet by 0.01?',
        answer:
          'Rounding rules differ (banker’s rounding vs truncate). Match the decimal places your finance team requires.',
      },
    ],
    tips: [
      'Write formulas beside results when submitting homework.',
      'Chain calculations carefully — percent-of-percent is not additive.',
      'Pair with Simple Calculator for non-percent arithmetic.',
    ],
    whenToUse: [
      'Discounts, tips, and fee sketches.',
      'Marks and cut-off conversions.',
      'Growth / hike comparisons.',
    ],
    relatedTools: [
      { name: 'Simple Calculator', href: '/simple-calculator', description: 'Basic arithmetic' },
      { name: 'GST Calculator', href: '/gst-calculator', description: 'Indian GST sketches' },
      { name: 'EMI Calculator', href: '/emi-calculator', description: 'Loan EMI estimates' },
      { name: 'Tip / split expenses', href: '/trip-expense-splitter', description: 'Split trip costs' },
    ],
  },

  '/json-validator': {
    title: 'JSON Validator Online – Syntax Check & Format | FYN Tools',
    description:
      'Paste JSON to validate syntax, see clear errors, and beautify indentation. Catch trailing commas and quote issues before you ship an API payload.',
    shortIntro:
      'Validate JSON syntax in your browser, read actionable errors, and copy indented output. Built for API payloads, config files, and homework submissions.',
    keywords:
      'json validator, validate json online, json syntax checker, json lint, format json, json error line number',
    category: 'Developer Tools',
    howToUse: [
      'Paste raw JSON into the editor.',
      'Run Validate / Format.',
      'If invalid, fix the reported issue (comma, quote, bracket).',
      'Copy the beautified JSON when valid.',
      'Re-validate after hand edits before committing.',
    ],
    useCases: [
      {
        title: 'Fix trailing commas from JS habits',
        description:
          'Objects copied from JavaScript often include trailing commas. Validate to pinpoint the line before your CI JSON.parse fails.',
      },
      {
        title: 'Pretty-print minified API responses',
        description:
          'Paste a one-line webhook body, validate, and indent so you can map fields into TypeScript types.',
      },
      {
        title: 'Config file gate before deploy',
        description:
          'Validate firebase.json / VS Code settings / i18n dictionaries so a missing brace never reaches production.',
      },
      {
        title: 'Student lab submission check',
        description:
          'Require students to paste assignment JSON here first — rejects single quotes and unquoted keys that JSON.parse will not accept.',
      },
    ],
    examples: [
      {
        input: '{"name":"Ada","roles":["admin","editor"],}',
        output: 'Invalid — trailing comma after "editor"] · remove comma → validates and formats with indentation',
      },
      {
        input: '{"ok":true,"count":3}',
        output: 'Valid · formatted:\n{\n  "ok": true,\n  "count": 3\n}',
      },
    ],
    faqs: [
      {
        question: 'Why is my JSON invalid when it looks fine in JavaScript?',
        answer:
          'JSON is stricter: double quotes only, no trailing commas, no comments, and no undefined. What runs as a JS object literal may still fail JSON.parse.',
      },
      {
        question: 'Does validation send my JSON to a server?',
        answer:
          'Validation/formatting for this tool is intended to run locally in your browser. Avoid pasting production secrets into shared machines.',
      },
      {
        question: 'Can I validate very large JSON files?',
        answer:
          'Browser memory sets the practical limit. Multi‑MB payloads may feel slow; split files or validate on your machine’s CLI for huge dumps.',
      },
      {
        question: 'What is the difference between JSON Validator and JSON Formatter?',
        answer:
          'Both deal with JSON structure. Use Validator when you care about pass/fail errors; use Formatter when you mainly need indentation. Many workflows use them together.',
      },
      {
        question: 'Does this validate a JSON Schema?',
        answer:
          'This page checks JSON syntax (parseability), not schema constraints like required fields. Add schema checks in your API test suite.',
      },
    ],
    tips: [
      'Fix the first error — later errors are often cascade noise.',
      'Pair with Table to JSON Converter when building fixtures from spreadsheets.',
      'Use Dummy API Generator to practice real response bodies.',
    ],
    whenToUse: [
      'Before committing config JSON.',
      'When an API client throws Unexpected token.',
      'When reviewing webhook payloads in support tickets.',
    ],
    relatedTools: [
      { name: 'JSON Formatter', href: '/json-formatter', description: 'Beautify valid JSON' },
      { name: 'Table to JSON', href: '/table-to-json-converter', description: 'Sheets → JSON' },
      { name: 'Dummy API Generator', href: '/dummy-api-generator', description: 'Sample REST JSON' },
      { name: 'JWT Decoder', href: '/jwt-decoder', description: 'Inspect token payloads' },
    ],
  },

  '/ovulation-calculator': {
    title: 'Ovulation Calculator – Fertile Window Estimate | FYN Tools',
    description:
      'Estimate ovulation day and fertile window from last period date and cycle length. Educational timing aid — not a fertility diagnosis.',
    shortIntro:
      'Enter LMP and average cycle length to estimate ovulation day, fertile window, and a simple chance guide. Use alongside medical advice and ovulation tests.',
    keywords:
      'ovulation calculator, fertile window calculator, ovulation date estimator, conception timing, cycle day ovulation',
    category: 'Period & Cycle Tools',
    howToUse: [
      'Select the start date of your last period.',
      'Enter average cycle length in days.',
      'Optional: note today’s cycle day if the UI supports it.',
      'Review predicted ovulation day and fertile window.',
      'Log results privately; confirm with LH tests when timing matters.',
    ],
    useCases: [
      {
        title: 'TTC timing for a 28-day cycle',
        description:
          'LMP known → see the ~5-day fertile window and peak day so intercourse timing discussions with a partner are calendar-specific (still not a guarantee).',
      },
      {
        title: 'Longer cycle adjustment',
        description:
          'For ~32-day cycles, re-run with the real length so the fertile window is not wrongly centered on day 14 of a 28-day model.',
      },
      {
        title: 'Clinic appointment prep',
        description:
          'Bring a printed fertile-window estimate plus period dates to a fertility consult; clinicians still rely on labs/ultrasound.',
      },
      {
        title: 'Cross-check with Safe Days view',
        description:
          'Open Safe Days Calculator for a full-month risk coloring after you note the ovulation estimate here.',
      },
    ],
    examples: [
      {
        input: 'LMP: 1 Sep 2026 · Cycle length: 28 days',
        output:
          'Estimated ovulation ~ 15 Sep 2026 · Fertile window roughly 10–16 Sep (educational)',
      },
      {
        input: 'LMP: 5 Aug 2026 · Cycle length: 35 days',
        output:
          'Ovulation estimate shifts later than mid-cycle of a 28-day model; window updates accordingly',
      },
    ],
    faqs: [
      {
        question: 'How is ovulation day estimated?',
        answer:
          'Many calculators place ovulation about 14 days before the next period. With a 28-day cycle that is near day 14; longer cycles push the estimate later. Real ovulation can differ.',
      },
      {
        question: 'How long is the fertile window?',
        answer:
          'Sperm can live several days and the egg ~12–24 hours, so fertile days usually span several days before ovulation through about a day after. Exact biology varies.',
      },
      {
        question: 'Can this diagnose infertility?',
        answer:
          'No. It is an educational timing aid. See a clinician for irregular cycles, PCOS concerns, or difficulty conceiving after appropriate trying periods.',
      },
      {
        question: 'Do you store my cycle dates?',
        answer:
          'Estimates run in the browser for this tool. Clear the page on shared devices. For ongoing logs use Period Tracker on-device.',
      },
      {
        question: 'Should I still use ovulation test strips?',
        answer:
          'Yes when timing is important. LH surge detection catches late/early ovulation that calendar math misses.',
      },
    ],
    tips: [
      'Track 3+ cycles for a better personal average length.',
      'Illness and travel can delay ovulation — re-estimate after.',
      'Pair with Conception Date Calculator only for educational timelines.',
    ],
    whenToUse: [
      'When planning conception timing discussions.',
      'When your cycle length is not 28 days.',
      'When preparing dates for a clinician visit.',
    ],
    relatedTools: [
      { name: 'Safe Days Calculator', href: '/safe-days-calculator', description: 'Month risk coloring' },
      { name: 'Period Calculator', href: '/period-calculator', description: 'Next period estimate' },
      { name: 'Conception Date Calculator', href: '/conception-date-calculator', description: 'Educational timelines' },
      { name: 'Period Tracker', href: '/period-tracker', description: 'Log cycles on-device' },
    ],
  },

  '/typing-test': {
    title: 'Typing Test Online – WPM & Accuracy | FYN Tools',
    description:
      'Take a timed typing test for WPM and accuracy. Practice for job screens, exams, and daily speed goals — free in the browser.',
    shortIntro:
      'Start a timed prompt, type naturally, and get Words Per Minute plus accuracy. Use short daily runs to track progress without installing software.',
    keywords:
      'typing test, wpm test online, typing speed test, accuracy typing test, words per minute checker',
    category: 'Typing Tools',
    howToUse: [
      'Choose a duration (e.g. 60 seconds).',
      'Click Start and type the on-screen prompt.',
      'Prefer accuracy — correct rhythm beats frantic bursts.',
      'Read WPM, accuracy %, and error highlights when time ends.',
      'Retake weekly; use Typing Tutor for technique drills between tests.',
    ],
    useCases: [
      {
        title: 'Job application typing screen',
        description:
          'Many clerk/data-entry listings ask for 40–50+ WPM. Take a 60s test, note accuracy, and practice until both metrics clear the posting’s bar.',
      },
      {
        title: 'Student exam readiness',
        description:
          'Before computer-based exams, confirm you can sustain 35+ WPM with ≥95% accuracy so the clock is spent on answers, not hunting keys.',
      },
      {
        title: 'Remote-work ergonomics check',
        description:
          'After changing keyboards or switching to a laptop, re-baseline WPM for a week to see if the new layout costs speed.',
      },
      {
        title: 'Accuracy-first rehab after bad habits',
        description:
          'If you hover near 70 WPM but 85% accuracy, slow to 45 WPM drills until accuracy recovers, then ramp — Tutor/Games help between tests.',
      },
    ],
    examples: [
      {
        input: 'Duration: 60s · English prompt · type until timer ends',
        output: 'Score card: e.g. 52 WPM · 97% accuracy · characters typed + restart CTA',
      },
      {
        input: 'Same prompt retake focusing on zero backspace thrash',
        output: 'Higher accuracy % even if WPM dips slightly — preferred for hiring screens',
      },
    ],
    faqs: [
      {
        question: 'What is a good WPM score?',
        answer:
          'Average sit near the mid-30s to 40 WPM. Many office roles look for ~50+ with high accuracy. Professionals often exceed 70–80 WPM. Accuracy first.',
      },
      {
        question: 'How is WPM calculated?',
        answer:
          'Standard formula treats five characters (including spaces) as one word: (characters / 5) / minutes. That keeps scores comparable across prompts.',
      },
      {
        question: 'Should I fix typos during the test?',
        answer:
          'Follow the tool’s rules for backspace. In real work, correcting matters; in speed tests, excessive thrashing can tank both WPM and accuracy — find a calm rhythm.',
      },
      {
        question: 'Why is my mobile score lower?',
        answer:
          'On-screen keyboards and autocorrect change the task. Prefer a physical keyboard when scores are for job applications.',
      },
      {
        question: 'How often should I retest?',
        answer:
          'Weekly checks are enough for trend lines. Daily grinding on tests alone is less effective than Tutor drills plus one weekly benchmark.',
      },
    ],
    tips: [
      'Warm up 2 minutes before a scored run.',
      'Keep wrists neutral; fatigue destroys accuracy.',
      'Try Typing Competition only after technique is stable.',
    ],
    whenToUse: [
      'Before applying to typing-required roles.',
      'When measuring progress after Tutor lessons.',
      'When validating a new keyboard setup.',
    ],
    relatedTools: [
      { name: 'Typing Tutor', href: '/typing-tutor', description: 'Technique lessons' },
      { name: 'Typing Games', href: '/typing-games', description: 'Practice with games' },
      { name: 'Typing Competition', href: '/typing-competition', description: 'Timed challenges' },
      { name: 'Word Counter', href: '/word-counter', description: 'Count writing output' },
    ],
  },

  '/xml-sitemap-tester': {
    title: 'XML Sitemap Tester & Validator | FYN Tools',
    description:
      'Validate sitemap XML, crawl listed URLs for status/redirects, and spot robots/noindex conflicts. Export issues for SEO fixes before requesting indexing.',
    shortIntro:
      'Upload, paste, or link a sitemap.xml to validate structure and sample-crawl URLs for 404s, redirects, and robots conflicts — then export actionable SEO findings.',
    keywords:
      'xml sitemap tester, sitemap validator, sitemap checker, sitemap 404 finder, sitemapindex tester',
    category: 'Developer Tools',
    howToUse: [
      'Upload sitemap.xml, paste a sitemap URL, or paste raw XML.',
      'Run Analyze to parse URLs and validate structure.',
      'Review health score, broken links, redirects, and blocked URLs.',
      'Filter by status; open the detailed recommendations report.',
      'Export CSV/JSON for tickets, then fix and re-test before GSC validation.',
    ],
    useCases: [
      {
        title: 'GSC “Crawled – not indexed” triage',
        description:
          'After a migration, test the live sitemap to find 404s and redirect chains that waste crawl budget before you click Validate Fix in Search Console.',
      },
      {
        title: 'Sitemapindex rollup check',
        description:
          'Paste a sitemapindex that fans out into post-/product sitemaps; confirm nested files resolve and combined URL counts stay under practical limits.',
      },
      {
        title: 'robots.txt conflict hunt',
        description:
          'Catch URLs listed in the sitemap but Disallow’d in robots.txt — classic reasons Google discovers a URL yet refuses to index it.',
      },
      {
        title: 'Pre-launch QA for 50k URL cap',
        description:
          'Large catalogs near 50,000 URLs / 50MB get warnings here so you can split sitemaps before Google truncates silently.',
      },
    ],
    examples: [
      {
        input: 'Paste https://example.com/sitemap.xml (or upload file)',
        output:
          'Health score + counts: valid 200s, redirects, 404/410, robots-blocked; sample rows with final URL after redirects',
      },
      {
        input: 'Raw sitemap listing /old-page that 301s to /new-page',
        output:
          'Flagged as redirect hygiene issue — update sitemap to the final canonical URL',
      },
    ],
    faqs: [
      {
        question: 'Why test a sitemap if Google already has Search Console?',
        answer:
          'GSC reports outcomes; this tester helps you find concrete URL failures (404, redirect chains, robots blocks) in one pass before you burn crawl/validation cycles.',
      },
      {
        question: 'Does analysis upload my sitemap to FYN forever?',
        answer:
          'Parsing is client-first; URL checks use short-lived requests needed to read status codes. Do not paste sitemaps that expose confidential staging hosts you are not allowed to probe.',
      },
      {
        question: 'What health score should I aim for?',
        answer:
          'Aim for the high 90s: mostly 200s, minimal redirects inside the sitemap, zero robots-blocked URLs, and no soft-404 patterns. Fix critical broken URLs first.',
      },
      {
        question: 'How are soft 404s detected?',
        answer:
          'Some pages return HTTP 200 with “not found” style body copy. The tester flags likely soft 404s so you can remove them from the sitemap or fix the page.',
      },
      {
        question: 'Can I test password-protected staging sitemaps?',
        answer:
          'If the sitemap URL requires auth the public fetch will fail. Export XML locally and upload/paste the file instead.',
      },
    ],
    tips: [
      'Update lastmod only when content truly changes.',
      'Point sitemap entries at canonical URLs, not temporary redirects.',
      'After fixes, re-submit the sitemap in GSC and request indexing on key URLs.',
    ],
    whenToUse: [
      'After migrations or large URL renames.',
      'When GSC shows discovered/crawled-not-indexed spikes.',
      'Before launching a large ecommerce catalog sitemap.',
    ],
    relatedTools: [
      { name: 'Meta Tag Previewer', href: '/meta-tag-previewer', description: 'Check title/description SERP' },
      { name: 'URL Slug Generator', href: '/url-slug-generator', description: 'Clean path segments' },
      { name: 'Robots-friendly URL check', href: '/url-encode-decode', description: 'Encode odd query URLs' },
      { name: 'HTML Formatter', href: '/html-formatter', description: 'Clean markup samples' },
    ],
  },
};
