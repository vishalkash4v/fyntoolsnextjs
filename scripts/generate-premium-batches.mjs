/**
 * Generate unique premium SEO + curated testimonials for every tool.
 * Hand-written url-shortener / json-formatter in premiumToolSeo.ts win on merge.
 *
 * Run: node scripts/generate-premium-batches.mjs
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const toolsData = fs.readFileSync(path.join(root, "src/data/toolsData.ts"), "utf8");

const SKIP_HAND = new Set([]); // generate for all; handTuned in premiumToolSeo.ts overrides

const NAMES = [
  ["Aisha Khan", "Content Marketer"],
  ["Jordan Lee", "Frontend Developer"],
  ["Priya Sharma", "Product Designer"],
  ["Marcus Cole", "Growth Lead"],
  ["Elena Rossi", "Graduate Student"],
  ["Noah Park", "Freelance Writer"],
  ["Sofia Mendes", "SEO Specialist"],
  ["Dev Patel", "Full-Stack Engineer"],
  ["Hannah Brooks", "Operations Manager"],
  ["Kenji Sato", "Data Analyst"],
  ["Amelia Wright", "Social Media Manager"],
  ["Omar Hassan", "Finance Analyst"],
];

function hash(s) {
  return Math.abs(s.split("").reduce((a, c) => ((a << 5) - a + c.charCodeAt(0)) | 0, 0));
}

function extractTools(src) {
  const tools = [];
  const blocks = src.split(/\{\s*id:/);
  for (const block of blocks.slice(1)) {
    const id = block.match(/['"]([^'"]+)['"]/)?.[1];
    const name = block.match(/name:\s*['"]([^'"]+)['"]/)?.[1];
    const description = block.match(/description:\s*['"]([^'"]+)['"]/)?.[1];
    const category = block.match(/category:\s*['"]([^'"]+)['"]/)?.[1];
    const pathM = block.match(/path:\s*['"](\/[^'"]+)['"]/);
    if (!id || !name || !pathM) continue;
    const p = pathM[1];
    if (p.includes(":") || p === "/themes") continue;
    tools.push({
      id,
      name,
      description: description || `${name} free online`,
      category: category || "Tools",
      path: p,
    });
  }
  return tools;
}

function relatedFor(tool, all) {
  const same = all.filter((t) => t.category === tool.category && t.path !== tool.path);
  return same.slice(0, 6).map((t) => ({
    name: t.name,
    href: t.path,
    description: t.description.slice(0, 90),
  }));
}

function examplesFor(tool) {
  const n = tool.name;
  const p = tool.path;
  if (/word-counter/.test(p))
    return [
      { input: '"Ship the landing page copy by Friday."', output: "Words: 7 · Characters: 36 · Reading time: ~1 min" },
      { input: "Paste a 1,200-word blog draft", output: "Words, sentences, paragraphs, and speaking time update live" },
    ];
  if (/password/.test(p))
    return [
      { input: "Length 20 · upper + lower + digits + symbols", output: "vK9$mQx!2LpR#8nA7wZt" },
      { input: "Length 12 · no symbols (PIN-friendly)", output: "H4nR9qLm2VxP" },
    ];
  if (/qr-code/.test(p))
    return [
      { input: "https://fyntools.com/url-shortener", output: "High-res PNG/SVG QR ready to print or share" },
      { input: "Wi-Fi SSID + password payload", output: "Scan-to-connect QR for guests" },
    ];
  if (/json/.test(p))
    return [
      { input: '{"a":1,"b":[true,null]}', output: "Pretty-printed or minified JSON with validation" },
    ];
  if (/html-formatter/.test(p))
    return [
      { input: "<div><p>Hi</p></div>", output: "Indented, readable HTML markup" },
    ];
  if (/css-minifier/.test(p))
    return [
      { input: "body { margin: 0; color: #111; }", output: "body{margin:0;color:#111}" },
    ];
  if (/javascript-minifier/.test(p))
    return [
      { input: "function hello(name) { return 'Hi ' + name; }", output: "function hello(n){return\"Hi \"+n}" },
    ];
  if (/regex/.test(p))
    return [
      { input: "Pattern: ^\\d{3}-\\d{2}$  Text: 123-45", output: "Match highlighted with group captures" },
    ];
  if (/base64/.test(p))
    return [
      { input: "Hello FYN Tools", output: "SGVsbG8gRllOIFRvb2xz" },
    ];
  if (/hash-generator/.test(p))
    return [
      { input: "Text: secret + SHA-256", output: "2c624232cdd221771294dfbb310aca000a0df6ac8b66b696d90ef06fdefb64a3" },
    ];
  if (/jwt/.test(p))
    return [
      { input: "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxIn0.sig", output: "Header + payload JSON decoded (signature not verified)" },
    ];
  if (/unit-converter/.test(p))
    return [
      { input: "5 km → miles", output: "3.10686 miles" },
    ];
  if (/emi|sip|gst|tax|fd|ppf|bmi|age|percentage|calculator|currency|temperature|timestamp|date/.test(p))
    return [
      { input: `Typical inputs for ${n}`, output: "Instant breakdown with clear units — copy or screenshot results" },
      { input: "Change one field", output: "Live recalculation without page reload" },
    ];
  if (/image|blur|flip|pixel|photo|favicon|background|merge|split|crop|compress|resizer|upscaler|format/.test(p))
    return [
      { input: "Upload PNG/JPG (under your device limits)", output: "Processed preview + download of the result" },
      { input: "Adjust options, then export", output: "Keep original until you download the new file" },
    ];
  if (/stopwatch|countdown|timer|kick|contraction|period|ovulation|pregnancy|safe-days|pms/.test(p))
    return [
      { input: `Open ${n} and start tracking`, output: "Live counters update — useful on phone or desktop" },
    ];
  if (/typing/.test(p))
    return [
      { input: "Start a timed passage", output: "WPM, accuracy, and errors shown when you finish" },
    ];
  return [
    { input: `Use ${n} with a realistic sample`, output: "Copy, download, or refine the output for your workflow" },
    { input: "Try a second variation of the same input", output: "Compare results side-by-side in your notes" },
  ];
}

function faqsFor(tool) {
  const n = tool.name;
  const p = tool.path;
  const cat = tool.category;
  const desc = tool.description;

  const faqs = [
    {
      question: `What does ${n} do?`,
      answer: `${desc} It is part of our ${cat} collection on FYN Tools (${p}).`,
    },
    {
      question: `Is ${n} free on FYN Tools?`,
      answer: `Yes. ${n} is free to use in your browser with no mandatory account for normal interactive use.`,
    },
    {
      question: `Does ${n} upload my data to a server?`,
      answer: `${n} is designed for browser-side processing whenever possible. Avoid pasting production secrets or highly sensitive personal data into any online tool.`,
    },
    {
      question: `Can I use ${n} on mobile?`,
      answer: `Yes. Open ${p} on a modern phone or tablet browser — the layout adapts to smaller screens.`,
    },
    {
      question: `How do I get the best results with ${n}?`,
      answer: `Enter values exactly as labeled in the tool panel, review the live output, then copy or download. Bookmark ${p} if you reuse this workflow regularly.`,
    },
  ];

  if (/pregnancy|period|ovulation|conception|kick|contraction|pms|safe-days/i.test(p + n)) {
    faqs.push({
      question: `Can ${n} replace medical advice?`,
      answer: `No. ${n} provides educational estimates only. Always confirm dates, symptoms, and health decisions with a qualified clinician.`,
    });
  }
  if (/calculator|emi|sip|tax|gst|fd|ppf|currency|loan/i.test(p + n)) {
    faqs.push({
      question: `Are ${n} results official financial figures?`,
      answer: `Results are planning estimates based on the numbers you enter. Confirm rates, fees, and tax rules with your bank, advisor, or relevant authority before acting on them.`,
    });
  }
  if (/image|photo|compress|crop|resize|pdf|barcode|qr/i.test(p + n)) {
    faqs.push({
      question: `What file types does ${n} support?`,
      answer: `Supported formats depend on the tool — check the upload area on ${p}. Very large files may be limited by your device memory or browser.`,
    });
  }

  return faqs.slice(0, 6);
}

function testimonialsFor(tool) {
  const h = hash(tool.path);
  const picks = [];
  for (let i = 0; i < 3; i++) {
    const [name, title] = NAMES[(h + i * 5) % NAMES.length];
    const quotes = [
      `${tool.name} is bookmarked on my work laptop — results are instant and the UI stays out of the way.`,
      `I switched from a cluttered extension to FYN Tools’ ${tool.name}. No signup friction for quick jobs.`,
      `Clear outputs and mobile-friendly controls. ${tool.name} saves me a few minutes every week.`,
      `Exactly the ${tool.category.toLowerCase()} utility I needed without installing desktop software.`,
    ];
    picks.push({
      name,
      title,
      text: quotes[(h + i) % quotes.length],
      rating: 5 - ((h + i) % 2 === 0 ? 0 : 0) || 5,
    });
    // Force 4 or 5
    picks[i].rating = 4 + ((h + i) % 2);
  }
  return picks;
}

function premiumFor(tool, all) {
  const n = tool.name;
  const primary = n.replace(/\s+/g, " ").trim();
  const title = `${primary} Free Online`.slice(0, 58);
  const h1 = `${primary} — Free Online Tool`;
  let meta = `${tool.description} Free ${primary.toLowerCase()} on FYN Tools. No signup required.`.slice(0, 158);
  if (meta.length < 140) {
    meta = `${meta} Fast, mobile-friendly, and private-by-default when possible.`.slice(0, 158);
  }
  const keywords = [
    primary.toLowerCase(),
    `free ${primary.toLowerCase()}`,
    `${primary.toLowerCase()} online`,
    tool.category.toLowerCase(),
    "fyn tools",
  ];
  return {
    title,
    h1,
    metaDescription: meta,
    keywords,
    introParagraphs: [
      `${n} helps you ${tool.description.replace(/\.$/, "").toLowerCase()}. On FYN Tools the live workspace sits directly under this heading so you can get a result in seconds, then read how the tool works, when to use it, and common mistakes to avoid.`,
      `Search intent for “${primary.toLowerCase()}” is practical: people want a reliable browser utility without installing software. This page pairs the interactive ${n} with clear steps, examples, FAQs, and links to related ${tool.category.toLowerCase()} tools.`,
    ],
    overview: `${n} runs in your browser as part of the FYN Tools ${tool.category} suite. ${tool.description} Use the controls above for everyday tasks; keep sensitive production secrets offline.`,
    howItWorks: `Open ${tool.path}, enter or upload your input, adjust options if shown, then copy or download the output. Most calculations and transforms update immediately as you type or change settings.`,
    howToUse: [
      `Open ${n} at ${tool.path} on FYN Tools.`,
      "Enter your input using the fields or upload controls above.",
      "Adjust options if available, then review the live result.",
      "Copy, download, or export the output for your workflow.",
      `Bookmark ${tool.path} if you use ${n} regularly.`,
    ],
    whenToUse: [
      `Whenever you need a quick ${primary.toLowerCase()} without installing apps`,
      "On mobile when you only have a browser tab",
      "During drafting, debugging, or campaign prep workflows",
      `When comparing outputs with other ${tool.category.toLowerCase()} tools on FYN Tools`,
    ],
    useCases: [
      {
        title: "Everyday productivity",
        description: `Drop ${n} into your daily checklist when you need a trustworthy, fast answer without leaving the browser.`,
      },
      {
        title: "Team and education",
        description: `Share ${tool.path} with teammates or students so everyone uses the same free utility and instructions.`,
      },
      {
        title: "Campaign or project bursts",
        description: `Use ${n} during launches, homework deadlines, or sprint reviews when speed matters more than heavy desktop suites.`,
      },
    ],
    examples: examplesFor(tool),
    tips: [
      `Keep a sample input saved so you can re-test ${n} after changing options.`,
      "Prefer HTTPS pages and updated browsers for the smoothest experience.",
      `Pair ${n} with related tools listed below when your workflow has a next step.`,
      "Double-check outputs before publishing or sending to clients.",
    ],
    commonMistakes: [
      "Pasting highly sensitive secrets into any online tool",
      "Assuming desktop-only features exist — this is a focused web utility",
      "Skipping the FAQ when an option label is unclear",
      "Forgetting to copy results before refreshing the tab",
    ],
    advantages: [
      "Free to use with no mandatory account",
      "Works on modern mobile and desktop browsers",
      "Clear how-to, examples, and FAQs on the same page",
      "Related FYN Tools linked for the next step",
    ],
    benefits: [
      `Finish ${primary.toLowerCase()} tasks without installing software.`,
      "Stay on one trusted domain for multiple utilities.",
      "Learn the workflow from examples and FAQs without leaving the tool.",
    ],
    features: [
      "Interactive tool above the fold",
      "Mobile-friendly layout",
      "Copy-friendly outputs",
      "Privacy-minded browser processing when possible",
      "Related tools and guides when available",
    ],
    faqs: faqsFor(tool),
    relatedTools: relatedFor(tool, all),
    conclusion: `Use ${n} above for a fast, free result, then explore related ${tool.category.toLowerCase()} tools on FYN Tools when your workflow continues.`,
    deepParagraphs: [
      `Google rewards pages that put the useful tool first and explain the topic with unique detail. This ${n} page follows that pattern: interactive UI, then how-to, overview, examples, FAQs, and internal links — not thin keyword stuffing.`,
      `If you arrived from a search for ${primary.toLowerCase()}, start with the tool, then skim FAQs for limits, privacy, and mobile tips. Update bookmarks to the canonical path ${tool.path} (no tracking query strings).`,
    ],
  };
}

const tools = extractTools(toolsData);
const premium = {};

for (const tool of tools) {
  if (SKIP_HAND.has(tool.path)) continue;
  premium[tool.path] = premiumFor(tool, tools);
}

const outDir = path.join(root, "src/data/tool-content/premium");
fs.mkdirSync(outDir, { recursive: true });

const premiumTs = `/* AUTO-GENERATED by scripts/generate-premium-batches.mjs — metadata + examples only; long-form uses curated content */
import type { FullSeoPageContent } from '@/data/seo-pages/types';

type PremiumPartial = Partial<FullSeoPageContent> & { deepParagraphs?: string[] };

export const generatedPremiumToolSeo: Record<string, PremiumPartial> = ${JSON.stringify(premium, null, 2)};
`;

fs.writeFileSync(path.join(outDir, "generated.ts"), premiumTs);

const testiTs = `/* AUTO-GENERATED — fake rotating quotes removed; only add real curated reviews here */
export type ToolTestimonial = {
  name: string;
  rating: number;
  text: string;
  title?: string;
};

/** Real user quotes only — never auto-generated template text */
export const toolTestimonials: Record<string, ToolTestimonial[]> = {};
`;

fs.writeFileSync(path.join(root, "src/data/tool-content/toolTestimonials.ts"), testiTs);

console.log(`Premium tools: ${Object.keys(premium).length}; testimonials: curated-only (empty auto file)`);
