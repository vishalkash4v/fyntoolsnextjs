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
 * Use descriptive anchor text (never naked self-URLs) so Semrush #216 stays clean.
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
        {` on FYN Tools is a free ${hubHint} utility. `}
        <a href={path} className="text-primary underline-offset-2 hover:underline" itemProp="url">
          Open {toolName}
        </a>
        {` in your browser — no signup required. ${summary.trim()}`}
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
