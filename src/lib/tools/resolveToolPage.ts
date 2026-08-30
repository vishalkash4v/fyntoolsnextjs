import { allTools, type Tool } from '@/data/toolsData';
import { getFullSeoPage } from '@/data/seo-pages';

/**
 * Look up a tool by URL slug. Dedicated routes (url-shortener, json-formatter)
 * MUST resolve here — never treat them as "reserved" or ToolStaticPage 404s.
 */
export function getToolBySlug(slug: string): Tool | undefined {
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
  const feat = tool.features?.split(',')[0]?.trim();
  return [
    {
      question: `What does ${tool.name} do?`,
      answer: `${tool.description}${feat ? ` Key capability: ${feat.toLowerCase()}.` : ''}`,
    },
    {
      question: `Is ${tool.name} free on FYN Tools?`,
      answer: `Yes. ${tool.name} (${tool.path}) is free in your browser with no mandatory account.`,
    },
    {
      question: `How does ${tool.name} handle my data?`,
      answer: `${tool.name} is designed for browser-side processing whenever possible. Do not paste production secrets or highly sensitive personal data into any online tool.`,
    },
    {
      question: `Can I use ${tool.name} on mobile?`,
      answer: `Yes. Open ${tool.path} on a modern phone or tablet browser — the layout adapts to smaller screens.`,
    },
    {
      question: `Where can I find related ${tool.category.toLowerCase()}?`,
      answer: `Use the related tools list on this page or browse the ${tool.category} category hub on FYN Tools.`,
    },
  ];
}

export function resolveToolPage(slug: string) {
  const tool = getToolBySlug(slug);
  if (!tool) return null;
  const fullSeo = getFullSeoPage(`/${slug}`);
  return {
    tool,
    fullSeo,
    howToUse: fullSeo?.howToUse?.length ? fullSeo.howToUse : getDefaultHowToUse(tool),
    features: fullSeo?.features?.length ? fullSeo.features : getDefaultFeatures(tool),
    faqs: fullSeo?.faqs?.length ? fullSeo.faqs : getDefaultFaqs(tool),
  };
}
