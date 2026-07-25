import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Admin Dashboard',
  robots: { index: false, follow: false },
};

export default function AdminDashboardPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-2xl font-bold mb-4">Admin Dashboard</h1>
      <p className="text-muted-foreground mb-6">
        Admin surfaces remain API-driven. Use the Vite admin for full CMS features during transition,
        or extend these Next.js routes incrementally.
      </p>
      <Link href="/fyntoolsadmin/login" className="text-primary hover:underline">
        Back to login
      </Link>
    </div>
  );
}
