/**
 * Global handlers for chunk load failures (e.g. after new deployment).
 * When chunks 404, triggers full page reload so user gets fresh assets.
 * Run this early in main.tsx before React mounts.
 */
const CHUNK_ERROR_PATTERNS = [
  'loading chunk',
  'loading css chunk',
  'chunkloaderror',
  'failed to fetch dynamically imported module',
  'error loading dynamically imported module',
  'importing a module script failed',
  'unable to preload css',
];

function isChunkLoadError(message: string, filename?: string): boolean {
  const m = (message || '').toLowerCase();
  if (CHUNK_ERROR_PATTERNS.some((p) => m.includes(p))) return true;
  if (filename && /\/assets\/.*\.(js|css)/.test(filename) && (m.includes('failed') || m.includes('error') || m.includes('404'))) return true;
  return false;
}

export function setupChunkLoadErrorHandlers(): void {
  // Unhandled promise rejections (e.g. failed import())
  window.addEventListener('unhandledrejection', (e) => {
    const msg = e.reason?.message ?? e.reason ?? '';
    if (isChunkLoadError(String(msg))) {
      e.preventDefault();
      window.location.reload();
    }
  });

  // Script/module load errors
  window.addEventListener('error', (e) => {
    if (isChunkLoadError(e.message || '', e.filename)) {
      e.preventDefault();
      e.stopPropagation();
      window.location.reload();
      return true;
    }
    return false;
  });
}
