import type { MetadataRoute } from "next";
import { getProducts } from "@/lib/cms";

const base = process.env.NEXT_PUBLIC_SITE_URL || "https://dspballs.in";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const products = await getProducts();

  const staticRoutes = [
    "",
    "/about",
    "/products",
    "/quality",
    "/technical",
    "/clients",
    "/network",
    "/career",
    "/contact",
    "/disclaimer",
  ].map((path) => ({
    url: `${base}${path}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: path === "" ? 1 : 0.8,
  }));

  const productRoutes = products.map((p) => ({
    url: `${base}/products/${p.slug}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  return [...staticRoutes, ...productRoutes];
}
