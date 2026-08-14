import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import { PageContent } from "@/models/PageContent";
import { requireAuth } from "@/lib/authGuard";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await dbConnect();
    const page = await PageContent.findOne({
      $or: [{ _id: id }, { slug: id }],
    }).lean();
    if (!page) {
      return NextResponse.json({ error: "Page not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true, page });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { response: authRes } = await requireAuth("editor");
    if (authRes) return authRes;

    const { id } = await params;
    const body = await request.json();
    await dbConnect();

    const page = await PageContent.findByIdAndUpdate(id, body, {
      new: true,
      runValidators: true,
    });
    if (!page) {
      return NextResponse.json({ error: "Page not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true, page });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
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
    await dbConnect();
    const page = await PageContent.findByIdAndDelete(id);
    if (!page) {
      return NextResponse.json({ error: "Page not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
