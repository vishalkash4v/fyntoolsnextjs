import type { Metadata } from 'next';
import { buildPageMetadata } from '@/lib/seo/metadata';
import { JsonLd } from '@/lib/seo/jsonld';
import { blogIndexSchema, breadcrumbSchema } from '@/lib/seo/schemas';
import { absoluteUrl } from '@/lib/seo/site';
import { fetchBlogCategories, fetchPublicBlogs } from '@/lib/blog/api';
import BlogIndexClient from '@/components/blog/BlogIndexClient';

export const revalidate = 60;

export const metadata: Metadata = buildPageMetadata({
  title: 'FYN Tools Blog',
  description:
    'Guides, comparisons, and tips for free online tools from FYN Tools Worldwide — URL shorteners, AI writers, SEO, and more.',
  path: '/blog',
  keywords: 'fyntools blog, online tools guides, free tool reviews',
});

export default async function BlogIndexPage() {
  const [{ posts }, categories] = await Promise.all([
    fetchPublicBlogs({ limit: 50 }),
    fetchBlogCategories(),
  ]);

  const schemaPosts = posts.map((p) => ({
    title: p.title,
    url: absoluteUrl(`/blog/${p.slug}`),
    datePublished: p.publishDate,
  }));

  return (
    <div className="container mx-auto px-4 py-12">
      <JsonLd
        data={[
          blogIndexSchema(schemaPosts),
          breadcrumbSchema([
            { name: 'Home', url: absoluteUrl('/') },
            { name: 'Blog', url: absoluteUrl('/blog') },
          ]),
        ]}
      />
      <h1 className="text-4xl font-bold mb-4 text-center">Technology Blog &amp; Guides</h1>
      <p className="text-center text-muted-foreground mb-10 max-w-2xl mx-auto">
        Expert articles, tutorials, and guides on web development, programming, and technology tools.
      </p>
      <BlogIndexClient initialPosts={posts} categories={categories} />
    </div>
  );
}
