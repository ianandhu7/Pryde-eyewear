import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/metadata";

export default function robots(): MetadataRoute.Robots {
  const isProduction = process.env.NODE_ENV === "production" || process.env.VERCEL_ENV === "production";

  return {
    rules: {
      userAgent: "*",
      ...(isProduction ? { allow: "/" } : { disallow: "/" }),
    },
    ...(isProduction && siteUrl ? { sitemap: new URL("/sitemap.xml", siteUrl).toString() } : {}),
  };
}
