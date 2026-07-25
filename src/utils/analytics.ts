/**
 * Analytics tracking utility
 * Tracks page views for analytics dashboard
 * Uses session-based unique view detection (localStorage sessionId)
 */

const API_BASE_URL = 'https://express-two-umber.vercel.app/api';

const SESSION_STORAGE_KEY = 'fyntools_analytics_session';
const SESSION_TTL_DAYS = 30; // Regenerate session after 30 days (resets "unique" for returning visitors)

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
    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify({
      sessionId,
      createdAt: Date.now(),
    }));
    return sessionId;
  } catch {
    return `s_${Date.now()}-${Math.random().toString(36).slice(2)}`;
  }
}

/**
 * Track a page view (non-blocking, fire and forget)
 * Sends sessionId for proper unique visitor counting
 */
export const trackPageView = (params: TrackPageViewParams) => {
  try {
    const sessionId = getOrCreateSessionId();
    const body = { ...params, sessionId };
    fetch(`${API_BASE_URL}/analytics/track`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
      keepalive: true,
    }).catch(err => {
      // Silently fail - analytics tracking should not break the app
      if (process.env.NODE_ENV === 'development') {
        console.warn('Analytics tracking failed:', err);
      }
    });
  } catch (err) {
    // Silently fail - analytics tracking should not break the app
    if (process.env.NODE_ENV === 'development') {
      console.warn('Analytics tracking error:', err);
    }
  }
};

/**
 * Track tool page view
 */
export const trackToolView = (toolId: string, toolPath: string, toolName: string) => {
  trackPageView({
    pageType: 'tool',
    pageId: toolId,
    pagePath: toolPath,
    pageTitle: toolName
  });
};

/**
 * Track blog page view
 */
export const trackBlogView = (blogId: string, blogSlug: string, blogTitle: string) => {
  trackPageView({
    pageType: 'blog',
    pageId: blogId,
    pagePath: `/blog/${blogSlug}`,
    pageTitle: blogTitle
  });
};
