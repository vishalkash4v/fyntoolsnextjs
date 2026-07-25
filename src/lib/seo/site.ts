export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") || "https://fyntools.com";

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ||
  "https://express-two-umber.vercel.app/api";

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
