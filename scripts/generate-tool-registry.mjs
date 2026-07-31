/**
 * Generate:
 * 1) TOOL_LOADERS registry (server / static params)
 * 2) Per-slug loader re-exports under src/lib/tools/loaders/
 * 3) Per-slug client islands under src/lib/tools/clients/ (UrlShortenerClient pattern)
 * 4) Dedicated App Router pages under src/app/(generated-tools)/{slug}/
 *    — force-static + SchemaMarkup + personSchema + single-tool client island
 *
 * Hand-written routes kept (not generated as pages): url-shortener, json-formatter
 *
 * Run: node scripts/generate-tool-registry.mjs
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const toolsDir = path.join(root, "src", "components", "tools");
const toolsDataPath = path.join(root, "src", "data", "toolsData.ts");
const outFile = path.join(root, "src", "lib", "tools", "registry.generated.ts");
const loadersDir = path.join(root, "src", "lib", "tools", "loaders");
const clientsDir = path.join(root, "src", "lib", "tools", "clients");
const generatedPagesDir = path.join(root, "src", "app", "(generated-tools)");

/** Slugs with hand-maintained app/{slug}/page.tsx — skip generated pages only. */
const HAND_WRITTEN_PAGES = new Set(["url-shortener", "json-formatter"]);

const EXCLUDED = new Set([
  "ToolPageLayout",
  "ToolPageShell",
  "ToolContentSections",
  "ToolSeoSections",
  "ToolFeedbackBar",
  "ToolBreadcrumbs",
  "ToolBreadcrumbsServer",
  "ToolFAQ",
  "ToolSearch",
  "InteractiveToolLoader",
  "LikeDislikeButtons",
  "SocialShareButtons",
  "SitemapReport",
  "ThemeManager",
  "UrlShortenerQrDialog",
  "JsonFormatterClient",
]);

/** Explicit slug → component filename (without .tsx) when heuristics fail */
const OVERRIDES = {
  "word-counter": "WordCounter",
  "password-generator": "PasswordGenerator",
  "merge-images": "MergeImages",
  "blur-image": "BlurImage",
  "flip-image": "FlipImage",
  "text-font-changer": "TextFontChanger",
  "qr-scanner": "QRScanner",
  "notes": "Notes",
  "add-name-date-photo": "PhotoAnnotationTool",
  "auto-image-resizer": "AutoImageResizer",
  "barcode-scanner-online": "BarcodeScanner",
  "color-picker-tool": "ColorPicker",
  "daily-task-report-saver": "DailyTaskReportSaver",
  "image-to-text": "ImageToText",
  "invert-image-colors": "InvertImageColors",
  "pdf-text-extractor": "PdfTextExtractor",
  "photo-annotation-tool": "PhotoAnnotationTool",
  "pixelate-tool": "PixelateTool",
  "placeholder-image-generator": "PlaceholderImageGenerator",
  "ppf-calculator": "PpfCalculator",
  "social-media-db-viewer": "SocialMediaDbViewer",
  "social-media-downloader": "SocialMediaDownloader",
  "social-media-planner": "SocialMediaPlanner",
  "split-image": "SplitImage",
  "svg-optimizer": "SvgOptimizer",
  "table-to-json-converter": "TableToJsonConverter",
  "timetable-maker": "TimetableMaker",
  "weather-forecast": "WeatherForecast",
  "url-encode-decode": "UrlEncodeDecoder",
  "qr-code-generator": "QRCodeGenerator",
  "enhanced-unit-converter": "UnitConverter",
  "json-formatter": "JsonFormatter",
  "html-formatter": "HtmlFormatter",
  "css-minifier": "CssMinifier",
  "javascript-minifier": "JavaScriptMinifier",
  "ai-text-rewriter": "AiTextRewriter",
  "url-shortener": "UrlShortener",
  "social-media-deep-link-generator": "SocialMediaLinkGenerator",
  "logo-to-favicon": "LogoToFavicon",
  "lorem-ipsum-generator": "LoremIpsumGenerator",
  "meta-tag-previewer": "MetaTagPreviewer",
  "xml-sitemap-tester": "XmlSitemapTester",
  "yes-no-generator": "YesNoGenerator",
  "hash-generator": "HashGenerator",
  "jwt-decoder": "JwtDecoder",
  "dummy-api-generator": "DummyApiGenerator",
  "discord-formatter": "DiscordFormatter",
  "button-generator": "ButtonGenerator",
  "box-shadow-generator": "BoxShadowGenerator",
  "border-radius-generator": "BorderRadiusGenerator",
  "gradient-generator": "GradientGenerator",
  "color-palette-generator": "ColorPaletteGenerator",
  "business-idea-generator": "BusinessIdeaGenerator",
  "invoice-generator": "InvoiceGenerator",
  "hashtag-generator": "HashtagGenerator",
  "name-generator": "NameGenerator",
  "username-generator": "UsernameGenerator",
  "url-slug-generator": "UrlSlugGenerator",
  "list-randomizer": "ListRandomizer",
  "random-number-generator": "RandomNumberGenerator",
  "coin-flip": "CoinFlip",
  "dice-roller": "DiceRoller",
  "countdown-timer": "CountdownTimer",
  "contraction-timer": "ContractionTimer",
  "baby-kick-counter": "BabyKickCounter",
  "safe-days-calculator": "SafeDaysCalculator",
  "period-tracker": "PeriodTracker",
  "period-calculator": "PeriodCalculator",
  "ovulation-calculator": "OvulationCalculator",
  "pms-symptom-tracker": "PmsSymptomTracker",
  "conception-date-calculator": "ConceptionDateCalculator",
  "pregnancy-due-date-calculator": "PregnancyDueDateCalculator",
  "pregnancy-week-calculator": "PregnancyWeekCalculator",
  "pregnancy-weight-gain-calculator": "PregnancyWeightGainCalculator",
  "pregnancy-diet-planner": "PregnancyDietPlanner",
  "income-tax-calculator": "IncomeTaxCalculator",
  "gst-calculator": "GstCalculator",
  "emi-calculator": "EmiCalculator",
  "sip-calculator": "SipCalculator",
  "bmi-calculator": "BmiCalculator",
  "age-calculator": "AgeCalculator",
  "percentage-calculator": "PercentageCalculator",
  "simple-calculator": "SimpleCalculator",
  "currency-converter": "CurrencyConverter",
  "temperature-converter": "TemperatureConverter",
  "timestamp-converter": "TimestampConverter",
  "base64-converter": "Base64Converter",
  "ip-lookup": "IpLookup",
  "ip-address-to-location-finder": "IPAddressToLocationFinder",
  "image-compressor": "ImageCompressor",
  "image-resizer": "ImageResizer",
  "image-cropper": "ImageCropper",
  "image-format-converter": "ImageFormatConverter",
  "image-metadata-viewer": "ImageMetadataViewer",
  "background-remover": "BackgroundRemover",
  "text-case-converter": "TextCaseConverter",
  "text-reverser": "TextReverser",
  "text-to-speech": "TextToSpeech",
  "text-to-handwriting": "TextToHandwriting",
  "whitespace-remover": "WhitespaceRemover",
  "markdown-editor": "MarkdownEditor",
  "live-preview": "LivePreview",
  "regex-tester": "RegexTester",
  "json-validator": "JsonValidator",
  "typing-test": "TypingTest",
  "typing-tutor": "TypingTutor",
  "typing-games": "TypingGames",
  "typing-competition": "TypingCompetition",
  "todo-list": "TodoList",
  "stopwatch": "Stopwatch",
  "trip-expense-splitter": "TripExpenseSplitter",
  "barcode-generator": "BarcodeGenerator",
};

function toPascalCase(slug) {
  return slug
    .split("-")
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
    .join("");
}

function extractSlugs(toolsData) {
  const slugs = [];
  for (const line of toolsData.split(/\n/)) {
    const trimmed = line.trim();
    if (trimmed.startsWith("//")) continue;
    const m = line.match(/path:\s*['"]\/([^'"]+)['"]/);
    if (!m) continue;
    const slug = m[1];
    if (slug.includes(":")) continue;
    if (slug === "themes") continue;
    slugs.push(slug);
  }
  return [...new Set(slugs)];
}

const toolFiles = fs
  .readdirSync(toolsDir)
  .filter((f) => f.endsWith(".tsx"))
  .map((f) => f.replace(/\.tsx$/, ""));

const toolFileSet = new Set(toolFiles.filter((f) => !EXCLUDED.has(f)));

function resolveComponent(slug) {
  if (OVERRIDES[slug] && toolFileSet.has(OVERRIDES[slug])) {
    return OVERRIDES[slug];
  }
  const pascal = toPascalCase(slug);
  if (toolFileSet.has(pascal)) return pascal;

  const lower = pascal.toLowerCase();
  for (const f of toolFileSet) {
    if (f.toLowerCase() === lower) return f;
  }

  if (slug === "qr-code-generator" && toolFileSet.has("QRCodeGenerator")) {
    return "QRCodeGenerator";
  }
  if (slug === "qr-scanner" && toolFileSet.has("QRScanner")) return "QRScanner";

  const parts = slug.split("-").filter((p) => p.length > 2);
  const candidates = [...toolFileSet].filter((f) => {
    const fl = f.toLowerCase();
    return parts.every((p) => fl.includes(p));
  });
  if (candidates.length === 1) return candidates[0];

  return null;
}

const toolsData = fs.readFileSync(toolsDataPath, "utf8");
const slugs = extractSlugs(toolsData);

const registry = {};
const missing = [];

for (const slug of slugs.sort()) {
  const comp = resolveComponent(slug);
  if (!comp) {
    missing.push(slug);
    continue;
  }
  if (EXCLUDED.has(comp) || comp === "ToolPageLayout") {
    missing.push(`${slug} -> forbidden ${comp}`);
    continue;
  }
  registry[slug] = comp;
}

if (missing.length) {
  console.error("MISSING mappings:", missing);
  process.exitCode = 1;
}

let code = `/* AUTO-GENERATED by scripts/generate-tool-registry.mjs — do not edit by hand */
import type { ComponentType } from "react";

export type ToolComponentLoader = () => Promise<{ default: ComponentType<Record<string, unknown>> }>;

export const TOOL_LOADERS: Record<string, ToolComponentLoader> = {
`;

for (const [slug, file] of Object.entries(registry).sort()) {
  code += `  "${slug}": () => import("@/components/tools/${file}"),\n`;
}

code += `};

export function getToolLoader(slug: string): ToolComponentLoader | null {
  return TOOL_LOADERS[slug] ?? null;
}

export const TOOL_SLUGS = Object.keys(TOOL_LOADERS);

/** Soft-duplicate paths that 301 to a canonical tool (excluded from sitemap). */
export const TOOL_CANONICAL_REDIRECTS: Record<string, string> = {
  "enhanced-unit-converter": "unit-converter",
  "add-name-date-photo": "photo-annotation-tool",
};
`;

fs.mkdirSync(path.dirname(outFile), { recursive: true });
fs.writeFileSync(outFile, code);

/** Lightweight slug list for client — NO import() factories (keeps tool pages out of the 118-chunk graph). */
const slugsOut = path.join(root, "src", "lib", "tools", "tool-slugs.generated.ts");
const slugList = JSON.stringify(Object.keys(registry).sort());
const slugsCode = `/* AUTO-GENERATED by scripts/generate-tool-registry.mjs — do not edit by hand */
export const TOOL_SLUGS: string[] = ${slugList};

export const TOOL_SLUG_SET = new Set(TOOL_SLUGS);

export function isKnownToolSlug(slug: string): boolean {
  return TOOL_SLUG_SET.has(slug);
}

/** Soft-duplicate paths that 301 to a canonical tool (excluded from sitemap). */
export const TOOL_CANONICAL_REDIRECTS: Record<string, string> = {
  "enhanced-unit-converter": "unit-converter",
  "add-name-date-photo": "photo-annotation-tool",
};
`;
fs.writeFileSync(slugsOut, slugsCode);

// Per-slug loader modules — re-export of the tool component
fs.mkdirSync(loadersDir, { recursive: true });
const existingLoaders = new Set(
  fs.readdirSync(loadersDir).filter((f) => f.endsWith(".ts") || f.endsWith(".tsx"))
);
const keepLoaders = new Set();

for (const [slug, file] of Object.entries(registry)) {
  const loaderPath = path.join(loadersDir, `${slug}.ts`);
  const loaderCode = `/* AUTO-GENERATED — do not edit */
export { default } from "@/components/tools/${file}";
`;
  fs.writeFileSync(loaderPath, loaderCode);
  keepLoaders.add(`${slug}.ts`);
}

for (const f of existingLoaders) {
  if (!keepLoaders.has(f)) {
    fs.unlinkSync(path.join(loadersDir, f));
  }
}

// Per-slug client islands — same pattern as UrlShortenerClient / JsonFormatterClient
fs.mkdirSync(clientsDir, { recursive: true });
const existingClients = new Set(
  fs.readdirSync(clientsDir).filter((f) => f.endsWith(".ts") || f.endsWith(".tsx"))
);
const keepClients = new Set();

for (const [slug, file] of Object.entries(registry)) {
  const clientPath = path.join(clientsDir, `${slug}.tsx`);
  const label = file.replace(/([A-Z])/g, " $1").trim() || slug;
  const clientCode = `'use client';
/* AUTO-GENERATED by scripts/generate-tool-registry.mjs — do not edit */

import dynamic from "next/dynamic";

const Tool = dynamic(() => import("@/components/tools/${file}"), {
  ssr: false,
  loading: () => (
    <div
      className="w-full min-h-[560px] rounded-xl border border-zinc-200 dark:border-zinc-800 bg-muted/30 animate-pulse flex items-center justify-center text-muted-foreground"
      aria-busy="true"
      aria-label="Loading ${label.replace(/"/g, "")}"
      role="status"
    >
      Loading tool…
    </div>
  ),
});

/** Dedicated island — only loads ${file}, not the multi-tool registry. */
export default function ToolClient() {
  return (
    <div className="w-full min-h-[560px]" id="tool-interface">
      <Tool />
    </div>
  );
}
`;
  fs.writeFileSync(clientPath, clientCode);
  keepClients.add(`${slug}.tsx`);
}

for (const f of existingClients) {
  if (!keepClients.has(f)) {
    fs.unlinkSync(path.join(clientsDir, f));
  }
}

// Dedicated App Router pages — force-static + SEO shell + single client island
fs.mkdirSync(generatedPagesDir, { recursive: true });
const existingPageDirs = new Set(
  fs
    .readdirSync(generatedPagesDir, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name)
);
const keepPages = new Set();

/** Soft-duplicate slugs — next.config redirects; do not emit App Router pages. */
const REDIRECT_ONLY_SLUGS = new Set([
  "enhanced-unit-converter",
  "add-name-date-photo",
]);

for (const slug of Object.keys(registry).sort()) {
  if (HAND_WRITTEN_PAGES.has(slug)) continue;
  if (REDIRECT_ONLY_SLUGS.has(slug)) continue;

  const pageDir = path.join(generatedPagesDir, slug);
  fs.mkdirSync(pageDir, { recursive: true });
  const pagePath = path.join(pageDir, "page.tsx");
  const pageCode = `/* AUTO-GENERATED by scripts/generate-tool-registry.mjs — do not edit */
import type { Metadata } from "next";
import ToolStaticPage, { buildToolPageMetadata } from "@/lib/tools/toolStaticPage";
import ToolClient from "@/lib/tools/clients/${slug}";

export const dynamic = "force-static";

export function generateMetadata(): Metadata {
  return buildToolPageMetadata("${slug}");
}

export default function Page() {
  return <ToolStaticPage slug="${slug}" toolClient={<ToolClient />} />;
}
`;
  fs.writeFileSync(pagePath, pageCode);
  keepPages.add(slug);
}

for (const name of existingPageDirs) {
  if (!keepPages.has(name)) {
    fs.rmSync(path.join(generatedPagesDir, name), { recursive: true, force: true });
  }
}

console.log(
  `Wrote ${outFile}: ${Object.keys(registry).length} tools; loaders: ${keepLoaders.size}; clients: ${keepClients.size}; pages: ${keepPages.size}; slugs: ${slugsOut}; missing: ${missing.length}`
);
if (missing.length) process.exitCode = 1;
