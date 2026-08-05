import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { buildPageMetadata } from '@/lib/seo/metadata';
import SchemaMarkup from '@/components/seo/SchemaMarkup';
import AdSenseUnit from '@/components/Ads/AdSenseUnit';
import {
  guideArticleSchema,
  personSchema,
  faqPageSchema,
} from '@/lib/seo/schemas';
import { absoluteUrl } from '@/lib/seo/site';
import { getGuide, guides } from '@/data/guides/guidesData';
import { getAuthor } from '@/data/authors';

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return guides.map((g) => ({ slug: g.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const guide = getGuide(slug);
  if (!guide) return { title: 'Guide not found' };
  return buildPageMetadata({
    title: guide.title.length > 55 ? guide.title.slice(0, 52) + '…' : guide.title,
    description: guide.metaDescription,
    path: `/guides/${guide.slug}`,
    keywords: guide.keywords,
    ogType: 'article',
    publishedTime: guide.publishedAt,
    modifiedTime: guide.updatedAt,
  });
}

export default async function GuideArticlePage({ params }: Props) {
  const { slug } = await params;
  const guide = getGuide(slug);
  if (!guide) notFound();
  const author = getAuthor(guide.authorSlug);
  const url = absoluteUrl(`/guides/${guide.slug}`);
  const authorUrl = absoluteUrl(`/author/${guide.authorSlug}`);

  const schemas = [
    ...guideArticleSchema({
      headline: guide.title,
      description: guide.metaDescription,
      url,
      datePublished: guide.publishedAt,
      dateModified: guide.updatedAt,
      keywords: guide.keywords,
      authorName: author?.name || 'FYN Tools Editorial',
      authorUrl,
    }),
    author
      ? personSchema({
          name: author.name,
          url: authorUrl,
          description: author.shortBio,
          jobTitle: author.role,
          image: author.avatar,
          sameAs: author.sameAs,
        })
      : null,
    guide.faqs?.length ? faqPageSchema(guide.faqs) : null,
  ].filter(Boolean) as object[];

  return (
    <article className="container mx-auto px-4 py-10 max-w-3xl">
      <SchemaMarkup data={schemas} />

      <nav className="text-sm text-muted-foreground mb-6 flex flex-wrap gap-2" aria-label="Breadcrumb">
        <Link href="/" className="hover:text-primary">
          Home
        </Link>
        <span>/</span>
        <Link href="/guides" className="hover:text-primary">
          Guides
        </Link>
        <span>/</span>
        <span className="text-foreground line-clamp-1">{guide.title}</span>
      </nav>

      <header className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 leading-tight">{guide.title}</h1>
        <p className="text-muted-foreground mb-3">{guide.description}</p>
        <p className="text-sm text-muted-foreground">
          By{' '}
          <Link href={`/author/${guide.authorSlug}`} className="text-primary hover:underline">
            {author?.name ?? 'FYN Tools Editorial'}
          </Link>
          {' · '}
          Published {guide.publishedAt}
          {guide.updatedAt !== guide.publishedAt ? ` · Updated ${guide.updatedAt}` : ''}
        </p>
      </header>

      <div className="space-y-4 text-foreground/90 leading-relaxed mb-10">
        {guide.intro.map((p) => (
          <p key={p.slice(0, 40)}>{p}</p>
        ))}
      </div>

      {guide.sections.map((section) => (
        <section key={section.heading} className="mb-10">
          <h2 className="text-2xl font-semibold mb-4">{section.heading}</h2>
          <div className="space-y-4 text-foreground/90 leading-relaxed">
            {section.paragraphs.map((p) => (
              <p key={p.slice(0, 40)}>{p}</p>
            ))}
          </div>
          {section.bullets && section.bullets.length > 0 && (
            <ul className="mt-4 list-disc pl-5 space-y-2 text-foreground/90">
              {section.bullets.map((b) => (
                <li key={b}>{b}</li>
              ))}
            </ul>
          )}
        </section>
      ))}

      <section className="mb-10 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-card p-6">
        <h2 className="text-xl font-semibold mb-4">Try the related tools</h2>
        <ul className="grid sm:grid-cols-2 gap-3 list-none p-0 m-0">
          {guide.relatedTools.map((t) => (
            <li key={t.href}>
              <Link
                href={t.href}
                className="block p-4 rounded-lg border border-zinc-200 dark:border-zinc-800 hover:border-primary/50 transition-colors"
              >
                <span className="font-medium text-primary">{t.name}</span>
                {t.description && (
                  <span className="block text-xs text-muted-foreground mt-1">{t.description}</span>
                )}
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {guide.faqs && guide.faqs.length > 0 && (
        <section className="mb-10" aria-labelledby="guide-faq-heading">
          <h2 id="guide-faq-heading" className="text-2xl font-semibold mb-4">
            Frequently asked questions
          </h2>
          <div className="space-y-5">
            {guide.faqs.map((f) => (
              <div key={f.question}>
                <h3 className="font-medium text-foreground mb-1">{f.question}</h3>
                <p className="text-foreground/90 leading-relaxed">{f.answer}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      <p className="text-foreground/90 leading-relaxed mb-10">{guide.conclusion}</p>

      <AdSenseUnit className="mb-10" />

      <p className="text-sm text-muted-foreground">
        <Link href="/guides" className="text-primary hover:underline">
          ← All guides
        </Link>
      </p>
    </article>
  );
}
