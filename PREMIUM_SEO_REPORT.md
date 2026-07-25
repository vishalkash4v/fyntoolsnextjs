# Premium SEO Hardening (frontend-next)

Date: 2026-07-25

## What changed

### Site-wide
- Absolute titles (no `| FYN | FYN` doubling)
- Canonical, OG, Twitter, `max-image-preview: large`
- Dynamic `/opengraph-image` (1200×630)
- Shared schema builders in `src/lib/seo/schemas.ts`

### Every tool page
- Long-form SEO for **all** tools (not only GSC-affected)
- Curated `toolSeoContent` merged on top of generator
- JSON-LD: **SoftwareApplication + BreadcrumbList + HowTo + FAQPage**
- Breadcrumb category → hub URL (matches UI)
- Rendered sections: intro, how it works, how-to, features, advantages, benefits, when-to-use, examples, use cases, tips, mistakes, related, conclusion, FAQs

### Other pages
- Home: WebSite + Organization + ItemLists
- About / Contact: AboutPage / ContactPage + Org + breadcrumbs
- `/tools`: CollectionPage + ItemList
- Hubs: CollectionPage + FAQ + breadcrumbs
- Blog index: Blog schema; posts: full Article + breadcrumbs + `og:type=article`
- `/themes`: **noindex**, removed from sitemap, disallowed in robots

### GSC
- All **98/98** `gsc-exports` URLs mapped to a route, redirect, or intentional noindex

## Honest ranking note

Technical + on-page SEO is now premium-grade. Google #1 also needs: deploy `frontend-next` to production, GSC sitemap resubmit, backlinks/brand, CWV, and time for recrawl. Code cannot force position 1 overnight.
