"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import AdminPageHeader, {
  Field,
  inputClass,
  useToast,
} from "@/components/admin/AdminUI";
import SeoEditorPanel, {
  InternalLinkCandidate,
} from "@/components/admin/SeoEditorPanel";
import { SeoMetadataPayload } from "@/lib/seoAnalyzer";

function isVideo(url?: string): boolean {
  if (!url) return false;
  return /\.(mp4|webm|ogg|mov)(\?.*)?$/i.test(url);
}

export default function AdminPageEdit() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [page, setPage] = useState<any>(null);
  const [seoOverride, setSeoOverride] = useState<SeoMetadataPayload | null>(
    null
  );
  const [linkCandidates, setLinkCandidates] = useState<InternalLinkCandidate[]>(
    []
  );
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { show, ToastContainer } = useToast();

  useEffect(() => {
    if (!params?.id) return;
    (async () => {
      setLoading(true);
      try {
        const [res, ovRes] = await Promise.all([
          fetch(`/api/admin/pages/${params.id}`),
          fetch("/api/admin/seo/overview"),
        ]);
        const json = await res.json();
        if (!res.ok) throw new Error(json.error);
        const loadedPage = json.page;
        setPage(loadedPage);

        if (ovRes.ok) {
          const ov = await ovRes.json();
          const items = ov.items || [];
          setLinkCandidates(
            items.map((it: any) => ({
              title: it.title,
              urlPath: it.urlPath,
              entityType: it.entityType,
              focusKeyword: it.seo?.focusKeyword || "",
            }))
          );
          const match = items.find(
            (it: any) =>
              it.entityType === "page" && it.entityId === loadedPage.slug
          );
          if (match?.seo) {
            setSeoOverride(match.seo);
          } else {
            const pPath =
              loadedPage.slug === "home" ? "/" : `/${loadedPage.slug}`;
            setSeoOverride({
              focusKeyword: (loadedPage.seoKeywords || "").split(",")[0]?.trim() || loadedPage.title || "",
              secondaryKeywords: (loadedPage.seoKeywords || "")
                .split(",")
                .slice(1)
                .map((s: string) => s.trim())
                .filter(Boolean),
              seoTitle: loadedPage.seoTitle || loadedPage.title || "",
              metaDescription:
                loadedPage.seoDescription || loadedPage.heroDescription || "",
              slug: loadedPage.slug || "",
              canonicalUrl: `https://www.dspballs.co.in${pPath}`,
              robotsIndex: true,
              robotsFollow: true,
              ogTitle: loadedPage.seoTitle || loadedPage.title || "",
              ogDescription:
                loadedPage.seoDescription || loadedPage.heroDescription || "",
              ogImage: loadedPage.ogImageUrl || "",
              breadcrumbTitle: loadedPage.title || "",
              schemaType: "WebPage",
              faqItems: [],
            });
          }
        }
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
      const mergedPage = seoOverride
        ? {
            ...page,
            seoTitle: seoOverride.seoTitle || page.seoTitle,
            seoDescription: seoOverride.metaDescription || page.seoDescription,
            seoKeywords: [
              seoOverride.focusKeyword,
              ...(seoOverride.secondaryKeywords || []),
            ]
              .filter(Boolean)
              .join(", "),
            ogImageUrl: seoOverride.ogImage || page.ogImageUrl,
          }
        : page;

      const res = await fetch(`/api/admin/pages/${page._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(mergedPage),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Save failed");

      if (seoOverride) {
        const pPath = page.slug === "home" ? "/" : `/${page.slug}`;
        await fetch("/api/admin/seo/bulk", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            update: {
              id: `page:${page.slug}`,
              entityType: "page",
              entityId: page.slug,
              urlPath: pPath,
              title: page.title,
              seo: seoOverride,
            },
          }),
        });
      }

      show("Page & Rank Math SEO settings saved live!", "success");
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

      {/* RANK MATH / YOAST SEO SUITE */}
      {seoOverride && (
        <SeoEditorPanel
          title={page.title || ""}
          bodyHtml={
            [
              `<h2>${page.heroTitle || page.title || ""}</h2>`,
              `<p>${page.heroDescription || ""}</p>`,
              ...(page.sections || []).map(
                (s: any) =>
                  `<h2>${s.heading || ""}</h2><p>${s.body || ""}</p>${
                    s.imageUrl && !isVideo(s.imageUrl)
                      ? `<img src="${s.imageUrl}" alt="${s.heading || page.title}" />`
                      : ""
                  }${
                    s.buttonLink
                      ? `<a href="${s.buttonLink}">${s.buttonText || "Learn more"}</a>`
                      : ""
                  }`
              ),
              page.bodyHtml || "",
            ].join("\n")
          }
          urlPath={pagePath}
          seo={seoOverride}
          onChange={(nextSeo) => {
            setSeoOverride(nextSeo);
            update("seoTitle", nextSeo.seoTitle);
            update("seoDescription", nextSeo.metaDescription);
            update("ogImageUrl", nextSeo.ogImage);
          }}
          linkCandidates={linkCandidates}
        />
      )}

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
