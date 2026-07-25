import type { Metadata } from 'next';
import { buildPageMetadata } from '@/lib/seo/metadata';
import { JsonLd } from '@/lib/seo/jsonld';
import { contactPageSchema, breadcrumbSchema, organizationSchema } from '@/lib/seo/schemas';
import { absoluteUrl } from '@/lib/seo/site';
import ContactForm from '@/components/contact/ContactForm';

export const metadata: Metadata = buildPageMetadata({
  title: 'Contact FYN Tools',
  description:
    'Contact FYN Tools Worldwide for support, feedback, partnership inquiries, or bug reports. We read every message.',
  path: '/contact',
  keywords: 'contact fyntools, support, feedback, partnership',
});

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
        ]}
      />
      <h1 className="text-4xl font-bold mb-4 text-center">Contact Us</h1>
      <p className="text-center text-muted-foreground mb-10">
        Questions, feedback, or bug reports — we read every message. Email{' '}
        <a href="mailto:support@fyntools.com" className="text-primary hover:underline">
          support@fyntools.com
        </a>{' '}
        or use the form below.
      </p>
      <ContactForm />
    </div>
  );
}
