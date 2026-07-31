import type { Metadata } from 'next';
import ToolStaticPage, { buildToolPageMetadata } from '@/lib/tools/toolStaticPage';
import JsonFormatterClient from '@/app/json-formatter/JsonFormatterClient';

export const dynamic = 'force-static';

export function generateMetadata(): Metadata {
  return buildToolPageMetadata('json-formatter');
}

export default function JsonFormatterPage() {
  return <ToolStaticPage slug="json-formatter" toolClient={<JsonFormatterClient />} />;
}
