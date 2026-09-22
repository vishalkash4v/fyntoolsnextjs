/** Public origin Google, AI crawlers, and sitemaps must cite. Never the API host. */
export const PRODUCTION_SITE_URL = "https://fyntools.com";

/**
 * Vercel once had NEXT_PUBLIC_SITE_URL set to the Render API
 * (https://express-kieg.onrender.com/api). Every canonical, og:url, and
 * JSON-LD @id then pointed off-site, so Search Console recorded zero
 * impressions. Production builds ignore any host that is not fyntools.com.
 */
function resolveSiteUrl(): string {
  const raw = (process.env.NEXT_PUBLIC_SITE_URL || "").trim().replace(/\/$/, "");
  if (!raw) return PRODUCTION_SITE_URL;

  let parsed: URL;
  try {
    parsed = new URL(raw);
  } catch {
    return PRODUCTION_SITE_URL;
  }

  const host = parsed.hostname.toLowerCase();
  const path = parsed.pathname.replace(/\/$/, "");
  const isApiOrPreview =
    host.includes("onrender.com") ||
    host.endsWith(".vercel.app") ||
    host === "localhost" ||
    host === "127.0.0.1" ||
    path === "/api" ||
    path.endsWith("/api");

  if (process.env.NODE_ENV === "production") return PRODUCTION_SITE_URL;

  if (isApiOrPreview && host !== "localhost" && host !== "127.0.0.1") {
    return PRODUCTION_SITE_URL;
  }
  return `${parsed.protocol}//${parsed.host}`;
}

export const SITE_URL = resolveSiteUrl();

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ||
  "https://express-kieg.onrender.com/api";

export const SITE = {
  name: "FYN Tools Worldwide",
  shortName: "FYN Tools",
  url: SITE_URL,
  description:
    "Free professional online tools — calculators, text tools, image editors, converters, and developer utilities.",
  email: "support@fyntools.com",
  twitter: "@fyntoolsworldwide",
  twitterUrl: "https://twitter.com/fyntoolsworldwide",
  locale: "en_US",
  defaultOgImage: "/opengraph-image",
} as const;

export function absoluteUrl(path: string): string {
  if (!path) return SITE_URL;
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

export function normalizePath(path: string): string {
  if (!path || path === "/") return "/";
  return path.replace(/\/$/, "") || "/";
}
