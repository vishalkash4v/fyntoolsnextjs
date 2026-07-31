import type { Metadata } from 'next';
import AdminRegisterPage from '@/components/admin/pages/AdminRegisterPage';

export const metadata: Metadata = {
  title: 'Admin Register',
  robots: { index: false, follow: false },
};

export default function Page() {
  return <AdminRegisterPage />;
}
