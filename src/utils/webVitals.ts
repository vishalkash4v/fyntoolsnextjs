/**
 * Web Vitals Integration
 * Tracks Core Web Vitals: LCP, CLS, INP
 * Logs metrics to console and can send to analytics
 */

import { onCLS, onINP, onLCP, type Metric } from 'web-vitals';

export interface WebVitalsConfig {
  /**
   * Send metrics to analytics endpoint
   */
  sendToAnalytics?: (metric: Metric) => void;
  /**
   * Log metrics to console (development only)
   */
  logToConsole?: boolean;
  /**
   * Custom analytics function
   */
  analytics?: (metric: Metric) => void;
}

/**
 * Initialize Web Vitals tracking
 * Optimized for minimal performance overhead
 */
export const initWebVitals = (config: WebVitalsConfig = {}) => {
  const {
    sendToAnalytics,
    logToConsole = process.env.NODE_ENV === 'development',
    analytics
  } = config;

  // Performance optimization: Use requestIdleCallback if available
  const scheduleWork = typeof window !== 'undefined' && 'requestIdleCallback' in window
    ? (window as any).requestIdleCallback
    : (cb: () => void) => setTimeout(cb, 0);

  // Helper to handle metric reporting (optimized)
  const handleMetric = (metric: Metric) => {
    // Schedule non-critical work asynchronously to avoid blocking
    scheduleWork(() => {
      // Log to console in development (only if enabled)
      if (logToConsole && process.env.NODE_ENV === 'development') {
        console.log(`[Web Vitals] ${metric.name}:`, {
          value: metric.value,
          rating: metric.rating,
          id: metric.id,
          delta: metric.delta
        });
      }

      // Send to custom analytics (async, non-blocking)
      if (analytics) {
        try {
          analytics(metric);
        } catch (error) {
          console.warn('Analytics error:', error);
        }
      }

      // Send to analytics endpoint (async, non-blocking)
      if (sendToAnalytics) {
        try {
          sendToAnalytics(metric);
        } catch (error) {
          console.warn('Analytics endpoint error:', error);
        }
      }

      // Default: Send to Google Analytics 4 if available (async)
      if (typeof window !== 'undefined' && (window as any).gtag) {
        try {
          (window as any).gtag('event', metric.name, {
            event_category: 'Web Vitals',
            value: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
            event_label: metric.id,
            non_interaction: true,
          });
        } catch (error) {
          // Silently fail to avoid breaking the app
        }
      }
    });
  };

  // Track Largest Contentful Paint (LCP)
  // Minimal overhead: Uses requestIdleCallback for async reporting
  onLCP((metric) => {
    handleMetric(metric);
    
    // Log performance insights (development only)
    if (logToConsole && process.env.NODE_ENV === 'development') {
      const rating = metric.rating === 'good' ? '✅' : metric.rating === 'needs-improvement' ? '⚠️' : '❌';
      console.log(`${rating} LCP: ${metric.value.toFixed(2)}ms (${metric.rating})`);
    }
  });

  // Track Cumulative Layout Shift (CLS)
  // Minimal overhead: Uses requestIdleCallback for async reporting
  onCLS((metric) => {
    handleMetric(metric);
    
    if (logToConsole && process.env.NODE_ENV === 'development') {
      const rating = metric.rating === 'good' ? '✅' : metric.rating === 'needs-improvement' ? '⚠️' : '❌';
      console.log(`${rating} CLS: ${metric.value.toFixed(4)} (${metric.rating})`);
    }
  });

  // Track Interaction to Next Paint (INP)
  // Minimal overhead: Uses requestIdleCallback for async reporting
  onINP((metric) => {
    handleMetric(metric);
    
    if (logToConsole && process.env.NODE_ENV === 'development') {
      const rating = metric.rating === 'good' ? '✅' : metric.rating === 'needs-improvement' ? '⚠️' : '❌';
      console.log(`${rating} INP: ${metric.value.toFixed(2)}ms (${metric.rating})`);
    }
  });

  // Optional: Track First Input Delay (FID) - deprecated but still useful
  // Note: FID is being replaced by INP, but we can track it for comparison
  if (typeof window !== 'undefined') {
    import('web-vitals').then(({ onFID }) => {
      onFID((metric) => {
        handleMetric(metric);
        if (logToConsole) {
          const rating = metric.rating === 'good' ? '✅' : metric.rating === 'needs-improvement' ? '⚠️' : '❌';
          console.log(`${rating} FID: ${metric.value.toFixed(2)}ms (${metric.rating})`);
        }
      });
    }).catch(() => {
      // FID might not be available in newer versions
    });
  }
};

/**
 * Send metrics to custom analytics endpoint
 */
export const sendToCustomAnalytics = (metric: Metric, endpoint: string) => {
  if (typeof navigator !== 'undefined' && 'sendBeacon' in navigator) {
    const body = JSON.stringify({
      name: metric.name,
      value: metric.value,
      rating: metric.rating,
      id: metric.id,
      delta: metric.delta,
      url: window.location.href,
      timestamp: Date.now()
    });

    navigator.sendBeacon(endpoint, body);
  } else {
    // Fallback to fetch
    fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: metric.name,
        value: metric.value,
        rating: metric.rating,
        id: metric.id,
        delta: metric.delta,
        url: window.location.href,
        timestamp: Date.now()
      }),
      keepalive: true
    }).catch((error) => {
      console.warn('Failed to send Web Vitals to analytics:', error);
    });
  }
};

/**
 * Get performance summary
 */
export const getPerformanceSummary = (): Promise<{
  lcp?: number;
  cls?: number;
  inp?: number;
}> => {
  return new Promise((resolve) => {
    const metrics: { lcp?: number; cls?: number; inp?: number } = {};
    let count = 0;

    const checkComplete = () => {
      count++;
      if (count >= 3) {
        resolve(metrics);
      }
    };

    onLCP((metric) => {
      metrics.lcp = metric.value;
      checkComplete();
    });

    onCLS((metric) => {
      metrics.cls = metric.value;
      checkComplete();
    });

    onINP((metric) => {
      metrics.inp = metric.value;
      checkComplete();
    });

    // Timeout after 10 seconds
    setTimeout(() => {
      resolve(metrics);
    }, 10000);
  });
};

