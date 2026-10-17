import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { requireAuth } from "@/lib/authGuard";
import {
  getAllBlogArticles,
  saveBlogArticle,
  BlogArticleRecord,
} from "@/lib/seoCms";
import { analyzeSeoContent } from "@/lib/seoAnalyzer";

export const dynamic = "force-dynamic";

export async function GET() {
  const { response } = await requireAuth("editor");
  if (response) return response;

  try {
    const articles = await getAllBlogArticles();
    const allTitles = articles.map((a) => ({
      id: `blog:${a.slug}`,
      title: a.seo?.seoTitle || a.title,
      description: a.seo?.metaDescription || a.excerpt || "",
    }));

    const enriched = articles.map((article) => {
      const analysis = analyzeSeoContent({
        title: article.title,
        bodyHtml: article.bodyHtml,
        urlPath: `/blog/${article.slug}`,
        seo: article.seo,
        allTitles,
        currentId: `blog:${article.slug}`,
      });

      return {
        ...article,
        seoScore: analysis.score,
        seoGrade: analysis.grade,
        passCount: analysis.passCount,
        warnCount: analysis.warnCount,
        failCount: analysis.failCount,
        internalLinksCount: analysis.internalLinksCount,
        externalLinksCount: analysis.externalLinksCount,
        imagesMissingAltCount: analysis.imagesMissingAltCount,
      };
    });

    return NextResponse.json(enriched);
  } catch (err) {
    console.error("[GET /api/admin/blog]", err);
    return NextResponse.json(
      { error: "Failed to load blog articles" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const { response } = await requireAuth("editor");
  if (response) return response;

  try {
    const body = (await request.json()) as Partial<BlogArticleRecord> & {
      previousSlug?: string;
    };

    if (!body.title || !body.title.trim()) {
      return NextResponse.json(
        { error: "Article title is required" },
        { status: 400 }
      );
    }

    const result = await saveBlogArticle(body, body.previousSlug);
    if (!result.success || !result.article) {
      return NextResponse.json(
        { error: result.error || "Failed to save blog article" },
        { status: 500 }
      );
    }

    revalidatePath("/blog");
    revalidatePath(`/blog/${result.article.slug}`);
    revalidatePath("/sitemap.xml");

    return NextResponse.json(result.article, { status: 201 });
  } catch (err) {
    console.error("[POST /api/admin/blog]", err);
    return NextResponse.json(
      { error: "Failed to create blog article" },
      { status: 500 }
    );
  }
}
