import type { Metadata } from 'next';
import AdminShell from '@/components/admin/AdminShell';
import AdminAdsPage from '@/components/admin/pages/AdminAdsPage';

export const metadata: Metadata = {
  title: 'Ad Performance',
  robots: { index: false, follow: false },
};

export default function Page() {
  return (
    <AdminShell>
      <AdminAdsPage />
    </AdminShell>
  );
}
