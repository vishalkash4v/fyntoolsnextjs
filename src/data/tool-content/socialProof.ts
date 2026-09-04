/** Deterministic examples + curated testimonials only (no fake reviews). */
import type { Tool } from '@/data/toolsData';
import { getToolSeoContent } from '@/data/toolSeoContent';
import { toolTestimonials, type ToolTestimonial } from '@/data/tool-content/toolTestimonials';
import { isGenericExamples } from '@/lib/seo/contentQuality';
import { getPathExamples } from '@/data/tool-content/toolExamples';

export function buildTestimonialsForTool(tool: Tool): ToolTestimonial[] {
  const curated = toolTestimonials[tool.path];
  // Only show curated reviews — never invent fake quotes (E-E-A-T / spam policy).
  if (curated?.length) return [...curated];
  return [];
}

export function buildExamplesForTool(tool: Tool): { input: string; output: string }[] {
  const fromPath = getPathExamples(tool.path);
  if (fromPath?.length) return fromPath;

  const curated = getToolSeoContent(tool.path);
  if (curated.examples?.length) {
    const mapped = curated.examples.map((e) => ({ input: e.input, output: e.output }));
    if (!isGenericExamples(mapped)) return mapped;
  }

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
    return [{ input: 'Enter the labeled amounts, rates, or dates in the form', output: 'Instant numeric result with a short breakdown' }];
  }
  if (/weather|forecast/i.test(n) || path.includes('weather')) {
    return getPathExamples('/weather-forecast')!;
  }
  return [
    {
      input: `Open ${n} above and enter a real sample (search, file, or values).`,
      output: `${n} returns a live, tool-specific result — copy or download from the panel.`,
    },
  ];
}
