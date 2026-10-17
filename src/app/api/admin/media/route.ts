import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { uploadToSupabaseStorage } from "@/lib/supabaseStorage";
import { requireAuth } from "@/lib/authGuard";
import { execFile } from "child_process";
import { promisify } from "util";
import fs from "fs/promises";
import path from "path";
import os from "os";

const execFileAsync = promisify(execFile);

export const dynamic = "force-dynamic";
export const maxDuration = 120;

const SUPABASE_MAX_BYTES = 48 * 1024 * 1024; // 48 MB safe threshold under Supabase 50 MB limit

async function optimizeLargeVideoForSupabase(inputBuffer: Buffer, originalName: string): Promise<Buffer> {
  const tmpDir = os.tmpdir();
  const stamp = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const ext = path.extname(originalName) || ".mp4";
  const inPath = path.join(tmpDir, `dsp-in-${stamp}${ext}`);
  const outPath = path.join(tmpDir, `dsp-out-${stamp}.mp4`);

  try {
    await fs.writeFile(inPath, inputBuffer);

    // Get video duration via ffprobe so we can calculate the highest possible bitrate that stays under 45 MB
    let durationSec = 45;
    try {
      const { stdout } = await execFileAsync("ffprobe", [
        "-v",
        "error",
        "-show_entries",
        "format=duration",
        "-of",
        "default=noprint_wrappers=1:nokey=1",
        inPath,
      ]);
      const parsed = parseFloat(stdout.trim());
      if (parsed > 0 && Number.isFinite(parsed)) {
        durationSec = parsed;
      }
    } catch {
      // Fallback to 45s if ffprobe fails
    }

    // Target 44 MB total size (in bits) minus 128 kbps audio
    const targetTotalBits = 44 * 1024 * 1024 * 8;
    const maxVideoBitrateKbps = Math.max(
      2500,
      Math.min(8200, Math.floor(targetTotalBits / durationSec / 1000) - 160)
    );

    // Encode at Full HD 1920x1080 (square pixels SAR 1:1), High Profile, CRF 19 capped at maxVideoBitrateKbps
    await execFileAsync("ffmpeg", [
      "-y",
      "-i",
      inPath,
      "-vf",
      "scale=1920:1080:force_original_aspect_ratio=decrease,pad=1920:1080:(ow-iw)/2:(oh-ih)/2,setsar=1:1",
      "-c:v",
      "libx264",
      "-profile:v",
      "high",
      "-level",
      "4.1",
      "-preset",
      "fast",
      "-crf",
      "19",
      "-maxrate",
      `${maxVideoBitrateKbps}k`,
      "-bufsize",
      `${maxVideoBitrateKbps * 2}k`,
      "-pix_fmt",
      "yuv420p",
      "-movflags",
      "+faststart",
      "-c:a",
      "aac",
      "-b:a",
      "128k",
      outPath,
    ]);

    const optimizedBuffer = await fs.readFile(outPath);
    return optimizedBuffer;
  } finally {
    await fs.unlink(inPath).catch(() => {});
    await fs.unlink(outPath).catch(() => {});
  }
}

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
      let buffer: Buffer = Buffer.from(await file.arrayBuffer());
      const isVideo =
        file.type.startsWith("video/") ||
        /\.(mp4|webm|mov|m4v)$/i.test(file.name);

      // If video exceeds Supabase Free Plan's 50MB limit, automatically optimize to Full HD 1080p under 45MB
      if (isVideo && buffer.byteLength > SUPABASE_MAX_BYTES) {
        try {
          buffer = await optimizeLargeVideoForSupabase(buffer, file.name);
        } catch (optErr) {
          console.warn("Video auto-optimization warning:", optErr);
        }
      }

      const safeName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
      const storagePath = `${folder}/${safeName}`;

      const uploadRes = await uploadToSupabaseStorage(
        storagePath,
        buffer,
        file.type || (isVideo ? "video/mp4" : "application/octet-stream")
      );
      const fileUrl = uploadRes.url;

      const { data: mediaRecord, error } = await supabase
        .from("media")
        .insert({
          filename: safeName,
          original_name: file.name,
          url: fileUrl,
          path: storagePath,
          mime_type: file.type || (isVideo ? "video/mp4" : "application/octet-stream"),
          size: buffer.byteLength,
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
    const msg =
      err instanceof Error ? err.message : "Failed to upload media to storage";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
