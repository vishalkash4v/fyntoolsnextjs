import { AI_IMAGE_STYLE_SUFFIX, type OrientationId } from '@/lib/admaker/constants';
import { API_BASE_URL } from '@/lib/seo/site';

export function buildAiImagePrompt(opts: {
  projectName: string;
  category: string;
  subCategory: string;
  sceneHint?: string;
  index: number;
}) {
  const base = opts.sceneHint?.trim()
    ? opts.sceneHint
    : `${opts.projectName || 'brand'} ${opts.subCategory} product advertisement lifestyle photo`;
  return `${base}, scene ${opts.index + 1}, ${opts.category}${AI_IMAGE_STYLE_SUFFIX}`;
}

function base64ToBlob(base64: string, mimeType: string): Blob {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return new Blob([bytes], { type: mimeType });
}

/**
 * Generate an ad image via backend (Gemini → Pollinations Flux → stock).
 * Never hits Pollinations "sana" from the browser (that path requires pollen credits).
 */
export async function fetchPollinationsImage(
  prompt: string,
  orientation: OrientationId,
  meta?: { category?: string; subCategory?: string }
): Promise<{ blob: Blob; source?: string; warning?: string }> {
  const res = await fetch(`${API_BASE_URL}/admaker/image`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      prompt: prompt.replace(AI_IMAGE_STYLE_SUFFIX, '').trim(),
      orientation,
      category: meta?.category,
      subCategory: meta?.subCategory,
      seed: Math.floor(Math.random() * 1_000_000),
    }),
  });

  const json = await res.json().catch(() => null);
  if (!res.ok || !json?.success || !json?.data?.imageBase64) {
    const detail =
      json?.error ||
      (Array.isArray(json?.details) ? json.details.join('; ') : null) ||
      `Image generation failed (${res.status})`;
    throw new Error(detail);
  }

  const blob = base64ToBlob(json.data.imageBase64, json.data.mimeType || 'image/jpeg');
  if (blob.size < 800) throw new Error('Invalid AI image response');
  return { blob, source: json.data.source, warning: json.data.warning };
}

/** @deprecated Use fetchPollinationsImage — kept for callers expecting a URL builder. */
export function pollinationsImageUrl(prompt: string, orientation: OrientationId, seed?: number): string {
  const enriched = `${prompt.trim().slice(0, 320)}${AI_IMAGE_STYLE_SUFFIX}`;
  const encoded = encodeURIComponent(enriched);
  const s = seed ?? Math.floor(Math.random() * 1_000_000);
  // Informational only — browser should not fetch this (sana is paid).
  return `https://gen.pollinations.ai/image/${encoded}?model=flux&seed=${s}&enhance=false&orientation=${orientation}`;
}
