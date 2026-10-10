/**
 * Quality-first PDF compression.
 *
 * Important safeguards:
 * - Never rasterize PDFs containing selectable text: that makes text blurry and
 *   removes text search/copy/accessibility.
 * - Only rasterize image-only/scanned PDFs, at a high render resolution.
 * - Keep the original file if the candidate is not smaller.
 * - Preserve the original PDF page dimensions (PDF points), not pixel dimensions.
 *
 * Browser-only compression cannot guarantee a target size for every PDF without
 * sacrificing quality. The UI therefore reports actual output bytes only.
 */

import { PDFDocument } from 'pdf-lib';

export type PdfCompressLevelId =
  | 'full-quality'
  | 'high-quality'
  | 'optimized'
  | 'slight-drop'
  | 'compact'
  | 'max-150kb';

export type PdfCompressLevel = {
  id: PdfCompressLevelId;
  name: string;
  subtitle: string;
  /** Render scale relative to PDF.js's 72-DPI viewport. */
  scale: number;
  /** JPEG quality used only for image-only/scanned PDFs. */
  quality: number;
};

export const PDF_COMPRESS_LEVELS: PdfCompressLevel[] = [
  {
    id: 'full-quality',
    name: 'Maximum Clarity',
    subtitle: 'Highest clarity for scanned pages',
    scale: 2.2,
    quality: 0.95,
  },
  {
    id: 'high-quality',
    name: 'High Quality',
    subtitle: 'High-resolution scans with minimal loss',
    scale: 2.0,
    quality: 0.92,
  },
  {
    id: 'optimized',
    name: 'Recommended',
    subtitle: 'Balanced size and scan readability',
    scale: 1.8,
    quality: 0.9,
  },
  {
    id: 'slight-drop',
    name: 'Smaller File',
    subtitle: 'More compression for image-only scans',
    scale: 1.65,
    quality: 0.86,
  },
  {
    id: 'compact',
    name: 'Compact Scan',
    subtitle: 'Stronger compression; inspect fine print',
    scale: 1.5,
    quality: 0.82,
  },
  {
    id: 'max-150kb',
    name: 'Smallest File (Best Effort)',
    subtitle: 'Attempts stronger reduction; 150 KB is not guaranteed',
    scale: 1.35,
    quality: 0.78,
  },
];

export type PdfCompressProgress = {
  fileName: string;
  page: number;
  totalPages: number;
  percent: number;
};

export type PdfCompressResult = {
  blob: Blob;
  bytes: number;
  pageCount: number;
  level: PdfCompressLevel;
  originalBytes: number;
  fileName: string;
  compressed: boolean;
  message: string;
};

let workerReady = false;

async function getPdfJs() {
  const pdfjs = await import('pdfjs-dist');
  if (!workerReady && typeof window !== 'undefined') {
    pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';
    workerReady = true;
  }
  return pdfjs;
}

function canvasToJpegBlob(canvas: HTMLCanvasElement, quality: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) reject(new Error('Failed to encode a PDF page'));
        else resolve(blob);
      },
      'image/jpeg',
      quality
    );
  });
}

async function renderPageToJpeg(
  page: {
    getViewport: (opts: { scale: number }) => { width: number; height: number };
    render: (opts: Record<string, unknown>) => { promise: Promise<void> };
  },
  scale: number,
  quality: number
): Promise<{ blob: Blob; pageWidth: number; pageHeight: number }> {
  const viewport = page.getViewport({ scale });
  const baseViewport = page.getViewport({ scale: 1 });
  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, Math.ceil(viewport.width));
  canvas.height = Math.max(1, Math.ceil(viewport.height));

  const ctx = canvas.getContext('2d', { alpha: false });
  if (!ctx) throw new Error('Canvas is not supported by this browser');

  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  await page.render({ canvasContext: ctx, viewport }).promise;
  const blob = await canvasToJpegBlob(canvas, quality);

  // Release the potentially large canvas immediately.
  canvas.width = 0;
  canvas.height = 0;

  return {
    blob,
    // Keep the original physical page geometry in PDF points.
    pageWidth: baseViewport.width,
    pageHeight: baseViewport.height,
  };
}

async function buildPdfFromPageJpegs(
  pages: { blob: Blob; pageWidth: number; pageHeight: number }[]
): Promise<Uint8Array> {
  const doc = await PDFDocument.create();

  for (const p of pages) {
    const bytes = new Uint8Array(await p.blob.arrayBuffer());
    const jpg = await doc.embedJpg(bytes);
    const page = doc.addPage([p.pageWidth, p.pageHeight]);
    page.drawImage(jpg, {
      x: 0,
      y: 0,
      width: p.pageWidth,
      height: p.pageHeight,
    });
  }

  return doc.save({ useObjectStreams: true });
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function originalResult(
  file: File,
  level: PdfCompressLevel,
  pageCount: number,
  message: string
): PdfCompressResult {
  return {
    blob: file,
    bytes: file.size,
    pageCount,
    level,
    originalBytes: file.size,
    fileName: file.name,
    compressed: false,
    message,
  };
}

/**
 * Compress a PDF without trading away selectable text for a smaller file.
 * Text-bearing PDFs are kept intact because browser-only rasterization would
 * degrade their text and vector content. Image-only PDFs are re-encoded once;
 * the original is retained if the candidate is not strictly smaller.
 */
export async function compressPdfFile(
  file: File,
  levelId: PdfCompressLevelId,
  onProgress?: (p: PdfCompressProgress) => void
): Promise<PdfCompressResult> {
  const level = PDF_COMPRESS_LEVELS.find((l) => l.id === levelId) ?? PDF_COMPRESS_LEVELS[2]!;
  const pdfjs = await getPdfJs();
  const data = new Uint8Array(await file.arrayBuffer());
  const pdf = await pdfjs.getDocument({ data: data.slice(0) }).promise;
  const totalPages = pdf.numPages;

  try {
    let containsSelectableText = false;

    // Inspect every page before any destructive rasterization.
    for (let i = 1; i <= totalPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const textItems = (textContent.items ?? []) as Array<{ str?: string }>;
      if (textItems.some((item) => (item.str ?? '').trim().length > 0)) {
        containsSelectableText = true;
      }
      onProgress?.({
        fileName: file.name,
        page: i,
        totalPages,
        percent: Math.round((i / totalPages) * 20),
      });
      if (containsSelectableText) break;
    }

    if (containsSelectableText) {
      return originalResult(
        file,
        level,
        totalPages,
        'Original kept to protect selectable text, fonts, and vector quality. This browser-only compressor will not rasterize a text-based PDF.'
      );
    }

    const pages: { blob: Blob; pageWidth: number; pageHeight: number }[] = [];
    for (let i = 1; i <= totalPages; i++) {
      const page = await pdf.getPage(i);
      pages.push(await renderPageToJpeg(page as never, level.scale, level.quality));
      onProgress?.({
        fileName: file.name,
        page: i,
        totalPages,
        percent: 20 + Math.round((i / totalPages) * 75),
      });
    }

    const output = await buildPdfFromPageJpegs(pages);
    const candidate = new Blob(
      [output.buffer.slice(output.byteOffset, output.byteOffset + output.byteLength) as ArrayBuffer],
      { type: 'application/pdf' }
    );

    // Never return a larger PDF and call it compression.
    if (candidate.size >= file.size) {
      return originalResult(
        file,
        level,
        totalPages,
        'The PDF was already efficient for its content. The original was kept because recompression did not reduce its size.'
      );
    }

    const base = file.name.replace(/\.pdf$/i, '') || 'document';
    return {
      blob: candidate,
      bytes: candidate.size,
      pageCount: totalPages,
      level,
      originalBytes: file.size,
      fileName: `${base}_compressed.pdf`,
      compressed: true,
      message: 'Image-only PDF compressed. Check small print before using the file.',
    };
  } finally {
    await pdf.destroy();
  }
}
