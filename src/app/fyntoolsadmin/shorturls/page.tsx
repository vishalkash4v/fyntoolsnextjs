import type { Metadata } from 'next';
import AdminShell from '@/components/admin/AdminShell';
import AdminShortUrlsPage from '@/components/admin/pages/AdminShortUrlsPage';

export const metadata: Metadata = {
  title: 'Admin Short URLs',
  robots: { index: false, follow: false },
};

export default function Page() {
  return (
    <AdminShell>
      <AdminShortUrlsPage />
    </AdminShell>
  );
}
