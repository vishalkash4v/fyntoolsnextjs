import { PRIMARY_AUTHOR_SLUG } from '@/data/authors';

export type GuideSection = {
  heading: string;
  paragraphs: string[];
  bullets?: string[];
};

export type Guide = {
  slug: string;
  title: string;
  description: string;
  metaDescription: string;
  publishedAt: string;
  updatedAt: string;
  authorSlug: string;
  relatedTools: { name: string; href: string; description?: string }[];
  keywords: string[];
  intro: string[];
  sections: GuideSection[];
  conclusion: string;
};

export const guides: Guide[] = [
  {
    slug: 'url-shortener-best-practices',
    title: 'URL Shortener Best Practices for Campaigns, Print & Trust',
    description:
      'How to create short links that stay trustworthy: custom aliases, UTMs, expiration, QR pairing, and what analytics actually mean.',
    metaDescription:
      'Learn URL shortener best practices: custom aliases, UTM tracking, expiration, QR codes, and safe sharing. Pair with FYN Tools free shortener.',
    publishedAt: '2026-07-20',
    updatedAt: '2026-07-27',
    authorSlug: PRIMARY_AUTHOR_SLUG,
    relatedTools: [
      { name: 'URL Shortener', href: '/url-shortener', description: 'Create trackable short links' },
      { name: 'QR Code Generator', href: '/qr-code-generator', description: 'Print-ready QR codes' },
      { name: 'URL Slug Generator', href: '/url-slug-generator', description: 'Clean path segments' },
    ],
    keywords: ['url shortener best practices', 'utm short links', 'custom short url', 'qr short link'],
    intro: [
      'Short links solve character limits, ugly query strings, and offline typing—but poorly chosen aliases or chained redirects erode trust. This guide explains how marketers and developers should configure shorteners without burning brand equity.',
      'You will learn when to use custom aliases, how to attach UTMs before shortening, why expiration matters for print, and how FYN Tools’ free URL shortener fits a lightweight campaign stack.',
    ],
    sections: [
      {
        heading: 'Why shorten at all?',
        paragraphs: [
          'A short URL maps a compact code to a long destination. Recipients see a cleaner string; your system still redirects to the original page. The value is packaging: social posts, SMS, slides, and packaging inserts become usable.',
          'Shortening does not improve SEO of the destination by itself. It improves shareability and, when UTMs are preserved, channel attribution.',
        ],
      },
      {
        heading: 'Aliases, UTMs, and expiration',
        paragraphs: [
          'Prefer aliases that hint at the destination (/s/spring26 beats a random hash for print trust). Attach source, medium, and campaign parameters before you create the short link so analytics platforms still see them after redirect.',
          'Set expiration on flash sales and events so abandoned flyers stop converting months later.',
        ],
        bullets: [
          'Build UTMs first, then shorten',
          'Avoid shortener-on-shortener chains',
          'Pair print campaigns with QR codes from the short URL',
          'Review /s/{code}/stats for basic click activity',
        ],
      },
      {
        heading: 'Trust and safety',
        paragraphs: [
          'Any shortener can hide a destination until resolve time. Disclose destinations when possible, and treat unknown short links carefully. On FYN Tools, redirects go to the URL you submitted—abuse filters still apply to protect the shared namespace.',
        ],
      },
    ],
    conclusion:
      'Use the free URL Shortener on FYN Tools to create aliases with UTMs, optional expiry, and QR export—then return to this guide when you train teammates on campaign hygiene.',
  },
  {
    slug: 'json-formatter-api-debugging',
    title: 'JSON Formatter Guide: Validate, Beautify & Debug API Payloads',
    description:
      'Understand JSON grammar, common validation failures, when to minify, and how a browser formatter speeds API debugging.',
    metaDescription:
      'Debug APIs faster with a JSON formatter: validate syntax, pretty-print payloads, minify for production. Free tool on FYN Tools.',
    publishedAt: '2026-07-18',
    updatedAt: '2026-07-27',
    authorSlug: PRIMARY_AUTHOR_SLUG,
    relatedTools: [
      { name: 'JSON Formatter', href: '/json-formatter', description: 'Format & validate JSON' },
      { name: 'Base64 Converter', href: '/base64-converter', description: 'Encode transport payloads' },
      { name: 'JWT Decoder', href: '/jwt-decoder', description: 'Inspect token JSON' },
    ],
    keywords: ['json formatter', 'validate json', 'pretty print json', 'api debugging json'],
    intro: [
      'JSON is the lingua franca of APIs and config files. A formatter does not change meaning—it changes whitespace so humans can read nested structures, and a validator catches illegal commas, quotes, and types before code runs.',
      'This guide walks through legal JSON values, the mistakes that break parsers, and when minification helps production transfer size.',
    ],
    sections: [
      {
        heading: 'What valid JSON allows',
        paragraphs: [
          'Objects, arrays, strings (double quotes), numbers, booleans, and null are legal. Trailing commas, single quotes, comments, and undefined are not. Property names must be quoted strings.',
        ],
      },
      {
        heading: 'Beautify vs minify',
        paragraphs: [
          'Beautify (pretty-print) adds indentation for debugging and code review. Minify strips whitespace for CDN caches, mobile bundles, and bandwidth-sensitive APIs. Keep beautified copies in repos; ship minified where size matters.',
        ],
        bullets: [
          'Paste the raw response into the formatter first',
          'Fix the first parse error before chasing logic bugs',
          'Minify only after the document validates',
        ],
      },
      {
        heading: 'API debugging workflow',
        paragraphs: [
          'Copy the body from DevTools, curl, or Postman into FYN Tools’ JSON Formatter, validate, then reformat. Pair with JWT Decoder when the payload is wrapped inside a token, or Base64 Converter when the transport layer encodes binary.',
        ],
      },
    ],
    conclusion:
      'Open the free JSON Formatter to practice on a failing payload, then bookmark this guide for onboarding new engineers to API hygiene.',
  },
  {
    slug: 'word-count-seo-writing',
    title: 'Word Count for SEO Writing: Length, Intent & Readability',
    description:
      'How word and character counts support search intent, meta limits, and readable drafts—without chasing arbitrary word quotas.',
    metaDescription:
      'Use word count for SEO the right way: match intent, respect meta limits, and improve readability. Free Word Counter on FYN Tools.',
    publishedAt: '2026-07-15',
    updatedAt: '2026-07-27',
    authorSlug: PRIMARY_AUTHOR_SLUG,
    relatedTools: [
      { name: 'Word Counter', href: '/word-counter', description: 'Live words, characters, reading time' },
      { name: 'AI Text Rewriter', href: '/ai-text-rewriter', description: 'Clarify drafts' },
      { name: 'Text Case Converter', href: '/text-case-converter', description: 'Fix heading case' },
    ],
    keywords: ['word count seo', 'meta description length', 'reading time', 'content length'],
    intro: [
      'Search quality systems reward helpful coverage of a topic—not a magic word count. Still, length metrics help you hit assignment limits, platform caps, and scannable structure.',
      'Use a word counter while drafting so you adjust before publishing, not after a painful rewrite.',
    ],
    sections: [
      {
        heading: 'Intent beats quotas',
        paragraphs: [
          'A comparison article may need depth; a calculator explainer may stay short if the interactive tool does the work. Match the SERP: if top results are concise how-tos, pad-free clarity wins.',
        ],
      },
      {
        heading: 'Characters for titles and metas',
        paragraphs: [
          'Titles and meta descriptions are character-constrained in search UI. Count characters (with spaces) when polishing SERP snippets. Body word count guides reading time estimates for blog UX.',
        ],
      },
    ],
    conclusion:
      'Draft in your editor, then verify length with the free Word Counter on FYN Tools before you ship.',
  },
  {
    slug: 'password-generator-hygiene',
    title: 'Password Generator Hygiene: Length, Entropy & Managers',
    description:
      'Practical password hygiene: why length beats clever substitutions, how generators help, and why unique passwords still need a manager.',
    metaDescription:
      'Build stronger passwords with length and uniqueness. Learn generator hygiene and use FYN Tools’ free Password Generator safely.',
    publishedAt: '2026-07-12',
    updatedAt: '2026-07-27',
    authorSlug: PRIMARY_AUTHOR_SLUG,
    relatedTools: [
      { name: 'Password Generator', href: '/password-generator', description: 'Create strong random passwords' },
      { name: 'Hash Generator', href: '/hash-generator', description: 'Checksums—not password storage' },
    ],
    keywords: ['password generator', 'strong password', 'password hygiene', 'password manager'],
    intro: [
      'Reusable passwords remain a top breach pattern. A cryptographically random generator creates unique secrets; a password manager stores them so you do not reuse one across banks, email, and social.',
    ],
    sections: [
      {
        heading: 'Length and character classes',
        paragraphs: [
          'Aim for at least 12–16 characters with mixed classes when a site allows it. Avoid memorable phrases that appear in breach corpora. Generate in the browser, copy once, paste into your manager.',
        ],
        bullets: [
          'Never email yourself passwords',
          'Prefer unique passwords per account',
          'Enable MFA wherever available',
        ],
      },
      {
        heading: 'What generators do not do',
        paragraphs: [
          'A generator is not a vault. FYN Tools does not store generated passwords. Hash tools are for checksums—not for “encrypting” passwords you plan to reuse as login secrets.',
        ],
      },
    ],
    conclusion:
      'Generate a fresh secret with the Password Generator, save it in your manager, and rotate any reused credentials immediately.',
  },
  {
    slug: 'qr-codes-for-print-and-packaging',
    title: 'QR Codes for Print & Packaging: Size, Error Correction & Short Links',
    description:
      'Design QR codes that scan on packaging: quiet zones, error correction, short destinations, and testing under real lighting.',
    metaDescription:
      'Make scannable QR codes for print: size, error correction, short URLs. Generate free QR codes on FYN Tools.',
    publishedAt: '2026-07-10',
    updatedAt: '2026-07-27',
    authorSlug: PRIMARY_AUTHOR_SLUG,
    relatedTools: [
      { name: 'QR Code Generator', href: '/qr-code-generator', description: 'Create custom QR codes' },
      { name: 'URL Shortener', href: '/url-shortener', description: 'Shorter destinations for denser codes' },
      { name: 'QR Scanner', href: '/qr-scanner', description: 'Test scans in-browser' },
    ],
    keywords: ['qr code print', 'qr packaging', 'error correction qr', 'short url qr'],
    intro: [
      'QR codes fail in the wild when they are too small, lack quiet zone, or encode enormous URLs. Pair a short link with adequate error correction before you send art to press.',
    ],
    sections: [
      {
        heading: 'Physical design rules',
        paragraphs: [
          'Keep a quiet zone around the module grid. Test prints at final size under phone cameras. Higher error correction helps when logos overlay the center—but increases density.',
        ],
      },
      {
        heading: 'Short destinations',
        paragraphs: [
          'Encode a short FYN Tools link instead of a 200-character tracking URL so modules stay large enough to scan from arm’s length on a shelf tag.',
        ],
      },
    ],
    conclusion:
      'Shorten the destination, generate the QR, then verify with a phone or the in-browser QR Scanner before print.',
  },
  {
    slug: 'browser-privacy-free-online-tools',
    title: 'Browser Privacy When Using Free Online Tools',
    description:
      'How to evaluate free utilities: client-side processing, what not to paste, and how FYN Tools approaches privacy-minded defaults.',
    metaDescription:
      'Use free online tools more safely: prefer client-side processing, avoid secrets in uploads. Learn FYN Tools’ privacy approach.',
    publishedAt: '2026-07-08',
    updatedAt: '2026-07-27',
    authorSlug: PRIMARY_AUTHOR_SLUG,
    relatedTools: [
      { name: 'Hash Generator', href: '/hash-generator', description: 'Local checksums' },
      { name: 'Base64 Converter', href: '/base64-converter', description: 'Encode without accounts' },
      { name: 'Password Generator', href: '/password-generator', description: 'Generate secrets locally' },
    ],
    keywords: ['browser privacy tools', 'client side tools', 'safe online utilities'],
    intro: [
      'Free tools are convenient; not all of them keep data in your browser. Learn to distinguish local processing from uploads, and never paste production secrets into untrusted forms.',
    ],
    sections: [
      {
        heading: 'Client-side vs server-side',
        paragraphs: [
          'Client-side tools transform data in JavaScript without sending the payload to an origin server. Server-side tools may log or store inputs. Prefer local processing for drafts, checksums, and formatting.',
        ],
      },
      {
        heading: 'Practical rules',
        paragraphs: [
          'Use throwaway samples for experiments. For URL shorteners and shared links, assume destinations are public. Read About and tool copy for honest limitations.',
        ],
        bullets: [
          'Avoid pasting API keys or customer PII',
          'Clear clipboard after copying secrets',
          'Prefer HTTPS and modern browsers',
        ],
      },
    ],
    conclusion:
      'Explore FYN Tools utilities that emphasize browser-side workflows, and read our About page for editorial and privacy commitments.',
  },
];

export function getGuide(slug: string): Guide | undefined {
  return guides.find((g) => g.slug === slug);
}

export function getGuidesForTool(toolPath: string): { title: string; href: string }[] {
  return guides
    .filter((g) => g.relatedTools.some((t) => t.href === toolPath))
    .map((g) => ({ title: g.title, href: `/guides/${g.slug}` }));
}

export function getGuidesByAuthor(authorSlug: string): Guide[] {
  return guides.filter((g) => g.authorSlug === authorSlug);
}
