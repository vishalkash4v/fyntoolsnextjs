import type { Metadata } from 'next';
import AdminBlogsPage from '@/components/admin/pages/AdminBlogsPage';

export const metadata: Metadata = {
  title: 'Admin Blogs',
  robots: { index: false, follow: false },
};

export default function Page() {
  return (
    <AdminBlogsPage mode="list" />
  );
}
