import type { Metadata } from 'next';
import AdminReviewsPage from '@/components/admin/pages/AdminReviewsPage';

export const metadata: Metadata = {
  title: 'Admin Reviews',
  robots: { index: false, follow: false },
};

export default function Page() {
  return (
    <AdminReviewsPage />
  );
}
