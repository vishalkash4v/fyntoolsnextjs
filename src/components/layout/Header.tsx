import Link from 'next/link';
import { Zap } from 'lucide-react';
import HeaderClient from '@/components/layout/HeaderClient';

const navigation = [
  { name: 'Home', href: '/' },
  { name: 'Tools', href: '/tools' },
  { name: 'Blog', href: '/blog' },
  { name: 'About', href: '/about' },
  { name: 'Contact', href: '/contact' },
];

/** Server Component chrome — interactive bits live in HeaderClient. */
export default function Header() {
  return (
    <header className="relative glass-card border-b border-white/10 dark:border-white/5 sticky top-0 z-50 backdrop-blur-xl">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 gap-4">
          <Link href="/" className="flex items-center space-x-2 shrink-0">
            <div className="p-2 rounded-lg bg-gradient-to-br from-primary to-secondary">
              <Zap className="h-5 w-5 text-white" aria-hidden />
            </div>
            <span className="text-lg font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent hidden sm:inline">
              FYN Tools
            </span>
          </Link>

          <HeaderClient navigation={navigation} />
        </div>
      </div>
    </header>
  );
}
