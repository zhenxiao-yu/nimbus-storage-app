import type { NextConfig } from "next";

// Content-Security-Policy — Report-Only mode while we observe in production.
// Switch the header key to "Content-Security-Policy" once verified to not
// break Appwrite uploads, Vercel analytics, or next/font CSS injection.
const cspDirectives = [
  "default-src 'self'",
  // Inline scripts are needed for next/script (JSON-LD) and Next.js bootstrap.
  // 'unsafe-eval' is needed for some Next dev/runtime + Recharts.
  "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://va.vercel-scripts.com https://vercel.live",
  // next/font injects <style> tags; Tailwind/shadcn use inline styles for
  // animations and color tokens.
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' data: https://fonts.gstatic.com",
  "img-src 'self' data: blob: https://*.cloud.appwrite.io https://cloud.appwrite.io https://img.freepik.com https://cdn.pixabay.com https://api.dicebear.com https://avatars.dicebear.com",
  "media-src 'self' blob: https://*.cloud.appwrite.io https://cloud.appwrite.io",
  "connect-src 'self' https://*.cloud.appwrite.io https://cloud.appwrite.io https://vitals.vercel-insights.com https://vercel.live wss://vercel.live",
  "frame-src 'self' https://vercel.live",
  "worker-src 'self' blob:",
  "manifest-src 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'self'",
  "upgrade-insecure-requests",
].join("; ");

const securityHeaders = [
  { key: "X-DNS-Prefetch-Control", value: "on" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), interest-cohort=()",
  },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
  { key: "Cross-Origin-Resource-Policy", value: "same-origin" },
  { key: "Origin-Agent-Cluster", value: "?1" },
  { key: "Content-Security-Policy-Report-Only", value: cspDirectives },
];

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  compress: true,
  experimental: {
    serverActions: {
      bodySizeLimit: "100MB",
    },
    // Tree-shake barrel imports for icon + chart libraries that otherwise
    // ship a lot of unused exports into client bundles. Next maps named
    // imports onto direct file paths at build time.
    optimizePackageImports: [
      "lucide-react",
      "recharts",
      "@radix-ui/react-dialog",
      "@radix-ui/react-dropdown-menu",
      "@radix-ui/react-alert-dialog",
      "@radix-ui/react-select",
      "@radix-ui/react-tooltip",
      "framer-motion",
      "cmdk",
    ],
  },
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      { protocol: "https", hostname: "cloud.appwrite.io" },
      { protocol: "https", hostname: "fra.cloud.appwrite.io" },
      { protocol: "https", hostname: "nyc.cloud.appwrite.io" },
      { protocol: "https", hostname: "syd.cloud.appwrite.io" },
      { protocol: "https", hostname: "img.freepik.com" },
      { protocol: "https", hostname: "cdn.pixabay.com" },
      { protocol: "https", hostname: "avatars.dicebear.com" },
      { protocol: "https", hostname: "api.dicebear.com" },
    ],
  },
  async headers() {
    return [{ source: "/(.*)", headers: securityHeaders }];
  },
};

export default nextConfig;
