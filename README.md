# FYN Tools (frontend-next)

Next.js App Router site for [fyntools.com](https://fyntools.com).

## Commands

```bash
npm run dev
npm run build
npm run start
npm run typecheck
npm run generate-registry   # rebuild tool loaders
npm run generate-llms       # rebuild public/llms.txt
npm run check:registry
npm run check:seo
npm run check:gsc           # needs ../gsc-exports/Table.csv
```

## Env

Copy `.env.example` → `.env.local` / `.env.production`.

- `NEXT_PUBLIC_SITE_URL=https://fyntools.com`
- `NEXT_PUBLIC_API_URL=https://express-two-umber.vercel.app/api`
