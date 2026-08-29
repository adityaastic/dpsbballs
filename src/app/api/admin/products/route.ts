import { NextRequest, NextResponse } from "next/server";
import slugify from "slugify";
import { getSupabaseAdmin } from "@/lib/supabase";
import { requireAuth } from "@/lib/authGuard";

export async function GET() {
  try {
    const supabase = getSupabaseAdmin();
    const { data: products, error } = await supabase
      .from("products")
      .select("*")
      .order("order", { ascending: true })
      .order("created_at", { ascending: false });

    if (error) {
      throw error;
    }

    const mapped = (products || []).map((p) => ({
      _id: p.id,
      id: p.id,
      slug: p.slug,
      title: p.title,
      short: p.short || "",
      description: p.description || "",
      imageUrl: p.image_url || "",
      highlights: p.highlights || [],
      grades: p.grades || [],
      specs: p.specs || [],
      tables: p.tables || [],
      order: p.order ?? 0,
      published: p.published ?? true,
      createdAt: p.created_at,
      updatedAt: p.updated_at,
    }));

    return NextResponse.json({ success: true, products: mapped });
  } catch (err: unknown) {
    console.error("Products GET error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { response: authRes } = await requireAuth("editor");
    if (authRes) return authRes;

    const body = await request.json();
    const slug =
      body.slug || slugify(body.title || "product", { lower: true, strict: true });

    const supabase = getSupabaseAdmin();
    const { data: product, error } = await supabase
      .from("products")
      .insert({
        slug,
        title: body.title,
        short: body.short,
        description: body.description,
        image_url: body.imageUrl || body.image_url || null,
        highlights: body.highlights || [],
        grades: body.grades || [],
        specs: body.specs || [],
        tables: body.tables || [],
        order: body.order ?? 0,
        published: body.published !== false,
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json(
      {
        success: true,
        product: {
          ...product,
          _id: product.id,
          imageUrl: product.image_url,
        },
      },
      { status: 201 }
    );
  } catch (err: unknown) {
    console.error("Products POST error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
