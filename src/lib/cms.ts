import { dbConnect } from "./db";
import { Product } from "@/models/Product";
import { SiteSetting } from "@/models/SiteSetting";
import { TechnicalContent } from "@/models/TechnicalContent";
import { PageContent } from "@/models/PageContent";
import {
  products as staticProducts,
  Product as StaticProductType,
} from "@/data/products";
import { site as staticSite, navLinks as staticNav } from "@/data/site";
import {
  manufacturingProcess,
  materialComparison,
  clientTestimonials,
  ceramicCompareHeaders,
  ceramicCompareRows,
} from "@/data/technical";

async function safe<T>(fn: () => Promise<T>, fallback: T): Promise<T> {
  try {
    return await fn();
  } catch {
    return fallback;
  }
}

export async function getProducts(): Promise<StaticProductType[]> {
  return safe(async () => {
    await dbConnect();
    const items = await Product.find({ published: true })
      .sort({ order: 1, createdAt: -1 })
      .lean();
    if (items.length === 0) return staticProducts;
    return items.map((p: any) => ({
      slug: p.slug,
      title: p.title,
      short: p.short || "",
      description: p.description || "",
      imageUrl: p.imageUrl,
      highlights: p.highlights || [],
      grades: p.grades || [],
      specs: p.specs || [],
      tables: (p.tables || []).map((t: any) => ({
        title: t.title,
        headers: t.headers || [],
        rows: t.rows || [],
      })),
    }));
  }, staticProducts);
}

export async function getProduct(slug: string) {
  const all = await getProducts();
  return all.find((p) => p.slug === slug);
}

export async function getSiteData() {
  return safe(async () => {
    await dbConnect();
    const s = await SiteSetting.findOne({ key: "main" }).lean();
    if (!s) {
      return { site: staticSite, navLinks: staticNav, seo: { title: "", description: "" } };
    }
    const site: any = {
      name: s.name || staticSite.name,
      shortName: s.shortName || staticSite.shortName,
      tagline: s.tagline || staticSite.tagline,
      email: s.email || staticSite.email,
      phoneWork: s.phoneWork || staticSite.phoneWork,
      phoneRegd: s.phoneRegd || staticSite.phoneRegd,
      phoneFax: s.phoneFax || staticSite.phoneFax,
      mobile: s.mobile || staticSite.mobile,
      workOffice: s.workOffice || staticSite.workOffice,
      regdOffice: s.regdOffice || staticSite.regdOffice,
      highlights: (s.highlights && s.highlights.length > 0) ? s.highlights : staticSite.highlights,
    };
    const navLinks =
      s.navLinks && s.navLinks.length > 0
        ? [...s.navLinks].sort((a: any, b: any) => (a.order || 0) - (b.order || 0)).map((n: any) => ({ href: n.href, label: n.label }))
        : staticNav;
    const seo = {
      title: s.seoTitle || "",
      description: s.seoDescription || "",
    };
    return { site, navLinks, seo };
  }, { site: staticSite, navLinks: staticNav, seo: { title: "", description: "" } });
}

export async function getTechnical() {
  return safe(async () => {
    await dbConnect();
    const t = await TechnicalContent.findOne({ key: "main" }).lean();
    if (!t) {
      return {
        manufacturingProcess,
        materialComparison,
        clientTestimonials,
        ceramicCompareHeaders,
        ceramicCompareRows,
      };
    }
    return {
      manufacturingProcess:
        (t.manufacturingProcess && t.manufacturingProcess.length > 0)
          ? [...t.manufacturingProcess].sort(
              (a: any, b: any) => (a.order || 0) - (b.order || 0)
            )
          : manufacturingProcess,
      materialComparison: t.materialComparison?.rows?.length
        ? t.materialComparison
        : materialComparison,
      clientTestimonials: t.clientTestimonials?.length
        ? t.clientTestimonials
        : clientTestimonials,
      ceramicCompareHeaders: t.ceramicCompare?.headers?.length
        ? t.ceramicCompare.headers
        : ceramicCompareHeaders,
      ceramicCompareRows: t.ceramicCompare?.rows?.length
        ? t.ceramicCompare.rows
        : ceramicCompareRows,
    };
  }, {
    manufacturingProcess,
    materialComparison,
    clientTestimonials,
    ceramicCompareHeaders,
    ceramicCompareRows,
  });
}

export async function getPageContent(slug: string) {
  return safe(async () => {
    await dbConnect();
    const p = await PageContent.findOne({ slug }).lean();
    return p || null;
  }, null);
}
