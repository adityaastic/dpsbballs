"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AdminPageHeader, {
  AdminCard,
  Field,
  inputClass,
  useToast,
} from "@/components/admin/AdminUI";

export default function AdminSettingsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { show, ToastContainer } = useToast();

  const load = async () => {
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
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    load();
  }, []);

  const update = (key: string, value: any) =>
    setData((d: any) => ({ ...d, [key]: value }));



  const persistSettings = async (newData: any) => {
    setSaving(true);
    try {
      const clean: any = { ...newData };
      clean.highlights = (clean.highlights || []).filter(
        (x: any) => x.label && x.value
      );
      clean.navLinks = (clean.navLinks || []).filter((x: any) => x.href && x.label);
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
      show("Settings saved & published to home page!", "success");
      return true;
    } catch (e: any) {
      show(e.message, "error");
      return false;
    } finally {
      setSaving(false);
    }
  };

  const uploadLogo = async (file: File, field: "logoUrl" | "logoDarkUrl" | "faviconUrl") => {
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
          const nextData = { ...d, [field]: uploadedUrl };
          persistSettings(nextData);
          return nextData;
        });
      }
    } catch (e: any) {
      show(e.message, "error");
    }
  };

  const updateOffice = (which: "workOffice" | "regdOffice", key: string, v: any) =>
    setData((d: any) => ({
      ...d,
      [which]: { ...d[which], [key]: v },
    }));
  const updateOfficeLine = (which: "workOffice" | "regdOffice", i: number, v: string) =>
    setData((d: any) => {
      const lines = [...(d[which]?.lines || [])];
      lines[i] = v;
      return { ...d, [which]: { ...d[which], lines } };
    });
  const officeLineAdd = (which: "workOffice" | "regdOffice") =>
    setData((d: any) => {
      const lines = [...(d[which]?.lines || []), ""];
      return { ...d, [which]: { ...d[which], lines } };
    });
  const officeLineRemove = (which: "workOffice" | "regdOffice") =>
    setData((d: any) => {
      const lines = (d[which]?.lines || []).slice(0, -1);
      return { ...d, [which]: { ...d[which], lines } };
    });

  const highlightSet = (i: number, field: "label" | "value", v: string) =>
    setData((d: any) => {
      const highlights = [...(d.highlights || [])];
      highlights[i] = { ...highlights[i], [field]: v };
      return { ...d, highlights };
    });
  const highlightAdd = () =>
    setData((d: any) => ({
      ...d,
      highlights: [...(d.highlights || []), { label: "", value: "" }],
    }));
  const highlightRemove = () =>
    setData((d: any) => ({
      ...d,
      highlights: (d.highlights || []).slice(0, -1),
    }));

  const navSet = (i: number, field: "href" | "label" | "order", v: any) =>
    setData((d: any) => {
      const navLinks = [...(d.navLinks || [])];
      navLinks[i] = { ...navLinks[i], [field]: v };
      return { ...d, navLinks };
    });
  const navAdd = () =>
    setData((d: any) => ({
      ...d,
      navLinks: [...(d.navLinks || []), { href: "", label: "", order: 0 }],
    }));
  const navRemove = () =>
    setData((d: any) => ({ ...d, navLinks: (d.navLinks || []).slice(0, -1) }));

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

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    await persistSettings(data);
  };

  if (loading || !data) {
    return (
      <div className="space-y-8">
        <ToastContainer />
        <AdminPageHeader title="Site Settings" />
        <div className="p-12 bg-white border border-slate-200 rounded-lg text-center text-slate-500">
          Loading settings...
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={save} className="space-y-8">
      <ToastContainer />
      <AdminPageHeader
        title="Site Settings"
        description="Update company information, contact details, navigation and SEO defaults."
      />

      <AdminCard className="p-6 space-y-5">
        <h3 className="font-semibold text-slate-900">Company</h3>
        <div className="grid md:grid-cols-2 gap-5">
          <Field label="Company name">
            <input
              className={inputClass()}
              value={data.name || ""}
              onChange={(e) => update("name", e.target.value)}
            />
          </Field>
          <Field label="Short name">
            <input
              className={inputClass()}
              value={data.shortName || ""}
              onChange={(e) => update("shortName", e.target.value)}
            />
          </Field>
          <Field label="Tagline" className="md:col-span-2">
            <input
              className={inputClass()}
              value={data.tagline || ""}
              onChange={(e) => update("tagline", e.target.value)}
            />
          </Field>
        </div>
      </AdminCard>

      <AdminCard className="p-6 space-y-5">
        <h3 className="font-semibold text-slate-900">Branding & Logos</h3>
        <p className="text-xs text-slate-500 -mt-3">
          Upload transparent PNG/SVG files. Recommended: 400x120px for logos, 64x64px for favicon.
        </p>
        <div className="grid md:grid-cols-3 gap-5">
          <div>
            <Field label="Primary Logo (light background)">
              <div className="border-2 border-dashed border-slate-300 rounded-lg p-4 text-center bg-slate-50">
                {data.logoUrl ? (
                  <div className="space-y-3">
                    <img src={data.logoUrl} alt="Primary Logo" className="h-16 mx-auto object-contain bg-white p-2 rounded" />
                    <div className="flex gap-2 justify-center">
                      <label className="text-xs px-3 py-1.5 bg-slate-700 text-white rounded cursor-pointer hover:bg-slate-800">
                        Replace
                        <input
                          type="file"
                          className="hidden"
                          accept="image/*,.svg"
                          onChange={(e) => e.target.files?.[0] && uploadLogo(e.target.files[0], "logoUrl")}
                        />
                      </label>
                      <button
                        type="button"
                        onClick={() => update("logoUrl", "")}
                        className="text-xs px-3 py-1.5 border border-slate-300 rounded text-slate-600 hover:bg-slate-100"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ) : (
                  <label className="block cursor-pointer py-6">
                    <div className="text-3xl opacity-30 mb-2">↑</div>
                    <div className="text-sm text-slate-600 mb-1">Click to upload logo</div>
                    <div className="text-xs text-slate-400">PNG, SVG, JPG</div>
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*,.svg"
                      onChange={(e) => e.target.files?.[0] && uploadLogo(e.target.files[0], "logoUrl")}
                    />
                  </label>
                )}
              </div>
            </Field>
          </div>
          <div>
            <Field label="Dark Logo (dark background)">
              <div className="border-2 border-dashed border-slate-300 rounded-lg p-4 text-center bg-slate-900">
                {data.logoDarkUrl ? (
                  <div className="space-y-3">
                    <img src={data.logoDarkUrl} alt="Dark Logo" className="h-16 mx-auto object-contain bg-slate-900 p-2 rounded" />
                    <div className="flex gap-2 justify-center">
                      <label className="text-xs px-3 py-1.5 bg-amber-600 text-white rounded cursor-pointer hover:bg-amber-700">
                        Replace
                        <input
                          type="file"
                          className="hidden"
                          accept="image/*,.svg"
                          onChange={(e) => e.target.files?.[0] && uploadLogo(e.target.files[0], "logoDarkUrl")}
                        />
                      </label>
                      <button
                        type="button"
                        onClick={() => update("logoDarkUrl", "")}
                        className="text-xs px-3 py-1.5 border border-slate-600 rounded text-slate-200 hover:bg-slate-800"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ) : (
                  <label className="block cursor-pointer py-6">
                    <div className="text-3xl opacity-30 text-white mb-2">↑</div>
                    <div className="text-sm text-slate-200 mb-1">Click to upload logo</div>
                    <div className="text-xs text-slate-500">White/light PNG or SVG</div>
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*,.svg"
                      onChange={(e) => e.target.files?.[0] && uploadLogo(e.target.files[0], "logoDarkUrl")}
                    />
                  </label>
                )}
              </div>
            </Field>
          </div>
          <div>
            <Field label="Favicon (browser tab)">
              <div className="border-2 border-dashed border-slate-300 rounded-lg p-4 text-center bg-slate-50">
                {data.faviconUrl ? (
                  <div className="space-y-3">
                    <img src={data.faviconUrl} alt="Favicon" className="h-12 w-12 mx-auto object-contain bg-white p-1 rounded border border-slate-200" />
                    <div className="flex gap-2 justify-center">
                      <label className="text-xs px-3 py-1.5 bg-slate-700 text-white rounded cursor-pointer hover:bg-slate-800">
                        Replace
                        <input
                          type="file"
                          className="hidden"
                          accept="image/x-icon,image/png,image/svg+xml,.ico"
                          onChange={(e) => e.target.files?.[0] && uploadLogo(e.target.files[0], "faviconUrl")}
                        />
                      </label>
                      <button
                        type="button"
                        onClick={() => update("faviconUrl", "")}
                        className="text-xs px-3 py-1.5 border border-slate-300 rounded text-slate-600 hover:bg-slate-100"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ) : (
                  <label className="block cursor-pointer py-6">
                    <div className="text-3xl opacity-30 mb-2">⌘</div>
                    <div className="text-sm text-slate-600 mb-1">Click to upload</div>
                    <div className="text-xs text-slate-400">ICO, PNG 32x32, SVG</div>
                    <input
                      type="file"
                      className="hidden"
                      accept="image/x-icon,image/png,image/svg+xml,.ico"
                      onChange={(e) => e.target.files?.[0] && uploadLogo(e.target.files[0], "faviconUrl")}
                    />
                  </label>
                )}
              </div>
            </Field>
          </div>
        </div>
      </AdminCard>

      <AdminCard className="p-6 space-y-5">
        <h3 className="font-semibold text-slate-900">Contact</h3>
        <div className="grid md:grid-cols-2 gap-5">
          <Field label="Email">
            <input
              type="email"
              className={inputClass()}
              value={data.email || ""}
              onChange={(e) => update("email", e.target.value)}
            />
          </Field>
          <Field label="Mobile">
            <input
              className={inputClass()}
              value={data.mobile || ""}
              onChange={(e) => update("mobile", e.target.value)}
            />
          </Field>
          <Field label="Work Office Phone">
            <input
              className={inputClass()}
              value={data.phoneWork || ""}
              onChange={(e) => update("phoneWork", e.target.value)}
            />
          </Field>
          <Field label="Regd Office Phone">
            <input
              className={inputClass()}
              value={data.phoneRegd || ""}
              onChange={(e) => update("phoneRegd", e.target.value)}
            />
          </Field>
          <Field label="Fax" className="md:col-span-2">
            <input
              className={inputClass()}
              value={data.phoneFax || ""}
              onChange={(e) => update("phoneFax", e.target.value)}
            />
          </Field>
        </div>

        <div className="grid md:grid-cols-2 gap-5 pt-3">
          <div className="space-y-3 border border-slate-200 rounded-lg p-4">
            <h4 className="font-medium text-sm text-slate-800">Work Office</h4>
            <Field label="Label">
              <input
                className={inputClass()}
                value={data.workOffice?.label || ""}
                onChange={(e) =>
                  updateOffice("workOffice", "label", e.target.value)
                }
              />
            </Field>
            {(data.workOffice?.lines || [""]).map((line: string, i: number) => (
              <Field key={i} label={`Address line ${i + 1}`}>
                <input
                  className={inputClass()}
                  value={line || ""}
                  onChange={(e) =>
                    updateOfficeLine("workOffice", i, e.target.value)
                  }
                />
              </Field>
            ))}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => officeLineRemove("workOffice")}
                className="text-xs px-2 py-1 border border-slate-300 rounded"
              >
                − Line
              </button>
              <button
                type="button"
                onClick={() => officeLineAdd("workOffice")}
                className="text-xs px-2 py-1 bg-slate-700 text-white rounded"
              >
                + Line
              </button>
            </div>
          </div>

          <div className="space-y-3 border border-slate-200 rounded-lg p-4">
            <h4 className="font-medium text-sm text-slate-800">Registered Office</h4>
            <Field label="Label">
              <input
                className={inputClass()}
                value={data.regdOffice?.label || ""}
                onChange={(e) =>
                  updateOffice("regdOffice", "label", e.target.value)
                }
              />
            </Field>
            {(data.regdOffice?.lines || [""]).map((line: string, i: number) => (
              <Field key={i} label={`Address line ${i + 1}`}>
                <input
                  className={inputClass()}
                  value={line || ""}
                  onChange={(e) =>
                    updateOfficeLine("regdOffice", i, e.target.value)
                  }
                />
              </Field>
            ))}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => officeLineRemove("regdOffice")}
                className="text-xs px-2 py-1 border border-slate-300 rounded"
              >
                − Line
              </button>
              <button
                type="button"
                onClick={() => officeLineAdd("regdOffice")}
                className="text-xs px-2 py-1 bg-slate-700 text-white rounded"
              >
                + Line
              </button>
            </div>
          </div>
        </div>
      </AdminCard>

      <AdminCard className="p-6 space-y-5">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-slate-900">Stats Highlights</h3>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={highlightRemove}
              className="text-xs px-3 py-1.5 border border-slate-300 rounded"
            >
              − Remove
            </button>
            <button
              type="button"
              onClick={highlightAdd}
              className="text-xs px-3 py-1.5 bg-slate-900 text-white rounded"
            >
              + Add
            </button>
          </div>
        </div>
        <div className="space-y-3">
          {(data.highlights || [{ label: "", value: "" }]).map(
            (h: any, i: number) => (
              <div key={i} className="grid grid-cols-2 gap-3">
                <input
                  className={inputClass()}
                  value={h.label || ""}
                  onChange={(e) => highlightSet(i, "label", e.target.value)}
                  placeholder="Label (e.g. Established)"
                />
                <input
                  className={inputClass()}
                  value={h.value || ""}
                  onChange={(e) => highlightSet(i, "value", e.target.value)}
                  placeholder="Value (e.g. 1995)"
                />
              </div>
            )
          )}
        </div>
      </AdminCard>

      <AdminCard className="p-6 space-y-5">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-slate-900">Navigation Links</h3>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={navRemove}
              className="text-xs px-3 py-1.5 border border-slate-300 rounded"
            >
              − Remove
            </button>
            <button
              type="button"
              onClick={navAdd}
              className="text-xs px-3 py-1.5 bg-slate-900 text-white rounded"
            >
              + Add Link
            </button>
          </div>
        </div>
        <div className="space-y-3">
          {(data.navLinks || [{ href: "", label: "", order: 0 }]).map(
            (n: any, i: number) => (
              <div key={i} className="grid md:grid-cols-[1.5fr_2fr_100px] gap-3">
                <input
                  className={inputClass()}
                  value={n.href || ""}
                  onChange={(e) => navSet(i, "href", e.target.value)}
                  placeholder="URL (e.g. /about)"
                />
                <input
                  className={inputClass()}
                  value={n.label || ""}
                  onChange={(e) => navSet(i, "label", e.target.value)}
                  placeholder="Label (e.g. About Us)"
                />
                <input
                  type="number"
                  className={inputClass()}
                  value={n.order ?? i}
                  onChange={(e) => navSet(i, "order", parseInt(e.target.value) || 0)}
                  placeholder="Order"
                />
              </div>
            )
          )}
        </div>
      </AdminCard>

      <AdminCard className="p-6 space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="font-semibold text-slate-900">Homepage Hero Slides</h3>
            <p className="text-xs text-slate-500 mt-1">
              Upload desktop (≥1800×900) and mobile (≥900×1200) images for each slide. Shown as layered composite on desktop and swipe carousel on mobile.
            </p>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={heroSlideRemove}
              className="text-xs px-3 py-1.5 border border-slate-300 rounded"
            >
              − Remove
            </button>
            <button
              type="button"
              onClick={heroSlideAdd}
              className="text-xs px-3 py-1.5 bg-slate-900 text-white rounded"
            >
              + Add Slide
            </button>
            <button
              type="button"
              onClick={() => persistSettings(data)}
              disabled={saving}
              className="text-xs px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 disabled:opacity-60 text-white font-bold rounded flex items-center gap-1 shadow-sm transition"
            >
              💾 {saving ? "Publishing..." : "Save & Publish Slides"}
            </button>
          </div>
        </div>

        <div className="space-y-6">
          {((data.heroSlides && data.heroSlides.length > 0 ? data.heroSlides : [
            { desktopUrl: "", mobileUrl: "", headline: "", subline: "", order: 0 },
            { desktopUrl: "", mobileUrl: "", headline: "", subline: "", order: 1 },
            { desktopUrl: "", mobileUrl: "", headline: "", subline: "", order: 2 },
          ]) as any[]).map((slide, i) => (
            <div key={i} className="border border-slate-200 rounded-xl p-5 space-y-4 bg-gradient-to-br from-slate-50/60 to-white">
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-600/10 text-amber-700 text-xs font-bold tracking-[0.12em] uppercase">
                  <span className="w-5 h-5 rounded-full bg-amber-600 text-white grid place-items-center text-[0.65rem] font-bold">
                    {i + 1}
                  </span>
                  Hero Slide {i + 1}
                </span>
                <div className="w-24">
                  <Field label="Order">
                    <input
                      type="number"
                      className={inputClass()}
                      value={slide.order ?? i}
                      onChange={(e) => heroSlideSet(i, "order", parseInt(e.target.value) || i)}
                    />
                  </Field>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-5">
                <div>
                  <Field label="Desktop Image (1800×900 recommended)">
                    <div className={`border-2 border-dashed border-slate-300 rounded-lg p-4 text-center ${slide.desktopUrl ? "bg-white" : "bg-slate-50"}`}>
                      {slide.desktopUrl ? (
                        <div className="space-y-3">
                          <div className="relative aspect-[16/9] rounded-md overflow-hidden border border-slate-200">
                            <img src={slide.desktopUrl} alt={`Desktop ${i + 1}`} className="w-full h-full object-cover" />
                          </div>
                          <div className="flex gap-2 justify-center">
                            <label className="text-xs px-3 py-1.5 bg-slate-700 text-white rounded cursor-pointer hover:bg-slate-800">
                              Replace
                              <input
                                type="file"
                                className="hidden"
                                accept="image/*"
                                onChange={(e) => e.target.files?.[0] && uploadHeroImage(e.target.files[0], i, "desktopUrl")}
                              />
                            </label>
                            <button
                              type="button"
                              onClick={() => heroSlideSet(i, "desktopUrl", "")}
                              className="text-xs px-3 py-1.5 border border-slate-300 rounded text-slate-600 hover:bg-slate-100"
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      ) : (
                        <label className="block cursor-pointer py-8">
                          <div className="text-3xl opacity-30 mb-2">🖼️</div>
                          <div className="text-sm text-slate-600 mb-1">Upload desktop background</div>
                          <div className="text-xs text-slate-400">JPG / PNG / WebP · ≥1800×900px</div>
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

                <div>
                  <Field label="Mobile Image (900×1200 recommended)">
                    <div className={`border-2 border-dashed border-slate-300 rounded-lg p-4 text-center ${slide.mobileUrl ? "bg-white" : "bg-slate-50"}`}>
                      {slide.mobileUrl ? (
                        <div className="space-y-3">
                          <div className="relative aspect-[3/4] max-w-[180px] mx-auto rounded-md overflow-hidden border border-slate-200">
                            <img src={slide.mobileUrl} alt={`Mobile ${i + 1}`} className="w-full h-full object-cover" />
                          </div>
                          <div className="flex gap-2 justify-center">
                            <label className="text-xs px-3 py-1.5 bg-slate-700 text-white rounded cursor-pointer hover:bg-slate-800">
                              Replace
                              <input
                                type="file"
                                className="hidden"
                                accept="image/*"
                                onChange={(e) => e.target.files?.[0] && uploadHeroImage(e.target.files[0], i, "mobileUrl")}
                              />
                            </label>
                            <button
                              type="button"
                              onClick={() => heroSlideSet(i, "mobileUrl", "")}
                              className="text-xs px-3 py-1.5 border border-slate-300 rounded text-slate-600 hover:bg-slate-100"
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      ) : (
                        <label className="block cursor-pointer py-8">
                          <div className="text-3xl opacity-30 mb-2">📱</div>
                          <div className="text-sm text-slate-600 mb-1">Upload mobile background</div>
                          <div className="text-xs text-slate-400">Portrait · JPG / PNG · ≥900×1200px</div>
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
                <Field label="Headline (optional)">
                  <input
                    className={inputClass()}
                    value={slide.headline || ""}
                    onChange={(e) => heroSlideSet(i, "headline", e.target.value)}
                    placeholder="e.g. Precision Balls Manufacturing"
                  />
                </Field>
                <Field label="Subline / caption (optional)">
                  <input
                    className={inputClass()}
                    value={slide.subline || ""}
                    onChange={(e) => heroSlideSet(i, "subline", e.target.value)}
                    placeholder="e.g. Since 1995 — engineered for bearing & gauging applications."
                  />
                </Field>
              </div>
            </div>
          ))}
        </div>
      </AdminCard>

      <AdminCard className="p-6 space-y-5">
        <h3 className="font-semibold text-slate-900">SEO Defaults</h3>
        <Field label="Default meta title">
          <input
            className={inputClass()}
            value={data.seoTitle || ""}
            onChange={(e) => update("seoTitle", e.target.value)}
          />
        </Field>
        <Field label="Default meta description">
          <textarea
            className={`${inputClass()} min-h-[80px]`}
            value={data.seoDescription || ""}
            onChange={(e) => update("seoDescription", e.target.value)}
          />
        </Field>
      </AdminCard>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={saving}
          className="px-6 py-2.5 bg-amber-600 hover:bg-amber-700 disabled:opacity-60 text-white font-medium rounded-md"
        >
          {saving ? "Saving..." : "Save Settings"}
        </button>
      </div>
    </form>
  );
}
