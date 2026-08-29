import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { deleteFromSupabaseStorage } from "@/lib/supabaseStorage";
import { requireAuth } from "@/lib/authGuard";

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { response: authRes } = await requireAuth("admin");
    if (authRes) return authRes;

    const { id } = await params;
    const supabase = getSupabaseAdmin();

    const { data: media, error: findErr } = await supabase
      .from("media")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (findErr || !media) {
      return NextResponse.json({ error: "Media not found" }, { status: 404 });
    }

    if (media.path) {
      try {
        await deleteFromSupabaseStorage(media.path);
      } catch (storageErr) {
        console.warn("Storage deletion warning:", storageErr);
      }
    }

    const { error: delErr } = await supabase.from("media").delete().eq("id", id);
    if (delErr) {
      return NextResponse.json({ error: "Media deletion failed" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    console.error("Media DELETE error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
