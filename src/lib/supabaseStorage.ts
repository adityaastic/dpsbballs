import { getSupabaseAdmin } from "./supabase";

export function getBucketName(): string {
  return process.env.SUPABASE_BUCKET_NAME || "media";
}

export function getSupabasePublicUrl(path: string): string {
  const supabase = getSupabaseAdmin();
  const bucket = getBucketName();
  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
}

export async function uploadToSupabaseStorage(
  path: string,
  buffer: Buffer,
  contentType: string
): Promise<{ url: string; path: string }> {
  const supabase = getSupabaseAdmin();
  const bucket = getBucketName();

  const { error } = await supabase.storage.from(bucket).upload(path, buffer, {
    contentType: contentType || "application/octet-stream",
    upsert: true,
  });

  if (error) {
    throw new Error(`Supabase Storage upload failed: ${error.message}`);
  }

  const url = getSupabasePublicUrl(path);
  return { url, path };
}

export async function deleteFromSupabaseStorage(path: string): Promise<void> {
  const supabase = getSupabaseAdmin();
  const bucket = getBucketName();

  const { error } = await supabase.storage.from(bucket).remove([path]);
  if (error) {
    console.warn(`Supabase Storage delete warning: ${error.message}`);
  }
}
