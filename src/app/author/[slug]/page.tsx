import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { buildPageMetadata } from '@/lib/seo/metadata';
import SchemaMarkup from '@/components/seo/SchemaMarkup';
import { breadcrumbSchema, personSchema } from '@/lib/seo/schemas';
import { absoluteUrl } from '@/lib/seo/site';
import { authors, getAuthor } from '@/data/authors';
import { getGuidesByAuthor } from '@/data/guides/guidesData';

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return authors.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const author = getAuthor(slug);
  if (!author) return { title: 'Author not found' };
  return buildPageMetadata({
    title: `${author.name} — Author`,
    description: author.shortBio,
    path: `/author/${author.slug}`,
    keywords: ['fyntools author', author.name, ...author.expertise.slice(0, 4)],
  });
}

export default async function AuthorPage({ params }: Props) {
  const { slug } = await params;
  const author = getAuthor(slug);
  if (!author) notFound();
  const url = absoluteUrl(`/author/${author.slug}`);
  const authoredGuides = getGuidesByAuthor(author.slug);

  return (
    <div className="container mx-auto px-4 py-10 max-w-3xl">
      <SchemaMarkup
        data={[
          personSchema({
            name: author.name,
            url,
            description: author.shortBio,
            jobTitle: author.role,
            image: author.avatar,
            sameAs: author.sameAs,
            email: author.email,
          }),
          breadcrumbSchema([
            { name: 'Home', url: absoluteUrl('/') },
            { name: 'Authors', url: absoluteUrl('/about') },
            { name: author.name, url },
          ]),
        ]}
      />

      <nav className="text-sm text-muted-foreground mb-6 flex flex-wrap gap-2" aria-label="Breadcrumb">
        <Link href="/" className="hover:text-primary">
          Home
        </Link>
        <span>/</span>
        <Link href="/about" className="hover:text-primary">
          About
        </Link>
        <span>/</span>
        <span className="text-foreground">{author.name}</span>
      </nav>

      <header className="mb-8 flex gap-4 items-start">
        {author.avatar && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={author.avatar}
            alt=""
            width={80}
            height={80}
            className="rounded-xl border border-zinc-200 dark:border-zinc-800 object-contain bg-card"
          />
        )}
        <div>
          <h1 className="text-3xl md:text-4xl font-bold mb-2">{author.name}</h1>
          <p className="text-primary font-medium mb-2">{author.role}</p>
          <p className="text-muted-foreground">{author.shortBio}</p>
          <p className="text-sm text-muted-foreground mt-2">
            {author.experienceYears}+ years building developer utilities & technical docs
          </p>
        </div>
      </header>

      <section className="mb-10 space-y-4 text-foreground/90 leading-relaxed">
        <h2 className="text-2xl font-semibold text-foreground">About</h2>
        {author.bio.map((p) => (
          <p key={p.slice(0, 40)}>{p}</p>
        ))}
      </section>

      <section className="mb-10">
        <h2 className="text-2xl font-semibold mb-4">Credentials</h2>
        <ul className="list-disc pl-5 space-y-2 text-foreground/90">
          {author.credentials.map((c) => (
            <li key={c}>{c}</li>
          ))}
        </ul>
      </section>

      <section className="mb-10">
        <h2 className="text-2xl font-semibold mb-4">Expertise</h2>
        <ul className="flex flex-wrap gap-2 list-none p-0 m-0">
          {author.expertise.map((e) => (
            <li
              key={e}
              className="rounded-full border border-zinc-200 dark:border-zinc-800 px-3 py-1 text-sm"
            >
              {e}
            </li>
          ))}
        </ul>
      </section>

      {author.sameAs.length > 0 && (
        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4">Profiles</h2>
          <ul className="space-y-2 list-none p-0 m-0">
            {author.sameAs.map((href) => (
              <li key={href}>
                <a
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline break-all"
                >
                  {href}
                </a>
              </li>
            ))}
          </ul>
        </section>
      )}

      {authoredGuides.length > 0 && (
        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4">Guides by this author</h2>
          <ul className="space-y-3 list-none p-0 m-0">
            {authoredGuides.map((g) => (
              <li key={g.slug}>
                <Link
                  href={`/guides/${g.slug}`}
                  className="block p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:border-primary/50 transition-colors"
                >
                  <span className="font-medium text-primary">{g.title}</span>
                  <span className="block text-xs text-muted-foreground mt-1">{g.description}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      <p className="text-sm text-muted-foreground">
        <Link href="/about" className="text-primary hover:underline">
          About FYN Tools
        </Link>
        {' · '}
        <Link href="/guides" className="text-primary hover:underline">
          All guides
        </Link>
      </p>
    </div>
  );
}
