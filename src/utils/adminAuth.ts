/**
 * Shared admin session helpers — used across fyntoolsadmin pages.
 */

export class AdminAuthError extends Error {
  constructor(message = 'Session expired. Please log in again.') {
    super(message);
    this.name = 'AdminAuthError';
  }
}

export function getAdminToken(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    return localStorage.getItem('adminToken');
  } catch {
    return null;
  }
}

export function clearAdminSession(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
  } catch {
    /* ignore */
  }
}

/** Call after fetch — throws AdminAuthError on 401. */
export function assertAdminAuthorized(res: Response): void {
  if (res.status === 401) {
    clearAdminSession();
    throw new AdminAuthError();
  }
}

export function isAdminAuthError(err: unknown): err is AdminAuthError {
  return err instanceof AdminAuthError;
}
