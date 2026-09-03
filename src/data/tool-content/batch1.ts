/**
 * Phase 1 — Batch 1 hand-tuned SEO overrides.
 * Targets GSC "Crawled – currently not indexed" recovery + top-intent tools.
 * Every claim below is verified against the live tool implementation —
 * no invented features, no fabricated stats.
 */
import type { PremiumPartial } from '@/data/seo-pages/types';

export const batch1ToolSeo: Record<string, PremiumPartial> = {
  /* ---------------------------------------------------------------- */
  /* /url-shortener — PRIMARY FOCUS                                    */
  /* ---------------------------------------------------------------- */
  '/url-shortener': {
    title: 'Free URL Shortener with UTM, Alias & Click Stats',
    h1: 'Free URL Shortener — Custom Aliases, UTM Builder & Analytics',
    metaDescription:
      'Shorten links free with custom aliases, a 5-field UTM builder, password locks, expiry, bulk mode, and click stats. No signup — start shortening now.',
    datePublished: '2024-01-15',
    dateModified: '2026-08-05',
    tldr:
      'Paste a URL, set an optional alias (3–20 characters), attach UTM parameters, add expiry or a password, then get a fyntools.com/s/{code} link plus a QR code. Click totals appear at /s/{code}/stats.',
    processingNote:
      'The destination mapping, alias, UTM string, and optional password hash are stored on FYN Tools servers so the /s/{code} redirect can resolve later. Never shorten a URL whose query string already contains a secret.',
    ioContract: {
      inputs:
        'One https:// URL, or multiple URLs (one per line) in bulk mode; optional alias, 5 UTM fields (source, medium, campaign, term, content), expiry preset or custom date/time, password',
      outputs: 'Short link at fyntools.com/s/{code}, downloadable QR image, click totals at /s/{code}/stats',
      formats: 'http/https input URLs; alias must match /^[a-zA-Z0-9_-]{3,20}$/',
      limits:
        'Alias is rejected if already taken or outside 3–20 alphanumeric/hyphen/underscore characters; expiry presets range from 1 minute to 365 days',
      processing: 'Server-side (mapping, click count, and password check stored on FYN Tools infrastructure)',
    },
    keywords: [
      'url shortener',
      'free url shortener',
      'custom url shortener',
      'utm link builder',
      'short link with password',
      'bulk url shortener',
      'link shortener with qr code',
      'url shortener click tracking',
    ],
    introParagraphs: [
      'Most free shorteners hand you a random six-character code and stop there. FYN Tools’ URL Shortener adds the controls a real campaign needs in one form: a custom alias so the link reads /s/spring-sale instead of /s/x7Kq2, a five-field UTM builder (source, medium, campaign, term, content) that gets appended before the code is created, an optional password gate, and expiry presets from one minute to one year.',
      'The alias field is validated client-side against a strict pattern — 3 to 20 characters, letters, numbers, hyphens, or underscores — so you get instant feedback instead of a server round-trip rejection. Bulk mode accepts one URL per line and returns a result row per line, including per-row errors if a specific alias collides.',
    ],
    overview:
      'A shortened link is a database row: short code → destination URL, plus optional metadata (UTM string, password hash, expiry timestamp, click counter). When a visitor opens /s/{code}, FYN Tools looks up the row, checks expiry and password, increments the click counter, and redirects. Nothing about the destination page changes — the shortener is a lookup layer in front of it.',
    howItWorks:
      'Type or paste your destination URL. If you enable UTM tracking, five inputs (source, medium, campaign, term, content) get serialized into a query string appended to the destination before the short code is generated — so the link you eventually click still carries full attribution. Choose an expiration preset (1 minute up to 365 days) or leave it unset for a permanent link. Enabling the password toggle requires visitors to unlock the redirect before it fires. Submitting the form returns your short URL immediately; the QR icon renders a scannable code from that exact short link.',
    howToUse: [
      'Paste your destination URL into the input field (or switch to bulk mode and paste multiple URLs, one per line).',
      'Optional: type a custom alias (3–20 letters, numbers, hyphens, or underscores) — leave blank for an auto-generated code.',
      'Optional: toggle UTM Tracking and fill in source/medium/campaign (term and content are optional) to preserve attribution through the redirect.',
      'Optional: set an expiration preset (1 minute to 365 days) or a custom date/time, and toggle password protection if the link should require unlocking.',
      'Click Shorten, then copy the fyntools.com/s/{code} link or click the QR icon to download a scannable code.',
      'Open /s/{code}/stats at any time to check click totals for that specific link.',
    ],
    whenToUse: [
      'Campaign links that need UTM attribution preserved through a redirect',
      'Internal or gated links that should require a password before opening',
      'Time-limited promotions where the link must stop resolving after a set date',
      'Bulk campaign rollouts where dozens of landing-page variants each need a short, readable alias',
      'Print, packaging, or QR codes where a long URL cannot be typed reliably',
    ],
    useCases: [
      {
        title: 'Multi-channel campaign tracking',
        description:
          'Create one alias per channel (/s/ig-story, /s/email-blast) with the same destination but different UTM medium values, then compare click counts per /s/{code}/stats page to see which channel performed.',
      },
      {
        title: 'Gated resource sharing',
        description:
          'Enable the password toggle when sharing a pre-release page or internal document link outside your team so only people with the password can reach the destination.',
      },
      {
        title: 'Flash-sale link cleanup',
        description:
          'Set a 24-hour or 7-day expiry preset on a promo link so it stops resolving automatically once the sale ends, instead of manually deleting it later.',
      },
      {
        title: 'Bulk product link rollout',
        description:
          'Paste 10–20 product page URLs into bulk mode at once and get a short link for each row in a single pass, instead of repeating the single-URL form.',
      },
    ],
    examples: [
      {
        input: 'https://example.com/spring-sale?ref=old — alias: spring26, UTM source=newsletter, medium=email',
        output: 'https://fyntools.com/s/spring26 → redirects to destination with ?utm_source=newsletter&utm_medium=email appended',
      },
      {
        input: 'Bulk: 4 product URLs pasted one per line, no alias set',
        output: '4 rows returned, each with an auto-generated short code and its own QR icon',
      },
    ],
    tips: [
      'Fill in UTM fields before clicking Shorten — the parameters are baked into the stored destination, not added after the fact.',
      'Pick an alias that hints at the destination; a 3–20 character readable slug builds more trust than a random code on packaging or slides.',
      'Use the 1-minute or 5-minute expiry presets to test a link privately before switching to a longer or permanent expiry.',
      'Check /s/{code}/stats a day after launch to confirm clicks are registering before you rely on it for a live campaign report.',
    ],
    commonMistakes: [
      'Choosing an alias shorter than 3 characters or with spaces/symbols outside a-z, 0-9, hyphen, underscore — the form will reject it before submission.',
      'Forgetting to enable the UTM toggle, then trying to add tracking parameters to an already-shortened link (the code is fixed to the destination that was submitted).',
      'Setting a short expiry preset (like 1 hour) on a link meant for a week-long campaign.',
      'Sharing a password-protected link without telling recipients a password is required.',
    ],
    advantages: [
      'Custom alias validation happens instantly in the browser, not after a failed submit',
      'Five-field UTM builder writes attribution into the destination before the code is created',
      'Password gate and expiry presets run in the same form as basic shortening — no upsell tier',
      'Bulk mode handles multiple rows without a spreadsheet upload',
      'QR download uses the exact short link, so scanning and typing produce the same redirect',
    ],
    benefits: [
      'Keep campaign attribution intact through a redirect instead of losing UTM data at the click.',
      'Retire expired promotions automatically instead of manually removing old links.',
      'Share sensitive destinations behind a password without standing up separate access control.',
      'Process a batch of campaign URLs in one form submission instead of one at a time.',
    ],
    faqs: [
      {
        question: 'Does the URL shortener support custom aliases?',
        answer:
          'Yes. Type any alias from 3 to 20 characters using letters, numbers, hyphens, or underscores. If the alias is already taken, the form tells you before submission so you can pick another.',
      },
      {
        question: 'How does the UTM builder work?',
        answer:
          'Toggle UTM Tracking and fill in source, medium, and campaign (term and content are optional). These values are appended as query parameters to your destination URL before the short code is generated, so the final redirect still carries full attribution.',
      },
      {
        question: 'Can I password-protect a short link?',
        answer:
          'Yes. Enable the password toggle and set a password. Visitors must enter it before the redirect to your destination fires.',
      },
      {
        question: 'Do short links expire?',
        answer:
          'Only if you set an expiry. Presets range from 1 minute to 365 days, or you can pick a custom date and time. Leave expiration unset for a permanent link.',
      },
      {
        question: 'Can I shorten multiple URLs at once?',
        answer:
          'Yes. Switch to bulk mode and paste one URL per line. Each line returns its own short code and result row, including an error message if that row’s alias was taken.',
      },
      {
        question: 'How do I check how many clicks a link received?',
        answer:
          'Open fyntools.com/s/{code}/stats, replacing {code} with your short code, to see click totals for that specific link.',
      },
      {
        question: 'Is the URL shortener free to use?',
        answer:
          'Yes, creating and managing short links (including aliases, UTM tracking, expiry, and password protection) is free with no account required for normal use.',
      },
      {
        question: 'What happens if I try to shorten an already-shortened link?',
        answer:
          'The tool will store whatever URL you submit as the destination, including another shortener’s link. This adds an extra redirect hop, so it is better to shorten the original destination URL directly.',
      },
    ],
    relatedTools: [
      { name: 'QR Code Generator', href: '/qr-code-generator', description: 'Create standalone QR codes with logos and custom colors' },
      { name: 'Barcode Generator', href: '/barcode-generator', description: 'Print-ready 1D barcodes for offline campaign materials' },
      { name: 'URL Slug Generator', href: '/url-slug-generator', description: 'Build clean path segments for your own site URLs' },
      { name: 'URL Encode / Decode', href: '/url-encode-decode', description: 'Fix query strings before shortening' },
      { name: 'Social Deep Link Generator', href: '/social-media-deep-link-generator', description: 'App-aware links with web fallback' },
      { name: 'Meta Tag Previewer', href: '/meta-tag-previewer', description: 'Preview how your link looks when shared' },
      { name: 'Hashtag Generator', href: '/hashtag-generator', description: 'Pair short links with campaign hashtags' },
      { name: 'Word Counter', href: '/word-counter', description: 'Check character counts for social captions' },
      { name: 'JSON Formatter', href: '/json-formatter', description: 'Validate API payloads for campaign tooling' },
      { name: 'Password Generator', href: '/password-generator', description: 'Generate a password for your locked short link' },
    ],
    conclusion:
      'The free URL Shortener above combines custom aliases, a full UTM builder, password locks, expiry presets, and bulk mode in one form — verify the feature set in the panel, then use /s/{code}/stats to track results after you share.',
    deepParagraphs: [
      'Technically, alias validation runs client-side against a fixed pattern (3–20 characters: letters, digits, hyphen, underscore) before the request reaches the server, which is why invalid aliases are rejected instantly rather than after a round trip. UTM parameters are not stored separately — they are serialized into the destination URL at creation time, so the redirect target itself already contains full attribution.',
    ],
  },

  /* ---------------------------------------------------------------- */
  /* /barcode-generator — PRIMARY FOCUS                                */
  /* ---------------------------------------------------------------- */
  '/barcode-generator': {
    title: 'Free Barcode Generator — Code128, EAN, UPC & More',
    h1: 'Barcode Generator — Code128, EAN-13, UPC-A & 12 More Formats',
    metaDescription:
      'Generate print-ready 1D barcodes free: Code128, EAN-13/8, UPC-A/E, Code39, ITF-14, GS1-128, and more. Bulk mode, label sheets, PNG export.',
    datePublished: '2025-03-10',
    dateModified: '2026-08-05',
    tldr:
      'Choose a barcode symbology (Code128, EAN-13, UPC-A, Code39, ITF-14, and 12 more), paste single or bulk values, adjust height/module width/color, then export as PNG or print onto label sheets — all in your browser.',
    processingNote:
      'Barcode rendering happens in your browser via canvas — values you type are not uploaded anywhere. Only use this generator for 1D linear codes; for QR or Data Matrix, use the QR Code Generator instead.',
    ioContract: {
      inputs: 'Single value or multi-line bulk list; barcode style/symbology; module width, height, color, and text visibility settings',
      outputs: 'Rendered barcode images (PNG), optional multi-page print layout sized to A4, Letter, 4×6in label, A5, or a custom paper size',
      formats:
        'Code128, EAN-13, EAN-8, UPC-A, UPC-E, ISBN, Code39, Code39 Extended, Code93, Code25, Codabar, MSI, Code11, Plessey, Interleaved 2 of 5, ITF-14, GS1-128, EAN-14',
      limits:
        'Numeric-only symbologies (EAN, UPC, ITF-14, Code25, MSI, Plessey) reject non-digit input; export is PNG raster, not vector SVG/PDF',
      processing: 'Client-side (browser canvas rendering)',
    },
    keywords: [
      'barcode generator',
      'code 128 generator',
      'ean-13 barcode generator',
      'upc barcode generator',
      'free barcode maker',
      'bulk barcode generator',
      'barcode label printing',
      'itf-14 barcode',
    ],
    introParagraphs: [
      'This generator covers 17 linear (1D) barcode symbologies grouped into four practical sets: label-style Code128 presets (standard, tall, compact, mini, wide, dense, bars-only) for general printing; retail formats (Code128, EAN-13, EAN-8, UPC-A, UPC-E, ISBN) for shelf-ready products; industrial codes (Code39, Code39 Extended, Code93, Code25, Codabar, MSI, Code11, Plessey) for asset tags; and logistics formats (Interleaved 2 of 5, ITF-14, GS1-128, EAN-14) for cartons and supply-chain labels.',
      'Numeric-only symbologies like EAN-13 and UPC-A validate that your input is digits before rendering, since a non-numeric value there is invalid according to the standard, not just a display issue. Bulk mode accepts a full list of values and the print-layout planner then calculates how many rows and columns fit your selected paper size — A4, Letter, a 4×6in label sheet, A5, or a custom size you enter in millimeters.',
    ],
    overview:
      'A 1D barcode encodes data as a pattern of parallel bars and spaces of varying widths, decoded by scanning a beam across them. Different symbologies (Code128, EAN, UPC, Code39, etc.) use different encoding rules and checksum logic, which is why a scanner needs to know or auto-detect the symbology before it can read the code. This tool renders each symbology client-side using the bwip-js barcode library, so the same input can look different depending on the style you pick — for example the label-look presets keep the same Code128 encoding but change height, module width, and whether the human-readable text prints underneath.',
    howItWorks:
      'Pick a style from the four groups (label looks, retail, industrial, logistics) — this sets the symbology and default rendering options. Type a single value, or switch to bulk and paste a list (one value per line). Adjust module width, height, color, and whether readable text shows under the bars. If you plan to print, choose a paper preset (or enter custom width/height in mm) and a label-sheet preset; the layout planner shows how many barcodes fit per page and across how many pages. Generate to render each value onto canvas, then download individually or use Download All / Print for the full batch.',
    howToUse: [
      'Pick a barcode style from Label Looks, Retail, Industrial, or Logistics — this sets the symbology (e.g., EAN-13, Code39, ITF-14).',
      'Type a single value, or paste a multi-line list into bulk mode (one code per line).',
      'For numeric symbologies like EAN-13 or UPC-A, confirm your values are digits only — the tool will flag non-numeric entries.',
      'Adjust module width, bar height, color, and whether to show human-readable text under the bars.',
      'If printing, choose a paper preset (A4, Letter, 4×6in label, A5, or custom mm) and a label-sheet preset to see the calculated layout.',
      'Click Generate, then download each barcode as PNG or use Download All / Print for the full batch.',
    ],
    whenToUse: [
      'Retail products needing EAN-13, EAN-8, UPC-A, or UPC-E codes for shelf scanning',
      'Warehouse or asset tags using Code39, Code93, or MSI for internal tracking',
      'Shipping cartons requiring ITF-14, EAN-14, or GS1-128 for supply-chain scanning',
      'Small businesses printing their own product labels without buying barcode software',
      'Bulk label runs where dozens of SKUs each need a unique code printed to a label sheet',
    ],
    useCases: [
      {
        title: 'Small retail product launch',
        description:
          'Generate EAN-13 codes for each new SKU, verify the numeric input matches your assigned GTIN, and print directly onto a label-sheet layout sized for your printer.',
      },
      {
        title: 'Warehouse asset tagging',
        description:
          'Use Code39 or Code93 for internal bin and shelf labels where you control both the printer and the scanner, and readable-text formatting is more useful than strict retail compliance.',
      },
      {
        title: 'Carton and pallet labeling',
        description:
          'Generate ITF-14 or GS1-128 codes for shipping cartons, using the taller label-look presets so codes remain scannable from a forklift-mounted reader.',
      },
      {
        title: 'Bulk SKU batch printing',
        description:
          'Paste 20+ product codes into bulk mode, pick a 4×6in label sheet preset, and use the print-layout planner to see exactly how many sheets the batch will require before printing.',
      },
    ],
    examples: [
      {
        input: 'Style: EAN-13 · Value: 5901234123457',
        output: 'Rendered EAN-13 barcode with check digit encoded, human-readable digits under the bars',
      },
      {
        input: 'Bulk: 6 Code128 SKU values · Label sheet: 4×6in',
        output: 'Print layout calculated with rows/columns per sheet and total page count for the batch',
      },
    ],
    tips: [
      'Match the symbology to what your scanner or retailer requires — EAN-13 and UPC-A are standard for retail, Code128 is a safe general-purpose default.',
      'For numeric-only formats, double-check leading zeros are preserved; some spreadsheet exports strip them.',
      'Use the Bars Only preset when you need the barcode without a printed number underneath, e.g., for a design overlay.',
      'Test-print one label at actual size before running a full batch to confirm bar width holds up at your printer’s resolution.',
    ],
    commonMistakes: [
      'Entering non-numeric characters into EAN/UPC fields — these symbologies are digit-only by standard.',
      'Choosing a module width too thin for your printer’s DPI, producing bars that blur together when scanned.',
      'Skipping the print-layout preview and discovering the wrong number of labels fit per sheet only after printing.',
      'Using GS1-128 without understanding application identifiers — the format assumes structured data, not a plain SKU string.',
    ],
    advantages: [
      '17 symbologies covering retail, industrial, and logistics use cases in one tool',
      'Client-side rendering — values never leave your browser',
      'Bulk mode plus a print-layout planner sized to real paper and label-sheet presets',
      'Numeric validation catches invalid EAN/UPC input before you print a code that will not scan',
      'Free with no signup for standard use',
    ],
    benefits: [
      'Print compliant retail barcodes without buying dedicated barcode software.',
      'Catch invalid numeric input before wasting label stock on a barcode that will not scan.',
      'Plan exact sheet counts for a bulk batch before committing to print.',
      'Keep proprietary SKU data off third-party servers since generation runs locally.',
    ],
    faqs: [
      {
        question: 'Which barcode formats does this tool support?',
        answer:
          'Seventeen linear (1D) symbologies: Code128 (in several visual presets), EAN-13, EAN-8, UPC-A, UPC-E, ISBN, Code39, Code39 Extended, Code93, Code25, Codabar, MSI, Code11, Plessey, Interleaved 2 of 5, ITF-14, GS1-128, and EAN-14.',
      },
      {
        question: 'Can I generate QR codes here too?',
        answer:
          'No — this tool is dedicated to 1D linear barcodes. Use the QR Code Generator for 2D QR codes, which supports logos, colors, and multiple data types.',
      },
      {
        question: 'Why does EAN-13 or UPC-A reject my input?',
        answer:
          'These symbologies are numeric-only by standard. If your value contains letters or symbols, the barcode is invalid and the tool will flag it before rendering.',
      },
      {
        question: 'Can I generate multiple barcodes at once?',
        answer:
          'Yes. Switch to bulk mode and paste one value per line. Each line generates its own barcode, and Download All exports the full batch.',
      },
      {
        question: 'Does the tool print directly onto label sheets?',
        answer:
          'It calculates a print layout for your chosen paper size (A4, Letter, 4×6in label, A5, or custom) and label-sheet preset, showing rows, columns, and total pages, then uses your browser’s print function to output the batch.',
      },
      {
        question: 'What file format do barcodes download as?',
        answer:
          'PNG raster images rendered from canvas. Vector formats like SVG or PDF are not currently supported for export.',
      },
      {
        question: 'Is my barcode data uploaded to a server?',
        answer:
          'No. Barcode rendering runs entirely in your browser using canvas — values you type are not sent to FYN Tools servers.',
      },
    ],
    relatedTools: [
      { name: 'QR Code Generator', href: '/qr-code-generator', description: '2D codes with logos, colors, and multiple data types' },
      { name: 'URL Shortener', href: '/url-shortener', description: 'Shorten a URL before encoding it into a QR code' },
      { name: 'Placeholder Image Generator', href: '/placeholder-image-generator', description: 'Mockup images for packaging design' },
      { name: 'Image Resizer', href: '/image-resizer', description: 'Resize label artwork before printing' },
      { name: 'Image Format Converter', href: '/image-format-converter', description: 'Convert exported PNGs to other formats' },
      { name: 'SVG Optimizer', href: '/svg-optimizer', description: 'Clean up vector packaging artwork' },
      { name: 'Invoice Generator', href: '/invoice-generator', description: 'Add SKU barcodes to printed invoices' },
      { name: 'Color Picker Tool', href: '/color-picker-tool', description: 'Match barcode color to brand guidelines' },
    ],
    conclusion:
      'Pick a symbology that matches your use case — EAN/UPC for retail shelves, Code39/Code93 for internal assets, ITF-14/GS1-128 for cartons — then use bulk mode and the print-layout planner above to go from a list of values to a printed sheet.',
  },

  /* ---------------------------------------------------------------- */
  /* /json-formatter — enhanced FAQ + trust signals                    */
  /* ---------------------------------------------------------------- */
  '/json-formatter': {
    title: 'Free JSON Formatter, Validator & Beautifier Online',
    h1: 'JSON Formatter, Validator & Beautifier',
    metaDescription:
      'Format, validate, beautify, and minify JSON free in your browser. Instant syntax error detection with no signup. Paste, fix, and copy in seconds.',
    datePublished: '2024-01-15',
    dateModified: '2026-08-05',
    tldr:
      'Paste JSON into the editor, then beautify (indent), validate (check syntax), or minify (compress) it entirely in your browser. Invalid JSON returns an error instead of silently mangling your data.',
    processingNote:
      'JSON parsing, formatting, and validation run in your browser via the native JSON parser. Nothing you paste is sent to a server for this tool’s core transforms — avoid pasting production secrets regardless.',
    ioContract: {
      inputs: 'JSON text pasted or typed into the editor (objects, arrays, strings, numbers, booleans, null)',
      outputs: 'Indented (beautified), minified, or validated JSON with a syntax error message and position when invalid',
      formats: 'Standard JSON per RFC 8259 — double-quoted keys, no comments, no trailing commas',
      limits: 'Very large documents (multi-MB) may slow down in-browser parsing depending on device memory',
      processing: 'Client-side (browser JSON parser)',
    },
    keywords: [
      'json formatter',
      'json validator',
      'json beautifier',
      'minify json online',
      'pretty print json',
      'format json online free',
      'json syntax checker',
    ],
    introParagraphs: [
      'JSON looks simple until a missing comma or a stray trailing comma breaks a parser three files away from where you are looking. This formatter runs the browser’s native JSON parser against your input, so beautify, validate, and minify all rely on the same strict rules your production code will enforce — not a lenient approximation.',
      'Beautify only changes whitespace and indentation; it never reorders keys or changes values. Validate reports whether the text parses at all, and where it fails. Minify strips all non-essential whitespace for the smallest possible payload, which matters when every byte counts in a mobile API response or a CDN-cached config file.',
    ],
    overview:
      'JSON (JavaScript Object Notation) is a strict text format: object keys must be double-quoted strings, values are strings/numbers/booleans/null/objects/arrays, and neither comments nor trailing commas are legal. A formatter does not interpret meaning — it only changes whitespace for readability (beautify) or removes it for size (minify). A validator runs a full parse and reports the first point of failure, which is usually enough to locate a broken bracket, an unquoted key, or a stray comma.',
    howItWorks:
      'Paste or type JSON into the editor. Format/Beautify re-serializes the parsed structure with two-space indentation. Minify re-serializes it with no extra whitespace. Validate attempts the same parse and, on failure, surfaces the parser’s error message so you know what broke and roughly where.',
    howToUse: [
      'Paste your JSON — an API response, config file, or webhook payload — into the editor above.',
      'Click Format / Beautify to indent nested objects and arrays for readability.',
      'Click Validate if you only need a pass/fail check without changing formatting.',
      'Click Minify when you need the smallest possible payload for production or transport.',
      'Copy the result with the copy button and paste it into your editor, ticket, or API client.',
    ],
    whenToUse: [
      'Debugging an API response or webhook payload that arrived as one unreadable line',
      'Reviewing a config file diff where indentation makes structural changes visible',
      'Preparing a compact JSON payload for a production request or CDN cache',
      'Verifying a customer-submitted JSON snippet before assuming your own code has a bug',
    ],
    useCases: [
      {
        title: 'API response debugging',
        description: 'Paste a raw response from DevTools or Postman, beautify it to find the nested field you need, then minify again for a clean cURL example.',
      },
      {
        title: 'Pull request review',
        description: 'Beautify a minified fixture file so reviewers can read the diff without horizontal scrolling through a single line.',
      },
      {
        title: 'Support ticket triage',
        description: 'Validate customer-provided JSON before assuming your parser has a bug — trailing commas and single quotes are common causes of "broken" JSON.',
      },
    ],
    examples: [
      {
        input: '{"name":"FYN","active":true,"count":3}',
        output: '{\n  "name": "FYN",\n  "active": true,\n  "count": 3\n}',
      },
      {
        input: '{name:"bad", "trailing":true,}',
        output: 'Validation error — unquoted key "name" and a trailing comma after "trailing":true',
      },
    ],
    tips: [
      'JSON does not allow comments or trailing commas — strip both before validating if you copied from JavaScript source.',
      'Keep beautified JSON in your repository for readability; minify only at the point of transport.',
      'Pair with the JWT Decoder when the JSON you need to read is base64-encoded inside a token.',
    ],
    commonMistakes: [
      'Using single quotes around strings — JavaScript object literals allow this, JSON does not.',
      'Leaving a trailing comma after the last property in an object or array.',
      'Minifying first, then trying to debug the compressed result instead of beautifying to find the error.',
    ],
    advantages: [
      'Beautify, validate, and minify in one panel with no tab-switching',
      'Uses the browser’s native strict JSON parser, matching production behavior',
      'No signup required for everyday debugging',
      'Works identically on mobile and desktop browsers',
    ],
    benefits: [
      'Catch syntax errors before they reach production instead of after a failed deploy.',
      'Share readable JSON in tickets and pull requests instead of a single unreadable line.',
      'Ship smaller payloads when minified size affects load time or CDN cost.',
    ],
    features: [
      'Pretty-print / beautify with 2-space indentation',
      'Strict syntax validation with error reporting',
      'Minify for production-sized payloads',
      'Runs fully in-browser — no install, no account',
    ],
    faqs: [
      {
        question: 'Is this JSON formatter free to use?',
        answer: 'Yes. Formatting, validating, and minifying JSON on FYN Tools is free with no account required.',
      },
      {
        question: 'Does beautifying change my data values?',
        answer: 'No. Beautify only changes whitespace and indentation for readability — object keys and values stay exactly the same.',
      },
      {
        question: 'When should I minify instead of beautify?',
        answer: 'Minify for production APIs, CDN-cached configs, and anywhere transfer size matters. Keep a beautified copy in your repository for debugging and code review.',
      },
      {
        question: 'Why does the validator say my JSON is invalid?',
        answer: 'The most common causes are single quotes instead of double quotes, trailing commas, unquoted object keys, or comments — none of which are legal in standard JSON.',
      },
      {
        question: 'Can I format very large JSON files?',
        answer: 'Yes, though multi-megabyte documents may parse more slowly depending on your device, since processing happens entirely in your browser.',
      },
      {
        question: 'Is my JSON data uploaded anywhere?',
        answer: 'No. Formatting, validating, and minifying all run locally using your browser’s built-in JSON parser.',
      },
      {
        question: 'Can this tool fix broken JSON automatically?',
        answer: 'It identifies where the syntax breaks so you can fix it, but it does not guess your intent and silently rewrite invalid JSON into valid JSON.',
      },
    ],
    relatedTools: [
      { name: 'HTML Formatter', href: '/html-formatter', description: 'Beautify HTML markup with proper indentation' },
      { name: 'JavaScript Minifier', href: '/javascript-minifier', description: 'Compress JS for production' },
      { name: 'CSS Minifier', href: '/css-minifier', description: 'Compress stylesheets' },
      { name: 'Base64 Converter', href: '/base64-converter', description: 'Encode payloads for transport' },
      { name: 'JWT Decoder', href: '/jwt-decoder', description: 'Inspect JSON inside a decoded token' },
      { name: 'JSON Validator', href: '/json-validator', description: 'Focused syntax validation checks' },
      { name: 'Regex Tester', href: '/regex-tester', description: 'Test patterns against sample strings' },
      { name: 'Dummy API Generator', href: '/dummy-api-generator', description: 'Mock JSON responses for client testing' },
      { name: 'Table to JSON Converter', href: '/table-to-json-converter', description: 'Turn tables into JSON arrays' },
      { name: 'URL Encode / Decode', href: '/url-encode-decode', description: 'Encode query string values safely' },
    ],
    conclusion:
      'Use the panel above to beautify, validate, or minify JSON in one pass, using the same strict parser your production code relies on — then follow the related developer tools when your workflow moves to HTML, JS, or tokens.',
  },

  /* ---------------------------------------------------------------- */
  /* /word-counter                                                     */
  /* ---------------------------------------------------------------- */
  '/word-counter': {
    title: 'Free Word Counter — Words, Characters & Sentences',
    h1: 'Word Counter — Words, Characters, Sentences & Paragraphs',
    metaDescription:
      'Count words, characters (with and without spaces), sentences, and paragraphs instantly. Free, private, and updates live as you type — no signup.',
    datePublished: '2024-02-01',
    dateModified: '2026-08-05',
    tldr:
      'Type or paste text into the box and get live counts for words, characters (with and without spaces), sentences, and paragraphs — recalculated on every keystroke, entirely in your browser.',
    processingNote:
      'All counting happens in your browser as you type. Text is never sent to a server, so you can safely paste drafts before they are ready to share.',
    ioContract: {
      inputs: 'Any text pasted or typed into the textarea',
      outputs: 'Live word count, character count, character count excluding spaces, sentence count, and paragraph count',
      formats: 'Plain text; sentences are split on ./!/? and paragraphs on line breaks',
      limits: 'Sentence count is a simple punctuation split, so abbreviations like "Dr." may be counted as a sentence break',
      processing: 'Client-side (browser)',
    },
    keywords: [
      'word counter',
      'character counter',
      'free word count tool',
      'count words online',
      'sentence counter',
      'paragraph counter',
    ],
    introParagraphs: [
      'Word Counter recalculates five metrics on every keystroke: word count (splitting on whitespace), character count including spaces, character count excluding spaces, sentence count (splitting on periods, exclamation points, and question marks), and paragraph count (splitting on line breaks). There is no submit button and no delay — the numbers update as you type or paste.',
      'Because everything runs client-side, you can paste an early draft, a password-protected document excerpt, or client-confidential copy without it leaving your browser tab. A copy button lets you grab the text back out once you are done checking length.',
    ],
    overview:
      'Word counting sounds trivial but has edge cases: multiple spaces between words, empty lines, and punctuation-only input all need consistent handling so the number on screen matches what a reader would intuitively count. This tool trims the input, splits on whitespace runs for words, and filters out empty fragments for sentence and paragraph counts so blank lines or extra spaces do not inflate the numbers.',
    howToUse: [
      'Paste or type your text into the textarea.',
      'Watch the four count cards (words, characters, characters without spaces, sentences) update live as you type.',
      'Scroll to the paragraph count if you need to check structure for a formatting requirement.',
      'Click Copy Text if you want to grab your text back out after editing it in this box.',
    ],
    whenToUse: [
      'Checking a title or meta description against a strict character limit before publishing',
      'Confirming an essay, cover letter, or application answer meets a minimum or maximum word count',
      'Verifying social media captions stay within a platform’s character limit',
      'Quick sanity checks on paragraph structure before pasting text into a CMS',
    ],
    useCases: [
      {
        title: 'Meta description length checks',
        description: 'Paste a draft meta description and watch the character count to keep it within a typical 140–160 character target before publishing.',
      },
      {
        title: 'Academic word count requirements',
        description: 'Paste an essay draft to confirm it meets a required word count range before submission, without opening a full word processor.',
      },
      {
        title: 'Social caption limits',
        description: 'Check character count against a platform’s limit before posting, especially when a caption includes hashtags that eat into the total.',
      },
    ],
    examples: [
      {
        input: '"Ship the landing page copy by Friday."',
        output: 'Words: 6 · Characters: 38 · Characters (no spaces): 33 · Sentences: 1',
      },
      {
        input: 'A two-paragraph draft pasted from a document',
        output: 'Word, character, sentence, and paragraph counts all update immediately without a page reload',
      },
    ],
    tips: [
      'If your sentence count looks too high, check for abbreviations like "Dr." or "e.g." — these are counted as sentence breaks since the split is punctuation-based.',
      'Paste text with your intended line breaks preserved if you need an accurate paragraph count.',
      'Use the copy button to grab your text back out rather than manually selecting from the textarea.',
    ],
    commonMistakes: [
      'Assuming sentence count is grammatically aware — it is a simple split on ./!/? and does not understand abbreviations.',
      'Pasting text with extra blank lines and expecting the paragraph count to ignore them automatically without checking.',
      'Comparing character counts across tools that may or may not include trailing whitespace differently.',
    ],
    advantages: [
      'Five live metrics with zero submit delay',
      'Runs entirely client-side — safe for unpublished drafts',
      'No account, no limits on how many times you re-check text',
      'Simple, distraction-free interface with a one-click copy button',
    ],
    benefits: [
      'Catch a meta description or title that runs over a search engine’s display limit before you publish it.',
      'Confirm application or essay answers meet word count requirements without opening a separate document.',
      'Keep drafts private since nothing is transmitted while you check length.',
    ],
    features: [
      'Live word count',
      'Character count with and without spaces',
      'Sentence count',
      'Paragraph count',
      'One-click copy of your text',
    ],
    faqs: [
      {
        question: 'Does the word counter update automatically as I type?',
        answer: 'Yes. All five metrics — words, characters, characters without spaces, sentences, and paragraphs — recalculate on every keystroke with no submit button.',
      },
      {
        question: 'How is a word counted?',
        answer: 'Text is trimmed and split on whitespace; each resulting non-empty chunk counts as one word.',
      },
      {
        question: 'How is a sentence counted?',
        answer: 'The text is split on periods, exclamation points, and question marks, and empty fragments are filtered out. Abbreviations like "Dr." can be counted as a sentence break since this is a punctuation-based split, not a grammar-aware one.',
      },
      {
        question: 'Is my text uploaded anywhere?',
        answer: 'No. Counting happens entirely in your browser — nothing you type or paste is sent to a server.',
      },
      {
        question: 'Can I use this to check a title or meta description length?',
        answer: 'Yes, the character count (with spaces) updates live, which is useful for checking against typical SEO title and meta description length targets.',
      },
      {
        question: 'Is there a limit on how much text I can paste?',
        answer: 'There is no artificial limit, though extremely long documents are bound by your browser’s memory and may feel less responsive.',
      },
    ],
    relatedTools: [
      { name: 'Text Case Converter', href: '/text-case-converter', description: 'Switch between upper, lower, and title case' },
      { name: 'Whitespace Remover', href: '/whitespace-remover', description: 'Clean up extra spaces and blank lines' },
      { name: 'Duplicate Line Remover', href: '/duplicate-line-remover', description: 'Strip repeated lines from pasted text' },
      { name: 'Text Reverser', href: '/text-reverser', description: 'Reverse characters, words, or lines' },
      { name: 'AI Text Rewriter', href: '/ai-text-rewriter', description: 'Rewrite copy in a different style' },
      { name: 'Lorem Ipsum Generator', href: '/lorem-ipsum-generator', description: 'Generate placeholder text for layouts' },
      { name: 'Meta Tag Previewer', href: '/meta-tag-previewer', description: 'Preview how titles and descriptions render' },
      { name: 'URL Slug Generator', href: '/url-slug-generator', description: 'Turn a title into a clean URL slug' },
    ],
    conclusion:
      'Paste your text above to get live word, character, sentence, and paragraph counts with nothing leaving your browser — then jump to related text tools when your next step is formatting, case conversion, or rewriting.',
  },

  /* ---------------------------------------------------------------- */
  /* /qr-code-generator                                                */
  /* ---------------------------------------------------------------- */
  '/qr-code-generator': {
    title: 'Free QR Code Generator with Logo & Custom Colors',
    h1: 'QR Code Generator — Custom Colors, Logo & 9 Data Types',
    metaDescription:
      'Create QR codes free for URLs, WhatsApp, phone, SMS, email, Instagram, Facebook, X, or YouTube. Add a logo, set colors, and download as PNG instantly.',
    datePublished: '2024-02-10',
    dateModified: '2026-08-05',
    tldr:
      'Pick a data type (URL, WhatsApp, phone, SMS, email, Instagram, Facebook, X, or YouTube), fill in the fields, customize foreground/background color and an optional logo overlay, then download the PNG — all rendered in your browser.',
    processingNote:
      'QR generation and rendering happen in your browser using canvas. Your logo upload is read locally to draw onto the code and is not sent to a server for the QR image export.',
    ioContract: {
      inputs: 'Text/URL, or structured fields for WhatsApp, Instagram, Facebook, YouTube, X, SMS, phone, or email; foreground/background color; optional logo image (up to 1MB)',
      outputs: 'Downloadable PNG QR code at your chosen size (default 256px), with optional centered logo overlay',
      formats: 'PNG export via canvas.toDataURL',
      limits: 'Logo uploads over 1MB are rejected; export can fail if an external (cross-origin) logo taints the canvas',
      processing: 'Client-side (browser canvas rendering)',
    },
    keywords: [
      'qr code generator',
      'free qr code generator',
      'qr code with logo',
      'custom qr code',
      'whatsapp qr code generator',
      'qr code generator online',
    ],
    introParagraphs: [
      'This generator supports nine data types beyond plain text: WhatsApp (pre-filled chat link), Instagram, Facebook, YouTube, and X profile links, plus SMS, phone call, and email QR codes that open the matching app directly when scanned. Each type shows only the fields it needs — for example, phone shows a country code selector and number field, while email shows recipient, subject, and message.',
      'Customization runs deeper than most free generators: set foreground and background colors independently, upload a logo (up to 1MB) that renders centered over the code, add a background image, and adjust the overall size before export. The canvas-based renderer draws everything into an offscreen canvas at export time so the downloaded PNG matches the live preview exactly.',
    ],
    overview:
      'A QR code is a 2D matrix barcode that encodes data as a grid of black and white modules, readable by any modern phone camera. Unlike 1D barcodes, QR codes can hold structured data — a phone number, an SMS with pre-filled text, or a WhatsApp link that opens a chat with a specific message ready to send. Error correction built into the QR standard means a code can still scan even if part of it is obscured by a logo, which is why adding a centered logo does not usually break scannability at moderate sizes.',
    howItWorks:
      'Choose a data type from the type selector — this determines which input fields appear. Fill them in (a URL for Text/URL, a message and number for WhatsApp, etc.), and the tool builds the correctly formatted string behind the scenes (for example, a WhatsApp deep link or an `mailto:` URI). Set foreground/background colors, upload a logo if desired, and adjust the size slider. Clicking download renders everything to an offscreen canvas and exports a PNG.',
    howToUse: [
      'Select a data type: Text/URL, WhatsApp, Instagram, Facebook, YouTube, X, SMS, Phone Call, or Email.',
      'Fill in the fields shown for that type (for example, phone number and country code for a call QR).',
      'Optional: set a foreground and background color to match your brand.',
      'Optional: upload a logo image (under 1MB) to overlay at the center of the code.',
      'Adjust the size slider if you need a specific pixel dimension.',
      'Click download to export the QR code as a PNG.',
    ],
    whenToUse: [
      'Sharing a WhatsApp contact or pre-filled message on print materials or business cards',
      'Linking directly to a social profile (Instagram, Facebook, YouTube, X) from packaging or posters',
      'Adding a scan-to-call or scan-to-email option on flyers or signage',
      'Branded QR codes on marketing materials where a logo overlay reinforces recognition',
    ],
    useCases: [
      {
        title: 'Business card WhatsApp contact',
        description: 'Generate a WhatsApp QR pre-filled with a greeting message so a scan opens a chat ready to send, instead of requiring the recipient to save a number manually.',
      },
      {
        title: 'Branded event signage',
        description: 'Set foreground/background colors to match event branding and overlay a logo so the QR code doubles as a recognizable brand element, not just a scan target.',
      },
      {
        title: 'Product packaging social links',
        description: 'Link directly to an Instagram or YouTube profile from packaging so customers can follow without typing a handle.',
      },
    ],
    examples: [
      {
        input: 'Type: Phone Call · +1 5551234567',
        output: 'QR code that opens the phone dialer with the number pre-filled when scanned',
      },
      {
        input: 'Type: WhatsApp · Number + message "Hi, I found you via QR!"',
        output: 'QR code that opens WhatsApp with a chat pre-filled with that exact message',
      },
    ],
    tips: [
      'Keep logo size modest relative to the code — very large overlays can reduce scan reliability even with error correction.',
      'Test print-sized QR codes with an actual phone camera before mass printing, especially with custom colors.',
      'Use a same-origin or locally uploaded logo; externally hosted images can taint the canvas and block PNG export.',
      'High-contrast foreground/background combinations scan more reliably than close color values.',
    ],
    commonMistakes: [
      'Choosing foreground and background colors with too little contrast, which can prevent scanners from reading the code.',
      'Uploading a logo over 1MB and having the upload rejected without realizing the size limit.',
      'Using an external image URL as a background/logo and then hitting an export error from canvas tainting.',
      'Forgetting that WhatsApp and phone types require the correct country code format to generate a working link.',
    ],
    advantages: [
      'Nine data types beyond plain text, each with the exact fields that type needs',
      'Independent foreground/background color control plus logo and background image overlays',
      'Client-side rendering — no data sent to a server to generate the code',
      'Free PNG export with adjustable size',
    ],
    benefits: [
      'Give customers a one-scan path to WhatsApp, a call, or a social profile instead of manual typing.',
      'Reinforce brand recognition with colored, logo-overlaid codes instead of plain black-and-white squares.',
      'Skip signup walls that many QR generators use to unlock color or logo customization.',
    ],
    faqs: [
      {
        question: 'What data types can I generate a QR code for?',
        answer: 'Text/URL, WhatsApp, Instagram, Facebook, YouTube, X (Twitter), SMS, Phone Call, and Email — each with its own relevant input fields.',
      },
      {
        question: 'Can I add my logo to the QR code?',
        answer: 'Yes. Upload a logo image up to 1MB and it renders centered over the code. QR error correction generally keeps the code scannable with a moderate-sized logo overlay.',
      },
      {
        question: 'Can I change the QR code colors?',
        answer: 'Yes. Foreground and background colors are independently adjustable to match branding, though high contrast between them is important for reliable scanning.',
      },
      {
        question: 'Why did my download fail?',
        answer: 'This usually happens when an externally hosted logo or background image "taints" the canvas, which browsers block from being exported. Try removing the logo or using a locally uploaded image instead.',
      },
      {
        question: 'What format does the QR code download as?',
        answer: 'PNG, rendered from an offscreen canvas at the size you set with the size slider (default 256px).',
      },
      {
        question: 'Is this QR code generator free?',
        answer: 'Yes, generating and downloading QR codes including colors and logo overlay is free with no account required.',
      },
      {
        question: 'Does my data get uploaded when I generate a QR code?',
        answer: 'No, the QR code is generated and rendered entirely in your browser using canvas.',
      },
    ],
    relatedTools: [
      { name: 'URL Shortener', href: '/url-shortener', description: 'Shorten a destination URL before encoding it into a QR code' },
      { name: 'Barcode Generator', href: '/barcode-generator', description: '1D barcodes for retail, industrial, and logistics use' },
      { name: 'Social Deep Link Generator', href: '/social-media-deep-link-generator', description: 'App-aware links with web fallback' },
      { name: 'Color Picker Tool', href: '/color-picker-tool', description: 'Pick exact brand colors for your QR code' },
      { name: 'Color Palette Generator', href: '/color-palette-generator', description: 'Build a matching color scheme' },
      { name: 'Image Resizer', href: '/image-resizer', description: 'Resize your logo before uploading it' },
      { name: 'Background Remover', href: '/background-remover', description: 'Remove a logo’s background before overlay' },
      { name: 'Hashtag Generator', href: '/hashtag-generator', description: 'Pair QR-linked posts with relevant hashtags' },
    ],
    conclusion:
      'Pick a data type above, customize colors and an optional logo, and download a print-ready PNG — everything renders in your browser, so nothing you enter is sent to a server.',
  },

  /* ---------------------------------------------------------------- */
  /* /password-generator                                               */
  /* ---------------------------------------------------------------- */
  '/password-generator': {
    title: 'Free Password Generator — Custom Length & Characters',
    h1: 'Password Generator — Custom Length & Character Sets',
    metaDescription:
      'Generate random passwords free with adjustable length and toggles for uppercase, lowercase, numbers, and symbols. Runs in your browser — no signup.',
    datePublished: '2024-02-15',
    dateModified: '2026-08-05',
    tldr:
      'Set a length and toggle which character sets to include (uppercase, lowercase, numbers, symbols), then generate a randomized password built from your selected sets — entirely in your browser, nothing stored or transmitted.',
    processingNote:
      'Password generation runs in your browser using JavaScript’s random number generator to select characters from your chosen sets. Generated passwords are not stored, logged, or sent to any server.',
    ioContract: {
      inputs: 'Desired length and four toggles: include uppercase, lowercase, numbers, and symbols (!@#$%)',
      outputs: 'A single randomized password string built from the enabled character sets',
      formats: 'Plain text password, copyable with one click',
      limits: 'At least one character set toggle must stay enabled to generate a password',
      processing: 'Client-side (browser)',
    },
    keywords: [
      'password generator',
      'random password generator',
      'strong password generator',
      'free password generator online',
      'secure password maker',
    ],
    introParagraphs: [
      'This generator builds a password by combining the character sets you enable — uppercase letters, lowercase letters, numbers, and symbols (!@#$%) — into one pool, then randomly selecting characters from that pool up to your chosen length. Every toggle you switch off shrinks the pool, so a numbers-only password draws exclusively from 0–9.',
      'There is no account, no password history, and no server round-trip: the generated string appears instantly and stays only in your browser tab until you copy it elsewhere. That makes it a fast way to create a one-off password for a new account before storing it in your password manager.',
    ],
    overview:
      'Password strength comes primarily from length and the size of the character pool it draws from — a longer password with fewer character types can still be safer than a short one with every type enabled. This generator lets you control exactly which sets contribute to the pool, so you can match a site’s specific password rules (for example, disabling symbols if a login form rejects them) while keeping length as your main lever for strength.',
    howToUse: [
      'Set your desired password length using the length control.',
      'Toggle which character sets to include: uppercase letters, lowercase letters, numbers, and symbols (!@#$%).',
      'Click Generate Password to create a new randomized string from your selected sets.',
      'Copy the result and paste it into your password manager or the account signup form.',
      'Click Generate again for a fresh password if you want a different result from the same settings.',
    ],
    whenToUse: [
      'Creating a new password for an account signup that requires specific character types',
      'Replacing a reused password identified in a breach notification',
      'Generating a password quickly when you already store secrets in a password manager',
      'Matching a site’s specific rules by disabling symbols or numbers if the login form rejects them',
    ],
    useCases: [
      {
        title: 'New account signup',
        description: 'Generate a password matching a site’s stated rules (length minimum, required symbol), then save it immediately in your password manager rather than reusing an existing password.',
      },
      {
        title: 'Post-breach password rotation',
        description: 'After a breach notification, generate fresh, unique passwords for each affected account instead of reusing a slightly modified version of the compromised one.',
      },
      {
        title: 'Matching strict form rules',
        description: 'Disable the symbols toggle if a login form only accepts letters and numbers, so every generated password will actually be accepted on the first try.',
      },
    ],
    examples: [
      {
        input: 'Length 16 · uppercase + lowercase + numbers + symbols enabled',
        output: 'A 16-character password drawing from all four sets, e.g. structurally similar to K9mQx2vLpR8nAw!f',
      },
      {
        input: 'Length 10 · numbers only',
        output: 'A 10-digit numeric string for forms that reject letters and symbols',
      },
    ],
    tips: [
      'Favor length over toggling every character set on — a longer password is generally the stronger lever.',
      'Generate a fresh password per account instead of reusing one password with minor variations across sites.',
      'Save the generated password directly into a password manager rather than a plain text file or note.',
      'If a site rejects a generated password, check whether it disallows a specific character in your symbol set rather than assuming length is the issue.',
    ],
    commonMistakes: [
      'Turning off every character set except one, producing a weak, easily guessable password despite a long length.',
      'Reusing the same generated password across multiple accounts.',
      'Storing generated passwords in an unencrypted note or email draft instead of a password manager.',
      'Assuming a generated password is automatically compliant with a specific site’s hidden character restrictions.',
    ],
    advantages: [
      'Instant generation with no account or password history stored',
      'Independent toggles for uppercase, lowercase, numbers, and symbols',
      'Adjustable length to match different site requirements',
      'Runs entirely in your browser — nothing is transmitted or logged',
    ],
    benefits: [
      'Replace reused passwords quickly after a breach notification.',
      'Match strict site password rules by controlling exactly which character sets are used.',
      'Avoid the temptation to reuse a memorable password across multiple accounts.',
    ],
    faqs: [
      {
        question: 'How do I generate a strong password?',
        answer: 'Set a longer length and keep as many character-set toggles enabled as the target site allows. Length has the biggest impact on password strength.',
      },
      {
        question: 'Can I generate a password with only numbers or only letters?',
        answer: 'Yes. Turn off any character sets you do not want — for example, disable uppercase, symbols, and lowercase to generate a numbers-only password.',
      },
      {
        question: 'Is the generated password stored anywhere?',
        answer: 'No. The password is generated and displayed in your browser only — it is not saved, logged, or sent to any server.',
      },
      {
        question: 'What character does the symbols option include?',
        answer: 'The symbols toggle draws from a set including characters like !@#$%.',
      },
      {
        question: 'Should I reuse a generated password across accounts?',
        answer: 'No. Generate a unique password per account and store each one in a password manager rather than reusing or slightly modifying the same password.',
      },
      {
        question: 'Is this password generator free?',
        answer: 'Yes, generating as many passwords as you need is free with no account required.',
      },
    ],
    relatedTools: [
      { name: 'Hash Generator', href: '/hash-generator', description: 'Generate checksums — not for encrypting passwords' },
      { name: 'JWT Decoder', href: '/jwt-decoder', description: 'Inspect token payloads during auth debugging' },
      { name: 'Base64 Converter', href: '/base64-converter', description: 'Encode values for transport, not for security' },
      { name: 'Username Generator', href: '/username-generator', description: 'Generate a matching username for new accounts' },
      { name: 'URL Shortener', href: '/url-shortener', description: 'Password-protect a shared link with the same hygiene mindset' },
      { name: 'QR Code Generator', href: '/qr-code-generator', description: 'Share account setup links via QR' },
      { name: 'Dice Roller', href: '/dice-roller', description: 'Simple randomization for other everyday needs' },
      { name: 'Random Number Generator', href: '/random-number-generator', description: 'Generate random numbers for other uses' },
    ],
    conclusion:
      'Set a length, choose your character sets, and generate a fresh password above — then save it in a password manager rather than reusing it, since this tool never stores what it generates.',
  },

  /* ---------------------------------------------------------------- */
  /* /image-compressor                                                 */
  /* ---------------------------------------------------------------- */
  '/image-compressor': {
    title: 'Free Image Compressor — Reduce Size, Keep Quality',
    h1: 'Image Compressor — Shrink JPG, PNG & WebP File Size',
    metaDescription:
      'Compress JPG, PNG, or WebP images free in your browser with a live quality slider and before/after preview. Files up to 15MB, no signup, no upload wait.',
    datePublished: '2024-02-20',
    dateModified: '2026-09-03',
    tldr:
      'Upload a JPG, PNG, or WebP image (up to 15MB), pick Auto, Target Size (50–150KB / email 1MB chips), or Manual quality, and compare with a live before/after slider before downloading — all processed locally.',
    processingNote:
      'Compression runs entirely in your browser using the HTML canvas API — your image is never uploaded to a server. Files over 15MB are rejected before processing begins.',
    ioContract: {
      inputs: 'JPG, JPEG, PNG, or WebP image file up to 15MB',
      outputs: 'Compressed image in JPEG, WebP, or PNG format with a live before/after size comparison',
      formats: 'Input: image/jpeg, image/png, image/webp; Output: selectable JPEG, WebP, or PNG',
      limits: 'Maximum upload size is 15MB; quality slider only affects JPEG and WebP output (PNG is lossless)',
      processing: 'Client-side (browser canvas rendering)',
    },
    keywords: [
      'image compressor',
      'compress image online free',
      'reduce image file size',
      'jpg compressor',
      'png compressor',
      'webp converter compressor',
      'photo kb resize',
      'resize photo to kb',
      'compress image to 150kb',
      'email friendly photo compressor',
      'compress jpg to kb',
    ],
    introParagraphs: [
      'This compressor draws your uploaded image onto an HTML canvas, then re-encodes it at your chosen quality level and output format (JPEG, WebP, or PNG) using the browser’s native canvas.toDataURL API. Because PNG is a lossless format, the quality slider only changes output size for JPEG and WebP — PNG compression depends on the image content itself.',
      'A live before/after slider lets you drag across the image to compare original versus compressed quality directly, and the tool shows the resulting file size next to the original so you can judge the tradeoff before downloading. Files up to 15MB are accepted; anything larger is rejected immediately with a clear error message rather than failing silently mid-upload.',
    ],
    overview:
      'Lossy formats like JPEG and WebP shrink file size by discarding some image data — the quality setting controls how aggressively. Re-encoding at a lower quality removes fine detail the eye often does not miss at normal viewing sizes, which is why a moderate quality reduction can shrink file size significantly with minimal visible difference. Since everything happens on an in-browser canvas, there is no upload wait and no server storing a copy of your image.',
    howItWorks:
      'Drag and drop or select an image file (JPG, PNG, or WebP, up to 15MB). The image loads into memory and draws onto an offscreen canvas at its original dimensions. Choose an output format and quality percentage; the canvas re-encodes to that format and quality, producing a new data URL. The before/after slider overlays original and compressed previews so you can compare visually, and the file size of each version displays for direct comparison. Download the compressed result once you are satisfied.',
    howToUse: [
      'Upload a JPG, PNG, or WebP image (up to 15MB) by dragging it in or selecting a file.',
      'Choose an output format: JPEG, WebP, or PNG.',
      'Adjust the quality slider (this affects JPEG/WebP output; PNG stays lossless).',
      'Drag the before/after comparison slider across the preview to check visual quality at your chosen setting.',
      'Compare the displayed file sizes, then download the compressed image once you are satisfied.',
    ],
    whenToUse: [
      'Reducing image file size before uploading to a website to improve page load speed',
      'Shrinking photos for email attachments that have a size limit',
      'Converting a large PNG screenshot to a smaller JPEG or WebP for sharing',
      'Preparing multiple product images for an online store without a desktop image editor',
    ],
    useCases: [
      {
        title: 'Website performance optimization',
        description: 'Compress hero images and product photos to WebP at a moderate quality setting to reduce page weight and improve load time, using the before/after slider to confirm no visible quality loss.',
      },
      {
        title: 'Email attachment size limits',
        description: 'Convert a large PNG screenshot or photo to a compressed JPEG so it fits under an email provider’s attachment size cap.',
      },
      {
        title: 'Bulk-style manual review',
        description: 'Compress product photos one at a time, checking the live before/after view for each to catch any image where quality reduction becomes visible before publishing.',
      },
    ],
    examples: [
      {
        input: 'Upload 8MB PNG screenshot → WebP output, quality 80',
        output: 'Compressed WebP file significantly smaller than the original, viewable in the before/after comparison slider',
      },
      {
        input: 'Upload 15MB JPG photo → JPEG output, quality 60',
        output: 'Smaller JPEG file with visible size reduction shown next to the original',
      },
    ],
    tips: [
      'Start around quality 75–85 for JPEG/WebP — this usually gives a strong size reduction with minimal visible loss.',
      'Use WebP output when the destination supports it; it typically compresses smaller than JPEG at similar visual quality.',
      'Remember PNG output stays lossless, so if you need maximum size reduction, switch to JPEG or WebP instead.',
      'Always check the before/after slider at 100% zoom before downloading if the image will be used at large display sizes.',
    ],
    commonMistakes: [
      'Uploading a file over the 15MB limit and being surprised when it is rejected instead of resized first.',
      'Expecting the quality slider to shrink PNG output significantly — PNG compression is lossless and content-dependent.',
      'Compressing too aggressively for images with fine text or gradients, where quality loss becomes visibly obvious.',
      'Forgetting to check the before/after comparison before downloading and publishing.',
    ],
    advantages: [
      'No upload wait — compression happens instantly in your browser',
      'Live before/after comparison slider to judge quality tradeoffs directly',
      'Choice of JPEG, WebP, or PNG output format',
      'Supports files up to 15MB with a clear error if exceeded',
    ],
    benefits: [
      'Shrink page-weight-heavy images to improve website load speed without a desktop editor.',
      'Fit large photos under email attachment size limits in seconds.',
      'Compare quality directly before committing to a compression level.',
    ],
    features: [
      'Drag-and-drop upload up to 15MB',
      'JPEG, WebP, and PNG output formats',
      'Live quality slider for lossy formats',
      'Before/after visual comparison',
      'Instant client-side processing',
    ],
    faqs: [
      {
        question: 'What is the maximum file size I can compress?',
        answer: '15MB. Files larger than that are rejected immediately with an error message before any processing starts.',
      },
      {
        question: 'Which image formats are supported?',
        answer: 'You can upload JPG, JPEG, PNG, or WebP files, and choose JPEG, WebP, or PNG as your output format.',
      },
      {
        question: 'Why doesn’t the quality slider shrink my PNG file much?',
        answer: 'PNG is a lossless format, so the quality slider does not apply the same way it does to JPEG and WebP. For maximum size reduction, switch the output format to JPEG or WebP.',
      },
      {
        question: 'Is my image uploaded to a server?',
        answer: 'No. Compression happens entirely in your browser using the canvas API — your image never leaves your device.',
      },
      {
        question: 'How can I compare the original and compressed image?',
        answer: 'Use the before/after slider on the preview to drag across and visually compare the original against the compressed version at your chosen quality.',
      },
      {
        question: 'Is this image compressor free?',
        answer: 'Yes, compressing images up to 15MB is free with no account required.',
      },
    ],
    relatedTools: [
      { name: 'Image Resizer', href: '/image-resizer', description: 'Change dimensions before or after compressing' },
      { name: 'PDF Compressor', href: '/pdf-compressor', description: 'Compress PDF to 150KB for form uploads' },
      { name: 'Image Format Converter', href: '/image-format-converter', description: 'Convert between JPG, PNG, WebP, and more' },
      { name: 'Image Cropper', href: '/image-cropper', description: 'Crop before compressing to reduce size further' },
      { name: 'Background Remover', href: '/background-remover', description: 'Remove backgrounds before compressing product photos' },
      { name: 'SVG Optimizer', href: '/svg-optimizer', description: 'Compress vector graphics separately' },
      { name: 'Image Metadata Viewer', href: '/image-metadata-viewer', description: 'Check EXIF data before or after compression' },
      { name: 'Placeholder Image Generator', href: '/placeholder-image-generator', description: 'Generate lightweight placeholders for layouts' },
      { name: 'Image Upscaler', href: '/image-upscaler', description: 'Increase resolution when you need the opposite of compression' },
    ],
    conclusion:
      'Upload an image up to 15MB, choose your output format and quality, and use the before/after slider to confirm the tradeoff before downloading — everything runs locally in your browser, with no upload wait.',
  },

  /* ---------------------------------------------------------------- */
  /* /pdf-compressor                                                   */
  /* ---------------------------------------------------------------- */
  '/pdf-compressor': {
    title: 'Compress PDF to 150KB Free — Bulk PDF Compressor Online',
    h1: 'PDF Compressor — Compress PDF to 150KB (Single or Bulk)',
    metaDescription:
      'Compress PDF to 150KB free online. Bulk or single PDF compression with 6 levels (Full Quality → Compact) and estimated sizes. No signup — private browser tool.',
    datePublished: '2026-09-03',
    dateModified: '2026-09-03',
    tldr:
      'Upload one PDF or a batch (up to 12), pick a compression level from Full Quality to Compress to ~150 KB, preview estimated size, then download the compressed PDF — all client-side.',
    processingNote:
      'Compression runs entirely in your browser with PDF.js + pdf-lib. PDFs are never uploaded to FYN Tools servers. Large scanned PDFs may take longer to re-encode page by page.',
    ioContract: {
      inputs: 'One PDF or up to 12 PDFs (bulk), each up to 40MB; choose one of six compression levels',
      outputs: 'Compressed PDF download(s) with before/after byte sizes and percent reduced',
      formats: 'application/pdf input and output',
      limits:
        '40MB per file, 12 files in bulk; “Compress to ~150 KB” iteratively lowers quality — very image-heavy multi-page PDFs may land slightly above 150KB at the quality floor',
      processing: 'Client-side (PDF.js page render + pdf-lib rebuild)',
    },
    keywords: [
      'pdf compressor',
      'compress pdf to 150kb',
      '150kb pdf converter',
      'compress 150kb pdf',
      'pdf crop',
      'free pdf compressor online',
      'compress pdf bulk',
      'reduce pdf file size',
      'compress pdf for email',
      'compress pdf for upload',
    ],
    introParagraphs: [
      'Government portals, university forms, and email gateways often cap uploads at 100–200KB. This free PDF compressor targets those limits with an explicit “Compress to ~150 KB” level plus five higher-quality options (Full Quality, High Quality, Optimized, Slight Quality Drop, Compact). Each level shows an estimated output size before you run compression so you can pick the right tradeoff.',
      'Use Single mode for one document or Bulk mode for up to 12 PDFs at once. Pages are re-rendered and re-encoded as efficient JPEG images inside a new PDF — the same approach free compressors use for scanned forms and photo-heavy files. Pair with Image Cropper or PDF Text Extractor when you need to crop photos first or extract text after shrinking.',
    ],
    overview:
      'PDF size is dominated by embedded images. Re-encoding each page at a lower scale and JPEG quality shrinks the file dramatically while keeping text readable for form uploads. Levels map to scale/quality presets; the 150KB target mode retries with stronger settings until the file is under ~150KB or the quality floor is reached.',
    howItWorks:
      'Select Single or Bulk, drop PDF files, choose a compression level (estimates update from your file sizes), then Compress. The tool renders each page with PDF.js, encodes JPEG at the level’s settings, rebuilds a PDF with pdf-lib, and offers per-file download plus Download all.',
    howToUse: [
      'Choose Single PDF or Bulk (up to 12 files).',
      'Drag and drop or select your PDF(s) — max 40MB each.',
      'Pick a compression level; read the estimated size under each card (or Compress to ~150 KB for upload portals).',
      'Click Compress and wait for page-by-page progress.',
      'Download each file or use Download all when the batch finishes.',
    ],
    whenToUse: [
      'Meeting a 150KB PDF upload limit on exam or government forms',
      'Shrinking scanned documents for email without desktop Acrobat',
      'Bulk-compressing multiple PDFs before a portal submission',
      'Reducing photo-heavy PDFs after cropping images elsewhere',
    ],
    useCases: [
      {
        title: '150KB portal upload',
        description:
          'Select Compress to ~150 KB, upload a scanned form PDF, and download a file sized for strict upload validators.',
      },
      {
        title: 'Bulk application documents',
        description:
          'Switch to Bulk, add several supporting PDFs, use Optimized or Compact, then Download all.',
      },
      {
        title: 'Email-friendly PDF',
        description:
          'Use Compact or Slight Quality Drop so attachments stay under common mailbox limits.',
      },
    ],
    examples: [
      {
        input: '2.4MB scanned form → Compress to ~150 KB',
        output: 'Compressed PDF near or under 150KB, ready for upload',
      },
      {
        input: 'Three 5MB PDFs → Bulk + Optimized',
        output: 'Three smaller PDFs with estimated sizes shown before encode',
      },
    ],
    tips: [
      'Start with Optimized; only use Compress to ~150 KB when a portal rejects larger files.',
      'Crop oversized photos before compressing for even smaller results (see Image Cropper).',
      'Text-only vector PDFs may shrink less than scanned image PDFs — Compact still helps.',
      'Keep originals; compression is lossy for page images.',
    ],
    commonMistakes: [
      'Expecting 150KB on a 50-page photo PDF at Full Quality — use the 150KB level.',
      'Uploading password-protected PDFs (unlock first).',
      'Closing the tab mid-bulk before downloads finish.',
    ],
    advantages: [
      'Explicit compress PDF to 150KB mode',
      'Six named levels with live size estimates',
      'Single and bulk modes',
      '100% browser-side — no signup, no upload to our servers',
    ],
    benefits: [
      'Pass strict 150KB PDF converters and form validators.',
      'Compress many PDFs in one sitting.',
      'See estimated size before committing to a quality drop.',
    ],
    features: [
      'Compress PDF to 150KB target',
      'Six compression levels with estimates',
      'Single and bulk PDF compression',
      'Client-side private processing',
      'Per-file and download-all actions',
    ],
    faqs: [
      {
        question: 'Can I compress a PDF to 150KB?',
        answer:
          'Yes. Choose the “Compress to ~150 KB” level. The tool iteratively lowers render scale and JPEG quality to approach 150KB. Extremely large multi-page scans may land slightly above 150KB at the quality floor.',
      },
      {
        question: 'Is bulk PDF compression supported?',
        answer: 'Yes — switch to Bulk mode and add up to 12 PDFs (40MB each), then Download all when finished.',
      },
      {
        question: 'What do the six compression levels mean?',
        answer:
          'Full Quality (minimal drop), High Quality, Optimized (balanced), Slight Quality Drop, Compact (forms/email), and Compress to ~150 KB (aggressive target). Each card shows an estimated size from your files.',
      },
      {
        question: 'Does “pdf crop” work here?',
        answer:
          'This page compresses PDFs. For cropping images inside a document, use Image Cropper first, then compress here. Many users search “pdf crop” when preparing size-limited form uploads — compression is usually the missing step.',
      },
      {
        question: 'Is my PDF uploaded to a server?',
        answer: 'No. Compression runs in your browser. Files stay on your device.',
      },
      {
        question: 'Is this PDF compressor free?',
        answer: 'Yes — free, no account, no watermark.',
      },
    ],
    relatedTools: [
      { name: 'PDF Text Extractor', href: '/pdf-text-extractor', description: 'Extract text from PDFs after or before compressing' },
      { name: 'Image Compressor', href: '/image-compressor', description: 'Compress photos to KB before inserting into a PDF' },
      { name: 'Image Cropper', href: '/image-cropper', description: 'Crop images for smaller PDF embeds' },
      { name: 'Image Resizer', href: '/image-resizer', description: 'Resize photo to KB / email-friendly sizes' },
      { name: 'Image Format Converter', href: '/image-format-converter', description: 'Convert page exports between formats' },
    ],
    conclusion:
      'Pick a level, compress single or bulk PDFs in your browser, and download files ready for 150KB portals, email, or form uploads — free on FYN Tools.',
  },

  /* ---------------------------------------------------------------- */
  /* /html-formatter                                                   */
  /* ---------------------------------------------------------------- */
  '/html-formatter': {
    title: 'Free HTML Formatter & Beautifier Online',
    h1: 'HTML Formatter — Beautify & Indent Markup Instantly',
    metaDescription:
      'Beautify messy or minified HTML free with automatic 2-space indentation. Paste, format, and copy clean markup in seconds — no signup required.',
    datePublished: '2024-02-25',
    dateModified: '2026-08-05',
    tldr:
      'Paste minified or poorly indented HTML, click Format, and get properly nested markup with 2-space indentation and correct handling of self-closing tags like <br>, <img>, and <input> — processed entirely in your browser.',
    processingNote:
      'HTML formatting runs in your browser using a tokenizer that reads your markup and re-indents it. Nothing you paste is sent to a server.',
    ioContract: {
      inputs: 'HTML markup pasted or typed into the editor, including minified or single-line HTML',
      outputs: 'Beautified HTML with 2-space indentation per nesting level and correct self-closing tag handling',
      formats: 'HTML text; recognizes standard self-closing tags (br, hr, img, input, meta, link, area, base, col, embed, source, track, wbr)',
      limits: 'This tool beautifies/indents markup; it does not minify or validate HTML against a spec',
      processing: 'Client-side (browser)',
    },
    keywords: [
      'html formatter',
      'html beautifier',
      'format html online',
      'indent html code',
      'html beautifier free',
      'clean html code',
    ],
    introParagraphs: [
      'This formatter tokenizes your HTML into opening tags, closing tags, and text content, then rebuilds it with two-space indentation that increases after each opening tag and decreases before each closing tag. It correctly recognizes standard self-closing tags — br, hr, img, input, meta, link, area, base, col, embed, source, track, and wbr — so it does not add unnecessary indentation after them.',
      'It is a beautifier, not a linter: it will indent whatever tag structure you give it without checking whether the HTML is spec-valid or whether tags are properly closed. That makes it fast for cleaning up minified markup pulled from a live site’s view-source, or for making a single-line HTML string readable before you edit it.',
    ],
    overview:
      'Minified or copy-pasted HTML often arrives as one long line with no indentation, making nested structure impossible to read at a glance. This formatter strips redundant whitespace between tags, then walks the token stream tracking nesting depth, adding two spaces per level for each opening tag and removing two spaces before each matching closing tag. Self-closing tags do not increase the indent level since they have no matching closing tag to track.',
    howToUse: [
      'Paste your HTML — minified, copy-pasted from view-source, or just poorly indented — into the input box.',
      'Click Format to re-indent the markup with two spaces per nesting level.',
      'Review the formatted output on the right or below the input.',
      'Click Copy to grab the beautified HTML for pasting into your editor.',
      'Click Reset if you want to clear both the input and output and start over.',
    ],
    whenToUse: [
      'Cleaning up HTML copied from a browser’s view-source or DevTools that arrived as one unreadable line',
      'Making minified production HTML readable before debugging a layout issue',
      'Formatting a code snippet before pasting it into documentation or a tutorial',
      'Quickly checking whether tags are nested the way you expect by seeing the indentation visually',
    ],
    useCases: [
      {
        title: 'Debugging a live page’s markup',
        description: 'Copy HTML from view-source, paste it here to see proper indentation, and quickly spot which element wraps which without manually counting tags.',
      },
      {
        title: 'Preparing code for documentation',
        description: 'Beautify a minified snippet before including it in a tutorial or internal wiki so readers can follow the structure at a glance.',
      },
      {
        title: 'Pre-edit cleanup',
        description: 'Format a single-line HTML export from a page builder before manually editing it in a text editor.',
      },
    ],
    examples: [
      {
        input: '<div class="container"><h1>Hello</h1><p>Text</p></div>',
        output: '<div class="container">\n  <h1>Hello</h1>\n  <p>Text</p>\n</div>',
      },
      {
        input: '<ul><li>Item 1</li><li>Item 2</li></ul>',
        output: '<ul>\n  <li>Item 1</li>\n  <li>Item 2</li>\n</ul>',
      },
    ],
    tips: [
      'This tool beautifies structure but does not validate HTML — run a validator separately if you need spec compliance checked.',
      'Self-closing tags like <img> and <br> will not increase indentation for what follows, since they have no closing tag.',
      'Format before diffing two versions of a page’s markup so the diff reflects real structural changes, not just whitespace.',
    ],
    commonMistakes: [
      'Expecting the formatter to fix invalid or unclosed tags — it indents based on the tags you provide, it does not correct them.',
      'Assuming this tool minifies HTML — it only beautifies (adds indentation); use a dedicated minifier for the opposite.',
      'Pasting HTML with inline scripts expecting JavaScript-specific formatting — this tool focuses on tag structure.',
    ],
    advantages: [
      'Handles standard self-closing tags correctly without extra configuration',
      'Two-space indentation matches common HTML style guides',
      'Runs entirely in your browser with instant results',
      'One-click copy and reset controls',
    ],
    benefits: [
      'Turn unreadable single-line HTML into properly nested, readable markup in one click.',
      'Spot structural nesting issues visually instead of counting tags manually.',
      'Prepare clean code snippets for documentation or tutorials quickly.',
    ],
    features: [
      'Two-space auto-indentation',
      'Correct self-closing tag handling',
      'One-click copy of formatted output',
      'Reset button to clear input and output',
    ],
    faqs: [
      {
        question: 'Does this tool validate my HTML?',
        answer: 'No, it beautifies (indents) your markup based on the tags provided. It does not check whether the HTML is spec-valid or whether tags are properly closed.',
      },
      {
        question: 'Can it minify HTML instead of formatting it?',
        answer: 'No, this tool only beautifies (adds indentation). Use a dedicated minifier if you need to compress HTML for production.',
      },
      {
        question: 'How does it handle tags like <img> and <br>?',
        answer: 'It recognizes standard self-closing tags (br, hr, img, input, meta, link, area, base, col, embed, source, track, wbr) and does not add extra indentation after them, since they have no closing tag.',
      },
      {
        question: 'Is my HTML sent to a server?',
        answer: 'No. Formatting happens entirely in your browser using a JavaScript tokenizer — nothing you paste is uploaded.',
      },
      {
        question: 'What indentation size does it use?',
        answer: 'Two spaces per nesting level, which matches common HTML style guide conventions.',
      },
      {
        question: 'Is this HTML formatter free to use?',
        answer: 'Yes, formatting HTML is free with no account required.',
      },
    ],
    relatedTools: [
      { name: 'JSON Formatter', href: '/json-formatter', description: 'Format and validate JSON payloads' },
      { name: 'CSS Minifier', href: '/css-minifier', description: 'Compress stylesheets for production' },
      { name: 'JavaScript Minifier', href: '/javascript-minifier', description: 'Compress JS files' },
      { name: 'Markdown Editor', href: '/markdown-editor', description: 'Write and preview Markdown content' },
      { name: 'Base64 Converter', href: '/base64-converter', description: 'Encode or decode embedded data URIs' },
      { name: 'Meta Tag Previewer', href: '/meta-tag-previewer', description: 'Preview how HTML meta tags render when shared' },
      { name: 'URL Encode / Decode', href: '/url-encode-decode', description: 'Encode values used inside HTML attributes' },
      { name: 'Regex Tester', href: '/regex-tester', description: 'Test patterns against extracted HTML content' },
    ],
    conclusion:
      'Paste minified or messy HTML above and get properly indented, readable markup in one click — the tool beautifies structure only, so pair it with a validator if you also need spec compliance checked.',
  },
};
