import { resolveToolPage } from '@/lib/tools/resolveToolPage';
import { toolNeedsClientOnly } from '@/lib/tools/ssr-policy.generated';

type Props = { slug: string };

/**
 * Server-rendered tool preview for client-only islands (camera, heavy canvas).
 * Googlebot gets real text in #tool — not "Loading tool…".
 */
export default function ToolCrawlerFallback({ slug }: Props) {
  if (!toolNeedsClientOnly(slug)) return null;

  const resolved = resolveToolPage(slug);
  if (!resolved) return null;

  const { tool, fullSeo, howToUse, features } = resolved;
  const displayName = (tool.name || fullSeo?.h1 || slug).replace(/\s*[—|-].*$/, '').trim();
  const io = fullSeo?.ioContract;
  const steps = (fullSeo?.howToUse?.length ? fullSeo.howToUse : howToUse).slice(0, 6);
  const featureList = (fullSeo?.features?.length ? fullSeo.features : features).slice(0, 8);

  return (
    <div
      id="tool-static-preview"
      className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-card p-6 mb-4 shadow-sm"
      data-seo="tool-fallback"
    >
      <h2 className="text-xl sm:text-2xl font-semibold text-foreground mb-2">{displayName}</h2>
      <p className="text-sm sm:text-base text-zinc-700 dark:text-zinc-300 leading-relaxed mb-4">
        {fullSeo?.metaDescription || tool.description}
      </p>

      {io && (
        <dl className="grid sm:grid-cols-2 gap-3 text-sm mb-4">
          <div>
            <dt className="font-semibold text-foreground">Inputs</dt>
            <dd className="text-zinc-700 dark:text-zinc-300 mt-1">{io.inputs}</dd>
          </div>
          <div>
            <dt className="font-semibold text-foreground">Outputs</dt>
            <dd className="text-zinc-700 dark:text-zinc-300 mt-1">{io.outputs}</dd>
          </div>
          <div>
            <dt className="font-semibold text-foreground">Processing</dt>
            <dd className="text-zinc-700 dark:text-zinc-300 mt-1">{io.processing}</dd>
          </div>
          {io.limits ? (
            <div>
              <dt className="font-semibold text-foreground">Limits</dt>
              <dd className="text-zinc-700 dark:text-zinc-300 mt-1">{io.limits}</dd>
            </div>
          ) : null}
        </dl>
      )}

      {steps.length > 0 && (
        <div className="mb-4">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground mb-2">
            Quick steps
          </h3>
          <ol className="list-decimal pl-5 space-y-1.5 text-sm text-zinc-700 dark:text-zinc-300">
            {steps.map((step, i) => (
              <li key={i}>{step}</li>
            ))}
          </ol>
        </div>
      )}

      {featureList.length > 0 && (
        <ul className="grid sm:grid-cols-2 gap-2 text-sm text-zinc-700 dark:text-zinc-300 list-none p-0 m-0">
          {featureList.map((f, i) => (
            <li key={i} className="flex gap-2">
              <span className="text-primary shrink-0" aria-hidden>
                •
              </span>
              <span>{f}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
