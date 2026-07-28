import Link from 'next/link';
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
            <img
              src="/logobeta-128.webp"
              srcSet="/logobeta-64.webp 64w, /logobeta-128.webp 128w, /logobeta-160.webp 160w"
              sizes="(max-width: 640px) 96px, 128px"
              width={128}
              height={64}
              className="w-36 h-auto object-contain"
              alt="FYN Tools Logo"
              decoding="async"
            />
          </Link>

          <HeaderClient navigation={navigation} />
        </div>
      </div>
    </header>
  );
}
