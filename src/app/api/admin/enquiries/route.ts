import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import { Enquiry } from "@/models/Enquiry";
import { requireAuth } from "@/lib/authGuard";

export async function GET(request: NextRequest) {
  try {
    const { response: authRes } = await requireAuth("editor");
    if (authRes) return authRes;

    await dbConnect();
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type");
    const unreadOnly = searchParams.get("unread") === "true";

    const query: any = {};
    if (type) query.type = type;
    if (unreadOnly) query.read = false;

    const enquiries = await Enquiry.find(query).sort({ createdAt: -1 }).lean();
    const unreadCount = await Enquiry.countDocuments({ read: false });

    return NextResponse.json({
      success: true,
      enquiries,
      unreadCount,
      total: enquiries.length,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
