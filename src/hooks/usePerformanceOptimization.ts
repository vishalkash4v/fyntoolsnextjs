'use client';
import { useEffect, useCallback, useMemo, useState } from 'react';

export const usePerformanceOptimization = () => {
  // Optimize images loading with intersection observer
  useEffect(() => {
    const images = document.querySelectorAll('img[data-src]');
    
    if ('IntersectionObserver' in window) {
      const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const img = entry.target as HTMLImageElement;
            img.src = img.dataset.src || '';
            img.removeAttribute('data-src');
            imageObserver.unobserve(img);
          }
        });
      });
      
      images.forEach(img => imageObserver.observe(img));
      
      return () => imageObserver.disconnect();
    } else {
      // Fallback for older browsers
      images.forEach(img => {
        const htmlImg = img as HTMLImageElement;
        htmlImg.src = htmlImg.dataset.src || '';
        htmlImg.removeAttribute('data-src');
      });
    }
  }, []);

  // Optimized debounce with useCallback
  const debounce = useCallback(<T extends (...args: any[]) => void>(
    func: T,
    wait: number
  ): ((...args: Parameters<T>) => void) => {
    let timeout: NodeJS.Timeout;
    return (...args: Parameters<T>) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), wait);
    };
  }, []);

  // Optimized throttle with useCallback
  const throttle = useCallback(<T extends (...args: any[]) => void>(
    func: T,
    limit: number
  ): ((...args: Parameters<T>) => void) => {
    let inThrottle: boolean;
    return (...args: Parameters<T>) => {
      if (!inThrottle) {
        func(...args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  }, []);

  // Preload critical resources
  const preloadResource = useCallback((href: string, as: string = 'fetch', crossorigin?: boolean) => {
    // Check if already preloaded
    const existing = document.querySelector(`link[rel="preload"][href="${href}"]`);
    if (existing) return;

    const link = document.createElement('link');
    link.rel = 'preload';
    link.href = href;
    link.as = as;
    if (crossorigin) link.crossOrigin = 'anonymous';
    document.head.appendChild(link);
  }, []);

  // Optimize bundle by checking if feature is needed
  const conditionalLoad = useCallback(async (condition: boolean, moduleLoader: () => Promise<any>) => {
    if (condition) {
      return await moduleLoader();
    }
    return null;
  }, []);

  // Performance metrics
  const measurePerformance = useMemo(() => ({
    markStart: (name: string) => {
      if ('performance' in window && performance.mark) {
        performance.mark(`${name}-start`);
      }
    },
    markEnd: (name: string) => {
      if ('performance' in window && performance.mark && performance.measure) {
        performance.mark(`${name}-end`);
        performance.measure(name, `${name}-start`, `${name}-end`);
      }
    },
    getEntries: () => {
      if ('performance' in window && performance.getEntriesByType) {
        return performance.getEntriesByType('measure');
      }
      return [];
    }
  }), []);

  return {
    debounce,
    throttle,
    preloadResource,
    conditionalLoad,
    measurePerformance
  };
};

// Custom hook for lazy loading components
export const useLazyComponent = <T extends React.ComponentType<any>>(
  importFunc: () => Promise<{ default: T }>,
  deps: any[] = []
) => {
  const [Component, setComponent] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let cancelled = false;
    
    setLoading(true);
    setError(null);
    
    importFunc()
      .then(module => {
        if (!cancelled) {
          setComponent(() => module.default);
        }
      })
      .catch(err => {
        if (!cancelled) {
          setError(err);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, deps);

  return { Component, loading, error };
};