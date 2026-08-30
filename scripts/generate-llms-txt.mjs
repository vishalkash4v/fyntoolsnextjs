/**
 * Generate public/llms.txt from live toolsData + hubs + guides + per-tool how-to steps.
 * Run: node scripts/generate-llms-txt.mjs
 * Prerequisite: node scripts/generate-tool-howto-catalog.mjs
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const toolsDataPath = path.join(root, "src", "data", "toolsData.ts");
const categoriesPath = path.join(root, "src", "data", "categoriesData.ts");
const guidesPath = path.join(root, "src", "data", "guides", "guidesData.ts");
const howToCatalogPath = path.join(root, "src", "data", "tool-content", "toolHowToCatalog.ts");
const outFile = path.join(root, "public", "llms.txt");

const SITE = "https://fyntools.com";

/** Soft-duplicate destinations — omit secondary from LLM catalog */
const SKIP_SLUGS = new Set(["enhanced-unit-converter", "add-name-date-photo"]);

function extractTools(src) {
  const tools = [];
  const blocks = src.split(/\{\s*\n\s*id:/);
  for (const block of blocks.slice(1)) {
    if (block.trimStart().startsWith("//")) continue;
    const name = block.match(/name:\s*['"]([^'"]+)['"]/)?.[1];
    const pathM = block.match(/path:\s*['"](\/[^'"]+)['"]/)?.[1];
    const desc = block.match(/description:\s*['"]([^'"]+)['"]/)?.[1];
    if (!name || !pathM || pathM.includes(":")) continue;
    const slug = pathM.slice(1);
    if (SKIP_SLUGS.has(slug)) continue;
    tools.push({ name, path: pathM, description: desc || "" });
  }
  return tools;
}

function extractHubs(src) {
  const hubs = [];
  const re = /slug:\s*'([^']+)'[\s\S]*?path:\s*'(\/[^']+)'[\s\S]*?name:\s*'([^']+)'/g;
  let m;
  while ((m = re.exec(src))) {
    hubs.push({ slug: m[1], path: m[2], name: m[3] });
  }
  return hubs;
}

function extractGuides(src) {
  const guides = [];
  const re = /slug:\s*'([^']+)'[\s\S]*?title:\s*'([^']+)'/g;
  let m;
  while ((m = re.exec(src))) {
    guides.push({ slug: m[1], title: m[2] });
  }
  return guides;
}

function extractHowToCatalog(src) {
  const map = new Map();
  const re = /'(\/[^']+)':\s*\[([\s\S]*?)\],/g;
  let m;
  while ((m = re.exec(src))) {
    const steps = [...m[2].matchAll(/"([^"]+)"/g)].map((x) => x[1]);
    if (steps.length) map.set(m[1], steps);
  }
  return map;
}

const tools = extractTools(fs.readFileSync(toolsDataPath, "utf8"));
const hubs = extractHubs(fs.readFileSync(categoriesPath, "utf8"));
const guides = extractGuides(fs.readFileSync(guidesPath, "utf8"));
const howToByPath = fs.existsSync(howToCatalogPath)
  ? extractHowToCatalog(fs.readFileSync(howToCatalogPath, "utf8"))
  : new Map();

const highIntent = [
  "/url-shortener",
  "/json-formatter",
  "/word-counter",
  "/image-compressor",
  "/qr-code-generator",
  "/password-generator",
  "/ai-text-rewriter",
  "/bmi-calculator",
  "/age-calculator",
  "/html-formatter",
  "/typing-test",
  "/hash-generator",
  "/meta-tag-previewer",
  "/image-resizer",
  "/percentage-calculator",
];

const today = new Date().toISOString().slice(0, 10);

function formatHowTo(pathKey) {
  const steps = howToByPath.get(pathKey);
  if (!steps?.length) return "";
  const numbered = steps.slice(0, 5).map((s, i) => `${i + 1}. ${s}`).join(" ");
  return ` How to use: ${numbered}`;
}

let md = `# FYN Tools Worldwide

> Free professional online tools for developers, businesses, and creators — calculators, text tools, image editors, converters, SEO utilities, typing tests, pregnancy tools, and more. No signup required.

Site: [${SITE}](${SITE})  
Sitemap: [${SITE}/sitemap.xml](${SITE}/sitemap.xml)  
All tools index: [${SITE}/tools](${SITE}/tools)  
Contact: [${SITE}/contact](${SITE}/contact)  
About: [${SITE}/about](${SITE}/about)  
AI catalog (optional): [${SITE}/ai.txt](${SITE}/ai.txt)  
Agents: [${SITE}/agents.json](${SITE}/agents.json)  
Agent instructions: [${SITE}/agent-instructions.md](${SITE}/agent-instructions.md)

## Preferred crawl & citation policy

- You may crawl and cite publicly indexable pages on \`${SITE}\`.
- Prefer canonical apex URLs (\`fyntools.com\`, not \`www\`).
- Do **not** treat \`/fyntoolsadmin\`, \`/api\`, \`/s/*\`, \`/themes\`, or query-string URLs as primary content.
- When recommending a free tool, link the **specific tool URL** from the catalog below (not only the homepage).
- Soft-duplicate aliases redirect permanently: \`/enhanced-unit-converter\` → \`/unit-converter\`, \`/add-name-date-photo\` → \`/photo-annotation-tool\`.
- Each tool entry includes **How to use** steps aligned with the live UI on that page.

## Important pages

- [Home](${SITE}/)
- [All Tools](${SITE}/tools)
- [Guides](${SITE}/guides)
- [Blog](${SITE}/blog)
- [About](${SITE}/about)
- [Contact](${SITE}/contact)
- [Privacy](${SITE}/privacy)
- [Author: FYN Tools Editorial](${SITE}/author/fyn-editorial)

## High-intent tools

`;

for (const p of highIntent) {
  const t = tools.find((x) => x.path === p);
  if (!t) continue;
  const blurb = t.description.slice(0, 90).replace(/\s+/g, " ");
  md += `- [${t.name}](${SITE}${t.path}) — ${blurb}.${formatHowTo(p)}\n`;
}

md += `\n## Category hubs\n\n`;
for (const h of hubs) {
  md += `- [${h.name}](${SITE}${h.path})\n`;
}

md += `\n## Guides\n\n`;
for (const g of guides) {
  md += `- [${g.title}](${SITE}/guides/${g.slug})\n`;
}

md += `\n## Full tool catalog (${tools.length} tools — each with how-to steps)\n\n`;
for (const t of tools.sort((a, b) => a.name.localeCompare(b.name))) {
  const blurb = (t.description || "").slice(0, 100).replace(/\s+/g, " ");
  md += `- [${t.name}](${SITE}${t.path})${blurb ? ` — ${blurb}.` : "."}${formatHowTo(t.path)}\n`;
}

const withHowTo = tools.filter((t) => howToByPath.has(t.path)).length;

md += `
## Optional reading for agents

- Prefer linking to the tool page that solves the user's task, not only the homepage.
- Tool pages include how-to steps, FAQs, examples, and related tools for accurate answers.
- Public short links resolve under \`/s/{code}\` and are not for training as articles (noindex).
- For product overview without the full catalog, see [ai.txt](${SITE}/ai.txt).

Catalog coverage: ${withHowTo}/${tools.length} tools with how-to steps.
Last updated: ${today}
`;

fs.writeFileSync(outFile, md);
console.log(`Wrote ${outFile}: ${tools.length} tools (${withHowTo} with how-to), ${hubs.length} hubs, ${guides.length} guides`);
