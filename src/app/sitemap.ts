import type { MetadataRoute } from "next";
import { getProducts } from "@/lib/cms";
import {
  getAllBlogArticles,
  getSeoOverridesMap,
  getTechnicalSeoConfig,
} from "@/lib/seoCms";

const baseUrl = (
  process.env.NEXT_PUBLIC_SITE_URL || "https://www.dspballs.co.in"
).replace(/\/$/, "");

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [products, blogArticles, overridesMap, techConfig] = await Promise.all([
    getProducts(),
    getAllBlogArticles(),
    getSeoOverridesMap(),
    getTechnicalSeoConfig(),
  ]);

  const entries: MetadataRoute.Sitemap = [];

  if (techConfig.sitemapConfig.includePages) {
    const staticPages = [
      { slug: "home", path: "", priority: 1.0, changeFrequency: "daily" as const },
      { slug: "about", path: "/about", priority: 0.9, changeFrequency: "weekly" as const },
      { slug: "products", path: "/products", priority: 0.9, changeFrequency: "daily" as const },
      { slug: "quality", path: "/quality", priority: 0.8, changeFrequency: "monthly" as const },
      { slug: "technical", path: "/technical", priority: 0.8, changeFrequency: "monthly" as const },
      { slug: "clients", path: "/clients", priority: 0.7, changeFrequency: "monthly" as const },
      { slug: "network", path: "/network", priority: 0.8, changeFrequency: "monthly" as const },
      { slug: "career", path: "/career", priority: 0.6, changeFrequency: "monthly" as const },
      { slug: "contact", path: "/contact", priority: 0.9, changeFrequency: "monthly" as const },
      { slug: "disclaimer", path: "/disclaimer", priority: 0.3, changeFrequency: "yearly" as const },
    ];

    for (const page of staticPages) {
      const ov = overridesMap[`page:${page.slug}`];
      if (techConfig.sitemapConfig.excludeNoindex && ov && ov.seo.robotsIndex === false) {
        continue;
      }
      entries.push({
        url: `${baseUrl}${page.path}`,
        lastModified: ov?.updatedAt ? new Date(ov.updatedAt) : new Date(),
        changeFrequency: page.changeFrequency,
        priority: page.priority,
      });
    }
  }

  if (techConfig.sitemapConfig.includeProducts) {
    for (const p of products) {
      const ov = overridesMap[`product:${p.slug}`];
      if (techConfig.sitemapConfig.excludeNoindex && ov && ov.seo.robotsIndex === false) {
        continue;
      }
      entries.push({
        url: `${baseUrl}/products/${p.slug}`,
        lastModified: ov?.updatedAt ? new Date(ov.updatedAt) : new Date(),
        changeFrequency: "weekly" as const,
        priority: 0.85,
      });
    }
  }

  if (techConfig.sitemapConfig.includeBlogs) {
    entries.push({
      url: `${baseUrl}/blog`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.85,
    });

    const now = Date.now();
    for (const article of blogArticles) {
      const isPublished =
        article.status === "published" ||
        (article.status === "scheduled" &&
          typeof article.scheduledFor === "string" &&
          article.scheduledFor.length > 0 &&
          new Date(article.scheduledFor).getTime() <= now);

      if (!isPublished) continue;
      if (
        techConfig.sitemapConfig.excludeNoindex &&
        article.seo?.robotsIndex === false
      ) {
        continue;
      }

      entries.push({
        url: `${baseUrl}/blog/${article.slug}`,
        lastModified: new Date(article.updatedAt || article.publishedAt),
        changeFrequency: "weekly" as const,
        priority: article.featured ? 0.85 : 0.75,
      });
    }
  }

  return entries;
}
