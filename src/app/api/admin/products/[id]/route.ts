import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import slugify from "slugify";
import { getSupabaseAdmin } from "@/lib/supabase";
import { requireAuth } from "@/lib/authGuard";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = getSupabaseAdmin();

    const query = supabase.from("products").select("*");
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

    const { data: product, error } = isUuid
      ? await query.eq("id", id).maybeSingle()
      : await query.eq("slug", id).maybeSingle();

    if (error || !product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      product: {
        ...product,
        _id: product.id,
        imageUrl: product.image_url,
      },
    });
  } catch (err: unknown) {
    console.error("Product GET by ID error:", err);
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
    if (body.short !== undefined) updateData.short = body.short;
    if (body.description !== undefined) updateData.description = body.description;
    if (body.imageUrl !== undefined || body.image_url !== undefined) {
      updateData.image_url = body.imageUrl ?? body.image_url;
    }
    if (body.highlights !== undefined) updateData.highlights = body.highlights;
    if (body.grades !== undefined) updateData.grades = body.grades;
    if (body.specs !== undefined) updateData.specs = body.specs;
    if (body.tables !== undefined) updateData.tables = body.tables;
    if (body.order !== undefined) updateData.order = body.order;
    if (body.published !== undefined) updateData.published = body.published;

    if (body.slug) {
      updateData.slug = slugify(body.slug.trim(), { lower: true, strict: true });
    } else if (body.title && !body.slug) {
      updateData.slug = slugify(body.title, { lower: true, strict: true });
    }

    const { data: product, error } = await supabase
      .from("products")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error || !product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    try {
      revalidatePath("/products");
      revalidatePath(`/products/${product.slug}`);
      revalidatePath("/");
    } catch {}

    return NextResponse.json({
      success: true,
      product: {
        ...product,
        _id: product.id,
        imageUrl: product.image_url,
      },
    });
  } catch (err: unknown) {
    console.error("Product PUT error:", err);
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

    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    try {
      revalidatePath("/products");
      revalidatePath("/");
    } catch {}

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    console.error("Product DELETE error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
