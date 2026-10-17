import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { requireAuth } from "@/lib/authGuard";
import {
  getSeoOverridesMap,
  saveSeoOverridesMap,
  getAllBlogArticles,
  saveBlogArticle,
  SeoOverrideRecord,
} from "@/lib/seoCms";
import { SeoMetadataPayload } from "@/lib/seoAnalyzer";

export const dynamic = "force-dynamic";

type BulkSeoUpdateItem = {
  id: string;
  entityType: "page" | "product" | "blog";
  entityId: string;
  urlPath: string;
  title?: string;
  seo: Partial<SeoMetadataPayload>;
};

export async function PUT(request: NextRequest) {
  const { response } = await requireAuth("editor");
  if (response) return response;

  try {
    const body = await request.json();
    const updates: BulkSeoUpdateItem[] = Array.isArray(body.updates)
      ? body.updates
      : body.update
      ? [body.update]
      : [];

    if (!updates.length) {
      return NextResponse.json(
        { error: "No SEO updates provided" },
        { status: 400 }
      );
    }

    const overridesMap = await getSeoOverridesMap();
    const blogArticles = await getAllBlogArticles();
    const blogMap = new Map(blogArticles.map((b) => [b.slug, b]));

    let overridesChanged = false;
    let updatedCount = 0;

    for (const item of updates) {
      if (item.entityType === "blog") {
        const existingBlog = blogMap.get(item.entityId);
        if (existingBlog) {
          const mergedSeo: SeoMetadataPayload = {
            ...existingBlog.seo,
            ...item.seo,
          };
          await saveBlogArticle({
            ...existingBlog,
            seo: mergedSeo,
          });
          revalidatePath(`/blog/${existingBlog.slug}`);
          updatedCount++;
        }
      } else {
        const key = `${item.entityType}:${item.entityId}`;
        const existing = overridesMap[key];
        const baseSeo: SeoMetadataPayload = existing?.seo || {
          focusKeyword: "",
          secondaryKeywords: [],
          seoTitle: item.title || "",
          metaDescription: "",
          slug: item.entityId,
          canonicalUrl: `https://www.dspballs.co.in${item.urlPath}`,
          robotsIndex: true,
          robotsFollow: true,
          ogTitle: "",
          ogDescription: "",
          ogImage: "",
          breadcrumbTitle: item.title || "",
          schemaType: item.entityType === "product" ? "Product" : "WebPage",
          faqItems: [],
        };

        const nextRecord: SeoOverrideRecord = {
          entityType: item.entityType,
          entityId: item.entityId,
          urlPath: item.urlPath,
          seo: {
            ...baseSeo,
            ...item.seo,
          },
          updatedAt: new Date().toISOString(),
        };

        overridesMap[key] = nextRecord;
        overridesChanged = true;
        revalidatePath(item.urlPath);
        updatedCount++;
      }
    }

    if (overridesChanged) {
      await saveSeoOverridesMap(overridesMap);
    }

    revalidatePath("/", "layout");
    revalidatePath("/sitemap.xml");

    return NextResponse.json({
      success: true,
      updatedCount,
    });
  } catch (err) {
    console.error("[PUT /api/admin/seo/bulk]", err);
    return NextResponse.json(
      { error: "Failed to save SEO updates" },
      { status: 500 }
    );
  }
}
