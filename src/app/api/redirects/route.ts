import { NextResponse } from "next/server";
import { getTechnicalSeoConfig } from "@/lib/seoCms";

export const revalidate = 300;

export async function GET() {
  try {
    const config = await getTechnicalSeoConfig();
    const activeRedirects = (config.redirects || []).filter((r) => r.active);
    return NextResponse.json(
      { redirects: activeRedirects },
      {
        headers: {
          "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
        },
      }
    );
  } catch {
    return NextResponse.json({ redirects: [] });
  }
}
