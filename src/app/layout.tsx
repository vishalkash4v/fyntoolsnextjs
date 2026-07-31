import type { Metadata } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import SiteChrome from '@/components/layout/SiteChrome';
import { ThemeProvider } from '@/components/providers/ThemeProvider';
import { AppProviders } from '@/components/providers/AppProviders';
import SchemaMarkup from '@/components/seo/SchemaMarkup';
import { organizationSchema, websiteSchema } from '@/lib/seo/schemas';
import { SITE_URL } from '@/lib/seo/site';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
  preload: true,
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains-mono',
  display: 'swap',
  preload: false, // code font — not needed for homepage LCP
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'FYN Tools Worldwide - Free Professional Online Tools',
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
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/logobeta-64.webp', type: 'image/webp', sizes: '64x64' },
      { url: '/logo.png', type: 'image/png', sizes: '512x512' },
    ],
    apple: [{ url: '/apple-icon.png', sizes: '180x180', type: 'image/png' }],
    shortcut: '/favicon.ico',
  },
  manifest: '/manifest.json',
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
    types: {
      'text/plain': [
        { url: '/llms.txt', title: 'llms.txt' },
        { url: '/agent-instructions.md', title: 'agent-instructions' },
      ],
      'application/json': [{ url: '/agents.json', title: 'agents.json' }],
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning data-scroll-behavior="smooth">
      <body
        className={`${inter.variable} ${jetbrainsMono.variable} font-sans antialiased min-h-screen flex flex-col bg-background text-foreground`}
      >
        <SchemaMarkup data={[organizationSchema(), websiteSchema()]} />
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
          <AppProviders>
            <SiteChrome>{children}</SiteChrome>
          </AppProviders>
        </ThemeProvider>
      </body>
    </html>
  );
}
