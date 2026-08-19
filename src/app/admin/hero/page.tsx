"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import AdminPageHeader, {
  AdminCard,
  Field,
  inputClass,
  useToast,
} from "@/components/admin/AdminUI";

export default function AdminHeroPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
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
    } catch (e: any) {
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

  const uploadHeroImage = async (file: File, idx: number, field: "desktopUrl" | "mobileUrl") => {
    try {
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
            heroSlides.push({ desktopUrl: "", mobileUrl: "", headline: "", subline: "", order: heroSlides.length });
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
      }
    } catch (e: any) {
      show(e.message, "error");
    }
  };

  const heroSlideSet = (i: number, field: "desktopUrl" | "mobileUrl" | "headline" | "subline" | "order", v: any) =>
    setData((d: any) => {
      const heroSlides = Array.isArray(d?.heroSlides) ? [...d.heroSlides] : [];
      while (heroSlides.length <= i) {
        heroSlides.push({ desktopUrl: "", mobileUrl: "", headline: "", subline: "", order: heroSlides.length });
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
      heroSlides: [...(d.heroSlides || []), { desktopUrl: "", mobileUrl: "", headline: "", subline: "", order: (d.heroSlides?.length || 0) }],
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
        <AdminPageHeader title="Home Hero Slider" />
        <div className="p-12 bg-white border border-slate-200 rounded-lg text-center text-slate-500">
          Loading hero banner settings...
        </div>
      </div>
    );
  }

  const slidesList = Array.isArray(data.heroSlides) && data.heroSlides.length > 0 ? data.heroSlides : [
    { desktopUrl: "", mobileUrl: "", headline: "", subline: "", order: 0 },
    { desktopUrl: "", mobileUrl: "", headline: "", subline: "", order: 1 },
    { desktopUrl: "", mobileUrl: "", headline: "", subline: "", order: 2 },
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <ToastContainer />
      <AdminPageHeader
        title="🖼️ Home Page Banner & Hero Slider"
        description="Upload, update and manage banner images displayed on your homepage."
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
              className="px-5 py-2 text-xs font-bold rounded-lg bg-amber-600 hover:bg-amber-700 disabled:opacity-60 text-white shadow-md transition"
            >
              💾 {saving ? "Publishing..." : "Save & Publish Slides"}
            </button>
          </div>
        }
      />

      {/* Guide Banner */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-amber-500/10 via-amber-600/5 to-slate-900/5 border border-amber-500/20 text-slate-800 flex items-start gap-4">
        <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center font-bold text-xl shrink-0 shadow-md">
          🖼️
        </div>
        <div>
          <h3 className="font-bold text-slate-900 text-base">
            How to Update Your Homepage Banner Images
          </h3>
          <p className="text-xs text-slate-600 mt-1 leading-relaxed">
            1. Select <strong>"Upload Desktop Image"</strong> or <strong>"Upload Mobile Image"</strong> below.<br />
            2. When you pick a file, it will <strong>automatically upload and publish live to your homepage</strong>.<br />
            3. You can add multiple slides for the mobile touch carousel or keep a single high-impact banner image.
          </p>
        </div>
      </div>

      <AdminCard className="p-6 space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200/80 pb-4">
          <div>
            <h3 className="font-semibold text-slate-900 text-lg">Active Hero Banner Slides</h3>
            <p className="text-xs text-slate-500 mt-1">
              Desktop (≥1800×900px) &amp; Mobile (≥900×1200px) images.
            </p>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={heroSlideRemove}
              className="text-xs px-3 py-1.5 border border-slate-300 rounded hover:bg-slate-100 transition"
            >
              − Remove Slide
            </button>
            <button
              type="button"
              onClick={heroSlideAdd}
              className="text-xs px-3 py-1.5 bg-slate-900 text-white rounded hover:bg-slate-800 transition"
            >
              ＋ Add Slide
            </button>
            <button
              type="submit"
              disabled={saving}
              className="text-xs px-4 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded shadow-sm transition"
            >
              💾 Save Slides
            </button>
          </div>
        </div>

        <div className="space-y-6">
          {slidesList.map((slide: any, i: number) => (
            <div
              key={i}
              className="border border-slate-200 rounded-2xl p-5 space-y-5 bg-gradient-to-br from-slate-50/70 to-white shadow-xs"
            >
              <div className="flex items-center justify-between">
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
                      onChange={(e) => heroSlideSet(i, "order", parseInt(e.target.value) || i)}
                    />
                  </Field>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                {/* Desktop Banner Image Upload */}
                <div>
                  <Field label="Desktop Banner Image (1800×900 recommended)">
                    <div className={`border-2 border-dashed border-slate-300 rounded-xl p-4 text-center ${slide.desktopUrl ? "bg-white" : "bg-slate-50"}`}>
                      {slide.desktopUrl ? (
                        <div className="space-y-3">
                          <div className="relative aspect-[16/9] rounded-lg overflow-hidden border border-slate-200 shadow-sm">
                            <img
                              src={slide.desktopUrl}
                              alt={`Desktop Slide ${i + 1}`}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="flex gap-2 justify-center">
                            <label className="text-xs px-3.5 py-1.5 bg-slate-800 text-white font-medium rounded-lg cursor-pointer hover:bg-slate-900 transition">
                              Replace Image
                              <input
                                type="file"
                                className="hidden"
                                accept="image/*"
                                onChange={(e) => e.target.files?.[0] && uploadHeroImage(e.target.files[0], i, "desktopUrl")}
                              />
                            </label>
                            <button
                              type="button"
                              onClick={() => {
                                heroSlideSet(i, "desktopUrl", "");
                                persistSettings(data);
                              }}
                              className="text-xs px-3 py-1.5 border border-slate-300 rounded-lg text-slate-600 hover:bg-slate-100 transition"
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      ) : (
                        <label className="block cursor-pointer py-10">
                          <div className="text-4xl opacity-40 mb-2">🖼️</div>
                          <div className="text-sm font-semibold text-slate-700 mb-1">
                            Click to upload Desktop Banner Image
                          </div>
                          <div className="text-xs text-slate-400">JPG, PNG, WebP · ≥1800×900px</div>
                          <input
                            type="file"
                            className="hidden"
                            accept="image/*"
                            onChange={(e) => e.target.files?.[0] && uploadHeroImage(e.target.files[0], i, "desktopUrl")}
                          />
                        </label>
                      )}
                    </div>
                  </Field>
                </div>

                {/* Mobile Banner Image Upload */}
                <div>
                  <Field label="Mobile Banner Image (900×1200 recommended)">
                    <div className={`border-2 border-dashed border-slate-300 rounded-xl p-4 text-center ${slide.mobileUrl ? "bg-white" : "bg-slate-50"}`}>
                      {slide.mobileUrl ? (
                        <div className="space-y-3">
                          <div className="relative aspect-[3/4] max-w-[180px] mx-auto rounded-lg overflow-hidden border border-slate-200 shadow-sm">
                            <img
                              src={slide.mobileUrl}
                              alt={`Mobile Slide ${i + 1}`}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="flex gap-2 justify-center">
                            <label className="text-xs px-3.5 py-1.5 bg-slate-800 text-white font-medium rounded-lg cursor-pointer hover:bg-slate-900 transition">
                              Replace Image
                              <input
                                type="file"
                                className="hidden"
                                accept="image/*"
                                onChange={(e) => e.target.files?.[0] && uploadHeroImage(e.target.files[0], i, "mobileUrl")}
                              />
                            </label>
                            <button
                              type="button"
                              onClick={() => {
                                heroSlideSet(i, "mobileUrl", "");
                                persistSettings(data);
                              }}
                              className="text-xs px-3 py-1.5 border border-slate-300 rounded-lg text-slate-600 hover:bg-slate-100 transition"
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      ) : (
                        <label className="block cursor-pointer py-10">
                          <div className="text-4xl opacity-40 mb-2">📱</div>
                          <div className="text-sm font-semibold text-slate-700 mb-1">
                            Click to upload Mobile Banner Image
                          </div>
                          <div className="text-xs text-slate-400">Portrait · JPG, PNG · ≥900×1200px</div>
                          <input
                            type="file"
                            className="hidden"
                            accept="image/*"
                            onChange={(e) => e.target.files?.[0] && uploadHeroImage(e.target.files[0], i, "mobileUrl")}
                          />
                        </label>
                      )}
                    </div>
                  </Field>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-5 pt-1">
                <Field label="Headline (optional overlay text)">
                  <input
                    className={inputClass()}
                    value={slide.headline || ""}
                    onChange={(e) => heroSlideSet(i, "headline", e.target.value)}
                    placeholder="e.g. Precision Balls Manufacturing"
                  />
                </Field>
                <Field label="Subline (optional caption text)">
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
          className="px-5 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-800 font-medium rounded-lg text-xs"
        >
          Back to Dashboard
        </Link>
        <button
          type="submit"
          disabled={saving}
          className="px-6 py-2.5 bg-amber-600 hover:bg-amber-700 disabled:opacity-60 text-white font-bold rounded-lg text-xs shadow-md transition"
        >
          {saving ? "Publishing..." : "Save & Publish Slides"}
        </button>
      </div>
    </form>
  );
}
