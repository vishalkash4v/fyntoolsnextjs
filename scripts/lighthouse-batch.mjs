/**
 * Mobile Lighthouse batch for tool slugs.
 * Requires: npm run build && npm run start (in another terminal), ads off.
 *
 * Usage:
 *   BASE_URL=http://127.0.0.1:3000 node scripts/lighthouse-batch.mjs word-counter password-generator
 *   BASE_URL=http://127.0.0.1:3000 node scripts/lighthouse-batch.mjs --batch=1
 *
 * Env:
 *   BASE_URL (default http://127.0.0.1:3000)
 *   LH_MIN_PERF (default 90 for Tier A; warnings only if --warn-only)
 */
import { spawnSync } from "child_process";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const base = (process.env.BASE_URL || "http://127.0.0.1:3000").replace(/\/$/, "");
const minPerf = Number(process.env.LH_MIN_PERF || 90);
const warnOnly = process.argv.includes("--warn-only");

const BATCHES = {
  1: [
    "url-shortener",
    "json-formatter",
    "word-counter",
    "qr-code-generator",
    "password-generator",
    "text-case-converter",
    "meta-tag-previewer",
    "html-formatter",
    "css-minifier",
    "javascript-minifier",
    "regex-tester",
    "base64-converter",
    "hash-generator",
    "jwt-decoder",
    "unit-converter",
  ],
  2: [
    "json-validator",
    "markdown-editor",
    "live-preview",
    "xml-sitemap-tester",
    "url-encode-decode",
    "url-slug-generator",
    "lorem-ipsum-generator",
    "whitespace-remover",
    "duplicate-line-remover",
    "text-reverser",
    "ai-text-rewriter",
    "discord-formatter",
    "dummy-api-generator",
    "table-to-json-converter",
    "svg-optimizer",
  ],
  3: [
    "emi-calculator",
    "sip-calculator",
    "gst-calculator",
    "income-tax-calculator",
    "fd-calculator",
    "ppf-calculator",
    "bmi-calculator",
    "age-calculator",
    "percentage-calculator",
    "simple-calculator",
    "currency-converter",
    "temperature-converter",
    "timestamp-converter",
    "date-difference-calculator",
    "future-date-calculator",
  ],
};

const batchArg = process.argv.find((a) => a.startsWith("--batch="));
let slugs = process.argv.filter((a) => !a.startsWith("-") && !a.includes("lighthouse-batch"));
if (batchArg) {
  const id = batchArg.split("=")[1];
  slugs = BATCHES[id] || [];
}
if (!slugs.length) {
  console.error("Pass slugs or --batch=1|2|3");
  process.exit(1);
}

const outDir = path.join(root, ".lighthouse-batch");
fs.mkdirSync(outDir, { recursive: true });

let failed = 0;
for (const slug of slugs) {
  const url = `${base}/${slug}`;
  const out = path.join(outDir, `${slug}.json`);
  console.log(`\n→ Lighthouse ${url}`);
  const r = spawnSync(
    "npx",
    [
      "--yes",
      "lighthouse",
      url,
      "--only-categories=performance,accessibility,best-practices,seo",
      "--form-factor=mobile",
      "--screenEmulation.mobile",
      "--output=json",
      `--output-path=${out}`,
      "--quiet",
      "--chrome-flags=--headless --no-sandbox",
    ],
    { cwd: root, encoding: "utf8", shell: true }
  );
  if (r.status !== 0) {
    console.error(`LH failed for ${slug}:`, r.stderr || r.stdout);
    failed++;
    continue;
  }
  try {
    const report = JSON.parse(fs.readFileSync(out, "utf8"));
    const cats = report.categories || {};
    const score = (k) => Math.round((cats[k]?.score || 0) * 100);
    const row = {
      slug,
      performance: score("performance"),
      accessibility: score("accessibility"),
      bestPractices: score("best-practices"),
      seo: score("seo"),
    };
    console.log(JSON.stringify(row));
    if (row.seo < 100) {
      console.warn(`  SEO < 100 for ${slug}`);
      if (!warnOnly) failed++;
    }
    if (row.performance < minPerf) {
      console.warn(`  Perf ${row.performance} < ${minPerf} for ${slug}`);
      if (!warnOnly) failed++;
    }
  } catch (e) {
    console.error(e);
    failed++;
  }
}

console.log(failed ? `\nDone with ${failed} failure(s)` : "\nAll checks passed");
process.exit(failed ? 1 : 0);
