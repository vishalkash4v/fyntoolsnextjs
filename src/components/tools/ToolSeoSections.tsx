import Link from 'next/link';
import { getCategoryHubPath } from '@/utils/breadcrumbs';
import type { FullSeoPageContent } from '@/data/seo-pages/types';

type Faq = { question: string; answer: string };

type Props = {
  title: string;
  description: string;
  category: string;
  howToUse: string[];
  features: string[];
  faqs: Faq[];
  fullSeo?: FullSeoPageContent | null;
  /** Client island rendered after the H1 header */
  toolSlot?: React.ReactNode;
};

function Section({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="mb-8 sm:mb-10 md:mb-12 px-4 sm:px-6 md:px-8">
      <div className="rounded-xl border bg-card text-card-foreground shadow-sm">
        <div className="p-6 pb-3">
          <h2 className="text-xl sm:text-2xl font-semibold tracking-tight">{title}</h2>
        </div>
        <div className="p-6 pt-0 space-y-4 text-zinc-700 dark:text-zinc-300 leading-relaxed">
          {children}
        </div>
      </div>
    </section>
  );
}

/** Server Component — static SEO body (no client hydration for copy). */
export default function ToolSeoSections({
  title,
  description,
  category,
  howToUse,
  features,
  faqs,
  fullSeo,
  toolSlot,
}: Props) {
  const displayTitle = fullSeo?.h1 || title;
  const displayDescription = fullSeo?.metaDescription || description;
  const displayHowTo = fullSeo?.howToUse?.length ? fullSeo.howToUse : howToUse;
  const displayFeatures = fullSeo?.features?.length ? fullSeo.features : features;
  const displayFaqs = fullSeo?.faqs?.length ? fullSeo.faqs : faqs;
  const introParagraphs = fullSeo?.introParagraphs?.length
    ? fullSeo.introParagraphs
    : [displayDescription];
  const categoryHref = getCategoryHubPath(category);

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
        <span className="text-foreground">{displayTitle}</span>
      </nav>

      <header className="text-center mb-8 sm:mb-10 md:mb-12 px-4">
        <p className="mb-3 inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold text-secondary-foreground bg-secondary">
          {category}
        </p>
        <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-3 sm:mb-4 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
          {displayTitle}
        </h1>
        <p className="text-base sm:text-lg md:text-xl text-zinc-700 dark:text-zinc-300 max-w-3xl mx-auto leading-relaxed">
          {displayDescription}
        </p>
      </header>

      {toolSlot}

      <Section id="what-is" title={`What is ${displayTitle}?`}>
        {introParagraphs.map((p, i) => (
          <p key={i}>{p}</p>
        ))}
        {fullSeo?.overview &&
          fullSeo.overview.split(/\n+/).map((p, i) => <p key={`o-${i}`}>{p}</p>)}
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

      {fullSeo?.howItWorks && (
        <Section id="how-it-works" title={`How ${displayTitle} works`}>
          {fullSeo.howItWorks.split(/\n+/).map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </Section>
      )}

      <Section id="how-to-use" title={`How to use ${displayTitle}`}>
        <ol className="space-y-4 list-none">
          {displayHowTo.map((step, index) => (
            <li key={index} className="flex items-start gap-3 sm:gap-4">
              <span className="flex-shrink-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold text-sm">
                {index + 1}
              </span>
              <p className="pt-1 text-sm sm:text-base">{step}</p>
            </li>
          ))}
        </ol>
      </Section>

      {displayFeatures.length > 0 && (
        <Section id="features" title="Key features">
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

      {fullSeo?.advantages && fullSeo.advantages.length > 0 && (
        <Section id="advantages" title="Advantages">
          <ul className="grid md:grid-cols-2 gap-3 list-none p-0 m-0">
            {fullSeo.advantages.map((a, i) => (
              <li key={i} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50 text-sm sm:text-base">
                {a}
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
        <Section id="when-to-use" title={`When to use ${displayTitle}`}>
          <ul className="space-y-2 list-disc pl-5">
            {fullSeo.whenToUse.map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ul>
        </Section>
      )}

      {fullSeo?.examples && fullSeo.examples.length > 0 && (
        <Section id="examples" title="Examples">
          {fullSeo.examples.map((ex, i) => (
            <div key={i} className="rounded-lg border p-4 space-y-2">
              <div>
                <p className="text-xs font-semibold uppercase text-muted-foreground mb-1">Input</p>
                <pre className="text-sm whitespace-pre-wrap bg-muted/50 p-3 rounded">{ex.input}</pre>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase text-muted-foreground mb-1">Output</p>
                <pre className="text-sm whitespace-pre-wrap bg-muted/50 p-3 rounded">{ex.output}</pre>
              </div>
            </div>
          ))}
        </Section>
      )}

      {fullSeo?.useCases && fullSeo.useCases.length > 0 && (
        <Section id="use-cases" title="Use cases">
          {fullSeo.useCases.map((uc, i) => (
            <div key={i}>
              <h3 className="font-semibold text-base sm:text-lg mb-2">{uc.title}</h3>
              <p className="text-sm sm:text-base">{uc.description}</p>
            </div>
          ))}
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
        <Section id="mistakes" title="Common mistakes">
          {fullSeo.commonMistakes.map((m, i) => (
            <p key={i}>{m}</p>
          ))}
        </Section>
      )}

      {fullSeo?.relatedTools && fullSeo.relatedTools.length > 0 && (
        <Section id="related-tools" title="Related tools">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {fullSeo.relatedTools.map((t) => (
              <Link
                key={t.href}
                href={t.href}
                className="p-3 rounded-lg border hover:border-primary/50 hover:bg-muted/40 transition-colors block"
              >
                <div className="font-medium text-primary">{t.name}</div>
                {t.description && (
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{t.description}</p>
                )}
              </Link>
            ))}
          </div>
        </Section>
      )}

      {fullSeo?.conclusion && (
        <Section id="conclusion" title="Summary">
          {fullSeo.conclusion.split(/\n+/).map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </Section>
      )}

      <section id="faq" className="mb-8 sm:mb-10 md:mb-12 px-4 sm:px-6 md:px-8">
        <h2 className="text-2xl font-bold mb-4">Frequently asked questions</h2>
        <div className="space-y-4">
          {displayFaqs.map((faq) => (
            <div key={faq.question} className="rounded-xl border bg-card p-6">
              <h3 className="text-lg font-semibold mb-2">{faq.question}</h3>
              <p className="text-zinc-700 dark:text-zinc-300">{faq.answer}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
