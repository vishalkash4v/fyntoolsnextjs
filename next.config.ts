import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  trailingSlash: false,
  reactStrictMode: true,
  poweredByHeader: false,
  images: {
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
      {
        source: "/social-media-link-generator",
        destination: "/social-media-deep-link-generator",
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
        source: "/fyntoolsadmin/:path*",
        headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }],
      },
      // Skip document headers on hashed CSS/JS so static assets stay cache-friendly
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
