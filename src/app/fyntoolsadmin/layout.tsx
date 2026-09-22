import '@/styles/admin-design-system.css';

export const metadata = {
  title: { absolute: 'FYN Tools Admin' },
  description: 'Private FYN Tools administration console. Not indexed by search engines.',
  robots: { index: false, follow: false },
};

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return children;
}
