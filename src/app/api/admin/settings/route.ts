import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getSupabaseAdmin } from "@/lib/supabase";
import { requireAuth } from "@/lib/authGuard";
import { site as staticSite, navLinks as staticNav, heroSlides as staticHeroSlides } from "@/data/site";

export async function GET() {
  try {
    const supabase = getSupabaseAdmin();
    const { data: settings, error } = await supabase
      .from("site_settings")
      .select("*")
      .eq("key", "main")
      .maybeSingle();

    if (error || !settings) {
      return NextResponse.json({
        success: true,
        settings: {
          key: "main",
          name: staticSite.name,
          shortName: staticSite.shortName,
          tagline: staticSite.tagline,
          logoUrl: "",
          logoDarkUrl: "",
          faviconUrl: "",
          email: staticSite.email,
          phoneWork: staticSite.phoneWork,
          phoneRegd: staticSite.phoneRegd,
          phoneFax: staticSite.phoneFax,
          mobile: staticSite.mobile,
          whatsapp: staticSite.whatsapp || "",
          workOffice: staticSite.workOffice,
          regdOffice: staticSite.regdOffice,
          highlights: staticSite.highlights,
          navLinks: staticNav,
          heroSlides: staticHeroSlides,
          seoTitle: "DSP Precision Products | Precision Balls Manufacturer",
          seoDescription:
            "DSP Precision Products Pvt. Ltd. — manufacturer & exporter of steel, stainless steel, carbide, ceramic, brass, copper, gauge and modified precision balls from Baddi, India.",
        },
      });
    }

    const mapped = {
      _id: settings.id,
      id: settings.id,
      key: settings.key,
      name: settings.name,
      shortName: settings.short_name,
      tagline: settings.tagline,
      logoUrl: settings.logo_url,
      logoDarkUrl: settings.logo_dark_url,
      faviconUrl: settings.favicon_url,
      email: settings.email,
      phoneWork: settings.phone_work,
      phoneRegd: settings.phone_regd,
      phoneFax: settings.phone_fax,
      mobile: settings.mobile,
      whatsapp: settings.whatsapp,
      workOffice: settings.work_office,
      regdOffice: settings.regd_office,
      highlights: settings.highlights || [],
      navLinks: settings.nav_links || [],
      heroSlides: settings.hero_slides || [],
      seoTitle: settings.seo_title,
      seoDescription: settings.seo_description,
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

    const updatePayload: Record<string, unknown> = {
      key: "main",
      updated_at: new Date().toISOString(),
    };

    if (body.name !== undefined) updatePayload.name = body.name;
    if (body.shortName !== undefined || body.short_name !== undefined) {
      updatePayload.short_name = body.shortName ?? body.short_name;
    }
    if (body.tagline !== undefined) updatePayload.tagline = body.tagline;
    if (body.logoUrl !== undefined || body.logo_url !== undefined) {
      updatePayload.logo_url = body.logoUrl ?? body.logo_url;
    }
    if (body.logoDarkUrl !== undefined || body.logo_dark_url !== undefined) {
      updatePayload.logo_dark_url = body.logoDarkUrl ?? body.logo_dark_url;
    }
    if (body.faviconUrl !== undefined || body.favicon_url !== undefined) {
      updatePayload.favicon_url = body.faviconUrl ?? body.favicon_url;
    }
    if (body.email !== undefined) updatePayload.email = body.email;
    if (body.phoneWork !== undefined || body.phone_work !== undefined) {
      updatePayload.phone_work = body.phoneWork ?? body.phone_work;
    }
    if (body.phoneRegd !== undefined || body.phone_regd !== undefined) {
      updatePayload.phone_regd = body.phoneRegd ?? body.phone_regd;
    }
    if (body.phoneFax !== undefined || body.phone_fax !== undefined) {
      updatePayload.phone_fax = body.phoneFax ?? body.phone_fax;
    }
    if (body.mobile !== undefined) updatePayload.mobile = body.mobile;
    if (body.whatsapp !== undefined) updatePayload.whatsapp = body.whatsapp;
    if (body.workOffice !== undefined || body.work_office !== undefined) {
      updatePayload.work_office = body.workOffice ?? body.work_office;
    }
    if (body.regdOffice !== undefined || body.regd_office !== undefined) {
      updatePayload.regd_office = body.regdOffice ?? body.regd_office;
    }
    if (body.highlights !== undefined) updatePayload.highlights = body.highlights;
    if (body.navLinks !== undefined || body.nav_links !== undefined) {
      updatePayload.nav_links = body.navLinks ?? body.nav_links;
    }
    if (body.heroSlides !== undefined || body.hero_slides !== undefined) {
      updatePayload.hero_slides = body.heroSlides ?? body.hero_slides;
    }
    if (body.seoTitle !== undefined || body.seo_title !== undefined) {
      updatePayload.seo_title = body.seoTitle ?? body.seo_title;
    }
    if (body.seoDescription !== undefined || body.seo_description !== undefined) {
      updatePayload.seo_description = body.seoDescription ?? body.seo_description;
    }

    const { data: settings, error } = await supabase
      .from("site_settings")
      .upsert(updatePayload, { onConflict: "key" })
      .select()
      .single();

    if (error) {
      throw error;
    }

    try {
      revalidatePath("/", "layout");
      revalidatePath("/");
    } catch (e) {
      console.warn("Revalidation notice:", e);
    }

    const mapped = {
      _id: settings.id,
      id: settings.id,
      key: settings.key,
      name: settings.name,
      shortName: settings.short_name,
      tagline: settings.tagline,
      logoUrl: settings.logo_url,
      logoDarkUrl: settings.logo_dark_url,
      faviconUrl: settings.favicon_url,
      email: settings.email,
      phoneWork: settings.phone_work,
      phoneRegd: settings.phone_regd,
      phoneFax: settings.phone_fax,
      mobile: settings.mobile,
      whatsapp: settings.whatsapp,
      workOffice: settings.work_office,
      regdOffice: settings.regd_office,
      highlights: settings.highlights || [],
      navLinks: settings.nav_links || [],
      heroSlides: settings.hero_slides || [],
      seoTitle: settings.seo_title,
      seoDescription: settings.seo_description,
    };

    return NextResponse.json({ success: true, settings: mapped });
  } catch (err: unknown) {
    console.error("Settings PUT error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
