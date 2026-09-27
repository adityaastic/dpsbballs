import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getSupabaseAdmin } from "@/lib/supabase";
import { requireAuth } from "@/lib/authGuard";
import { site as staticSite, navLinks as staticNav, heroSlides as staticHeroSlides } from "@/data/site";

export async function GET() {
  try {
    const supabase = getSupabaseAdmin();
    const { data: rows, error } = await supabase
      .from("site_settings")
      .select("*")
      .in("key", ["main", "seo"]);

    if (error) {
      console.warn("Settings fetch warning:", error);
    }

    const settings = rows?.find((r) => r.key === "main");
    const seoRow = rows?.find((r) => r.key === "seo");

    const mapped = {
      _id: settings?.id || "main",
      id: settings?.id || "main",
      key: "main",
      name: settings?.name || staticSite.name,
      shortName: settings?.short_name || staticSite.shortName,
      tagline: settings?.tagline || staticSite.tagline,
      logoUrl: settings?.logo_url || "",
      logoDarkUrl: settings?.logo_dark_url || "",
      faviconUrl: settings?.favicon_url || "",
      email: settings?.email || staticSite.email,
      phoneWork: settings?.phone_work || staticSite.phoneWork,
      phoneRegd: settings?.phone_regd || staticSite.phoneRegd,
      phoneFax: settings?.phone_fax || staticSite.phoneFax,
      mobile: settings?.mobile || staticSite.mobile,
      whatsapp: settings?.whatsapp || staticSite.whatsapp || "",
      workOffice: settings?.work_office || staticSite.workOffice,
      regdOffice: settings?.regd_office || staticSite.regdOffice,
      highlights: settings?.highlights || staticSite.highlights || [],
      navLinks: settings?.nav_links || staticNav || [],
      heroSlides: settings?.hero_slides || staticHeroSlides || [],
      // Complete SEO Fields
      seoTitle:
        seoRow?.seo_title ||
        settings?.seo_title ||
        "DSP Precision Products Pvt. Ltd. | Precision Balls Manufacturer & Exporter India",
      seoDescription:
        seoRow?.seo_description ||
        settings?.seo_description ||
        "DSP Precision Products Pvt. Ltd. — Leading manufacturer & exporter of AFBMA, DIN & ISO precision steel, stainless steel, carbide, ceramic, brass, copper and gauge balls from Baddi, Himachal Pradesh, India.",
      seoKeywords:
        seoRow?.tagline ||
        "precision balls manufacturer, steel balls Baddi, stainless steel balls manufacturer India, tungsten carbide balls, ceramic balls manufacturer, brass balls, copper balls, gauge balls, AFBMA balls, DIN ISO precision balls, DSP Precision Products",
      ogImageUrl:
        seoRow?.logo_url ||
        settings?.logo_url ||
        "https://www.dspballs.co.in/images/certifications/gsci-cert.jpg",
      googleVerification: seoRow?.email || "",
      bingVerification: seoRow?.phone_work || "",
      googleAnalyticsId: seoRow?.phone_regd || "",
      canonicalUrl: seoRow?.phone_fax || "https://www.dspballs.co.in",
      robotsDirective: seoRow?.whatsapp || "index, follow",
    };

    return NextResponse.json({ success: true, settings: mapped });
  } catch (err: unknown) {
    console.error("Settings GET error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { response: authRes } = await requireAuth("editor");
    if (authRes) return authRes;

    const body = await request.json();
    const supabase = getSupabaseAdmin();

    const mainPayload: Record<string, unknown> = {
      key: "main",
      updated_at: new Date().toISOString(),
    };

    if (body.name !== undefined) mainPayload.name = body.name;
    if (body.shortName !== undefined || body.short_name !== undefined) {
      mainPayload.short_name = body.shortName ?? body.short_name;
    }
    if (body.tagline !== undefined) mainPayload.tagline = body.tagline;
    if (body.logoUrl !== undefined || body.logo_url !== undefined) {
      mainPayload.logo_url = body.logoUrl ?? body.logo_url;
    }
    if (body.logoDarkUrl !== undefined || body.logo_dark_url !== undefined) {
      mainPayload.logo_dark_url = body.logoDarkUrl ?? body.logo_dark_url;
    }
    if (body.faviconUrl !== undefined || body.favicon_url !== undefined) {
      mainPayload.favicon_url = body.faviconUrl ?? body.favicon_url;
    }
    if (body.email !== undefined) mainPayload.email = body.email;
    if (body.phoneWork !== undefined || body.phone_work !== undefined) {
      mainPayload.phone_work = body.phoneWork ?? body.phone_work;
    }
    if (body.phoneRegd !== undefined || body.phone_regd !== undefined) {
      mainPayload.phone_regd = body.phoneRegd ?? body.phone_regd;
    }
    if (body.phoneFax !== undefined || body.phone_fax !== undefined) {
      mainPayload.phone_fax = body.phoneFax ?? body.phone_fax;
    }
    if (body.mobile !== undefined) mainPayload.mobile = body.mobile;
    if (body.whatsapp !== undefined) mainPayload.whatsapp = body.whatsapp;
    if (body.workOffice !== undefined || body.work_office !== undefined) {
      mainPayload.work_office = body.workOffice ?? body.work_office;
    }
    if (body.regdOffice !== undefined || body.regd_office !== undefined) {
      mainPayload.regd_office = body.regdOffice ?? body.regd_office;
    }
    if (body.highlights !== undefined) mainPayload.highlights = body.highlights;
    if (body.navLinks !== undefined || body.nav_links !== undefined) {
      mainPayload.nav_links = body.navLinks ?? body.nav_links;
    }
    if (body.heroSlides !== undefined || body.hero_slides !== undefined) {
      mainPayload.hero_slides = body.heroSlides ?? body.hero_slides;
    }
    if (body.seoTitle !== undefined || body.seo_title !== undefined) {
      mainPayload.seo_title = body.seoTitle ?? body.seo_title;
    }
    if (body.seoDescription !== undefined || body.seo_description !== undefined) {
      mainPayload.seo_description = body.seoDescription ?? body.seo_description;
    }

    const { data: updatedMain, error: mainErr } = await supabase
      .from("site_settings")
      .upsert(mainPayload, { onConflict: "key" })
      .select()
      .single();

    if (mainErr) throw mainErr;

    // Save extended SEO settings row
    const seoPayload = {
      key: "seo",
      name: "SEO Settings",
      seo_title: body.seoTitle ?? updatedMain.seo_title ?? "",
      seo_description: body.seoDescription ?? updatedMain.seo_description ?? "",
      tagline: body.seoKeywords ?? "",
      logo_url: body.ogImageUrl ?? updatedMain.logo_url ?? "",
      email: body.googleVerification ?? "",
      phone_work: body.bingVerification ?? "",
      phone_regd: body.googleAnalyticsId ?? "",
      phone_fax: body.canonicalUrl ?? "https://www.dspballs.co.in",
      whatsapp: body.robotsDirective ?? "index, follow",
      updated_at: new Date().toISOString(),
    };

    await supabase
      .from("site_settings")
      .upsert(seoPayload, { onConflict: "key" });

    try {
      revalidatePath("/", "layout");
      revalidatePath("/");
    } catch (e) {
      console.warn("Revalidation notice:", e);
    }

    return NextResponse.json({
      success: true,
      settings: {
        ...body,
        _id: updatedMain.id,
        id: updatedMain.id,
      },
    });
  } catch (err: unknown) {
    console.error("Settings PUT error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
