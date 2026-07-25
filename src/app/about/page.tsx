import type { Metadata } from 'next';
import Link from 'next/link';
import { buildPageMetadata } from '@/lib/seo/metadata';
import { JsonLd } from '@/lib/seo/jsonld';
import { aboutPageSchema, breadcrumbSchema, organizationSchema } from '@/lib/seo/schemas';
import { absoluteUrl } from '@/lib/seo/site';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export const metadata: Metadata = buildPageMetadata({
  title: 'About FYN Tools Worldwide',
  description:
    'Learn about FYN Tools Worldwide — free, secure, browser-based tools for developers, students, and professionals. Our mission is accessible utilities without signup walls.',
  path: '/about',
  keywords: 'about fyntools, free online tools, mission, browser tools',
});

export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <JsonLd
        data={[
          aboutPageSchema(),
          organizationSchema(),
          breadcrumbSchema([
            { name: 'Home', url: absoluteUrl('/') },
            { name: 'About', url: absoluteUrl('/about') },
          ]),
        ]}
      />
      <h1 className="text-4xl font-bold mb-4 text-center bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
        About FYN Tools Worldwide
      </h1>
      <p className="text-xl text-muted-foreground text-center mb-12">
        Making powerful tools accessible to everyone, everywhere.
      </p>
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Our Story</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-lg leading-relaxed text-muted-foreground">
          <p>
            FYN Tools Worldwide publishes free browser-based utilities spanning{' '}
            <Link href="/image-tools" className="text-primary hover:underline">
              image tools
            </Link>
            ,{' '}
            <Link href="/text-tools" className="text-primary hover:underline">
              text tools
            </Link>
            ,{' '}
            <Link href="/developer-tools" className="text-primary hover:underline">
              developer tools
            </Link>
            ,{' '}
            <Link href="/seo-tools" className="text-primary hover:underline">
              SEO tools
            </Link>
            , and more. Each tool page includes unique documentation, FAQs, how-to guides, and related
            links so you can finish work faster.
          </p>
          <p>
            Popular destinations include{' '}
            <Link href="/word-counter" className="text-primary hover:underline">
              Word Counter
            </Link>
            ,{' '}
            <Link href="/image-resizer" className="text-primary hover:underline">
              Image Resizer
            </Link>
            ,{' '}
            <Link href="/json-formatter" className="text-primary hover:underline">
              JSON Formatter
            </Link>
            , and{' '}
            <Link href="/bmi-calculator" className="text-primary hover:underline">
              BMI Calculator
            </Link>
            .
          </p>
          <p>
            Privacy matters: whenever architecture allows, processing stays in your browser. Read our{' '}
            <Link href="/blog" className="text-primary hover:underline">
              blog
            </Link>{' '}
            or{' '}
            <Link href="/contact" className="text-primary hover:underline">
              contact us
            </Link>
            .
          </p>
        </CardContent>
      </Card>
      <div className="flex justify-center gap-4">
        <Button asChild>
          <Link href="/tools">Browse All Tools</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/contact">Contact</Link>
        </Button>
      </div>
    </div>
  );
}
