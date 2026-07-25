import { redirect } from 'next/navigation';
import { API_BASE_URL } from '@/lib/seo/site';

type Props = { params: Promise<{ code: string }> };

export default async function ShortUrlRedirectPage({ params }: Props) {
  const { code } = await params;
  // Prefer edge redirect via backend; fall through to API lookup
  try {
    const res = await fetch(`${API_BASE_URL}/shorturl/${code}`, {
      next: { revalidate: 60 },
    });
    if (res.ok) {
      const data = await res.json();
      const target = data?.longUrl || data?.url || data?.originalUrl;
      if (target) redirect(target);
    }
  } catch {
    // ignore
  }
  redirect('/');
}
