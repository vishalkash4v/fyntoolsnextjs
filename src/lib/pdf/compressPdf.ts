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
  { id: 'high-quality', name: 'High Quality', subtitle: 'Preserve legibility for print and fine text' },
  { id: 'optimized', name: 'Recommended', subtitle: 'Content-aware balance for everyday PDFs' },
  { id: 'slight-drop', name: 'Smaller File', subtitle: 'More size reduction for image-heavy PDFs' },
  { id: 'compact', name: 'Compact', subtitle: 'Prioritize a smaller file; inspect fine print' },
  { id: 'max-150kb', name: 'Target 150 KB', subtitle: 'Best-effort target; depends on page count and content' },
];

export type PdfCompressStage =
  | 'uploading'
  | 'uploaded'
  | 'validating'
  | 'analyzing'
  | 'optimizing'
  | 'verifying'
  | 'uploading-result'
  | 'complete'
  | 'failed';

export type PdfCompressProgress = {
  fileName: string;
  stage: PdfCompressStage;
  percent: number;
  message: string;
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
  pageCount?: number;
  contentPreset?: string;
};

type ApiJobResponse = {
  success?: boolean;
  error?: string;
  data?: {
    jobId: string;
    statusUrl?: string;
  };
};

type ApiStatusResponse = {
  success?: boolean;
  error?: string;
  data?: {
    jobId: string;
    status: 'queued' | 'processing' | 'done' | 'error';
    stage: string;
    percent: number;
    message: string;
    error?: string | null;
    result?: {
      downloadUrl: string;
      fileName: string;
      originalBytes: number;
      bytes: number;
      compressed: boolean;
      reductionPercent: number;
      durationMs: number;
      levelId: string;
      analysis?: { preset?: string; pageCount?: number };
      message: string;
    } | null;
  };
};

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return String(bytes) + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function uploadJob(
  file: File,
  levelId: PdfCompressLevelId,
  onProgress?: (progress: PdfCompressProgress) => void
): Promise<string> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', API_BASE_URL + '/pdf-compressor/jobs');
    xhr.responseType = 'json';
    xhr.timeout = 120000;

    xhr.upload.onprogress = (event) => {
      if (!event.lengthComputable) return;
      // Upload accounts for the first 10% of the complete journey.
      const percent = Math.max(1, Math.min(10, Math.round((event.loaded / event.total) * 10)));
      onProgress?.({
        fileName: file.name,
        stage: 'uploading',
        percent,
        message: 'Uploading PDF securely (' + Math.round((event.loaded / event.total) * 100) + '%).',
      });
    };

    xhr.onerror = () => reject(new Error('Network error while uploading the PDF. Please try again.'));
    xhr.ontimeout = () => reject(new Error('Upload timed out. Try a smaller PDF or a more stable connection.'));
    xhr.onabort = () => reject(new Error('PDF upload was cancelled.'));
    xhr.onload = () => {
      const body = (xhr.response || {}) as ApiJobResponse;
      if (xhr.status < 200 || xhr.status >= 300 || body.success !== true || !body.data?.jobId) {
        reject(new Error(body.error || 'Could not start PDF compression (HTTP ' + xhr.status + ').'));
        return;
      }
      onProgress?.({
        fileName: file.name,
        stage: 'uploaded',
        percent: 10,
        message: 'Upload complete. Preparing the PDF for compression.',
      });
      resolve(body.data.jobId);
    };

    const form = new FormData();
    form.append('file', file, file.name);
    form.append('levelId', levelId);
    xhr.send(form);
  });
}

/**
 * Submits a PDF as an asynchronous job, reports actual upload progress, then
 * polls real backend stage updates rather than inventing a percentage while
 * Ghostscript is working. A completed result is only returned after validation
 * and storage have finished.
 */
export async function compressPdfFile(
  file: File,
  levelId: PdfCompressLevelId,
  onProgress?: (progress: PdfCompressProgress) => void
): Promise<PdfCompressResult> {
  const level = PDF_COMPRESS_LEVELS.find((item) => item.id === levelId) ?? PDF_COMPRESS_LEVELS[2]!;
  const jobId = await uploadJob(file, levelId, onProgress);
  const deadline = Date.now() + 6 * 60 * 1000;
  let latestPercent = 10;

  while (Date.now() < deadline) {
    let response: Response;
    try {
      response = await fetch(API_BASE_URL + '/pdf-compressor/jobs/' + encodeURIComponent(jobId), {
        method: 'GET',
        cache: 'no-store',
      });
    } catch {
      await delay(900);
      continue;
    }

    const payload = (await response.json().catch(() => ({}))) as ApiStatusResponse;
    if (!response.ok || payload.success !== true || !payload.data) {
      throw new Error(payload.error || 'Could not check compression status. Please try again.');
    }

    const job = payload.data;
    latestPercent = Math.max(latestPercent, Math.min(99, job.percent));
    onProgress?.({
      fileName: file.name,
      stage: job.stage as PdfCompressStage,
      percent: latestPercent,
      message: job.message || 'Processing your PDF. Please keep this page open.',
    });

    if (job.status === 'error') {
      throw new Error(job.error || 'PDF compression failed. Please try another PDF.');
    }

    if (job.status === 'done' && job.result?.downloadUrl) {
      onProgress?.({
        fileName: file.name,
        stage: 'complete',
        percent: 100,
        message: 'Compression complete. Your file is ready to download.',
      });
      return {
        downloadUrl: job.result.downloadUrl,
        bytes: job.result.bytes,
        originalBytes: job.result.originalBytes,
        fileName: job.result.fileName,
        compressed: job.result.compressed,
        message: job.result.message,
        durationMs: job.result.durationMs,
        level,
        reductionPercent: job.result.reductionPercent,
        pageCount: job.result.analysis?.pageCount,
        contentPreset: job.result.analysis?.preset,
      };
    }

    await delay(800);
  }

  throw new Error('This PDF is taking longer than expected. Please try again with a smaller file.');
}
