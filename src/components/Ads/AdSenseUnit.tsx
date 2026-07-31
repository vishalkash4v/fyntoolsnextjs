'use client';

import { useEffect, useRef } from 'react';

type Props = {
  /** AdSense ad slot ID */
  slot?: string;
  /** Override client ID; defaults to NEXT_PUBLIC_ADSENSE_CLIENT */
  client?: string;
  format?: string;
  responsive?: boolean;
  className?: string;
  /** Reserved height to prevent CLS (px) */
  minHeight?: number;
};

declare global {
  interface Window {
    adsbygoogle?: unknown[];
  }
}

/**
 * CLS-safe AdSense wrapper. Renders a fixed min-height skeleton until the ad loads.
 * No-ops (shows placeholder) when NEXT_PUBLIC_ADSENSE_CLIENT is unset.
 * Defers adsbygoogle.push until idle to avoid competing with LCP.
 */
export default function AdSenseUnit({
  slot,
  client,
  format = 'auto',
  responsive = true,
  className = '',
  minHeight = 250,
}: Props) {
  const pushed = useRef(false);
  const clientId = client || process.env.NEXT_PUBLIC_ADSENSE_CLIENT || '';
  const slotId = slot || process.env.NEXT_PUBLIC_ADSENSE_SLOT_DEFAULT || '';
  // Set NEXT_PUBLIC_ENABLE_ADSENSE=0 for Lighthouse / lab runs (third-party ads block 100).
  const adsFlag = process.env.NEXT_PUBLIC_ENABLE_ADSENSE;
  const enabled =
    Boolean(clientId && slotId) &&
    adsFlag !== '0' &&
    adsFlag !== 'false';

  useEffect(() => {
    if (!enabled || pushed.current) return;

    const run = () => {
      if (pushed.current) return;
      try {
        const scriptId = 'adsense-loader';
        if (!document.getElementById(scriptId)) {
          const s = document.createElement('script');
          s.id = scriptId;
          s.async = true;
          s.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${clientId}`;
          s.crossOrigin = 'anonymous';
          document.head.appendChild(s);
        }
        window.adsbygoogle = window.adsbygoogle || [];
        window.adsbygoogle.push({});
        pushed.current = true;
      } catch {
        /* ignore ad load errors */
      }
    };

    const w = window as Window & {
      requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => number;
      cancelIdleCallback?: (id: number) => void;
    };
    const ric = w.requestIdleCallback?.(run, { timeout: 3500 });
    const t = ric == null ? window.setTimeout(run, 2000) : null;
    return () => {
      if (ric != null) w.cancelIdleCallback?.(ric);
      if (t != null) window.clearTimeout(t);
    };
  }, [enabled, clientId]);

  // When ads are off, take no layout space (helps Lighthouse). When on, reserve height for CLS.
  if (!enabled) {
    return null;
  }

  return (
    <div
      className={`w-full overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-800 bg-muted/30 ${className}`}
      style={{ minHeight, containIntrinsicSize: `auto ${minHeight}px`, contentVisibility: 'auto' as const }}
    >
      <ins
        className="adsbygoogle block w-full"
        style={{ display: 'block', minHeight }}
        data-ad-client={clientId}
        data-ad-slot={slotId}
        data-ad-format={format}
        data-full-width-responsive={responsive ? 'true' : 'false'}
      />
    </div>
  );
}
