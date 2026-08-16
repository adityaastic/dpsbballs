import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
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
      };
    }
    return NextResponse.json({ success: true, settings });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
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

    try {
      revalidatePath("/", "layout");
      revalidatePath("/");
    } catch (e) {
      console.warn("Revalidation notice:", e);
    }

    return NextResponse.json({ success: true, settings });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
