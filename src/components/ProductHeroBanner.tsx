"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import ComingSoon from "@/components/ComingSoon";
import type { ProductBannerConfig } from "@/lib/productBanners";

type ProductHeroBannerProps = {
  product: {
    id?: string;
    _id?: string;
    slug: string;
    title: string;
    short: string;
    imageUrl?: string;
  };
  initialBanner: ProductBannerConfig;
  isAdmin: boolean;
};

type MediaLibraryItem = {
  url: string;
  name: string;
  type: "image" | "video";
};

function isVideoUrl(url?: string): boolean {
  if (!url) return false;
  return /\.(mp4|webm|ogg|mov)(\?.*)?$/i.test(url);
}

export default function ProductHeroBanner({
  product,
  initialBanner,
  isAdmin,
}: ProductHeroBannerProps) {
  const [savedBanner, setSavedBanner] =
    useState<ProductBannerConfig>(initialBanner);
  const [draftBanner, setDraftBanner] =
    useState<ProductBannerConfig>(initialBanner);
  const [productImageUrl, setProductImageUrl] = useState<string | undefined>(
    product.imageUrl
  );

  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState<
    "background" | "layout" | "showcase" | "library"
  >("background");
  const [uploadingTarget, setUploadingTarget] = useState<
    "banner" | "poster" | "showcase" | null
  >(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [saving, setSaving] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [mediaLibrary, setMediaLibrary] = useState<MediaLibraryItem[]>([]);
  const [libraryLoaded, setLibraryLoaded] = useState(false);

  const bgVideoRef = useRef<HTMLVideoElement | null>(null);
  const showcaseVideoRef = useRef<HTMLVideoElement | null>(null);

  // Sync if product changes via navigation
  useEffect(() => {
    setSavedBanner(initialBanner);
    setDraftBanner(initialBanner);
    setProductImageUrl(product.imageUrl);
    setIsEditing(false);
  }, [initialBanner, product.slug, product.imageUrl]);

  // Reload video element when URL changes in live preview
  useEffect(() => {
    const active = isEditing ? draftBanner : savedBanner;
    if (active.bannerType === "video" && active.bannerMediaUrl && bgVideoRef.current) {
      bgVideoRef.current.load();
      bgVideoRef.current.play().catch(() => {});
    }
  }, [
    isEditing,
    draftBanner.bannerType,
    draftBanner.bannerMediaUrl,
    savedBanner.bannerType,
    savedBanner.bannerMediaUrl,
  ]);

  const loadMediaLibrary = async () => {
    if (libraryLoaded) return;
    try {
      const res = await fetch("/api/admin/media");
      if (res.ok) {
        const data = await res.json();
        const items: MediaLibraryItem[] = (data.media || data.files || []).map(
          (m: any) => {
            const url = m.url || m.publicUrl || "";
            return {
              url,
              name: m.originalName || m.filename || m.name || "Media",
              type:
                m.resourceType === "video" || isVideoUrl(url)
                  ? "video"
                  : "image",
            };
          }
        );
        setMediaLibrary(items.filter((i) => i.url));
        setLibraryLoaded(true);
      }
    } catch {
      // ignore
    }
  };

  const handleOpenEditor = () => {
    if (!isAdmin) return;
    setDraftBanner(savedBanner);
    setStatusMsg(null);
    setIsEditing(true);
    loadMediaLibrary();
  };

  const handleCancelEditor = () => {
    setDraftBanner(savedBanner);
    setStatusMsg(null);
    setIsEditing(false);
  };

  const uploadFileWithProgress = (
    file: File,
    target: "banner" | "poster" | "showcase"
  ) => {
    setUploadingTarget(target);
    setUploadProgress(5);
    setStatusMsg(null);

    const formData = new FormData();
    formData.append("files", file);

    const xhr = new XMLHttpRequest();
    xhr.open("POST", "/api/admin/media", true);

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        const pct = Math.min(95, Math.round((event.loaded / event.total) * 100));
        setUploadProgress(pct);
      }
    };

    xhr.onload = () => {
      setUploadingTarget(null);
      setUploadProgress(0);
      try {
        const response = JSON.parse(xhr.responseText || "{}");
        if (xhr.status >= 200 && xhr.status < 300 && response.media?.[0]?.url) {
          const uploadedUrl: string = response.media[0].url;
          const uploadedIsVideo =
            response.media[0].resourceType === "video" ||
            file.type.startsWith("video/") ||
            isVideoUrl(uploadedUrl);

          if (target === "banner") {
            setDraftBanner((prev) => ({
              ...prev,
              bannerType: uploadedIsVideo ? "video" : "image",
              bannerMediaUrl: uploadedUrl,
            }));
          } else if (target === "poster") {
            setDraftBanner((prev) => ({
              ...prev,
              videoPosterUrl: uploadedUrl,
            }));
          } else if (target === "showcase") {
            setDraftBanner((prev) => ({
              ...prev,
              showcaseMode: uploadedIsVideo ? "custom_video" : "custom_image",
              showcaseMediaUrl: uploadedUrl,
            }));
          }

          setStatusMsg({
            type: "success",
            text: `Uploaded ${file.name} — previewing live! Click "Save Banner" to publish.`,
          });
        } else {
          setStatusMsg({
            type: "error",
            text: response.error || "Upload failed. Please check file format.",
          });
        }
      } catch {
        setStatusMsg({
          type: "error",
          text: "Unexpected response from media upload server.",
        });
      }
    };

    xhr.onerror = () => {
      setUploadingTarget(null);
      setUploadProgress(0);
      setStatusMsg({
        type: "error",
        text: "Network error during media upload.",
      });
    };

    xhr.send(formData);
  };

  const handleSaveBanner = async () => {
    if (!isAdmin) return;
    setSaving(true);
    setStatusMsg(null);

    try {
      const payload: Record<string, unknown> = {
        ...draftBanner,
        productId: product.id || product._id,
        productSlug: product.slug,
      };

      // If admin uploaded a custom image in the right showcase card, also sync productImageUrl if desired
      if (
        draftBanner.showcaseMode === "custom_image" &&
        draftBanner.showcaseMediaUrl
      ) {
        payload.updateProductImageUrl = draftBanner.showcaseMediaUrl;
      }

      const res = await fetch(`/api/admin/products/${product.slug}/banner`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        setStatusMsg({
          type: "error",
          text: data.error || "Failed to save product banner.",
        });
        return;
      }

      setSavedBanner(data.banner);
      setDraftBanner(data.banner);
      if (
        draftBanner.showcaseMode === "custom_image" &&
        draftBanner.showcaseMediaUrl
      ) {
        setProductImageUrl(draftBanner.showcaseMediaUrl);
      }
      setStatusMsg({
        type: "success",
        text: "Banner & video saved to database for this product!",
      });
      setTimeout(() => {
        setIsEditing(false);
        setStatusMsg(null);
      }, 900);
    } catch {
      setStatusMsg({
        type: "error",
        text: "Network error while saving banner.",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleResetToDefault = async () => {
    if (!isAdmin) return;
    setSaving(true);
    setStatusMsg(null);

    try {
      const res = await fetch(`/api/admin/products/${product.slug}/banner`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (res.ok && data.banner) {
        setSavedBanner(data.banner);
        setDraftBanner(data.banner);
        setStatusMsg({
          type: "success",
          text: "Reverted to default orange banner theme.",
        });
      }
    } catch {
      setStatusMsg({
        type: "error",
        text: "Failed to reset product banner.",
      });
    } finally {
      setSaving(false);
    }
  };

  // Active banner state (live preview while editing, saved state otherwise)
  const active = isEditing ? draftBanner : savedBanner;
  const hasCustomBg =
    (active.bannerType === "image" || active.bannerType === "video") &&
    Boolean(active.bannerMediaUrl);

  const objectPositionMap: Record<
    ProductBannerConfig["objectPosition"],
    string
  > = {
    center: "center center",
    top: "center top",
    bottom: "center bottom",
    left: "left center",
    right: "right center",
  };

  // Determine right-hand showcase media
  const showRightCard = active.showcaseMode !== "hidden";
  const effectiveShowcaseUrl =
    active.showcaseMode === "custom_image" ||
    active.showcaseMode === "custom_video"
      ? active.showcaseMediaUrl
      : productImageUrl &&
        !productImageUrl.startsWith("/images/products/") &&
        !productImageUrl.includes("hero-desktop")
      ? productImageUrl
      : "";
  const isShowcaseVideo =
    active.showcaseMode === "custom_video" || isVideoUrl(effectiveShowcaseUrl);

  return (
    <section className="page-hero relative overflow-hidden">
      {/* 1. Background Layer: Custom Image / Custom Video / Default Orange Fallback */}
      {!hasCustomBg ? (
        <div className="page-hero-bg" aria-hidden />
      ) : (
        <div className="absolute inset-0 z-0 bg-slate-950 overflow-hidden" aria-hidden>
          {active.bannerType === "video" ? (
            <video
              ref={bgVideoRef}
              src={active.bannerMediaUrl}
              poster={active.videoPosterUrl || undefined}
              autoPlay
              muted
              loop
              playsInline
              preload="auto"
              className="w-full h-full transition-all duration-300"
              style={{
                objectFit: active.objectFit || "cover",
                objectPosition:
                  objectPositionMap[active.objectPosition || "center"],
              }}
            />
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={active.bannerMediaUrl}
              alt={`${product.title} banner`}
              className="w-full h-full transition-all duration-300"
              style={{
                objectFit: active.objectFit || "cover",
                objectPosition:
                  objectPositionMap[active.objectPosition || "center"],
              }}
            />
          )}

          {/* Adjustable Contrast Overlay so Hero Typography Remains Crisp */}
          <div
            className="absolute inset-0 transition-opacity duration-200"
            style={{
              background:
                "linear-gradient(90deg, rgba(12, 15, 22, 0.92) 0%, rgba(12, 15, 22, 0.72) 48%, rgba(12, 15, 22, 0.45) 100%)",
              opacity: (active.overlayOpacity ?? 55) / 100,
            }}
          />
        </div>
      )}

      {/* 2. Admin-Only Floating "Edit Banner" Button */}
      {isAdmin && (
        <div className="absolute top-4 right-4 z-30 flex items-center gap-2">
          {isEditing && (
            <span className="px-3 py-1.5 rounded-full bg-amber-500 text-slate-950 text-xs font-bold shadow-lg animate-pulse">
              ● Live Preview Active
            </span>
          )}
          <button
            type="button"
            onClick={() =>
              isEditing ? handleCancelEditor() : handleOpenEditor()
            }
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-950/90 hover:bg-slate-900 text-white border border-white/25 text-xs font-semibold shadow-xl backdrop-blur-md transition cursor-pointer"
          >
            <span>{isEditing ? "✕ Close Banner Editor" : "✎ Edit Banner & Video"}</span>
          </button>
        </div>
      )}

      {/* 3. Main Hero Content Grid */}
      <div
        className={`relative z-10 mx-auto grid max-w-6xl gap-8 px-4 py-14 md:px-6 md:py-20 ${
          showRightCard ? "md:grid-cols-2 md:items-end" : "grid-cols-1"
        }`}
      >
        <div>
          <p className="eyebrow">
            <Link href="/products" className="hover:underline">
              Products
            </Link>{" "}
            / {product.title}
          </p>
          <h1 className="mt-3 font-display text-4xl tracking-tight text-white md:text-5xl">
            {product.title}
          </h1>
          <p className="mt-4 max-w-xl text-white/85">{product.short}</p>
          <Link href="/contact" className="btn btn-accent mt-8">
            Enquire now
          </Link>
        </div>

        {showRightCard && (
          <div>
            {effectiveShowcaseUrl ? (
              <div className="rounded-lg overflow-hidden border border-white/15 bg-black/25 shadow-2xl">
                {isShowcaseVideo ? (
                  <video
                    ref={showcaseVideoRef}
                    src={effectiveShowcaseUrl}
                    poster={active.showcasePosterUrl || active.videoPosterUrl || undefined}
                    autoPlay
                    muted
                    loop
                    playsInline
                    controls
                    className="w-full h-full aspect-[16/9]"
                    style={{
                      objectFit: active.showcaseObjectFit || "cover",
                    }}
                  />
                ) : (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={effectiveShowcaseUrl}
                    alt={product.title}
                    className="w-full h-full aspect-[16/9]"
                    style={{
                      objectFit: active.showcaseObjectFit || "cover",
                    }}
                  />
                )}
              </div>
            ) : (
              <ComingSoon
                label={`${product.title} photo coming soon`}
                aspect="wide"
                className="border border-white/10"
              />
            )}
          </div>
        )}
      </div>

      {/* 4. Strict Admin-Only Inline Banner & Video Editor Drawer */}
      {isAdmin && isEditing && (
        <div className="relative z-30 mx-auto max-w-6xl px-4 pb-8 md:px-6">
          <div className="bg-slate-950/95 border border-slate-700/90 rounded-2xl p-5 sm:p-6 text-white shadow-2xl backdrop-blur-xl space-y-5">
            {/* Top Bar */}
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-bold uppercase tracking-wider">
                    Admin Only
                  </span>
                  <h3 className="text-base font-bold text-white">
                    Customize Banner & Video for &ldquo;{product.title}&rdquo;
                  </h3>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  Changes apply exclusively to{" "}
                  <code className="text-amber-300">
                    /products/{product.slug}
                  </code>{" "}
                  and preview live above before saving.
                </p>
              </div>

              {/* Editor Tabs */}
              <div className="flex flex-wrap items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800">
                {[
                  { id: "background", label: "1. Banner Image / Video" },
                  { id: "layout", label: "2. Fit, Position & Contrast" },
                  { id: "showcase", label: "3. Right Showcase Box" },
                  { id: "library", label: "4. Media Library" },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                      activeTab === tab.id
                        ? "bg-amber-600 text-white"
                        : "text-slate-400 hover:text-white hover:bg-slate-800"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Status & Upload Progress */}
            {uploadingTarget && (
              <div className="p-3.5 rounded-xl bg-blue-950/60 border border-blue-500/40 space-y-2">
                <div className="flex items-center justify-between text-xs text-blue-200 font-medium">
                  <span>
                    Uploading & optimizing media for Supabase Storage...
                  </span>
                  <span>{uploadProgress}%</span>
                </div>
                <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-amber-500 transition-all duration-200"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            )}

            {statusMsg && (
              <div
                className={`p-3.5 rounded-xl text-xs font-medium border ${
                  statusMsg.type === "success"
                    ? "bg-emerald-500/15 border-emerald-500/40 text-emerald-300"
                    : "bg-red-500/15 border-red-500/40 text-red-300"
                }`}
              >
                {statusMsg.type === "success" ? "✓ " : "✕ "}
                {statusMsg.text}
              </div>
            )}

            {/* Tab 1: Background Banner Media */}
            {activeTab === "background" && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Mode Selector */}
                <div className="lg:col-span-5 space-y-3">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
                    Banner Background Type
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      {
                        id: "default",
                        label: "Default Orange",
                        desc: "Original fallback",
                      },
                      {
                        id: "image",
                        label: "Banner Image",
                        desc: "JPG, PNG, WebP",
                      },
                      {
                        id: "video",
                        label: "Banner Video",
                        desc: "MP4, WebM, MOV",
                      },
                    ].map((m) => (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() =>
                          setDraftBanner((prev) => ({
                            ...prev,
                            bannerType: m.id as any,
                          }))
                        }
                        className={`p-3 rounded-xl border text-left transition cursor-pointer ${
                          draftBanner.bannerType === m.id
                            ? "bg-amber-600/20 border-amber-500 text-white"
                            : "bg-slate-900 border-slate-800 text-slate-400 hover:text-white"
                        }`}
                      >
                        <div className="text-xs font-bold">{m.label}</div>
                        <div className="text-[10px] opacity-75 mt-0.5">
                          {m.desc}
                        </div>
                      </button>
                    ))}
                  </div>

                  {draftBanner.bannerType !== "default" && (
                    <div className="pt-2 flex flex-wrap items-center gap-2">
                      <label className="px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold cursor-pointer shadow-lg transition inline-flex items-center gap-2">
                        <span>
                          ↑ Upload{" "}
                          {draftBanner.bannerType === "video"
                            ? "Banner Video"
                            : "Banner Image"}
                        </span>
                        <input
                          type="file"
                          className="hidden"
                          accept={
                            draftBanner.bannerType === "video"
                              ? "video/*,.mp4,.webm,.mov"
                              : "image/*,.jpg,.jpeg,.png,.webp,.avif"
                          }
                          onChange={(e) => {
                            const f = e.target.files?.[0];
                            if (f) uploadFileWithProgress(f, "banner");
                          }}
                        />
                      </label>

                      {draftBanner.bannerMediaUrl && (
                        <button
                          type="button"
                          onClick={() =>
                            setDraftBanner((prev) => ({
                              ...prev,
                              bannerMediaUrl: "",
                              bannerType: "default",
                            }))
                          }
                          className="px-3 py-2.5 rounded-xl bg-red-500/15 hover:bg-red-500/25 text-red-300 border border-red-500/30 text-xs font-medium cursor-pointer"
                        >
                          Remove Media
                        </button>
                      )}
                    </div>
                  )}
                </div>

                {/* URL & Video Poster Inputs */}
                <div className="lg:col-span-7 space-y-4">
                  {draftBanner.bannerType !== "default" ? (
                    <>
                      <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
                          {draftBanner.bannerType === "video"
                            ? "Banner Video URL (MP4 / WebM)"
                            : "Banner Image URL (JPG / PNG / WebP)"}
                        </label>
                        <input
                          type="text"
                          value={draftBanner.bannerMediaUrl || ""}
                          onChange={(e) =>
                            setDraftBanner((prev) => ({
                              ...prev,
                              bannerMediaUrl: e.target.value,
                            }))
                          }
                          placeholder="Upload a file on the left or paste media URL..."
                          className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs font-mono text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                        />
                      </div>

                      {draftBanner.bannerType === "video" && (
                        <div>
                          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
                            Video Thumbnail / Poster Image (Optional)
                          </label>
                          <div className="flex items-center gap-2">
                            <input
                              type="text"
                              value={draftBanner.videoPosterUrl || ""}
                              onChange={(e) =>
                                setDraftBanner((prev) => ({
                                  ...prev,
                                  videoPosterUrl: e.target.value,
                                }))
                              }
                              placeholder="Poster image shown while video loads..."
                              className="flex-1 px-3.5 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs font-mono text-white"
                            />
                            <label className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold border border-slate-700 cursor-pointer shrink-0">
                              ↑ Upload Poster
                              <input
                                type="file"
                                className="hidden"
                                accept="image/*"
                                onChange={(e) => {
                                  const f = e.target.files?.[0];
                                  if (f) uploadFileWithProgress(f, "poster");
                                }}
                              />
                            </label>
                          </div>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="p-5 rounded-xl bg-slate-900/70 border border-slate-800 text-xs text-slate-300 leading-relaxed">
                      Currently using the{" "}
                      <strong className="text-white">
                        Default Orange Industrial Banner
                      </strong>
                      . Select <strong className="text-amber-400">Banner Image</strong> or{" "}
                      <strong className="text-amber-400">Banner Video</strong> on the
                      left (or upload a file directly below) to give{" "}
                      <strong>{product.title}</strong> its own custom background!
                      <div className="mt-3">
                        <label className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold cursor-pointer">
                          <span>↑ Quick Upload Image or Video</span>
                          <input
                            type="file"
                            className="hidden"
                            accept="image/*,video/*,.mp4,.webm,.mov"
                            onChange={(e) => {
                              const f = e.target.files?.[0];
                              if (f) uploadFileWithProgress(f, "banner");
                            }}
                          />
                        </label>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Tab 2: Fit, Positioning & Overlay Contrast */}
            {activeTab === "layout" && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
                    Banner Media Fit
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { id: "cover", label: "Cover (Full Bleed)" },
                      { id: "contain", label: "Contain (Full Frame)" },
                    ].map((fit) => (
                      <button
                        key={fit.id}
                        type="button"
                        onClick={() =>
                          setDraftBanner((prev) => ({
                            ...prev,
                            objectFit: fit.id as "cover" | "contain",
                          }))
                        }
                        className={`px-3 py-2.5 rounded-xl border text-xs font-semibold cursor-pointer ${
                          draftBanner.objectFit === fit.id
                            ? "bg-amber-600/20 border-amber-500 text-white"
                            : "bg-slate-900 border-slate-800 text-slate-400"
                        }`}
                      >
                        {fit.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
                    Banner Alignment / Position
                  </label>
                  <select
                    value={draftBanner.objectPosition || "center"}
                    onChange={(e) =>
                      setDraftBanner((prev) => ({
                        ...prev,
                        objectPosition: e.target.value as any,
                      }))
                    }
                    className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white"
                  >
                    <option value="center">Center (Recommended)</option>
                    <option value="top">Top Alignment</option>
                    <option value="bottom">Bottom Alignment</option>
                    <option value="left">Left Alignment</option>
                    <option value="right">Right Alignment</option>
                  </select>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                      Text Contrast Overlay Darkness
                    </label>
                    <span className="text-xs font-mono text-amber-400">
                      {draftBanner.overlayOpacity ?? 55}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={90}
                    step={5}
                    value={draftBanner.overlayOpacity ?? 55}
                    onChange={(e) =>
                      setDraftBanner((prev) => ({
                        ...prev,
                        overlayOpacity: Number(e.target.value),
                      }))
                    }
                    className="w-full accent-amber-500 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                    <span>0% (Original Brightness)</span>
                    <span>55% (Balanced)</span>
                    <span>90% (Dark)</span>
                  </div>
                </div>
              </div>
            )}

            {/* Tab 3: Right-Side Showcase Box */}
            {activeTab === "showcase" && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-6 space-y-3">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
                    Right-Side Product Showcase Card
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {[
                      { id: "product_image", label: "Product Photo" },
                      { id: "custom_image", label: "Custom Photo" },
                      { id: "custom_video", label: "Product Video" },
                      { id: "hidden", label: "Hide Right Box" },
                    ].map((mode) => (
                      <button
                        key={mode.id}
                        type="button"
                        onClick={() =>
                          setDraftBanner((prev) => ({
                            ...prev,
                            showcaseMode: mode.id as any,
                          }))
                        }
                        className={`p-2.5 rounded-xl border text-xs font-semibold cursor-pointer ${
                          draftBanner.showcaseMode === mode.id
                            ? "bg-amber-600/20 border-amber-500 text-white"
                            : "bg-slate-900 border-slate-800 text-slate-400"
                        }`}
                      >
                        {mode.label}
                      </button>
                    ))}
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Tip: Choose <strong>Hide Right Box</strong> if you want your
                    full-width background banner image or video to be unobstructed
                    on the right side.
                  </p>
                </div>

                <div className="lg:col-span-6 space-y-3">
                  {(draftBanner.showcaseMode === "custom_image" ||
                    draftBanner.showcaseMode === "custom_video" ||
                    draftBanner.showcaseMode === "product_image") && (
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                        Upload or Replace Right-Side Product Image / Video
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={
                            draftBanner.showcaseMediaUrl ||
                            productImageUrl ||
                            ""
                          }
                          onChange={(e) =>
                            setDraftBanner((prev) => ({
                              ...prev,
                              showcaseMode: isVideoUrl(e.target.value)
                                ? "custom_video"
                                : "custom_image",
                              showcaseMediaUrl: e.target.value,
                            }))
                          }
                          placeholder="Paste image/video URL or upload..."
                          className="flex-1 px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs font-mono text-white"
                        />
                        <label className="px-3.5 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-semibold cursor-pointer shrink-0">
                          ↑ Upload File
                          <input
                            type="file"
                            className="hidden"
                            accept="image/*,video/*,.mp4,.webm,.mov"
                            onChange={(e) => {
                              const f = e.target.files?.[0];
                              if (f) uploadFileWithProgress(f, "showcase");
                            }}
                          />
                        </label>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Tab 4: Pick from Media Library */}
            {activeTab === "library" && (
              <div className="space-y-3">
                <div className="text-xs text-slate-400">
                  Click any uploaded image or video from your Supabase Media
                  Library to set it as the background banner for{" "}
                  <strong className="text-white">{product.title}</strong>:
                </div>
                {mediaLibrary.length === 0 ? (
                  <div className="p-6 text-center text-xs text-slate-500 bg-slate-900 rounded-xl">
                    No media files found in library. Use the Upload button in
                    Tab 1 to upload new images or videos.
                  </div>
                ) : (
                  <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-6 gap-2.5 max-h-48 overflow-y-auto p-2 bg-slate-900 rounded-xl border border-slate-800">
                    {mediaLibrary.slice(0, 24).map((item) => (
                      <button
                        key={item.url}
                        type="button"
                        onClick={() => {
                          setDraftBanner((prev) => ({
                            ...prev,
                            bannerType: item.type,
                            bannerMediaUrl: item.url,
                          }));
                          setStatusMsg({
                            type: "success",
                            text: `Selected ${item.name} as ${item.type} banner! Click "Save Banner" to publish.`,
                          });
                        }}
                        className="group relative h-20 rounded-lg overflow-hidden border border-slate-700 hover:border-amber-500 bg-slate-950 cursor-pointer"
                      >
                        {item.type === "video" ? (
                          <video
                            src={item.url}
                            muted
                            playsInline
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={item.url}
                            alt={item.name}
                            className="w-full h-full object-cover"
                          />
                        )}
                        <span className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded bg-black/80 text-[9px] font-bold uppercase text-white">
                          {item.type === "video" ? "🎥 Video" : "🖼️ Img"}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Footer Action Buttons */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-800">
              <button
                type="button"
                disabled={saving}
                onClick={handleResetToDefault}
                className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-red-500/15 text-slate-300 hover:text-red-300 border border-slate-700 hover:border-red-500/30 text-xs font-medium transition cursor-pointer"
              >
                ↺ Reset to Default Orange Banner
              </button>

              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  disabled={saving}
                  onClick={handleCancelEditor}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={saving || Boolean(uploadingTarget)}
                  onClick={handleSaveBanner}
                  className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white text-xs font-bold shadow-lg shadow-amber-600/25 transition cursor-pointer"
                >
                  {saving ? "Saving Banner..." : "✓ Save Banner for This Product"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
