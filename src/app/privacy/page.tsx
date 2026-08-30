import type { Metadata } from 'next';
import Link from 'next/link';
import { buildPageMetadata } from '@/lib/seo/metadata';
import SchemaMarkup from '@/components/seo/SchemaMarkup';
import { breadcrumbSchema, faqPageSchema, organizationSchema } from '@/lib/seo/schemas';
import { absoluteUrl } from '@/lib/seo/site';

export const metadata: Metadata = buildPageMetadata({
  title: 'Privacy Policy — FYN Tools Worldwide',
  description:
    'How FYN Tools handles your data: browser-side processing, cookies, analytics, short links, ads, and your rights. Updated policy for fyntools.com visitors worldwide.',
  path: '/privacy',
  keywords: 'fyntools privacy policy, data processing, browser tools privacy, cookies policy',
});

const FAQS = [
  {
    question: 'Does FYN Tools store the text or files I paste into tools?',
    answer:
      'Most utilities run in your browser whenever possible. We do not intentionally collect the content you type or upload for normal tool use. Avoid pasting production secrets, customer PII, or live API keys into any online form.',
  },
  {
    question: 'What cookies or analytics does FYN Tools use?',
    answer:
      'We may use privacy-respecting analytics to understand traffic patterns and improve tools. Advertising, when enabled, may use industry-standard ad cookies in reserved layout slots. You can control cookies through your browser settings.',
  },
  {
    question: 'Are short links on FYN Tools private?',
    answer:
      'Short URLs created with our URL shortener resolve to public destinations. Treat shared short links as discoverable. We may block abusive or malicious destinations.',
  },
  {
    question: 'Where is FYN Tools operated from?',
    answer:
      'FYN Tools Worldwide is operated from India and serves visitors globally. Contact us at contact@fyntools.com for privacy questions.',
  },
  {
    question: 'Can I request deletion of data tied to my account?',
    answer:
      'Most tools require no account. If you contact us about admin, blog, or support records, we will respond to legitimate deletion requests within a reasonable timeframe.',
  },
];

export default function PrivacyPage() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-3xl">
      <SchemaMarkup
        data={[
          organizationSchema(),
          breadcrumbSchema([
            { name: 'Home', url: absoluteUrl('/') },
            { name: 'Privacy Policy', url: absoluteUrl('/privacy') },
          ]),
          faqPageSchema(FAQS),
        ].filter(Boolean)}
      />

      <header className="mb-10">
        <h1 className="text-4xl font-bold mb-4">Privacy Policy</h1>
        <p className="text-muted-foreground">Last updated: August 29, 2026</p>
      </header>

      <div className="space-y-8 text-foreground/90 leading-relaxed">
        <section>
          <h2 className="text-2xl font-semibold mb-3">Overview</h2>
          <p>
            FYN Tools Worldwide (&quot;FYN Tools&quot;, &quot;we&quot;, &quot;us&quot;) provides free browser-based
            utilities at fyntools.com. This policy explains what we collect, what stays on your device, and how
            we use information when you visit our site or use our tools.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-3">Browser-side processing</h2>
          <p>
            Many tools—formatters, calculators, generators, and image utilities—process input locally in your
            browser. That design reduces server exposure of your drafts, files, and calculations. When a tool
            must call an external API, the page should describe that behavior. If you are unsure, assume
            sensitive data should not be submitted.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-3">Information we may collect</h2>
          <ul className="list-disc pl-5 space-y-2">
            <li>Standard server logs (IP address, user agent, pages visited, timestamps) for security and debugging.</li>
            <li>Aggregated analytics to understand popular tools and fix errors.</li>
            <li>Information you voluntarily send via our <Link href="/contact" className="text-primary hover:underline">contact form</Link>.</li>
            <li>Short-link metadata when you create or visit fyntools.com/s/… URLs.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-3">Cookies & advertising</h2>
          <p>
            We use cookies where needed for site functionality and measurement. Third-party ad partners, when
            active, may set their own cookies subject to their policies. Ads are placed in reserved slots to
            limit layout shift and never above primary tool controls.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-3">Your choices</h2>
          <p>
            You can block or delete cookies in your browser, use private browsing for sensitive tasks, and
            contact us to ask about data we hold from support interactions. For editorial standards and mission,
            see our <Link href="/about" className="text-primary hover:underline">About page</Link>.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-3">Contact</h2>
          <p>
            Privacy questions: <a href="mailto:contact@fyntools.com" className="text-primary hover:underline">contact@fyntools.com</a>
            {' '}· FYN Tools Worldwide, Una, Himachal Pradesh, India.
          </p>
        </section>
      </div>
    </div>
  );
}
