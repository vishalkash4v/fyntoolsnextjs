import type { PageOverride } from '@/data/tool-content/pageOverrides';

/**
 * Tier 1 Batch 2 — Semrush-backed demand pages.
 * These pages already have measurable search demand or ranking signals,
 * so we deepen intent coverage without creating thin programmatic URLs.
 */
export const TIER1_BATCH2_PATHS = [
  '/barcode-generator',
  '/image-resizer',
  '/image-upscaler',
  '/json-formatter',
  '/word-counter',
  '/pdf-compressor',
] as const;

export const tier1Batch2Overrides: Record<(typeof TIER1_BATCH2_PATHS)[number], PageOverride> = {
  '/barcode-generator': {
    title: 'Free Barcode Generator Online — UPC, Code 128 & Bulk Barcodes',
    h1: 'Free Barcode Generator Online',
    description:
      'Generate printable barcodes online from product codes, SKUs, and other values. Create single or bulk barcodes, choose barcode styles, download PNGs, and print label sheets.',
    shortIntro:
      'FYN Tools Barcode Generator turns product numbers, SKUs, and other text values into downloadable barcodes. Enter one value or paste a list, choose a supported barcode type and visual style, then generate PNG files ready for download or printing.',
    introText:
      'The tool is designed for practical barcode workflows rather than a single-image demo. You can generate one barcode or process a bulk list, use numeric-only formats when required, choose paper and label layouts, and download generated barcodes for later use. Barcode values are generated in the browser, so the page can be useful for quick product, inventory, testing, and labeling tasks without creating an account.',
    keywords:
      'barcode generator, free barcode generator, online barcode generator, barcode generator free, generate barcode, UPC barcode generator, Code 128 barcode generator, bulk barcode generator, multiple barcode generator, free online barcode generator, printable barcode generator, barcode maker online',
    category: 'Utility Tools',
    howToUse: [
      'Enter one barcode value per line in the bulk input area. Use a single line when you only need one barcode.',
      'Choose a barcode type and style that matches the data you need to encode.',
      'Adjust text visibility, dimensions, color, paper size, or label layout when your print workflow needs it.',
      'Review the generated barcode previews and check that the encoded value is correct.',
      'Download an individual PNG, download the generated set as a ZIP, or open the print workflow for label sheets.',
    ],
    features: [
      'Single and bulk barcode generation',
      'Supports common barcode formats through the barcode engine',
      'Up to 1,200 input values per generation run',
      'Printable A4, Letter, A5, and custom paper layouts',
      'Label-sheet layout presets and automatic fitting',
      'PNG download for generated barcodes',
      'ZIP download for multiple generated barcodes',
      'Barcode text visibility and styling controls',
      'Pause and cancel controls for large generations',
      'Runs barcode generation in the browser',
    ],
    useCases: [
      {
        title: 'Product and SKU labels',
        description:
          'Turn product identifiers or SKU lists into barcode images that can be downloaded and placed into inventory or labeling workflows.',
      },
      {
        title: 'Bulk inventory labels',
        description:
          'Paste many values at once instead of generating each barcode manually, then download the generated set together.',
      },
      {
        title: 'Printable barcode sheets',
        description:
          'Choose paper and label settings when the final output needs to be printed rather than used only as a digital image.',
      },
      {
        title: 'Developer and QA testing',
        description:
          'Generate predictable sample values or random test values when building and testing barcode scanning workflows.',
      },
      {
        title: 'Retail and internal operations',
        description:
          'Create quick barcode assets for internal stock, packaging, prototypes, and other workflows where a dedicated label system is unnecessary.',
      },
    ],
    examples: [
      {
        input: 'SKU-1001',
        output: 'A generated barcode preview that can be downloaded as PNG.',
      },
      {
        input: '123456789012',
        output: 'A barcode generated from the numeric value when the selected barcode type accepts that format.',
      },
      {
        input: 'SKU-1001\nSKU-1002\nSKU-1003',
        output: 'Three generated barcode images that can be downloaded individually or together as a ZIP.',
      },
    ],
    tips: [
      'Use one value per line when generating multiple barcodes.',
      'Choose a barcode format that matches the character set and length of your data.',
      'Keep enough contrast between the bars and background for reliable scanning.',
      'Check the encoded value before printing a large batch.',
      'For physical labels, test one printed sheet with your scanner before producing the full run.',
    ],
    whenToUse: [
      'You need a quick barcode image without installing desktop software.',
      'You have a list of SKUs or identifiers that should be generated together.',
      'You need printable barcode layouts for A4, Letter, or label workflows.',
      'You are testing a barcode scanner or inventory integration.',
    ],
    faqs: [
      {
        question: 'What is a barcode generator?',
        answer:
          'A barcode generator converts a value such as a product identifier, SKU, or test string into a machine-readable barcode image. The correct barcode type depends on the data and the scanning system that will read it.',
      },
      {
        question: 'Can I generate multiple barcodes at once?',
        answer:
          'Yes. Enter one value per line and the generator can process a bulk list. The current interface allows up to 1,200 values in one generation run.',
      },
      {
        question: 'Can I download barcodes as PNG files?',
        answer:
          'Yes. A single generated barcode can be downloaded as a PNG, while multiple generated barcodes can also be packaged into a ZIP download.',
      },
      {
        question: 'Can I print the generated barcodes?',
        answer:
          'Yes. The generator includes paper and label layout controls for printing generated barcode sets. Test a small print run first to confirm scanner readability and label alignment.',
      },
      {
        question: 'What should I enter for a UPC barcode?',
        answer:
          'Use the value required by your UPC workflow and select a UPC-compatible barcode type. Do not add arbitrary characters when the selected symbology expects numeric data.',
      },
      {
        question: 'Is barcode generation done in my browser?',
        answer:
          'The barcode rendering and bulk generation workflow runs in the browser. Your barcode values are used by the page to create the generated images locally.',
      },
      {
        question: 'Can I create barcodes for testing?',
        answer:
          'Yes. The generator includes sample and random-value workflows that are useful when testing scanners, inventory interfaces, or barcode-reading software.',
      },
      {
        question: 'Will every generated barcode scan successfully?',
        answer:
          'Scanning depends on the barcode type, encoded data, rendered dimensions, print quality, contrast, and the scanner. Always test a physical print before relying on a large batch.',
      },
    ],
    relatedTools: [
      { name: 'Barcode Scanner Online', href: '/barcode-scanner-online', description: 'Read a barcode from a camera or image' },
      { name: 'QR Code Generator', href: '/qr-code-generator', description: 'Create QR codes for URLs and other data' },
      { name: 'QR Scanner', href: '/qr-scanner', description: 'Scan QR codes online' },
      { name: 'Invoice Generator', href: '/invoice-generator', description: 'Create invoices for business workflows' },
      { name: 'Image Resizer', href: '/image-resizer', description: 'Resize generated images for a required dimension' },
    ],
  },

  '/image-resizer': {
    title: 'Free Image Resizer Online — Resize Photos, KB & Social Media Images',
    h1: 'Free Image Resizer Online',
    description:
      'Resize JPG, PNG, and other common images online by pixels, percentage, DPI, or practical presets. Compress to common KB targets and prepare images for social media and forms.',
    shortIntro:
      'Resize an image by width and height, percentage, DPI, or a practical preset. FYN Tools also includes size-target presets for common upload limits and social-media dimensions, so you can prepare an image for the destination instead of guessing the settings.',
    introText:
      'Image resizing changes the pixel dimensions of an image while keeping the original file usable for a new context. The FYN Tools resizer combines manual dimensions with presets for social platforms, email-friendly file sizes, and selected education or application workflows. Maintain the aspect ratio when you want proportional scaling, or set exact dimensions when a destination requires a specific size.',
    keywords:
      'image resizer, resize image, image resizer online, free image resizer, resize image online, photo resizer, resize image in kb, resize image to 20kb, resize image to 50kb, resize image to 100kb, resize image to 200kb, image resizer 50kb, bulk image resizer, social media image resizer, image dimensions resizer',
    category: 'Image Tools',
    howToUse: [
      'Upload the image you want to resize.',
      'Choose a manual resize workflow or select a relevant preset category.',
      'Set the target width and height, percentage, DPI, or file-size target shown by the tool.',
      'Keep aspect ratio enabled when you want proportional dimensions; disable it only when exact stretching is intentional.',
      'Review the output dimensions and estimated file size, then download the resized image.',
    ],
    features: [
      'Resize by width and height',
      'Percentage-based resizing',
      'Aspect-ratio preservation',
      'DPI controls for print-oriented workflows',
      '20 KB, 50 KB, 100 KB, 150 KB, 200 KB, 500 KB, and 1 MB email presets',
      'Social media dimension presets',
      'Education and application-oriented presets',
      'JPEG, PNG, and other formats supported by the browser workflow',
      'Quality control for output',
      'Browser-based image processing',
    ],
    useCases: [
      {
        title: 'Resize an image for a website',
        description:
          'Set a specific width and height or percentage so a large source image fits the dimensions needed by a web page or content system.',
      },
      {
        title: 'Meet an upload-size limit',
        description:
          'Use a KB-oriented preset when an application, email workflow, or portal asks for a maximum image file size.',
      },
      {
        title: 'Prepare social media images',
        description:
          'Start with the relevant platform preset instead of manually searching for common post, profile, story, or cover dimensions.',
      },
      {
        title: 'Prepare exam or application photos',
        description:
          'Use the available education and application presets as a starting point, then verify the exact requirements in the current official notification before submitting.',
      },
    ],
    examples: [
      {
        input: 'Upload a 4000 × 3000 photo → choose a 50% scale',
        output: 'A proportionally resized image at approximately 2000 × 1500 pixels.',
      },
      {
        input: 'Upload a photo → choose the 150 KB preset',
        output: 'The tool applies its 150 KB-oriented resize/quality settings and provides an output for download.',
      },
      {
        input: 'Upload a photo → choose Instagram feed portrait',
        output: 'The tool applies the preset dimensions shown in the social-media preset panel.',
      },
    ],
    tips: [
      'Keep the aspect ratio enabled unless the destination explicitly requires non-proportional dimensions.',
      'For strict upload limits, leave some margin below the stated maximum because portal validation can differ from a displayed target.',
      'Use a higher source resolution when the final image must remain sharp after resizing.',
      'Check the official destination requirements before using education, government, or application presets.',
    ],
    whenToUse: [
      'A website or app requires a specific pixel dimension.',
      'An upload form imposes a maximum image size in KB or MB.',
      'You need a social-media-ready image dimension.',
      'You want to reduce a large photo before attaching or uploading it.',
    ],
    faqs: [
      {
        question: 'What does an image resizer do?',
        answer:
          'An image resizer changes the pixel dimensions of a photo or graphic. Depending on the selected settings, it can also adjust output quality and format so the resulting file fits a particular workflow.',
      },
      {
        question: 'Can I resize an image to 20KB, 50KB, 100KB, or 200KB?',
        answer:
          'The page provides KB-oriented workflows for common upload limits. Because JPEG and other encoded file sizes depend on the image itself, a target such as 20KB or 100KB should be treated as a size goal rather than a guaranteed exact byte count. Check the downloaded file before submitting it.',
      },
      {
        question: 'Can I resize an image to a specific KB size?',
        answer:
          'The resizer provides practical KB-oriented presets such as 50 KB, 100 KB, 150 KB, 200 KB, 500 KB, and 1 MB. Because final file size depends on image content and encoding, treat the preset as a target rather than a mathematical guarantee.',
      },
      {
        question: 'Can I resize an image without changing its proportions?',
        answer:
          'Yes. Keep the aspect-ratio option enabled and change one dimension or the scale. The other dimension can then follow the original proportions.',
      },
      {
        question: 'Can I resize images for Instagram and other social platforms?',
        answer:
          'Yes. The tool includes social-media presets with dimensions for common profile, feed, story, cover, and related workflows. Verify the destination platform requirements before publishing.',
      },
      {
        question: 'What is DPI used for in an image resizer?',
        answer:
          'DPI is useful when a workflow is tied to print dimensions. Pixel dimensions remain the primary factor for many web uploads, while print workflows may also specify physical size and DPI.',
      },
      {
        question: 'Will resizing improve a blurry image?',
        answer:
          'Resizing alone does not restore missing detail. If the source is too small or blurry, an image upscaler or enhancement workflow may be more appropriate.',
      },
      {
        question: 'Is image resizing done in the browser?',
        answer:
          'The core resize workflow uses browser image and canvas capabilities. Large images can still be limited by the memory available to the browser and device.',
      },
    ],
    relatedTools: [
      { name: 'Image Compressor', href: '/image-compressor', description: 'Reduce file size while preserving useful quality' },
      { name: 'Image Upscaler', href: '/image-upscaler', description: 'Increase resolution when the source is too small' },
      { name: 'Image Cropper', href: '/image-cropper', description: 'Crop to a required aspect ratio or composition' },
      { name: 'Image Format Converter', href: '/image-format-converter', description: 'Convert between supported image formats' },
      { name: 'Add Name & Date on Photo', href: '/add-name-date-photo', description: 'Annotate application photos' },
    ],
  },

  '/image-upscaler': {
    title: 'AI Image Upscaler Online — 2x & 4x Photo Enhancement',
    h1: 'AI Image Upscaler Online',
    description:
      'Upscale JPG, PNG, and WebP images by 2x or 4x with photo or illustration modes, enhancement controls, and a before/after preview. Maximum input size is 15MB.',
    shortIntro:
      'Increase image resolution with 2x or 4x upscaling and compare the original with the enhanced result. The tool accepts JPG, PNG, and WebP images up to 15MB and provides photo and illustration modes with adjustable enhancement.',
    introText:
      'Image upscaling creates a larger output from a smaller source by estimating additional pixels. FYN Tools provides 2x and 4x modes, a before/after comparison slider, and separate processing modes for photos and illustrations. Because this tool sends the image to a processing API, do not upload confidential or sensitive files.',
    keywords:
      'image upscaler, online upscaler, AI image upscaler, image enhancer, photo upscaler, upscale image 2x, upscale image 4x, upscale photo online, image resolution enhancer',
    category: 'Image Tools',
    howToUse: [
      'Choose a JPG, PNG, or WebP image up to the current 15MB file limit.',
      'Select 2x or 4x output scaling based on the resolution you need.',
      'Choose Photo or Illustration mode and adjust the enhancement level if required.',
      'Start processing and wait for the server-side image enhancement job to finish.',
      'Compare the original and enhanced image, then download the resulting file.',
    ],
    features: [
      '2x image upscaling',
      '4x image upscaling',
      'Photo and illustration processing modes',
      'Adjustable enhancement level',
      'Before-and-after comparison slider',
      'JPG, PNG, and WebP input support',
      '15MB maximum input size',
      'Dimension validation up to 8,000 pixels per side',
      'Progress and processing status',
      'Downloadable enhanced output',
    ],
    useCases: [
      {
        title: 'Enlarge a small photo',
        description:
          'Create a higher-resolution version when the original image is too small for a larger display, document, or creative workflow.',
      },
      {
        title: 'Prepare an illustration',
        description:
          'Use the illustration mode when enlarging graphics or artwork where the source has different visual characteristics from a photograph.',
      },
      {
        title: 'Compare enhancement quality',
        description:
          'Use the before/after slider to inspect how much detail and sharpness changed before downloading the result.',
      },
    ],
    examples: [
      {
        input: '1200 × 800 JPG → 2x',
        output: 'An enhanced output targeted at approximately 2400 × 1600 pixels, subject to processing limits.',
      },
      {
        input: '1000 × 1000 PNG → 4x',
        output: 'An enhanced output targeted at approximately 4000 × 4000 pixels, subject to the tool limits.',
      },
    ],
    tips: [
      'Start with 2x when the source is reasonably clear; 4x is more demanding and can magnify source artifacts.',
      'Use Photo mode for photographs and Illustration mode for graphics or artwork.',
      'Inspect the before/after slider before downloading so you can catch unwanted artifacts.',
      'Do not upload confidential, private, or regulated images because processing uses a server endpoint.',
    ],
    whenToUse: [
      'The original image is too small for the intended display size.',
      'You need a larger image without manually recreating the artwork.',
      'You want to compare an enhanced image with its original before downloading.',
    ],
    faqs: [
      {
        question: 'What is an AI image upscaler?',
        answer:
          'An image upscaler increases the pixel dimensions of an image while using an enhancement model or algorithm to estimate additional detail. It can make a small source more usable at larger sizes, but it cannot perfectly recreate detail that was never captured.',
      },
      {
        question: 'Does FYN Tools support 2x and 4x upscaling?',
        answer:
          'Yes. The current interface provides 2x and 4x scale options.',
      },
      {
        question: 'What image formats can I upload?',
        answer:
          'The current uploader accepts JPG, JPEG, PNG, and WebP images.',
      },
      {
        question: 'What is the maximum image size?',
        answer:
          'The current interface limits the input file to 15MB and rejects images whose width or height exceeds 8,000 pixels.',
      },
      {
        question: 'Is image upscaling processed in my browser?',
        answer:
          'No. This tool uses a server-side image processing endpoint. Do not upload confidential or sensitive images.',
      },
      {
        question: 'Can upscaling make a blurry photo perfectly sharp?',
        answer:
          'No. Upscaling can improve the apparent resolution, but it cannot recover all information that was absent from the original image. Results vary with source quality and image content.',
      },
      {
        question: 'How can I compare the original and enhanced images?',
        answer:
          'After processing, use the before/after slider to move between the original and enhanced versions and inspect changes in detail.',
      },
    ],
    relatedTools: [
      { name: 'Image Resizer', href: '/image-resizer', description: 'Resize an image to exact dimensions' },
      { name: 'Image Compressor', href: '/image-compressor', description: 'Reduce output file size' },
      { name: 'Image Cropper', href: '/image-cropper', description: 'Crop before upscaling' },
      { name: 'Image Format Converter', href: '/image-format-converter', description: 'Convert the enhanced image format' },
    ],
  },

  '/json-formatter': {
    title: 'Free JSON Formatter & Validator — Beautify or Minify JSON Online',
    h1: 'Free JSON Formatter & Validator Online',
    description:
      'Format, validate, beautify, and minify JSON online. Paste JSON to check syntax, inspect errors, create readable output, or produce compact JSON for APIs and configuration files.',
    shortIntro:
      'Paste JSON into FYN Tools to validate its syntax, beautify it with indentation, or minify it into compact JSON. The formatter is useful for API responses, configuration files, debugging, and preparing payloads for development work.',
    introText:
      'JSON is easy for machines to parse but can become difficult to read when it is minified or manually edited. A formatter expands valid JSON into a structured layout, while a minifier removes unnecessary whitespace. FYN Tools performs these transformations with the browser JavaScript JSON parser, so the tool can quickly identify invalid JSON before you copy the result into another application.',
    keywords:
      'json formatter, json validator, json beautifier, json formatter online, format json, beautify json, minify json, json checker, validate json, json pretty print',
    category: 'Development Tools',
    howToUse: [
      'Paste or type JSON into the input editor.',
      'Use the live validation state to see whether the current input parses as JSON.',
      'Choose Beautify JSON to create readable indented output or Minify JSON for compact output.',
      'Review any parser error shown when the input is invalid and correct the JSON syntax.',
      'Copy the formatted or minified result for your API, configuration, debugging, or development workflow.',
    ],
    features: [
      'JSON syntax validation',
      'Beautify JSON with readable indentation',
      'Minify JSON for compact payloads',
      'Live validity feedback while editing',
      'Parser error message display',
      'Copy formatted output',
      'Copy minified output',
      'Clear and re-edit input quickly',
      'Browser-based JSON parsing',
      'Local input storage for the editor workflow',
    ],
    useCases: [
      {
        title: 'API response debugging',
        description:
          'Paste a compact API response into the formatter to make nested objects and arrays easier to inspect.',
      },
      {
        title: 'Configuration cleanup',
        description:
          'Beautify a valid configuration object before reviewing or editing it manually.',
      },
      {
        title: 'Compact API payloads',
        description:
          'Minify valid JSON when you need a compact representation without unnecessary whitespace.',
      },
      {
        title: 'Syntax checking',
        description:
          'Use the parser feedback to catch malformed JSON before sending it to an API or committing it to a project.',
      },
    ],
    examples: [
      {
        input: '{"name":"FYN","active":true,"count":3}',
        output: '{\n  "name": "FYN",\n  "active": true,\n  "count": 3\n}',
      },
      {
        input: '{ "user": { "id": 42, "role": "admin" } }',
        output: '{\n  "user": {\n    "id": 42,\n    "role": "admin"\n  }\n}',
      },
    ],
    tips: [
      'If validation fails, start at the parser error position and check quotes, commas, brackets, and braces.',
      'Remember that JSON uses double quotes for property names and string values.',
      'Use beautified output when reviewing nested structures and minified output when compactness matters.',
      'Do not paste API keys, passwords, tokens, or other production secrets into an online tool.',
    ],
    whenToUse: [
      'An API response is difficult to read because it is minified.',
      'You need to check JSON syntax before sending a request.',
      'You need a compact JSON payload without formatting whitespace.',
      'You are debugging nested objects or arrays.',
    ],
    faqs: [
      {
        question: 'What is a JSON formatter?',
        answer:
          'A JSON formatter takes valid JSON and presents it with indentation and line breaks so objects and arrays are easier to read. A JSON formatter may also include syntax validation and minification.',
      },
      {
        question: 'Can this tool validate JSON?',
        answer:
          'Yes. The editor parses the input as JSON and shows a valid or invalid state. Parser errors are displayed when the input cannot be parsed.',
      },
      {
        question: 'Can I minify JSON?',
        answer:
          'Yes. Choose the Minify JSON tab to remove formatting whitespace from valid JSON and produce a compact representation.',
      },
      {
        question: 'Why is my JSON invalid?',
        answer:
          'Common causes include missing commas, unmatched braces or brackets, single quotes instead of JSON double quotes, trailing syntax errors, and unquoted property names.',
      },
      {
        question: 'Is my JSON uploaded to a server?',
        answer:
          'The JSON parsing and formatting logic runs in the browser. The editor also uses browser storage for its input workflow. Avoid entering production secrets into any online application regardless of where processing occurs.',
      },
      {
        question: 'Can I format large JSON files?',
        answer:
          'The practical limit depends on browser memory and the size of the text you paste. Very large JSON documents can make a browser tab slower.',
      },
    ],
    relatedTools: [
      { name: 'JSON Validator', href: '/json-validator', description: 'Check JSON validity' },
      { name: 'JWT Decoder', href: '/jwt-decoder', description: 'Inspect JWT header and payload claims' },
      { name: 'Base64 Converter', href: '/base64-converter', description: 'Encode and decode Base64 text' },
      { name: 'URL Encode Decode', href: '/url-encode-decode', description: 'Encode or decode URL strings' },
      { name: 'Dummy API Generator', href: '/dummy-api-generator', description: 'Test REST API workflows' },
    ],
  },

  '/word-counter': {
    title: 'Free Word Counter Online — Words, Characters, Sentences & Paragraphs',
    h1: 'Free Word Counter Online',
    description:
      'Count words, characters, characters without spaces, sentences, and paragraphs instantly. Paste or type text into this free browser-based word counter.',
    shortIntro:
      'FYN Tools Word Counter gives you live counts for words, characters, characters without spaces, sentences, and paragraphs while you type or paste text. It is useful for essays, applications, social posts, metadata, scripts, and content editing.',
    introText:
      'A word count is often only one part of a writing limit. The tool also separates total characters from characters without spaces and counts sentences and paragraphs, so you can check several common requirements from one editor. Counts update as text changes, which makes it practical for drafting and trimming copy before submission.',
    keywords:
      'word counter, word counter online, free word counter, character counter, character count, sentence counter, paragraph counter, word count checker, words characters counter',
    category: 'Text & Writing Tools',
    howToUse: [
      'Paste your text into the editor or type directly into it.',
      'Read the live Words count to check the total number of whitespace-separated words.',
      'Use Characters and Characters (No Spaces) when a platform has a character limit.',
      'Check Sentences and Paragraphs when a document or assignment has structural requirements.',
      'Edit the text and watch the counters update instantly.',
    ],
    features: [
      'Live word count',
      'Character count including spaces',
      'Character count excluding whitespace',
      'Sentence count',
      'Paragraph count',
      'Instant updates while typing',
      'Copy original text from the page',
      'Browser-based counting',
      'Mobile-friendly editor',
    ],
    useCases: [
      {
        title: 'Essay and assignment limits',
        description:
          'Check the word count while drafting essays, reports, assignments, and other written submissions.',
      },
      {
        title: 'Social media copy',
        description:
          'Use the character count to trim captions, short posts, or profile text to a platform-specific limit.',
      },
      {
        title: 'SEO and metadata drafts',
        description:
          'Check copy length while writing titles, descriptions, snippets, and supporting content.',
      },
      {
        title: 'Editing and proofreading',
        description:
          'Compare word, sentence, and paragraph counts as you shorten or restructure a draft.',
      },
    ],
    examples: [
      {
        input: 'This is a simple sentence example.',
        output: 'Words: 6 · Characters: 36 · Characters without spaces: 30 · Sentences: 1 · Paragraphs: 1',
      },
      {
        input: 'First paragraph.\nSecond paragraph.',
        output: 'The counter reports separate sentence and paragraph totals based on the entered line breaks and punctuation.',
      },
    ],
    tips: [
      'Use the character-without-spaces count when a form explicitly excludes spaces.',
      'Remember that punctuation is included in the character count.',
      'The sentence counter uses common punctuation such as periods, exclamation marks, and question marks.',
      'For formal submissions, compare the tool result with the destination platform because different systems can define a word differently.',
    ],
    whenToUse: [
      'A document has a maximum or minimum word count.',
      'A form or social platform imposes a character limit.',
      'You need a quick sentence or paragraph count.',
      'You want a lightweight browser-based counter without installing software.',
    ],
    faqs: [
      {
        question: 'What does this word counter count?',
        answer:
          'The current tool reports words, total characters, characters without spaces, sentences, and paragraphs. Counts update as you type or paste text.',
      },
      {
        question: 'How are words counted?',
        answer:
          'The current implementation trims the text and separates words using whitespace, so consecutive spaces, tabs, and line breaks act as separators.',
      },
      {
        question: 'Are spaces included in the character count?',
        answer:
          'Yes. The Characters count uses the full entered text length, while Characters (No Spaces) removes whitespace before counting.',
      },
      {
        question: 'How are sentences counted?',
        answer:
          'The current implementation counts non-empty segments separated by common sentence terminators: periods, exclamation marks, and question marks.',
      },
      {
        question: 'How are paragraphs counted?',
        answer:
          'Paragraphs are counted from non-empty groups separated by one or more line breaks.',
      },
      {
        question: 'Can I use the word counter on mobile?',
        answer:
          'Yes. The editor is designed to work in modern desktop and mobile browsers.',
      },
      {
        question: 'Is the text uploaded to a server?',
        answer:
          'The counting logic runs in the browser. Avoid entering confidential documents or production secrets into any online tool.',
      },
    ],
    relatedTools: [
      { name: 'Text Case Converter', href: '/text-case-converter', description: 'Change capitalization and text case' },
      { name: 'Whitespace Remover', href: '/whitespace-remover', description: 'Clean extra spaces and line breaks' },
      { name: 'Text Reverser', href: '/text-reverser', description: 'Reverse text for transformations and testing' },
      { name: 'AI Text Rewriter', href: '/ai-text-rewriter', description: 'Rewrite text with different styles' },
    ],
  },

  '/pdf-compressor': {
    title: 'Free PDF Compressor Online — Compress PDF to 150KB & More',
    h1: 'Free PDF Compressor Online',
    description:
      'Compress PDF files online with multiple quality levels and a 150KB-oriented option. Process single or bulk PDFs in the browser, preview estimated output size, and download compressed files.',
    shortIntro:
      'FYN Tools PDF Compressor reduces PDF file size with several compression levels, including a 150KB-oriented option. It supports single PDFs and bulk batches, shows an estimated output size before processing, and keeps the core compression workflow in the browser.',
    introText:
      'PDF compression is useful when a portal, email system, or document workflow limits upload size. The FYN Tools compressor lets you choose from several quality levels and compare the estimated result before processing. The current interface accepts PDFs up to 40MB each and can process up to 12 files in bulk mode.',
    keywords:
      'pdf compressor, pdf compressor online, free pdf compressor, compress pdf, pdf file compressor, online pdf compressor, compress pdf to 150kb, pdf compressor to 100kb, pdf compressor to 200kb, pdf compressor to 300kb, pdf compressor to 500kb, pdf size compressor, reduce pdf size, bulk pdf compressor',
    category: 'PDF Tools',
    howToUse: [
      'Choose Single PDF or Bulk mode depending on how many files you need to process.',
      'Upload one or more PDF files within the current 40MB-per-file limit.',
      'Select a compression level based on the balance between file size and document quality you need.',
      'Review the estimated output size shown by the tool before starting compression.',
      'Run compression, inspect the completed file, and download the compressed PDF.',
    ],
    features: [
      'Multiple PDF compression levels',
      '150KB-oriented compression option',
      'Single PDF compression',
      'Bulk processing for up to 12 PDFs',
      '40MB maximum input per PDF',
      'Estimated output size before processing',
      'Compression progress display',
      'Individual PDF downloads',
      'Browser-based core compression workflow',
    ],
    useCases: [
      {
        title: 'Government and application uploads',
        description:
          'Reduce a PDF when an application portal specifies a maximum file size such as 150KB. Always verify the portal requirement and the final file before submitting.',
      },
      {
        title: 'Email attachments',
        description:
          'Shrink documents before attaching them to email when the original PDF is unnecessarily large.',
      },
      {
        title: 'Bulk document cleanup',
        description:
          'Process a group of PDFs together instead of repeating the compression workflow one file at a time.',
      },
      {
        title: 'Archive and sharing',
        description:
          'Reduce document size when storage or transfer size matters more than retaining the original PDF byte-for-byte.',
      },
    ],
    examples: [
      {
        input: 'Upload a 2.4MB PDF → choose Optimized',
        output: 'The tool estimates a smaller output, compresses the PDF, and provides the result for download.',
      },
      {
        input: 'Upload a PDF → choose the 150KB-oriented level',
        output: 'The tool applies its target-oriented compression settings; the final size depends on the source PDF and its contents.',
      },
      {
        input: 'Bulk mode → upload 6 PDFs',
        output: 'The six files are queued and processed one by one, with individual compressed outputs available for download.',
      },
    ],
    tips: [
      'Choose the least aggressive compression that still meets the destination size requirement.',
      'Check the final PDF after compression, especially when it contains scanned pages or important small text.',
      'For strict portal limits, aim below the stated maximum rather than relying on an exact target.',
      'Keep an original copy when the compressed PDF is needed for future editing or archival.',
    ],
    whenToUse: [
      'A website or application portal rejects a PDF because it is too large.',
      'You need to send a PDF as an email attachment.',
      'You have several PDFs that need size reduction in one session.',
      'You want a smaller copy for sharing while retaining the original file separately.',
    ],
    faqs: [
      {
        question: 'What does a PDF compressor do?',
        answer:
          'A PDF compressor reduces the size of a PDF by applying document and image compression. The amount of reduction depends on the source file, embedded images, fonts, and the selected compression level.',
      },
      {
        question: 'Can I compress a PDF to 100KB, 200KB, 300KB, or 500KB?',
        answer:
          'You can use the available compression levels to reduce a PDF toward a required upload limit, but the current tool does not guarantee an exact byte target for every document. The 150KB-oriented option is specifically provided for strict small-file workflows; always verify the final downloaded size.',
      },
      {
        question: 'Can I compress a PDF to 150KB?',
        answer:
          'The tool includes a 150KB-oriented compression option. A strict final size is not guaranteed for every PDF because source documents vary, so check the resulting file size before uploading it.',
      },
      {
        question: 'Can I compress multiple PDFs at once?',
        answer:
          'Yes. Bulk mode can queue up to 12 PDFs in the current interface, with a 40MB maximum input size per file.',
      },
      {
        question: 'What is the maximum PDF size?',
        answer:
          'The current interface accepts PDFs up to 40MB per file. Device memory and browser performance can still affect very large documents.',
      },
      {
        question: 'Is PDF compression done in the browser?',
        answer:
          'The core PDF compression workflow is implemented in the browser. This can make large documents more demanding on device memory and processing resources.',
      },
      {
        question: 'Will compression reduce PDF quality?',
        answer:
          'It can. More aggressive compression can reduce image quality or other document fidelity. Choose the least aggressive level that meets your size requirement and inspect the output.',
      },
      {
        question: 'Should I keep the original PDF?',
        answer:
          'Yes. Keep the original when the compressed file is only a smaller copy for upload or sharing, especially if you may need to edit or reprocess the source later.',
      },
    ],
    relatedTools: [
      { name: 'Image Compressor', href: '/image-compressor', description: 'Reduce image file sizes before placing them in documents' },
      { name: 'PDF Text Extractor', href: '/pdf-text-extractor', description: 'Extract text from PDF documents' },
      { name: 'Image to Text', href: '/image-to-text', description: 'Extract text from image files' },
      { name: 'PDF Merger', href: '/pdf-merger', description: 'Combine PDF documents before sharing' },
    ],
  },
};
