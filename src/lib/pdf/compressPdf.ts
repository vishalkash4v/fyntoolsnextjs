import { API_BASE_URL } from '@/lib/seo/site';

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
};

export const PDF_COMPRESS_LEVELS: PdfCompressLevel[] = [
  { id: 'full-quality', name: 'Maximum Clarity', subtitle: 'Prioritize print quality and fine details' },
  { id: 'high-quality', name: 'High Quality', subtitle: 'High-resolution output with minimal image downsampling' },
  { id: 'optimized', name: 'Recommended', subtitle: 'Balanced size and readability for everyday PDFs' },
  { id: 'slight-drop', name: 'Smaller File', subtitle: 'Stronger optimization for scanned and image-heavy PDFs' },
  { id: 'compact', name: 'Compact', subtitle: 'Smaller output; inspect fine print after compression' },
  { id: 'max-150kb', name: 'Target 150 KB', subtitle: 'Best-effort target; final size depends on PDF contents' },
];

export type PdfCompressProgress = {
  fileName: string;
  page: number;
  totalPages: number;
  percent: number;
};

export type PdfCompressResult = {
  downloadUrl: string;
  bytes: number;
  originalBytes: number;
  fileName: string;
  compressed: boolean;
  message: string;
  durationMs: number;
  level: PdfCompressLevel;
  reductionPercent: number;
};

type ApiResponse = {
  success?: boolean;
  error?: string;
  data?: {
    downloadUrl: string;
    fileName: string;
    originalBytes: number;
    bytes: number;
    compressed: boolean;
    reductionPercent: number;
    durationMs: number;
    message: string;
  };
};

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return String(bytes) + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
}

/**
 * Uses Ghostscript on the FYN Tools backend for real PDF-level optimization,
 * preserving text and vector objects where Ghostscript can retain them.
 * The result is stored temporarily in Cloudflare R2 and returned as a signed URL.
 */
export async function compressPdfFile(
  file: File,
  levelId: PdfCompressLevelId,
  onProgress?: (progress: PdfCompressProgress) => void
): Promise<PdfCompressResult> {
  const level = PDF_COMPRESS_LEVELS.find((item) => item.id === levelId) ?? PDF_COMPRESS_LEVELS[2]!;

  onProgress?.({ fileName: file.name, page: 1, totalPages: 1, percent: 10 });

  const form = new FormData();
  form.append('file', file, file.name);
  form.append('levelId', levelId);

  let response: Response;
  try {
    response = await fetch(API_BASE_URL + '/pdf-compressor/compress', {
      method: 'POST',
      body: form,
      cache: 'no-store',
    });
  } catch {
    throw new Error('Could not reach the PDF compression service. Please try again in a moment.');
  }

  const payload = (await response.json().catch(() => ({}))) as ApiResponse;
  if (!response.ok || payload.success !== true || !payload.data?.downloadUrl) {
    throw new Error(payload.error || 'PDF compression failed (HTTP ' + response.status + ').');
  }

  onProgress?.({ fileName: file.name, page: 1, totalPages: 1, percent: 100 });

  return { ...payload.data, level };
}
