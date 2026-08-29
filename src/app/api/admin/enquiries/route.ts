import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { requireAuth } from "@/lib/authGuard";

export async function GET(request: NextRequest) {
  try {
    const { response: authRes } = await requireAuth("editor");
    if (authRes) return authRes;

    const supabase = getSupabaseAdmin();
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type");
    const unreadOnly = searchParams.get("unread") === "true";

    let query = supabase
      .from("enquiries")
      .select("*")
      .order("created_at", { ascending: false });

    if (type) query = query.eq("type", type);
    if (unreadOnly) query = query.eq("read", false);

    const { data: enquiries, error } = await query;
    if (error) {
      throw error;
    }

    const { count: unreadCount } = await supabase
      .from("enquiries")
      .select("*", { count: "exact", head: true })
      .eq("read", false);

    const mapped = (enquiries || []).map((e) => ({
      _id: e.id,
      id: e.id,
      type: e.type,
      name: e.name,
      email: e.email,
      phone: e.phone,
      company: e.company,
      country: e.country,
      subject: e.subject,
      message: e.message,
      productInterest: e.product_interest,
      quantity: e.quantity,
      size: e.size,
      grade: e.grade,
      application: e.application,
      read: e.read,
      metadata: e.metadata,
      createdAt: e.created_at,
      updatedAt: e.updated_at,
    }));

    return NextResponse.json({
      success: true,
      enquiries: mapped,
      unreadCount: unreadCount ?? 0,
      total: mapped.length,
    });
  } catch (err: unknown) {
    console.error("Enquiries GET error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
