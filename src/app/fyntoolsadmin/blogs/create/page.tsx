import type { Metadata } from 'next';
import AdminShell from '@/components/admin/AdminShell';
import AdminBlogsPage from '@/components/admin/pages/AdminBlogsPage';

export const metadata: Metadata = {
  title: 'Create Blog',
  robots: { index: false, follow: false },
};

export default function Page() {
  return (
    <AdminShell>
      <AdminBlogsPage mode="create" />
    </AdminShell>
  );
}
