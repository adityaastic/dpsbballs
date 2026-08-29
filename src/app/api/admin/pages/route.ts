import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { requireAuth } from "@/lib/authGuard";

export async function GET() {
  try {
    const supabase = getSupabaseAdmin();
    const { data: pages, error } = await supabase
      .from("page_contents")
      .select("*")
      .order("slug", { ascending: true });

    if (error) {
      throw error;
    }

    const mapped = (pages || []).map((p) => ({
      _id: p.id,
      id: p.id,
      slug: p.slug,
      title: p.title,
      heroEyebrow: p.hero_eyebrow,
      heroTitle: p.hero_title,
      heroDescription: p.hero_description,
      sections: p.sections || [],
      bodyHtml: p.body_html,
      createdAt: p.created_at,
      updatedAt: p.updated_at,
    }));

    return NextResponse.json({ success: true, pages: mapped });
  } catch (err: unknown) {
    console.error("Pages GET error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { response: authRes } = await requireAuth("editor");
    if (authRes) return authRes;

    const body = await request.json();
    const supabase = getSupabaseAdmin();

    const insertData = {
      slug: body.slug,
      title: body.title,
      hero_eyebrow: body.heroEyebrow ?? body.hero_eyebrow,
      hero_title: body.heroTitle ?? body.hero_title,
      hero_description: body.heroDescription ?? body.hero_description,
      sections: body.sections || [],
      body_html: body.bodyHtml ?? body.body_html,
    };

    const { data: page, error } = await supabase
      .from("page_contents")
      .insert(insertData)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json(
      {
        success: true,
        page: {
          ...page,
          _id: page.id,
          heroEyebrow: page.hero_eyebrow,
          heroTitle: page.hero_title,
          heroDescription: page.hero_description,
          bodyHtml: page.body_html,
        },
      },
      { status: 201 }
    );
  } catch (err: unknown) {
    console.error("Pages POST error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
