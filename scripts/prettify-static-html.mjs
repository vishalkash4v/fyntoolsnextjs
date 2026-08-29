#!/usr/bin/env node
/**
 * Format static HTML after `next build` — VS Code "Format Document" style.
 * - 2-space indent on all HTML
 * - Wrapped attributes (meta, link, img)
 * - One script tag per line
 * - Pretty-printed JSON-LD blocks
 * - RSC hydration scripts unchanged (must not break JS)
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import beautify from "js-beautify";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");

const HTML_OPTS = {
  indent_size: 2,
  indent_char: " ",
  indent_with_tabs: false,
  eol: "\n",
  preserve_newlines: true,
  max_preserve_newlines: 2,
  indent_inner_html: true,
  wrap_line_length: 100,
  wrap_attributes: "force-aligned",
  wrap_attributes_indent_size: 2,
  end_with_newline: true,
  extra_liners: ["head", "body", "main", "article", "section", "header", "footer", "nav"],
  unformatted: ["code", "pre", "textarea"],
};

/** Split chained tags Next.js emits on one line. */
function normalizeRawHtml(html) {
  return html
    .replace(/></g, ">\n<")
    .replace(/<\/script>\s*<script/gi, "</script>\n<script")
    .replace(/(imageSrcSet="[^"]*")/gi, (attr) =>
      attr.replace(/,\s+/g, ",\n          ")
    )
    .replace(/(srcSet="[^"]*")/gi, (attr) => attr.replace(/,\s+/g, ",\n            "));
}

function formatJsonLdScript(block) {
  const m = block.match(/^<script([^>]*type=["']application\/ld\+json["'][^>]*)>([\s\S]*)<\/script>$/i);
  if (!m) return block;
  try {
    const parsed = JSON.parse(m[2].trim());
    const pretty = JSON.stringify(parsed, null, 2).replace(/</g, "\\u003c");
    return `<script${m[1]}>\n${pretty}\n</script>`;
  } catch {
    return block;
  }
}

function formatScriptBlock(block) {
  if (/type=["']application\/ld\+json["']/i.test(block)) {
    return formatJsonLdScript(block);
  }
  const open = block.match(/^<script([^>]*)>/i);
  const inner = block.replace(/^<script[^>]*>/i, "").replace(/<\/script>$/i, "").trim();
  if (!open) return block;
  // External script — single line is fine
  if (!inner) {
    return `<script${open[1]}></script>`;
  }
  // Inline RSC/webpack — never modify JS body
  return `<script${open[1]}>\n${inner}\n</script>`;
}

function prettifyHtml(html) {
  html = normalizeRawHtml(html);

  const placeholders = [];
  let idx = 0;

  const stripped = html.replace(/<script[\s\S]*?<\/script>/gi, (block) => {
    const key = `__SCRIPT_PH_${idx}__`;
    placeholders.push({ key, block: formatScriptBlock(block) });
    idx++;
    return `\n${key}\n`;
  });

  let out = beautify.html(stripped, HTML_OPTS);

  for (const { key, block } of placeholders) {
    out = out.replace(key, `\n${block}\n`);
  }

  // Ensure each external script tag sits on its own line after beautify
  out = out.replace(/<\/script>\s*<script/gi, "</script>\n<script");

  return out.replace(/\n{4,}/g, "\n\n\n").trimEnd() + "\n";
}

function collectHtmlFiles(dir, out = []) {
  if (!fs.existsSync(dir)) return out;
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, ent.name);
    if (ent.isDirectory()) collectHtmlFiles(p, out);
    else if (ent.name.endsWith(".html")) out.push(p);
  }
  return out;
}

const dirs = [
  path.join(root, ".next/server/app"),
  path.join(root, ".next/server/pages"),
];

let count = 0;
for (const dir of dirs) {
  for (const file of collectHtmlFiles(dir)) {
    fs.writeFileSync(file, prettifyHtml(fs.readFileSync(file, "utf8")));
    count++;
  }
}

console.log(`Formatted ${count} HTML files (indented, wrapped, VS Code–style).`);
