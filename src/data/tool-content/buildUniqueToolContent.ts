import type { Tool } from '@/data/toolsData';
import { allTools } from '@/data/toolsData';
import { getToolSeoContent } from '@/data/toolSeoContent';
import type { FullSeoPageContent } from '@/data/seo-pages/types';
import { getCategoryHubPath } from '@/utils/breadcrumbs';

function relatedTools(tool: Tool, limit = 6) {
  const same = allTools.filter((t) => t.category === tool.category && t.path !== tool.path);
  const picked = same.slice(0, limit);
  if (picked.length < limit) {
    for (const t of allTools) {
      if (t.path === tool.path || picked.some((p) => p.path === t.path)) continue;
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

function featureList(tool: Tool): string[] {
  if (tool.features) {
    return tool.features
      .split(',')
      .map((f) => f.trim())
      .filter(Boolean)
      .slice(0, 8);
  }
  return [
    'Works in your browser',
    'No account required',
    'Mobile-friendly layout',
    'Copy or download results',
  ];
}

/** Intent-aware depth: simple utilities stay short; calculators/converters get more detail. */
function depthFor(tool: Tool): 'short' | 'medium' | 'deep' {
  const cat = tool.category.toLowerCase();
  const name = tool.name.toLowerCase();
  if (
    cat.includes('finance') ||
    cat.includes('pregnancy') ||
    cat.includes('period') ||
    name.includes('calculator') ||
    name.includes('converter') ||
    name.includes('formatter')
  ) {
    return 'deep';
  }
  if (
    cat.includes('image') ||
    cat.includes('development') ||
    cat.includes('text') ||
    name.includes('generator')
  ) {
    return 'medium';
  }
  return 'short';
}

function uniqueTitle(tool: Tool): string {
  const n = tool.name;
  if (/calculator/i.test(n)) return `${n} Online — Free Instant Results`;
  if (/converter/i.test(n)) return `${n} — Convert Instantly in Your Browser`;
  if (/generator/i.test(n)) return `Free ${n} — Create Results in Seconds`;
  if (/formatter|beautifier|minifier|validator/i.test(n)) return `${n} Online — Clean & Fix Instantly`;
  if (/editor|maker|tracker|planner/i.test(n)) return `${n} — Free Browser Tool`;
  if (/test|tutor|games|competition/i.test(n)) return `${n} — Practice Online Free`;
  return `${n} — Free Online Tool`;
}

function uniqueH1(tool: Tool): string {
  const n = tool.name;
  if (/calculator/i.test(n)) return `${n}`;
  if (/generator/i.test(n)) return `Free ${n}`;
  return n;
}

function uniqueMeta(tool: Tool): string {
  const base = tool.description.replace(/\s+/g, ' ').trim();
  let meta = base.length > 140 ? `${base.slice(0, 137)}...` : base;
  if (meta.length < 110) {
    meta = `${meta} Free on FYN Tools — no signup.`;
  }
  if (meta.length > 155) meta = `${meta.slice(0, 152)}...`;
  return meta;
}

function howToSteps(tool: Tool, feats: string[]): string[] {
  const n = tool.name;
  const f0 = feats[0]?.toLowerCase() || 'your input';
  const f1 = feats[1]?.toLowerCase() || 'the options';
  if (/image|photo|svg|pdf|qr|barcode|pixel|blur|flip|merge|split|crop|compress|resizer/i.test(n + tool.category)) {
    return [
      `Open ${n} and upload or select your file (or paste content if the tool accepts text).`,
      `Adjust ${f0} and review the live preview before you commit.`,
      `Tune ${f1} until the result matches what you need.`,
      `Download or copy the output, then close the tab — nothing requires an account.`,
    ];
  }
  if (/calculator|emi|sip|gst|tax|bmi|age|percentage|ppf|fd/i.test(n)) {
    return [
      `Enter the values ${n} asks for (amounts, rates, dates, or measurements).`,
      `Confirm units and any optional fields that affect the formula.`,
      `Read the result and breakdown shown on the page.`,
      `Change inputs to compare scenarios — recalculation is instant.`,
    ];
  }
  if (/formatter|validator|minifier|encoder|decoder|regex|json|html|css|jwt|hash/i.test(n)) {
    return [
      `Paste your content into ${n}.`,
      `Choose formatting or validation options if shown.`,
      `Run the tool and inspect the output or error messages.`,
      `Copy the cleaned result back into your project or docs.`,
    ];
  }
  return [
    `Open ${n} on this page.`,
    `Provide the input the tool expects and set ${f0}.`,
    `Review the result; adjust ${f1} if needed.`,
    `Copy, download, or save the output for your workflow.`,
  ];
}

function buildFaqs(tool: Tool, feats: string[]): { question: string; answer: string }[] {
  const n = tool.name;
  const f0 = feats[0] || 'core features';
  const faqs = [
    {
      question: `Is ${n} free to use?`,
      answer: `Yes. ${n} on FYN Tools is free for normal interactive use — no mandatory account or paid unlock to get started.`,
    },
    {
      question: `Does ${n} upload my data to a server?`,
      answer: `Whenever the tool can run locally, processing stays in your browser. Avoid pasting secrets (passwords, private keys, medical IDs) into any public web tool if policy forbids it.`,
    },
    {
      question: `What makes ${n} useful?`,
      answer: `${tool.description} Highlights include ${f0.toLowerCase()}${feats[1] ? ` and ${feats[1].toLowerCase()}` : ''}.`,
    },
    {
      question: `Can I use ${n} on my phone?`,
      answer: `Yes. The layout adapts to mobile browsers so you can run ${n} without installing an app.`,
    },
  ];

  // Tool-specific fifth FAQ when deep
  if (/password/i.test(n)) {
    faqs.push({
      question: 'How long should a generated password be?',
      answer:
        'For most accounts, 16+ characters with mixed character types is a solid baseline. Prefer a password manager to store unique passwords per site.',
    });
  } else if (/word counter/i.test(n)) {
    faqs.push({
      question: 'Does the word counter count characters with spaces?',
      answer:
        'Yes — you get word count, character counts (with and without spaces), and related stats so you can match form limits and SEO briefs.',
    });
  } else if (/json/i.test(n)) {
    faqs.push({
      question: 'What if my JSON is invalid?',
      answer:
        'The tool surfaces parse errors so you can fix commas, quotes, or brackets. Paste again after correcting the highlighted issue.',
    });
  } else if (/bmi/i.test(n)) {
    faqs.push({
      question: 'Is BMI a diagnosis?',
      answer:
        'No. BMI is a screening metric. Interpret results with a clinician, especially if you are an athlete, pregnant, or have other health conditions.',
    });
  } else if (/image/i.test(tool.category)) {
    faqs.push({
      question: `What file types does ${n} accept?`,
      answer: `Most image tools here accept common web formats such as JPG, PNG, and WebP. Check on-page controls for any format-specific limits.`,
    });
  } else {
    faqs.push({
      question: `Where can I find tools related to ${n}?`,
      answer: `Browse the ${tool.category} hub and the related links on this page for adjacent workflows.`,
    });
  }

  return faqs;
}

/**
 * Build unique, intent-fit SEO content for one tool.
 * Prefers curated toolSeoContent fields; never uses the old longFormGenerator filler.
 */
export function buildUniqueToolContent(tool: Tool): FullSeoPageContent {
  const path = tool.path;
  const feats = featureList(tool);
  const depth = depthFor(tool);
  const curated = getToolSeoContent(path);

  const title = uniqueTitle(tool);
  const h1 = uniqueH1(tool);
  const metaDescription = uniqueMeta(tool);

  const introParagraphs: string[] = [];
  if (curated.introText) {
    introParagraphs.push(curated.introText);
  } else {
    introParagraphs.push(
      `${tool.name} helps you ${tool.description.charAt(0).toLowerCase()}${tool.description.slice(1)} Use it when you need a quick browser-based answer without installing software.`
    );
  }

  if (depth !== 'short') {
    introParagraphs.push(
      `This page focuses on what ${tool.name} actually does in the ${tool.category} group: ${feats.slice(0, 3).join(', ').toLowerCase()}. Related tools are linked below when you need an adjacent step.`
    );
  }

  const overview =
    depth === 'deep'
      ? `${tool.name} is built for repeatable, transparent results. Enter values or files, adjust options tied to ${feats[0]?.toLowerCase() || 'your settings'}, and read the output before you export. If you are comparing approaches, change one input at a time so you can see how each factor moves the result.`
      : '';

  const howToUse =
    curated.whenToUse?.length && curated.introText
      ? howToSteps(tool, feats)
      : howToSteps(tool, feats);

  const useCases =
    curated.useCases?.length >= 2
      ? curated.useCases.map((u) => ({ title: u.title, description: u.description }))
      : depth === 'short'
        ? []
        : [
            {
              title: `Everyday ${tool.category.replace(/ Tools$/, '').toLowerCase()} work`,
              description: `Reach for ${tool.name} when ${tool.description.charAt(0).toLowerCase()}${tool.description.slice(1)}`,
            },
            {
              title: 'Quick checks before you publish or submit',
              description: `Run ${tool.name} once, verify the output, then continue in your docs, design file, or application form.`,
            },
          ];

  const examples =
    curated.examples?.length
      ? curated.examples.map((e) => ({ input: e.input, output: e.output }))
      : [];

  const tips =
    curated.tips?.length
      ? curated.tips
      : depth === 'short'
        ? [`Bookmark ${tool.path} if you reuse ${tool.name} often.`, 'Double-check outputs before sharing externally.']
        : [
            `Keep inputs realistic — ${tool.name} cannot fix bad source data.`,
            `Use related ${tool.category.toLowerCase()} when your workflow needs a second step.`,
            'On mobile, rotate to landscape if controls feel tight.',
          ];

  const whenToUse =
    curated.whenToUse?.length
      ? curated.whenToUse
      : [
          `When you need ${tool.name.toLowerCase()} without installing desktop software`,
          `When a quick browser pass is enough before a deeper workflow`,
        ];

  const commonMistakes =
    curated.commonMistakes?.length
      ? curated.commonMistakes
      : depth === 'deep'
        ? [
            `Ignoring units or formats ${tool.name} expects — always match the labels on the form.`,
            'Treating a single run as final without sanity-checking edge cases.',
          ]
        : [];

  const advantages =
    curated.advantages?.length
      ? curated.advantages
      : feats.slice(0, 4);

  const howItWorks =
    curated.howItWorks ||
    (depth === 'deep'
      ? `${tool.name} takes your input through the panel above, applies the logic behind ${feats[0]?.toLowerCase() || 'its main feature'}, and returns a result you can copy or download. Options stay visible so you can iterate without starting over.`
      : '');

  const benefits =
    depth === 'short'
      ? []
      : [
          `Save time versus hunting through multiple apps for a one-off ${tool.name.toLowerCase()} task.`,
          `Keep sensitive drafts closer to your device when the tool can run locally.`,
        ];

  const conclusion =
    depth === 'short'
      ? `${tool.name} is ready above — run it, grab the result, and move on. Explore related ${tool.category.toLowerCase()} if you need a follow-up step.`
      : `${tool.name} covers the core job described here without forcing an account wall. Use the live tool above, then follow internal links when your workflow continues into another FYN Tools utility.`;

  const keywords = tool.keywords
    ? tool.keywords.split(',').map((k) => k.trim()).filter(Boolean).slice(0, 8)
    : [tool.name.toLowerCase()];

  return {
    title,
    metaDescription,
    h1,
    keywords,
    canonicalPath: path,
    introParagraphs,
    overview,
    features: feats,
    benefits,
    howToUse,
    examples,
    useCases,
    tips,
    commonMistakes,
    faqs: buildFaqs(tool, feats),
    relatedTools: relatedTools(tool),
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
    ogTitle: title,
    ogDescription: metaDescription,
    twitterTitle: title,
    twitterDescription: metaDescription,
  };
}
