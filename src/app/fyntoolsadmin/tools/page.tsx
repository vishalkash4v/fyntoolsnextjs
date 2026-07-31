import type { Metadata } from 'next';
import AdminShell from '@/components/admin/AdminShell';
import AdminToolsPage from '@/components/admin/pages/AdminToolsPage';

export const metadata: Metadata = {
  title: 'Tools Management',
  robots: { index: false, follow: false },
};

export default function Page() {
  return (
    <AdminShell>
      <AdminToolsPage />
    </AdminShell>
  );
}
