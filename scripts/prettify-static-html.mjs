#!/usr/bin/env node
/**
 * Compact static HTML after the Next.js build.
 *
 * This intentionally does the opposite of pretty-printing: Semrush's
 * text-to-HTML audit measures the delivered HTML, so adding indentation and
 * line breaks makes every page look less content-dense without adding value.
 *
 * Safety:
 * - RSC/webpack scripts are preserved byte-for-byte.
 * - JSON-LD scripts are compacted as JSON only.
 * - pre/code/textarea blocks are preserved byte-for-byte.
 * - Whitespace inside normal text nodes is collapsed without changing
 *   meaningful leading/trailing spaces around inline elements.
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");

function compactJsonLd(block) {
  const m = block.match(/^<script([^>]*type=["']application\/ld\+json["'][^>]*)>([\s\S]*)<\/script>$/i);
  if (!m) return block;
  try {
    const parsed = JSON.parse(m[2].trim());
    const compact = JSON.stringify(parsed).replace(/</g, "\\u003c");
    return "<script" + m[1] + ">" + compact + "</script>";
  } catch {
    return block;
  }
}

function compactHtml(html) {
  const protectedBlocks = [];
  let index = 0;

  // Protect executable/whitespace-sensitive blocks before touching text nodes.
  html = html.replace(
    /<(script|pre|code|textarea)\b[\s\S]*?<\/\1>/gi,
    (block, tag) => {
      const key = "__FYN_PROTECTED_" + index++ + "__";
      protectedBlocks.push({
        key,
        block: tag.toLowerCase() === "script" ? compactJsonLd(block) : block,
      });
      return key;
    }
  );

  // Remove formatting whitespace between tags.
  html = html.replace(/>\s+</g, "><");

  // Collapse whitespace only in text nodes, never inside tags/attributes.
  html = html.replace(/>([^<]+)</g, (_, text) => {
    const leading = /^\s/.test(text) ? " " : "";
    const trailing = /\s$/.test(text) ? " " : "";
    const compact = text.trim().replace(/\s+/g, " ");
    return compact ? ">" + leading + compact + trailing + "<" : "><";
  });

  // Remove indentation/newlines left outside protected blocks.
  html = html.replace(/\n[ \t]+/g, "").replace(/[ \t]{2,}/g, " ");

  for (const { key, block } of protectedBlocks) {
    html = html.replace(key, block);
  }

  return html.trim() + "\n";
}

function collectHtmlFiles(dir, out = []) {
  if (!fs.existsSync(dir)) return out;
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const filePath = path.join(dir, ent.name);
    if (ent.isDirectory()) collectHtmlFiles(filePath, out);
    else if (ent.name.endsWith(".html")) out.push(filePath);
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
    const source = fs.readFileSync(file, "utf8");
    fs.writeFileSync(file, compactHtml(source));
    count++;
  }
}

console.log("Compacted " + count + " HTML files for smaller responses and better text-to-HTML density.");
