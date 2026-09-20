import { AI_IMAGE_STYLE_SUFFIX, orientationSize, type OrientationId } from '@/lib/admaker/constants';

/** Build a Pollinations.ai image URL with premium style suffix. */
export function pollinationsImageUrl(
  prompt: string,
  orientation: OrientationId,
  seed?: number
): string {
  const { width, height } = orientationSize(orientation);
  const enriched = `${prompt.trim().slice(0, 320)}${AI_IMAGE_STYLE_SUFFIX}`;
  const encoded = encodeURIComponent(enriched);
  const s = seed ?? Math.floor(Math.random() * 1_000_000);
  return `https://image.pollinations.ai/prompt/${encoded}?width=${width}&height=${height}&nologo=true&seed=${s}&enhance=true`;
}

export async function fetchPollinationsImage(
  prompt: string,
  orientation: OrientationId
): Promise<Blob> {
  const url = pollinationsImageUrl(prompt, orientation);
  const res = await fetch(url, { cache: 'no-store' });
  if (!res.ok) {
    throw new Error(`Image generation failed (${res.status}). Try again.`);
  }
  const blob = await res.blob();
  if (blob.size < 800) throw new Error('Invalid AI image response');
  return blob.type.startsWith('image/') ? blob : new Blob([blob], { type: 'image/jpeg' });
}

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
  return `${base}, scene ${opts.index + 1}, ${opts.category}`;
}
