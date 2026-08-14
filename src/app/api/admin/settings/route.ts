import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import { SiteSetting } from "@/models/SiteSetting";
import { requireAuth } from "@/lib/authGuard";

export async function GET() {
  try {
    await dbConnect();
    let settings = await SiteSetting.findOne({ key: "main" }).lean();
    if (!settings) {
      settings = {
        key: "main",
        name: "DSP Precision Products Pvt. Ltd.",
        navLinks: [],
        highlights: [],
      } as any;
    }
    return NextResponse.json({ success: true, settings });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { response: authRes } = await requireAuth("editor");
    if (authRes) return authRes;

    const body = await request.json();
    await dbConnect();

    const settings = await SiteSetting.findOneAndUpdate(
      { key: "main" },
      { $set: body },
      { new: true, upsert: true, runValidators: true }
    );

    return NextResponse.json({ success: true, settings });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
