import { NextRequest, NextResponse } from "next/server";
import fs from "fs/promises";
import { dbConnect } from "@/lib/db";
import { Media } from "@/models/Media";
import { requireAuth } from "@/lib/authGuard";

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { response: authRes } = await requireAuth("admin");
    if (authRes) return authRes;

    const { id } = await params;
    await dbConnect();

    const media = await Media.findByIdAndDelete(id);
    if (!media) {
      return NextResponse.json({ error: "Media not found" }, { status: 404 });
    }

    try {
      if (media.path) await fs.unlink(media.path);
    } catch (e) {}

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
