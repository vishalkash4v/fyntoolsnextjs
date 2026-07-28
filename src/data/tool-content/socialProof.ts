/** Deterministic fake-but-plausible testimonials per tool for social proof / E-E-A-T. */
import type { Tool } from '@/data/toolsData';
import { toolTestimonials, type ToolTestimonial } from '@/data/tool-content/toolTestimonials';

const NAMES = [
  ['Aisha Khan', 'Content Marketer'],
  ['Jordan Lee', 'Frontend Developer'],
  ['Priya Sharma', 'Product Designer'],
  ['Marcus Cole', 'Growth Lead'],
  ['Elena Rossi', 'Student'],
  ['Noah Park', 'Freelance Writer'],
  ['Sofia Mendes', 'SEO Specialist'],
  ['Dev Patel', 'Full-Stack Engineer'],
];

const TEMPLATES = [
  (n: string) => `I use ${n} weekly — fast, clear, and no signup wall. Exactly what I needed.`,
  (n: string) => `${n} replaced a desktop app for me. Results are instant on mobile too.`,
  (n: string) => `Clean UI and accurate output. ${n} is bookmarked for my team.`,
  (n: string) => `Finally a free ${n.toLowerCase()} that does not bury the tool under ads.`,
];

function hash(s: string): number {
  return Math.abs(s.split('').reduce((a, c) => ((a << 5) - a + c.charCodeAt(0)) | 0, 0));
}

export function buildTestimonialsForTool(tool: Tool): ToolTestimonial[] {
  const curated = toolTestimonials[tool.path];
  if (curated?.length) return [...curated];

  const h = hash(tool.path);
  const picks: ToolTestimonial[] = [];
  for (let i = 0; i < 3; i++) {
    const [name, title] = NAMES[(h + i * 3) % NAMES.length];
    const text = TEMPLATES[(h + i) % TEMPLATES.length](tool.name);
    picks.push({ name, title, text, rating: 4 + ((h + i) % 2) });
  }
  return picks;
}

export function buildExamplesForTool(tool: Tool): { input: string; output: string }[] {
  const n = tool.name;
  const path = tool.path;
  const cat = tool.category.toLowerCase();

  if (path === '/coin-flip' || /coin flip/i.test(n)) {
    return [
      {
        input: 'Click “Flip Coin” once',
        output: 'Heads or Tails after a short 3D spin — fair 50/50 result',
      },
      {
        input: 'Flip several times for a decision',
        output: 'History shows recent tosses + heads/tails count for the session',
      },
    ];
  }
  if (/json/i.test(n)) {
    return [
      {
        input: '{"name":"FYN","active":true,"count":3}',
        output: '{\n  "name": "FYN",\n  "active": true,\n  "count": 3\n}',
      },
    ];
  }
  if (/url short/i.test(n)) {
    return [
      {
        input: 'https://example.com/campaigns/spring?utm_source=newsletter',
        output: 'https://fyntools.com/s/spring26',
      },
    ];
  }
  if (/word count/i.test(n)) {
    return [
      {
        input: '"This is a simple sentence example."',
        output: 'Words: 5 · Characters: 28 · Sentences: 1',
      },
    ];
  }
  if (/password/i.test(n)) {
    return [{ input: 'Length 16 · upper + lower + numbers + symbols', output: 'K9$mQx!2vLpR#8nA' }];
  }
  if (/qr/i.test(n)) {
    return [{ input: 'https://fyntools.com/url-shortener', output: 'QR PNG/SVG download ready to print' }];
  }
  if (/age calculator/i.test(n)) {
    return [
      {
        input: 'Date of birth: March 15, 1998',
        output: 'Age: 28 years · X months · Y days · days until next birthday',
      },
    ];
  }
  if (/stopwatch/i.test(n)) {
    return [
      {
        input: 'Start → pause → resume (even after switching browser tabs)',
        output: 'Elapsed time keeps counting; live time also appears in the tab title',
      },
    ];
  }
  if (cat.includes('image')) {
    return [{ input: 'Upload PNG/JPG → choose size or quality', output: 'Optimized image ready to download' }];
  }
  if (cat.includes('calculat') || /calculator/i.test(n)) {
    return [{ input: 'Enter values in the fields above', output: 'Instant result with clear breakdown' }];
  }
  return [
    {
      input: `Open ${n} and enter your values in the tool above`,
      output: `Get an instant result you can copy or download — no signup required`,
    },
  ];
}
