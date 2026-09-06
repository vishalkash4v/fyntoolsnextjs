/** Hand-written Input/Output examples — never use “Sample input for …” placeholders. */

export type ToolIoExample = { input: string; output: string };

export const PATH_EXAMPLES: Record<string, ToolIoExample[]> = {
  '/weather-forecast': [
    {
      input: 'Search: Una, Himachal Pradesh, India  (or allow GPS)',
      output: 'Current temp, feels-like, 7-day, hourly rain %, AQI, UV, what-to-wear via FYN Weather Gateway',
    },
    {
      input: 'Deny GPS → IP region fallback · unit °C',
      output: 'Regional forecast until you search a city or tap GPS again',
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
  '/box-shadow-generator': [
    {
      input: 'Offset X 4px · Y 8px · Blur 16px · Spread 0 · Color rgba(0,0,0,0.18)',
      output: 'box-shadow: 4px 8px 16px 0 rgba(0,0,0,0.18);  + live preview card',
    },
    {
      input: 'Second pass on /box-shadow-generator with adjusted settings',
      output: 'Updated result from the live panel — copy or download when ready',
    }
  ],
  '/business-idea-generator': [
    {
      input: 'Industry: education  · Budget: low  · Audience: students',
      output: 'Idea list: e.g. “micro-course marketplace for exam prep” with angle + next step',
    },
    {
      input: 'Second pass on /business-idea-generator with adjusted settings',
      output: 'Updated result from the live panel — copy or download when ready',
    }
  ],
  '/countdown-timer': [
    {
      input: 'Target: 25:00 (Pomodoro) → Start',
      output: 'Counts down to 00:00 with alert at zero; tab can show remaining time',
    },
    {
      input: 'Second pass on /countdown-timer with adjusted settings',
      output: 'Updated result from the live panel — copy or download when ready',
    }
  ],
  '/daily-task-report-saver': [
    {
      input: 'Date: 3 Sep 2026 · Tasks: shipped weather search, reviewed PRs · Notes: deploy pending',
      output: 'Saved local daily report you can reopen by date and copy as text',
    },
    {
      input: 'Second pass on /daily-task-report-saver with adjusted settings',
      output: 'Updated result from the live panel — copy or download when ready',
    }
  ],
  '/enhanced-unit-converter': [
    {
      input: 'Length: 5 km → miles',
      output: '5 km = 3.10686 miles (plus other length units in the same panel)',
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
  '/notes': [
    {
      input: 'Title: Sprint notes  · Tag: work  · Color: yellow',
      output: 'Note saved in browser with tag filter; searchable in the notes list',
    },
    {
      input: 'Second pass on /notes with adjusted settings',
      output: 'Updated result from the live panel — copy or download when ready',
    }
  ],
  '/social-media-db-viewer': [
    {
      input: 'Public Instagram or Facebook profile URL / username',
      output: 'Public profile fields the tool can display (no private/login data)',
    },
    {
      input: 'Second pass on /social-media-db-viewer with adjusted settings',
      output: 'Updated result from the live panel — copy or download when ready',
    }
  ],
  '/social-media-deep-link-generator': [
    {
      input: 'Platform: YouTube · URL: https://youtube.com/watch?v=abc123',
      output: 'App deep link (opens YouTube app if installed) + web fallback URL',
    },
    {
      input: 'Second pass on /social-media-deep-link-generator with adjusted settings',
      output: 'Updated result from the live panel — copy or download when ready',
    }
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
  '/social-media-planner': [
    {
      input: 'Post: “Launch Friday 6pm” · Platform: Instagram · Date: 5 Sep',
      output: 'Planned slot on the calendar with caption draft stored locally',
    },
    {
      input: 'Second pass on /social-media-planner with adjusted settings',
      output: 'Updated result from the live panel — copy or download when ready',
    }
  ],
  '/timetable-maker': [
    {
      input: 'Job 9–5 · Goal: gym 5×/week · Sleep 11pm',
      output: 'Weekly timetable blocks (work, gym, sleep, free time) you can copy',
    },
    {
      input: 'Second pass on /timetable-maker with adjusted settings',
      output: 'Updated result from the live panel — copy or download when ready',
    }
  ],
  '/todo-list': [
    {
      input: 'Add: “Ship weather examples” · due today · priority high',
      output: 'Task appears in the list; check off to mark complete (saved locally)',
    },
    {
      input: 'Second pass on /todo-list with adjusted settings',
      output: 'Updated result from the live panel — copy or download when ready',
    }
  ],
  '/typing-competition': [
    {
      input: 'Join / start a round → type the prompt as fast as possible',
      output: 'WPM, accuracy %, and place vs other players for that round',
    },
    {
      input: 'Second pass on /typing-competition with adjusted settings',
      output: 'Updated result from the live panel — copy or download when ready',
    }
  ],
  '/typing-tutor': [
    {
      input: 'Lesson: home row (English) → type shown keys',
      output: 'Accuracy + WPM for the lesson; next lesson unlocks on pass',
    },
    {
      input: 'Second pass on /typing-tutor with adjusted settings',
      output: 'Updated result from the live panel — copy or download when ready',
    }
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
  '/text-case-converter': [
    {
      input: 'Plain text paste or type-in',
      output: 'Transformed text ready to copy',
    },
    {
      input: 'Open /text-case-converter and run a second sample',
      output: 'Transformed text ready to copy (iterate settings if the tool has options)',
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
  '/lorem-ipsum-generator': [
    {
      input: 'Mode: paragraphs · Count: 2',
      output:
        'Two Lorem Ipsum paragraphs starting with “Lorem ipsum dolor sit amet…” ready for a mock article body',
    },
    {
      input: 'Mode: words · Count: 12',
      output: 'Twelve-word Ipsum snippet for button label / card subtitle overflow tests',
    },
  ],
  '/whitespace-remover': [
    {
      input: 'Plain text paste or type-in',
      output: 'Transformed text ready to copy',
    },
    {
      input: 'Open /whitespace-remover and run a second sample',
      output: 'Transformed text ready to copy (iterate settings if the tool has options)',
    },
  ],
  '/duplicate-line-remover': [
    {
      input: 'Plain text paste or type-in',
      output: 'Transformed text ready to copy',
    },
    {
      input: 'Open /duplicate-line-remover and run a second sample',
      output: 'Transformed text ready to copy (iterate settings if the tool has options)',
    },
  ],
  '/text-reverser': [
    {
      input: 'Plain text paste or type-in',
      output: 'Transformed text ready to copy',
    },
    {
      input: 'Open /text-reverser and run a second sample',
      output: 'Transformed text ready to copy (iterate settings if the tool has options)',
    },
  ],
  '/regex-tester': [
    {
      input: 'Plain text paste or type-in',
      output: 'Transformed text ready to copy',
    },
    {
      input: 'Open /regex-tester and run a second sample',
      output: 'Transformed text ready to copy (iterate settings if the tool has options)',
    },
  ],
  '/base64-converter': [
    {
      input: 'Plain text paste or type-in',
      output: 'Transformed text ready to copy',
    },
    {
      input: 'Open /base64-converter and run a second sample',
      output: 'Transformed text ready to copy (iterate settings if the tool has options)',
    },
  ],
  '/url-slug-generator': [
    {
      input: 'Plain text paste or type-in',
      output: 'Transformed text ready to copy',
    },
    {
      input: 'Open /url-slug-generator and run a second sample',
      output: 'Transformed text ready to copy (iterate settings if the tool has options)',
    },
  ],
  '/timestamp-converter': [
    {
      input: 'Convert timestamp to date',
      output: 'Result from Timestamp Converter you can copy or download',
    },
    {
      input: 'Open /timestamp-converter and run a second sample',
      output: 'Result from Timestamp Converter you can copy or download (iterate settings if the tool has options)',
    },
  ],
  '/logo-to-favicon': [
    {
      input: 'Image file upload (PNG/JPG/WebP as supported) + on-screen settings',
      output: 'Processed image preview + download',
    },
    {
      input: 'Open /logo-to-favicon and run a second sample',
      output: 'Processed image preview + download (iterate settings if the tool has options)',
    },
  ],
  '/image-upscaler': [
    {
      input: 'Image + scale factor',
      output: 'Larger image download',
    },
    {
      input: 'Open /image-upscaler and run a second sample',
      output: 'Larger image download (iterate settings if the tool has options)',
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
  '/image-format-converter': [
    {
      input: 'Image file upload (PNG/JPG/WebP as supported) + on-screen settings',
      output: 'Processed image preview + download',
    },
    {
      input: 'Open /image-format-converter and run a second sample',
      output: 'Processed image preview + download (iterate settings if the tool has options)',
    },
  ],
  '/svg-optimizer': [
    {
      input: 'Image file upload (PNG/JPG/WebP as supported) + on-screen settings',
      output: 'Processed image preview + download',
    },
    {
      input: 'Open /svg-optimizer and run a second sample',
      output: 'Processed image preview + download (iterate settings if the tool has options)',
    },
  ],
  '/image-metadata-viewer': [
    {
      input: 'Image file upload (PNG/JPG/WebP as supported) + on-screen settings',
      output: 'Processed image preview + download',
    },
    {
      input: 'Open /image-metadata-viewer and run a second sample',
      output: 'Processed image preview + download (iterate settings if the tool has options)',
    },
  ],
  '/image-to-text': [
    {
      input: 'Image with printed text',
      output: 'Extracted plain text',
    },
    {
      input: 'Open /image-to-text and run a second sample',
      output: 'Extracted plain text (iterate settings if the tool has options)',
    },
  ],
  '/pdf-text-extractor': [
    {
      input: 'PDF file',
      output: 'Plain text to copy or download',
    },
    {
      input: 'Open /pdf-text-extractor and run a second sample',
      output: 'Plain text to copy or download (iterate settings if the tool has options)',
    },
  ],
  '/placeholder-image-generator': [
    {
      input: 'Image file upload (PNG/JPG/WebP as supported) + on-screen settings',
      output: 'Processed image preview + download',
    },
    {
      input: 'Open /placeholder-image-generator and run a second sample',
      output: 'Processed image preview + download (iterate settings if the tool has options)',
    },
  ],
  '/pixelate-tool': [
    {
      input: 'Image file upload (PNG/JPG/WebP as supported) + on-screen settings',
      output: 'Processed image preview + download',
    },
    {
      input: 'Open /pixelate-tool and run a second sample',
      output: 'Processed image preview + download (iterate settings if the tool has options)',
    },
  ],
  '/photo-annotation-tool': [
    {
      input: 'Image file upload (PNG/JPG/WebP as supported) + on-screen settings',
      output: 'Processed image preview + download',
    },
    {
      input: 'Open /photo-annotation-tool and run a second sample',
      output: 'Processed image preview + download (iterate settings if the tool has options)',
    },
  ],
  '/background-remover': [
    {
      input: 'Image file upload (PNG/JPG/WebP as supported) + on-screen settings',
      output: 'Processed image preview + download',
    },
    {
      input: 'Open /background-remover and run a second sample',
      output: 'Processed image preview + download (iterate settings if the tool has options)',
    },
  ],
  '/merge-images': [
    {
      input: 'Two or more images + layout',
      output: 'Merged image download',
    },
    {
      input: 'Open /merge-images and run a second sample',
      output: 'Merged image download (iterate settings if the tool has options)',
    },
  ],
  '/flip-image': [
    {
      input: 'PNG/JPG upload + flip axis',
      output: 'Flipped image download',
    },
    {
      input: 'Open /flip-image and run a second sample',
      output: 'Flipped image download (iterate settings if the tool has options)',
    },
  ],
  '/blur-image': [
    {
      input: 'Image file upload (PNG/JPG/WebP as supported) + on-screen settings',
      output: 'Processed image preview + download',
    },
    {
      input: 'Open /blur-image and run a second sample',
      output: 'Processed image preview + download (iterate settings if the tool has options)',
    },
  ],
  '/split-image': [
    {
      input: 'Image + rows/columns',
      output: 'Pieces to download (often as a set)',
    },
    {
      input: 'Open /split-image and run a second sample',
      output: 'Pieces to download (often as a set) (iterate settings if the tool has options)',
    },
  ],
  '/invert-image-colors': [
    {
      input: 'Image file upload (PNG/JPG/WebP as supported) + on-screen settings',
      output: 'Processed image preview + download',
    },
    {
      input: 'Open /invert-image-colors and run a second sample',
      output: 'Processed image preview + download (iterate settings if the tool has options)',
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
  '/add-name-date-photo': [
    {
      input: 'Photo + name + date',
      output: 'Annotated image download',
    },
    {
      input: 'Open /add-name-date-photo and run a second sample',
      output: 'Annotated image download (iterate settings if the tool has options)',
    },
  ],
  '/qr-scanner': [
    {
      input: 'Image file upload (PNG/JPG/WebP as supported) + on-screen settings',
      output: 'Processed image preview + download',
    },
    {
      input: 'Open /qr-scanner and run a second sample',
      output: 'Processed image preview + download (iterate settings if the tool has options)',
    },
  ],
  '/typing-test': [
    {
      input: 'Duration: 60s · English prompt · type until timer ends',
      output: 'Score card: WPM · accuracy % · characters typed · restart CTA',
    },
    {
      input: 'Retake focusing on accuracy (fewer thrash corrections)',
      output: 'Higher accuracy %; WPM may dip slightly — preferred for hiring screens',
    },
  ],
  '/typing-games': [
    {
      input: 'Multiple typing games',
      output: 'Result from Typing Games you can copy or download',
    },
    {
      input: 'Open /typing-games and run a second sample',
      output: 'Result from Typing Games you can copy or download (iterate settings if the tool has options)',
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
  '/color-picker-tool': [
    {
      input: 'Color picker from palette',
      output: 'Result from Color Picker you can copy or download',
    },
    {
      input: 'Open /color-picker-tool and run a second sample',
      output: 'Result from Color Picker you can copy or download (iterate settings if the tool has options)',
    },
  ],
  '/list-randomizer': [
    {
      input: 'Shuffle list items',
      output: 'Result from List Randomizer you can copy or download',
    },
    {
      input: 'Open /list-randomizer and run a second sample',
      output: 'Result from List Randomizer you can copy or download (iterate settings if the tool has options)',
    },
  ],
  '/barcode-generator': [
    {
      input: 'Visual 1D style picker',
      output: 'Result from Barcode Generator you can copy or download',
    },
    {
      input: 'Open /barcode-generator and run a second sample',
      output: 'Result from Barcode Generator you can copy or download (iterate settings if the tool has options)',
    },
  ],
  '/barcode-scanner-online': [
    {
      input: 'Camera scanner',
      output: 'Result from Barcode Scanner you can copy or download',
    },
    {
      input: 'Open /barcode-scanner-online and run a second sample',
      output: 'Result from Barcode Scanner you can copy or download (iterate settings if the tool has options)',
    },
  ],
  '/simple-calculator': [
    {
      input: 'Keypad expression',
      output: 'Numeric result',
    },
    {
      input: 'Open /simple-calculator and run a second sample',
      output: 'Numeric result (iterate settings if the tool has options)',
    },
  ],
  '/date-difference-calculator': [
    {
      input: 'Start date and end date',
      output: 'Elapsed duration breakdown',
    },
    {
      input: 'Open /date-difference-calculator and run a second sample',
      output: 'Elapsed duration breakdown (iterate settings if the tool has options)',
    },
  ],
  '/future-date-calculator': [
    {
      input: 'Start date + offset',
      output: 'Resulting calendar date',
    },
    {
      input: 'Open /future-date-calculator and run a second sample',
      output: 'Resulting calendar date (iterate settings if the tool has options)',
    },
  ],
  '/percentage-calculator': [
    {
      input: 'Mode: % of · 18% of 2499',
      output: '449.82 discount · Payable ≈ 2049.18 before tax/rounding',
    },
    {
      input: 'Mode: change · old 600000 → new 690000',
      output: 'Increase = 15% ((690000−600000)/600000×100)',
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
  '/period-calculator': [
    {
      input: 'LMP date, cycle length',
      output: 'Predicted dates on a calendar',
    },
    {
      input: 'Open /period-calculator and run a second sample',
      output: 'Predicted dates on a calendar (iterate settings if the tool has options)',
    },
  ],
  '/ovulation-calculator': [
    {
      input: 'LMP: 1 Sep 2026 · Cycle length: 28 days',
      output:
        'Estimated ovulation ~ 15 Sep 2026 · Fertile window roughly 10–16 Sep (educational)',
    },
    {
      input: 'LMP: 5 Aug 2026 · Cycle length: 35 days',
      output: 'Ovulation estimate shifts later than a mid-28-day model; window updates accordingly',
    },
  ],
  '/safe-days-calculator': [
    {
      input: 'LMP: 1 Sep 2026 · Cycle length: 28 days · Period length: 5 days',
      output:
        'Approx ovulation ~ day 14 · Fertile window ~ days 10–16 · Lower-risk days early/late cycle (educational)',
    },
    {
      input: 'LMP: 10 Aug 2026 · Cycle length: 32 days',
      output: 'Fertile window shifts later than a 28-day model; calendar risk labels update',
    },
  ],
  '/period-tracker': [
    {
      input: 'Date, flow, mood/symptoms',
      output: 'History on this device',
    },
    {
      input: 'Open /period-tracker and run a second sample',
      output: 'History on this device (iterate settings if the tool has options)',
    },
  ],
  '/pms-symptom-tracker': [
    {
      input: 'Symptom, severity, date',
      output: 'Local history for pattern review',
    },
    {
      input: 'Open /pms-symptom-tracker and run a second sample',
      output: 'Local history for pattern review (iterate settings if the tool has options)',
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
  '/conception-date-calculator': [
    {
      input: 'EDD or week of pregnancy',
      output: 'Approximate conception range',
    },
    {
      input: 'Open /conception-date-calculator and run a second sample',
      output: 'Approximate conception range (iterate settings if the tool has options)',
    },
  ],
  '/pregnancy-weight-gain-calculator': [
    {
      input: 'Pre-pregnancy weight/height, current week if asked',
      output: 'Range guidance',
    },
    {
      input: 'Open /pregnancy-weight-gain-calculator and run a second sample',
      output: 'Range guidance (iterate settings if the tool has options)',
    },
  ],
  '/contraction-timer': [
    {
      input: 'Tap start/stop per contraction',
      output: 'Duration and interval log',
    },
    {
      input: 'Open /contraction-timer and run a second sample',
      output: 'Duration and interval log (iterate settings if the tool has options)',
    },
  ],
  '/baby-kick-counter': [
    {
      input: 'Cycle or pregnancy dates / symptoms as labeled',
      output: 'Educational estimate or log (not a diagnosis)',
    },
    {
      input: 'Open /baby-kick-counter and run a second sample',
      output: 'Educational estimate or log (not a diagnosis) (iterate settings if the tool has options)',
    },
  ],
  '/pregnancy-diet-planner': [
    {
      input: 'Trimester / preferences in the form',
      output: 'Food ideas and notes',
    },
    {
      input: 'Open /pregnancy-diet-planner and run a second sample',
      output: 'Food ideas and notes (iterate settings if the tool has options)',
    },
  ],
  '/temperature-converter': [
    {
      input: 'Value + from/to units',
      output: 'Converted temperature',
    },
    {
      input: 'Open /temperature-converter and run a second sample',
      output: 'Converted temperature (iterate settings if the tool has options)',
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
  '/hash-generator': [
    {
      input: 'Code, CSS values, or structured text in the editor',
      output: 'Formatted / generated code you can copy',
    },
    {
      input: 'Open /hash-generator and run a second sample',
      output: 'Formatted / generated code you can copy (iterate settings if the tool has options)',
    },
  ],
  '/jwt-decoder': [
    {
      input:
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0IiwibmFtZSI6IkRlbW8iLCJleHAiOjE3MzU2ODkwMDB9.signature',
      output:
        'Header alg=HS256 typ=JWT · Payload sub/name/exp decoded · signature opaque (not verified)',
    },
    {
      input: 'Expired access token (three segments) from a 401 response',
      output: 'Payload exp in the past explains Unauthorized; iat/nbf listed for clock-skew checks',
    },
  ],
  '/meta-tag-previewer': [
    {
      input: 'Code, CSS values, or structured text in the editor',
      output: 'Formatted / generated code you can copy',
    },
    {
      input: 'Open /meta-tag-previewer and run a second sample',
      output: 'Formatted / generated code you can copy (iterate settings if the tool has options)',
    },
  ],
  '/live-preview': [
    {
      input: 'Code, CSS values, or structured text in the editor',
      output: 'Formatted / generated code you can copy',
    },
    {
      input: 'Open /live-preview and run a second sample',
      output: 'Formatted / generated code you can copy (iterate settings if the tool has options)',
    },
  ],
  '/javascript-minifier': [
    {
      input: 'Code, CSS values, or structured text in the editor',
      output: 'Formatted / generated code you can copy',
    },
    {
      input: 'Open /javascript-minifier and run a second sample',
      output: 'Formatted / generated code you can copy (iterate settings if the tool has options)',
    },
  ],
  '/table-to-json-converter': [
    {
      input: 'Delimited text or HTML table',
      output: 'JSON array of objects',
    },
    {
      input: 'Open /table-to-json-converter and run a second sample',
      output: 'JSON array of objects (iterate settings if the tool has options)',
    },
  ],
  '/xml-sitemap-tester': [
    {
      input: 'Paste https://example.com/sitemap.xml (or upload file)',
      output:
        'Health score + counts of 200s / redirects / 404s / robots-blocked; sample final URLs',
    },
    {
      input: 'Sitemap URL that 301s to a new path',
      output: 'Redirect hygiene flag — update sitemap to the final canonical URL',
    },
  ],
  '/trip-expense-splitter': [
    {
      input: 'People, expenses, payers',
      output: 'Settlement amounts',
    },
    {
      input: 'Open /trip-expense-splitter and run a second sample',
      output: 'Settlement amounts (iterate settings if the tool has options)',
    },
  ],
  '/stopwatch': [
    {
      input: 'Start stopwatch',
      output: 'Result from Stopwatch you can copy or download',
    },
    {
      input: 'Open /stopwatch and run a second sample',
      output: 'Result from Stopwatch you can copy or download (iterate settings if the tool has options)',
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
  '/ip-address-to-location-finder': [
    {
      input: 'Find IP location',
      output: 'Result from IP Address to Location Finder you can copy or download',
    },
    {
      input: 'Open /ip-address-to-location-finder and run a second sample',
      output: 'Result from IP Address to Location Finder you can copy or download (iterate settings if the tool has options)',
    },
  ],
  '/border-radius-generator': [
    {
      input: 'Per-corner pixel or percent values',
      output: 'border-radius CSS + live box preview',
    },
    {
      input: 'Open /border-radius-generator and run a second sample',
      output: 'border-radius CSS + live box preview (iterate settings if the tool has options)',
    },
  ],
  '/css-minifier': [
    {
      input: 'Code, CSS values, or structured text in the editor',
      output: 'Formatted / generated code you can copy',
    },
    {
      input: 'Open /css-minifier and run a second sample',
      output: 'Formatted / generated code you can copy (iterate settings if the tool has options)',
    },
  ],
  '/gradient-generator': [
    {
      input: 'Code, CSS values, or structured text in the editor',
      output: 'Formatted / generated code you can copy',
    },
    {
      input: 'Open /gradient-generator and run a second sample',
      output: 'Formatted / generated code you can copy (iterate settings if the tool has options)',
    },
  ],
  '/html-formatter': [
    {
      input: '<div class="card"><h1>Hi</h1><p>Welcome<em>friend</em></p></div>',
      output: 'Indented card → h1 / p / em with one logical level per line',
    },
    {
      input: 'Minified <!doctype html><html><head><title>X</title></head><body><main id="app"></main></body></html>',
      output: 'Beautified doctype/html/head/body/main nesting for review',
    },
  ],
  '/json-validator': [
    {
      input: '{"name":"Ada","roles":["admin","editor"],}',
      output: 'Invalid — trailing comma · remove comma → validates and pretty-prints',
    },
    {
      input: '{"ok":true,"count":3}',
      output: 'Valid · indented object with ok/count fields',
    },
  ],
  '/url-encode-decode': [
    {
      input: 'Code, CSS values, or structured text in the editor',
      output: 'Formatted / generated code you can copy',
    },
    {
      input: 'Open /url-encode-decode and run a second sample',
      output: 'Formatted / generated code you can copy (iterate settings if the tool has options)',
    },
  ],
  '/coin-flip': [
    {
      input: 'Click Flip',
      output: 'Heads or Tails plus session counts',
    },
    {
      input: 'Open /coin-flip and run a second sample',
      output: 'Heads or Tails plus session counts (iterate settings if the tool has options)',
    },
  ],
  '/dice-roller': [
    {
      input: 'Die type and count',
      output: 'Face values and sum',
    },
    {
      input: 'Open /dice-roller and run a second sample',
      output: 'Face values and sum (iterate settings if the tool has options)',
    },
  ],
  '/random-number-generator': [
    {
      input: 'Generate random numbers',
      output: 'Result from Random Number Generator you can copy or download',
    },
    {
      input: 'Open /random-number-generator and run a second sample',
      output: 'Result from Random Number Generator you can copy or download (iterate settings if the tool has options)',
    },
  ],
  '/yes-no-generator': [
    {
      input: 'Random Yes or No',
      output: 'Result from Yes/No Generator you can copy or download',
    },
    {
      input: 'Open /yes-no-generator and run a second sample',
      output: 'Result from Yes/No Generator you can copy or download (iterate settings if the tool has options)',
    },
  ],
  '/discord-formatter': [
    {
      input: 'Plain text paste or type-in',
      output: 'Transformed text ready to copy',
    },
    {
      input: 'Open /discord-formatter and run a second sample',
      output: 'Transformed text ready to copy (iterate settings if the tool has options)',
    },
  ],
  '/hashtag-generator': [
    {
      input: 'Plain text paste or type-in',
      output: 'Transformed text ready to copy',
    },
    {
      input: 'Open /hashtag-generator and run a second sample',
      output: 'Transformed text ready to copy (iterate settings if the tool has options)',
    },
  ],
  '/markdown-editor': [
    {
      input: 'Plain text paste or type-in',
      output: 'Transformed text ready to copy',
    },
    {
      input: 'Open /markdown-editor and run a second sample',
      output: 'Transformed text ready to copy (iterate settings if the tool has options)',
    },
  ],
  '/name-generator': [
    {
      input: 'Plain text paste or type-in',
      output: 'Transformed text ready to copy',
    },
    {
      input: 'Open /name-generator and run a second sample',
      output: 'Transformed text ready to copy (iterate settings if the tool has options)',
    },
  ],
  '/username-generator': [
    {
      input: 'Plain text paste or type-in',
      output: 'Transformed text ready to copy',
    },
    {
      input: 'Open /username-generator and run a second sample',
      output: 'Transformed text ready to copy (iterate settings if the tool has options)',
    },
  ],
  '/color-converter': [
    {
      input: 'A color in one notation',
      output: 'The same color in the other notations',
    },
    {
      input: 'Open /color-converter and run a second sample',
      output: 'The same color in the other notations (iterate settings if the tool has options)',
    },
  ],
  '/color-palette-generator': [
    {
      input: 'Image file upload (PNG/JPG/WebP as supported) + on-screen settings',
      output: 'Processed image preview + download',
    },
    {
      input: 'Open /color-palette-generator and run a second sample',
      output: 'Processed image preview + download (iterate settings if the tool has options)',
    },
  ],
  '/text-to-speech': [
    {
      input: 'Convert text to speech',
      output: 'Result from Text to Speech you can copy or download',
    },
    {
      input: 'Open /text-to-speech and run a second sample',
      output: 'Result from Text to Speech you can copy or download (iterate settings if the tool has options)',
    },
  ],
  '/dummy-api-generator': [
    {
      input: 'POST /auth/login · {"email":"demo@fyn.dev","password":"••••"} · expiresIn: "1h"',
      output: '200 · {"token":"eyJ…","expiresIn":"1h"} — use as Authorization: Bearer eyJ…',
    },
    {
      input: 'GET /users with valid Bearer token',
      output: '200 · JSON array of dummy users for UI table binding',
    },
  ],
};

export function getPathExamples(path: string): ToolIoExample[] | null {
  const list = PATH_EXAMPLES[path];
  return list?.length ? list : null;
}
