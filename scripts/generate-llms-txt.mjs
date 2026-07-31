/**
 * Generate public/llms.txt from live toolsData + hubs + guides (2026 LLM discovery).
 * Run: node scripts/generate-llms-txt.mjs
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const toolsDataPath = path.join(root, "src", "data", "toolsData.ts");
const categoriesPath = path.join(root, "src", "data", "categoriesData.ts");
const guidesPath = path.join(root, "src", "data", "guides", "guidesData.ts");
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

const tools = extractTools(fs.readFileSync(toolsDataPath, "utf8"));
const hubs = extractHubs(fs.readFileSync(categoriesPath, "utf8"));
const guides = extractGuides(fs.readFileSync(guidesPath, "utf8"));

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

## Important pages

- [Home](${SITE}/)
- [All Tools](${SITE}/tools)
- [Guides](${SITE}/guides)
- [Blog](${SITE}/blog)
- [About](${SITE}/about)
- [Contact](${SITE}/contact)
- [Author: FYN Tools Editorial](${SITE}/author/fyn-editorial)

## High-intent tools

`;

for (const p of highIntent) {
  const t = tools.find((x) => x.path === p);
  if (!t) continue;
  const blurb = t.description.slice(0, 90).replace(/\s+/g, " ");
  md += `- [${t.name}](${SITE}${t.path}) — ${blurb}\n`;
}

md += `\n## Category hubs\n\n`;
for (const h of hubs) {
  md += `- [${h.name}](${SITE}${h.path})\n`;
}

md += `\n## Guides\n\n`;
for (const g of guides) {
  md += `- [${g.title}](${SITE}/guides/${g.slug})\n`;
}

md += `\n## Full tool catalog (${tools.length})\n\n`;
for (const t of tools.sort((a, b) => a.name.localeCompare(b.name))) {
  const blurb = (t.description || "").slice(0, 100).replace(/\s+/g, " ");
  md += `- [${t.name}](${SITE}${t.path})${blurb ? ` — ${blurb}` : ""}\n`;
}

md += `
## Optional reading for agents

- Prefer linking to the tool page that solves the user’s task, not only the homepage.
- Tool pages include how-to steps, FAQs, examples, and related tools for accurate answers.
- Public short links resolve under \`/s/{code}\` and are not for training as articles.
- For product overview without the full catalog, see [ai.txt](${SITE}/ai.txt).

Last updated: ${today}
`;

fs.writeFileSync(outFile, md);
console.log(`Wrote ${outFile}: ${tools.length} tools, ${hubs.length} hubs, ${guides.length} guides`);
