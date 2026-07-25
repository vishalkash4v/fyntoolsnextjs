import type { Metadata } from 'next';
import Link from 'next/link';
import { blogPosts } from '@/data/blogsData';
import { buildPageMetadata } from '@/lib/seo/metadata';
import { JsonLd } from '@/lib/seo/jsonld';
import { blogIndexSchema, breadcrumbSchema } from '@/lib/seo/schemas';
import { absoluteUrl } from '@/lib/seo/site';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export const metadata: Metadata = buildPageMetadata({
  title: 'FYN Tools Blog',
  description:
    'Guides, comparisons, and tips for free online tools from FYN Tools Worldwide — URL shorteners, AI writers, SEO, and more.',
  path: '/blog',
  keywords: 'fyntools blog, online tools guides, free tool reviews',
});

export default function BlogIndexPage() {
  const posts = blogPosts.map((p) => ({
    title: p.title,
    url: absoluteUrl(`/blog/${p.slug}`),
    datePublished: p.publishDate,
  }));

  return (
    <div className="container mx-auto px-4 py-12">
      <JsonLd
        data={[
          blogIndexSchema(posts),
          breadcrumbSchema([
            { name: 'Home', url: absoluteUrl('/') },
            { name: 'Blog', url: absoluteUrl('/blog') },
          ]),
        ]}
      />
      <h1 className="text-4xl font-bold mb-4 text-center">Blog</h1>
      <p className="text-center text-muted-foreground mb-10 max-w-2xl mx-auto">
        Practical guides and comparisons to help you get more from free online tools.
      </p>
      <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
        {blogPosts.map((post) => (
          <Link key={post.slug} href={`/blog/${post.slug}`}>
            <Card className="h-full hover:border-primary/40">
              <CardHeader>
                <CardTitle className="text-xl">{post.title}</CardTitle>
                <CardDescription>{post.description}</CardDescription>
              </CardHeader>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
