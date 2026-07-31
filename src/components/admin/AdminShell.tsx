'use client';

import ProtectedRoute from '@/components/admin/ProtectedRoute';
import AdminLayout from '@/components/admin/AdminLayout';

/** Single auth shell — avoid remounting ProtectedRoute on every admin page. */
export default function AdminShell({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute>
      <AdminLayout>{children}</AdminLayout>
    </ProtectedRoute>
  );
}
