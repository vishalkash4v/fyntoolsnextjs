import Link from 'next/link';
import { Mail, MapPin, Phone, ExternalLink } from 'lucide-react';
import { CATEGORY_HUBS } from '@/data/categoriesData';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const popularTools = [
    { name: 'PDF Compressor', path: '/pdf-compressor' },
    { name: 'Image Compressor', path: '/image-compressor' },
    { name: 'Image Resizer', path: '/image-resizer' },
    { name: 'Word Counter', path: '/word-counter' },
    { name: 'JSON Formatter', path: '/json-formatter' },
    { name: 'BMI Calculator', path: '/bmi-calculator' },
    { name: 'QR Code Generator', path: '/qr-code-generator' },
    { name: 'Password Generator', path: '/password-generator' },
  ];

  const companyLinks = [
    { name: 'About Us', href: '/about' },
    { name: 'Privacy Policy', href: '/privacy' },
    { name: 'Guides', href: '/guides' },
    { name: 'Contact', href: '/contact' },
    { name: 'All Tools', href: '/tools' },
    { name: 'Blog', href: '/blog' },
    { name: 'AI Domain Names', href: '/ai-domain-name-generator' },
    { name: 'Themes', href: '/themes' },
    { name: 'llms.txt', href: '/llms.txt' },
  ];

  return (
    <footer className="bg-muted/50 border-t" style={{ minHeight: '200px' }}>
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div>
            <Link href="/" className="flex items-center space-x-2 mb-4">
              {/* eslint-disable-next-line @next/next/no-img-element -- tiny footer logo; avoid layout JS cost */}
              <img
                src="/logobeta-128.webp"
                width={128}
                height={48}
                className="w-32 h-auto object-contain"
                alt="FYN Tools Logo"
                loading="lazy"
                decoding="async"
              />
            </Link>
            <p className="text-zinc-700 dark:text-zinc-300 mb-4 leading-relaxed">
              Professional online tools for developers, businesses, and individuals.
              All tools are free, secure, and work directly in your browser.
            </p>
            <div className="space-y-2 text-sm text-zinc-700 dark:text-zinc-300">
              <div className="flex items-center space-x-2">
                <MapPin className="h-4 w-4" />
                <span>Una, Himachal Pradesh, India</span>
              </div>
              <div className="flex items-center space-x-2">
                <Mail className="h-4 w-4" />
                <span>contact@fyntools.com</span>
              </div>
              <div className="flex items-center space-x-2">
                <Phone className="h-4 w-4" />
                <span>+91 6230450047</span>
              </div>
            </div>
          </div>

          <div>
            <h2 className="font-semibold text-foreground mb-4 text-base">Categories</h2>
            <ul className="space-y-2 columns-1 sm:columns-2 gap-x-6">
              {CATEGORY_HUBS.slice(0, 14).map((hub) => (
                <li key={hub.path} className="break-inside-avoid">
                  <Link
                    href={hub.path}
                    className="text-sm text-zinc-700 dark:text-zinc-300 hover:text-primary transition-colors"
                  >
                    {hub.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="font-semibold text-foreground mb-4 text-base">Popular Tools</h2>
            <ul className="space-y-2">
              {popularTools.map((tool) => (
                <li key={tool.name}>
                  <Link
                    href={tool.path}
                    prefetch={false}
                    className="text-sm text-zinc-700 dark:text-zinc-300 hover:text-primary transition-colors inline-flex items-center group"
                  >
                    {tool.name}
                    <ExternalLink className="h-3 w-3 ml-1 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="font-semibold text-foreground mb-4 text-base">Company</h2>
            <ul className="space-y-2">
              {companyLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-zinc-700 dark:text-zinc-300 hover:text-primary transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-border">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="flex flex-wrap justify-center md:justify-start gap-4">
              <Link href="/seo-tools" className="text-sm text-muted-foreground hover:text-primary">SEO Tools</Link>
              <Link href="/security-tools" className="text-sm text-muted-foreground hover:text-primary">Security Tools</Link>
              <Link href="/pdf-tools" className="text-sm text-muted-foreground hover:text-primary">PDF Tools</Link>
              <Link href="/period-cycle-tools" className="text-sm text-muted-foreground hover:text-primary">Period & Cycle</Link>
            </div>
            <p className="text-sm text-muted-foreground">
              © {currentYear} FYN Tools Worldwide. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
