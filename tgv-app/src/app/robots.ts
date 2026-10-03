import type { MetadataRoute } from "next";
import { site } from "@/data/content";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/api/", "/portal", "/admin", "/login", "/setup", "/files/", "/stream/"] },
    sitemap: `${site.url}/sitemap.xml`,
  };
}
