import { getSupabaseAdmin } from "./supabase";
import {
  products as staticProducts,
  Product as StaticProductType,
} from "@/data/products";
import {
  site as staticSite,
  navLinks as staticNav,
  heroSlides as staticHeroSlides,
  HeroSlide,
} from "@/data/site";
import type { SpecItem, TableItem } from "@/data/products";
import {
  manufacturingProcess,
  materialComparison,
  clientTestimonials,
  ceramicCompareHeaders,
  ceramicCompareRows,
} from "@/data/technical";

export type { HeroSlide };

type Highlight = { label: string; value: string };
type Office = { label: string; lines: string[] };
type NavItem = { href: string; label: string; order?: number };

export type PageContentData = {
  id?: string;
  _id?: string;
  slug?: string;
  title?: string;
  heroEyebrow?: string;
  heroTitle?: string;
  heroDescription?: string;
  sections?: Array<{
    key?: string;
    heading?: string;
    subheading?: string;
    body?: string;
    imageUrl?: string;
    order?: number;
    [key: string]: unknown;
  }>;
  bodyHtml?: string;
  [key: string]: unknown;
};

type DbProductRow = {
  id: string;
  slug: string;
  title: string;
  short?: string | null;
  description?: string | null;
  image_url?: string | null;
  highlights?: string[] | null;
  grades?: string[] | null;
  specs?: SpecItem[] | null;
  tables?: TableItem[] | null;
  order?: number | null;
  published?: boolean | null;
};

type DbSiteSettingRow = {
  id: string;
  key: string;
  name: string;
  short_name?: string | null;
  tagline?: string | null;
  logo_url?: string | null;
  logo_dark_url?: string | null;
  favicon_url?: string | null;
  email?: string | null;
  phone_work?: string | null;
  phone_regd?: string | null;
  phone_fax?: string | null;
  mobile?: string | null;
  whatsapp?: string | null;
  work_office?: Office | null;
  regd_office?: Office | null;
  highlights?: Highlight[] | null;
  nav_links?: NavItem[] | null;
  hero_slides?: HeroSlide[] | null;
  seo_title?: string | null;
  seo_description?: string | null;
};

type DbTechnicalRow = {
  id: string;
  key: string;
  manufacturing_process?: Array<{ title: string; text?: string; description?: string; step?: string; order?: number }> | null;
  material_comparison?: { intro?: string; rows?: Array<{ material: string; bestFor?: string; strengths?: string; notes?: string }> } | null;
  client_testimonials?: Array<{ type?: string; author: string; role?: string; quote: string; detail?: string }> | null;
  ceramic_compare?: { headers?: string[]; rows?: string[][] } | null;
};

type DbPageContentRow = {
  id: string;
  slug: string;
  title: string;
  hero_eyebrow?: string | null;
  hero_title?: string | null;
  hero_description?: string | null;
  sections?: Array<{
    key?: string;
    heading?: string;
    subheading?: string;
    body?: string;
    imageUrl?: string;
    order?: number;
  }> | null;
  body_html?: string | null;
};

async function safe<T>(fn: () => Promise<T>, fallback: T): Promise<T> {
  try {
    return await fn();
  } catch (err) {
    console.warn("CMS fallback triggered:", err);
    return fallback;
  }
}

export async function getProducts(): Promise<StaticProductType[]> {
  return safe(async () => {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("published", true)
      .order("order", { ascending: true })
      .order("created_at", { ascending: false });

    if (error || !data || data.length === 0) {
      return staticProducts;
    }

    return (data as DbProductRow[]).map((p) => ({
      _id: p.id,
      id: p.id,
      slug: p.slug,
      title: p.title,
      short: p.short || "",
      description: p.description || "",
      imageUrl:
        p.image_url && !p.image_url.startsWith("/images/products/")
          ? p.image_url
          : undefined,
      highlights: p.highlights || [],
      grades: p.grades || [],
      specs: p.specs || [],
      tables: p.tables || [],
    }));
  }, staticProducts);
}

export async function getProduct(slug: string): Promise<StaticProductType | undefined> {
  const all = await getProducts();
  return all.find((p) => p.slug === slug);
}

export async function getSiteData() {
  return safe(
    async () => {
      const supabase = getSupabaseAdmin();
      const { data, error } = await supabase
        .from("site_settings")
        .select("*")
        .in("key", ["main", "seo"]);

      if (error || !data || data.length === 0) {
        return {
          site: staticSite,
          navLinks: staticNav,
          heroSlides: staticHeroSlides,
          seo: {
            title: "",
            description: "",
            keywords: "",
            ogImageUrl: "",
            googleVerification: "",
            bingVerification: "",
            googleAnalyticsId: "",
            canonicalUrl: "",
            robotsDirective: "index, follow",
          },
        };
      }

      const mainRow = (data.find((r) => r.key === "main") || {}) as DbSiteSettingRow;
      const seoRow = (data.find((r) => r.key === "seo") || {}) as DbSiteSettingRow;

      const site = {
        name: mainRow.name || staticSite.name,
        shortName: mainRow.short_name || staticSite.shortName,
        tagline: mainRow.tagline || staticSite.tagline,
        logoUrl: mainRow.logo_url || "",
        logoDarkUrl: mainRow.logo_dark_url || "",
        faviconUrl: mainRow.favicon_url || "",
        email: mainRow.email || staticSite.email,
        phoneWork: mainRow.phone_work || staticSite.phoneWork,
        phoneRegd: mainRow.phone_regd || staticSite.phoneRegd,
        phoneFax: mainRow.phone_fax || staticSite.phoneFax,
        mobile: mainRow.mobile || staticSite.mobile,
        whatsapp: mainRow.whatsapp || staticSite.whatsapp || "",
        workOffice: mainRow.work_office || staticSite.workOffice,
        regdOffice: mainRow.regd_office || staticSite.regdOffice,
        highlights:
          mainRow.highlights && mainRow.highlights.length > 0
            ? mainRow.highlights
            : staticSite.highlights,
      };

      const navLinks =
        mainRow.nav_links && mainRow.nav_links.length > 0
          ? [...mainRow.nav_links].sort(
              (a: NavItem, b: NavItem) => (a.order || 0) - (b.order || 0)
            )
          : staticNav;

      const heroSlides =
        mainRow.hero_slides && mainRow.hero_slides.length > 0
          ? [...mainRow.hero_slides].sort(
              (a: HeroSlide, b: HeroSlide) => (a.order || 0) - (b.order || 0)
            )
          : staticHeroSlides;

      const seo = {
        title: seoRow.seo_title || mainRow.seo_title || "",
        description: seoRow.seo_description || mainRow.seo_description || "",
        keywords: seoRow.tagline || "",
        ogImageUrl: seoRow.logo_url || mainRow.logo_url || "",
        googleVerification: seoRow.email || "",
        bingVerification: seoRow.phone_work || "",
        googleAnalyticsId: seoRow.phone_regd || "",
        canonicalUrl: seoRow.phone_fax || "",
        robotsDirective: seoRow.whatsapp || "index, follow",
      };

      return { site, navLinks, heroSlides, seo };
    },
    {
      site: staticSite,
      navLinks: staticNav,
      heroSlides: staticHeroSlides,
      seo: {
        title: "",
        description: "",
        keywords: "",
        ogImageUrl: "",
        googleVerification: "",
        bingVerification: "",
        googleAnalyticsId: "",
        canonicalUrl: "",
        robotsDirective: "index, follow",
      },
    }

  );
}

export async function getTechnical() {
  return safe(
    async () => {
      const supabase = getSupabaseAdmin();
      const { data, error } = await supabase
        .from("technical_content")
        .select("*")
        .eq("key", "main")
        .maybeSingle();

      if (error || !data) {
        return {
          manufacturingProcess,
          materialComparison,
          clientTestimonials,
          ceramicCompareHeaders,
          ceramicCompareRows,
        };
      }

      const t = data as DbTechnicalRow;
      return {
        manufacturingProcess:
          t.manufacturing_process && t.manufacturing_process.length > 0
            ? [...t.manufacturing_process].sort(
                (a, b) => (a.order || 0) - (b.order || 0)
              )
            : manufacturingProcess,
        materialComparison: t.material_comparison?.rows?.length
          ? t.material_comparison
          : materialComparison,
        clientTestimonials: t.client_testimonials?.length
          ? t.client_testimonials
          : clientTestimonials,
        ceramicCompareHeaders: t.ceramic_compare?.headers?.length
          ? t.ceramic_compare.headers
          : ceramicCompareHeaders,
        ceramicCompareRows: t.ceramic_compare?.rows?.length
          ? t.ceramic_compare.rows
          : ceramicCompareRows,
      };
    },
    {
      manufacturingProcess,
      materialComparison,
      clientTestimonials,
      ceramicCompareHeaders,
      ceramicCompareRows,
    }
  );
}

export async function getPageContent(slug: string): Promise<PageContentData | null> {
  return safe(async () => {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("page_contents")
      .select("*")
      .eq("slug", slug)
      .maybeSingle();

    if (error || !data) return null;

    const row = data as DbPageContentRow;
    return {
      _id: row.id,
      id: row.id,
      slug: row.slug,
      title: row.title,
      heroEyebrow: row.hero_eyebrow || undefined,
      heroTitle: row.hero_title || undefined,
      heroDescription: row.hero_description || undefined,
      sections: row.sections || [],
      bodyHtml: row.body_html || undefined,
    };
  }, null);
}
