'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

type Options<T> = {
  /** localStorage key (namespaced automatically) */
  key: string;
  /** SSR-safe initial value (used until hydration restore) */
  initial: T;
  /** Debounce writes in ms (default 300) */
  debounceMs?: number;
  serialize?: (value: T) => string;
  parse?: (raw: string) => T;
};

const PREFIX = 'fyntools:tool:';

/**
 * Persist tool inputs to localStorage without SSR mismatch.
 * Always renders `initial` on the server and first client paint,
 * then restores stored value after mount.
 */
export function useToolStorage<T>({
  key,
  initial,
  debounceMs = 300,
  serialize = JSON.stringify,
  parse = JSON.parse as (raw: string) => T,
}: Options<T>): [T, (value: T | ((prev: T) => T)) => void, { hydrated: boolean; clear: () => void }] {
  const storageKey = `${PREFIX}${key}`;
  const [value, setValueState] = useState<T>(initial);
  const [hydrated, setHydrated] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(storageKey);
      if (raw != null) {
        setValueState(parse(raw));
      }
    } catch {
      /* ignore corrupt storage */
    }
    setHydrated(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- restore once on mount
  }, [storageKey]);

  const setValue = useCallback(
    (next: T | ((prev: T) => T)) => {
      setValueState((prev) => {
        const resolved = typeof next === 'function' ? (next as (p: T) => T)(prev) : next;
        if (timer.current) clearTimeout(timer.current);
        timer.current = setTimeout(() => {
          try {
            window.localStorage.setItem(storageKey, serialize(resolved));
          } catch {
            /* quota / private mode */
          }
        }, debounceMs);
        return resolved;
      });
    },
    [debounceMs, serialize, storageKey]
  );

  const clear = useCallback(() => {
    try {
      window.localStorage.removeItem(storageKey);
    } catch {
      /* ignore */
    }
    setValueState(initial);
  }, [initial, storageKey]);

  useEffect(() => {
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  return [value, setValue, { hydrated, clear }];
}
