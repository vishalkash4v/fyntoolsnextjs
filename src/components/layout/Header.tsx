import Link from 'next/link';
import Image from 'next/image';
import HeaderClient from '@/components/layout/HeaderClient';

const navigation = [
  { name: 'Home', href: '/' },
  { name: 'Tools', href: '/tools' },
  { name: 'Guides', href: '/guides' },
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
          <Link
            href="/"
            className="flex items-center space-x-3 hover:opacity-90 transition-opacity shrink-0"
          >
            <Image
              src="/logobeta-128.webp"
              alt="FYN Tools Logo"
              width={128}
              height={48}
              className="w-28 sm:w-32 h-auto object-contain"
              priority
              sizes="128px"
            />
          </Link>

          <HeaderClient navigation={navigation} />
        </div>
      </div>
    </header>
  );
}
