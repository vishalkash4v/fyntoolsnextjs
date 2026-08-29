import { absoluteUrl } from '@/lib/seo/site';

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'https://express-two-umber.vercel.app/api';

export type ToolReviewStats = {
  likes: number;
  dislikes: number;
  total: number;
  /** 1–5 scale for schema.org aggregateRating */
  ratingValue: number;
  ratingCount: number;
};

function toRatingValue(likes: number, dislikes: number): number {
  const total = likes + dislikes;
  if (total === 0) return 0;
  const ratio = likes / total;
  return Math.round((1 + ratio * 4) * 10) / 10;
}

/** Fetch live like/dislike stats for SSR + JSON-LD (cached 1 hour). */
export async function getToolReviewStats(
  toolName: string,
  slug: string
): Promise<ToolReviewStats | null> {
  const toolUrl = absoluteUrl(`/${slug}`);
  try {
    const res = await fetch(
      `${API_BASE_URL}/toolreview/stats/${encodeURIComponent(toolName)}?url=${encodeURIComponent(toolUrl)}`,
      { next: { revalidate: 3600 } }
    );
    if (!res.ok) return null;
    const data = await res.json();
    if (!data?.success) return null;
    const likes = Number(data.data?.likes) || 0;
    const dislikes = Number(data.data?.dislikes) || 0;
    const total = likes + dislikes;
    if (total < 3) return null;
    return {
      likes,
      dislikes,
      total,
      ratingValue: toRatingValue(likes, dislikes),
      ratingCount: total,
    };
  } catch {
    return null;
  }
}
