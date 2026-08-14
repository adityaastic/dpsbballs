import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import { Enquiry } from "@/models/Enquiry";
import { requireAuth } from "@/lib/authGuard";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { response: authRes } = await requireAuth("editor");
    if (authRes) return authRes;

    const { id } = await params;
    await dbConnect();
    const enquiry = await Enquiry.findByIdAndUpdate(
      id,
      { read: true },
      { new: true }
    ).lean();
    if (!enquiry) {
      return NextResponse.json({ error: "Enquiry not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true, enquiry });
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
    const enquiry = await Enquiry.findByIdAndDelete(id);
    if (!enquiry) {
      return NextResponse.json({ error: "Enquiry not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { response: authRes } = await requireAuth("editor");
    if (authRes) return authRes;

    const { id } = await params;
    const body = await request.json();
    await dbConnect();

    const enquiry = await Enquiry.findByIdAndUpdate(id, body, {
      new: true,
    }).lean();
    if (!enquiry) {
      return NextResponse.json({ error: "Enquiry not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true, enquiry });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
