import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { requireAuth } from "@/lib/authGuard";
import {
  getBlogArticleBySlug,
  saveBlogArticle,
  deleteBlogArticle,
  BlogArticleRecord,
} from "@/lib/seoCms";

export const dynamic = "force-dynamic";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { response } = await requireAuth("editor");
  if (response) return response;

  try {
    const { slug } = await params;
    const article = await getBlogArticleBySlug(slug);
    if (!article) {
      return NextResponse.json({ error: "Article not found" }, { status: 404 });
    }
    return NextResponse.json(article);
  } catch (err) {
    console.error("[GET /api/admin/blog/[slug]]", err);
    return NextResponse.json(
      { error: "Failed to fetch article" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { response } = await requireAuth("editor");
  if (response) return response;

  try {
    const { slug } = await params;
    const body = (await request.json()) as Partial<BlogArticleRecord>;

    const result = await saveBlogArticle(body, slug);
    if (!result.success || !result.article) {
      return NextResponse.json(
        { error: result.error || "Failed to update article" },
        { status: 500 }
      );
    }

    revalidatePath("/blog");
    revalidatePath(`/blog/${slug}`);
    revalidatePath(`/blog/${result.article.slug}`);
    revalidatePath("/sitemap.xml");

    return NextResponse.json(result.article);
  } catch (err) {
    console.error("[PUT /api/admin/blog/[slug]]", err);
    return NextResponse.json(
      { error: "Failed to update article" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { response } = await requireAuth("editor");
  if (response) return response;

  try {
    const { slug } = await params;
    const ok = await deleteBlogArticle(slug);
    if (!ok) {
      return NextResponse.json(
        { error: "Failed to delete article" },
        { status: 500 }
      );
    }

    revalidatePath("/blog");
    revalidatePath(`/blog/${slug}`);
    revalidatePath("/sitemap.xml");

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[DELETE /api/admin/blog/[slug]]", err);
    return NextResponse.json(
      { error: "Failed to delete article" },
      { status: 500 }
    );
  }
}
