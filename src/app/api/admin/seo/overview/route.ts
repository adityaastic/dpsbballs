import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/authGuard";
import {
  getUnifiedSeoInventory,
  getTechnicalSeoConfig,
  getAllBlogArticles,
} from "@/lib/seoCms";

export const dynamic = "force-dynamic";

export async function GET() {
  const { response } = await requireAuth("editor");
  if (response) return response;

  try {
    const [inventory, technical, articles] = await Promise.all([
      getUnifiedSeoInventory(),
      getTechnicalSeoConfig(),
      getAllBlogArticles(),
    ]);

    return NextResponse.json({
      ...inventory,
      technical,
      blogCounts: {
        total: articles.length,
        published: articles.filter((a) => a.status === "published").length,
        draft: articles.filter((a) => a.status === "draft").length,
        scheduled: articles.filter((a) => a.status === "scheduled").length,
      },
      recentArticles: articles.slice(0, 6).map((a) => ({
        id: a.id,
        slug: a.slug,
        title: a.title,
        status: a.status,
        category: a.category,
        updatedAt: a.updatedAt,
        publishedAt: a.publishedAt,
        readingTimeMinutes: a.readingTimeMinutes,
        wordCount: a.wordCount,
        focusKeyword: a.seo?.focusKeyword || "",
      })),
    });
  } catch (err) {
    console.error("[GET /api/admin/seo/overview]", err);
    return NextResponse.json(
      { error: "Failed to load SEO overview" },
      { status: 500 }
    );
  }
}
