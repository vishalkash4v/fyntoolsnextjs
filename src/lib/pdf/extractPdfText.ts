/**
 * Client-side PDF text extraction via PDF.js (layout-aware formatted + plain text).
 */

export type PdfExtractProgress = {
  page: number;
  totalPages: number;
  percent: number;
};

export type PdfExtractResult = {
  /** Layout-preserved text with optional **bold** / *italic* from PDF fonts. */
  formatted: string;
  /** Normalized plain text without markdown or extra spacing. */
  plain: string;
  pageCount: number;
  charCount: number;
  wordCount: number;
  /** True when almost no selectable text layer was found (likely scanned PDF). */
  likelyScanned: boolean;
};

type PdfTextItem = {
  str: string;
  transform: number[];
  width: number;
  height: number;
  hasEOL?: boolean;
  fontName?: string;
};

type LinePart = {
  x: number;
  y: number;
  str: string;
  width: number;
  fontName: string;
  height: number;
};

let workerInitialized = false;

async function getPdfJs() {
  const pdfjs = await import('pdfjs-dist');
  if (!workerInitialized && typeof window !== 'undefined') {
    pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';
    workerInitialized = true;
  }
  return pdfjs;
}

function median(values: number[]): number {
  if (!values.length) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[mid]! : (sorted[mid - 1]! + sorted[mid]!) / 2;
}

function applyFontStyle(text: string, fontName: string): string {
  if (!text.trim()) return text;
  const fn = fontName.toLowerCase();
  const bold = /bold|black|heavy|semibold|demi|700|800|900/.test(fn);
  const italic = /italic|oblique|it/.test(fn) && !/digit|metric|symbol/.test(fn);
  if (bold && italic) return `***${text}***`;
  if (bold) return `**${text}**`;
  if (italic) return `*${text}*`;
  return text;
}

/** Reconstruct page text preserving line breaks, spacing, and font-weight cues. */
function pageItemsToFormatted(items: PdfTextItem[]): string {
  const glyphs: LinePart[] = items
    .filter((item) => item.str !== undefined && item.str !== '')
    .map((item) => ({
      x: item.transform[4] ?? 0,
      y: item.transform[5] ?? 0,
      str: item.str,
      width: item.width ?? 0,
      height: Math.abs(item.transform[3] ?? item.height ?? 10),
      fontName: item.fontName ?? '',
    }));

  if (!glyphs.length) return '';

  const heights = glyphs.map((g) => g.height).filter((h) => h > 0);
  const lineThreshold = Math.max(2, median(heights) * 0.55);

  glyphs.sort((a, b) => {
    if (Math.abs(a.y - b.y) <= lineThreshold) return a.x - b.x;
    return b.y - a.y;
  });

  const lines: { y: number; parts: LinePart[] }[] = [];

  for (const g of glyphs) {
    let line = lines.find((l) => Math.abs(l.y - g.y) <= lineThreshold);
    if (!line) {
      line = { y: g.y, parts: [] };
      lines.push(line);
    }
    line.parts.push(g);
  }

  lines.sort((a, b) => b.y - a.y);

  const out: string[] = [];

  for (const line of lines) {
    line.parts.sort((a, b) => a.x - b.x);
    let lineText = '';

    for (let i = 0; i < line.parts.length; i++) {
      const part = line.parts[i]!;
      if (i > 0) {
        const prev = line.parts[i - 1]!;
        const gap = part.x - (prev.x + prev.width);
        if (gap > 1.5) {
          lineText += gap > 16 ? '\t' : ' ';
        }
      }
      lineText += applyFontStyle(part.str, part.fontName);
    }

    const trimmed = lineText.replace(/\s+$/, '');
    if (trimmed) out.push(trimmed);
  }

  return out.join('\n');
}

/** Strip markdown + normalize whitespace for plain copy / TXT download. */
export function toPlainText(formatted: string): string {
  return formatted
    .replace(/\u00AD/g, '')
    .replace(/\uFEFF/g, '')
    .replace(/\*\*\*(.*?)\*\*\*/g, '$1')
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/\*(.*?)\*/g, '$1')
    .replace(/^--- Page \d+ ---\s*$/gm, '')
    .split('\n')
    .map((line) => line.replace(/\t/g, ' ').replace(/\s+/g, ' ').trim())
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function countWords(text: string): number {
  const t = text.trim();
  if (!t) return 0;
  return t.split(/\s+/).filter(Boolean).length;
}

export async function extractTextFromPdfFile(
  file: ArrayBuffer,
  onProgress?: (p: PdfExtractProgress) => void
): Promise<PdfExtractResult> {
  const pdfjs = await getPdfJs();
  const loadingTask = pdfjs.getDocument({ data: new Uint8Array(file) });
  const pdf = await loadingTask.promise;

  const pageCount = pdf.numPages;
  const pageTexts: string[] = [];

  for (let pageNum = 1; pageNum <= pageCount; pageNum++) {
    const page = await pdf.getPage(pageNum);
    const content = await page.getTextContent();
    const items = content.items as PdfTextItem[];
    const pageText = pageItemsToFormatted(items);
    if (pageText.trim()) {
      pageTexts.push(pageCount > 1 ? `--- Page ${pageNum} ---\n${pageText}` : pageText);
    }

    onProgress?.({
      page: pageNum,
      totalPages: pageCount,
      percent: Math.round((pageNum / pageCount) * 100),
    });
  }

  await pdf.destroy();

  const formatted = pageTexts.join('\n\n').trim();
  const plain = toPlainText(formatted);
  const charCount = plain.length;
  const wordCount = countWords(plain);
  const likelyScanned = charCount < 40;

  return {
    formatted,
    plain,
    pageCount,
    charCount,
    wordCount,
    likelyScanned,
  };
}
