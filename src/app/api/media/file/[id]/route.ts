import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { getSupabasePublicUrl } from "@/lib/supabaseStorage";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = getSupabaseAdmin();

    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
    const query = supabase.from("media").select("*");
    const { data: media } = isUuid
      ? await query.eq("id", id).maybeSingle()
      : await query.or(`filename.eq.${id},path.eq.${id}`).maybeSingle();

    if (media?.url?.startsWith("http")) {
      const res = NextResponse.redirect(media.url, 308);
      res.headers.set("Cache-Control", "public, max-age=31536000, s-maxage=31536000, immutable");
      return res;
    }

    if (media?.path) {
      const publicUrl = getSupabasePublicUrl(media.path);
      const res = NextResponse.redirect(publicUrl, 308);
      res.headers.set("Cache-Control", "public, max-age=31536000, s-maxage=31536000, immutable");
      return res;
    }

    return NextResponse.json({ error: "File not found" }, { status: 404 });
  } catch (err: unknown) {
    console.error("Media file serve error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
