"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import AdminPageHeader, {
  Field,
  inputClass,
  useToast,
} from "@/components/admin/AdminUI";

function isVideo(url?: string): boolean {
  if (!url) return false;
  return /\.(mp4|webm|ogg|mov)(\?.*)?$/i.test(url);
}

export default function AdminPageEdit() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [page, setPage] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { show, ToastContainer } = useToast();

  useEffect(() => {
    if (!params?.id) return;
    (async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/admin/pages/${params.id}`);
        const json = await res.json();
        if (!res.ok) throw new Error(json.error);
        setPage(json.page);
      } catch (e: any) {
        show(e.message, "error");
      } finally {
        setLoading(false);
      }
    })();
  }, [params?.id, show]);

  const update = (k: string, v: any) => setPage((p: any) => ({ ...p, [k]: v }));

  const uploadSectionMedia = async (file: File, idx: number) => {
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
        sectionSet(idx, "imageUrl", json.media[0].url);
        show("Section photo/video uploaded successfully!", "success");
      }
    } catch (e: any) {
      show(e.message, "error");
    }
  };

  const uploadOgImage = async (file: File) => {
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
        update("ogImageUrl", json.media[0].url);
        show("Page OG image uploaded!", "success");
      }
    } catch (e: any) {
      show(e.message, "error");
    }
  };

  const sectionSet = (i: number, f: string, v: any) =>
    setPage((p: any) => {
      const s = [...(p.sections || [])];
      s[i] = { ...s[i], [f]: v };
      return { ...p, sections: s };
    });

  const sectionAdd = () =>
    setPage((p: any) => ({
      ...p,
      sections: [
        ...(p.sections || []),
        {
          key: `section_${Date.now()}`,
          heading: "",
          subheading: "",
          body: "",
          imageUrl: "",
          buttonText: "",
          buttonLink: "",
          order: p.sections?.length || 0,
        },
      ],
    }));

  const sectionRemove = (idx?: number) =>
    setPage((p: any) => {
      const s = [...(p.sections || [])];
      if (typeof idx === "number") {
        s.splice(idx, 1);
      } else {
        s.pop();
      }
      return { ...p, sections: s };
    });

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/pages/${page._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(page),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Save failed");
      show("Page saved & published live!", "success");
    } catch (e: any) {
      show(e.message, "error");
    } finally {
      setSaving(false);
    }
  };

  if (loading || !page) {
    return (
      <div>
        <ToastContainer />
        <AdminPageHeader title="Edit Page" />
        <div className="p-12 bg-white border border-slate-200 rounded-lg text-center text-slate-500">
          Loading page data...
        </div>
      </div>
    );
  }

  const pagePath = page.slug === "home" ? "/" : `/${page.slug}`;

  return (
    <form onSubmit={save} className="space-y-8">
      <ToastContainer />
      <AdminPageHeader
        title={`Edit: ${page.title}`}
        description={`Live route: ${pagePath}`}
        actions={
          <div className="flex gap-2">
            <Link
              href="/admin/pages"
              className="px-4 py-2 border border-slate-300 text-sm rounded-md hover:bg-slate-50"
            >
              ← Back to Pages
            </Link>
            <Link
              href={pagePath}
              target="_blank"
              className="px-4 py-2 bg-slate-900 text-white text-sm rounded-md hover:bg-slate-800"
            >
              Preview Live Page ↗
            </Link>
          </div>
        }
      />

      {/* BASIC DETAILS */}
      <div className="bg-white border border-slate-200 rounded-lg p-6 space-y-5">
        <h3 className="font-semibold text-slate-900 text-lg">Basics</h3>
        <div className="grid md:grid-cols-2 gap-5">
          <Field label="Page Title">
            <input
              className={inputClass()}
              value={page.title || ""}
              onChange={(e) => update("title", e.target.value)}
              placeholder="e.g. About Us"
            />
          </Field>
          <Field label="URL Slug">
            <input
              className={inputClass()}
              value={page.slug || ""}
              onChange={(e) => update("slug", e.target.value)}
              placeholder="e.g. about (or 'home' for Home page)"
            />
          </Field>
        </div>
      </div>

      {/* HERO SECTION */}
      <div className="bg-white border border-slate-200 rounded-lg p-6 space-y-5">
        <h3 className="font-semibold text-slate-900 text-lg">Hero Banner / Header Section</h3>
        <div className="grid gap-5">
          <Field label="Hero Eyebrow (Badge text above title)">
            <input
              className={inputClass()}
              value={page.heroEyebrow || ""}
              onChange={(e) => update("heroEyebrow", e.target.value)}
              placeholder="e.g. About DSP"
            />
          </Field>
          <Field label="Hero Main Title">
            <input
              className={inputClass()}
              value={page.heroTitle || ""}
              onChange={(e) => update("heroTitle", e.target.value)}
              placeholder="e.g. Precision manufacturing from the foothills of the Himalayas"
            />
          </Field>
          <Field label="Hero Subtitle / Description">
            <textarea
              className={`${inputClass()} min-h-[90px]`}
              value={page.heroDescription || ""}
              onChange={(e) => update("heroDescription", e.target.value)}
              placeholder="Detailed description shown in the hero header..."
            />
          </Field>
        </div>
      </div>

      {/* CONTENT SECTIONS */}
      <div className="bg-white border border-slate-200 rounded-lg p-6 space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-slate-900 text-lg">Page Content Sections</h3>
            <p className="text-xs text-slate-500">
              Each section has heading, subheading, body text, buttons, and photo/video upload.
            </p>
          </div>
          <button
            type="button"
            onClick={sectionAdd}
            className="text-xs px-3.5 py-2 bg-amber-600 hover:bg-amber-700 text-white font-medium rounded-md flex items-center gap-1.5"
          >
            <span>+</span> Add Section
          </button>
        </div>

        <div className="space-y-6">
          {(page.sections || []).map((s: any, i: number) => (
            <div key={i} className="border border-slate-200 rounded-xl p-5 space-y-4 bg-slate-50/50">
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-600">
                  Section #{i + 1} {s.key ? `(${s.key})` : ""}
                </span>
                <button
                  type="button"
                  onClick={() => sectionRemove(i)}
                  className="text-xs text-red-600 hover:text-red-700 font-medium"
                >
                  ✕ Remove
                </button>
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                <Field label="Section Subheading / Eyebrow">
                  <input
                    className={inputClass()}
                    value={s.subheading || ""}
                    onChange={(e) => sectionSet(i, "subheading", e.target.value)}
                    placeholder="e.g. Who we are"
                  />
                </Field>
                <Field label="Section Main Heading">
                  <input
                    className={inputClass()}
                    value={s.heading || ""}
                    onChange={(e) => sectionSet(i, "heading", e.target.value)}
                    placeholder="e.g. Precision balls engineered for..."
                  />
                </Field>
                <Field label="Display Order">
                  <input
                    type="number"
                    className={inputClass()}
                    value={s.order ?? i}
                    onChange={(e) => sectionSet(i, "order", parseInt(e.target.value) || 0)}
                  />
                </Field>
              </div>

              <Field label="Section Body Copy (paragraphs separated by blank lines)">
                <textarea
                  className={`${inputClass()} min-h-[120px]`}
                  value={s.body || ""}
                  onChange={(e) => sectionSet(i, "body", e.target.value)}
                  placeholder="Enter content text..."
                />
              </Field>

              <div className="grid md:grid-cols-2 gap-4">
                <Field label="Call to Action Button Text (optional)">
                  <input
                    className={inputClass()}
                    value={s.buttonText || ""}
                    onChange={(e) => sectionSet(i, "buttonText", e.target.value)}
                    placeholder="e.g. About DSP or Contact sales"
                  />
                </Field>
                <Field label="Button Link / URL (optional)">
                  <input
                    className={inputClass()}
                    value={s.buttonLink || ""}
                    onChange={(e) => sectionSet(i, "buttonLink", e.target.value)}
                    placeholder="e.g. /about or /contact"
                  />
                </Field>
              </div>

              {/* PHOTO / VIDEO UPLOAD & PREVIEW */}
              <Field label="Section Photo or Video (Image / MP4 / WebM)">
                <div className="border border-dashed border-slate-300 rounded-lg p-4 bg-white flex flex-col md:flex-row items-center justify-between gap-4">
                  {s.imageUrl ? (
                    <div className="flex items-center gap-4 w-full md:w-auto">
                      {isVideo(s.imageUrl) ? (
                        <video
                          src={s.imageUrl}
                          className="h-20 w-32 object-cover rounded border border-slate-200"
                          autoPlay
                          muted
                          loop
                          playsInline
                        />
                      ) : (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img
                          src={s.imageUrl}
                          alt="Section preview"
                          className="h-20 w-32 object-cover rounded border border-slate-200"
                        />
                      )}
                      <div className="space-y-1 text-xs">
                        <p className="font-semibold text-slate-800">
                          {isVideo(s.imageUrl) ? "🎥 Video Linked" : "📷 Photo Linked"}
                        </p>
                        <p className="font-mono text-slate-500 truncate max-w-xs">{s.imageUrl}</p>
                        <button
                          type="button"
                          onClick={() => sectionSet(i, "imageUrl", "")}
                          className="px-2.5 py-1 text-xs text-red-600 hover:bg-red-50 border border-red-200 rounded"
                        >
                          Remove Media
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-xs text-slate-500">
                      No photo or video assigned for this section.
                    </div>
                  )}

                  <div className="flex items-center gap-2 w-full md:w-auto justify-end">
                    <input
                      className={`${inputClass()} text-xs font-mono max-w-xs`}
                      value={s.imageUrl || ""}
                      onChange={(e) => sectionSet(i, "imageUrl", e.target.value)}
                      placeholder="Paste Media / Video URL"
                    />
                    <label className="cursor-pointer text-xs font-semibold px-3 py-2 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 rounded flex items-center gap-1.5 whitespace-nowrap">
                      <span>↑ Upload File</span>
                      <input
                        type="file"
                        className="hidden"
                        accept="image/*,video/*,.mp4,.webm,.mov"
                        onChange={(e) => e.target.files?.[0] && uploadSectionMedia(e.target.files[0], i)}
                      />
                    </label>
                  </div>
                </div>
              </Field>
            </div>
          ))}
        </div>
      </div>

      {/* PER-PAGE SEO SETTINGS */}
      <div className="bg-white border border-slate-200 rounded-lg p-6 space-y-5">
        <h3 className="font-semibold text-slate-900 text-lg flex items-center gap-2">
          <span>🔍</span> Per-Page SEO & Google Search Meta
        </h3>
        <p className="text-xs text-slate-500">
          Customize how this specific page appears in Google search results and when shared on LinkedIn, WhatsApp, etc.
        </p>

        <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg max-w-xl">
          <div className="text-xs text-slate-600 truncate mb-1">
            https://www.dspballs.co.in{pagePath}
          </div>
          <div className="text-base text-blue-700 font-medium truncate">
            {page.seoTitle || page.title || "Page Title"} | DSP Precision Products Pvt. Ltd.
          </div>
          <div className="text-xs text-slate-600 mt-1 line-clamp-2">
            {page.seoDescription || page.heroDescription || "Page description in search results."}
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-5">
          <Field label="Page SEO Meta Title (overrides default)">
            <input
              className={inputClass()}
              value={page.seoTitle || ""}
              onChange={(e) => update("seoTitle", e.target.value)}
              placeholder={`${page.title} | DSP Precision Products`}
            />
          </Field>
          <Field label="Page Keywords (comma-separated)">
            <input
              className={inputClass()}
              value={page.seoKeywords || ""}
              onChange={(e) => update("seoKeywords", e.target.value)}
              placeholder="precision balls, manufacturer, grade 10..."
            />
          </Field>
        </div>

        <Field label="Page Meta Description">
          <textarea
            className={`${inputClass()} min-h-[80px]`}
            value={page.seoDescription || ""}
            onChange={(e) => update("seoDescription", e.target.value)}
            placeholder="Targeted summary for this specific page..."
          />
        </Field>

        <Field label="Social Share (OG) Image for this page">
          <div className="flex items-center gap-3">
            <input
              className={`${inputClass()} font-mono text-xs`}
              value={page.ogImageUrl || ""}
              onChange={(e) => update("ogImageUrl", e.target.value)}
              placeholder="https://... custom social share image URL"
            />
            <label className="cursor-pointer text-xs font-semibold px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 rounded whitespace-nowrap">
              <span>Upload Image</span>
              <input
                type="file"
                className="hidden"
                accept="image/*"
                onChange={(e) => e.target.files?.[0] && uploadOgImage(e.target.files[0])}
              />
            </label>
          </div>
        </Field>
      </div>

      {/* FREE-FORM HTML */}
      <div className="bg-white border border-slate-200 rounded-lg p-6 space-y-5">
        <h3 className="font-semibold text-slate-900 text-lg">Custom HTML Embed (optional)</h3>
        <Field label="Raw HTML / Embed Code (for maps, custom widgets, etc.)">
          <textarea
            className={`${inputClass()} min-h-[140px] font-mono text-xs`}
            value={page.bodyHtml || ""}
            onChange={(e) => update("bodyHtml", e.target.value)}
            placeholder="<div>Optional custom HTML</div>"
          />
        </Field>
      </div>

      <div className="flex justify-end gap-3 sticky bottom-4 p-4 bg-white/95 backdrop-blur border border-slate-200 rounded-xl shadow-lg">
        <button
          type="button"
          onClick={() => router.back()}
          className="px-6 py-2.5 border border-slate-300 text-slate-700 rounded-md hover:bg-slate-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={saving}
          className="px-7 py-2.5 bg-amber-600 hover:bg-amber-700 disabled:opacity-60 text-white font-semibold rounded-md shadow-sm transition"
        >
          {saving ? "Saving Page..." : "Save & Publish Page"}
        </button>
      </div>
    </form>
  );
}
