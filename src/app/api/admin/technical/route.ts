import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import { TechnicalContent } from "@/models/TechnicalContent";
import { requireAuth } from "@/lib/authGuard";

export async function GET() {
  try {
    await dbConnect();
    let content = await TechnicalContent.findOne({ key: "main" }).lean();
    if (!content) {
      content = {
        key: "main",
        manufacturingProcess: [],
        materialComparison: { rows: [] },
        clientTestimonials: [],
        ceramicCompare: { headers: [], rows: [] },
      } as any;
    }
    return NextResponse.json({ success: true, content });
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

    const content = await TechnicalContent.findOneAndUpdate(
      { key: "main" },
      { $set: body },
      { new: true, upsert: true, runValidators: true }
    );

    return NextResponse.json({ success: true, content });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
