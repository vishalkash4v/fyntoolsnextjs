/**
 * Premium long-form SEO blocks.
 * Hand-tuned entries below override generated content for the same path.
 * Fleet content: `premium/generated.ts` (from `npm run generate-premium`).
 */
import type { FullSeoPageContent } from '@/data/seo-pages/types';
import { generatedPremiumToolSeo } from '@/data/tool-content/premium/generated';

type PremiumPartial = Partial<FullSeoPageContent> & {
  /** Extra body paragraphs rendered after overview (information gain) */
  deepParagraphs?: string[];
};

const handTunedPremium: Record<string, PremiumPartial> = {
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
      'free json formatter',
    ],
    introParagraphs: [
      'A JSON formatter turns minified or messy API payloads into readable, indented structures so you can debug, review pull requests, and spot missing commas faster. FYN Tools’ free JSON formatter also validates syntax and can minify for production — all in the browser, without an account.',
      'Whether you paste a webhook body, a config file, or a truncated log line, the tool above highlights problems early so you spend less time guessing which bracket broke the parse.',
    ],
    overview:
      'JSON is a text format for structured data. Beautifying only changes whitespace; validation checks that the text is legal JSON. Minifying strips unnecessary whitespace for smaller payloads. This page keeps the editor first, then explains when to pretty-print versus minify.',
    howItWorks:
      'Paste or type JSON into the editor. Choose format/beautify to indent, validate to surface syntax errors, or minify to compress. Invalid JSON shows an error instead of silently corrupting your data.',
    howToUse: [
      'Paste your JSON into the editor above.',
      'Click Format / Beautify to indent, or Validate to check syntax.',
      'Use Minify when you need a compact one-line payload.',
      'Copy the result back into your editor, ticket, or API client.',
    ],
    whenToUse: [
      'Debugging API responses and webhook payloads',
      'Reviewing config files before deploy',
      'Preparing compact JSON for production requests',
      'Teaching or learning JSON structure with clear indentation',
    ],
    useCases: [
      {
        title: 'API debugging',
        description: 'Pretty-print a response, find the nested field you care about, then minify again for a cURL example.',
      },
      {
        title: 'Code review',
        description: 'Beautify a minified fixture so reviewers can read diffs without horizontal scrolling forever.',
      },
      {
        title: 'Support tickets',
        description: 'Validate customer-provided JSON before blaming your parser — many “bugs” are trailing commas or single quotes.',
      },
    ],
    examples: [
      {
        input: '{"name":"FYN","active":true,"count":3}',
        output: '{\n  "name": "FYN",\n  "active": true,\n  "count": 3\n}',
      },
      {
        input: '{name:"bad"}',
        output: 'Validation error — keys must be double-quoted in JSON',
      },
    ],
    tips: [
      'JSON does not allow comments or trailing commas — strip them before validating.',
      'Keep beautified JSON in repos; minify only for transport.',
      'Pair with JWT Decoder when the payload lives inside a token.',
    ],
    commonMistakes: [
      'Using single quotes (JavaScript object literals are not JSON).',
      'Leaving trailing commas after the last property.',
      'Minifying first when you still need to read the structure.',
    ],
    advantages: [
      'Format, validate, and minify in one place',
      'No signup for everyday debugging',
      'Works on mobile and desktop browsers',
      'Related developer tools linked for the next step',
    ],
    benefits: [
      'Find syntax errors before they hit production.',
      'Share readable JSON in tickets and PRs.',
      'Ship smaller payloads when minification matters.',
    ],
    features: [
      'Pretty-print / beautify',
      'Syntax validation',
      'Minify for production',
      'Browser-based — no install',
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
        answer:
          'Minify for production APIs, CDN caches, and anywhere transfer size matters. Keep beautified JSON in repos and debugging sessions.',
      },
      {
        question: 'Why is my JSON invalid?',
        answer:
          'Common causes: single quotes, trailing commas, unquoted keys, comments, or NaN/undefined values. The validator points to the failing location so you can fix it.',
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

  '/pregnancy-diet-planner': {
    title: 'Pregnancy Diet Planner (Educational)',
    h1: 'Pregnancy Diet Planner — Trimester Foods, Nutrients & Safety',
    metaDescription:
      'Educational pregnancy diet planner with trimester meal ideas, key nutrients (folate, iron, calcium), foods to avoid, and medical disclaimers. Not a substitute for prenatal care.',
    keywords: [
      'pregnancy diet planner',
      'pregnancy nutrition',
      'trimester meal plan',
      'foods to avoid in pregnancy',
      'folic acid pregnancy',
      'pregnancy calories second trimester',
      'prenatal diet education',
    ],
    introParagraphs: [
      'A pregnancy diet planner helps you see trimester-focused food ideas, nutrient targets clinicians often discuss (folate, iron, calcium, protein, DHA), and clear food-safety “avoid” lists. FYN Tools’ planner is educational: it sits above evidence-themed guidance and a medical disclaimer so you can explore ideas, then confirm everything with your OB-GYN, midwife, or registered dietitian.',
      'Search intent for pregnancy nutrition is practical and cautious. People want what to eat in the first, second, and third trimesters, how many extra calories are typical, and which foods raise Listeria or mercury risk — without mistaking a web tool for personalized medical advice.',
    ],
    overview:
      'Widely cited obstetric nutrition summaries often note little extra energy need in the first trimester, about +340 kcal/day in the second, and about +452 kcal/day in the third for many singleton pregnancies (IOM increments commonly referenced in ACOG patient materials). Micronutrient focus includes folic acid (~600 mcg DFE/day in pregnancy), iron (~27 mg/day), calcium (1,000–1,300 mg/day by age), and a healthy Dietary Guidelines–style pattern. This tool explains those themes with meal ideas and precautions — it does not prescribe a clinical diet.',
    howItWorks:
      'Choose your trimester, optionally enter weight and activity for a rough calorie estimate, then review priorities, sample meals, nutrient cards, foods to avoid, cautions, and terms. Export an educational PDF if you want notes for a clinic visit. Always treat outputs as discussion starters, not orders.',
    howToUse: [
      'Select first, second, or third trimester.',
      'Optionally enter your weight (kg) and activity level for a rough calorie estimate.',
      'Read meal ideas, food groups, and key nutrient targets for that trimester.',
      'Review foods to avoid, cautions, and the medical disclaimer before changing your diet.',
      'Discuss the plan with your prenatal clinician — especially if you have diabetes, anemia, multiples, or food restrictions.',
    ],
    whenToUse: [
      'When you want a structured trimester checklist before a nutrition appointment',
      'To review foods to avoid (alcohol, high-mercury fish, unpasteurized dairy, etc.)',
      'To understand commonly cited calorie increments for singleton pregnancies',
      'Never as a replacement for prescribed prenatal vitamins or medical treatment',
    ],
    useCases: [
      {
        title: 'First-trimester nausea planning',
        description:
          'See gentle meal ideas and folate focus while remembering calories often do not need to jump yet.',
      },
      {
        title: 'Second-trimester iron and calcium',
        description:
          'Use iron + vitamin C pairings and calcium sources as educational examples to discuss with your clinician.',
      },
      {
        title: 'Third-trimester comfort eating',
        description:
          'Smaller meals, fiber, and protein ideas when heartburn and fullness increase late in pregnancy.',
      },
    ],
    examples: [
      {
        input: 'Second trimester · 65 kg · moderate activity',
        output: 'Rough total kcal estimate using educational formula + ~340 extra kcal note; iron/calcium meal ideas listed',
      },
      {
        input: 'Checking foods to avoid',
        output: 'Alcohol, high-mercury fish, raw/undercooked animal foods, unpasteurized soft cheeses, and more',
      },
    ],
    tips: [
      'Take prenatal vitamins as prescribed — food alone often under-delivers folic acid and iron.',
      'Wash produce; reheat deli meats until steaming if you eat them.',
      'Prefer low-mercury fish 8–12 oz/week when your clinician agrees.',
      'Bring questions from this page to your next prenatal visit instead of self-prescribing supplements.',
    ],
    commonMistakes: [
      'Treating a web calorie number as a strict medical prescription',
      'Eating high-mercury fish or unpasteurized soft cheeses',
      'Skipping prenatal care because an online planner “looks complete”',
      'Starting herbal weight-loss products in pregnancy',
    ],
    advantages: [
      'Trimester-specific educational meal ideas',
      'Nutrient targets with plain-language context',
      'Prominent medical disclaimer, cautions, and terms',
      'Foods-to-avoid list for common safety risks',
      'PDF export for clinic discussions',
    ],
    benefits: [
      'Reduce confusion about what “eat for two” actually means.',
      'Spot high-risk foods before they become habits.',
      'Prepare better questions for your prenatal nutrition visit.',
    ],
    features: [
      'Trimester selector with evidence-themed calorie notes',
      'Sample meals and food-group badges',
      'Key nutrient cards (folate, iron, calcium, DHA, etc.)',
      'Avoid list, precautions, and terms of use',
      'Educational PDF export',
    ],
    faqs: [
      {
        question: 'Is this pregnancy diet planner medical advice?',
        answer:
          'No. It is educational only and not a substitute for prenatal care, labs, or advice from a licensed clinician.',
      },
      {
        question: 'How many extra calories do I need when pregnant?',
        answer:
          'Many summaries cite about +0 kcal in the first trimester, +340 in the second, and +452 in the third for singleton pregnancies. Your clinician may adjust for BMI, twins, or medical conditions.',
      },
      {
        question: 'Which nutrients matter most early in pregnancy?',
        answer:
          'Folic acid/folate is critical before and early in pregnancy for neural tube development. Iron, calcium, vitamin D, choline, protein, and DHA are also commonly discussed across pregnancy.',
      },
      {
        question: 'What foods should I avoid?',
        answer:
          'Avoid alcohol; limit caffeine as advised (often ~200 mg/day); avoid high-mercury fish, raw/undercooked animal foods, unpasteurized dairy, and raw sprouts. Heat deli meats until steaming.',
      },
      {
        question: 'Can I use this if I have gestational diabetes?',
        answer:
          'Only as background reading. Gestational diabetes requires an individualized medical nutrition plan from your care team — do not rely on this general tool.',
      },
    ],
    relatedTools: [
      {
        name: 'Pregnancy Weight Gain Calculator',
        href: '/pregnancy-weight-gain-calculator',
        description: 'IOM-style educational weight-gain ranges by BMI',
      },
      {
        name: 'Pregnancy Week Calculator',
        href: '/pregnancy-week-calculator',
        description: 'Estimate current pregnancy week from LMP',
      },
      {
        name: 'Pregnancy Due Date Calculator',
        href: '/pregnancy-due-date-calculator',
        description: 'Educational due-date estimate from LMP or conception',
      },
      {
        name: 'BMI Calculator',
        href: '/bmi-calculator',
        description: 'General BMI reference (not pregnancy-specific alone)',
      },
    ],
    conclusion:
      'Use the planner above to explore trimester foods, nutrients, and safety lists — then confirm every change with your prenatal clinician. Healthy pregnancy nutrition is personalized; this page is a starting map, not a prescription.',
    deepParagraphs: [
      'For SEO and user trust on health pages, FYN Tools pairs interactive controls with visible disclaimers, cautions, terms, and citations to public guidance themes (IOM energy increments, CDC folic acid, DGA patterns). That structure helps search engines understand intent while reducing the risk that users mistake education for treatment.',
      'If you arrived searching for a pregnancy diet chart, start with the trimester panel, read foods to avoid, then book or attend prenatal care. Internal links to week, due-date, and weight-gain tools keep related pregnancy questions on-site without overstating medical authority.',
    ],
  },
};

/** Hand-tuned wins over generated for the same path. */
export const premiumToolSeo: Record<string, PremiumPartial> = {
  ...generatedPremiumToolSeo,
  ...handTunedPremium,
};

export function getPremiumToolSeo(path: string): PremiumPartial | null {
  return premiumToolSeo[path] ?? null;
}
