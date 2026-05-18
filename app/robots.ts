import type { MetadataRoute } from "next";

import { siteConfig } from "@/constants";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: [
          "/",
          "/login",
          "/register",
          "/privacy",
          "/terms",
          "/cookies",
          "/beam",
        ],
        disallow: ["/dashboard", "/api", "/share", "/_next"],
      },
    ],
    sitemap: `${siteConfig.url}/sitemap.xml`,
    host: siteConfig.url,
  };
}
