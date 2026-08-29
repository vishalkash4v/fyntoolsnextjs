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
