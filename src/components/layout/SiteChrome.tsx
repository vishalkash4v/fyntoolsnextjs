'use client';

import { usePathname } from 'next/navigation';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

/**
 * Hides public chrome on /fyntoolsadmin/* so the admin shell is full-viewport
 * (matches Vite admin, which sat outside MainLayout).
 */
export default function SiteChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() || '';
  const isAdmin = pathname.startsWith('/fyntoolsadmin');

  if (isAdmin) {
    return <>{children}</>;
  }

  return (
    <>
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </>
  );
}
