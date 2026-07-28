/**
 * Deterministic unique long-form SEO content generator for tool pages.
 * Every path produces different copy by weaving tool name, features, keywords,
 * and category-specific scenarios into large section templates.
 */

import { allTools, type Tool } from '@/data/toolsData';
import type { FullSeoPageContent } from './types';

const BASE = 'https://fyntools.com';

function hash(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h);
}

function pick<T>(arr: T[], seed: number, offset = 0): T {
  return arr[(seed + offset) % arr.length];
}

function lcf(s: string): string {
  if (!s) return s;
  return s.charAt(0).toLowerCase() + s.slice(1);
}

function parseList(s?: string): string[] {
  return (s || '')
    .split(',')
    .map((x) => x.trim())
    .filter(Boolean);
}

function relatedInCategory(tool: Tool, limit = 8): Tool[] {
  return allTools
    .filter((t) => t.category === tool.category && t.path !== tool.path)
    .slice(0, limit);
}

function categoryAudience(category: string, seed: number): string {
  const map: Record<string, string[]> = {
    'Image Tools': [
      'designers preparing assets for the web',
      'marketers optimizing visuals for campaigns',
      'photographers cleaning up exports',
      'students submitting visual coursework',
    ],
    'Text & Writing Tools': [
      'writers polishing drafts',
      'SEO specialists refining copy',
      'developers normalizing strings',
      'students editing assignments',
    ],
    'Development Tools': [
      'frontend engineers debugging payloads',
      'backend developers validating configs',
      'students learning web development',
      'QA engineers checking edge cases',
    ],
    'Number Tools': [
      'analysts running quick math checks',
      'students solving homework problems',
      'finance teams verifying figures',
      'shoppers comparing deals',
    ],
    'Finance Tools': [
      'borrowers comparing loan options',
      'investors modeling returns',
      'small-business owners planning cash flow',
      'students learning personal finance',
    ],
    'Period & Cycle Tools': [
      'people tracking cycle patterns',
      'users planning around fertile windows',
      'individuals logging symptoms for clarity',
      'anyone seeking private at-home estimates',
    ],
    'Pregnancy Tools': [
      'expecting parents planning milestones',
      'families estimating due dates',
      'users tracking pregnancy weeks',
      'caregivers organizing prenatal checklists',
    ],
    'Typing Tools': [
      'job seekers preparing for typing tests',
      'students improving keyboard speed',
      'writers building accuracy',
      'gamers practicing competitive typing',
    ],
    'Converter Tools': [
      'engineers converting measurements',
      'travelers switching units',
      'students checking homework conversions',
      'developers mapping timestamp formats',
    ],
    'Network Tools': [
      'IT admins investigating IPs',
      'developers debugging geo lookups',
      'security analysts reviewing origins',
      'curious users checking their connection',
    ],
    'Video & Social Media Tools': [
      'creators preparing social posts',
      'community managers formatting content',
      'marketers planning campaigns',
      'influencers optimizing captions',
    ],
    'Utility Tools': [
      'everyday users solving quick tasks',
      'office teams automating busywork',
      'students organizing routines',
      'anyone needing a browser-based helper',
    ],
    'Timer Tools': [
      'professionals timing focused work blocks',
      'athletes tracking intervals',
      'cooks watching kitchen timers',
      'students managing study sessions',
    ],
    'Business Tools': [
      'founders drafting proposals',
      'freelancers invoicing clients',
      'teams brainstorming product ideas',
      'operators documenting workflows',
    ],
  };
  const pool = map[category] || [
    'professionals who need a reliable browser tool',
    'students looking for a free online helper',
    'teams that prefer privacy-first utilities',
    'anyone who wants results without installing software',
  ];
  return pick(pool, seed);
}

export function buildLongFormSeo(path: string): FullSeoPageContent | null {
  const tool = allTools.find((t) => t.path === path);
  if (!tool) return null;

  const seed = hash(path);
  const name = tool.name;
  const feats = parseList(tool.features);
  const kws = parseList(tool.keywords);
  const desc = tool.description.replace(/\s+/g, ' ').trim();
  const cat = tool.category;
  const audience = categoryAudience(cat, seed);
  const related = relatedInCategory(tool, 10);
  const f0 = feats[0] || 'core processing';
  const f1 = feats[1] || 'instant preview';
  const f2 = feats[2] || 'copy-ready output';
  const f3 = feats[3] || 'browser-side privacy';
  const kw0 = kws[0] || name.toLowerCase();
  const kw1 = kws[1] || `${name.toLowerCase()} online`;
  const kw2 = kws[2] || `free ${name.toLowerCase()}`;

  const titleVariants = [
    `${name} – Free Online ${cat.replace(/ Tools$/, '')} Tool`,
    `Free ${name} Online | Fast & Private ${cat}`,
    `${name}: Instant Browser Tool for ${audience.split(' ')[0]}`,
    `${name} Online – No Signup, No Upload Servers`,
  ];
  const title = pick(titleVariants, seed);

  const metaVariants = [
    `Use ${name} free online. ${desc.slice(0, 90)} Runs in your browser with ${lcf(f0)} and ${lcf(f1)}.`,
    `${name} helps ${audience}. Enjoy ${lcf(f0)}, ${lcf(f1)}, and private local processing on FYNTools.`,
    `Try ${name} on FYNTools — ${kw0}, ${kw1}. Fast results with ${lcf(f2)} and zero installation.`,
  ];
  let metaDescription = pick(metaVariants, seed);
  if (metaDescription.length > 160) metaDescription = metaDescription.slice(0, 157) + '...';
  if (metaDescription.length < 120) {
    metaDescription = `${metaDescription} Free forever on fyntools.com.`.slice(0, 160);
  }

  const h1 = pick(
    [
      `Free Online ${name}`,
      `${name} – Instant Results in Your Browser`,
      `${name}: Professional ${cat} Utility`,
    ],
    seed
  );

  const introParagraphs = [
    pick(
      [
        `${name} is a free online utility in the ${cat} collection on FYNTools, built for ${audience}. ${desc} Unlike desktop software that requires installs and updates, ${name} opens instantly in a modern browser and focuses on ${lcf(f0)} so you can finish the task in minutes.`,
        `Looking for a reliable ${kw0}? ${name} delivers ${desc.toLowerCase()} with an emphasis on ${lcf(f1)} and ${lcf(f2)}. The experience is designed for ${audience}, with clear controls and results you can trust for everyday work.`,
        `${name} sits inside FYNTools Worldwide as a privacy-minded ${cat.toLowerCase()} option. It combines ${lcf(f0)} with ${lcf(f3)} so your inputs stay on-device whenever possible while you work through ${kw1} workflows.`,
      ],
      seed
    ),
    pick(
      [
        `People searching for ${kw2} often bounce between cluttered sites with ads and forced sign-ups. ${name} keeps the interface focused: enter your input, adjust options related to ${lcf(f0)}, review the preview, then copy or download. That short loop is intentional — less friction means higher accuracy and fewer mistakes.`,
        `Whether you arrived via ${kw0} or ${kw1}, the goal is the same: produce dependable output without sending sensitive content to unknown servers. ${name} leans on client-side processing for ${lcf(f1)} so iterations feel immediate, which is especially useful for ${audience}.`,
        `From first open to final export, ${name} prioritizes clarity. Labels explain ${lcf(f2)}, helper text clarifies edge cases, and related FYNTools suggestions appear when you need an adjacent capability in ${cat}.`,
      ],
      seed,
      1
    ),
    pick(
      [
        `This page explains how ${name} works, who should use it, realistic examples, professional tips, and common mistakes to avoid. Use the interactive tool above for hands-on results, then skim the sections below when you want deeper guidance around ${kw0} and ${cat.toLowerCase()} best practices.`,
        `Below you will find a full overview of ${name}, feature details such as ${lcf(f0)} and ${lcf(f1)}, step-by-step instructions, FAQs, and internal links to related utilities. The content is unique to ${name} so search engines and humans alike can understand exactly what this tool solves.`,
        `If you are comparing options for ${kw1}, start with the live tool, then read the use cases and mistakes sections. They are written specifically for ${name} on FYNTools — not generic filler reused across unrelated pages.`,
      ],
      seed,
      2
    ),
  ];

  const overview = [
    `${name} exists to remove friction from a specific job inside ${cat}. At a high level, you provide input, configure options tied to ${lcf(f0)} and ${lcf(f1)}, and receive output shaped by ${lcf(f2)}. Because processing is optimized for the browser, you can refresh settings and re-run ${name} as many times as needed without waiting on a remote queue.`,
    `Teams choose ${name} when they need a consistent, shareable workflow for ${kw0}. A designer can bookmark the URL, a student can reopen it on a lab PC, and a developer can keep it beside documentation. The same ${lcf(f3)} guarantees apply across devices: your session stays local whenever the architecture allows.`,
    `Compared with installing niche software for a one-off task, ${name} reduces setup cost to zero. Compared with opaque “free” tools that monetize uploads, it reduces privacy risk. That combination — speed, clarity, and local-first design — is why ${name} belongs in the FYNTools ${cat} lineup alongside companions such as ${related[0]?.name || 'related utilities'}.`,
  ].join('\n\n');

  const featureBullets =
    feats.length >= 4
      ? feats.slice(0, 8).map((f, i) =>
          pick(
            [
              `${f} — available directly inside ${name} without extra plugins.`,
              `${name} includes ${lcf(f)} so you can refine results without leaving the page.`,
              `${f} helps ${audience} complete ${kw0} tasks faster.`,
            ],
            seed,
            i
          )
        )
      : [
          `${f0} tuned for everyday ${kw0} workflows in ${name}.`,
          `${f1} so you can verify output before copying from ${name}.`,
          `${f2} for sharing results with teammates or pasting into other apps.`,
          `${f3} with browser-side processing on FYNTools.`,
          `Responsive layout so ${name} works on phones, tablets, and desktops.`,
          `Zero account requirement — open ${name} and start immediately.`,
          `Clear error messaging when inputs for ${name} are incomplete.`,
          `Quick access to related ${cat} tools from the same page.`,
        ];

  const benefits = [
    pick(
      [
        `Speed without installs: ${name} loads as a web page, so ${audience} can finish ${kw0} work during a short break instead of waiting on software setup.`,
        `Fewer context switches: keep ${name} open beside your editor or spreadsheet and reuse ${lcf(f1)} until the output matches your standard.`,
      ],
      seed
    ),
    pick(
      [
        `Privacy by default: ${name} emphasizes ${lcf(f3)} so drafts, images, or numbers are not casually uploaded to a black-box API.`,
        `Predictable UX: controls for ${lcf(f0)} stay visible, which reduces the “where did that setting go?” problem common on ad-heavy tool sites.`,
      ],
      seed,
      1
    ),
    pick(
      [
        `Better collaboration: share the FYNTools URL for ${name} so teammates reproduce the same ${kw1} steps without mailing installers.`,
        `Learning-friendly: students exploring ${cat.toLowerCase()} can experiment with ${name} safely while reading the examples and FAQs on this page.`,
      ],
      seed,
      2
    ),
    pick(
      [
        `Cost control: ${name} is free on FYNTools, which matters when you only need occasional ${kw2} access.`,
        `Ecosystem fit: after ${name}, jump to related tools in ${cat} without leaving the site, keeping momentum on larger projects.`,
      ],
      seed,
      3
    ),
    `Quality focus: documentation on this page is written for ${name} specifically — including tips about ${lcf(f0)} — so you are not reading recycled blurbs from unrelated utilities.`,
    `Accessibility of access: any modern browser that can reach fyntools.com can open ${name}, which helps distributed teams and classrooms.`,
  ];

  const howToUse = [
    `Open ${name} on FYNTools at ${BASE}${path} using Chrome, Edge, Firefox, or Safari.`,
    `Review the on-page controls related to ${lcf(f0)} and ${lcf(f1)} before submitting real data.`,
    `Provide the input ${name} expects — text, numbers, files, or selections depending on the tool UI above.`,
    `Adjust options that influence ${lcf(f2)}; small changes often improve accuracy for ${kw0} tasks.`,
    `Run or update the result preview inside ${name} and confirm the output matches your intent.`,
    `Copy, download, or export the result, then optionally continue with a related ${cat} tool if your workflow needs another step.`,
    `Bookmark ${name} if you repeat this job weekly so you skip search and land directly on the working interface.`,
  ];

  const examples: FullSeoPageContent['examples'] = [
    {
      input: pick(
        [
          `Sample input prepared for ${name} focusing on ${kw0}.`,
          `Typical ${cat} dataset used to demonstrate ${name}.`,
          `User-provided content requiring ${lcf(f0)} via ${name}.`,
        ],
        seed
      ),
      output: pick(
        [
          `Clean result from ${name} after applying ${lcf(f1)} and ${lcf(f2)}.`,
          `Ready-to-use output generated by ${name} for a ${kw1} scenario.`,
          `Verified ${name} output suitable for pasting into the next workflow step.`,
        ],
        seed
      ),
    },
    {
      input: `Edge-case attempt in ${name}: incomplete settings around ${lcf(f0)}.`,
      output: `${name} surfaces guidance so you correct options before trusting the final export.`,
    },
    {
      input: `Batch-style retry: same source material run through ${name} twice with different ${lcf(f1)} choices.`,
      output: `Side-by-side comparison shows which ${name} configuration better fits ${audience}.`,
    },
  ];

  const useCaseSeeds = [
    ['Daily productivity', `${audience} open ${name} during routine work to handle ${kw0} without leaving the browser.`],
    ['Quality assurance', `Before publishing, teams run assets or text through ${name} to confirm ${lcf(f2)} meets checklist standards.`],
    ['Education', `Instructors demonstrate ${name} live so students understand ${cat.toLowerCase()} concepts with real ${kw1} examples.`],
    ['Client delivery', `Freelancers use ${name} to polish deliverables quickly, then share the FYNTools link if clients want to reproduce a step.`],
    ['Privacy-sensitive work', `When data should not travel to unknown APIs, ${name} provides a local-first path for ${kw2}.`],
    ['Cross-device continuity', `Start on desktop, continue on mobile — ${name} remains available wherever you have a browser session.`],
    ['Pre-automation checks', `Developers prototype logic with ${name} before writing scripts that mimic ${lcf(f0)}.`],
    ['Accessibility of tooling', `Organizations standardize on ${name} so every teammate has the same free ${cat} capability.`],
  ];

  const useCases = useCaseSeeds.map(([title, description], i) => ({
    title: `${title} with ${name}`,
    description: pick([description, `${description} Features like ${lcf(feats[i % Math.max(feats.length, 1)] || f0)} make the flow practical.`], seed, i),
  }));

  const tips = [
    `Start with a small sample in ${name} before processing large inputs so you confirm ${lcf(f0)} behaves as expected.`,
    `Keep a note of preferred settings for ${name}; consistency beats reinventing ${lcf(f1)} each session.`,
    `Pair ${name} with ${related[0]?.name || 'another FYNTools utility'} when your workflow needs a follow-up step in ${cat}.`,
    `If results look off, re-check input encoding/format — most ${name} issues trace to mismatched source data, not the UI.`,
    `Use the examples on this page as templates, then adapt them to your ${kw0} scenario inside ${name}.`,
    `On shared computers, finish and clear sensitive inputs after using ${name} even though processing is local-first.`,
    `When comparing tools, evaluate ${name} on accuracy for your niche — not only on flashy extras you will never click.`,
    `Bookmark both ${name} and its category hub so you can discover sibling tools later without hunting search results.`,
  ];

  const commonMistakes = [
    `Skipping the preview in ${name} and copying blindly — always verify ${lcf(f2)} first.`,
    `Ignoring ${lcf(f0)} options that dramatically change ${name} output quality.`,
    `Uploading confidential material to random third-party clones instead of using ${name} on FYNTools.`,
    `Assuming ${name} replaces professional advice in regulated domains — it accelerates tasks, it does not certify compliance.`,
    `Using outdated bookmarks that point to alias URLs; prefer the canonical path ${path} for ${name}.`,
    `Forgetting mobile layout differences — test critical ${name} flows on the device you actually ship from.`,
  ];

  const faqs = [
    {
      question: `Is ${name} free to use on FYNTools?`,
      answer: `Yes. ${name} is free for regular use with no mandatory account. You can open ${BASE}${path} and start immediately.`,
    },
    {
      question: `Does ${name} upload my data to a server?`,
      answer: `${name} is designed around browser-side processing whenever possible (${lcf(f3)}). Avoid pasting secrets into any online tool if your policy forbids it, and review the on-page notices for this specific utility.`,
    },
    {
      question: `What makes ${name} different from other ${kw0} sites?`,
      answer: `${name} focuses on clear controls for ${lcf(f0)} and ${lcf(f1)}, ships with unique documentation on this page, and connects you to related ${cat} tools instead of trapping you behind sign-up walls.`,
    },
    {
      question: `Can I use ${name} on mobile?`,
      answer: `Yes. The ${name} interface adapts to smaller screens so ${audience} can complete light ${kw1} tasks away from a desk.`,
    },
    {
      question: `How accurate is ${name}?`,
      answer: `Accuracy depends on input quality and settings such as ${lcf(f0)}. Use the examples above, then validate critical outputs with a second method when decisions are high-stakes.`,
    },
    {
      question: `Are there usage limits on ${name}?`,
      answer: `FYNTools does not impose artificial daily caps on ${name} for normal interactive use. Extremely large inputs may be limited by your device memory or browser capabilities.`,
    },
    {
      question: `Which related tools should I try after ${name}?`,
      answer:
        related.length > 0
          ? `After ${name}, many users continue with ${related
              .slice(0, 3)
              .map((t) => t.name)
              .join(', ')} in the same ${cat} category.`
          : `Browse the ${cat} section on FYNTools for companions to ${name}.`,
    },
    {
      question: `How do I report a problem with ${name}?`,
      answer: `Contact FYNTools via the Contact page and mention ${name} (${path}) plus the browser you used. Clear reproduction steps help us improve ${lcf(f1)} quickly.`,
    },
  ];

  const relatedTools = related.slice(0, 8).map((t) => ({
    name: t.name,
    href: t.path,
    description: t.description.slice(0, 120),
  }));

  // Ensure at least 10 internal link targets via padding with popular tools if needed
  if (relatedTools.length < 10) {
    const extras = allTools
      .filter((t) => t.path !== path && !relatedTools.some((r) => r.href === t.path))
      .slice(0, 10 - relatedTools.length);
    for (const t of extras) {
      relatedTools.push({ name: t.name, href: t.path, description: t.description.slice(0, 100) });
    }
  }

  const whenToUse = [
    `When you need ${kw0} done quickly without installing software`,
    `When ${audience} require ${lcf(f1)} before exporting`,
    `When privacy expectations favor ${lcf(f3)} inside ${name}`,
    `When collaborating via a shareable FYNTools URL for ${name}`,
    `When learning ${cat.toLowerCase()} concepts with a live ${name} demo`,
    `When replacing a paid single-purpose app you rarely open`,
  ];

  const howItWorks = [
    `${name} accepts your input through the interactive panel at the top of this page. Behind the UI, logic associated with ${lcf(f0)} transforms that input while ${lcf(f1)} keeps feedback visible.`,
    `As you tweak options, ${name} recomputes results with an emphasis on ${lcf(f2)}. Because the heavy lifting targets the browser when feasible, iteration stays snappy for ${audience}.`,
    `When you are satisfied, export or copy the outcome and optionally continue into related ${cat} tools. That end-to-end path — input, refine, export, next tool — is the operating model for ${name} on FYNTools.`,
  ].join('\n\n');

  const advantages = featureBullets.slice(0, 4);

  const professionalGuide = [
    `Professional tip for ${name}: document the exact ${lcf(f0)} settings that match your house style. When multiple people use ${name}, a short internal checklist prevents drift and keeps ${kw0} output consistent across projects.`,
    `Another practice that scales: save representative before/after samples from ${name} in your team wiki. New hires learn faster when they can see how ${lcf(f1)} and ${lcf(f2)} change real ${cat.toLowerCase()} examples instead of reading abstract specs.`,
    `For regulated or client-facing work, treat ${name} as an accelerator, not the final authority. Run ${name} to draft or transform, then apply your normal review gates. That mindset keeps speed gains from ${name} without sacrificing quality standards.`,
  ].join('\n\n');

  const deeperContext = [
    `Search demand around ${kw0}, ${kw1}, and ${kw2} continues because people want dependable utilities without friction. ${name} answers that demand inside FYNTools by pairing a working UI with long-form guidance unique to this path (${path}).`,
    `If you previously bounced from thin pages that only repeated the tool name, this ${name} guide is intentionally denser: overview, features, benefits, how-to, examples, use cases, tips, mistakes, FAQs, and a conclusion — all referencing ${name}, ${cat}, and capabilities like ${lcf(f0)}.`,
    `Internal links on this page connect ${name} to sibling utilities so crawlers and humans can discover topical clusters. That architecture supports stronger indexing than orphan pages that never receive contextual links from hubs and related tools.`,
  ].join('\n\n');

  const conclusion = [
    `${name} gives ${audience} a focused way to handle ${kw0} with transparent controls for ${lcf(f0)}, ${lcf(f1)}, and ${lcf(f2)}. Combined with FYNTools category hubs and related utilities, it supports both quick one-offs and repeatable team workflows.`,
    professionalGuide,
    deeperContext,
    `If this page helped you, try the live ${name} tool above, explore sibling options in ${cat}, and bookmark the canonical URL ${BASE}${path}. Free, private-leaning, and documentation-backed — that is the standard we aim for on every FYNTools page, including ${name}.`,
  ].join('\n\n');

  const primaryRelated = related[0];
  const internalLinkInIntro = primaryRelated
    ? {
        before: `While you are here, you may also like our `,
        linkText: primaryRelated.name,
        href: primaryRelated.path,
        after: ` for a closely related ${cat.toLowerCase()} task.`,
      }
    : {
        before: `Browse more free utilities in our `,
        linkText: 'tools directory',
        href: '/tools',
        after: `.`,
      };

  return {
    title,
    metaDescription,
    h1,
    keywords: [kw0, kw1, kw2, name, cat, 'fyntools', 'free online tool', ...kws].slice(0, 12),
    canonicalPath: path,
    introParagraphs,
    overview,
    features: featureBullets,
    benefits,
    howToUse,
    examples,
    useCases,
    tips,
    commonMistakes,
    faqs,
    relatedTools,
    conclusion,
    whenToUse,
    howItWorks,
    advantages,
    internalLinkInIntro,
    ogTitle: title,
    ogDescription: metaDescription,
    twitterTitle: title,
    twitterDescription: metaDescription,
  };
}

export function countWords(content: FullSeoPageContent): number {
  const parts = [
    content.title,
    content.metaDescription,
    content.h1,
    ...content.introParagraphs,
    content.overview,
    ...content.features,
    ...content.benefits,
    ...content.howToUse,
    ...content.examples.flatMap((e) => [e.input, e.output]),
    ...content.useCases.map((u) => `${u.title} ${u.description}`),
    ...content.tips,
    ...content.commonMistakes,
    ...content.faqs.map((f) => `${f.question} ${f.answer}`),
    content.conclusion,
    ...content.whenToUse,
    content.howItWorks,
    ...content.advantages,
  ];
  return parts.join(' ').split(/\s+/).filter(Boolean).length;
}
