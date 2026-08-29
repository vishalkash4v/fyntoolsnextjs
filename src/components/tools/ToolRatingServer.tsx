import type { ToolReviewStats } from '@/lib/tools/toolReviewStats';

type Props = {
  toolName: string;
  stats: ToolReviewStats | null;
};

/** Server-rendered rating summary for crawlers and users (live API data only). */
export default function ToolRatingServer({ toolName, stats }: Props) {
  if (!stats || stats.total < 3) return null;

  const fullStars = Math.round(stats.ratingValue);
  const stars =
    '★'.repeat(Math.max(1, Math.min(5, fullStars))) +
    '☆'.repeat(Math.max(0, 5 - Math.min(5, fullStars)));

  return (
    <section
      id="tool-rating"
      className="mb-6 px-4 sm:px-6 md:px-8"
      aria-label={`User rating for ${toolName}`}
    >
      <div className="mx-auto max-w-3xl rounded-xl border border-zinc-200 dark:border-zinc-800 bg-card px-5 py-4">
        <p className="text-sm font-semibold text-foreground mb-1">Community feedback</p>
        <p className="text-amber-500 text-base mb-2" aria-label={`${stats.ratingValue} out of 5 stars`}>
          {stars}
          <span className="text-muted-foreground text-sm ml-2 font-normal">
            {stats.ratingValue.toFixed(1)} / 5 · {stats.total} ratings
          </span>
        </p>
        <p className="text-sm text-muted-foreground">
          {stats.likes} helpful · {stats.dislikes} not helpful — based on real thumbs-up/down votes on
          this page.
        </p>
      </div>
    </section>
  );
}
