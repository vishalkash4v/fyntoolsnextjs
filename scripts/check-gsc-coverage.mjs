/**
 * Validate GSC “Crawled – currently not indexed” export against live site data.
 * Reads: ../gsc-exports/Table.csv (or gsc-exports/Table.csv from repo root)
 *
 * Run: node scripts/check-gsc-coverage.mjs
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const repoRoot = path.join(root, "..");

const csvCandidates = [
  path.join(repoRoot, "gsc-exports", "Table.csv"),
  path.join(root, "gsc-exports", "Table.csv"),
];

const toolsDataPath = path.join(root, "src", "data", "toolsData.ts");
const categoriesPath = path.join(root, "src", "data", "categoriesData.ts");
const registryPath = path.join(root, "src", "lib", "tools", "registry.generated.ts");

function parseCsvUrls(csv) {
  const lines = csv.trim().split(/\r?\n/).slice(1);
  return lines
    .map((line) => {
      const [url, lastCrawled, status] = line.split(",");
      if (!url) return null;
      try {
        const u = new URL(url.trim());
        return {
          url: u.href,
          pathname: u.pathname.replace(/\/$/, "") || "/",
          search: u.search,
          lastCrawled: (lastCrawled || "").trim(),
          status: (status || "").trim(),
        };
      } catch {
        return null;
      }
    })
    .filter(Boolean);
}

function extractToolPaths(src) {
  const paths = new Set();
  for (const line of src.split(/\n/)) {
    if (line.trim().startsWith("//")) continue;
    const m = line.match(/path:\s*['"](\/[^'"]+)['"]/);
    if (m && !m[1].includes(":")) paths.add(m[1]);
  }
  return paths;
}

function extractHubPaths(src) {
  const paths = new Set();
  const re = /path:\s*'(\/[^']+)'/g;
  let m;
  while ((m = re.exec(src))) paths.add(m[1]);
  return paths;
}

function extractRegistrySlugs(src) {
  const slugs = new Set();
  const re = /"([a-z0-9-]+)":\s*\(\)\s*=>\s*import/g;
  let m;
  while ((m = re.exec(src))) slugs.add(m[1]);
  return slugs;
}

const csvPath = csvCandidates.find((p) => fs.existsSync(p));
if (!csvPath) {
  console.error("Missing gsc-exports/Table.csv — place GSC export at repo gsc-exports/Table.csv");
  process.exit(1);
}

const rows = parseCsvUrls(fs.readFileSync(csvPath, "utf8"));
const toolPaths = extractToolPaths(fs.readFileSync(toolsDataPath, "utf8"));
const hubPaths = extractHubPaths(fs.readFileSync(categoriesPath, "utf8"));
const registrySlugs = extractRegistrySlugs(fs.readFileSync(registryPath, "utf8"));

const CANONICAL_REDIRECTS = {
  "/enhanced-unit-converter": "/unit-converter",
  "/add-name-date-photo": "/photo-annotation-tool",
};

const TECHNICAL = new Set([
  "/themes",
  "/fyntoolsadmin",
  "/fyntoolsadmin/login",
  "/google2bd88e5174647955",
]);

let ok = 0;
let warn = 0;
let fail = 0;

console.log(`GSC export: ${csvPath} (${rows.length} URLs)\n`);

for (const row of rows) {
  const { pathname, search, status, url } = row;

  if (search) {
    console.log(`✓ TECHNICAL (query URL — robots disallow + hub redirect): ${url}`);
    ok++;
    continue;
  }

  if ([...TECHNICAL].some((t) => pathname === t || pathname.startsWith(t + "/"))) {
    console.log(`✓ TECHNICAL (noindex/disallow): ${pathname} [${status}]`);
    ok++;
    continue;
  }

  if (CANONICAL_REDIRECTS[pathname]) {
    console.log(
      `✓ DUPLICATE→CANONICAL: ${pathname} → ${CANONICAL_REDIRECTS[pathname]} [${status}]`
    );
    ok++;
    continue;
  }

  if (hubPaths.has(pathname)) {
    console.log(`✓ HUB: ${pathname} [${status}]`);
    ok++;
    continue;
  }

  if (toolPaths.has(pathname)) {
    const slug = pathname.slice(1);
    if (!registrySlugs.has(slug)) {
      console.log(`✗ TOOL MISSING REGISTRY: ${pathname}`);
      fail++;
      continue;
    }
    if (status === "Failed") {
      console.log(`⚠ CRAWL FAILED (verify live 200): ${pathname}`);
      warn++;
      continue;
    }
    console.log(`✓ TOOL (awaiting index): ${pathname} [${status}]`);
    ok++;
    continue;
  }

  console.log(`✗ UNKNOWN / NOT IN CATALOG: ${pathname} [${status}]`);
  fail++;
}

console.log(`\nSummary: ok=${ok} warn=${warn} fail=${fail}`);
if (fail) process.exitCode = 1;
