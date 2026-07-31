'use client';

import { useLayoutEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

function readAdminToken(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    return localStorage.getItem('adminToken');
  } catch {
    return null;
  }
}

/**
 * Gate admin pages. Mirrors Vite's sync localStorage check so we don't stick on
 * "Checking session…" after login or on client navigations.
 */
export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [token, setToken] = useState<string | null>(() => readAdminToken());
  const [ready, setReady] = useState(() => typeof window !== 'undefined');

  useLayoutEffect(() => {
    const t = readAdminToken();
    setToken(t);
    setReady(true);
    if (!t) {
      router.replace('/fyntoolsadmin/login');
    }
  }, [router]);

  if (!ready) {
    return (
      <div className="min-h-screen flex items-center justify-center text-sm text-muted-foreground">
        Checking session…
      </div>
    );
  }

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center text-sm text-muted-foreground">
        Redirecting to login…
      </div>
    );
  }

  return <>{children}</>;
}
