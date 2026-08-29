import { NextResponse } from "next/server";
import { verifySession } from "@/lib/auth";
import { getSupabaseAdmin } from "@/lib/supabase";

export async function GET() {
  try {
    const session = await verifySession();
    if (!session) {
      return NextResponse.json({ user: null }, { status: 401 });
    }

    const supabase = getSupabaseAdmin();
    const { data: admin, error } = await supabase
      .from("admins")
      .select("id, username, email, role, name")
      .eq("id", session.id)
      .maybeSingle();

    if (error || !admin) {
      // Return session data as fallback if admin record is valid in token
      return NextResponse.json({
        user: {
          id: session.id,
          username: session.username,
          email: session.email,
          role: session.role,
        },
      });
    }

    return NextResponse.json({
      user: {
        id: admin.id,
        username: admin.username,
        email: admin.email,
        role: admin.role,
        name: admin.name,
      },
    });
  } catch {
    return NextResponse.json({ user: null }, { status: 401 });
  }
}
