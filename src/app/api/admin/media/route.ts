import { NextRequest, NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import { dbConnect } from "@/lib/db";
import { Media } from "@/models/Media";
import { requireAuth } from "@/lib/authGuard";

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");

async function ensureDir() {
  try {
    await fs.mkdir(UPLOAD_DIR, { recursive: true });
  } catch (e) {}
}

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

    await ensureDir();
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

    for (const file of files) {
      const buffer = Buffer.from(await file.arrayBuffer());
      const safeName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
      const fullPath = path.join(UPLOAD_DIR, safeName);
      await fs.writeFile(fullPath, buffer);

      const url = `/uploads/${safeName}`;
      const media = await Media.create({
        filename: safeName,
        originalName: file.name,
        url,
        path: fullPath,
        mimeType: file.type,
        size: file.size,
        folder,
      });
      uploaded.push(media);
    }

    return NextResponse.json({ success: true, media: uploaded }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
