/**
 * Premium long-form SEO blocks.
 * Hand-tuned entries below override generated content for the same path.
 * Fleet content: `premium/generated.ts` (from `npm run generate-premium`).
 * Batch content: `batch1.ts` (Phase 1, Batch 1), `batch2.ts` (Phase 1, Batch 2),
 * `batch3.ts` (Phase 1, Batch 3), `batch4.ts` (Phase 1, Batch 4),
 * `batch5.ts` (Phase 1, Batch 5), `batch6.ts` (Phase 2), `batch7.ts` (Phase 3 — remaining tools).
 */
import type { PremiumPartial } from '@/data/seo-pages/types';
import { generatedPremiumToolSeo } from '@/data/tool-content/premium/generated';
import { batch1ToolSeo } from '@/data/tool-content/batch1';
import { batch2ToolSeo } from '@/data/tool-content/batch2';
import { batch3ToolSeo } from '@/data/tool-content/batch3';
import { batch4ToolSeo } from '@/data/tool-content/batch4';
import { batch5ToolSeo } from '@/data/tool-content/batch5';
import { batch6ToolSeo } from '@/data/tool-content/batch6';
import { batch7ToolSeo } from '@/data/tool-content/batch7';

/** Batch content wins over generated; later batches win over earlier. */
export const premiumToolSeo: Record<string, PremiumPartial> = {
  ...generatedPremiumToolSeo,
  ...batch1ToolSeo,
  ...batch2ToolSeo,
  ...batch3ToolSeo,
  ...batch4ToolSeo,
  ...batch5ToolSeo,
  ...batch6ToolSeo,
  ...batch7ToolSeo,
};

export function getPremiumToolSeo(path: string): PremiumPartial | null {
  return premiumToolSeo[path] ?? null;
}
