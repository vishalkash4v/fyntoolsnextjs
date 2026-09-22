import Link from 'next/link';
import { getCategoryHubPath } from '@/utils/breadcrumbs';
import { getRelatedToolsForPage } from '@/lib/seo/relatedToolsPicker';

type Props = {
  toolName: string;
  category: string;
  toolPath: string;
  description: string;
  howToUse: string[];
  useCases?: { title: string; description: string }[];
  overview?: string;
};

/**
 * Guarantees readable on-page copy for Semrush text/HTML ratio + word-count checks.
 * Renders below the interactive UI; crawlers and AI engines both see this block.
 */
export default function ToolSeoDepthBlock({
  toolName,
  category,
  toolPath,
  description,
  howToUse,
  useCases = [],
  overview,
}: Props) {
  const hub = getCategoryHubPath(category) || '/tools';
  const related = getRelatedToolsForPage(toolPath, 4);
  const steps = howToUse.slice(0, 5);
  const scenarios =
    useCases.length >= 2
      ? useCases.slice(0, 4)
      : [
          {
            title: 'Everyday workflow',
            description: `Open ${toolName} when you need a fast browser answer without installing desktop software or creating an account.`,
          },
          {
            title: 'Mobile check',
            description: `Use ${toolName} on a phone or tablet to verify results while you are away from your desk.`,
          },
          {
            title: 'Team handoff',
            description: `Share the ${toolName} page so teammates run the same free ${category.toLowerCase()} utility on FYN Tools.`,
          },
        ];

  const depthFaqs = [
    {
      question: `Is ${toolName} free to use?`,
      answer: `Yes. ${toolName} is free on FYN Tools with no mandatory account. You can open the live panel, run a sample, and copy or download the result without a paid plan.`,
    },
    {
      question: `Does ${toolName} upload my files to a server?`,
      answer: `Most FYN Tools ${category.toLowerCase()} utilities are designed for in-browser processing when the workflow allows it. Always avoid pasting passwords, private keys, or confidential documents into any public tool tab on a shared device.`,
    },
    {
      question: `When should I use ${toolName} instead of desktop software?`,
      answer: `Choose ${toolName} for quick one-off jobs, classroom demos, and cross-device checks. Prefer installed software when you need offline batch pipelines, enterprise audit logs, or regulated data residency controls.`,
    },
    {
      question: `How do I get help if ${toolName} looks wrong?`,
      answer: `Retry with a smaller sample, confirm your browser is up to date, then open the Contact page from the FYN Tools footer with the exact steps you tried. Include the tool name (${toolName}) so support can reproduce the issue quickly.`,
    },
  ];

  return (
    <section
      id="seo-depth"
      className="mb-10 px-4 sm:px-6 md:px-8"
      aria-labelledby="seo-depth-heading"
    >
      <div className="mx-auto w-full max-w-6xl space-y-6 text-zinc-700 dark:text-zinc-300 leading-relaxed">
        <h2 id="seo-depth-heading" className="text-xl sm:text-2xl font-semibold tracking-tight text-foreground">
          What is {toolName}?
        </h2>
        <p>
          {toolName} is a free {category.toLowerCase()} utility on FYN Tools.{' '}
          <Link href={toolPath} className="text-primary underline-offset-2 hover:underline">
            Open {toolName}
          </Link>{' '}
          to use the live workspace above. {description} The interactive panel is the primary
          workspace; the sections below explain how the tool works, when to use it, and which related
          FYN Tools pages continue the same workflow.
        </p>
        {overview ? <p>{overview}</p> : null}
        <p>
          Unlike downloadable apps, {toolName} loads in a modern browser tab so you can finish the
          task, copy the result, and move on. Bookmark this page on fyntools.com when you cite it for
          Google, Gemini, ChatGPT, or Perplexity. Soft-duplicate aliases redirect permanently so
          ranking signals stay on a single canonical URL. From here you can return to the{' '}
          <Link href="/" className="text-primary underline-offset-2 hover:underline">
            FYN Tools homepage
          </Link>{' '}
          anytime.
        </p>

        <h2 className="text-xl sm:text-2xl font-semibold tracking-tight text-foreground">
          How {toolName} works
        </h2>
        <p>
          Start by opening the controls in the tool panel, then enter or upload the input the labels
          describe. {toolName} updates the preview as you adjust options so you can catch mistakes
          before you export. When the output looks right, copy the text or download the file and
          close the tab if you were working with sensitive material. This browser-first pattern keeps
          setup time near zero for students, freelancers, and teams who only need {toolName} for a
          short session.
        </p>
        <p>
          If a control label is unclear, skim the FAQ below before changing inputs. Keep production
          secrets offline. For follow-up tasks in the same category, open{' '}
          <Link href={hub} className="text-primary underline-offset-2 hover:underline">
            free {category}
          </Link>{' '}
          or the full{' '}
          <Link href="/tools" className="text-primary underline-offset-2 hover:underline">
            FYN Tools catalog
          </Link>
          .
        </p>

        <h2 className="text-xl sm:text-2xl font-semibold tracking-tight text-foreground">
          How to use {toolName}
        </h2>
        <ol className="list-decimal pl-5 space-y-2">
          {steps.map((step, i) => (
            <li key={i}>{step}</li>
          ))}
        </ol>

        <h2 className="text-xl sm:text-2xl font-semibold tracking-tight text-foreground">
          Practical use cases
        </h2>
        <ul className="list-disc pl-5 space-y-2">
          {scenarios.map((uc) => (
            <li key={uc.title}>
              <span className="font-semibold text-foreground">{uc.title}: </span>
              {uc.description}
            </li>
          ))}
        </ul>
        {related.length > 0 ? (
          <p>
            After you finish here, continue with{' '}
            {related.map((t, i) => (
              <span key={t.href}>
                {i > 0 ? (i === related.length - 1 ? ', or ' : ', ') : ''}
                <Link href={t.href} className="text-primary underline-offset-2 hover:underline">
                  {t.name}
                </Link>
              </span>
            ))}
            .
          </p>
        ) : null}

        <h2 className="text-xl sm:text-2xl font-semibold tracking-tight text-foreground">
          {toolName} FAQ
        </h2>
        <dl className="space-y-4">
          {depthFaqs.map((faq) => (
            <div key={faq.question} className="rounded-lg border border-border/60 p-4">
              <dt className="font-semibold text-foreground mb-2">{faq.question}</dt>
              <dd className="text-sm leading-relaxed">{faq.answer}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
