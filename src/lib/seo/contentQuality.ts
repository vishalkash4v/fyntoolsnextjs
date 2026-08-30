import type { Tool } from '@/data/toolsData';
import type { PremiumPartial } from '@/data/seo-pages/types';

/** Phrases from generate-premium-batches.mjs that signal auto-template content. */
const TEMPLATE_MARKERS = [
  'live workspace sits directly under this heading',
  'Search intent for',
  'Everyday productivity',
  'Team and education',
  'Campaign or project bursts',
  'bookmarked on my work laptop',
  'I switched from a cluttered extension to FYN Tools',
  'Are there usage limits on',
  'How is FYN Tools',
  'different from random free sites',
];

const FAKE_TESTIMONIAL_MARKERS = [
  'bookmarked on my work laptop',
  'I switched from a cluttered extension to FYN Tools',
  'saves me a few minutes every week',
];

function containsMarker(text: string, markers: string[]): boolean {
  const lower = text.toLowerCase();
  return markers.some((m) => lower.includes(m.toLowerCase()));
}

function collectStrings(value: unknown): string {
  if (typeof value === 'string') return value;
  if (Array.isArray(value)) return value.map(collectStrings).join('\n');
  if (value && typeof value === 'object') {
    return Object.values(value).map(collectStrings).join('\n');
  }
  return '';
}

/** True when premium long-form blocks look like auto-generated fleet templates. */
export function isGeneratedPremiumTemplate(premium: PremiumPartial | null | undefined): boolean {
  if (!premium) return false;
  const blob = collectStrings({
    intro: premium.introParagraphs,
    overview: premium.overview,
    howItWorks: premium.howItWorks,
    howToUse: premium.howToUse,
    useCases: premium.useCases,
    tips: premium.tips,
    conclusion: premium.conclusion,
    faqs: premium.faqs,
  });
  return containsMarker(blob, TEMPLATE_MARKERS);
}

export function isFakeTestimonial(text: string): boolean {
  return containsMarker(text, FAKE_TESTIMONIAL_MARKERS);
}

const EXTENDED_TEMPLATE_MARKERS = [
  'When you provide input',
  'covers a need that comes up',
  'would otherwise require a separate tool',
  'aligned with common requirements',
  'addresses a common requirement',
  'as part of your regular workflow',
  'without extra setup or configuration',
  'reduces the steps needed to finish',
  'Result: computed value based on the formula',
];

/** Generic batch7 auto-copy — treat as non-premium so curated defaults win. */
const WEAK_BATCH_MARKERS = [
  'locate the input fields at the top of the page',
  'Enter the values or upload the file your task requires',
  'The interactive panel loads above this guide',
  'is built for pregnancy tools tasks',
  'is built for number tools tasks',
  'is built for image tools tasks',
  'Handle everyday pregnancy tools needs',
  'Handle everyday number tools needs',
  'Typical Pregnancy Due Date Calculator input',
  'Interactive Pregnancy Due Date Calculator',
  'Copy-friendly output',
  'Open the tool above, enter your data, and copy results instantly',
  'When you need calculate your',
  'For saved history tools, export data before clearing browser storage',
  'Your input in the form above',
  'Instant result shown below the controls',
  'Before a prenatal visit, tax filing, or project handoff',
  'Enter dates or symptoms in',
  'Review the estimate or log',
];

export function isTemplatedExtendedText(text: string): boolean {
  return containsMarker(text, EXTENDED_TEMPLATE_MARKERS);
}

export function isTemplatedExtendedArray(items: string[] | undefined): boolean {
  if (!items?.length) return false;
  const blob = items.join(' ');
  return isTemplatedExtendedText(blob);
}

/** True when batch7-style content is too generic for premium body merge. */
export function isWeakHowToSteps(steps: string[] | undefined): boolean {
  if (!steps?.length || steps.length < 3) return true;
  const weakMarkers = [
    /^Use the .+ form above\.$/i,
    /^Review the on-screen result\.$/i,
    /^Copy or download for your workflow\.$/i,
    /^Enter amounts and rates in/i,
    /^Compare scenarios by changing inputs\.$/i,
    /^Verify with your bank or advisor when needed\.$/i,
    /^Enter dates or symptoms in/i,
    /^Review the estimate or log\.$/i,
    /^Upload your image\.$/i,
    /^Adjust settings and preview\.$/i,
    /^Download the result\.$/i,
    /^Use .+ as shown in the tool panel\.$/i,
  ];
  const weakCount = steps.filter((s) => weakMarkers.some((re) => re.test(s))).length;
  return weakCount >= 2;
}

export function isWeakBatchPremium(premium: PremiumPartial | null | undefined): boolean {
  if (!premium) return false;
  const blob = collectStrings({
    tldr: premium.tldr,
    intro: premium.introParagraphs,
    howToUse: premium.howToUse,
    useCases: premium.useCases,
    examples: premium.examples,
    features: premium.features,
    faqs: premium.faqs,
    ioContract: premium.ioContract,
    conclusion: premium.conclusion,
  });
  return containsMarker(blob, WEAK_BATCH_MARKERS);
}

const GENERIC_FAQ_MARKERS = [
  'Are there usage limits on',
  'How is FYN Tools',
  'different from random free sites',
  'no artificial daily caps for normal use',
  'consistent privacy-minded browser workflows',
];

const GENERIC_EXAMPLE_MARKERS = [
  'Typical inputs for',
  'Instant breakdown with clear units — copy or screenshot results',
  ' with a realistic sample',
  'Compare results side-by-side in your notes',
  ' and enter your values in the tool above',
  'Get an instant result you can copy or download — no signup required',
  'Processed preview + download of the result',
  'Live counters update — useful on phone or desktop',
  'Transformed output based on the selected operation',
  'Updated text appears in the result section',
  'Result: computed value based on the formula',
  '50,000 | Rate: 6%',
  'Change one field',
  'Live recalculation without page reload',
  'Your input in the form above',
  'Instant result shown below the controls',
  'Sample amounts in the labeled fields',
];

export function isGenericFaq(faq: { question: string; answer: string }): boolean {
  return containsMarker(`${faq.question} ${faq.answer}`, GENERIC_FAQ_MARKERS);
}

export function isGenericExamples(examples: { input: string; output: string }[] | undefined): boolean {
  if (!examples?.length) return true;
  const blob = examples.map((e) => `${e.input} ${e.output}`).join('\n');
  return containsMarker(blob, GENERIC_EXAMPLE_MARKERS);
}
