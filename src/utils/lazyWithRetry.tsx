import React from 'react';

/**
 * Patterns that indicate a chunk failed to load (e.g. after new deployment).
 * When these occur, a full page reload fetches fresh HTML + new chunk URLs.
 */
const CHUNK_LOAD_ERROR_PATTERNS = [
  'Loading chunk',
  'Loading CSS chunk',
  'ChunkLoadError',
  'Failed to fetch dynamically imported module',
  'Importing a module script failed',
  'error loading dynamically imported module',
  'Unable to preload CSS',
  'fetch failed',
  'Load failed',
];

function isChunkLoadError(error: unknown): boolean {
  const message = error instanceof Error ? error.message : String(error);
  const lower = message.toLowerCase();
  return CHUNK_LOAD_ERROR_PATTERNS.some((p) => lower.includes(p.toLowerCase()));
}

/**
 * Wraps React.lazy to catch chunk load failures (e.g. after deploy).
 * On chunk load error: triggers full page reload so user gets latest assets.
 */
export function lazyWithRetry<T extends React.ComponentType<unknown>>(
  importFn: () => Promise<{ default: T }>,
  _retries = 1
): React.LazyExoticComponent<T> {
  return React.lazy(() =>
    importFn().catch((error) => {
      if (isChunkLoadError(error)) {
        window.location.reload();
        return new Promise<{ default: T }>(() => {}); // Never resolves; page reloads
      }
      throw error;
    })
  );
}
