import type { Metadata } from 'next';
import AdminShell from '@/components/admin/AdminShell';
import AdminTrafficPage from '@/components/admin/pages/AdminTrafficPage';

export const metadata: Metadata = {
  title: 'Traffic & IP Visits',
  robots: { index: false, follow: false },
};

export default function Page() {
  return (
    <AdminShell>
      <AdminTrafficPage />
    </AdminShell>
  );
}
