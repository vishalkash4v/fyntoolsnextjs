export type Author = {
  slug: string;
  name: string;
  role: string;
  shortBio: string;
  bio: string[];
  credentials: string[];
  expertise: string[];
  experienceYears: number;
  sameAs: string[];
  email?: string;
  avatar?: string;
};

export const authors: Author[] = [
  {
    slug: 'fyn-editorial',
    name: 'FYN Tools Editorial',
    role: 'Founding Editorial & Engineering',
    shortBio:
      'Practitioners who build and document free browser utilities for developers, marketers, and students.',
    bio: [
      'FYN Tools Editorial is the in-house team responsible for product engineering, technical documentation, and the Guides publishing program on fyntools.com.',
      'We ship free, privacy-minded tools that run in the browser whenever possible, and we publish long-form guides that explain the underlying formats and workflows—not just feature lists.',
      'Editorial standards require unique examples, clear how-to steps, and honest limitations (for example, what a free shortener’s click stats can and cannot replace).',
    ],
    credentials: [
      'Maintains 90+ production utility tools on fyntools.com',
      'Authors technical guides on JSON, URLs, security hygiene, and SEO workflows',
      'Implements App Router SEO, structured data, and Core Web Vitals practices',
    ],
    expertise: [
      'Web utilities & developer tooling',
      'Technical SEO & structured data',
      'Browser privacy & client-side processing',
      'API payloads, JSON, and marketing link hygiene',
    ],
    experienceYears: 8,
    sameAs: [
      'https://fyntools.com/about',
      'https://fyntools.com/contact',
      'https://fyntools.com/guides',
    ],
    email: 'support@fyntools.com',
    avatar: '/logo.png',
  },
];

export function getAuthor(slug: string): Author | undefined {
  return authors.find((a) => a.slug === slug);
}

export const PRIMARY_AUTHOR_SLUG = 'fyn-editorial';
