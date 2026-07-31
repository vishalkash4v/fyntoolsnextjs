import Link from 'next/link';
import { getCategoryHubPath } from '@/utils/breadcrumbs';
import type { FullSeoPageContent } from '@/data/seo-pages/types';
import { getAuthor, PRIMARY_AUTHOR_SLUG } from '@/data/authors';
import ToolFeedbackLazy from '@/components/tools/ToolFeedbackLazy';

type Faq = { question: string; answer: string };

type Props = {
  title: string;
  description: string;
  category: string;
  howToUse: string[];
  features: string[];
  faqs: Faq[];
  fullSeo?: FullSeoPageContent | null;
  /** Canonical tool path e.g. /word-counter — used for review API */
  toolPath?: string;
  /** Client island rendered immediately below H1 (CLS-safe min-height expected) */
  toolSlot?: React.ReactNode;
};

function Section({
  id,
  title,
  children,
  asCard = true,
}: {
  id: string;
  title: string;
  children: React.ReactNode;
  asCard?: boolean;
}) {
  // content-visibility keeps below-fold SEO paint off the critical path (LCP/CLS)
  const sectionStyle = {
    contentVisibility: 'auto' as const,
    containIntrinsicSize: '0 480px',
  };
  if (!asCard) {
    return (
      <section id={id} className="mb-8 sm:mb-10 md:mb-12 px-4 sm:px-6 md:px-8" style={sectionStyle}>
        <h2 className="text-xl sm:text-2xl font-semibold tracking-tight mb-4">{title}</h2>
        <div className="space-y-4 text-zinc-700 dark:text-zinc-300 leading-relaxed">{children}</div>
      </section>
    );
  }
  return (
    <section id={id} className="mb-8 sm:mb-10 md:mb-12 px-4 sm:px-6 md:px-8" style={sectionStyle}>
      <div className="rounded-xl border bg-card text-card-foreground shadow-sm">
        <div className="p-6 pb-3">
          <h2 className="text-xl sm:text-2xl font-semibold tracking-tight">{title}</h2>
        </div>
        <div className="p-6 pt-0 space-y-4 text-zinc-700 dark:text-zinc-300 leading-relaxed">{children}</div>
      </div>
    </section>
  );
}

/**
 * Server Component — Googlebot-readable SEO body.
 * Required hierarchy: H1 → Tool → How to Use → What is → Use Cases → FAQ → Related Tools.
 * Extra sections follow for information gain (features, tips, comparisons, etc.).
 */
export default function ToolSeoSections({
  title,
  description,
  category,
  howToUse,
  features,
  faqs,
  fullSeo,
  toolPath,
  toolSlot,
}: Props) {
  const displayTitle = fullSeo?.h1 || title;
  const displayDescription = fullSeo?.metaDescription || description;
  const displayHowTo = (fullSeo?.howToUse?.length ? fullSeo.howToUse : howToUse).slice(0, 6);
  const displayFeatures = fullSeo?.features?.length ? fullSeo.features : features;
  const displayFaqs = (fullSeo?.faqs?.length ? fullSeo.faqs : faqs).slice(0, 8);
  const introParagraphs = fullSeo?.introParagraphs?.length
    ? fullSeo.introParagraphs
    : [displayDescription];
  const useCases = fullSeo?.useCases?.length ? fullSeo.useCases : [];
  const relatedTools = fullSeo?.relatedTools?.length ? fullSeo.relatedTools : [];
  const relatedGuides = fullSeo?.relatedGuides?.length ? fullSeo.relatedGuides : [];
  const categoryHref = getCategoryHubPath(category);
  // Prefer catalog tool name for H2s ("URL Shortener"), not the long SEO H1.
  const conceptName = (title || displayTitle).replace(/\s*[—|-].*$/, '').trim() || displayTitle;
  const author = getAuthor(PRIMARY_AUTHOR_SLUG);

  return (
    <div className="w-full">
      <nav
        className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted-foreground mb-6 px-4 sm:px-6 md:px-8"
        aria-label="Breadcrumb"
      >
        <Link href="/" className="hover:text-primary">
          Home
        </Link>
        <span aria-hidden>/</span>
        <Link href="/tools" className="hover:text-primary">
          Tools
        </Link>
        <span aria-hidden>/</span>
        <Link href={categoryHref} className="hover:text-primary">
          {category}
        </Link>
        <span aria-hidden>/</span>
        <span className="text-foreground">{conceptName}</span>
      </nav>

      {/* 1. Header + H1 (benefit-oriented) */}
      <header className="text-center mb-6 sm:mb-8 px-4">
        <p className="mb-3 inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold text-secondary-foreground bg-secondary">
          {category}
        </p>
        <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-3 sm:mb-4 text-foreground">
          {displayTitle}
        </h1>
        <p className="text-base sm:text-lg text-zinc-700 dark:text-zinc-300 max-w-3xl mx-auto leading-relaxed">
          {displayDescription}
        </p>
        {author && (
          <p className="mt-3 text-sm text-muted-foreground">
            Reviewed by{' '}
            <Link href={`/author/${author.slug}`} className="text-primary hover:underline font-medium">
              {author.name}
            </Link>
            {' · '}
            <Link href="/guides" className="hover:underline">
              Guides
            </Link>
          </p>
        )}
        <ToolFeedbackLazy toolName={displayTitle} toolPath={toolPath || ''} />
      </header>

      {/* 2. Interactive tool immediately below H1 (no scroll required) */}
      {toolSlot}

      {/* 3. How to Use */}
      <Section id="how-to-use" title={`How to Use the ${conceptName}`} asCard={false}>
        <ol className="space-y-3 list-decimal pl-5 marker:font-semibold marker:text-primary">
          {displayHowTo.map((step, index) => (
            <li key={index} className="pl-1 text-sm sm:text-base leading-relaxed">
              {step}
            </li>
          ))}
        </ol>
      </Section>

      {/* 4. What is [concept] — technical explanation */}
      <Section id="what-is" title={`What is ${/^(a|an|the)\s/i.test(conceptName) ? conceptName : /^[aeiou]/i.test(conceptName) ? `an ${conceptName}` : `a ${conceptName}`}?`} asCard={false}>
        {introParagraphs.map((p, i) => (
          <p key={i}>{p}</p>
        ))}
        {fullSeo?.overview &&
          fullSeo.overview.split(/\n+/).map((p, i) => <p key={`o-${i}`}>{p}</p>)}
        {fullSeo?.howItWorks && (
          <>
            <h3 className="text-lg font-semibold text-foreground pt-2">How it works</h3>
            {fullSeo.howItWorks.split(/\n+/).map((p, i) => (
              <p key={`h-${i}`}>{p}</p>
            ))}
          </>
        )}
        {fullSeo?.internalLinkInIntro && (
          <p>
            {fullSeo.internalLinkInIntro.before}
            <Link
              href={fullSeo.internalLinkInIntro.href}
              className="text-primary font-medium hover:underline"
            >
              {fullSeo.internalLinkInIntro.linkText}
            </Link>
            {fullSeo.internalLinkInIntro.after}
          </p>
        )}
      </Section>

      {/* 5. Common Use Cases & Examples */}
      {useCases.length > 0 && (
        <Section id="use-cases" title="Common Use Cases & Examples" asCard={false}>
          <ul className="space-y-3 list-disc pl-5">
            {useCases.map((uc, i) => (
              <li key={i} className="text-sm sm:text-base">
                <span className="font-semibold text-foreground">{uc.title}: </span>
                {uc.description}
              </li>
            ))}
          </ul>
        </Section>
      )}

      {fullSeo?.examples && fullSeo.examples.length > 0 && (
        <Section id="examples" title="Input / Output Examples" asCard={false}>
          {fullSeo.examples.map((ex, i) => (
            <div key={i} className="rounded-xl border border-zinc-200 dark:border-zinc-800 p-4 space-y-2">
              <div>
                <h3 className="text-xs font-semibold uppercase text-muted-foreground mb-1">Input</h3>
                <pre className="text-sm whitespace-pre-wrap bg-muted/50 p-3 rounded-lg font-mono">{ex.input}</pre>
              </div>
              <div>
                <h3 className="text-xs font-semibold uppercase text-muted-foreground mb-1">Output</h3>
                <pre className="text-sm whitespace-pre-wrap bg-muted/50 p-3 rounded-lg font-mono">{ex.output}</pre>
              </div>
            </div>
          ))}
        </Section>
      )}

      {/* 6. FAQ — semantic details/summary */}
      <section
        id="faq"
        className="mb-8 sm:mb-10 md:mb-12 px-4 sm:px-6 md:px-8"
        style={{ contentVisibility: 'auto', containIntrinsicSize: '0 420px' }}
      >
        <h2 className="text-xl sm:text-2xl font-semibold tracking-tight mb-4">
          Frequently Asked Questions
        </h2>
        <div className="space-y-3">
          {displayFaqs.map((faq) => (
            <details
              key={faq.question}
              className="group rounded-xl border bg-card px-5 py-3 open:shadow-sm"
            >
              <summary className="cursor-pointer list-none font-semibold text-base sm:text-lg text-foreground marker:content-none [&::-webkit-details-marker]:hidden flex items-center justify-between gap-3">
                <span>{faq.question}</span>
                <span className="text-muted-foreground text-xl leading-none group-open:rotate-45 transition-transform">
                  +
                </span>
              </summary>
              <p className="mt-3 text-zinc-700 dark:text-zinc-300 leading-relaxed pb-2">
                {faq.answer}
              </p>
            </details>
          ))}
        </div>
      </section>

      {/* 7. Related Guides + Related Tools — Next.js Link only */}
      {fullSeo?.testimonials && fullSeo.testimonials.length > 0 && (
        <section id="testimonials" className="mb-8 sm:mb-10 md:mb-12 px-4 sm:px-6 md:px-8">
          <h2 className="text-xl sm:text-2xl font-semibold tracking-tight mb-2">What Users Say</h2>
          <p className="text-sm text-muted-foreground mb-4">Feedback from people who use {conceptName} on FYN Tools.</p>
          <ul className="grid md:grid-cols-2 gap-4 list-none p-0 m-0">
            {fullSeo.testimonials.map((t, i) => (
              <li
                key={`${t.name}-${i}`}
                className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-card p-4"
              >
                <p className="text-amber-500 text-sm mb-2" aria-label={`${t.rating} out of 5 stars`}>
                  {'★'.repeat(Math.max(1, Math.min(5, t.rating)))}
                  {'☆'.repeat(Math.max(0, 5 - Math.min(5, t.rating)))}
                </p>
                <p className="text-sm text-foreground/90 mb-3">&ldquo;{t.text}&rdquo;</p>
                <p className="text-sm font-semibold">
                  {t.name}
                  {t.title ? <span className="text-muted-foreground font-normal"> · {t.title}</span> : null}
                </p>
              </li>
            ))}
          </ul>
        </section>
      )}

      {relatedGuides.length > 0 && (
        <section id="related-guides" className="mb-8 sm:mb-10 md:mb-12 px-4 sm:px-6 md:px-8">
          <h2 className="text-xl sm:text-2xl font-semibold tracking-tight mb-4">Related Guides</h2>
          <ul className="grid sm:grid-cols-2 gap-3 list-none p-0 m-0">
            {relatedGuides.map((g) => (
              <li key={g.href}>
                <Link
                  href={g.href}
                  prefetch={false}
                  className="h-full p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:border-primary/50 hover:bg-muted/40 transition-colors block"
                >
                  <span className="font-medium text-primary">{g.title}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      {relatedTools.length > 0 && (
        <section id="related-tools" className="mb-8 sm:mb-10 md:mb-12 px-4 sm:px-6 md:px-8">
          <h2 className="text-xl sm:text-2xl font-semibold tracking-tight mb-4">Related Tools</h2>
          <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 list-none p-0 m-0">
            {relatedTools.map((t) => (
              <li key={t.href}>
                <Link
                  href={t.href}
                  prefetch={false}
                  className="h-full p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:border-primary/50 hover:bg-muted/40 transition-colors block"
                >
                  <span className="font-medium text-primary">{t.name}</span>
                  {t.description && (
                    <span className="block text-xs text-muted-foreground mt-1 line-clamp-2">
                      {t.description}
                    </span>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* ——— Additional information-gain sections (after core hierarchy) ——— */}

      {displayFeatures.length > 0 && (
        <Section id="features" title="Key Features">
          <ul className="grid md:grid-cols-2 gap-3 list-none p-0 m-0">
            {displayFeatures.map((feature, index) => (
              <li key={index} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                <span className="w-1.5 h-1.5 bg-primary rounded-full mt-2 shrink-0" />
                <span className="text-sm sm:text-base">{feature}</span>
              </li>
            ))}
          </ul>
        </Section>
      )}

      {(fullSeo?.benefits?.length ?? 0) > 0 && (
        <Section id="benefits" title="Benefits">
          {fullSeo!.benefits.map((b, i) => (
            <p key={i}>{b}</p>
          ))}
        </Section>
      )}

      {fullSeo?.whenToUse && fullSeo.whenToUse.length > 0 && (
        <Section id="when-to-use" title={`When to Use ${conceptName}`}>
          <ul className="space-y-2 list-disc pl-5">
            {fullSeo.whenToUse.map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ul>
        </Section>
      )}

      {fullSeo?.advantages && fullSeo.advantages.length > 0 && (
        <Section id="advantages" title="Advantages">
          <ul className="grid md:grid-cols-2 gap-3 list-disc pl-5">
            {fullSeo.advantages.map((a, i) => (
              <li key={i} className="text-sm sm:text-base">
                {a}
              </li>
            ))}
          </ul>
        </Section>
      )}

      {fullSeo?.tips && fullSeo.tips.length > 0 && (
        <Section id="tips" title="Tips">
          <ul className="space-y-2 list-decimal pl-5">
            {fullSeo.tips.map((tip, i) => (
              <li key={i}>{tip}</li>
            ))}
          </ul>
        </Section>
      )}

      {fullSeo?.commonMistakes && fullSeo.commonMistakes.length > 0 && (
        <Section id="mistakes" title="Common Mistakes">
          {fullSeo.commonMistakes.map((m, i) => (
            <p key={i}>{m}</p>
          ))}
        </Section>
      )}

      {fullSeo?.toolComparisons && fullSeo.toolComparisons.length > 0 && (
        <Section id="comparisons" title={`${conceptName} vs Alternatives`}>
          <div className="space-y-4">
            {fullSeo.toolComparisons.map((c, i) => (
              <div key={i} className="rounded-lg border p-4">
                <h3 className="font-semibold text-base mb-2">
                  <Link href={c.toolAHref} className="text-primary hover:underline">
                    {c.toolAName}
                  </Link>
                  {' vs '}
                  <Link href={c.toolBHref} className="text-primary hover:underline">
                    {c.toolBName}
                  </Link>
                </h3>
                <p className="text-sm sm:text-base">{c.description}</p>
              </div>
            ))}
          </div>
        </Section>
      )}

      {fullSeo?.relatedSearches && fullSeo.relatedSearches.length > 0 && (
        <Section id="related-searches" title="People Also Search For">
          <ul className="flex flex-wrap gap-2 list-none p-0 m-0">
            {fullSeo.relatedSearches.map((s, i) => (
              <li key={i}>
                {s.href ? (
                  <Link
                    href={s.href}
                    className="inline-block rounded-md border px-3 py-1.5 text-sm hover:border-primary/50 hover:bg-muted/40"
                  >
                    {s.phrase}
                  </Link>
                ) : (
                  <span className="inline-block rounded-md border px-3 py-1.5 text-sm text-muted-foreground">
                    {s.phrase}
                  </span>
                )}
              </li>
            ))}
          </ul>
        </Section>
      )}

      {fullSeo?.conclusion && (
        <Section id="conclusion" title="Summary">
          {fullSeo.conclusion.split(/\n+/).map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </Section>
      )}
    </div>
  );
}
