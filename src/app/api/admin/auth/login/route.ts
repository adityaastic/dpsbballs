import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { getSupabaseAdmin } from "@/lib/supabase";
import { createSession } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json();
    if (!username || !password) {
      return NextResponse.json(
        { error: "Username and password are required" },
        { status: 400 }
      );
    }

    const supabase = getSupabaseAdmin();
    const { data: admin, error } = await supabase
      .from("admins")
      .select("*")
      .or(`username.eq.${username},email.eq.${username}`)
      .maybeSingle();

    if (error || !admin) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    const valid = await bcrypt.compare(password, admin.password);
    if (!valid) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    await createSession({
      id: admin.id,
      username: admin.username,
      email: admin.email,
      role: admin.role,
    });

    return NextResponse.json({
      success: true,
      user: {
        id: admin.id,
        username: admin.username,
        email: admin.email,
        role: admin.role,
        name: admin.name,
      },
    });
  } catch (err: unknown) {
    console.error("Login error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
