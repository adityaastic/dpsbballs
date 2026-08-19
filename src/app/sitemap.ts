import type { MetadataRoute } from "next";
import { getProducts } from "@/lib/cms";

const baseUrl = (process.env.NEXT_PUBLIC_SITE_URL || "https://www.dspballs.co.in").replace(/\/$/, "");

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const products = await getProducts();

  const staticPages = [
    { path: "", priority: 1.0, changeFrequency: "daily" as const },
    { path: "/about", priority: 0.9, changeFrequency: "weekly" as const },
    { path: "/products", priority: 0.9, changeFrequency: "daily" as const },
    { path: "/quality", priority: 0.8, changeFrequency: "monthly" as const },
    { path: "/technical", priority: 0.8, changeFrequency: "monthly" as const },
    { path: "/clients", priority: 0.7, changeFrequency: "monthly" as const },
    { path: "/network", priority: 0.8, changeFrequency: "monthly" as const },
    { path: "/career", priority: 0.6, changeFrequency: "monthly" as const },
    { path: "/contact", priority: 0.9, changeFrequency: "monthly" as const },
    { path: "/disclaimer", priority: 0.3, changeFrequency: "yearly" as const },
  ];

  const staticRoutes: MetadataRoute.Sitemap = staticPages.map((page) => ({
    url: `${baseUrl}${page.path}`,
    lastModified: new Date(),
    changeFrequency: page.changeFrequency,
    priority: page.priority,
  }));

  const productRoutes: MetadataRoute.Sitemap = products.map((p) => ({
    url: `${baseUrl}/products/${p.slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.85,
  }));

  return [...staticRoutes, ...productRoutes];
}
