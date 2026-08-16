import { dbConnect } from "./db";
import { Product } from "@/models/Product";
import { SiteSetting } from "@/models/SiteSetting";
import { TechnicalContent } from "@/models/TechnicalContent";
import { PageContent } from "@/models/PageContent";
import {
  products as staticProducts,
  Product as StaticProductType,
} from "@/data/products";
import { site as staticSite, navLinks as staticNav, heroSlides as staticHeroSlides, HeroSlide } from "@/data/site";
import type { SpecItem, TableItem } from "@/data/products";

export type { HeroSlide };
import {
  manufacturingProcess,
  materialComparison,
  clientTestimonials,
  ceramicCompareHeaders,
  ceramicCompareRows,
} from "@/data/technical";

type WithId = { _id?: unknown };
type Highlight = { label: string; value: string };
type Office = { label: string; lines: string[] };
type NavItem = { href: string; label: string; order?: number };
export type PageContentData = {
  slug?: string;
  title?: string;
  heroEyebrow?: string;
  heroTitle?: string;
  heroDescription?: string;
  sections?: Array<Record<string, unknown>>;
  [key: string]: unknown;
};

type RawProduct = {
  slug: string;
  title: string;
  short?: string;
  description?: string;
  imageUrl?: string;
  highlights?: string[];
  grades?: string[];
  specs?: (SpecItem & WithId)[];
  tables?: (TableItem & WithId)[];
};

type RawSite = {
  name: string;
  shortName?: string;
  tagline?: string;
  logoUrl?: string;
  logoDarkUrl?: string;
  faviconUrl?: string;
  email?: string;
  phoneWork?: string;
  phoneRegd?: string;
  phoneFax?: string;
  mobile?: string;
  whatsapp?: string;
  workOffice?: (Office & WithId) | null;
  regdOffice?: (Office & WithId) | null;
  highlights?: (Highlight & WithId)[];
  navLinks?: (NavItem & WithId)[];
  heroSlides?: (HeroSlide & WithId)[];
  seoTitle?: string;
  seoDescription?: string;
};

type RawProcess = { title: string; description: string; order?: number };
type RawTestimonial = { name: string; company?: string; text: string };
type RawComparison = { headers: string[]; rows: (string[] & WithId)[] };

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

function stripId<T extends WithId>(item: T): Omit<T, "_id"> {
  const { _id: _unused, ...rest } = item;
  void _unused;
  return rest;
}

export async function getProducts(): Promise<StaticProductType[]> {
  return safe(async () => {
    await dbConnect();
    const rawItems = await Product.find({ published: true })
      .sort({ order: 1, createdAt: -1 })
      .lean();
    if (rawItems.length === 0) return staticProducts;
    const items = plain(rawItems) as RawProduct[];
    return items.map((p: RawProduct) => ({
      slug: p.slug,
      title: p.title,
      short: p.short || "",
      description: p.description || "",
      imageUrl: p.imageUrl,
      highlights: p.highlights || [],
      grades: p.grades || [],
      specs: (p.specs || []).map((s: SpecItem & WithId) => stripId(s)),
      tables: (p.tables || []).map((t: TableItem & WithId) => stripId(t)),
    }));
  }, staticProducts);
}

export async function getProduct(slug: string): Promise<StaticProductType | undefined> {
  const all = await getProducts();
  return all.find((p) => p.slug === slug);
}

function cleanAddress<T extends Office & WithId>(addr: T | null | undefined): Omit<T, "_id"> | null {
  if (!addr) return null;
  return stripId(addr);
}

export async function getSiteData() {
  return safe(async () => {
    await dbConnect();
    const raw = await SiteSetting.findOne({ key: "main" }).lean();
    if (!raw) {
      return { site: staticSite, navLinks: staticNav, heroSlides: staticHeroSlides, seo: { title: "", description: "" } };
    }
    const s = plain(raw) as RawSite;
    const cleanedWork = cleanAddress(s.workOffice as (Office & WithId) | null);
    const cleanedRegd = cleanAddress(s.regdOffice as (Office & WithId) | null);
    const site = {
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
      whatsapp: s.whatsapp || staticSite.whatsapp || "",
      workOffice: cleanedWork || staticSite.workOffice,
      regdOffice: cleanedRegd || staticSite.regdOffice,
      highlights: (s.highlights && s.highlights.length > 0)
        ? s.highlights.map((h: Highlight & WithId) => stripId(h))
        : staticSite.highlights,
    };
    const navLinks =
      s.navLinks && s.navLinks.length > 0
        ? [...s.navLinks].sort((a: NavItem & WithId, b: NavItem & WithId) => (a.order || 0) - (b.order || 0)).map((n: NavItem & WithId) => stripId(n))
        : staticNav;
    const heroSlides =
      s.heroSlides && s.heroSlides.length > 0
        ? [...s.heroSlides].sort((a: HeroSlide & WithId, b: HeroSlide & WithId) => (a.order || 0) - (b.order || 0)).map((h: HeroSlide & WithId) => stripId(h))
        : staticHeroSlides;
    const seo = {
      title: s.seoTitle || "",
      description: s.seoDescription || "",
    };
    return { site, navLinks, heroSlides, seo };
  }, { site: staticSite, navLinks: staticNav, heroSlides: staticHeroSlides, seo: { title: "", description: "" } });
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
    const t = plain(raw) as {
      manufacturingProcess?: (RawProcess & WithId)[];
      materialComparison?: RawComparison;
      clientTestimonials?: (RawTestimonial & WithId)[];
      ceramicCompare?: { headers: string[]; rows: string[][] };
    };
    return {
      manufacturingProcess:
        (t.manufacturingProcess && t.manufacturingProcess.length > 0)
          ? [...t.manufacturingProcess].sort(
              (a: RawProcess & WithId, b: RawProcess & WithId) => (a.order || 0) - (b.order || 0)
            ).map((p: RawProcess & WithId) => stripId(p))
          : manufacturingProcess,
      materialComparison: t.materialComparison?.rows?.length
        ? {
            ...t.materialComparison,
            rows: t.materialComparison.rows.map((r: string[] & WithId) => stripId(r)),
          }
        : materialComparison,
      clientTestimonials: t.clientTestimonials?.length
        ? t.clientTestimonials.map((c: RawTestimonial & WithId) => stripId(c))
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

export async function getPageContent(slug: string): Promise<PageContentData | null> {
  return safe(async () => {
    await dbConnect();
    const raw = await PageContent.findOne({ slug }).lean();
    return raw ? (plain(raw) as PageContentData) : null;
  }, null);
}
