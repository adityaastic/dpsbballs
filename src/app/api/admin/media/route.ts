import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { uploadToSupabaseStorage } from "@/lib/supabaseStorage";
import { requireAuth } from "@/lib/authGuard";

export async function GET() {
  try {
    const supabase = getSupabaseAdmin();
    const { data: media, error } = await supabase
      .from("media")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      throw error;
    }

    const mapped = (media || []).map((m) => ({
      _id: m.id,
      id: m.id,
      filename: m.filename,
      originalName: m.original_name,
      url: m.url,
      path: m.path,
      mimeType: m.mime_type,
      size: m.size,
      folder: m.folder,
      alt: m.alt,
      createdAt: m.created_at,
      updatedAt: m.updated_at,
    }));

    return NextResponse.json({ success: true, media: mapped });
  } catch (err: unknown) {
    console.error("Media GET error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
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

    const supabase = getSupabaseAdmin();
    const uploaded = [];

    for (const file of files) {
      const buffer = Buffer.from(await file.arrayBuffer());
      const safeName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
      const storagePath = `${folder}/${safeName}`;

      let fileUrl = "";
      try {
        const uploadRes = await uploadToSupabaseStorage(
          storagePath,
          buffer,
          file.type || "application/octet-stream"
        );
        fileUrl = uploadRes.url;
      } catch (storageErr) {
        console.warn("Storage upload warning, using direct endpoint fallback:", storageErr);
        fileUrl = `/api/media/file/${safeName}`;
      }

      const { data: mediaRecord, error } = await supabase
        .from("media")
        .insert({
          filename: safeName,
          original_name: file.name,
          url: fileUrl,
          path: storagePath,
          mime_type: file.type || "application/octet-stream",
          size: file.size,
          folder,
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      uploaded.push({
        ...mediaRecord,
        _id: mediaRecord.id,
        originalName: mediaRecord.original_name,
        mimeType: mediaRecord.mime_type,
      });
    }

    return NextResponse.json({ success: true, media: uploaded }, { status: 201 });
  } catch (err: unknown) {
    console.error("Media POST upload error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
