import type { Metadata } from 'next';
import AdminShell from '@/components/admin/AdminShell';
import AdminDashboardPage from '@/components/admin/pages/AdminDashboardPage';

export const metadata: Metadata = {
  title: 'Admin Dashboard',
  robots: { index: false, follow: false },
};

export default function Page() {
  return (
    <AdminShell>
      <AdminDashboardPage />
    </AdminShell>
  );
}
