#!/usr/bin/env node
/** Reports hand-tuned vs pipeline SEO coverage for all tool slugs. */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));

function slugKeysFromTs(filePath) {
  const text = fs.readFileSync(filePath, "utf8");
  const keys = new Set();
  for (const m of text.matchAll(/^\s+'(\/[^']+)':/gm)) keys.add(m[1].slice(1));
  for (const m of text.matchAll(/^\s+"(\/[^"]+)":/gm)) keys.add(m[1].slice(1));
  return [...keys];
}

const batchSlugs = new Set();
for (const b of ["batch1", "batch2", "batch3", "batch4", "batch5", "batch6", "batch7"]) {
  for (const k of slugKeysFromTs(path.join(root, "src/data/tool-content", `${b}.ts`))) {
    batchSlugs.add(k);
  }
}

const premiumSlugs = new Set(
  slugKeysFromTs(path.join(root, "src/data/tool-content/premium/generated.ts"))
);
const overrideSlugs = new Set(
  slugKeysFromTs(path.join(root, "src/data/tool-content/pageOverrides.ts"))
);

const pipelineOnly = [...premiumSlugs].filter((s) => !batchSlugs.has(s)).sort();

console.log("SEO coverage audit");
console.log("------------------");
console.log(`Hand-tuned batch premium: ${batchSlugs.size} tools`);
console.log(`premium/generated metadata: ${premiumSlugs.size} tools`);
console.log(`pageOverrides:              ${overrideSlugs.size} paths`);
console.log(`Pipeline-only (no batch):   ${pipelineOnly.length} tools`);
if (pipelineOnly.length) {
  console.log("\nPipeline-only slugs:");
  for (const s of pipelineOnly) console.log(`  - ${s}`);
}
