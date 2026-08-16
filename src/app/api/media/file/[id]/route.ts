import { NextRequest, NextResponse } from "next/server";
import fs from "fs/promises";
import { dbConnect } from "@/lib/db";
import { Media } from "@/models/Media";
import { getFromR2 } from "@/lib/r2";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await dbConnect();

    const media = await Media.findById(id).select("+data").lean();
    if (!media) {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    if (media.url?.startsWith("http")) {
      return NextResponse.redirect(media.url);
    }

    if (media.path && !media.data) {
      const { body, contentType } = await getFromR2(media.path);
      return new NextResponse(new Uint8Array(body), {
        headers: {
          "Content-Type": contentType || media.mimeType || "application/octet-stream",
          "Cache-Control": "public, max-age=31536000, immutable",
        },
      });
    }

    if (media.data) {
      return new NextResponse(media.data, {
        headers: {
          "Content-Type": media.mimeType || "application/octet-stream",
          "Cache-Control": "public, max-age=31536000, immutable",
        },
      });
    }

    if (media.path) {
      const buffer = await fs.readFile(media.path);
      return new NextResponse(buffer, {
        headers: {
          "Content-Type": media.mimeType || "application/octet-stream",
          "Cache-Control": "public, max-age=31536000, immutable",
        },
      });
    }

    return NextResponse.json({ error: "File not found" }, { status: 404 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
