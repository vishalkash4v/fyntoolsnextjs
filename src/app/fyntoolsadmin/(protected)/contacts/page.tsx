import type { Metadata } from 'next';
import AdminContactPage from '@/components/admin/pages/AdminContactPage';

export const metadata: Metadata = {
  title: 'Admin Contacts',
  robots: { index: false, follow: false },
};

export default function Page() {
  return (
    <AdminContactPage />
  );
}
