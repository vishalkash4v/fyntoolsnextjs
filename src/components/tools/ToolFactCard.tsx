import type { FullSeoPageContent } from '@/data/seo-pages/types';

export type ToolFactCardProps = {
  toolName: string;
  /** Alias of whatItDoes — primary capability */
  primaryFunction: string;
  /** Alias of inputs */
  supportedInputs: string;
  /** Alias of outputs */
  outputFormat: string;
  /** ≤50 words, unique per tool */
  microDescription: string;
  /** Show "100% Client-Side Processing" badge */
  clientSide: boolean;
  limit?: string;
  oneMistake: string;
  processing: string;
  privacySummary: string;
  /** Legacy aliases kept for callers that still pass old names */
  whatItDoes?: string;
  inputs?: string;
  outputs?: string;
};

const CLIENT_SIDE_RE =
  /client[- ]side|in your browser|in-browser|localstorage|runs locally|browser canvas|pdf\.js|entirely in your browser/i;
const SERVER_SIDE_RE = /server|api|gateway|open-meteo|rate feed|geolocat|places key/i;

/** Clamp text to maxWords (default 50). */
export function clampWords(text: string, maxWords = 50): string {
  const words = text.trim().split(/\s+/).filter(Boolean);
  if (words.length <= maxWords) return words.join(' ');
  return `${words.slice(0, maxWords).join(' ')}…`;
}

export function isClientSideProcessing(
  processing: string,
  privacySummary: string
): boolean {
  const blob = `${processing} ${privacySummary}`;
  if (SERVER_SIDE_RE.test(processing)) return false;
  return CLIENT_SIDE_RE.test(blob);
}

export function synthesizeMicroDescription(
  whatItDoes: string,
  limit?: string,
  privacyHint?: string
): string {
  const base = whatItDoes.replace(/\.$/, '');
  const extra = limit
    ? ` Limit: ${limit.replace(/\.$/, '')}.`
    : privacyHint
      ? ` ${privacyHint.split(/[.!?]/)[0]}.`
      : '';
  return clampWords(`${base}.${extra}`.replace(/\.\./g, '.'), 50);
}

/**
 * Visible fact card under the interactive tool — purpose, I/O, privacy.
 * RSC only (no client JS) for CLS safety.
 */
export default function ToolFactCard({
  toolName,
  primaryFunction,
  supportedInputs,
  outputFormat,
  microDescription,
  clientSide,
  limit,
  oneMistake,
  processing,
  privacySummary,
  whatItDoes,
  inputs,
  outputs,
}: ToolFactCardProps) {
  const purpose = primaryFunction || whatItDoes || '';
  const inLabel = supportedInputs || inputs || '';
  const outLabel = outputFormat || outputs || '';

  return (
    <aside
      data-seo="fact-card"
      className="mt-6 rounded-xl border border-border bg-card text-card-foreground cv-auto-220"
      aria-label={`${toolName} quick facts`}
    >
      <div className="px-4 sm:px-5 py-3 border-b border-border flex flex-wrap items-center gap-2 justify-between">
        <h2 className="text-sm font-semibold tracking-tight text-foreground">
          Quick facts — {toolName}
        </h2>
        {clientSide ? (
          <span className="text-[11px] font-semibold uppercase tracking-wide rounded-md border border-emerald-600/40 bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 px-2 py-0.5">
            100% Client-Side Processing
          </span>
        ) : null}
      </div>
      <p
        className="px-4 sm:px-5 py-2 text-sm text-muted-foreground border-b border-border leading-relaxed"
        data-seo="micro-description"
      >
        {microDescription}
      </p>
      <dl className="divide-y divide-border text-sm">
        <div className="px-4 sm:px-5 py-3 grid gap-1 sm:grid-cols-[9rem_1fr]">
          <dt className="font-medium text-muted-foreground">Purpose</dt>
          <dd className="text-foreground/90 leading-relaxed">{purpose}</dd>
        </div>
        <div className="px-4 sm:px-5 py-3 grid gap-1 sm:grid-cols-[9rem_1fr]">
          <dt className="font-medium text-muted-foreground">Inputs</dt>
          <dd className="text-foreground/90 leading-relaxed">{inLabel}</dd>
        </div>
        <div className="px-4 sm:px-5 py-3 grid gap-1 sm:grid-cols-[9rem_1fr]">
          <dt className="font-medium text-muted-foreground">Outputs</dt>
          <dd className="text-foreground/90 leading-relaxed">{outLabel}</dd>
        </div>
        <div className="px-4 sm:px-5 py-3 grid gap-1 sm:grid-cols-[9rem_1fr]">
          <dt className="font-medium text-muted-foreground">Privacy</dt>
          <dd className="text-foreground/90 leading-relaxed">
            {privacySummary}
            {processing ? (
              <span className="block mt-1 text-muted-foreground">Processing: {processing}</span>
            ) : null}
            {limit ? <span className="block mt-1 text-muted-foreground">Limits: {limit}</span> : null}
          </dd>
        </div>
        <div className="px-4 sm:px-5 py-3 grid gap-1 sm:grid-cols-[9rem_1fr]">
          <dt className="font-medium text-muted-foreground">Watch-out</dt>
          <dd className="text-foreground/90 leading-relaxed">{oneMistake}</dd>
        </div>
      </dl>
    </aside>
  );
}

/** Build props from fact card + full SEO merge. */
export function factCardPropsFromSeo(
  toolName: string,
  card: {
    whatItDoes: string;
    inputs: string;
    outputs: string;
    limit?: string;
    oneMistake: string;
    microDescription?: string;
  },
  fullSeo?: FullSeoPageContent | null
): ToolFactCardProps {
  const processing =
    fullSeo?.ioContract?.processing ||
    (fullSeo?.processingNote?.toLowerCase().includes('browser')
      ? 'Client-side (browser)'
      : fullSeo?.processingNote
        ? 'See privacy note above'
        : 'See Privacy & processing note on this page');
  const privacySummary = fullSeo?.processingNote
    ? fullSeo.processingNote.length > 180
      ? `${fullSeo.processingNote.slice(0, 177)}…`
      : fullSeo.processingNote
    : 'Follow the Privacy & processing note on this page. Many FYN tools run in your browser; API tools say so explicitly.';

  const microDescription = clampWords(
    card.microDescription ||
      synthesizeMicroDescription(card.whatItDoes, card.limit, privacySummary),
    50
  );

  return {
    toolName,
    primaryFunction: card.whatItDoes,
    supportedInputs: card.inputs,
    outputFormat: card.outputs,
    microDescription,
    clientSide: isClientSideProcessing(processing, privacySummary),
    limit: card.limit || fullSeo?.ioContract?.limits,
    oneMistake: card.oneMistake,
    processing,
    privacySummary,
    whatItDoes: card.whatItDoes,
    inputs: card.inputs,
    outputs: card.outputs,
  };
}
