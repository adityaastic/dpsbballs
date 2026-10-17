import { NextResponse } from "next/server";
import { getTechnicalSeoConfig } from "@/lib/seoCms";

export const revalidate = 30;

export async function GET() {
  try {
    const config = await getTechnicalSeoConfig();
    const activeRedirects = (config.redirects || []).filter((r) => r.active);
    return NextResponse.json({ redirects: activeRedirects });
  } catch {
    return NextResponse.json({ redirects: [] });
  }
}
