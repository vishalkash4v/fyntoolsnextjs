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
 */
export default function AdSenseUnit({
  slot,
  client,
  format = 'auto',
  responsive = true,
  className = '',
  minHeight = 280,
}: Props) {
  const pushed = useRef(false);
  const clientId = client || process.env.NEXT_PUBLIC_ADSENSE_CLIENT || '';
  const slotId = slot || process.env.NEXT_PUBLIC_ADSENSE_SLOT_DEFAULT || '';
  const enabled = Boolean(clientId && slotId);

  useEffect(() => {
    if (!enabled || pushed.current) return;
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
  }, [enabled, clientId]);

  return (
    <div
      className={`w-full overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-800 bg-muted/30 ${className}`}
      style={{ minHeight }}
      aria-hidden={!enabled}
    >
      {enabled ? (
        <ins
          className="adsbygoogle block w-full"
          style={{ display: 'block', minHeight }}
          data-ad-client={clientId}
          data-ad-slot={slotId}
          data-ad-format={format}
          data-full-width-responsive={responsive ? 'true' : 'false'}
        />
      ) : (
        <div
          className="flex h-full w-full items-center justify-center text-xs text-muted-foreground animate-pulse"
          style={{ minHeight }}
        >
          Ad placeholder
        </div>
      )}
    </div>
  );
}
