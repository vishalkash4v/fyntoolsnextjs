import AdminShell from '@/components/admin/AdminShell';

/**
 * One ProtectedRoute + AdminLayout for all admin app pages.
 * Login/register stay outside this group so they are not gated.
 */
export default function ProtectedAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AdminShell>{children}</AdminShell>;
}
