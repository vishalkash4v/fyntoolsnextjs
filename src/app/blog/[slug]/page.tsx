import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { buildPageMetadata } from '@/lib/seo/metadata';
import { JsonLd } from '@/lib/seo/jsonld';
import { articleSchema, faqPageSchema } from '@/lib/seo/schemas';
import { absoluteUrl } from '@/lib/seo/site';
import {
  fetchAllBlogSlugs,
  fetchPublicBlogBySlug,
  fetchRelatedBlogs,
  normalizeBlogKeywords,
  resolveBlogImageUrl,
} from '@/lib/blog/api';
import BlogPostView from '@/components/blog/BlogPostView';
import BlogViewTracker from '@/components/blog/BlogViewTracker';

type Props = { params: Promise<{ slug: string }> };

export const revalidate = 60;
export const dynamicParams = true;

export async function generateStaticParams() {
  try {
    const slugs = await fetchAllBlogSlugs();
    return slugs.map((p) => ({ slug: p.slug }));
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await fetchPublicBlogBySlug(slug);
  if (!post) return { title: { absolute: 'Not Found | FYN Tools Worldwide' } };

  const ogImage = resolveBlogImageUrl(post.ogImage || post.featuredImage);

  return buildPageMetadata({
    title: post.metaTitle || post.title,
    description: post.metaDescription || post.excerpt,
    path: `/blog/${post.slug}`,
    keywords: normalizeBlogKeywords(post.keywords, post.tags),
    ogType: 'article',
    publishedTime: post.publishDate,
    modifiedTime: post.updatedAt || post.publishDate,
    authors: [post.author?.name || post.author?.email || 'FYN Tools Worldwide'],
    ogImageAlt: post.title,
    ...(ogImage ? { ogImage: absoluteUrl(ogImage) } : {}),
    ...(post.noIndex ? { noIndex: true } : {}),
  });
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const [post, relatedBlogs] = await Promise.all([
    fetchPublicBlogBySlug(slug),
    fetchRelatedBlogs(slug, 3),
  ]);

  if (!post) notFound();

  const url = absoluteUrl(`/blog/${post.slug}`);
  const image = resolveBlogImageUrl(post.ogImage || post.featuredImage);
  const faqSchema = post.faqs?.length ? faqPageSchema(post.faqs) : null;
  const schemas = [
    ...articleSchema({
      headline: post.title,
      description: post.metaDescription || post.excerpt,
      url,
      datePublished: post.publishDate,
      dateModified: post.updatedAt || post.publishDate,
      author: post.author?.name || post.author?.email || 'FYN Tools Worldwide',
      image: image ? absoluteUrl(image) : undefined,
      keywords: normalizeBlogKeywords(post.keywords, post.tags),
    }),
    ...(faqSchema ? [faqSchema] : []),
  ];

  return (
    <>
      <JsonLd data={schemas} />
      <BlogViewTracker blogId={post._id} slug={post.slug} title={post.title} />
      <BlogPostView post={post} relatedBlogs={relatedBlogs} />
    </>
  );
}
