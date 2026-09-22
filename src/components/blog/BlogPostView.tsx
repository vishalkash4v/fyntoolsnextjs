import Link from 'next/link';
import { Calendar, Clock, Tag } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import type { PublicBlogPost, RelatedBlogPost } from '@/lib/blog/api';
import { resolveBlogImageUrl } from '@/lib/blog/api';
import { demoteContentH1ToH2, fixExternalLinks } from '@/lib/content/fixExternalLinks';

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

function relatedToolsForSlug(slug: string) {
  if (slug.includes('url-shortener') || slug.includes('bitly')) {
    return [
      { name: 'URL Shortener', href: '/url-shortener' },
      { name: 'URL Slug Generator', href: '/url-slug-generator' },
      { name: 'SEO Tools', href: '/seo-tools' },
    ];
  }
  if (slug.includes('ai-rewriter')) {
    return [
      { name: 'AI Text Rewriter', href: '/ai-text-rewriter' },
      { name: 'Word Counter', href: '/word-counter' },
      { name: 'Text Tools', href: '/text-tools' },
    ];
  }
  if (slug.includes('nodejs') || slug.includes('go-lang') || slug.includes('iphone-67w')) {
    return [
      { name: 'JSON Formatter', href: '/json-formatter' },
      { name: 'Developer Tools', href: '/developer-tools' },
      { name: 'Hash Generator', href: '/hash-generator' },
    ];
  }
  return [
    { name: 'All Tools', href: '/tools' },
    { name: 'Developer Tools', href: '/developer-tools' },
    { name: 'Word Counter', href: '/word-counter' },
  ];
}

function relatedGuidesForSlug(slug: string): { name: string; href: string }[] {
  if (slug.includes('nodejs')) {
    return [
      {
        name: 'Go language project setup guide',
        href: '/blog/go-lang-project-setup-2026-guide',
      },
      {
        name: 'Is a 67W charger safe for iPhone?',
        href: '/blog/iphone-67w-charger-safe-for-iphone-2026-guide',
      },
    ];
  }
  if (slug.includes('go-lang')) {
    return [
      {
        name: 'Setting up a Node.js project',
        href: '/blog/setting-up-nodejs-project-step-by-step-guide',
      },
      {
        name: 'Is a 67W charger safe for iPhone?',
        href: '/blog/iphone-67w-charger-safe-for-iphone-2026-guide',
      },
    ];
  }
  if (slug.includes('iphone-67w')) {
    return [
      {
        name: 'Setting up a Node.js project',
        href: '/blog/setting-up-nodejs-project-step-by-step-guide',
      },
      {
        name: 'Go language project setup guide',
        href: '/blog/go-lang-project-setup-2026-guide',
      },
    ];
  }
  return [];
}

type Props = {
  post: PublicBlogPost;
  relatedBlogs: RelatedBlogPost[];
};

export default function BlogPostView({ post, relatedBlogs }: Props) {
  const imageUrl = resolveBlogImageUrl(post.featuredImage);
  const authorName = post.author?.name || post.author?.email || 'FYN Tools';
  const relatedTools = relatedToolsForSlug(post.slug);
  const relatedGuides = relatedGuidesForSlug(post.slug);
  const bodyHtml = demoteContentH1ToH2(fixExternalLinks(post.content || post.excerpt));

  return (
    <article className="container mx-auto px-4 py-12 max-w-4xl">

      <nav className="text-sm text-muted-foreground mb-6" aria-label="Breadcrumb">
        <Link href="/" className="hover:text-primary">Home</Link>
        <span className="mx-2">/</span>
        <Link href="/blog" className="hover:text-primary">Blog</Link>
        <span className="mx-2">/</span>
        <span className="text-foreground line-clamp-1">{post.title}</span>
      </nav>

      <Badge className="mb-4">{post.category}</Badge>
      <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 leading-tight">{post.title}</h1>

      <div className="flex items-center gap-6 text-muted-foreground mb-6 flex-wrap text-sm">
        <span className="flex items-center gap-2">
          <Calendar className="h-4 w-4" />
          <time dateTime={post.publishDate}>{formatDate(post.publishDate)}</time>
        </span>
        {post.readingTime ? (
          <span className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            {post.readingTime} min read
          </span>
        ) : null}
        {post.viewCount ? <span>{post.viewCount} views</span> : null}
      </div>

      {imageUrl ? (
        <img
          src={imageUrl}
          alt={post.title}
          className="w-full rounded-lg object-cover mb-8 max-h-[420px]"
          loading="eager"
        />
      ) : null}

      {post.tags?.length ? (
        <div className="flex flex-wrap gap-2 mb-8">
          {post.tags.map((tag) => (
            <Badge key={tag} variant="outline" className="text-xs">
              <Tag className="h-3 w-3 mr-1" />
              {tag}
            </Badge>
          ))}
        </div>
      ) : null}

      <div
        className="prose prose-lg dark:prose-invert max-w-none blog-content mb-12"
        dangerouslySetInnerHTML={{ __html: bodyHtml }}
      />

      {post.faqs && post.faqs.length > 0 && (
        <section className="mb-12" aria-labelledby="blog-faq-heading">
          <h2 id="blog-faq-heading" className="text-xl font-bold mb-4">
            Frequently asked questions
          </h2>
          <div className="space-y-5">
            {post.faqs.map((f) => (
              <div key={f.question}>
                <h3 className="font-medium text-foreground mb-1">{f.question}</h3>
                <p className="text-muted-foreground leading-relaxed">{f.answer}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      <aside className="border-t pt-8 mb-12">
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
        {relatedGuides.length > 0 ? (
          <div className="mt-6">
            <h2 className="text-xl font-bold mb-3">Related guides</h2>
            <ul className="space-y-2">
              {relatedGuides.map((g) => (
                <li key={g.href}>
                  <Link href={g.href} className="text-primary hover:underline font-medium">
                    {g.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </aside>

      {relatedBlogs.length > 0 && (
        <aside className="border-t pt-8">
          <h2 className="text-2xl font-bold mb-6">Related Articles</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {relatedBlogs.map((related) => {
              const relatedImage = resolveBlogImageUrl(related.featuredImage);
              return (
                <Link
                  key={related._id}
                  href={`/blog/${related.slug}`}
                  className="block p-4 rounded-lg border hover:border-primary hover:bg-muted/50 transition-colors"
                >
                  {relatedImage ? (
                    <img
                      src={relatedImage}
                      alt={related.title}
                      className="w-full h-32 object-cover rounded mb-2"
                      loading="lazy"
                    />
                  ) : null}
                  <h3 className="font-semibold mb-2 line-clamp-2">{related.title}</h3>
                  <p className="text-sm text-muted-foreground line-clamp-2">{related.excerpt}</p>
                </Link>
              );
            })}
          </div>
        </aside>
      )}
    </article>
  );
}
