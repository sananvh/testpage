import type { NextConfig } from "next";

const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), interest-cohort=()" },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" },
];

const nextConfig: NextConfig = {
  output: "standalone",
  reactStrictMode: true,
  poweredByHeader: false,
  // Always render <title>, meta and link tags in <head> (not streamed into <body>), so every
  // crawler and AI agent sees them, not only the bots on Next.js' built-in list.
  htmlLimitedBots: /.*/,
  experimental: { serverActions: { bodySizeLimit: "6mb" } },
  // Old cyberpoint.az URLs → new pages (keeps existing links and rankings)
  async redirects() {
    return [
      { source: "/whoweare", destination: "/az/about", permanent: true },
      { source: "/employees", destination: "/az/about", permanent: true },
      { source: "/list", destination: "/az/news", permanent: true },
      { source: "/brandings", destination: "/az", permanent: true },
    ];
  },
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;
