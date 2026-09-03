import { allTools, type Tool } from '@/data/toolsData';

export interface CategoryHub {
  slug: string;
  path: string;
  name: string;
  title: string;
  metaDescription: string;
  h1: string;
  /** Exact toolsData category names to include */
  categories: string[];
  /** Extra tool paths to include (cross-category clusters) */
  extraPaths?: string[];
  intro: string;
  faqs: { question: string; answer: string }[];
  keywords: string[];
}

export const CATEGORY_HUBS: CategoryHub[] = [
  {
    slug: 'image-tools',
    path: '/image-tools',
    name: 'Image Tools',
    title: 'Free Image Tools Online – Compress, Resize, Convert & Edit',
    metaDescription: 'Browse free online image tools on FYNTools: compress, resize to KB, crop, convert, remove backgrounds, OCR, and PDF compress to 150KB. Fast browser-based editors with no signup.',
    h1: 'Free Online Image Tools',
    categories: ['Image Tools'],
    intro: 'FYNTools Image Tools help designers, marketers, and everyday users edit visuals without installing software. Compress photos for uploads, resize photo to KB for email, convert formats for the web, crop for social platforms, extract text with OCR, and compress PDFs to 150KB — all in your browser with privacy-minded processing.',
    keywords: ['image tools', 'online image editor', 'compress image', 'resize image', 'photo kb resize', 'pdf compressor', 'free photo tools'],
    faqs: [
      { question: 'Are FYNTools image tools free?', answer: 'Yes. Every image utility on this hub is free to use on fyntools.com without mandatory registration.' },
      { question: 'Do image tools upload my photos to a server?', answer: 'Most FYNTools image utilities process files in the browser when possible. Always review each tool page for specifics before handling sensitive images.' },
      { question: 'Which image tool should I start with?', answer: 'Use Image Compressor for file size, Image Resizer for dimensions or email KB targets, Image Format Converter for JPG/PNG/WebP, PDF Compressor for compress PDF to 150KB, and Background Remover for cutouts.' },
    ],
  },
  {
    slug: 'text-tools',
    path: '/text-tools',
    name: 'Text Tools',
    title: 'Free Text Tools Online – Word Count, Case, Cleanup & More',
    metaDescription: 'Free text tools for writers and developers: word counter, case converter, duplicate remover, markdown editor, font changer, and more on FYNTools.',
    h1: 'Free Online Text & Writing Tools',
    categories: ['Text & Writing Tools'],
    intro: 'Polish drafts, normalize strings, and prepare SEO-friendly copy with FYNTools text utilities. From word counts to slug generation and markdown editing, each tool is built for speed in the browser.',
    keywords: ['text tools', 'word counter', 'case converter', 'markdown editor', 'writing tools online'],
    faqs: [
      { question: 'Can I use these text tools for SEO content?', answer: 'Yes. Word Counter, URL Slug Generator, and related utilities help you refine titles, body copy, and URL paths.' },
      { question: 'Is my writing stored?', answer: 'Text tools are designed for local/browser processing whenever possible. Clear the page when finished on shared devices.' },
      { question: 'Do you offer a markdown editor?', answer: 'Yes — open the Markdown Editor from this hub for live preview editing.' },
    ],
  },
  {
    slug: 'developer-tools',
    path: '/developer-tools',
    name: 'Developer Tools',
    title: 'Free Developer Tools – JSON, Hash, JWT, Minifiers & More',
    metaDescription: 'Developer tools online: JSON formatter/validator, hash generator, JWT decoder, HTML/CSS/JS formatters and minifiers, regex tester, and dummy API testing.',
    h1: 'Free Online Developer Tools',
    categories: ['Development Tools'],
    intro: 'Ship faster with browser-based developer utilities. Validate JSON, decode JWTs, minify CSS/JS, format HTML, generate hashes, and test dummy APIs without leaving FYNTools.',
    keywords: ['developer tools', 'json formatter', 'jwt decoder', 'hash generator', 'css minifier'],
    faqs: [
      { question: 'Are these tools safe for production secrets?', answer: 'Avoid pasting production secrets into any online tool. Prefer local tooling for highly sensitive material.' },
      { question: 'Is there a dummy API for practice?', answer: 'Yes — Dummy API Generator provides REST endpoints for login/CRUD practice.' },
      { question: 'Do formatters change my code semantics?', answer: 'Formatters preserve meaning while adjusting whitespace/structure. Always diff critical changes.' },
    ],
  },
  {
    slug: 'network-tools',
    path: '/network-tools',
    name: 'Network Tools',
    title: 'Free Network Tools – IP Lookup & Location Finder',
    metaDescription: 'Network utilities on FYNTools including IP lookup and IP address to location finder. Inspect connection details quickly in your browser.',
    h1: 'Free Online Network Tools',
    categories: ['Network Tools'],
    intro: 'Investigate IP addresses and approximate locations with FYNTools network utilities. Useful for debugging, analytics sanity checks, and learning how public IP metadata works.',
    keywords: ['network tools', 'ip lookup', 'ip location', 'online network utilities'],
    faqs: [
      { question: 'How accurate is IP location?', answer: 'IP geolocation is approximate and can reflect ISP routing rather than exact street addresses.' },
      { question: 'Can I look up any IP?', answer: 'Public lookup tools work with public IPs. Private/reserved ranges will not resolve meaningfully.' },
    ],
  },
  {
    slug: 'pdf-tools',
    path: '/pdf-tools',
    name: 'PDF Tools',
    title: 'Free PDF Tools – Compress PDF to 150KB & Extract Text',
    metaDescription:
      'Free PDF tools: compress PDF to 150KB (bulk or single), extract PDF text, and OCR scans. Browser-based — no signup on FYNTools.',
    h1: 'Free Online PDF Tools — Compress & Extract',
    categories: [],
    extraPaths: ['/pdf-compressor', '/pdf-text-extractor', '/image-to-text', '/image-compressor', '/image-resizer'],
    intro:
      'Prepare documents for strict upload portals and email limits. Compress PDF to 150KB with six quality levels, extract selectable text from PDFs, and use Image to Text when your source is a scan. Pair with Image Compressor and Image Resizer when photos inside a form need a KB target first.',
    keywords: [
      'pdf tools',
      'pdf compressor',
      'compress pdf to 150kb',
      '150kb pdf converter',
      'pdf text extractor',
      'extract text from pdf',
      'compress 150kb pdf',
      'free pdf compressor online',
    ],
    faqs: [
      {
        question: 'Can I compress a PDF to 150KB here?',
        answer:
          'Yes — open PDF Compressor and choose the Compress to ~150 KB level. Single and bulk modes are supported.',
      },
      {
        question: 'Can I extract text from scanned PDFs?',
        answer:
          'Scanned PDFs may need OCR. Try Image to Text for screenshot/scan workflows in addition to PDF Text Extractor.',
      },
      {
        question: 'Are PDF tools free?',
        answer: 'Yes on FYNTools for supported interactive use — no account required.',
      },
    ],
  },
  {
    slug: 'seo-tools',
    path: '/seo-tools',
    name: 'SEO Tools',
    title: 'Free SEO Tools – Meta Preview, Sitemap Tester, Slugs & Hashtags',
    metaDescription: 'SEO tools for creators: meta tag previewer, XML sitemap tester, URL slug generator, hashtag generator, and related utilities on FYNTools.',
    h1: 'Free Online SEO Tools',
    categories: [],
    extraPaths: ['/meta-tag-previewer', '/xml-sitemap-tester', '/url-slug-generator', '/hashtag-generator', '/word-counter', '/ai-text-rewriter'],
    intro: 'Improve click-through and technical hygiene with lightweight SEO utilities. Preview meta tags, validate sitemap XML, craft clean slugs, and brainstorm hashtags — then link out to writing tools for on-page depth.',
    keywords: ['seo tools', 'meta tag preview', 'sitemap tester', 'url slug generator', 'hashtag generator'],
    faqs: [
      { question: 'Do these tools replace a full SEO platform?', answer: 'No — they complement audits with fast checks. Pair them with Search Console and quality content.' },
      { question: 'Why preview meta tags?', answer: 'Seeing title/description length and SERP-style layout helps avoid truncation before publish.' },
    ],
  },
  {
    slug: 'security-tools',
    path: '/security-tools',
    name: 'Security Tools',
    title: 'Free Security Tools – Hash, Password, JWT Decoder',
    metaDescription: 'Security-oriented utilities: hash generator, password generator, JWT decoder, and URL encode/decode for safer everyday development workflows.',
    h1: 'Free Online Security Tools',
    categories: [],
    extraPaths: ['/hash-generator', '/password-generator', '/jwt-decoder', '/url-encode-decode', '/base64-converter'],
    intro: 'Generate strong passwords, inspect JWTs, hash strings, and encode URLs with FYNTools security helpers. Ideal for developers and learners — not a substitute for enterprise security products.',
    keywords: ['security tools', 'password generator', 'hash generator', 'jwt decoder', 'url encode'],
    faqs: [
      { question: 'Should I paste production JWTs here?', answer: 'Prefer local decoding for sensitive tokens. Use sample/expired tokens when learning.' },
      { question: 'Are generated passwords stored?', answer: 'Password generation is designed to run in-browser; copy results and close the tab on shared machines.' },
    ],
  },
  {
    slug: 'converter-tools',
    path: '/converter-tools',
    name: 'Converter Tools',
    title: 'Free Converter Tools – Units, Temperature, Timestamps & Color',
    metaDescription: 'Online converters for units, temperature, timestamps, currency, color, and more. Fast accurate conversions in your browser on FYNTools.',
    h1: 'Free Online Converter Tools',
    categories: ['Converter Tools'],
    intro: 'Convert measurements, temperatures, timestamps, colors, and related values instantly. FYNTools converters are built for students, travelers, and engineers who need quick accurate results.',
    keywords: ['converter tools', 'unit converter', 'temperature converter', 'timestamp converter'],
    faqs: [
      { question: 'Which unit converter should I use?', answer: 'Use Enhanced Unit Converter for broad measurement sets and Temperature Converter for °C/°F/K focused work.' },
    ],
  },
  {
    slug: 'finance-tools',
    path: '/finance-tools',
    name: 'Finance Tools',
    title: 'Free Finance Calculators – EMI, SIP, GST, Tax & More',
    metaDescription: 'Finance calculators online: EMI, SIP, PPF, FD, GST, income tax, currency converter, and related money tools on FYNTools.',
    h1: 'Free Online Finance Tools',
    categories: ['Finance Tools', 'Number Tools'],
    extraPaths: ['/emi-calculator', '/sip-calculator', '/ppf-calculator', '/gst-calculator', '/income-tax-calculator', '/currency-converter', '/fd-calculator'],
    intro: 'Model loans, investments, and taxes with clear finance calculators. Estimates help you compare scenarios — always confirm with official rules or a qualified advisor for decisions.',
    keywords: ['finance calculators', 'emi calculator', 'sip calculator', 'gst calculator', 'income tax calculator'],
    faqs: [
      { question: 'Are calculator results official?', answer: 'No. They are educational estimates. Tax and loan terms vary by lender and jurisdiction.' },
    ],
  },
  {
    slug: 'typing-tools',
    path: '/typing-tools',
    name: 'Typing Tools',
    title: 'Free Typing Tools – Test, Tutor, Games & Competition',
    metaDescription: 'Improve typing speed and accuracy with typing test, tutor, games, and competition modes — free on FYNTools.',
    h1: 'Free Online Typing Tools',
    categories: ['Typing Tools'],
    intro: 'Build WPM and accuracy with structured practice. Take a typing test, follow tutor lessons, play typing games, or compete — all free in the browser.',
    keywords: ['typing test', 'typing tutor', 'typing games', 'wpm test'],
    faqs: [
      { question: 'How often should I practice?', answer: 'Short daily sessions beat rare marathon drills. Track progress with Typing Test weekly.' },
    ],
  },
  {
    slug: 'pregnancy-tools',
    path: '/pregnancy-tools',
    name: 'Pregnancy Tools',
    title: 'Free Pregnancy Tools – Due Date, Week, Diet & Kick Counter',
    metaDescription: 'Pregnancy calculators and trackers: due date, week calculator, weight gain, diet planner, baby kick counter, and more on FYNTools.',
    h1: 'Free Online Pregnancy Tools',
    categories: ['Pregnancy Tools'],
    intro: 'Estimate milestones and organize pregnancy tracking with supportive calculators. These tools are informational — always follow guidance from your healthcare provider.',
    keywords: ['pregnancy calculator', 'due date calculator', 'pregnancy week', 'baby kick counter'],
    faqs: [
      { question: 'Are these medical devices?', answer: 'No. FYNTools pregnancy utilities are informational aids, not medical advice or diagnosis.' },
    ],
  },
  {
    slug: 'period-cycle-tools',
    path: '/period-cycle-tools',
    name: 'Period & Cycle Tools',
    title: 'Free Period & Cycle Tools – Ovulation, Tracker, Safe Days',
    metaDescription: 'Period and cycle tools: ovulation calculator, period tracker, safe days calculator, PMS symptom tracker, and related utilities.',
    h1: 'Free Period & Cycle Tools',
    categories: ['Period & Cycle Tools'],
    intro: 'Track cycles privately with browser-based calculators and logs. Estimates depend on the data you enter and are not a substitute for clinical care or contraception advice.',
    keywords: ['ovulation calculator', 'period tracker', 'safe days calculator', 'pms tracker'],
    faqs: [
      { question: 'Why was /tools?category=Period not indexed?', answer: 'Query-string category filters are noindex. Use this dedicated /period-cycle-tools hub instead for an indexable category page.' },
      { question: 'Is my cycle data stored on a server?', answer: 'Prefer tools that keep data local; clear browser data on shared devices.' },
    ],
  },
  {
    slug: 'utility-tools',
    path: '/utility-tools',
    name: 'Utility Tools',
    title: 'Free Utility Tools – QR, Password, Todo, Randomizers & More',
    metaDescription: 'Everyday utility tools: QR codes, passwords, todos, randomizers, barcodes, weather, and more free online helpers on FYNTools.',
    h1: 'Free Online Utility Tools',
    categories: ['Utility Tools'],
    intro: 'Solve everyday tasks quickly — generate QR codes and passwords, organize todos, flip coins, roll dice, and more with lightweight utilities.',
    keywords: ['utility tools', 'qr code generator', 'password generator', 'todo list online'],
    faqs: [
      { question: 'Do utilities require an account?', answer: 'No. Open any utility and start using it immediately.' },
    ],
  },
  {
    slug: 'timer-tools',
    path: '/timer-tools',
    name: 'Timer Tools',
    title: 'Free Timer Tools – Stopwatch & Countdown',
    metaDescription: 'Online stopwatch and countdown timer for workouts, study sessions, cooking, and productivity — free on FYNTools.',
    h1: 'Free Online Timer Tools',
    categories: ['Timer Tools'],
    intro: 'Time focused work, workouts, and kitchen tasks with a clean stopwatch and countdown timer that run in your browser.',
    keywords: ['stopwatch online', 'countdown timer', 'online timer'],
    faqs: [
      { question: 'Do timers keep running if I switch tabs?', answer: 'Browser throttling may affect background tabs; keep the timer tab active for critical timing.' },
    ],
  },
  {
    slug: 'social-media-tools',
    path: '/social-media-tools',
    name: 'Social Media Tools',
    title: 'Free Social Media Tools – Deep Links, Planner, Downloader & More',
    metaDescription: 'Social media utilities: deep link generator, content planner, DB viewer, downloader helpers, Discord formatter, and text-to-speech.',
    h1: 'Free Social Media Tools',
    categories: ['Video & Social Media Tools'],
    intro: 'Plan posts, craft deep links, format Discord messages, and support social workflows with FYNTools social utilities. Respect platform terms when downloading or republishing content.',
    keywords: ['social media tools', 'deep link generator', 'hashtag generator', 'discord formatter'],
    faqs: [
      { question: 'Can I download any social video?', answer: 'Only use downloaders in ways that comply with platform terms and copyright law.' },
    ],
  },
  {
    slug: 'business-tools',
    path: '/business-tools',
    name: 'Business Tools',
    title: 'Free Business Tools – Invoice Generator & Idea Generator',
    metaDescription: 'Business helpers including invoice generator and business idea generator. Create documents and brainstorm concepts free on FYNTools.',
    h1: 'Free Online Business Tools',
    categories: ['Business Tools'],
    intro: 'Support freelance and small-business workflows with invoice generation and idea brainstorming tools that stay accessible in the browser.',
    keywords: ['business tools', 'invoice generator', 'business idea generator'],
    faqs: [
      { question: 'Are invoices legally valid?', answer: 'Templates help you draft; ensure tax fields meet your local requirements.' },
    ],
  },
  {
    slug: 'number-tools',
    path: '/number-tools',
    name: 'Number Tools',
    title: 'Free Number Tools – Calculators for Math, BMI, Age & More',
    metaDescription: 'Number tools and calculators: percentage, BMI, age, random numbers, simple calculator, and more free math helpers.',
    h1: 'Free Online Number Tools',
    categories: ['Number Tools'],
    intro: 'Crunch everyday numbers with calculators for percentages, BMI, age, dates, and random values — ideal for students and quick professional checks.',
    keywords: ['number tools', 'percentage calculator', 'bmi calculator', 'age calculator'],
    faqs: [
      { question: 'Do calculators replace spreadsheets?', answer: 'They excel at quick single-purpose math; use spreadsheets for complex models.' },
    ],
  },
];

export function getCategoryHub(slugOrPath: string): CategoryHub | undefined {
  const key = slugOrPath.replace(/^\//, '');
  return CATEGORY_HUBS.find((h) => h.slug === key || h.path === `/${key}` || h.path === slugOrPath);
}

const HIDDEN_FROM_HUBS = new Set(['/enhanced-unit-converter', '/add-name-date-photo']);

export function getToolsForHub(hub: CategoryHub): Tool[] {
  const byCategory = allTools.filter((t) => hub.categories.includes(t.category));
  const extras = (hub.extraPaths || [])
    .map((p) => allTools.find((t) => t.path === p))
    .filter(Boolean) as Tool[];
  const map = new Map<string, Tool>();
  [...byCategory, ...extras].forEach((t) => {
    if (!HIDDEN_FROM_HUBS.has(t.path)) map.set(t.path, t);
  });
  return Array.from(map.values());
}

/** Map toolsData category label → hub path */
export function categoryToHubPath(category?: string): string | undefined {
  if (!category) return undefined;
  const hub = CATEGORY_HUBS.find((h) => h.categories.includes(category) || h.name === category);
  return hub?.path;
}

export const CATEGORY_HUB_PATHS = CATEGORY_HUBS.map((h) => h.path);
