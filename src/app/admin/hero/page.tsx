"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import AdminPageHeader, {
  AdminCard,
  Field,
  inputClass,
  useToast,
} from "@/components/admin/AdminUI";

function isVideo(url?: string): boolean {
  if (!url) return false;
  return (
    /\.(mp4|webm|ogg|mov|m4v)(\?.*)?$/i.test(url) ||
    url.includes("/video/") ||
    url.startsWith("data:video/")
  );
}

interface BannerMediaSlotProps {
  label: string;
  recommendedSize: string;
  url: string;
  isMobileSlot?: boolean;
  uploading: boolean;
  onUpload: (file: File) => void;
  onChangeUrl: (newUrl: string) => void;
  onRemove: () => void;
}

function BannerMediaSlot({
  label,
  recommendedSize,
  url,
  isMobileSlot = false,
  uploading,
  onUpload,
  onChangeUrl,
  onRemove,
}: BannerMediaSlotProps) {
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [customUrl, setCustomUrl] = useState(url);

  useEffect(() => {
    setCustomUrl(url);
  }, [url]);

  const hasMedia = Boolean(url);
  const isVid = isVideo(url);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold text-slate-700">{label}</label>
        {hasMedia && (
          <span
            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[0.7rem] font-bold tracking-wide uppercase ${
              isVid
                ? "bg-purple-100 text-purple-800 border border-purple-200"
                : "bg-blue-100 text-blue-800 border border-blue-200"
            }`}
          >
            {isVid ? "🎬 Video Banner" : "🖼️ Photo Banner"}
          </span>
        )}
      </div>

      <div
        className={`border-2 border-dashed border-slate-300 rounded-xl p-4 transition-colors ${
          hasMedia ? "bg-white" : "bg-slate-50/80 hover:bg-slate-100/60"
        }`}
      >
        {uploading ? (
          <div className="py-12 text-center space-y-3">
            <div className="inline-block animate-spin w-8 h-8 border-3 border-amber-600 border-t-transparent rounded-full" />
            <div className="text-sm font-semibold text-slate-800">
              Uploading Video / Photo...
            </div>
            <div className="text-xs text-slate-500">
              Processing media into cloud storage. Please wait.
            </div>
          </div>
        ) : hasMedia ? (
          <div className="space-y-3">
            {/* Live Media Preview Box */}
            <div
              className={`relative rounded-lg overflow-hidden border border-slate-200 bg-slate-900 shadow-sm mx-auto ${
                isMobileSlot
                  ? "aspect-[3/4] max-w-[200px]"
                  : "aspect-[16/9] w-full"
              }`}
            >
              {isVid ? (
                <video
                  src={url}
                  controls
                  muted
                  playsInline
                  loop
                  className="w-full h-full object-cover"
                />
              ) : (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={url}
                  alt="Banner preview"
                  className="w-full h-full object-cover"
                />
              )}
            </div>

            {/* Media URL badge / editor toggle */}
            <div className="text-center">
              <span className="text-[0.72rem] text-slate-500 truncate block max-w-full px-2">
                {url}
              </span>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-2 justify-center items-center pt-1">
              <label className="text-xs px-3.5 py-1.5 bg-slate-800 text-white font-medium rounded-lg cursor-pointer hover:bg-slate-900 transition shadow-xs">
                <span>📁 Upload New File</span>
                <input
                  type="file"
                  className="hidden"
                  accept="image/*,video/*"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) onUpload(f);
                  }}
                />
              </label>

              <button
                type="button"
                onClick={() => setShowUrlInput((v) => !v)}
                className="text-xs px-3 py-1.5 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-100 transition"
              >
                🔗 {showUrlInput ? "Hide URL" : "Edit URL"}
              </button>

              <button
                type="button"
                onClick={onRemove}
                className="text-xs px-3 py-1.5 border border-red-200 text-red-600 rounded-lg hover:bg-red-50 transition"
              >
                🗑️ Remove
              </button>
            </div>

            {showUrlInput && (
              <div className="pt-2 flex gap-2">
                <input
                  type="url"
                  className={inputClass()}
                  value={customUrl}
                  onChange={(e) => setCustomUrl(e.target.value)}
                  placeholder="Paste direct MP4 or Image URL"
                />
                <button
                  type="button"
                  onClick={() => {
                    onChangeUrl(customUrl);
                    setShowUrlInput(false);
                  }}
                  className="px-3 py-1.5 text-xs bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg shrink-0"
                >
                  Apply
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="py-6 space-y-4 text-center">
            {/* Direct File Upload Area */}
            <label className="block cursor-pointer p-4 rounded-lg hover:bg-white transition border border-transparent hover:border-slate-200">
              <div className="text-4xl mb-2">🎬 / 🖼️</div>
              <div className="text-sm font-semibold text-slate-800 mb-1">
                Upload Video or Photo Banner
              </div>
              <div className="text-xs text-slate-500 mb-1">
                Supports MP4, WebM, MOV video OR JPG, PNG, WebP image
              </div>
              <div className="text-[0.7rem] font-medium text-amber-700">
                Recommended: {recommendedSize}
              </div>
              <input
                type="file"
                className="hidden"
                accept="image/*,video/*"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) onUpload(f);
                }}
              />
            </label>

            {/* Alternative: Direct URL entry */}
            <div className="border-t border-slate-200/80 pt-3">
              <div className="text-[0.72rem] text-slate-500 mb-1.5">
                Or paste a direct Video or Photo URL:
              </div>
              <div className="flex gap-2 max-w-md mx-auto">
                <input
                  type="url"
                  className={inputClass()}
                  value={customUrl}
                  onChange={(e) => setCustomUrl(e.target.value)}
                  placeholder="https://... (mp4, webm, jpg, png)"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (customUrl.trim()) onChangeUrl(customUrl.trim());
                  }}
                  disabled={!customUrl.trim()}
                  className="px-3.5 py-1.5 text-xs bg-slate-800 hover:bg-slate-900 disabled:opacity-50 text-white font-medium rounded-lg shrink-0 transition"
                >
                  Save URL
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function AdminHeroPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingKey, setUploadingKey] = useState<string | null>(null);
  const { show, ToastContainer } = useToast();

  const loadSettings = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/settings");
      const json = await res.json();
      const s = json.settings || {};
      if (!s.heroSlides || !Array.isArray(s.heroSlides) || s.heroSlides.length === 0) {
        s.heroSlides = [
          { desktopUrl: "", mobileUrl: "", headline: "", subline: "", order: 0 },
          { desktopUrl: "", mobileUrl: "", headline: "", subline: "", order: 1 },
          { desktopUrl: "", mobileUrl: "", headline: "", subline: "", order: 2 },
        ];
      }
      setData(s);
    } catch {
      show("Failed to load hero slides", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  const persistSettings = async (newData: any) => {
    setSaving(true);
    try {
      const clean: any = { ...newData };
      if (clean.heroSlides && Array.isArray(clean.heroSlides)) {
        clean.heroSlides = clean.heroSlides
          .filter((s: any) => s !== null && typeof s === "object")
          .map((s: any, idx: number) => ({
            desktopUrl: s.desktopUrl || "",
            mobileUrl: s.mobileUrl || "",
            headline: s.headline || "",
            subline: s.subline || "",
            order: typeof s.order === "number" ? s.order : idx,
          }));
      }

      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(clean),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Save failed");
      show("Hero slides saved & published live to home page!", "success");
      return true;
    } catch (e: any) {
      show(e.message, "error");
      return false;
    } finally {
      setSaving(false);
    }
  };

  const uploadHeroMedia = async (
    file: File,
    idx: number,
    field: "desktopUrl" | "mobileUrl"
  ) => {
    const key = `${idx}-${field}`;
    setUploadingKey(key);
    try {
      if (file.size > 100 * 1024 * 1024) {
        throw new Error("File exceeds 100MB limit. Please compress or optimize the video.");
      }

      const form = new FormData();
      form.append("files", file);
      const res = await fetch("/api/admin/media", {
        method: "POST",
        body: form,
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Upload failed");
      if (json.media && json.media.length > 0) {
        const uploadedUrl = json.media[0].url;
        setData((d: any) => {
          const heroSlides = Array.isArray(d?.heroSlides) ? [...d.heroSlides] : [];
          while (heroSlides.length <= idx) {
            heroSlides.push({
              desktopUrl: "",
              mobileUrl: "",
              headline: "",
              subline: "",
              order: heroSlides.length,
            });
          }
          heroSlides[idx] = {
            desktopUrl: "",
            mobileUrl: "",
            headline: "",
            subline: "",
            order: idx,
            ...heroSlides[idx],
            [field]: uploadedUrl,
          };
          const nextData = { ...d, heroSlides };
          persistSettings(nextData);
          return nextData;
        });
        show("Media uploaded and published live!", "success");
      }
    } catch (e: any) {
      show(e.message || "Upload failed", "error");
    } finally {
      setUploadingKey(null);
    }
  };

  const heroSlideSet = (
    i: number,
    field: "desktopUrl" | "mobileUrl" | "headline" | "subline" | "order",
    v: any
  ) =>
    setData((d: any) => {
      const heroSlides = Array.isArray(d?.heroSlides) ? [...d.heroSlides] : [];
      while (heroSlides.length <= i) {
        heroSlides.push({
          desktopUrl: "",
          mobileUrl: "",
          headline: "",
          subline: "",
          order: heroSlides.length,
        });
      }
      heroSlides[i] = {
        desktopUrl: "",
        mobileUrl: "",
        headline: "",
        subline: "",
        order: i,
        ...heroSlides[i],
        [field]: v,
      };
      return { ...d, heroSlides };
    });

  const heroSlideAdd = () =>
    setData((d: any) => ({
      ...d,
      heroSlides: [
        ...(d.heroSlides || []),
        {
          desktopUrl: "",
          mobileUrl: "",
          headline: "",
          subline: "",
          order: d.heroSlides?.length || 0,
        },
      ],
    }));

  const heroSlideRemove = () =>
    setData((d: any) => ({ ...d, heroSlides: (d.heroSlides || []).slice(0, -1) }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await persistSettings(data);
  };

  if (loading || !data) {
    return (
      <div className="space-y-8">
        <ToastContainer />
        <AdminPageHeader title="Home Hero Banner (Video & Photo)" />
        <div className="p-12 bg-white border border-slate-200 rounded-lg text-center text-slate-500">
          Loading hero banner settings...
        </div>
      </div>
    );
  }

  const slidesList =
    Array.isArray(data.heroSlides) && data.heroSlides.length > 0
      ? data.heroSlides
      : [
          { desktopUrl: "", mobileUrl: "", headline: "", subline: "", order: 0 },
          { desktopUrl: "", mobileUrl: "", headline: "", subline: "", order: 1 },
          { desktopUrl: "", mobileUrl: "", headline: "", subline: "", order: 2 },
        ];

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <ToastContainer />
      <AdminPageHeader
        title="🎬 Home Page Banner & Hero Slider (Video & Photo)"
        description="Upload or link high-impact Video and Photo banners for both Desktop and Mobile views."
        actions={
          <div className="flex gap-3">
            <Link
              href="/"
              target="_blank"
              className="px-4 py-2 text-xs font-semibold rounded-lg border border-slate-300 text-slate-700 bg-white hover:bg-slate-50 transition"
            >
              👁 View Live Homepage
            </Link>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2 text-xs font-bold rounded-lg bg-amber-600 hover:bg-amber-700 disabled:opacity-60 text-white shadow-md transition cursor-pointer"
            >
              💾 {saving ? "Publishing..." : "Save & Publish Slides"}
            </button>
          </div>
        }
      />

      {/* Guide Banner */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-amber-500/10 via-purple-500/5 to-slate-900/5 border border-amber-500/20 text-slate-800 flex items-start gap-4">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-purple-600 text-white flex items-center justify-center font-bold text-xl shrink-0 shadow-md">
          🎬
        </div>
        <div>
          <h3 className="font-bold text-slate-900 text-base">
            Homepage Video &amp; Photo Banner Options
          </h3>
          <p className="text-xs text-slate-600 mt-1 leading-relaxed">
            • <strong>Video &amp; Photo Support:</strong> You can upload or link video files (MP4, WebM, MOV) or images (JPG, PNG, WebP) for both <strong>Desktop</strong> and <strong>Mobile</strong> views.<br />
            • <strong>Automatic Autoplay:</strong> Videos automatically autoplay muted in a smooth loop on all devices and modern mobile browsers.<br />
            • <strong>Full-Page Edge-to-Edge:</strong> Desktop banners stretch edge-to-edge across the screen with zero distortion or forced clipping.<br />
            • <strong>Multi-Slide Touch Carousel:</strong> Add multiple slides to enable automatic transitions and swipe controls on mobile and desktop.
          </p>
        </div>
      </div>

      <AdminCard className="p-6 space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200/80 pb-4">
          <div>
            <h3 className="font-semibold text-slate-900 text-lg">Active Hero Banner Slides</h3>
            <p className="text-xs text-slate-500 mt-1">
              Desktop (≥1800×900) &amp; Mobile (≥900×1200 or 9:16 portrait) media.
            </p>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={heroSlideRemove}
              className="text-xs px-3 py-1.5 border border-slate-300 rounded-lg hover:bg-slate-100 transition cursor-pointer"
            >
              − Remove Slide
            </button>
            <button
              type="button"
              onClick={heroSlideAdd}
              className="text-xs px-3 py-1.5 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition cursor-pointer"
            >
              ＋ Add Slide
            </button>
            <button
              type="submit"
              disabled={saving}
              className="text-xs px-4 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg shadow-sm transition cursor-pointer"
            >
              💾 Save Slides
            </button>
          </div>
        </div>

        <div className="space-y-8">
          {slidesList.map((slide: any, i: number) => (
            <div
              key={i}
              className="border border-slate-200 rounded-2xl p-6 space-y-5 bg-gradient-to-br from-slate-50/70 to-white shadow-xs"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 text-amber-700 text-xs font-bold tracking-wider uppercase border border-amber-500/20">
                  <span className="w-5 h-5 rounded-full bg-amber-600 text-white grid place-items-center text-[0.65rem] font-bold">
                    {i + 1}
                  </span>
                  Slide {i + 1}
                </span>
                <div className="w-28">
                  <Field label="Display Order">
                    <input
                      type="number"
                      className={inputClass()}
                      value={slide.order ?? i}
                      onChange={(e) =>
                        heroSlideSet(i, "order", parseInt(e.target.value) || i)
                      }
                    />
                  </Field>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                {/* Desktop Media Slot */}
                <BannerMediaSlot
                  label="Desktop Banner (Video or Photo)"
                  recommendedSize="1800×900px or 16:9 ratio"
                  url={slide.desktopUrl || ""}
                  isMobileSlot={false}
                  uploading={uploadingKey === `${i}-desktopUrl`}
                  onUpload={(file) => uploadHeroMedia(file, i, "desktopUrl")}
                  onChangeUrl={(newUrl) => {
                    heroSlideSet(i, "desktopUrl", newUrl);
                    persistSettings({
                      ...data,
                      heroSlides: data.heroSlides.map((s: any, idx: number) =>
                        idx === i ? { ...s, desktopUrl: newUrl } : s
                      ),
                    });
                  }}
                  onRemove={() => {
                    heroSlideSet(i, "desktopUrl", "");
                    persistSettings({
                      ...data,
                      heroSlides: data.heroSlides.map((s: any, idx: number) =>
                        idx === i ? { ...s, desktopUrl: "" } : s
                      ),
                    });
                  }}
                />

                {/* Mobile Media Slot */}
                <BannerMediaSlot
                  label="Mobile Banner (Video or Photo)"
                  recommendedSize="900×1200px or 9:16 portrait ratio"
                  url={slide.mobileUrl || ""}
                  isMobileSlot={true}
                  uploading={uploadingKey === `${i}-mobileUrl`}
                  onUpload={(file) => uploadHeroMedia(file, i, "mobileUrl")}
                  onChangeUrl={(newUrl) => {
                    heroSlideSet(i, "mobileUrl", newUrl);
                    persistSettings({
                      ...data,
                      heroSlides: data.heroSlides.map((s: any, idx: number) =>
                        idx === i ? { ...s, mobileUrl: newUrl } : s
                      ),
                    });
                  }}
                  onRemove={() => {
                    heroSlideSet(i, "mobileUrl", "");
                    persistSettings({
                      ...data,
                      heroSlides: data.heroSlides.map((s: any, idx: number) =>
                        idx === i ? { ...s, mobileUrl: "" } : s
                      ),
                    });
                  }}
                />
              </div>

              <div className="grid md:grid-cols-2 gap-5 pt-2 border-t border-slate-100">
                <Field label="Headline (optional overlay title)">
                  <input
                    className={inputClass()}
                    value={slide.headline || ""}
                    onChange={(e) => heroSlideSet(i, "headline", e.target.value)}
                    placeholder="e.g. Precision Balls Manufacturing"
                  />
                </Field>
                <Field label="Subline (optional caption / subtitle)">
                  <input
                    className={inputClass()}
                    value={slide.subline || ""}
                    onChange={(e) => heroSlideSet(i, "subline", e.target.value)}
                    placeholder="e.g. Since 1995 — engineered for bearing & gauging."
                  />
                </Field>
              </div>
            </div>
          ))}
        </div>
      </AdminCard>

      <div className="flex justify-end gap-3">
        <Link
          href="/admin"
          className="px-5 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-800 font-medium rounded-lg text-xs transition"
        >
          Back to Dashboard
        </Link>
        <button
          type="submit"
          disabled={saving}
          className="px-6 py-2.5 bg-amber-600 hover:bg-amber-700 disabled:opacity-60 text-white font-bold rounded-lg text-xs shadow-md transition cursor-pointer"
        >
          {saving ? "Publishing..." : "Save & Publish Slides"}
        </button>
      </div>
    </form>
  );
}
