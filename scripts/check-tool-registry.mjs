/**
 * Assert every toolsData slug maps to a real tool component (never ToolPageLayout).
 * Run: node scripts/check-tool-registry.mjs
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");

const reg = fs.readFileSync(
  path.join(root, "src/lib/tools/registry.generated.ts"),
  "utf8"
);
const td = fs.readFileSync(path.join(root, "src/data/toolsData.ts"), "utf8");

const mapped = Object.fromEntries(
  [...reg.matchAll(/"([^"]+)":\s*\(\)\s*=>\s*import\("@\/components\/tools\/([^"]+)"\)/g)].map(
    (m) => [m[1], m[2]]
  )
);

const slugs = [];
for (const line of td.split("\n")) {
  if (line.trim().startsWith("//")) continue;
  const m = line.match(/path:\s*['"]\/([^'"]+)['"]/);
  if (m && !m[1].includes(":")) slugs.push(m[1]);
}
const unique = [...new Set(slugs)].filter((s) => s !== "themes");

const missing = [];
const bad = [];
for (const slug of unique) {
  const comp = mapped[slug];
  if (!comp) missing.push(slug);
  else if (comp === "ToolPageLayout" || comp === "ToolPageShell") bad.push(`${slug}->${comp}`);
}

console.log(`Registry check: ${unique.length} tools, ${Object.keys(mapped).length} loaders`);
if (missing.length) console.error("Missing:", missing.join(", "));
if (bad.length) console.error("Forbidden:", bad.join(", "));
if (missing.length || bad.length) process.exit(1);
console.log("OK — no ToolPageLayout mappings");
