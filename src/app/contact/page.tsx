import type { Metadata } from 'next';
import { buildPageMetadata } from '@/lib/seo/metadata';
import { JsonLd } from '@/lib/seo/jsonld';
import { contactPageSchema, breadcrumbSchema, organizationSchema, faqPageSchema } from '@/lib/seo/schemas';
import { absoluteUrl } from '@/lib/seo/site';
import ContactForm from '@/components/contact/ContactForm';

export const metadata: Metadata = buildPageMetadata({
  title: 'Contact Support & Partnerships',
  description:
    'Contact FYN Tools Worldwide for support, feedback, partnership inquiries, or bug reports. We read every message.',
  path: '/contact',
  keywords: 'contact fyntools, support, feedback, partnership',
});

const CONTACT_FAQS = [
  {
    question: 'What are your support hours?',
    answer:
      'We typically review messages Monday through Friday during India Standard Time business hours (roughly 10:00–18:00 IST). Weekend notes still arrive in the same inbox and are usually answered on the next working day.',
  },
  {
    question: 'How do feature requests work?',
    answer:
      'Tell us which tool you used, what you expected, and what happened instead. Screenshots and exact steps help us ship fixes faster.',
  },
  {
    question: 'How do partnership inquiries work?',
    answer:
      'Email support@fyntools.com with your company name, audience size, and a short brief. We reply when there is a clear fit with our free online tools audience.',
  },
];

export default function ContactPage() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-3xl">
      <JsonLd
        data={[
          contactPageSchema(),
          organizationSchema(),
          breadcrumbSchema([
            { name: 'Home', url: absoluteUrl('/') },
            { name: 'Contact', url: absoluteUrl('/contact') },
          ]),
          faqPageSchema(CONTACT_FAQS),
        ]}
      />
      <h1 className="text-4xl font-bold mb-4 text-center">Contact Us</h1>
      <p className="text-center text-muted-foreground mb-6">
        Questions, feedback, or bug reports — we read every message. Email{' '}
        <a href="mailto:support@fyntools.com" className="text-primary hover:underline">
          support@fyntools.com
        </a>{' '}
        or use the form below. Whether you need help with a browser tool, want to suggest a feature,
        or are exploring a partnership, this page is the right place to reach the FYN Tools team.
      </p>
      <ContactForm />
      <section className="mt-12 space-y-6 text-zinc-700 dark:text-zinc-300 leading-relaxed" aria-labelledby="contact-faq">
        <h2 id="contact-faq" className="text-2xl font-bold text-foreground">
          Contact FAQ
        </h2>
        <div>
          <h3 className="font-semibold text-foreground mb-2">What are your support hours?</h3>
          <p>
            We typically review messages Monday through Friday during India Standard Time business
            hours (roughly 10:00–18:00 IST). Weekend notes still arrive in the same inbox and are
            usually answered on the next working day. Urgent outages affecting all visitors are
            prioritized when we can reproduce them from a public tool URL.
          </p>
        </div>
        <div>
          <h3 className="font-semibold text-foreground mb-2">How do feature requests work?</h3>
          <p>
            Tell us which tool you used, what you expected, and what happened instead. Screenshots
            and exact steps help us ship fixes faster. Feature ideas for PDF, image, converter, or
            typing tools are welcome—we weigh impact against browser privacy constraints (most FYN
            Tools process files locally and never require an account).
          </p>
        </div>
        <div>
          <h3 className="font-semibold text-foreground mb-2">Partnership and sponsorship inquiries</h3>
          <p>
            For content collaborations, affiliate proposals, or B2B integrations, email
            support@fyntools.com with your company name, audience size, and a short brief. We reply
            when there is a clear fit with our free online tools audience. Please do not send
            unsolicited paid link schemes or private credential requests through this form.
          </p>
        </div>
      </section>
    </div>
  );
}
