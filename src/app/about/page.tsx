import type { Metadata } from 'next';
import Link from 'next/link';
import { buildPageMetadata } from '@/lib/seo/metadata';
import SchemaMarkup from '@/components/seo/SchemaMarkup';
import { aboutPageSchema, breadcrumbSchema, organizationSchema } from '@/lib/seo/schemas';
import { absoluteUrl } from '@/lib/seo/site';
import { PRIMARY_AUTHOR_SLUG } from '@/data/authors';
import { Button } from '@/components/ui/button';

export const metadata: Metadata = buildPageMetadata({
  title: 'About FYN Tools — Mission, Standards & Privacy',
  description:
    'Learn about FYN Tools Worldwide: our mission for free browser utilities, editorial standards for Guides, privacy commitment, and the team behind fyntools.com.',
  path: '/about',
  keywords: 'about fyntools, editorial standards, privacy, free online tools mission',
});

export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-3xl">
      <SchemaMarkup
        data={[
          aboutPageSchema(),
          organizationSchema(),
          breadcrumbSchema([
            { name: 'Home', url: absoluteUrl('/') },
            { name: 'About', url: absoluteUrl('/about') },
          ]),
        ]}
      />

      <header className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">About FYN Tools Worldwide</h1>
        <p className="text-xl text-muted-foreground">
          Free, honest browser utilities—and guides that teach the concepts behind them.
        </p>
      </header>

      <section className="mb-10 space-y-4 text-foreground/90 leading-relaxed">
        <h2 className="text-2xl font-semibold text-foreground">Our mission</h2>
        <p>
          FYN Tools exists so students, developers, and marketers can run everyday utilities—formatters,
          calculators, generators, shorteners—without signup walls or opaque desktop installs. We favor
          client-side processing whenever the job allows, and we document limitations instead of marketing
          fiction.
        </p>
        <p>
          The site is evolving into a hub-and-spoke library: interactive tools at the center, and{' '}
          <Link href="/guides" className="text-primary hover:underline">
            Guides
          </Link>{' '}
          that explain URL hygiene, JSON debugging, password practice, QR print design, and privacy so
          visitors leave smarter—not just with a one-off result.
        </p>
      </section>

      <section className="mb-10 space-y-4 text-foreground/90 leading-relaxed">
        <h2 className="text-2xl font-semibold text-foreground">Editorial standards</h2>
        <ul className="list-disc pl-5 space-y-2">
          <li>Unique examples and how-to steps per page—no spun filler paragraphs.</li>
          <li>Clear authorship via our{' '}
            <Link href={`/author/${PRIMARY_AUTHOR_SLUG}`} className="text-primary hover:underline">
              editorial profile
            </Link>
            , with credentials and contact paths.</li>
          <li>Structured data (Organization, HowTo, FAQ, Article) that matches visible content.</li>
          <li>Corrections when tools or APIs change—we date guide updates in the sitemap.</li>
        </ul>
      </section>

      <section className="mb-10 space-y-4 text-foreground/90 leading-relaxed">
        <h2 className="text-2xl font-semibold text-foreground">Privacy & security commitment</h2>
        <p>
          Prefer tools that transform data in your browser. Do not paste production secrets, customer PII,
          or live API keys into any free online form—including ours—unless you understand the processing
          model. Short links and shared destinations should be treated as public. We block abusive shortener
          traffic when we detect it.
        </p>
        <p>
          Advertising (when enabled) uses reserved layouts to avoid layout shift. Ads never appear above
          the interactive tool panel.
        </p>
      </section>

      <section className="mb-10 space-y-4 text-foreground/90 leading-relaxed">
        <h2 className="text-2xl font-semibold text-foreground">Trust for readers & partners</h2>
        <p>
          We publish an About page, author identity, contact channel (
          <Link href="/contact" className="text-primary hover:underline">
            Contact
          </Link>
          ), and transparent tool limitations so quality raters and partners can evaluate who runs
          fyntools.com. Support: support@fyntools.com.
        </p>
      </section>

      <div className="flex flex-wrap gap-3 justify-center">
        <Button asChild>
          <Link href="/tools">Browse tools</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/guides">Read guides</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href={`/author/${PRIMARY_AUTHOR_SLUG}`}>Meet the editorial team</Link>
        </Button>
      </div>
    </div>
  );
}
