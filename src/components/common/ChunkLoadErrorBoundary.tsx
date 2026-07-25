import React, { Component, ErrorInfo } from 'react';

const CHUNK_ERROR_PATTERNS = [
  'loading chunk',
  'chunkloaderror',
  'failed to fetch dynamically imported module',
  'error loading dynamically imported module',
];

function isChunkLoadError(error: Error): boolean {
  const msg = (error?.message || '').toLowerCase();
  return CHUNK_ERROR_PATTERNS.some((p) => msg.includes(p));
}

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * Catches React errors from failed lazy chunk loads (e.g. after deploy).
 * Triggers full page reload so user gets latest assets.
 */
export class ChunkLoadErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, _errorInfo: ErrorInfo): void {
    if (isChunkLoadError(error)) {
      window.location.reload();
    }
  }

  render(): React.ReactNode {
    if (this.state.hasError && this.state.error && isChunkLoadError(this.state.error)) {
      return (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '200px',
          padding: 24,
          textAlign: 'center',
        }}>
          <p style={{ color: 'var(--muted-foreground)', marginBottom: 12 }}>
            Loading new version…
          </p>
          <p style={{ fontSize: 14, color: 'var(--muted-foreground)' }}>
            If this doesn&apos;t reload automatically, <a href={window.location.href} style={{ textDecoration: 'underline' }}>click here</a>.
          </p>
        </div>
      );
    }
    if (this.state.hasError && this.state.error) {
      throw this.state.error;
    }
    return this.props.children;
  }
}
