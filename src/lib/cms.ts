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

function plain<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

async function safe<T>(fn: () => Promise<T>, fallback: T): Promise<T> {
  try {
    return await fn();
  } catch {
    return fallback;
  }
}

function stripId<T extends { _id?: any }>(item: T): Omit<T, "_id"> {
  const { _id, ...rest } = item;
  return rest;
}

export async function getProducts(): Promise<StaticProductType[]> {
  return safe(async () => {
    await dbConnect();
    const rawItems = await Product.find({ published: true })
      .sort({ order: 1, createdAt: -1 })
      .lean();
    if (rawItems.length === 0) return staticProducts;
    const items = plain(rawItems);
    return items.map((p: any) => ({
      slug: p.slug,
      title: p.title,
      short: p.short || "",
      description: p.description || "",
      imageUrl: p.imageUrl,
      highlights: p.highlights || [],
      grades: p.grades || [],
      specs: (p.specs || []).map((s: any) => stripId(s)),
      tables: (p.tables || []).map((t: any) => stripId(t)),
    }));
  }, staticProducts);
}

export async function getProduct(slug: string) {
  const all = await getProducts();
  return all.find((p) => p.slug === slug);
}

function cleanAddress(addr: any) {
  if (!addr) return addr;
  const { _id, ...rest } = addr;
  return rest;
}

export async function getSiteData() {
  return safe(async () => {
    await dbConnect();
    const raw = await SiteSetting.findOne({ key: "main" }).lean();
    if (!raw) {
      return { site: staticSite, navLinks: staticNav, seo: { title: "", description: "" } };
    }
    const s = plain(raw);
    const site: any = {
      name: s.name || staticSite.name,
      shortName: s.shortName || staticSite.shortName,
      tagline: s.tagline || staticSite.tagline,
      logoUrl: s.logoUrl || "",
      logoDarkUrl: s.logoDarkUrl || "",
      faviconUrl: s.faviconUrl || "",
      email: s.email || staticSite.email,
      phoneWork: s.phoneWork || staticSite.phoneWork,
      phoneRegd: s.phoneRegd || staticSite.phoneRegd,
      phoneFax: s.phoneFax || staticSite.phoneFax,
      mobile: s.mobile || staticSite.mobile,
      whatsapp: s.whatsapp || (staticSite as any).whatsapp || "",
      workOffice: cleanAddress(s.workOffice) || staticSite.workOffice,
      regdOffice: cleanAddress(s.regdOffice) || staticSite.regdOffice,
      highlights: (s.highlights && s.highlights.length > 0)
        ? s.highlights.map((h: any) => stripId(h))
        : staticSite.highlights,
    };
    const navLinks =
      s.navLinks && s.navLinks.length > 0
        ? [...s.navLinks].sort((a: any, b: any) => (a.order || 0) - (b.order || 0)).map((n: any) => stripId(n))
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
    const raw = await TechnicalContent.findOne({ key: "main" }).lean();
    if (!raw) {
      return {
        manufacturingProcess,
        materialComparison,
        clientTestimonials,
        ceramicCompareHeaders,
        ceramicCompareRows,
      };
    }
    const t = plain(raw);
    return {
      manufacturingProcess:
        (t.manufacturingProcess && t.manufacturingProcess.length > 0)
          ? [...t.manufacturingProcess].sort(
              (a: any, b: any) => (a.order || 0) - (b.order || 0)
            ).map((p: any) => stripId(p))
          : manufacturingProcess,
      materialComparison: t.materialComparison?.rows?.length
        ? {
            ...t.materialComparison,
            rows: t.materialComparison.rows.map((r: any) => stripId(r)),
          }
        : materialComparison,
      clientTestimonials: t.clientTestimonials?.length
        ? t.clientTestimonials.map((c: any) => stripId(c))
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
    const raw = await PageContent.findOne({ slug }).lean();
    return raw ? plain(raw) : null;
  }, null);
}
