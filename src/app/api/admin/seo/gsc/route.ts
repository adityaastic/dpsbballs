import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/authGuard";
import { getTechnicalSeoConfig } from "@/lib/seoCms";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const { response } = await requireAuth("editor");
  if (response) return response;

  try {
    const config = await getTechnicalSeoConfig();
    const {
      gscConnected,
      gscPropertyUrl,
      gscAccessToken,
      googleSiteVerification,
      ga4MeasurementId,
    } = config.integrations;

    const daysParam = Number(request.nextUrl.searchParams.get("days") || "28");
    const days = [7, 28, 90].includes(daysParam) ? daysParam : 28;

    if (!gscConnected || !gscAccessToken || !gscPropertyUrl) {
      return NextResponse.json({
        connected: false,
        propertyUrl: gscPropertyUrl || "https://www.dspballs.co.in/",
        googleSiteVerification: googleSiteVerification || "",
        ga4MeasurementId: ga4MeasurementId || "",
        message:
          "Google Search Console API token is not connected. Add a Google Search Console OAuth Access Token in Technical SEO -> Integrations to pull live clicks, impressions, CTR, and average position directly from Google.",
        queries: [],
        pages: [],
        totals: null,
      });
    }

    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - days);

    const fmt = (d: Date) => d.toISOString().split("T")[0];
    const encodedSite = encodeURIComponent(gscPropertyUrl);
    const endpoint = `https://www.googleapis.com/webmasters/v3/sites/${encodedSite}/searchAnalytics/query`;

    const [queriesRes, pagesRes] = await Promise.all([
      fetch(endpoint, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${gscAccessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          startDate: fmt(startDate),
          endDate: fmt(endDate),
          dimensions: ["query"],
          rowLimit: 25,
        }),
      }),
      fetch(endpoint, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${gscAccessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          startDate: fmt(startDate),
          endDate: fmt(endDate),
          dimensions: ["page"],
          rowLimit: 25,
        }),
      }),
    ]);

    if (!queriesRes.ok) {
      const errText = await queriesRes.text();
      return NextResponse.json({
        connected: false,
        propertyUrl: gscPropertyUrl,
        error: `Google Search Console API returned ${queriesRes.status}. Verify your OAuth Access Token and property URL.`,
        details: errText.slice(0, 300),
        queries: [],
        pages: [],
        totals: null,
      });
    }

    const queriesData = await queriesRes.json();
    const pagesData = pagesRes.ok ? await pagesRes.json() : { rows: [] };

    const queries = (queriesData.rows || []).map((r: any) => ({
      query: r.keys?.[0] || "",
      clicks: r.clicks || 0,
      impressions: r.impressions || 0,
      ctr: Number(((r.ctr || 0) * 100).toFixed(2)),
      position: Number((r.position || 0).toFixed(1)),
    }));

    const pages = (pagesData.rows || []).map((r: any) => ({
      page: r.keys?.[0] || "",
      clicks: r.clicks || 0,
      impressions: r.impressions || 0,
      ctr: Number(((r.ctr || 0) * 100).toFixed(2)),
      position: Number((r.position || 0).toFixed(1)),
    }));

    const totalClicks = pages.reduce((acc: number, p: any) => acc + p.clicks, 0);
    const totalImpressions = pages.reduce(
      (acc: number, p: any) => acc + p.impressions,
      0
    );
    const avgCtr =
      totalImpressions > 0
        ? Number(((totalClicks / totalImpressions) * 100).toFixed(2))
        : 0;
    const avgPosition =
      pages.length > 0
        ? Number(
            (
              pages.reduce((acc: number, p: any) => acc + p.position, 0) /
              pages.length
            ).toFixed(1)
          )
        : 0;

    return NextResponse.json({
      connected: true,
      propertyUrl: gscPropertyUrl,
      days,
      totals: {
        clicks: totalClicks,
        impressions: totalImpressions,
        ctr: avgCtr,
        position: avgPosition,
      },
      queries,
      pages,
    });
  } catch (err) {
    console.error("[GET /api/admin/seo/gsc]", err);
    return NextResponse.json(
      { error: "Failed to query Google Search Console status" },
      { status: 500 }
    );
  }
}
