import Link from 'next/link';
import { Calendar, Clock, Tag } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import type { PublicBlogPost, RelatedBlogPost } from '@/lib/blog/api';
import { resolveBlogImageUrl } from '@/lib/blog/api';

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

function relatedToolsForSlug(slug: string) {
  if (slug.includes('url-shortener')) {
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
  return [
    { name: 'All Tools', href: '/tools' },
    { name: 'Developer Tools', href: '/developer-tools' },
    { name: 'Word Counter', href: '/word-counter' },
  ];
}

type Props = {
  post: PublicBlogPost;
  relatedBlogs: RelatedBlogPost[];
};

export default function BlogPostView({ post, relatedBlogs }: Props) {
  const imageUrl = resolveBlogImageUrl(post.featuredImage);
  const authorName = post.author?.name || post.author?.email || 'FYN Tools';
  const relatedTools = relatedToolsForSlug(post.slug);

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
        dangerouslySetInnerHTML={{ __html: post.content || post.excerpt }}
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
