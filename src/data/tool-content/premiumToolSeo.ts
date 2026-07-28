/**
 * Premium long-form SEO blocks for high-intent / GSC recovery tools.
 * Merged on top of pageOverrides + toolSeoContent in buildUniqueToolContent.
 */
import type { FullSeoPageContent } from '@/data/seo-pages/types';

type PremiumPartial = Partial<FullSeoPageContent> & {
  /** Extra body paragraphs rendered after overview (information gain) */
  deepParagraphs?: string[];
};

export const premiumToolSeo: Record<string, PremiumPartial> = {
  '/url-shortener': {
    title: 'Free URL Shortener Online',
    h1: 'Free URL Shortener Online — Custom Links, UTM & QR',
    metaDescription:
      'Shorten long URLs free with custom aliases, UTM tracking, bulk shorten, QR codes, and click stats. No signup. Create trackable short links on FYN Tools.',
    keywords: [
      'url shortener',
      'free url shortener',
      'short link generator',
      'custom url shortener',
      'utm link shortener',
      'bulk url shortener',
      'short url with qr code',
      'link shortener free',
    ],
    introParagraphs: [
      'A URL shortener turns a long destination address into a compact redirect that is easier to share on social posts, SMS, email, QR codes, and print. FYN Tools’ free URL shortener creates fyntools.com/s/… links with optional custom aliases, UTM parameters, expiration, password protection, bulk shortening, and QR downloads — without forcing an account.',
      'Unlike bare paste-and-hope shorteners, this page is built for marketers and creators who need campaign hygiene: add source/medium/campaign before you shorten, set an expiry when a promo ends, and open click stats for each code. The live tool sits above this guide so you can shorten a link in seconds, then read how redirects, trust, and tracking actually work.',
      'Short links solve three practical problems: character limits on social platforms, ugly query strings that break in plain-text email, and offline media where typing a 120-character URL is unrealistic. A memorable alias (for example /s/spring25) also signals intent better than a random hash when you print the link on packaging or slides.',
    ],
    overview:
      'Technically, a short URL stores a mapping from a short code to an originalUrl on the server. When someone visits /s/{code}, FYN Tools resolves the mapping, records a click event when appropriate, and sends the visitor to the destination (after an interstitial or password unlock if you enabled those options). Your long URL is not rewritten into a different site — the shortener only redirects. That distinction matters for trust: recipients still land on the site you chose, while you gain a cleaner share surface and basic analytics.',
    howItWorks:
      'Paste a full https URL (or up to 20 URLs in bulk). Optionally set a custom alias, attach UTM parameters, choose expiration, and enable a password. On create, the API stores the mapping and returns a short code. The shareable link always uses your current site origin plus /s/{code} so redirects stay on FYN Tools. Opening the short link loads a resolve endpoint, shows a brief interstitial (or password gate), then navigates to the original URL. Stats live at /s/{code}/stats for recent click activity.',
    howToUse: [
      'Paste your long URL (or up to 20 URLs, one per line, in bulk mode).',
      'Optionally add a custom alias, UTM parameters, expiration, or a password.',
      'Click Shorten URL, then copy the short link or download a QR code.',
      'Share the link, and open /s/{code}/stats anytime to review basic click activity.',
    ],
    whenToUse: [
      'Social bios, posts, and stories where character count or clutter matters',
      'Email and SMS campaigns with long tracking URLs that wrap badly',
      'Print, packaging, and slides where people must type or scan a link',
      'A/B channel tests using UTM source/medium/campaign on the same destination',
      'Temporary promos that should stop working after a set date',
    ],
    useCases: [
      {
        title: 'Social and influencer campaigns',
        description:
          'Creators replace tracking-heavy affiliate or landing URLs with a short branded alias. Pair with a QR code for Stories or print inserts so mobile users never type the path.',
      },
      {
        title: 'Email marketing and newsletters',
        description:
          'Plain-text emails break long query strings across lines. A short link stays intact, and UTM fields you attach before shortening keep Google Analytics / your ESP attribution intact.',
      },
      {
        title: 'Offline and packaging',
        description:
          'Product inserts, event badges, and posters use short links or QR codes. Set expiration after the event so abandoned print does not keep sending traffic forever.',
      },
      {
        title: 'Product launches and waitlists',
        description:
          'Teams bulk-shorten variant landing pages, assign readable aliases per channel, and compare click counts to see which creative drove visits.',
      },
    ],
    examples: [
      {
        input: 'https://example.com/campaigns/2026/spring-sale?utm_source=newsletter&utm_medium=email',
        output: 'https://fyntools.com/s/spring26 (alias) → same destination with UTMs preserved',
      },
      {
        input: 'Bulk: 5 product URLs + campaign UTM medium=cpc',
        output: 'Five short codes, shared history in the browser, optional QR per link',
      },
    ],
    tips: [
      'Prefer custom aliases that hint at the destination — trust rises when recipients can predict the landing page.',
      'Attach UTMs before shortening so the final destination keeps analytics parameters.',
      'Use expiration for flash sales; leave evergreen content without expiry.',
      'Do not chain shortener-on-shortener redirects — each hop adds latency and spam-filter risk.',
      'For scannable print, generate a QR from the short URL so phone cameras open the interstitial cleanly.',
    ],
    commonMistakes: [
      'Shortening already-shortened or opaque redirect chains (harder to audit, slower to open).',
      'Skipping UTM when you need channel attribution — you cannot add it after people already clicked.',
      'Using generic spammy aliases that look like phishing; pick readable campaign names.',
      'Expecting enterprise-grade analytics — this tool gives practical click counts, not a full BI suite.',
    ],
    advantages: [
      'Free, no mandatory signup for everyday shortening',
      'Custom aliases, UTM builder, bulk mode, and QR in one panel',
      'Optional expiration and password gates for campaign control',
      'Click stats per code without installing desktop software',
      'Runs as a lightweight web utility on desktop and mobile browsers',
    ],
    benefits: [
      'Ship cleaner links that survive social character limits and plain-text email wrapping.',
      'Keep campaign UTMs under your control instead of relying on a third-party shortener’s opaque UI.',
      'Give offline audiences a typeable or scannable path without reprinting when you only change the destination mapping.',
      'Retire dead campaigns with expiration so old flyers stop converting.',
    ],
    faqs: [
      {
        question: 'Is this URL shortener free?',
        answer:
          'Yes. You can create short links on FYN Tools without paying or creating an account for normal interactive use. Abuse protection may limit bulk spam.',
      },
      {
        question: 'Do short links expire?',
        answer:
          'By default they do not. Choose a preset or custom expiration when you create the link if the campaign should stop resolving after a date.',
      },
      {
        question: 'Can I use a custom alias?',
        answer:
          'Yes. Pick an available alias so the path reads like /s/your-brand instead of a random code. Aliases that are taken or blocked will be rejected.',
      },
      {
        question: 'Can I track clicks?',
        answer:
          'Yes. Open /s/{code}/stats for click totals and recent activity. For channel-level marketing attribution, attach UTM parameters before you shorten.',
      },
      {
        question: 'Are shortened URLs safe?',
        answer:
          'We redirect to the destination you submitted and do not inject alternate sites. Still treat unknown short links carefully — any shortener can hide a destination until you resolve it.',
      },
      {
        question: 'Why use FYN Tools instead of a generic shortener?',
        answer:
          'This tool combines shortening with UTM building, bulk create, QR download, optional passwords/expiry, and on-site stats — tuned for marketers who already use FYN Tools utilities like QR Code Generator and deep-link helpers.',
      },
    ],
    relatedTools: [
      { name: 'QR Code Generator', href: '/qr-code-generator', description: 'Turn short or long URLs into scannable codes' },
      { name: 'URL Slug Generator', href: '/url-slug-generator', description: 'Build clean path segments for your own site' },
      { name: 'Social Deep Link Generator', href: '/social-media-deep-link-generator', description: 'App-aware open links with web fallback' },
      { name: 'JSON Formatter', href: '/json-formatter', description: 'Validate API payloads that power your campaigns' },
    ],
    conclusion:
      'Use the free URL shortener above to create trackable, shareable links with the controls marketers actually need — aliases, UTMs, bulk, QR, expiry, and stats — then jump to related FYN Tools when your workflow moves to QR print or app deep links.',
    deepParagraphs: [
      'Google evaluates utility pages on whether the visible content matches the interactive promise. That is why this page keeps the shortener first, then explains redirects, UTMs, and safety in plain language instead of thin filler. If you are recovering from “Discovered – currently not indexed,” stable canonicals (no query strings), clear H1/H2 structure, FAQ schema, and unique how-to copy are the levers that help recrawl.',
      'For information gain versus other free shorteners, emphasize what is different here: UTM composition before create, logo-aware QR export, password unlock interstitial, and stats under the same /s/ namespace you share. Those features are demonstrated in the UI above, not only mentioned in marketing copy.',
    ],
  },

  '/json-formatter': {
    title: 'Free JSON Formatter & Validator',
    h1: 'Free JSON Formatter, Validator & Beautifier',
    metaDescription:
      'Format, validate, beautify, and minify JSON online free. Catch syntax errors instantly, pretty-print for debugging, or compress for APIs. No signup on FYN Tools.',
    keywords: [
      'json formatter',
      'json validator',
      'json beautifier',
      'minify json',
      'pretty print json',
      'format json online',
      'json formatter free',
    ],
    introParagraphs: [
      'JSON (JavaScript Object Notation) is the standard text format for APIs, config files, and browser storage. A JSON formatter pretty-prints nested objects and arrays with indentation so humans can read them; a validator checks that braces, commas, and quotes follow the JSON grammar before you ship a payload.',
      'FYN Tools’ free JSON formatter runs in your browser: paste raw JSON, format for readability, minify for production, and validate syntax with clear errors. Keep the tool above the fold, then use the guide below when you need to understand why a payload fails or when minification helps.',
    ],
    overview:
      'Valid JSON is a strict subset of JavaScript object literal syntax: property names must be double-quoted strings, trailing commas are illegal, and values are limited to objects, arrays, strings, numbers, booleans, and null. Formatters do not change meaning — they only change whitespace. Minifiers remove whitespace to shrink transfer size. Validators parse the text and report the first syntax failure so you can fix line-level mistakes quickly.',
    howItWorks:
      'The editor accepts pasted text, attempts JSON.parse (or an equivalent parse), and on success re-serializes with indentation (beautify) or without (minify). Invalid input surfaces a parse error instead of silently corrupting data. Nothing is uploaded for formatting — processing stays on your device whenever the browser can handle the payload size.',
    howToUse: [
      'Paste your JSON into the editor above.',
      'Click Format / Beautify to pretty-print with indentation.',
      'Use Validate to confirm the document is syntactically correct.',
      'Click Minify when you need a compact payload for production or network transfer.',
      'Copy the result to your clipboard and paste it into your API client or codebase.',
    ],
    useCases: [
      {
        title: 'API debugging',
        description: 'Developers paste responses from curl, Postman, or browser DevTools to find missing commas and mismatched braces before writing client code.',
      },
      {
        title: 'Config and CI review',
        description: 'Teams beautify package manifests, Terraform JSON, and workflow configs so pull-request diffs stay reviewable.',
      },
      {
        title: 'Production payloads',
        description: 'Minify large JSON before embedding in mobile apps or caching layers where every kilobyte matters.',
      },
      {
        title: 'Teaching and onboarding',
        description: 'Students validate homework payloads and learn legal JSON types without installing an IDE plugin.',
      },
    ],
    faqs: [
      {
        question: 'Is this JSON formatter free?',
        answer: 'Yes. Format, validate, and minify JSON on FYN Tools without creating an account.',
      },
      {
        question: 'Does formatting change my data?',
        answer: 'No. Pretty-print only changes whitespace and indentation. Object keys and values stay the same.',
      },
      {
        question: 'When should I minify JSON?',
        answer: 'Minify for production APIs, CDN caches, and anywhere transfer size matters. Keep beautified JSON in repos and debugging sessions.',
      },
      {
        question: 'Why is my JSON invalid?',
        answer: 'Common causes: single quotes, trailing commas, unquoted keys, comments, or NaN/undefined values. The validator points to the failing location so you can fix it.',
      },
    ],
    relatedTools: [
      { name: 'HTML Formatter', href: '/html-formatter', description: 'Beautify HTML markup' },
      { name: 'JavaScript Minifier', href: '/javascript-minifier', description: 'Compress JS for production' },
      { name: 'Base64 Converter', href: '/base64-converter', description: 'Encode payloads for transport' },
      { name: 'JWT Decoder', href: '/jwt-decoder', description: 'Inspect JSON inside tokens' },
    ],
    conclusion:
      'Use the formatter above to beautify, validate, or minify JSON in one pass — then continue with related developer tools on FYN Tools when your workflow moves to HTML, JS, or tokens.',
  },
};

export function getPremiumToolSeo(path: string): PremiumPartial | null {
  return premiumToolSeo[path] ?? null;
}
