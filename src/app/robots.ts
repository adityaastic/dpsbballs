import type { MetadataRoute } from "next";
import { getTechnicalSeoConfig } from "@/lib/seoCms";

const baseUrl = (
  process.env.NEXT_PUBLIC_SITE_URL || "https://www.dspballs.co.in"
).replace(/\/$/, "");

export default async function robots(): Promise<MetadataRoute.Robots> {
  const techConfig = await getTechnicalSeoConfig();
  const allowAll = techConfig.robotsTxt.allowIndexing !== false;

  const rules: MetadataRoute.Robots["rules"] = [
    {
      userAgent: "*",
      allow: allowAll ? "/" : undefined,
      disallow: allowAll ? ["/admin/", "/api/admin/", "/scratch/"] : "/",
    },
    {
      userAgent: "Googlebot",
      allow: allowAll ? "/" : undefined,
      disallow: allowAll ? ["/admin/", "/api/admin/"] : "/",
    },
    {
      userAgent: "Bingbot",
      allow: allowAll ? "/" : undefined,
      disallow: allowAll ? ["/admin/", "/api/admin/"] : "/",
    },
  ];

  if (techConfig.robotsTxt.blockAiBots) {
    rules.push(
      { userAgent: "GPTBot", disallow: "/" },
      { userAgent: "CCBot", disallow: "/" }
    );
  }

  return {
    rules,
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
