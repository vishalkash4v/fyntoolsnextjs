/**
 * Generate TOOL_LOADERS from toolsData paths → real components in src/components/tools.
 * Never maps to ToolPageLayout / shells / loaders.
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

const EXCLUDED = new Set([
  "ToolPageLayout",
  "ToolPageShell",
  "ToolContentSections",
  "ToolBreadcrumbs",
  "ToolBreadcrumbsServer",
  "ToolFAQ",
  "ToolSearch",
  "InteractiveToolLoader",
  "LikeDislikeButtons",
  "SocialShareButtons",
  "SitemapReport",
  "ThemeManager", // themes is a route, not a tool page via [slug]
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
  "qr-generator": "QrGenerator", // alias component if exists; prefer QRCodeGenerator via path
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

  // Case-insensitive match
  const lower = pascal.toLowerCase();
  for (const f of toolFileSet) {
    if (f.toLowerCase() === lower) return f;
  }

  // QR special cases
  if (slug === "qr-code-generator" && toolFileSet.has("QRCodeGenerator")) {
    return "QRCodeGenerator";
  }
  if (slug === "qr-scanner" && toolFileSet.has("QRScanner")) return "QRScanner";

  // Fuzzy: component name contains significant parts
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
`;

fs.mkdirSync(path.dirname(outFile), { recursive: true });
fs.writeFileSync(outFile, code);

const layoutHits = Object.values(registry).filter((c) => c === "ToolPageLayout");
console.log(
  `Wrote ${outFile}: ${Object.keys(registry).length} tools, ToolPageLayout hits: ${layoutHits.length}, missing: ${missing.length}`
);
if (layoutHits.length) process.exitCode = 1;
