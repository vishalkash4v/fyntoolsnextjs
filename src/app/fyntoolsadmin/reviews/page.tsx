import type { Metadata } from 'next';
import AdminShell from '@/components/admin/AdminShell';
import AdminReviewsPage from '@/components/admin/pages/AdminReviewsPage';

export const metadata: Metadata = {
  title: 'Admin Reviews',
  robots: { index: false, follow: false },
};

export default function Page() {
  return (
    <AdminShell>
      <AdminReviewsPage />
    </AdminShell>
  );
}
