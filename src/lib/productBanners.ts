import { getSupabaseAdmin } from "./supabase";

export type ProductBannerConfig = {
  productId?: string;
  productSlug: string;
  /** "default" = original orange industrial gradient, "image" = custom banner image, "video" = custom banner video */
  bannerType: "default" | "image" | "video";
  /** URL of the full-width background banner image or video */
  bannerMediaUrl: string;
  /** Optional thumbnail / poster URL when bannerType === "video" */
  videoPosterUrl: string;
  /** CSS object-fit for background banner media */
  objectFit: "cover" | "contain";
  /** CSS object-position for background banner media */
  objectPosition: "center" | "top" | "bottom" | "left" | "right";
  /** Dark/gradient overlay opacity (0 to 90) so hero text remains legible */
  overlayOpacity: number;
  /** Controls the right-hand showcase media card inside the hero */
  showcaseMode: "product_image" | "custom_image" | "custom_video" | "hidden";
  /** Custom image or video URL for the right-hand showcase box */
  showcaseMediaUrl: string;
  /** Poster image for the right-hand showcase video */
  showcasePosterUrl: string;
  /** Object fit for the right-hand showcase media */
  showcaseObjectFit: "cover" | "contain";
  updatedAt: string;
  updatedBy?: string;
};

const PRODUCT_BANNERS_KEY = "product_banners";

export function getDefaultProductBannerConfig(
  productSlug: string,
  productId?: string
): ProductBannerConfig {
  return {
    productId,
    productSlug,
    bannerType: "default",
    bannerMediaUrl: "",
    videoPosterUrl: "",
    objectFit: "cover",
    objectPosition: "center",
    overlayOpacity: 55,
    showcaseMode: "product_image",
    showcaseMediaUrl: "",
    showcasePosterUrl: "",
    showcaseObjectFit: "cover",
    updatedAt: new Date().toISOString(),
  };
}

function normalizeSlugKey(slug: string): string {
  return (slug || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export async function getAllProductBannersMap(): Promise<
  Record<string, ProductBannerConfig>
> {
  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("site_settings")
      .select("*")
      .eq("key", PRODUCT_BANNERS_KEY)
      .maybeSingle();

    if (error || !data || !data.work_office) {
      return {};
    }

    const stored = data.work_office as unknown as {
      banners?: Record<string, ProductBannerConfig>;
    };
    return stored.banners || {};
  } catch {
    return {};
  }
}

export async function getProductBannerConfig(
  productSlug: string,
  productId?: string
): Promise<ProductBannerConfig> {
  const cleanSlug = normalizeSlugKey(productSlug);
  const map = await getAllProductBannersMap();

  if (map[cleanSlug]) {
    return {
      ...getDefaultProductBannerConfig(cleanSlug, productId),
      ...map[cleanSlug],
      productSlug: cleanSlug,
    };
  }

  // Also check singular/plural variant if exact slug wasn't matched
  const singular = cleanSlug.endsWith("s") ? cleanSlug.slice(0, -1) : cleanSlug;
  const plural = cleanSlug.endsWith("s") ? cleanSlug : `${cleanSlug}s`;
  const alt = map[singular] || map[plural];
  if (alt) {
    return {
      ...getDefaultProductBannerConfig(cleanSlug, productId),
      ...alt,
      productSlug: cleanSlug,
    };
  }

  return getDefaultProductBannerConfig(cleanSlug, productId);
}

export async function saveProductBannerConfig(
  productSlug: string,
  config: Partial<ProductBannerConfig>,
  updatedBy?: string
): Promise<ProductBannerConfig> {
  const cleanSlug = normalizeSlugKey(productSlug);
  const supabase = getSupabaseAdmin();
  const map = await getAllProductBannersMap();

  const existing =
    map[cleanSlug] || getDefaultProductBannerConfig(cleanSlug, config.productId);

  const merged: ProductBannerConfig = {
    ...existing,
    ...config,
    productSlug: cleanSlug,
    bannerType:
      config.bannerType === "image" || config.bannerType === "video"
        ? config.bannerType
        : "default",
    objectFit: config.objectFit === "contain" ? "contain" : "cover",
    objectPosition:
      config.objectPosition &&
      ["center", "top", "bottom", "left", "right"].includes(
        config.objectPosition
      )
        ? config.objectPosition
        : "center",
    overlayOpacity:
      typeof config.overlayOpacity === "number"
        ? Math.max(0, Math.min(90, config.overlayOpacity))
        : 55,
    showcaseMode:
      config.showcaseMode &&
      ["product_image", "custom_image", "custom_video", "hidden"].includes(
        config.showcaseMode
      )
        ? config.showcaseMode
        : "product_image",
    showcaseObjectFit:
      config.showcaseObjectFit === "contain" ? "contain" : "cover",
    updatedAt: new Date().toISOString(),
    updatedBy: updatedBy || existing.updatedBy,
  };

  map[cleanSlug] = merged;

  const { data: row } = await supabase
    .from("site_settings")
    .select("id")
    .eq("key", PRODUCT_BANNERS_KEY)
    .maybeSingle();

  const payload = {
    key: PRODUCT_BANNERS_KEY,
    name: "Product Custom Banners & Videos",
    work_office: { banners: map } as unknown as Record<string, unknown>,
    updated_at: new Date().toISOString(),
  };

  if (row?.id) {
    await supabase.from("site_settings").update(payload).eq("id", row.id);
  } else {
    await supabase.from("site_settings").insert(payload);
  }

  return merged;
}

export async function resetProductBannerConfig(
  productSlug: string
): Promise<ProductBannerConfig> {
  const cleanSlug = normalizeSlugKey(productSlug);
  const supabase = getSupabaseAdmin();
  const map = await getAllProductBannersMap();

  delete map[cleanSlug];

  const { data: row } = await supabase
    .from("site_settings")
    .select("id")
    .eq("key", PRODUCT_BANNERS_KEY)
    .maybeSingle();

  if (row?.id) {
    await supabase
      .from("site_settings")
      .update({
        work_office: { banners: map } as unknown as Record<string, unknown>,
        updated_at: new Date().toISOString(),
      })
      .eq("id", row.id);
  }

  return getDefaultProductBannerConfig(cleanSlug);
}
