import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { blogPosts } from '@/data/blogsData';
import { buildPageMetadata } from '@/lib/seo/metadata';
import { JsonLd } from '@/lib/seo/jsonld';
import { articleSchema } from '@/lib/seo/schemas';
import { absoluteUrl } from '@/lib/seo/site';
import { Badge } from '@/components/ui/badge';

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return blogPosts.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = blogPosts.find((p) => p.slug === slug);
  if (!post) return { title: { absolute: 'Not Found | FYN Tools Worldwide' } };
  return buildPageMetadata({
    title: post.metaTitle || post.title,
    description: post.metaDescription || post.description,
    path: `/blog/${post.slug}`,
    keywords: post.keywords || post.tags,
    ogType: 'article',
    publishedTime: post.publishDate,
    modifiedTime: post.publishDate,
    authors: [post.author || 'FYN Tools Worldwide'],
    ogImageAlt: post.title,
  });
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = blogPosts.find((p) => p.slug === slug);
  if (!post) notFound();

  const url = absoluteUrl(`/blog/${post.slug}`);
  const schemas = articleSchema({
    headline: post.title,
    description: post.description,
    url,
    datePublished: post.publishDate,
    dateModified: post.publishDate,
    author: post.author || 'FYN Tools Worldwide',
    image: post.imageUrl ? absoluteUrl(post.imageUrl) : undefined,
    keywords: post.keywords?.length
      ? post.keywords
      : post.tags?.length
        ? post.tags
        : undefined,
  });

  const relatedTools =
    slug.includes('url-shortener')
      ? [
          { name: 'URL Shortener', href: '/url-shortener' },
          { name: 'URL Encode Decode', href: '/url-encode-decode' },
          { name: 'SEO Tools', href: '/seo-tools' },
        ]
      : slug.includes('ai-rewriter')
        ? [
            { name: 'AI Text Rewriter', href: '/ai-text-rewriter' },
            { name: 'Word Counter', href: '/word-counter' },
            { name: 'Text Tools', href: '/text-tools' },
          ]
        : [
            { name: 'All Tools', href: '/tools' },
            { name: 'Developer Tools', href: '/developer-tools' },
            { name: 'Word Counter', href: '/word-counter' },
          ];

  return (
    <article className="container mx-auto px-4 py-12 max-w-3xl">
      <JsonLd data={schemas} />
      <nav className="text-sm text-muted-foreground mb-6" aria-label="Breadcrumb">
        <Link href="/" className="hover:text-primary">
          Home
        </Link>
        <span className="mx-2">/</span>
        <Link href="/blog" className="hover:text-primary">
          Blog
        </Link>
        <span className="mx-2">/</span>
        <span className="text-foreground line-clamp-1">{post.title}</span>
      </nav>
      <Badge className="mb-4">{post.category}</Badge>
      <h1 className="text-3xl md:text-4xl font-bold mb-4">{post.title}</h1>
      <p className="text-muted-foreground mb-8">
        <span itemProp="author">{post.author}</span> ·{' '}
        <time dateTime={post.publishDate}>{post.publishDate}</time>
      </p>
      <div
        className="prose dark:prose-invert max-w-none mb-12"
        dangerouslySetInnerHTML={{ __html: post.content }}
      />
      <aside className="border-t pt-8">
        <h2 className="text-xl font-bold mb-4">Related Tools</h2>
        <div className="flex flex-wrap gap-2">
          {relatedTools.map((t) => (
            <Link
              key={t.href}
              href={t.href}
              className="px-3 py-1.5 rounded-full bg-muted hover:bg-primary/10 text-sm font-medium"
            >
              {t.name}
            </Link>
          ))}
        </div>
      </aside>
    </article>
  );
}
