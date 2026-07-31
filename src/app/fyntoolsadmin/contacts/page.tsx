import type { Metadata } from 'next';
import AdminShell from '@/components/admin/AdminShell';
import AdminContactPage from '@/components/admin/pages/AdminContactPage';

export const metadata: Metadata = {
  title: 'Admin Contacts',
  robots: { index: false, follow: false },
};

export default function Page() {
  return (
    <AdminShell>
      <AdminContactPage />
    </AdminShell>
  );
}
