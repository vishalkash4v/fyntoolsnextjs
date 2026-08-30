import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  trailingSlash: false,
  reactStrictMode: true,
  poweredByHeader: false,
  // Fewer legacy polyfills + smaller client bundles for modern browsers (2026 Baseline)
  experimental: {
    optimizePackageImports: [
      "lucide-react",
      "date-fns",
      "rsuite",
      "sonner",
      "@radix-ui/react-accordion",
      "@radix-ui/react-dialog",
      "@radix-ui/react-select",
      "@radix-ui/react-tabs",
      "@radix-ui/react-toast",
      "@radix-ui/react-dropdown-menu",
      "@radix-ui/react-popover",
      "@radix-ui/react-checkbox",
      "@radix-ui/react-switch",
      "@radix-ui/react-tooltip",
      "@radix-ui/react-label",
      "@radix-ui/react-slot",
      "@radix-ui/react-separator",
      "@radix-ui/react-slider",
      "@radix-ui/react-scroll-area",
      "@radix-ui/react-collapsible",
      "@radix-ui/react-progress",
      "@radix-ui/react-radio-group",
      "@radix-ui/react-avatar",
      "recharts",
      "framer-motion",
    ],
  },
  compiler: {
    removeConsole:
      process.env.NODE_ENV === "production"
        ? { exclude: ["error", "warn"] }
        : false,
  },
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      { protocol: "https", hostname: "fyntools.com" },
      { protocol: "https", hostname: "**.vercel.app" },
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "blogger.googleusercontent.com" },
    ],
  },
  async redirects() {
    return [
      { source: "/index.html", destination: "/", permanent: true },
      { source: "/tools/:path+", destination: "/:path+", permanent: true },
      { source: "/qr-generator", destination: "/qr-code-generator", permanent: true },
      { source: "/color-picker", destination: "/color-picker-tool", permanent: true },
      // Phase 1 Batch 4 — marketing aliases → canonical image/visual routes
      { source: "/image-converter", destination: "/image-format-converter", permanent: true },
      { source: "/image-filters", destination: "/blur-image", permanent: true },
      { source: "/watermark-generator", destination: "/photo-annotation-tool", permanent: true },
      { source: "/ico-converter", destination: "/logo-to-favicon", permanent: true },
      { source: "/exif-data-remover", destination: "/image-metadata-viewer", permanent: true },
      { source: "/aspect-ratio-calculator", destination: "/image-resizer", permanent: true },
      { source: "/palette-generator", destination: "/color-palette-generator", permanent: true },
      { source: "/favicon-generator", destination: "/logo-to-favicon", permanent: true },
      { source: "/meme-generator", destination: "/photo-annotation-tool", permanent: true },
      // Phase 1 Batch 5 — marketing aliases → canonical utility/security routes
      { source: "/qr-code-reader", destination: "/qr-scanner", permanent: true },
      { source: "/uuid-v4-generator", destination: "/random-number-generator", permanent: true },
      { source: "/password-strength-checker", destination: "/password-generator", permanent: true },
      { source: "/htpasswd-generator", destination: "/hash-generator", permanent: true },
      { source: "/chmod-calculator", destination: "/regex-tester", permanent: true },
      { source: "/cron-expression-generator", destination: "/timestamp-converter", permanent: true },
      { source: "/sql-formatter", destination: "/json-formatter", permanent: true },
      { source: "/diff-checker", destination: "/duplicate-line-remover", permanent: true },
      { source: "/html-entity-encode-decode", destination: "/url-encode-decode", permanent: true },
      { source: "/user-agent-parser", destination: "/regex-tester", permanent: true },
      { source: "/device-information", destination: "/ip-lookup", permanent: true },
      { source: "/ip-address-lookup", destination: "/ip-address-to-location-finder", permanent: true },
      { source: "/port-scanner-reference", destination: "/dummy-api-generator", permanent: true },
      { source: "/stopwatch-timer", destination: "/stopwatch", permanent: true },
      { source: "/decision-maker-wheel", destination: "/yes-no-generator", permanent: true },
      {
        source: "/social-media-link-generator",
        destination: "/social-media-deep-link-generator",
        permanent: true,
      },
      // Soft-duplicate tools → single canonical (GSC cannibalization fix)
      {
        source: "/enhanced-unit-converter",
        destination: "/unit-converter",
        permanent: true,
      },
      {
        source: "/pregnancy-weight-gain",
        destination: "/pregnancy-weight-gain-calculator",
        permanent: true,
      },
      {
        source: "/add-name-date-photo",
        destination: "/photo-annotation-tool",
        permanent: true,
      },
      {
        source: "/google2bd88e5174647955",
        destination: "/google2bd88e5174647955.html",
        permanent: true,
      },
    ];
  },
  async headers() {
    return [
      {
        source: "/s/:path*",
        headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow, noarchive" }],
      },
      {
        source: "/redirect",
        headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }],
      },
      {
        source: "/deep-link-redirect",
        headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }],
      },
      {
        source: "/fyntoolsadmin/:path*",
        headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }],
      },
      {
        source: "/themes",
        headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }],
      },
      {
        source: "/robots.txt",
        headers: [
          { key: "Content-Type", value: "text/plain; charset=utf-8" },
          { key: "Cache-Control", value: "public, max-age=86400, s-maxage=86400, stale-while-revalidate=604800" },
        ],
      },
      {
        source: "/sitemap.xml",
        headers: [
          { key: "Content-Type", value: "application/xml; charset=utf-8" },
          { key: "Cache-Control", value: "public, max-age=3600, s-maxage=3600" },
        ],
      },
      {
        source: "/llms.txt",
        headers: [
          { key: "Content-Type", value: "text/plain; charset=utf-8" },
          { key: "Cache-Control", value: "public, max-age=3600" },
        ],
      },
      {
        source: "/agents.json",
        headers: [
          { key: "Content-Type", value: "application/json; charset=utf-8" },
          { key: "Cache-Control", value: "public, max-age=3600" },
        ],
      },
      {
        source: "/agent-instructions.md",
        headers: [
          { key: "Content-Type", value: "text/markdown; charset=utf-8" },
          { key: "Cache-Control", value: "public, max-age=3600" },
        ],
      },
      {
        source: "/ai.txt",
        headers: [
          { key: "Content-Type", value: "text/plain; charset=utf-8" },
          { key: "Cache-Control", value: "public, max-age=3600" },
        ],
      },
      {
        source: "/((?!_next/static|_next/image|favicon.ico).*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
