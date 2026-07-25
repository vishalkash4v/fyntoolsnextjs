import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import 'rsuite/dist/rsuite-no-reset.min.css';
import './globals.css';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { ThemeProvider } from '@/components/providers/ThemeProvider';
import { AppProviders } from '@/components/providers/AppProviders';
import { SITE_URL } from '@/lib/seo/site';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'FYN Tools Worldwide - Free Professional Online Tools',
    // Pages should use title.absolute via buildPageMetadata — template is fallback only
    template: '%s | FYN Tools Worldwide',
  },
  description:
    'Access 90+ free professional online tools instantly. Calculators, text tools, image editors, converters, and developer utilities. No registration required.',
  applicationName: 'FYN Tools Worldwide',
  keywords: [
    'free online tools',
    'calculators',
    'text tools',
    'image tools',
    'developer tools',
    'converters',
    'FYN Tools',
  ],
  authors: [{ name: 'FYN Tools Worldwide', url: SITE_URL }],
  creator: 'FYN Tools Worldwide',
  publisher: 'FYN Tools Worldwide',
  formatDetection: { telephone: false, email: false, address: false },
  icons: {
    icon: [{ url: '/favicon.ico' }, { url: '/placeholder.svg', type: 'image/svg+xml' }],
    apple: '/placeholder.svg',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: SITE_URL,
    siteName: 'FYN Tools Worldwide',
    title: 'FYN Tools Worldwide - Free Professional Online Tools',
    description:
      'Access 90+ free professional online tools instantly. No registration required.',
  },
  twitter: {
    card: 'summary_large_image',
    site: '@fyntoolsworldwide',
    creator: '@fyntoolsworldwide',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1,
    },
  },
  alternates: {
    canonical: SITE_URL,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} antialiased min-h-screen flex flex-col`}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <AppProviders>
            <Header />
            <main className="flex-1">{children}</main>
            <Footer />
          </AppProviders>
        </ThemeProvider>
      </body>
    </html>
  );
}
