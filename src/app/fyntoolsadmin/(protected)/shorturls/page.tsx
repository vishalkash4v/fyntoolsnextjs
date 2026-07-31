import type { Metadata } from 'next';
import AdminShortUrlsPage from '@/components/admin/pages/AdminShortUrlsPage';

export const metadata: Metadata = {
  title: 'Admin Short URLs',
  robots: { index: false, follow: false },
};

export default function Page() {
  return (
    <AdminShortUrlsPage />
  );
}
