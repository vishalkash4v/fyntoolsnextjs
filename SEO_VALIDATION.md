# SEO Validation (repeatable)

Run after every major release of `frontend-next`.

## Prerequisites

```bash
cd frontend-next
npm ci
npm run generate-registry
npm run build
```

## Automated checks

```bash
npm run check:registry   # every toolsData slug → real component (never ToolPageLayout)
npm run check:seo        # content system + sample HTML signals
npm run check:gsc        # gsc-exports URL coverage
npm run typecheck
npm run lint
```

## Manual HTML checks (production or `next start`)

For each page type, view source (not DevTools DOM after JS):

| Page | Expect |
|------|--------|
| `/` | title, canonical, WebSite+Organization JSON-LD, H1 |
| Category hub e.g. `/image-tools` | CollectionPage + FAQ, tool links |
| Tool e.g. `/word-counter` | unique title/description, SoftApp + Breadcrumb + FAQ JSON-LD, H1, useful copy, related links |
| `/about`, `/contact` | AboutPage / ContactPage schema |
| Blog post | Article schema, `og:type` article |
| `/themes` | **noindex** |
| Invalid slug | **404** (not soft 200) |

## Lighthouse (local)

```bash
npx next start -p 3460
npx lighthouse http://127.0.0.1:3460/ --only-categories=performance,accessibility,best-practices,seo --preset=desktop --chrome-flags="--headless --no-sandbox"
```

Test at least: home, hub, simple tool, popular tool, heavy tool, blog, about.

Do **not** claim GTmetrix scores without a public URL.

## Content rules

- No `longFormGenerator` filler
- Every tool uses `buildUniqueToolContent` (+ curated `toolSeoContent` where present)
- Do not reuse identical intros/FAQs across tools
- Schema must match visible content; HowTo only when opted in for procedural tools
