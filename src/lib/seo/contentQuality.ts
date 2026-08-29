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
