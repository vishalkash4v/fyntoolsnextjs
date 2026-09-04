/**
 * SEO matrix: after `next build`, validate representative + all-tool HTML signals.
 * Run: node scripts/check-seo-matrix.mjs
 *
 * Checks registry completeness, unique titles/descriptions/intros across tools,
 * and scans .next HTML for key pages when available.
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { createRequire } from "module";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const require = createRequire(import.meta.url);

// Dynamic load isn't ideal for TS; instead parse toolsData + content builder via build artifacts.
const toolsData = fs.readFileSync(path.join(root, "src/data/toolsData.ts"), "utf8");
const buildContent = fs.readFileSync(
  path.join(root, "src/data/tool-content/buildUniqueToolContent.ts"),
  "utf8"
);
const seoIndex = fs.readFileSync(path.join(root, "src/data/seo-pages/index.ts"), "utf8");

const slugs = [];
for (const line of toolsData.split("\n")) {
  if (line.trim().startsWith("//")) continue;
  const m = line.match(/path:\s*['"]\/([^'"]+)['"]/);
  if (m && !m[1].includes(":")) slugs.push(m[1]);
}
const uniqueSlugs = [...new Set(slugs)].filter((s) => s !== "themes");

const reg = fs.readFileSync(path.join(root, "src/lib/tools/registry.generated.ts"), "utf8");
const mapped = [...reg.matchAll(/"([^"]+)":/g)].map((m) => m[1]);

let errors = 0;
for (const slug of uniqueSlugs) {
  if (!mapped.includes(slug)) {
    console.error("Missing registry:", slug);
    errors++;
  }
}

if (!seoIndex.includes("buildUniqueToolContent")) {
  console.error("seo-pages/index.ts must use buildUniqueToolContent");
  errors++;
}
if (fs.existsSync(path.join(root, "src/data/seo-pages/longFormGenerator.ts"))) {
  console.error("longFormGenerator.ts should be removed");
  errors++;
}
if (!buildContent.includes("buildUniqueToolContent")) {
  console.error("buildUniqueToolContent missing");
  errors++;
}

// Scan built HTML when present
const serverApp = path.join(root, ".next/server/app");
const sample = [
  "index.html",
  "word-counter.html",
  "json-formatter.html",
  "baby-kick-counter.html",
  "hash-generator.html",
  "image-tools.html",
  "about.html",
  "contact.html",
  "bmi-calculator.html",
];

function findHtml(name) {
  const direct = path.join(serverApp, name);
  if (fs.existsSync(direct)) return direct;
  // Nested
  const walk = (dir) => {
    if (!fs.existsSync(dir)) return null;
    for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
      const p = path.join(dir, ent.name);
      if (ent.isFile() && ent.name === name) return p;
      if (ent.isDirectory()) {
        const found = walk(p);
        if (found) return found;
      }
    }
    return null;
  };
  return walk(serverApp);
}

// Reject templated extended copy in built HTML
const TEMPLATE_PHRASES = [
  "When you provide input",
  "covers a need that comes up",
  "bookmarked on my work laptop",
  "Search intent for",
  "locate the input fields at the top of the page",
  "Enter the values or upload the file your task requires",
  "The interactive panel loads above this guide",
  "Typical Pregnancy Due Date Calculator input",
  "Copy-friendly output",
  "Handle everyday pregnancy tools needs",
];

if (fs.existsSync(serverApp)) {
  for (const name of sample) {
    const file = findHtml(name);
    if (!file) {
      console.warn("HTML not found (may be OK if not built yet):", name);
      continue;
    }
    const html = fs.readFileSync(file, "utf8");
    const checks = [
      ["title", /<title>[^<]+<\/title>/i],
      ["canonical", /rel="canonical"/i],
      ["h1", /<h1[\s>]/i],
      ["jsonld", /application\/ld\+json/i],
    ];
    for (const [label, re] of checks) {
      if (!re.test(html)) {
        console.error(`Fail ${name}: missing ${label}`);
        errors++;
      }
    }
    for (const phrase of TEMPLATE_PHRASES) {
      if (html.includes(phrase)) {
        console.error(`Fail ${name}: templated phrase "${phrase}" in HTML`);
        errors++;
      }
    }
    if (name === "themes.html" && !/noindex/i.test(html)) {
      console.error("themes should be noindex");
      errors++;
    }
  }
} else {
  console.warn("No .next/server/app — skip HTML scan (run after build)");
}

console.log(`SEO matrix: ${uniqueSlugs.length} tools audited, errors=${errors}`);

// Premium coverage — every tool path should exist in premiumToolSeo merge (hand + generated)
const premiumGen = path.join(root, "src/data/tool-content/premium/generated.ts");
const premiumMain = path.join(root, "src/data/tool-content/premiumToolSeo.ts");
const testiFile = path.join(root, "src/data/tool-content/toolTestimonials.ts");
if (!fs.existsSync(premiumGen)) {
  console.error("Missing premium/generated.ts — run npm run generate-premium");
  errors++;
} else {
  const gen = fs.readFileSync(premiumGen, "utf8");
  const testi = fs.readFileSync(testiFile, "utf8");
  const main = fs.readFileSync(premiumMain, "utf8");
  if (!main.includes("generatedPremiumToolSeo")) {
    console.error("premiumToolSeo.ts must merge generatedPremiumToolSeo");
    errors++;
  }
  let missingPremium = 0;
  for (const slug of uniqueSlugs) {
    if (slug === "enhanced-unit-converter" || slug === "add-name-date-photo") continue;
    const key = `"/${slug}"`;
    if (!gen.includes(key) && !main.includes(`'/${slug}'`) && !main.includes(`"/${slug}"`)) {
      missingPremium++;
      if (missingPremium <= 5) console.error("Missing premium:", slug);
    }
  }
  if (missingPremium) {
    console.error(`Premium missing for ${missingPremium} tools`);
    errors += missingPremium > 10 ? 10 : missingPremium;
  }

  // Reject fake testimonial templates in generated files
  if (testi.includes("bookmarked on my work laptop")) {
    console.error("Fake testimonial templates detected in toolTestimonials.ts — remove auto-generated quotes");
    errors++;
  }
}

// Fake reviews must stay disabled
const social = fs.readFileSync(path.join(root, "src/data/tool-content/socialProof.ts"), "utf8");
if (social.includes("TEMPLATES") && social.includes("I use ${n} weekly")) {
  console.error("Fake testimonial TEMPLATES still active in socialProof.ts");
  errors++;
}
if (!social.includes("return [];")) {
  console.error("buildTestimonialsForTool should return [] when uncurated");
  errors++;
}

// --- Uniqueness / anti-clone gates (source of truth for live merge) ---
const CLONE_MARKERS = [
  "Quick browser check",
  "use the panel above for instant results",
  "Sample input for",
  "Use the tool above — free, no account required",
  "Free access with no signup for core features",
];

const uniquenessFiles = [
  "src/data/tool-content/batch7.ts",
  "src/data/tool-content/toolExamples.ts",
  "src/data/tool-content/toolFactCards.ts",
  "src/lib/seo/contentQuality.ts",
];

for (const rel of uniquenessFiles) {
  const full = path.join(root, rel);
  if (!fs.existsSync(full)) continue;
  const text = fs.readFileSync(full, "utf8");
  // contentQuality may list markers as strings — skip that file for marker presence
  if (rel.endsWith("contentQuality.ts")) continue;
  for (const marker of CLONE_MARKERS) {
    // Ignore documentation comments that name the forbidden phrase
    const withoutLineComments = text
      .split("\n")
      .filter((line) => !line.trim().startsWith("//") && !line.trim().startsWith("*") && !line.trim().startsWith("/**"))
      .join("\n");
    if (withoutLineComments.includes(marker)) {
      console.error(`Fail ${rel}: clone/generic marker "${marker}"`);
      errors++;
    }
  }
}

/** 12-word intro n-grams must not be shared across two tool paths. */
function twelveWordGrams(text) {
  const words = text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter(Boolean);
  const grams = [];
  for (let i = 0; i + 12 <= words.length; i++) {
    grams.push(words.slice(i, i + 12).join(" "));
  }
  return grams;
}

function collectIntroParagraphsFromBatches() {
  const dir = path.join(root, "src/data/tool-content");
  const files = fs.readdirSync(dir).filter((f) => /^batch\d+\.ts$/.test(f));
  const byPath = new Map();
  for (const file of files) {
    const src = fs.readFileSync(path.join(dir, file), "utf8");
    const pathRe = /['"](\/[^'"]+)['"]\s*:\s*\{/g;
    const indices = [];
    let m;
    while ((m = pathRe.exec(src))) {
      indices.push({ toolPath: m[1], index: m.index });
    }
    for (let i = 0; i < indices.length; i++) {
      const { toolPath, index } = indices[i];
      const next = i + 1 < indices.length ? indices[i + 1].index : src.length;
      const chunk = src.slice(index, next);
      const introMatch = chunk.match(/introParagraphs\s*:\s*\[([\s\S]*?)\]/);
      if (!introMatch) continue;
      const paras = [...introMatch[1].matchAll(/"((?:\\.|[^"\\])*)"/g)].map((x) =>
        x[1].replace(/\\"/g, '"')
      );
      if (paras.length) byPath.set(toolPath, paras.join(" "));
    }
  }
  return byPath;
}

const introByPath = collectIntroParagraphsFromBatches();
const gramOwners = new Map();
for (const [toolPath, intro] of introByPath) {
  for (const gram of twelveWordGrams(intro)) {
    const owners = gramOwners.get(gram) || new Set();
    owners.add(toolPath);
    gramOwners.set(gram, owners);
  }
}
let sharedGrams = 0;
for (const [gram, owners] of gramOwners) {
  if (owners.size < 2) continue;
  sharedGrams++;
  if (sharedGrams <= 8) {
    console.error(
      `Fail shared 12-word intro n-gram across ${[...owners].join(", ")}: "${gram}"`
    );
  }
}
if (sharedGrams) {
  console.error(`Shared intro n-grams: ${sharedGrams}`);
  errors += Math.min(sharedGrams, 15);
}

// Fact cards required for merge filler
const factCards = fs.readFileSync(path.join(root, "src/data/tool-content/toolFactCards.ts"), "utf8");
if (!factCards.includes("export function interpolateFactSeo")) {
  console.error("toolFactCards.ts must export interpolateFactSeo");
  errors++;
}
if (!buildContent.includes("interpolateFactSeo")) {
  console.error("buildUniqueToolContent must wire interpolateFactSeo");
  errors++;
}
if (!buildContent.includes("isGenericUseCase") || !buildContent.includes("isCloneTldr")) {
  console.error("buildUniqueToolContent must gate use cases / tldr with contentQuality helpers");
  errors++;
}

console.log(`SEO matrix final errors=${errors}`);
process.exit(errors ? 1 : 0);
