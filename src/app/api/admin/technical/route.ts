import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getSupabaseAdmin } from "@/lib/supabase";
import { requireAuth } from "@/lib/authGuard";
import {
  manufacturingProcess,
  materialComparison,
  clientTestimonials,
  ceramicCompareHeaders,
  ceramicCompareRows,
} from "@/data/technical";

export async function GET() {
  try {
    const supabase = getSupabaseAdmin();
    const { data: content, error } = await supabase
      .from("technical_content")
      .select("*")
      .eq("key", "main")
      .maybeSingle();

    if (error || !content) {
      return NextResponse.json({
        success: true,
        content: {
          key: "main",
          manufacturingProcess,
          materialComparison,
          clientTestimonials,
          ceramicCompare: {
            headers: ceramicCompareHeaders,
            rows: ceramicCompareRows,
          },
        },
      });
    }

    const mapped = {
      _id: content.id,
      id: content.id,
      key: content.key,
      manufacturingProcess: content.manufacturing_process || [],
      materialComparison: content.material_comparison || { rows: [] },
      clientTestimonials: content.client_testimonials || [],
      ceramicCompare: content.ceramic_compare || { headers: [], rows: [] },
    };

    return NextResponse.json({ success: true, content: mapped });
  } catch (err: unknown) {
    console.error("Technical GET error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { response: authRes } = await requireAuth("editor");
    if (authRes) return authRes;

    const body = await request.json();
    const supabase = getSupabaseAdmin();

    const updatePayload: Record<string, unknown> = {
      key: "main",
      updated_at: new Date().toISOString(),
    };

    if (body.manufacturingProcess !== undefined || body.manufacturing_process !== undefined) {
      updatePayload.manufacturing_process = body.manufacturingProcess ?? body.manufacturing_process;
    }
    if (body.materialComparison !== undefined || body.material_comparison !== undefined) {
      updatePayload.material_comparison = body.materialComparison ?? body.material_comparison;
    }
    if (body.clientTestimonials !== undefined || body.client_testimonials !== undefined) {
      updatePayload.client_testimonials = body.clientTestimonials ?? body.client_testimonials;
    }
    if (body.ceramicCompare !== undefined || body.ceramic_compare !== undefined) {
      updatePayload.ceramic_compare = body.ceramicCompare ?? body.ceramic_compare;
    }

    const { data: content, error } = await supabase
      .from("technical_content")
      .upsert(updatePayload, { onConflict: "key" })
      .select()
      .single();

    if (error) {
      throw error;
    }

    try {
      revalidatePath("/technical");
    } catch {}

    const mapped = {
      _id: content.id,
      id: content.id,
      key: content.key,
      manufacturingProcess: content.manufacturing_process || [],
      materialComparison: content.material_comparison || { rows: [] },
      clientTestimonials: content.client_testimonials || [],
      ceramicCompare: content.ceramic_compare || { headers: [], rows: [] },
    };

    return NextResponse.json({ success: true, content: mapped });
  } catch (err: unknown) {
    console.error("Technical PUT error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
