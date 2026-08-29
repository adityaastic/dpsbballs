import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { requireAuth } from "@/lib/authGuard";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { response: authRes } = await requireAuth("editor");
    if (authRes) return authRes;

    const { id } = await params;
    const supabase = getSupabaseAdmin();

    const { data: enquiry, error } = await supabase
      .from("enquiries")
      .update({ read: true, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single();

    if (error || !enquiry) {
      return NextResponse.json({ error: "Enquiry not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      enquiry: {
        ...enquiry,
        _id: enquiry.id,
        productInterest: enquiry.product_interest,
      },
    });
  } catch (err: unknown) {
    console.error("Enquiry GET by ID error:", err);
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

    const { error } = await supabase.from("enquiries").delete().eq("id", id);
    if (error) {
      return NextResponse.json({ error: "Enquiry not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    console.error("Enquiry DELETE error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function PATCH(
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

    if (body.read !== undefined) updateData.read = body.read;
    if (body.notes !== undefined) updateData.notes = body.notes;

    const { data: enquiry, error } = await supabase
      .from("enquiries")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error || !enquiry) {
      return NextResponse.json({ error: "Enquiry not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      enquiry: {
        ...enquiry,
        _id: enquiry.id,
        productInterest: enquiry.product_interest,
      },
    });
  } catch (err: unknown) {
    console.error("Enquiry PATCH error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
