import type { Metadata } from 'next';
import AdminLoginPage from '@/components/admin/pages/AdminLoginPage';

export const metadata: Metadata = {
  title: 'Admin Login',
  robots: { index: false, follow: false },
};

export default function Page() {
  return <AdminLoginPage />;
}
