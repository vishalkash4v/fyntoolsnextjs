'use client';

import { useEffect, useState } from 'react';
import AdSenseUnit from '@/components/Ads/AdSenseUnit';

type Props = {
  className?: string;
  minHeight?: number;
};

/**
 * Keep ads completely out of the critical path.
 * Mount only after idle / first interaction / long timeout so Lighthouse
 * "unused JS" and main-thread work are not dominated by AdSense.
 */
export default function DeferredAdSense({ className, minHeight = 280 }: Props) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let done = false;
    const arm = () => {
      if (done) return;
      done = true;
      setReady(true);
    };

    const onInteract = () => arm();
    window.addEventListener('scroll', onInteract, { once: true, passive: true });
    window.addEventListener('pointerdown', onInteract, { once: true });
    window.addEventListener('keydown', onInteract, { once: true });

    const w = window as Window & {
      requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => number;
      cancelIdleCallback?: (id: number) => void;
    };
    const ric = w.requestIdleCallback?.(arm, { timeout: 10000 });
    const fallback = window.setTimeout(arm, 12000);

    return () => {
      window.removeEventListener('scroll', onInteract);
      window.removeEventListener('pointerdown', onInteract);
      window.removeEventListener('keydown', onInteract);
      if (ric != null) w.cancelIdleCallback?.(ric);
      window.clearTimeout(fallback);
    };
  }, []);

  if (!ready) {
    return (
      <div
        className={className}
        style={{ minHeight: 0 }}
        aria-hidden="true"
      />
    );
  }

  return <AdSenseUnit className={className} minHeight={minHeight} />;
}
