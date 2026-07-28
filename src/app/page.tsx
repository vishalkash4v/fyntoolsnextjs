import Link from 'next/link';
import type { Metadata } from 'next';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { allTools } from '@/data/toolsData';
import { CATEGORY_HUBS } from '@/data/categoriesData';
import { blogPosts } from '@/data/blogsData';
import { buildPageMetadata } from '@/lib/seo/metadata';
import { JsonLd } from '@/lib/seo/jsonld';
import { absoluteUrl } from '@/lib/seo/site';
import {
  websiteSchema,
  organizationSchema,
  itemListSchema,
} from '@/lib/seo/schemas';
import { ArrowRight, Award, CheckCircle, Sparkles, TrendingUp, Users, Zap, Shield, Globe } from 'lucide-react';

export const metadata: Metadata = buildPageMetadata({
  title: 'FYN Tools Worldwide - 90+ Free Professional Online Tools',
  description:
    'Access 90+ free professional online tools instantly. Calculators, text tools, image editors, converters, generators, and developer utilities. Secure, fast, and no registration required.',
  path: '/',
  keywords:
    'free online tools, calculators, text tools, image tools, developer tools, converters, QR code, BMI calculator, JSON formatter',
});

const featuredIds = [
  'timestamp-converter',
  'word-counter',
  'image-compressor',
  'qr-code-generator',
  'json-formatter',
  'password-generator',
];
const popularIds = [
  'image-resizer',
  'bmi-calculator',
  'typing-test',
  'html-formatter',
  'percentage-calculator',
  'hash-generator',
  'pdf-text-extractor',
  'url-encode-decode',
];

export default function HomePage() {
  const featured = featuredIds.map((id) => allTools.find((t) => t.id === id)).filter(Boolean);
  const popular = popularIds.map((id) => allTools.find((t) => t.id === id)).filter(Boolean);
  const latestBlogs = blogPosts.slice(0, 4);

  const featuredList = featured
    .filter(Boolean)
    .map((t) => ({ name: t!.name, url: absoluteUrl(t!.path) }));

  return (
    <>
      <JsonLd
        data={[
          websiteSchema(),
          organizationSchema(),
          itemListSchema('Featured FYN Tools', featuredList),
          itemListSchema(
            'Tool Categories',
            CATEGORY_HUBS.map((h) => ({ name: h.name, url: absoluteUrl(h.path) }))
          ),
        ]}
      />
      <section className="relative py-16 md:py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-secondary/5 to-primary/5" />
        <div className="container mx-auto px-4 relative text-center max-w-5xl">
          <Badge variant="secondary" className="mb-4">
            <Sparkles className="h-4 w-4 mr-2 inline" />
            90+ Useful Tools Available
          </Badge>
          <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight [content-visibility:visible]">
            Professional Online Tools for Everyone
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-3xl mx-auto leading-relaxed">
            Free, secure, and instant tools for developers, businesses, and individuals. No registration
            required — works in your browser.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Button asChild size="lg">
              <Link href="/tools">
                Explore All Tools <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/about">About Us</Link>
            </Button>
          </div>
          <div
            className="grid grid-cols-2 md:grid-cols-4 gap-4"
            style={{ contentVisibility: 'auto', containIntrinsicSize: '0 140px' }}
          >
            {[
              { n: '90+', l: 'Useful Tools', Icon: Award },
              { n: '100K+', l: 'Happy Users', Icon: Users },
              { n: '1M+', l: 'Tasks Done', Icon: TrendingUp },
              { n: '99.9%', l: 'Uptime', Icon: CheckCircle },
            ].map((s) => (
              <Card key={s.l} className="text-center">
                <CardContent className="p-6">
                  <s.Icon className="h-8 w-8 text-primary mx-auto mb-2" />
                  <div className="text-2xl font-bold">{s.n}</div>
                  <div className="text-sm text-muted-foreground">{s.l}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section
        className="py-16 bg-muted/20"
        style={{ contentVisibility: 'auto', containIntrinsicSize: '0 600px' }}
      >
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-4">Browse by Category</h2>
          <p className="text-center text-muted-foreground mb-10">
            Indexable hubs for image, text, developer, SEO, finance, and more
          </p>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {CATEGORY_HUBS.map((hub) => (
              <Link key={hub.path} href={hub.path}>
                <Card className="h-full hover:border-primary/40 transition-colors">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">{hub.name}</CardTitle>
                    <CardDescription className="line-clamp-2 text-sm">{hub.metaDescription}</CardDescription>
                  </CardHeader>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-10">Featured Tools</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featured.map((tool) =>
              tool ? (
                <Link key={tool.id} href={tool.path}>
                  <Card className="h-full hover:shadow-md transition-shadow">
                    <CardHeader>
                      <div className="flex items-center gap-3 mb-2">
                        <div className="p-3 rounded-xl bg-gradient-to-br from-primary to-secondary">
                          <tool.icon className="h-6 w-6 text-white" />
                        </div>
                        <Badge variant="secondary">{tool.category.split(' ')[0]}</Badge>
                      </div>
                      <CardTitle>{tool.name}</CardTitle>
                      <CardDescription>{tool.description}</CardDescription>
                    </CardHeader>
                  </Card>
                </Link>
              ) : null
            )}
          </div>
        </div>
      </section>

      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-8">Popular Tools</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-3">
            {popular.map((tool) =>
              tool ? (
                <Link
                  key={tool.id}
                  href={tool.path}
                  className="flex items-center gap-2 p-3 rounded-lg bg-background border hover:border-primary/40"
                >
                  <tool.icon className="h-4 w-4 text-primary shrink-0" />
                  {tool.name}
                </Link>
              ) : null
            )}
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-10">Why FYN Tools?</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { Icon: Zap, t: 'Lightning Fast', d: 'Instant results in your browser' },
              { Icon: Shield, t: 'Private', d: 'Data stays on-device when possible' },
              { Icon: Globe, t: 'Always Available', d: 'No installs or sign-up walls' },
              { Icon: Users, t: 'For Everyone', d: 'Clean UX for students and pros' },
            ].map((f) => (
              <Card key={f.t} className="text-center">
                <CardHeader>
                  <f.Icon className="h-8 w-8 text-primary mx-auto mb-2" />
                  <CardTitle className="text-xl">{f.t}</CardTitle>
                  <CardDescription>{f.d}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {latestBlogs.length > 0 && (
        <section className="py-16 bg-muted/20">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-8">Latest Blogs</h2>
            <div className="grid md:grid-cols-2 gap-6">
              {latestBlogs.map((b) => (
                <Link key={b.slug} href={`/blog/${b.slug}`}>
                  <Card className="h-full">
                    <CardHeader>
                      <CardTitle className="text-xl">{b.title}</CardTitle>
                      <CardDescription>{b.description}</CardDescription>
                    </CardHeader>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
