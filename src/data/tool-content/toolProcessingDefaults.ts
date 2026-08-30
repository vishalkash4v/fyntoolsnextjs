/**
 * Truthful processing / I/O defaults for E-E-A-T badges.
 * Never claim "100% client-side / zero uploads" for tools that call APIs.
 */
import type { Tool } from '@/data/toolsData';
import type { SeoIoContract } from '@/data/seo-pages/types';

/** Paths known to send data to FYN Tools (or third-party) servers. */
const SERVER_ASSISTED = new Set([
  '/url-shortener',
  '/weather-forecast',
  '/ip-lookup',
  '/ip-address-to-location-finder',
  '/currency-converter',
  '/ai-text-rewriter',
  '/ai-domain-name-generator',
  '/social-media-downloader',
  '/background-remover',
  '/image-upscaler',
  '/image-to-text',
  '/invoice-generator',
]);

export type ProcessingMode = 'client' | 'hybrid' | 'server';

export function getProcessingMode(tool: Tool): ProcessingMode {
  if (!SERVER_ASSISTED.has(tool.path)) return 'client';
  if (
    tool.path === '/url-shortener' ||
    tool.path.startsWith('/ai-') ||
    tool.path === '/social-media-downloader' ||
    tool.path === '/weather-forecast' ||
    tool.path === '/ip-lookup' ||
    tool.path === '/ip-address-to-location-finder' ||
    tool.path === '/currency-converter'
  ) {
    return 'server';
  }
  return 'hybrid';
}

export function defaultProcessingNote(tool: Tool): string {
  const mode = getProcessingMode(tool);
  if (mode === 'client') {
    return 'Runs in your browser when possible — your input is not uploaded to FYN Tools servers for this tool’s core transform. Avoid pasting production secrets into any online form.';
  }
  if (mode === 'hybrid') {
    return 'Core preview may run locally; some features (AI, OCR, heavy image jobs, or file conversion) may send data to a processing endpoint. Do not upload confidential or regulated files.';
  }
  return 'This tool uses a server or third-party API for its primary job (for example short links, lookups, rates, or AI). Treat submitted URLs and text as potentially logged — never paste secrets or private personal data.';
}

export function defaultTldr(tool: Tool): string {
  const desc = tool.description.replace(/\s+/g, ' ').trim();
  const core = desc.length > 120 ? `${desc.slice(0, 117).trim()}…` : desc;
  return `${tool.name}: ${core} Free on FYN Tools — open the panel above, get a result, then use Related Tools for the next step.`;
}

export function defaultIoContract(tool: Tool): SeoIoContract {
  const mode = getProcessingMode(tool);
  const cat = tool.category.toLowerCase();
  const path = tool.path;

  if (path === '/pms-symptom-tracker' || path === '/period-tracker') {
    return {
      inputs: 'Date, symptoms, pain scale (1–10), mood, and optional notes',
      outputs: 'Saved symptom log and history timeline in browser localStorage',
      formats: 'Daily log entries; export when the tool UI offers it',
      limits: 'Educational self-tracking only — not diagnosis or emergency medical advice',
      processing: 'Client-side (browser localStorage)',
    };
  }

  let inputs = 'Text, numbers, or options in the on-page form';
  let outputs = 'On-screen result you can copy or download';
  let limits =
    'Practical limits follow your device memory and browser; very large inputs may be slow.';
  let formats = 'Browser form fields; file upload when the UI shows a file picker';

  if (cat.includes('image')) {
    inputs = 'Image file via upload or drag-and-drop (formats shown in the tool UI)';
    outputs = 'Processed image preview plus download when available';
    formats =
      'Common web formats such as PNG, JPEG, WebP, or SVG depending on the tool';
    limits =
      'Large images are limited by browser memory; resize before uploading multi‑MB files when possible.';
  } else if (
    cat.includes('text') ||
    cat.includes('writing') ||
    cat.includes('develop')
  ) {
    inputs = 'Paste or type text / code in the editor';
    outputs = 'Transformed text, metrics, or formatted code ready to copy';
    formats =
      'Plain text, JSON, HTML, CSS, JS, Markdown, or regex — as labeled on the control';
    limits =
      'Extremely large pastes may lag; split files if the tab becomes unresponsive.';
  } else if (
    cat.includes('calculat') ||
    cat.includes('finance') ||
    cat.includes('number')
  ) {
    inputs = 'Numeric fields and optional date / rate selectors';
    outputs = 'Calculated values with on-screen breakdown';
    formats = 'Numbers and dates in the units labeled on each field';
    limits =
      'Results are estimates for planning — not certified financial or medical advice.';
  } else if (cat.includes('typing')) {
    inputs = 'Keyboard input against the on-screen prompt';
    outputs = 'WPM, accuracy, and session stats';
    formats = 'Live keyboard events in the browser';
    limits = 'Scores stay in the session unless the tool UI offers export.';
  } else if (cat.includes('pregnancy') || cat.includes('period') || cat.includes('cycle')) {
    inputs = 'Calendar dates (LMP, conception, or cycle start) and optional cycle length';
    outputs = 'Estimated due date, week, fertile window, or logged symptoms';
    formats = 'Date picker; local symptom logs where applicable';
    limits =
      'Educational calendar estimates only — not contraception, diagnosis, or emergency medical advice.';
  } else if (cat.includes('network')) {
    inputs = 'IP, hostname, or lookup query as shown';
    outputs = 'Lookup results from the configured data source';
    formats = 'IPv4/IPv6 or domain string';
    limits = 'Requires network access; results depend on upstream geo/IP data.';
  }

  const processing =
    mode === 'client'
      ? 'Client-side (browser)'
      : mode === 'hybrid'
        ? 'Hybrid (browser + optional server job)'
        : 'Server / API assisted';

  return { inputs, outputs, formats, limits, processing };
}
