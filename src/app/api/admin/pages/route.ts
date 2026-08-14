import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import { PageContent } from "@/models/PageContent";
import { requireAuth } from "@/lib/authGuard";

export async function GET() {
  try {
    await dbConnect();
    const pages = await PageContent.find().sort({ slug: 1 }).lean();
    return NextResponse.json({ success: true, pages });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { response: authRes } = await requireAuth("editor");
    if (authRes) return authRes;

    const body = await request.json();
    await dbConnect();
    const page = new PageContent(body);
    await page.save();

    return NextResponse.json({ success: true, page }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
