import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import { Media } from "@/models/Media";
import { requireAuth } from "@/lib/authGuard";
import { getPublicUrl, uploadToR2, isR2Configured } from "@/lib/r2";

export async function GET() {
  try {
    await dbConnect();
    const media = await Media.find().sort({ createdAt: -1 }).lean();
    return NextResponse.json({ success: true, media });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { response: authRes } = await requireAuth("editor");
    if (authRes) return authRes;

    const contentType = request.headers.get("content-type") || "";
    if (!contentType.includes("multipart/form-data")) {
      return NextResponse.json(
        { error: "Expected multipart/form-data" },
        { status: 400 }
      );
    }

    const formData = await request.formData();
    const files = formData.getAll("files") as File[];
    const folder = (formData.get("folder") as string) || "general";

    if (!files || files.length === 0) {
      return NextResponse.json({ error: "No files provided" }, { status: 400 });
    }

    await dbConnect();
    const uploaded = [];
    const r2Ready = isR2Configured();

    for (const file of files) {
      const buffer = Buffer.from(await file.arrayBuffer());
      const safeName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
      const key = `${folder}/${safeName}`;

      let useDbFallback = !r2Ready;

      if (r2Ready) {
        try {
          await uploadToR2(key, buffer, file.type || "application/octet-stream");
        } catch (r2Err: any) {
          console.warn("R2 upload failed, falling back to DB storage:", r2Err.message);
          useDbFallback = true;
        }
      }

      const createData: any = {
        filename: safeName,
        originalName: file.name,
        url: `/api/media/file/placeholder`,
        path: key,
        mimeType: file.type,
        size: file.size,
        folder,
      };

      if (useDbFallback) {
        createData.data = buffer;
      }

      const media = await Media.create(createData);

      if (useDbFallback) {
        media.url = `/api/media/file/${media._id}`;
      } else {
        const publicUrl = getPublicUrl(key);
        media.url = publicUrl || `/api/media/file/${media._id}`;
      }
      await media.save();

      const obj = media.toObject();
      delete obj.data;
      uploaded.push(obj);
    }

    return NextResponse.json({ success: true, media: uploaded }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
