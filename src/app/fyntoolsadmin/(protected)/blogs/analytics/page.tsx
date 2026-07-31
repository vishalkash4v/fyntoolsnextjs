import type { Metadata } from 'next';
import AdminBlogAnalyticsPage from '@/components/admin/pages/AdminBlogAnalyticsPage';

export const metadata: Metadata = {
  title: 'Blog Analytics',
  robots: { index: false, follow: false },
};

export default function Page() {
  return (
    <AdminBlogAnalyticsPage />
  );
}
