/**
 * Analytics tracking utility
 * Tracks page views for analytics dashboard
 * Uses session-based unique view detection (localStorage sessionId)
 */

const TRACK_URL = '/api/analytics/track';

const SESSION_STORAGE_KEY = 'fyntools_analytics_session';
const SESSION_TTL_DAYS = 30;

interface TrackPageViewParams {
  pageType: 'tool' | 'blog' | 'shorturl' | 'other';
  pageId: string;
  pagePath: string;
  pageTitle?: string;
}

function getOrCreateSessionId(): string {
  try {
    const stored = localStorage.getItem(SESSION_STORAGE_KEY);
    if (stored) {
      const { sessionId, createdAt } = JSON.parse(stored);
      const ageDays = (Date.now() - createdAt) / (24 * 60 * 60 * 1000);
      if (ageDays < SESSION_TTL_DAYS) return sessionId;
    }
    const sessionId = `s_${crypto.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2)}`}`;
    localStorage.setItem(
      SESSION_STORAGE_KEY,
      JSON.stringify({ sessionId, createdAt: Date.now() })
    );
    return sessionId;
  } catch {
    return `s_${Date.now()}-${Math.random().toString(36).slice(2)}`;
  }
}

function sendTrack(body: Record<string, unknown>) {
  const json = JSON.stringify(body);

  // Prefer fetch+keepalive: more reliable through Next.js API routes than sendBeacon alone.
  try {
    void fetch(TRACK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: json,
      keepalive: true,
    }).catch(() => {
      if (typeof navigator !== 'undefined' && navigator.sendBeacon) {
        navigator.sendBeacon(TRACK_URL, new Blob([json], { type: 'application/json' }));
      }
    });
    return;
  } catch {
    if (typeof navigator !== 'undefined' && navigator.sendBeacon) {
      navigator.sendBeacon(TRACK_URL, new Blob([json], { type: 'application/json' }));
    }
  }
}

export const trackPageView = (params: TrackPageViewParams) => {
  try {
    const sessionId = getOrCreateSessionId();
    sendTrack({ ...params, sessionId });
  } catch (err) {
    if (process.env.NODE_ENV === 'development') {
      console.warn('Analytics tracking error:', err);
    }
  }
};

export const trackToolView = (toolId: string, toolPath: string, toolName: string) => {
  trackPageView({
    pageType: 'tool',
    pageId: toolId,
    pagePath: toolPath,
    pageTitle: toolName,
  });
};

export const trackBlogView = (blogId: string, blogSlug: string, blogTitle: string) => {
  trackPageView({
    pageType: 'blog',
    pageId: blogId,
    pagePath: `/blog/${blogSlug}`,
    pageTitle: blogTitle,
  });
};
