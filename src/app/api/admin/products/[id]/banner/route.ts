import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { requireAuth } from "@/lib/authGuard";
import { getSupabaseAdmin } from "@/lib/supabase";
import {
  getProductBannerConfig,
  saveProductBannerConfig,
  resetProductBannerConfig,
  ProductBannerConfig,
} from "@/lib/productBanners";

export const dynamic = "force-dynamic";

async function resolveProductSlugAndId(idOrSlug: string): Promise<{
  productId?: string;
  productSlug: string;
}> {
  const supabase = getSupabaseAdmin();
  const isUuid =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
      idOrSlug
    );

  const query = supabase.from("products").select("id, slug");
  const { data } = isUuid
    ? await query.eq("id", idOrSlug).maybeSingle()
    : await query.eq("slug", idOrSlug).maybeSingle();

  if (data) {
    return {
      productId: data.id,
      productSlug: data.slug,
    };
  }

  return {
    productSlug: idOrSlug
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, ""),
  };
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { productId, productSlug } = await resolveProductSlugAndId(id);
    const banner = await getProductBannerConfig(productSlug, productId);
    return NextResponse.json({ success: true, banner });
  } catch (err) {
    console.error("[GET /api/admin/products/[id]/banner]", err);
    return NextResponse.json(
      { error: "Failed to load product banner" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // Strictly enforce admin-only authorization on the server
  const { response: authRes, session } = await requireAuth("admin");
  if (authRes || !session) {
    return (
      authRes ||
      NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    );
  }

  try {
    const { id } = await params;
    const body = (await request.json()) as Partial<ProductBannerConfig> & {
      updateProductImageUrl?: string;
    };

    const { productId, productSlug } = await resolveProductSlugAndId(id);

    if (!productSlug) {
      return NextResponse.json(
        { error: "Invalid product identifier" },
        { status: 400 }
      );
    }

    // Validate banner media URL if custom image or video is selected
    if (
      (body.bannerType === "image" || body.bannerType === "video") &&
      (!body.bannerMediaUrl || !body.bannerMediaUrl.trim())
    ) {
      return NextResponse.json(
        {
          error: `Please upload or select a ${body.bannerType} URL before saving, or switch to Default Orange Banner.`,
        },
        { status: 400 }
      );
    }

    const saved = await saveProductBannerConfig(
      productSlug,
      {
        ...body,
        productId: productId || body.productId,
      },
      session.username
    );

    // Optionally update the product's primary image_url if requested by the admin
    if (body.updateProductImageUrl !== undefined && productId) {
      const supabase = getSupabaseAdmin();
      await supabase
        .from("products")
        .update({
          image_url: body.updateProductImageUrl,
          updated_at: new Date().toISOString(),
        })
        .eq("id", productId);
    }

    try {
      revalidatePath(`/products/${productSlug}`);
      revalidatePath("/products");
    } catch {
      // ignore revalidation errors in dev
    }

    return NextResponse.json({
      success: true,
      banner: saved,
    });
  } catch (err) {
    console.error("[PUT /api/admin/products/[id]/banner]", err);
    return NextResponse.json(
      { error: "Failed to save product banner configuration" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // Strictly enforce admin-only authorization on the server
  const { response: authRes, session } = await requireAuth("admin");
  if (authRes || !session) {
    return (
      authRes ||
      NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    );
  }

  try {
    const { id } = await params;
    const { productSlug } = await resolveProductSlugAndId(id);

    const reset = await resetProductBannerConfig(productSlug);

    try {
      revalidatePath(`/products/${productSlug}`);
      revalidatePath("/products");
    } catch {}

    return NextResponse.json({
      success: true,
      banner: reset,
    });
  } catch (err) {
    console.error("[DELETE /api/admin/products/[id]/banner]", err);
    return NextResponse.json(
      { error: "Failed to reset product banner" },
      { status: 500 }
    );
  }
}
