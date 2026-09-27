import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getSupabaseAdmin } from "@/lib/supabase";
import { requireAuth } from "@/lib/authGuard";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = getSupabaseAdmin();

    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
    const query = supabase.from("page_contents").select("*");
    const { data: page, error } = isUuid
      ? await query.eq("id", id).maybeSingle()
      : await query.eq("slug", id).maybeSingle();

    if (error || !page) {
      return NextResponse.json({ error: "Page not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      page: {
        ...page,
        _id: page.id,
        heroEyebrow: page.hero_eyebrow,
        heroTitle: page.hero_title,
        heroDescription: page.hero_description,
        bodyHtml: page.body_html,
      },
    });
  } catch (err: unknown) {
    console.error("Page GET by ID error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { response: authRes } = await requireAuth("editor");
    if (authRes) return authRes;

    const { id } = await params;
    const body = await request.json();
    const supabase = getSupabaseAdmin();

    const updateData: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    if (body.title !== undefined) updateData.title = body.title;
    if (body.slug !== undefined) updateData.slug = body.slug;
    if (body.heroEyebrow !== undefined || body.hero_eyebrow !== undefined) {
      updateData.hero_eyebrow = body.heroEyebrow ?? body.hero_eyebrow;
    }
    if (body.heroTitle !== undefined || body.hero_title !== undefined) {
      updateData.hero_title = body.heroTitle ?? body.hero_title;
    }
    if (body.heroDescription !== undefined || body.hero_description !== undefined) {
      updateData.hero_description = body.heroDescription ?? body.hero_description;
    }
    if (body.sections !== undefined) updateData.sections = body.sections;
    if (body.bodyHtml !== undefined || body.body_html !== undefined) {
      updateData.body_html = body.bodyHtml ?? body.body_html;
    }

    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
    const updateQuery = supabase.from("page_contents").update(updateData);
    const { data: page, error } = isUuid
      ? await updateQuery.eq("id", id).select().single()
      : await updateQuery.eq("slug", id).select().single();

    if (error || !page) {
      return NextResponse.json({ error: "Page not found" }, { status: 404 });
    }

    try {
      revalidatePath(`/${page.slug}`);
      revalidatePath("/", "layout");
      revalidatePath("/");
    } catch {}

    return NextResponse.json({
      success: true,
      page: {
        ...page,
        _id: page.id,
        heroEyebrow: page.hero_eyebrow,
        heroTitle: page.hero_title,
        heroDescription: page.hero_description,
        bodyHtml: page.body_html,
      },
    });
  } catch (err: unknown) {
    console.error("Page PUT error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { response: authRes } = await requireAuth("admin");
    if (authRes) return authRes;

    const { id } = await params;
    const supabase = getSupabaseAdmin();

    const { error } = await supabase.from("page_contents").delete().eq("id", id);
    if (error) {
      return NextResponse.json({ error: "Page not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    console.error("Page DELETE error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
