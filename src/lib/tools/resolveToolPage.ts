import { allTools, type Tool } from '@/data/toolsData';
import { getFullSeoPage } from '@/data/seo-pages';
import { isKnownToolSlug } from '@/lib/tools/tool-slugs.generated';
import { isReservedSlug } from '@/lib/tools/reserved';

export function getToolBySlug(slug: string): Tool | undefined {
  if (isReservedSlug(slug)) return undefined;
  return allTools.find((t) => t.path === `/${slug}` || t.id === slug);
}

export function getDefaultHowToUse(tool: Tool): string[] {
  return [
    `Open ${tool.name} on FYNTools at ${tool.path}.`,
    `Review the on-screen controls and enter your input.`,
    `Adjust options if available, then run or update the result.`,
    `Copy, download, or export the output for your workflow.`,
    `Bookmark this page if you use ${tool.name} regularly.`,
  ];
}

export function getDefaultFeatures(tool: Tool): string[] {
  if (tool.features) {
    return tool.features.split(',').map((f) => f.trim()).filter(Boolean).slice(0, 10);
  }
  return [
    'Free to use in your browser',
    'No registration required',
    'Fast results',
    'Works on mobile and desktop',
    'Privacy-minded processing when possible',
  ];
}

export function getDefaultFaqs(tool: Tool): { question: string; answer: string }[] {
  return [
    {
      question: `Is ${tool.name} free?`,
      answer: `Yes. ${tool.name} is free to use on FYNTools with no mandatory account.`,
    },
    {
      question: `Does ${tool.name} store my data?`,
      answer: `Processing is designed to stay in your browser whenever possible. Avoid pasting highly sensitive secrets into any online tool.`,
    },
    {
      question: `Can I use ${tool.name} on mobile?`,
      answer: `Yes. The interface adapts to phones and tablets with a modern browser.`,
    },
    {
      question: `Are there usage limits?`,
      answer: `There are no artificial daily caps for normal interactive use. Very large inputs may be limited by your device.`,
    },
    {
      question: `Where can I find related tools?`,
      answer: `Browse the ${tool.category} hub and related tools linked on this page.`,
    },
  ];
}

export function resolveToolPage(slug: string) {
  const tool = getToolBySlug(slug);
  if (!tool) return null;
  // Prefer known registry slug; still allow toolsData-only entries for SEO shells.
  if (!isKnownToolSlug(slug) && !tool) return null;
  const fullSeo = getFullSeoPage(`/${slug}`);
  return {
    tool,
    fullSeo,
    howToUse: fullSeo?.howToUse?.length ? fullSeo.howToUse : getDefaultHowToUse(tool),
    features: fullSeo?.features?.length ? fullSeo.features : getDefaultFeatures(tool),
    faqs: fullSeo?.faqs?.length ? fullSeo.faqs : getDefaultFaqs(tool),
  };
}
