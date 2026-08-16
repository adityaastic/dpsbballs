import { NextRequest, NextResponse } from "next/server";
import fs from "fs/promises";
import { dbConnect } from "@/lib/db";
import { Media } from "@/models/Media";
import { requireAuth } from "@/lib/authGuard";
import { deleteFromR2, isR2Configured } from "@/lib/r2";

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { response: authRes } = await requireAuth("admin");
    if (authRes) return authRes;

    const { id } = await params;
    await dbConnect();

    const media = await Media.findById(id).select("+data");
    if (!media) {
      return NextResponse.json({ error: "Media not found" }, { status: 404 });
    }

    const hasDbData = !!media.data;
    const r2Ready = isR2Configured();

    if (media.path && !hasDbData && r2Ready) {
      try {
        await deleteFromR2(media.path);
      } catch (e: any) {
        console.warn("R2 delete failed, proceeding with DB record deletion:", e.message);
      }
    } else if (media.path && !hasDbData) {
      try {
        await fs.unlink(media.path);
      } catch (e) {}
    }

    await Media.findByIdAndDelete(id);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
