import type { Tool } from '@/data/toolsData';
import { allTools } from '@/data/toolsData';
import { getToolSeoContent } from '@/data/toolSeoContent';
import type { FullSeoPageContent } from '@/data/seo-pages/types';
import { getCategoryHubPath } from '@/utils/breadcrumbs';
import { pageOverrides } from '@/data/tool-content/pageOverrides';
import { getPremiumToolSeo } from '@/data/tool-content/premiumToolSeo';
import { getGuidesForTool } from '@/data/guides/guidesData';
import { buildExamplesForTool, buildTestimonialsForTool } from '@/data/tool-content/socialProof';
import {
  defaultIoContract,
  defaultProcessingNote,
  defaultTldr,
} from '@/data/tool-content/toolProcessingDefaults';
import { isGeneratedPremiumTemplate, isFakeTestimonial } from '@/lib/seo/contentQuality';

/** Shell / sitewide SEO upgrade date — bump when Phase content batches ship. */
export const SEO_SHELL_DATE = '2026-08-29';

function containsTemplatePhrase(text: string): boolean {
  const markers = [
    'live workspace sits directly under',
    'Search intent for',
    'Everyday productivity',
    'Team and education',
    'Campaign or project bursts',
  ];
  const lower = text.toLowerCase();
  return markers.some((m) => lower.includes(m.toLowerCase()));
}

function relatedToolsFallback(tool: Tool, limit = 10) {
  const skip = new Set(['/enhanced-unit-converter', '/add-name-date-photo', tool.path]);
  const same = allTools.filter((t) => t.category === tool.category && !skip.has(t.path));
  const picked = same.slice(0, limit);
  if (picked.length < limit) {
    for (const t of allTools) {
      if (skip.has(t.path) || picked.some((p) => p.path === t.path)) continue;
      picked.push(t);
      if (picked.length >= limit) break;
    }
  }
  return picked.map((t) => ({
    name: t.name,
    href: t.path,
    description: t.description.slice(0, 110),
  }));
}

function ensureRelatedCount(
  tools: { name: string; href: string; description?: string }[],
  tool: Tool,
  min = 8,
  max = 12
) {
  if (tools.length >= min) return tools.slice(0, max);
  const fallback = relatedToolsFallback(tool, max);
  const seen = new Set(tools.map((t) => t.href));
  for (const t of fallback) {
    if (seen.has(t.href)) continue;
    tools.push(t);
    seen.add(t.href);
    if (tools.length >= min) break;
  }
  return tools.slice(0, max);
}

function featureListFromTool(tool: Tool): string[] {
  if (tool.features) {
    return tool.features
      .split(',')
      .map((f) => f.trim())
      .filter(Boolean)
      .slice(0, 10);
  }
  return [
    'Works in your browser',
    'No account required',
    'Mobile-friendly layout',
    'Copy or download results',
  ];
}

function splitIntro(text: string): string[] {
  return text
    .split(/\n+/)
    .map((p) => p.trim())
    .filter(Boolean);
}

function defaultHowTo(tool: Tool, feats: string[]): string[] {
  const n = tool.name;
  const f0 = feats[0]?.toLowerCase() || 'your input';
  return [
    `Open ${n} on FYN Tools.`,
    `Enter or upload ${f0} using the controls above.`,
    `Adjust options if available, then review the live result.`,
    `Copy, download, or export the output for your workflow.`,
    `Bookmark ${tool.path} if you use ${n} regularly.`,
  ];
}

function defaultFaqs(tool: Tool): { question: string; answer: string }[] {
  const hub = getCategoryHubPath(tool.category);
  return [
    {
      question: `Is ${tool.name} free on FYN Tools?`,
      answer: `Yes. ${tool.name} (${tool.path}) is free to use with no mandatory account. It sits in our ${tool.category} collection alongside related utilities.`,
    },
    {
      question: `How does ${tool.name} handle my data?`,
      answer: `${tool.name} is built for browser-side workflows whenever possible. Do not paste production secrets or highly sensitive personal data into any online tool.`,
    },
    {
      question: `Can I use ${tool.name} on mobile browsers?`,
      answer: `Yes. ${tool.name} adapts to phones and tablets. Open ${tool.path} on FYN Tools with a modern browser for the best experience.`,
    },
    {
      question: `What is ${tool.name} best used for?`,
      answer: `${tool.description} Pair it with other ${tool.category} on FYN Tools when you need a full workflow.`,
    },
    {
      question: `Where can I find similar tools?`,
      answer: `Browse related ${tool.category} from the category hub${hub ? ` at ${hub}` : ''} or the full catalog at /tools.`,
    },
  ];
}

/**
 * Build unique, intent-fit SEO content for one tool.
 * Priority: Vite page overrides → curated toolSeoContent → sensible defaults.
 */
export function buildUniqueToolContent(tool: Tool): FullSeoPageContent {
  const path = tool.path;
  const override = pageOverrides[path];
  const curated = getToolSeoContent(path);
  const premium = getPremiumToolSeo(path);
  const templatedPremium = isGeneratedPremiumTemplate(premium);
  const usePremiumBody = premium && !templatedPremium;
  const feats =
    premium?.features?.length
      ? premium.features
      : override?.features?.length
        ? override.features
        : featureListFromTool(tool);

  const title = premium?.title || override?.title || `${tool.name} — Free Online Tool`;
  const h1 = premium?.h1 || override?.title || tool.name;
  const metaDescription = (() => {
    if (premium?.metaDescription) {
      const m = premium.metaDescription;
      return m.length > 160 ? `${m.slice(0, 157)}...` : m;
    }
    const base = (override?.description || tool.description).replace(/\s+/g, ' ').trim();
    let meta = base.length > 155 ? `${base.slice(0, 152)}...` : base;
    if (meta.length < 110) meta = `${meta} Free on FYN Tools — no signup.`;
    if (meta.length > 160) meta = `${meta.slice(0, 157)}...`;
    return meta;
  })();

  const introParagraphs: string[] = [];
  if (usePremiumBody && premium?.introParagraphs?.length) {
    introParagraphs.push(...premium.introParagraphs);
  } else {
    if (override?.shortIntro) introParagraphs.push(...splitIntro(override.shortIntro));
    if (override?.introText) {
      for (const p of splitIntro(override.introText)) {
        if (!introParagraphs.includes(p)) introParagraphs.push(p);
      }
    }
    if (curated?.introText) {
      for (const p of splitIntro(curated.introText)) {
        if (!introParagraphs.includes(p)) introParagraphs.push(p);
      }
    }
    if (introParagraphs.length === 0 && premium?.introParagraphs?.length) {
      for (const p of premium.introParagraphs) {
        if (!containsTemplatePhrase(p)) introParagraphs.push(p);
      }
    }
  }
  if (introParagraphs.length === 0) {
    introParagraphs.push(
      `${tool.name} helps you ${tool.description.charAt(0).toLowerCase()}${tool.description.slice(1)} Use it when you need a quick browser-based answer without installing software.`
    );
  }
  if (introParagraphs.length < 2 && !usePremiumBody) {
    introParagraphs.push(
      `${tool.name} is a free ${tool.category.toLowerCase()} utility on FYN Tools. ${tool.description} The interactive panel above handles the core task; the sections below explain inputs, outputs, and common questions.`
    );
  }
  if (usePremiumBody && premium?.deepParagraphs?.length) {
    introParagraphs.push(...premium.deepParagraphs);
  } else if (curated?.howItWorks && introParagraphs.length < 3) {
    const extra = splitIntro(curated.howItWorks)[0];
    if (extra && !introParagraphs.includes(extra)) introParagraphs.push(extra);
  }

  const overview =
    (usePremiumBody && premium?.overview) ||
    (curated?.howItWorks
      ? curated.howItWorks.split(/\n\n+/)[0]?.trim()
      : null) ||
    override?.introText?.split(/\n\n+/)[0]?.trim() ||
    `${tool.name} runs in your browser on FYN Tools. ${tool.description} Use the panel above, then review examples and FAQs before you copy or export results.`;

  const howToUse =
    (usePremiumBody && premium?.howToUse?.length
      ? premium.howToUse
      : null) ||
    (override?.howToUse?.length ? override.howToUse : null) ||
    defaultHowTo(tool, feats);

  const useCases =
    (usePremiumBody && premium?.useCases?.length
      ? premium.useCases
      : null) ||
    (override?.useCases?.length
      ? override.useCases.map((u) => ({ title: u.title, description: u.description }))
      : null) ||
    (curated?.useCases?.length
      ? curated.useCases.map((u) => ({ title: u.title, description: u.description }))
      : [
          {
            title: `${tool.category.replace(/ Tools$/, '')} workflow`,
            description: `Use ${tool.name} when ${tool.description.charAt(0).toLowerCase()}${tool.description.slice(1)}`,
          },
          {
            title: 'Quick verification before you publish',
            description: `Run ${tool.name} once to sanity-check output, then continue in your doc, design file, or app.`,
          },
        ]);

  const examples =
    (usePremiumBody && premium?.examples?.length
      ? premium.examples
      : null) ||
    (override?.examples?.length
      ? override.examples.map((e) => ({ input: e.input, output: e.output }))
      : null) ||
    (curated?.examples?.length
      ? curated.examples.map((e) => ({ input: e.input, output: e.output }))
      : buildExamplesForTool(tool));

  const rawTestimonials = buildTestimonialsForTool(tool);
  const testimonials = rawTestimonials.filter((t) => !isFakeTestimonial(t.text));

  const tips =
    (usePremiumBody && premium?.tips?.length ? [...premium.tips] : null) ||
    (override?.tips?.length ? [...override.tips] : null) ||
    (curated?.tips?.length ? [...curated.tips] : [
      `Double-check ${tool.name} output before sharing externally.`,
      `Bookmark ${tool.path} if you reuse this workflow weekly.`,
      `Pair with related ${tool.category.toLowerCase()} linked below when you need a follow-up step.`,
    ]);

  const whenToUse =
    (usePremiumBody && premium?.whenToUse?.length ? [...premium.whenToUse] : null) ||
    (override?.whenToUse?.length ? [...override.whenToUse] : null) ||
    (curated?.whenToUse?.length ? [...curated.whenToUse] : [
      `When you need ${tool.name.toLowerCase()} without installing desktop software`,
      `When a quick browser check is enough before a deeper workflow`,
    ]);

  const commonMistakes =
    (usePremiumBody && premium?.commonMistakes?.length ? premium.commonMistakes : null) ||
    (curated?.commonMistakes?.length ? curated.commonMistakes : [
      `Mismatching units or formats that ${tool.name} expects — read the field labels first.`,
      'Treating one run as final without sanity-checking edge cases.',
      'Skipping related tools when your workflow clearly needs a second step.',
    ]);

  const advantages =
    (usePremiumBody && premium?.advantages?.length ? premium.advantages : null) ||
    (curated?.advantages?.length ? curated.advantages : feats.slice(0, 5));

  const howItWorks =
    (usePremiumBody && premium?.howItWorks) ||
    curated?.howItWorks ||
    `${tool.name} reads your input from the panel above, applies ${feats[0]?.toLowerCase() || 'its core logic'}, and shows a result you can copy or download. Options stay visible so you can iterate without reloading the page.`;

  const benefits =
    (usePremiumBody && premium?.benefits?.length ? premium.benefits : null) || [
      `Finish ${tool.name.toLowerCase()} tasks in the browser without creating an account.`,
      `Keep drafts closer to your device when processing can run locally.`,
      `Get consistent output you can copy, download, or screenshot.`,
      `Continue in related ${tool.category.toLowerCase()} via internal links below.`,
    ];

  const faqs =
    (usePremiumBody && premium?.faqs?.length
      ? premium.faqs
      : null) ||
    (override?.faqs?.length && override.faqs.length >= 4
      ? override.faqs.map((f) => ({ question: f.question, answer: f.answer }))
      : (() => {
          const base = override?.faqs?.length
            ? override.faqs.map((f) => ({ question: f.question, answer: f.answer }))
            : [];
          const filler = defaultFaqs(tool);
          return [...base, ...filler].slice(0, Math.max(5, base.length));
        })());

  const related = ensureRelatedCount(
    (usePremiumBody && premium?.relatedTools?.length
      ? [...premium.relatedTools]
      : null) ||
    (override?.relatedTools?.length
      ? override.relatedTools.map((t) => ({
          name: t.name,
          href: t.href,
          description: t.description,
        }))
      : relatedToolsFallback(tool)),
    tool
  );

  const keywords = premium?.keywords?.length
    ? premium.keywords
    : override?.keywords
      ? override.keywords.split(',').map((k) => k.trim()).filter(Boolean).slice(0, 12)
      : tool.keywords
        ? tool.keywords.split(',').map((k) => k.trim()).filter(Boolean).slice(0, 8)
        : [tool.name.toLowerCase()];

  const conclusion =
    (usePremiumBody && premium?.conclusion) ||
    `${tool.name} handles the core job on this page without a mandatory account. Use the live tool above, then follow related links when your workflow continues in another FYN Tools utility.`;

  const tldr = premium?.tldr || defaultTldr(tool);
  const processingNote = premium?.processingNote || defaultProcessingNote(tool);
  const ioContract = premium?.ioContract || defaultIoContract(tool);
  const datePublished = premium?.datePublished || SEO_SHELL_DATE;
  const dateModified = premium?.dateModified || SEO_SHELL_DATE;

  return {
    title,
    metaDescription,
    h1,
    keywords,
    canonicalPath: path,
    tldr,
    processingNote,
    ioContract,
    datePublished,
    dateModified,
    introParagraphs,
    overview,
    features: feats,
    benefits,
    howToUse,
    examples,
    useCases,
    tips,
    commonMistakes,
    faqs,
    relatedTools: related,
    relatedGuides: getGuidesForTool(path),
    testimonials,
    conclusion,
    whenToUse,
    howItWorks,
    advantages,
    internalLinkInIntro: curated.internalLinkInIntro || {
      before: 'Browse more in the ',
      linkText: tool.category,
      href: getCategoryHubPath(tool.category),
      after: ' collection.',
    },
    toolComparisons: curated.toolComparisons,
    relatedSearches: curated.relatedSearches,
    ogTitle: title,
    ogDescription: metaDescription,
    twitterTitle: title,
    twitterDescription: metaDescription,
  };
}
