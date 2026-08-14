import { NextResponse } from "next/server";
import { verifySession } from "@/lib/auth";
import { dbConnect } from "@/lib/db";
import { Admin } from "@/models/Admin";

export async function GET() {
  try {
    const session = await verifySession();
    if (!session) {
      return NextResponse.json({ user: null }, { status: 401 });
    }

    await dbConnect();
    const admin = await Admin.findById(session.id).select("-password");
    if (!admin) {
      return NextResponse.json({ user: null }, { status: 401 });
    }

    return NextResponse.json({
      user: {
        id: admin._id,
        username: admin.username,
        email: admin.email,
        role: admin.role,
        name: admin.name,
      },
    });
  } catch (error) {
    return NextResponse.json({ user: null }, { status: 401 });
  }
}
