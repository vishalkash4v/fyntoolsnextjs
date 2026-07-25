# FYNTools Next.js App Router Migration Report

**Date:** 2026-07-25  
**App location:** [`frontend-next/`](../frontend-next/) (Vite app preserved in [`frontend/`](../frontend/))

## 1. What was migrated

- Marketing pages: `/`, `/about`, `/contact`, `/tools`, `/themes`
- 17 category hubs (via `app/[slug]` when slug matches `CATEGORY_HUBS`)
- All tool URLs from `toolsData` + tool registry (**SSG**, 130+ paths under `/[slug]`)
- Blog index + static posts from `blogsData`
- Short URL `/s/[code]` (server redirect via API), stats page
- Admin login + dashboard stubs (noindex)
- Redirect helpers `/redirect`, `/deep-link-redirect` (noindex)
- `sitemap.ts`, `robots.ts`, `not-found.tsx`

## 2. Old vs new architecture

| | Vite SPA | Next App Router |
|--|----------|-----------------|
| Routing | React Router `App.tsx` | File-based `app/` |
| SEO | Helmet CSR + Puppeteer | `generateMetadata` + SSG HTML |
| Schema | DOM inject `useToolSchema` | Server `JsonLd` scripts |
| Tools | Full page client | Server `ToolPageShell` + client `InteractiveToolLoader` |
| Deploy rewrite | SPA → `index.html` | Native Next routes (no SPA catch-all) |

## 3. Routes preserved

Flat tool URLs unchanged (`/word-counter`, `/bmi-calculator`, …). Hubs unchanged (`/image-tools`, …). Blog, about, contact, tools, themes preserved.

## 4. Redirects added (`next.config.ts` + `vercel.json`)

- `/tools/:path+` → `/:path+`
- `/qr-generator` → `/qr-code-generator`
- `/color-picker` → `/color-picker-tool`
- `/social-media-link-generator` → `/social-media-deep-link-generator`
- `/index.html` → `/`
- www → apex (vercel.json)
- `/tools?category=…` → hub paths (server `redirect()`)

## 5. Pages statically generated

- Home, about, contact, tools (tools may be dynamic for searchParams), themes, blog, **all hubs + tools** via `generateStaticParams` (~156 routes in build)

## 6. Pages using SSR / dynamic

- `/s/[code]` — dynamic (API lookup + redirect)
- `/s/[code]/stats` — dynamic
- `/tools` — dynamic when using searchParams

## 7. Client-only components (why)

- `components/tools/*` — calculators, canvas, FileReader, camera
- `InteractiveToolLoader` — `dynamic(..., { ssr: false })`
- Header search, theme toggle, contact form, admin login
- Contexts (`CurrencyContext`) used by finance tools

## 8–11. Metadata / canonical / sitemap / robots

- `lib/seo/metadata.ts` → `buildPageMetadata()` with per-page canonical via `NEXT_PUBLIC_SITE_URL`
- `app/sitemap.ts` — tools, hubs, blog, marketing; excludes admin/short/redirects
- `app/robots.ts` — allow `/`; disallow admin, `/s/`, redirect helpers; sitemap URL set

## 12. Structured data

- Home: WebSite + Organization + SearchAction
- Tools: SoftwareApplication + BreadcrumbList + FAQPage
- Hubs: CollectionPage/ItemList + Breadcrumb + FAQ
- Blog: Article

## 13. Internal linking

- Homepage categories / popular / featured / blogs
- Footer category hubs + popular tools
- Tool related tools from long-form SEO
- Hub grids link every tool; breadcrumbs to hubs

## 14. Removed / not used in Next cutover

- Vite SPA catch-all rewrite (not present in `frontend-next/vercel.json`)
- Puppeteer prerender not required (SSG replaces it)
- Helmet not used on public pages (stub `SEOHead` for legacy imports)

**Vite `frontend/` kept intact** until you point Vercel root to `frontend-next`.

## 15. Remaining technical SEO risks

- Interactive tool UI is client-only (expected); SEO shell is SSG
- Admin CMS beyond login/dashboard still thinner than Vite admin — extend incrementally
- Short URL depends on Express API availability
- `[slug]` first-load JS for tool chunk is large (~1MB) — further code-split per tool if needed

## 16. Thin/duplicate content risks

- Long-form SEO from `seo-pages` covers GSC-affected paths; other tools use solid defaults — continue enriching unique copy over time
- Avoid regenerating identical FAQ boilerplate forever; prefer curated FAQs per tool

## 17. Vercel deployment

1. Set project Root Directory to `frontend-next`
2. Env: `NEXT_PUBLIC_SITE_URL=https://fyntools.com`, `NEXT_PUBLIC_API_URL=https://express-two-umber.vercel.app/api`
3. Framework preset: Next.js
4. Hobby plan works for static SSG; upgrade when bandwidth grows
5. Keep Express API separate

### Build validation

```
✓ next build — 156 static pages generated
✓ Routes include SSG tools/hubs + sitemap/robots
```

### Cutover checklist

- [ ] Deploy `frontend-next` to a preview URL
- [ ] Spot-check tools (word-counter, image-compressor, QR)
- [ ] Confirm View Source shows H1 + FAQ without JS
- [ ] Switch production domain
- [ ] Archive/stop Vite frontend deploy
