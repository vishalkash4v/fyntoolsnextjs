import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { resolveCategoryHub } from '@/lib/seo/categoryHubRedirects';

export function middleware(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;

  if (pathname === '/tools') {
    const category = searchParams.get('category');
    if (category) {
      const dest = resolveCategoryHub(decodeURIComponent(category));
      if (dest) {
        const url = request.nextUrl.clone();
        url.pathname = dest;
        url.search = '';
        return NextResponse.redirect(url, 301);
      }
    }

    if (searchParams.has('search')) {
      const response = NextResponse.next();
      response.headers.set('X-Robots-Tag', 'noindex, follow');
      return response;
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/tools'],
};
