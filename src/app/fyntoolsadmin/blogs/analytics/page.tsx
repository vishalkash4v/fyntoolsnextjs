import type { Metadata } from 'next';
import AdminShell from '@/components/admin/AdminShell';
import AdminBlogAnalyticsPage from '@/components/admin/pages/AdminBlogAnalyticsPage';

export const metadata: Metadata = {
  title: 'Blog Analytics',
  robots: { index: false, follow: false },
};

export default function Page() {
  return (
    <AdminShell>
      <AdminBlogAnalyticsPage />
    </AdminShell>
  );
}
