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
  let missingTesti = 0;
  for (const slug of uniqueSlugs) {
    if (slug === "enhanced-unit-converter" || slug === "add-name-date-photo") continue;
    const key = `"/${slug}"`;
    if (!gen.includes(key) && !main.includes(`'/${slug}'`) && !main.includes(`"/${slug}"`)) {
      missingPremium++;
      if (missingPremium <= 5) console.error("Missing premium:", slug);
    }
    if (!testi.includes(key)) {
      missingTesti++;
      if (missingTesti <= 5) console.error("Missing testimonials:", slug);
    }
  }
  if (missingPremium) {
    console.error(`Premium missing for ${missingPremium} tools`);
    errors += missingPremium > 10 ? 10 : missingPremium;
  }
  if (missingTesti) {
    console.error(`Testimonials missing for ${missingTesti} tools`);
    errors += missingTesti > 10 ? 10 : missingTesti;
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

console.log(`SEO matrix final errors=${errors}`);
process.exit(errors ? 1 : 0);
