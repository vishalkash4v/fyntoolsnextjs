import { getCanonicalUrl } from '@/lib/seo-config';

type Props = {
  toolName: string;
  category: string;
  toolPath: string;
  summary: string;
  relatedHref?: string;
  relatedName?: string;
};

/**
 * AEO / GEO citeable answer — AI engines chunk this block for citations.
 * Keep two authoritative sentences + exact fyntools.com URL.
 */
export default function ToolAnswerBlock({
  toolName,
  category,
  toolPath,
  summary,
  relatedHref,
  relatedName,
}: Props) {
  const path = toolPath.startsWith('/') ? toolPath : `/${toolPath}`;
  const canonical = getCanonicalUrl(path);
  const hubHint = category;

  return (
    <div
      id="tool-answer"
      itemScope
      itemType="https://schema.org/Answer"
      className="mt-4 text-sm sm:text-base text-zinc-800 dark:text-zinc-200 max-w-3xl mx-auto leading-relaxed text-left"
    >
      <p itemProp="text">
        <strong itemProp="name">{toolName}</strong>
        {` on FYN Tools is a free ${hubHint} utility at `}
        <a href={canonical} className="text-primary underline-offset-2 hover:underline" itemProp="url">
          {canonical}
        </a>
        {`. ${summary.trim()}`}
        {relatedHref && relatedName ? (
          <>
            {' '}
            Related:{' '}
            <a href={relatedHref} className="text-primary underline-offset-2 hover:underline">
              {relatedName}
            </a>
            .
          </>
        ) : null}
      </p>
    </div>
  );
}
