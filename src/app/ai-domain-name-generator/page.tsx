import type { Metadata } from 'next';
import Link from 'next/link';
import { buildPageMetadata } from '@/lib/seo/metadata';
import SchemaMarkup from '@/components/seo/SchemaMarkup';
import {
  breadcrumbSchema,
  organizationSchema,
} from '@/lib/seo/schemas';
import { absoluteUrl } from '@/lib/seo/site';
import NamezivoAdBanner from '@/components/Ads/NamezivoAdBanner';

const PATH = '/ai-domain-name-generator';
const NAMEZIVO = 'https://namezivo.com/?utm_source=fyntools&utm_medium=referral&utm_campaign=seo_promo';

export const metadata: Metadata = buildPageMetadata({
  title: 'AI Domain Name Generator — Find Available Brand Names',
  description:
    'Stuck naming your business because great domains are already taken? Learn how an AI domain name generator and availability checker helps you find brandable, available names fast — featuring Namezivo.',
  path: PATH,
  keywords: [
    'AI domain name generator',
    'domain availability checker',
    'brand name generator',
    'startup name ideas',
    'find available domain',
    'Namezivo',
  ],
});

const faqs = [
  {
    question: 'Why are so many brand names already registered?',
    answer:
      'Popular keywords, short dictionary words, and common brand patterns have been registered for decades. An AI name generator explores less-obvious but still brandable combinations, then checks which ones are still available to register.',
  },
  {
    question: 'What is an AI domain name generator?',
    answer:
      'It turns a short description of your business or keywords into candidate brand names and domains, often across extensions like .com, .io, .ai, and .co, then highlights which ones appear available.',
  },
  {
    question: 'How is Namezivo different from guessing names yourself?',
    answer:
      'Namezivo combines AI suggestions with bulk availability checks (up to hundreds of domains at once), so you spend less time opening registrar tabs for names that are already taken.',
  },
  {
    question: 'Does FYN Tools register domains?',
    answer:
      'No. FYN Tools is a free utilities site. For domain search and availability we recommend Namezivo as a partner tool. You complete any purchase on Namezivo or your preferred registrar.',
  },
];

export default function AiDomainNameGeneratorPromoPage() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: 'AI Domain Name Generator & Availability Checker',
    description:
      'Guide to finding available brand and domain names when most good names are already taken, with a recommendation for Namezivo.',
    url: absoluteUrl(PATH),
    isPartOf: { '@type': 'WebSite', name: 'FYN Tools', url: absoluteUrl('/') },
    mainEntity: {
      '@type': 'FAQPage',
      mainEntity: faqs.map((f) => ({
        '@type': 'Question',
        name: f.question,
        acceptedAnswer: { '@type': 'Answer', text: f.answer },
      })),
    },
  };

  return (
    <div className="container mx-auto px-4 py-10 sm:py-12 max-w-3xl">
      <SchemaMarkup
        data={[
          schema,
          organizationSchema(),
          breadcrumbSchema([
            { name: 'Home', url: absoluteUrl('/') },
            { name: 'AI Domain Name Generator', url: absoluteUrl(PATH) },
          ]),
        ]}
      />

      <nav className="text-sm text-muted-foreground mb-6" aria-label="Breadcrumb">
        <Link href="/" className="hover:text-primary">
          Home
        </Link>
        <span className="mx-2">/</span>
        <span className="text-foreground">AI Domain Name Generator</span>
      </nav>

      <header className="mb-8">
        <p className="text-sm font-medium text-muted-foreground mb-2">Partner guide</p>
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
          AI Domain Name Generator & Availability Checker
        </h1>
        <p className="text-lg text-muted-foreground leading-relaxed">
          Find the perfect domain name instantly. Enter your business idea or keywords — and stop
          wasting hours on names that are already registered.
        </p>
      </header>

      <div className="mb-10">
        <NamezivoAdBanner
          sourcePath={PATH}
          placement="promo_page"
          variant="full"
        />
      </div>

      <article className="prose prose-zinc dark:prose-invert max-w-none space-y-8">
        <section className="space-y-3 text-foreground/90 leading-relaxed">
          <h2 className="text-2xl font-semibold text-foreground">
            When every good name seems taken
          </h2>
          <p>
            If you are looking for the best brand name for your business and feel stuck — or you
            keep discovering that the strongest options are already registered and unavailable —
            you are not alone. Founders, agencies, and side-project builders hit the same wall:
            memorable short names are scarce, and checking them one-by-one is slow.
          </p>
          <p>
            That is where an{' '}
            <a
              href={NAMEZIVO}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary font-medium hover:underline"
            >
              AI domain name generator and availability checker like Namezivo
            </a>{' '}
            helps. Describe your idea (for example, “fitness app”), get brandable suggestions, and
            verify availability across popular extensions in one flow.
          </p>
        </section>

        <section className="space-y-3 text-foreground/90 leading-relaxed">
          <h2 className="text-2xl font-semibold text-foreground">What Namezivo is good for</h2>
          <ul className="list-disc pl-5 space-y-2">
            <li>
              <strong>AI suggestions</strong> — turn keywords or a short business description into
              brandable domain ideas.
            </li>
            <li>
              <strong>Instant availability checks</strong> — query registry-backed status instead of
              guessing.
            </li>
            <li>
              <strong>Bulk checking</strong> — paste many domains at once (useful for investors and
              agencies).
            </li>
            <li>
              <strong>Multiple TLDs</strong> — explore .com, .net, .io, .ai, .app, .dev, and more.
            </li>
          </ul>
          <p>
            Official site:{' '}
            <a
              href={NAMEZIVO}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary font-medium hover:underline"
            >
              https://namezivo.com
            </a>
            . FYN Tools readers get a clear path from our free utilities to a specialized naming
            tool when domain search is the real bottleneck.
          </p>
        </section>

        <section className="space-y-3 text-foreground/90 leading-relaxed">
          <h2 className="text-2xl font-semibold text-foreground">How to use it (quick steps)</h2>
          <ol className="list-decimal pl-5 space-y-2">
            <li>
              Open{' '}
              <a
                href={NAMEZIVO}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                Namezivo
              </a>
              .
            </li>
            <li>Enter domains or a business idea such as “fitness app”.</li>
            <li>Select the extensions you care about.</li>
            <li>Run the check and shortlist available, brandable options.</li>
          </ol>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-foreground">Frequently asked questions</h2>
          {faqs.map((f) => (
            <div key={f.question} className="rounded-lg border bg-card p-4">
              <h3 className="font-semibold text-foreground mb-2">{f.question}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{f.answer}</p>
            </div>
          ))}
        </section>

        <section className="space-y-3 text-foreground/90 leading-relaxed not-prose border-t pt-8">
          <h2 className="text-2xl font-semibold text-foreground">Related free tools on FYN Tools</h2>
          <p className="text-muted-foreground">
            After you secure a name, keep building with our free browser utilities:
          </p>
          <ul className="grid sm:grid-cols-2 gap-2 text-sm">
            <li>
              <Link href="/business-idea-generator" className="text-primary hover:underline">
                Business Idea Generator
              </Link>
            </li>
            <li>
              <Link href="/name-generator" className="text-primary hover:underline">
                Name Generator
              </Link>
            </li>
            <li>
              <Link href="/username-generator" className="text-primary hover:underline">
                Username Generator
              </Link>
            </li>
            <li>
              <Link href="/meta-tag-previewer" className="text-primary hover:underline">
                Meta Tag Previewer
              </Link>
            </li>
            <li>
              <Link href="/url-slug-generator" className="text-primary hover:underline">
                URL Slug Generator
              </Link>
            </li>
            <li>
              <Link href="/hashtag-generator" className="text-primary hover:underline">
                Hashtag Generator
              </Link>
            </li>
          </ul>
        </section>
      </article>

      <div className="mt-10">
        <NamezivoAdBanner
          sourcePath={PATH}
          placement="promo_page_footer"
          variant="compact"
        />
      </div>
    </div>
  );
}
