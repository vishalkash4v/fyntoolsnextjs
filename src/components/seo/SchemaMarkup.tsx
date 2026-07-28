import { serializeJsonLd } from '@/lib/seo/jsonld';

type Props = {
  data: object | object[];
};

/**
 * Server-safe JSON-LD injector. Sanitizes `<` to prevent script breakout.
 * Prefer this over next/script for structured data.
 */
export default function SchemaMarkup({ data }: Props) {
  const payload = Array.isArray(data) ? data.filter(Boolean) : [data];
  return (
    <>
      {payload.map((item, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: serializeJsonLd(item) }}
        />
      ))}
    </>
  );
}
