/**
 * Client-side PDF compression via PDF.js (render) + pdf-lib (rebuild).
 * Converts pages to JPEG at configurable scale/quality for predictable size reduction.
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
  /** Relative scale of page render (1 = ~72–96 DPI baseline). */
  scale: number;
  /** JPEG quality 0–1 */
  quality: number;
  /** Rough fraction of original size (for estimates before encode). */
  estimateRatio: number;
  /** When set, binary-search quality to approach this byte limit. */
  targetBytes?: number;
};

export const PDF_COMPRESS_LEVELS: PdfCompressLevel[] = [
  {
    id: 'full-quality',
    name: 'Full Quality',
    subtitle: 'Near-original clarity — minimal size drop',
    scale: 1.6,
    quality: 0.92,
    estimateRatio: 0.88,
  },
  {
    id: 'high-quality',
    name: 'High Quality',
    subtitle: 'Excellent for sharing & printing',
    scale: 1.35,
    quality: 0.85,
    estimateRatio: 0.65,
  },
  {
    id: 'optimized',
    name: 'Optimized',
    subtitle: 'Best balance of size & clarity',
    scale: 1.1,
    quality: 0.75,
    estimateRatio: 0.45,
  },
  {
    id: 'slight-drop',
    name: 'Slight Quality Drop',
    subtitle: 'Noticeably smaller, still readable',
    scale: 0.95,
    quality: 0.62,
    estimateRatio: 0.32,
  },
  {
    id: 'compact',
    name: 'Compact',
    subtitle: 'Strong compression for forms & email',
    scale: 0.8,
    quality: 0.48,
    estimateRatio: 0.2,
  },
  {
    id: 'max-150kb',
    name: 'Compress to ~150 KB',
    subtitle: 'Aggressive target for 150KB PDF uploads',
    scale: 0.7,
    quality: 0.4,
    estimateRatio: 0.12,
    targetBytes: 150 * 1024,
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
        if (!blob) reject(new Error('Failed to encode page image'));
        else resolve(blob);
      },
      'image/jpeg',
      quality
    );
  });
}

async function renderPageToJpeg(
  // pdfjs PageViewport is structurally rich; keep runtime-compatible without fighting types
  page: {
    getViewport: (opts: { scale: number }) => { width: number; height: number };
    render: (opts: Record<string, unknown>) => { promise: Promise<void> };
  },
  scale: number,
  quality: number
): Promise<{ blob: Blob; width: number; height: number }> {
  const viewport = page.getViewport({ scale });
  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, Math.floor(viewport.width));
  canvas.height = Math.max(1, Math.floor(viewport.height));
  const ctx = canvas.getContext('2d', { alpha: false });
  if (!ctx) throw new Error('Canvas not supported');
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  await page.render({ canvasContext: ctx, viewport }).promise;
  const blob = await canvasToJpegBlob(canvas, quality);
  canvas.width = 0;
  canvas.height = 0;
  return { blob, width: viewport.width, height: viewport.height };
}

async function buildPdfFromPageJpegs(
  pages: { blob: Blob; width: number; height: number }[]
): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  for (const p of pages) {
    const bytes = new Uint8Array(await p.blob.arrayBuffer());
    const jpg = await doc.embedJpg(bytes);
    // PDF points: use rendered pixel size at 72 DPI mapping
    const page = doc.addPage([p.width, p.height]);
    page.drawImage(jpg, { x: 0, y: 0, width: p.width, height: p.height });
  }
  return doc.save({ useObjectStreams: true });
}

export function estimateCompressedBytes(originalBytes: number, level: PdfCompressLevel): number {
  if (level.targetBytes) {
    return Math.min(originalBytes, level.targetBytes);
  }
  return Math.max(8 * 1024, Math.round(originalBytes * level.estimateRatio));
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

/**
 * Compress a single PDF file at the given level.
 * For max-150kb, iteratively lowers scale/quality until under target or floor.
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

  const encodeOnce = async (scale: number, quality: number) => {
    const pages: { blob: Blob; width: number; height: number }[] = [];
    for (let i = 1; i <= totalPages; i++) {
      const page = await pdf.getPage(i);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      pages.push(await renderPageToJpeg(page as any, scale, quality));
      onProgress?.({
        fileName: file.name,
        page: i,
        totalPages,
        percent: Math.round((i / totalPages) * 100),
      });
    }
    return buildPdfFromPageJpegs(pages);
  };

  let out = await encodeOnce(level.scale, level.quality);

  if (level.targetBytes && out.byteLength > level.targetBytes) {
    const attempts: { scale: number; quality: number }[] = [
      { scale: 0.65, quality: 0.38 },
      { scale: 0.55, quality: 0.32 },
      { scale: 0.45, quality: 0.28 },
      { scale: 0.38, quality: 0.22 },
      { scale: 0.32, quality: 0.18 },
    ];
    for (const attempt of attempts) {
      if (out.byteLength <= level.targetBytes) break;
      out = await encodeOnce(attempt.scale, attempt.quality);
    }
  }

  const blob = new Blob([out.buffer.slice(out.byteOffset, out.byteOffset + out.byteLength) as ArrayBuffer], {
    type: 'application/pdf',
  });
  const base = file.name.replace(/\.pdf$/i, '') || 'document';
  return {
    blob,
    bytes: blob.size,
    pageCount: totalPages,
    level,
    originalBytes: file.size,
    fileName: `${base}_compressed_${level.id}.pdf`,
  };
}
