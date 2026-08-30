import type { Metadata } from 'next';

/** Short-link routes (/s/{code}, /s/{code}/stats) must never be indexed. */
export const metadata: Metadata = {
  title: 'Redirecting…',
  description: 'Short link redirect — not for search indexing.',
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: {
      index: false,
      follow: false,
      noimageindex: true,
    },
  },
  openGraph: {
    title: 'Redirecting…',
    description: 'Short link redirect.',
  },
  twitter: {
    title: 'Redirecting…',
    description: 'Short link redirect.',
  },
};

export default function ShortUrlLayout({ children }: { children: React.ReactNode }) {
  return children;
}
