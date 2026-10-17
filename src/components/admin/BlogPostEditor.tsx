"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import SeoEditorPanel, {
  InternalLinkCandidate,
} from "@/components/admin/SeoEditorPanel";
import {
  extractTableOfContents,
  SeoMetadataPayload,
} from "@/lib/seoAnalyzer";
import { BlogArticleRecord } from "@/lib/seoCms";

type BlogPostEditorProps = {
  initialSlug?: string;
  isNew?: boolean;
};

const DEFAULT_CATEGORIES = [
  "Metallurgy & Materials",
  "Quality & Metrology",
  "Corrosion & Chemical Engineering",
  "Bearing & Automotive Applications",
  "Valve & Flow Control",
  "Manufacturing & Infrastructure",
];

export default function BlogPostEditor({
  initialSlug,
  isNew = false,
}: BlogPostEditorProps) {
  const router = useRouter();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [editorMode, setEditorMode] = useState<"write" | "preview" | "split">(
    "split"
  );
  const [showImageModal, setShowImageModal] = useState(false);
  const [imageModalTarget, setImageModalTarget] = useState<
    "featured" | "inline"
  >("inline");
  const [inlineImgUrl, setInlineImgUrl] = useState("");
  const [inlineImgAlt, setInlineImgAlt] = useState("");
  const [inlineImgTitle, setInlineImgTitle] = useState("");
  const [inlineImgCaption, setInlineImgCaption] = useState("");
  const [mediaItems, setMediaItems] = useState<{ url: string; name: string }[]>(
    []
  );
  const [showRevisionsModal, setShowRevisionsModal] = useState(false);

  const [linkCandidates, setLinkCandidates] = useState<InternalLinkCandidate[]>(
    []
  );
  const [allArticles, setAllArticles] = useState<
    { slug: string; title: string }[]
  >([]);

  const [article, setArticle] = useState<BlogArticleRecord>({
    id: "",
    slug: "",
    title: "",
    excerpt: "",
    customIntro: "",
    bodyHtml: `<h2>Introduction & Overview</h2>\n<p>Start writing your technical engineering guide here...</p>\n<h2>Material Composition & Standards</h2>\n<p>Include ISO 3290 grades, hardness ranges, and application tolerances.</p>`,
    featuredImage: "/images/products/high-chrome-steel-balls.webp",
    featuredImageAlt: "",
    featuredImageCaption: "",
    featuredImageTitle: "",
    category: "Metallurgy & Materials",
    tags: ["Precision Balls", "ISO 3290"],
    authorName: "DSP Metallurgy & Quality Engineering Team",
    authorRole: "ISO 9001:2015 Certified Precision Ball Specialists",
    status: "draft",
    publishedAt: new Date().toISOString(),
    scheduledFor: "",
    updatedAt: new Date().toISOString(),
    featured: false,
    relatedSlugs: [],
    readingTimeMinutes: 3,
    wordCount: 250,
    tableOfContents: [],
    revisions: [],
    seo: {
      focusKeyword: "",
      secondaryKeywords: [],
      seoTitle: "",
      metaDescription: "",
      slug: "",
      canonicalUrl: "",
      robotsIndex: true,
      robotsFollow: true,
      ogTitle: "",
      ogDescription: "",
      ogImage: "/images/products/high-chrome-steel-balls.webp",
      breadcrumbTitle: "",
      schemaType: "TechArticle",
      faqItems: [],
    },
  });

  useEffect(() => {
    // Load link candidates & media library
    fetch("/api/admin/seo/overview")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (d?.items) {
          setLinkCandidates(
            d.items.map((it: any) => ({
              title: it.title,
              urlPath: it.urlPath,
              entityType: it.entityType,
              focusKeyword: it.seo?.focusKeyword || "",
            }))
          );
          setAllArticles(
            d.items
              .filter((it: any) => it.entityType === "blog")
              .map((it: any) => ({ slug: it.entityId, title: it.title }))
          );
        }
      })
      .catch(() => {});

    fetch("/api/admin/media")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (Array.isArray(d?.files)) {
          setMediaItems(
            d.files.map((f: any) => ({
              url: f.url || f.publicUrl,
              name: f.name || f.filename || "media",
            }))
          );
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!isNew && initialSlug) {
      setLoading(true);
      fetch(`/api/admin/blog/${initialSlug}`)
        .then((r) => {
          if (!r.ok) throw new Error("Not found");
          return r.json();
        })
        .then((data: BlogArticleRecord) => {
          setArticle(data);
        })
        .catch(() => {
          setErrorMsg("Could not load blog article.");
        })
        .finally(() => setLoading(false));
    }
  }, [isNew, initialSlug]);

  // Autosave to localStorage every 12 seconds
  useEffect(() => {
    if (!article.title) return;
    const timer = setTimeout(() => {
      try {
        const key = `dsp_blog_autosave_${initialSlug || "new"}`;
        localStorage.setItem(
          key,
          JSON.stringify({
            savedAt: new Date().toISOString(),
            article,
          })
        );
      } catch {
        // ignore storage quota errors
      }
    }, 12000);
    return () => clearTimeout(timer);
  }, [article, initialSlug]);

  const liveToc = useMemo(
    () => extractTableOfContents(article.bodyHtml || ""),
    [article.bodyHtml]
  );

  const insertAtCursor = (snippet: string) => {
    const el = textareaRef.current;
    if (!el) {
      setArticle((prev) => ({
        ...prev,
        bodyHtml: prev.bodyHtml + "\n" + snippet,
      }));
      return;
    }
    const start = el.selectionStart || 0;
    const end = el.selectionEnd || 0;
    const selected = article.bodyHtml.slice(start, end);
    const replacement = snippet.includes("__SELECTION__")
      ? snippet.replace("__SELECTION__", selected || "Heading / Text")
      : snippet;

    const nextHtml =
      article.bodyHtml.slice(0, start) +
      replacement +
      article.bodyHtml.slice(end);
    setArticle((prev) => ({ ...prev, bodyHtml: nextHtml }));
    setTimeout(() => {
      el.focus();
    }, 30);
  };

  const handleSave = async (overrideStatus?: "draft" | "published" | "scheduled") => {
    setSaving(true);
    setErrorMsg("");
    setSaveMessage("");

    try {
      const targetStatus = overrideStatus || article.status;
      const slugToUse =
        (article.slug || article.seo.slug || article.title)
          .toLowerCase()
          .replace(/[^a-z0-9-]+/g, "-")
          .replace(/^-+|-+$/g, "") || `article-${Date.now()}`;

      const payload: Partial<BlogArticleRecord> & { previousSlug?: string } = {
        ...article,
        slug: slugToUse,
        status: targetStatus,
        seo: {
          ...article.seo,
          slug: slugToUse,
          canonicalUrl:
            article.seo.canonicalUrl ||
            `https://www.dspballs.co.in/blog/${slugToUse}`,
        },
        previousSlug: !isNew ? initialSlug : undefined,
      };

      const url = isNew ? "/api/admin/blog" : `/api/admin/blog/${initialSlug}`;
      const method = isNew ? "POST" : "PUT";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error || "Failed to save article");
        return;
      }

      setArticle(data);
      setSaveMessage(
        !isNew && initialSlug && data.slug !== initialSlug
          ? `Saved! Automatic 301 Redirect created from /blog/${initialSlug} → /blog/${data.slug}`
          : targetStatus === "published"
          ? "Article published live and XML Sitemap updated!"
          : "Article saved successfully!"
      );

      if (isNew || (initialSlug && data.slug !== initialSlug)) {
        router.replace(`/admin/blog/${data.slug}`);
      }
    } catch {
      setErrorMsg("Network error while saving article");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 text-slate-400">
        Loading WordPress-style blog editor...
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-16">
      {/* Top Action Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 text-white flex flex-wrap items-center justify-between gap-4 sticky top-16 z-20 shadow-xl">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/blog"
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-medium"
          >
            ← All Articles
          </Link>
          <div>
            <h1 className="text-base sm:text-lg font-bold line-clamp-1">
              {isNew ? "Create New Blog Article" : `Editing: ${article.title}`}
            </h1>
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <span className="font-mono">
                /blog/{article.slug || "auto-slug"}
              </span>
              <span>·</span>
              <span>
                {liveToc.toc.length} Headings in Auto-TOC
              </span>
              {article.revisions?.length > 0 && (
                <>
                  <span>·</span>
                  <button
                    type="button"
                    onClick={() => setShowRevisionsModal(true)}
                    className="text-blue-400 hover:underline"
                  >
                    🕒 {article.revisions.length} Revisions
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {!isNew && (
            <a
              href={`/blog/${article.slug}`}
              target="_blank"
              rel="noreferrer"
              className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-medium border border-slate-700"
            >
              Preview Live Page ↗
            </a>
          )}
          <button
            type="button"
            disabled={saving}
            onClick={() => handleSave("draft")}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold border border-slate-700"
          >
            Save Draft
          </button>
          <button
            type="button"
            disabled={saving}
            onClick={() => handleSave("published")}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-lg shadow-blue-600/25"
          >
            {saving
              ? "Saving..."
              : article.status === "published"
              ? "Update Published Article"
              : "Publish Article Now"}
          </button>
        </div>
      </div>

      {saveMessage && (
        <div className="p-4 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-sm font-medium">
          ✓ {saveMessage}
        </div>
      )}
      {errorMsg && (
        <div className="p-4 rounded-xl bg-red-500/15 border border-red-500/30 text-red-300 text-sm font-medium">
          ✕ {errorMsg}
        </div>
      )}

      {/* Main Two-Column WordPress Layout */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Left 2 Columns: Content Editor + Rank Math SEO Panel */}
        <div className="xl:col-span-2 space-y-6">
          {/* Title, Slug & Excerpt Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 text-white">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                Article H1 Headline
              </label>
              <input
                type="text"
                value={article.title}
                onChange={(e) => {
                  const nextTitle = e.target.value;
                  const autoSlug =
                    isNew && !article.slug
                      ? nextTitle
                          .toLowerCase()
                          .replace(/[^a-z0-9]+/g, "-")
                          .replace(/^-+|-+$/g, "")
                      : article.slug;
                  setArticle((prev) => ({
                    ...prev,
                    title: nextTitle,
                    slug: autoSlug,
                    seo: {
                      ...prev.seo,
                      slug: autoSlug,
                      seoTitle: prev.seo.seoTitle || nextTitle,
                    },
                  }));
                }}
                placeholder="e.g. AISI 52100 Chrome Steel Balls: Complete Engineering, Hardness & ISO 3290 Grade Guide"
                className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white text-base font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                  Permalink Slug {!isNew && "(Changing creates auto-301 redirect)"}
                </label>
                <div className="flex items-center bg-slate-800 border border-slate-700 rounded-lg overflow-hidden">
                  <span className="px-3 py-2 text-xs text-slate-400 bg-slate-950/60 border-r border-slate-700 font-mono">
                    /blog/
                  </span>
                  <input
                    type="text"
                    value={article.slug}
                    onChange={(e) => {
                      const clean = e.target.value
                        .toLowerCase()
                        .replace(/[^a-z0-9-]+/g, "-")
                        .replace(/^-+|-+$/g, "");
                      setArticle((prev) => ({
                        ...prev,
                        slug: clean,
                        seo: { ...prev.seo, slug: clean },
                      }));
                    }}
                    placeholder="aisi-52100-chrome-steel-balls-guide"
                    className="w-full px-3 py-2 bg-transparent text-white text-xs font-mono focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                  Custom Lead Introduction (Optional)
                </label>
                <input
                  type="text"
                  value={article.customIntro}
                  onChange={(e) =>
                    setArticle((prev) => ({
                      ...prev,
                      customIntro: e.target.value,
                    }))
                  }
                  placeholder="Highlighted executive summary shown at top of article..."
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-xs"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                Article Excerpt / Summary (Used on Blog Index cards)
              </label>
              <textarea
                rows={2}
                value={article.excerpt}
                onChange={(e) =>
                  setArticle((prev) => ({ ...prev, excerpt: e.target.value }))
                }
                placeholder="Concise 1–2 sentence overview for blog archive cards..."
                className="w-full px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm"
              />
            </div>
          </div>

          {/* Rich Content Block & HTML Editor */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden text-white">
            {/* Formatting Toolbar */}
            <div className="p-3 bg-slate-950 border-b border-slate-800 flex flex-wrap items-center justify-between gap-2">
              <div className="flex flex-wrap items-center gap-1">
                <button
                  type="button"
                  onClick={() => insertAtCursor("<h2>__SELECTION__</h2>\n")}
                  className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 rounded text-xs font-bold"
                  title="Insert H2 Subheading"
                >
                  H2
                </button>
                <button
                  type="button"
                  onClick={() => insertAtCursor("<h3>__SELECTION__</h3>\n")}
                  className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 rounded text-xs font-bold"
                  title="Insert H3 Subheading"
                >
                  H3
                </button>
                <button
                  type="button"
                  onClick={() => insertAtCursor("<h4>__SELECTION__</h4>\n")}
                  className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 rounded text-xs font-bold"
                  title="Insert H4 Subheading"
                >
                  H4
                </button>
                <button
                  type="button"
                  onClick={() => insertAtCursor("<p>__SELECTION__</p>\n")}
                  className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 rounded text-xs"
                >
                  ¶ Paragraph
                </button>
                <button
                  type="button"
                  onClick={() => insertAtCursor("<strong>__SELECTION__</strong>")}
                  className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 rounded text-xs font-bold"
                >
                  B
                </button>
                <button
                  type="button"
                  onClick={() => insertAtCursor("<em>__SELECTION__</em>")}
                  className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 rounded text-xs italic"
                >
                  I
                </button>
                <button
                  type="button"
                  onClick={() =>
                    insertAtCursor(
                      "<ul>\n  <li><strong>Key Point:</strong> Specification detail</li>\n  <li><strong>Tolerance:</strong> ISO 3290 standard</li>\n</ul>\n"
                    )
                  }
                  className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 rounded text-xs"
                >
                  • List
                </button>
                <button
                  type="button"
                  onClick={() =>
                    insertAtCursor(
                      "<ol>\n  <li>Step 1: Cold Heading</li>\n  <li>Step 2: Heat Treatment & Hardening</li>\n  <li>Step 3: Precision Lapping</li>\n</ol>\n"
                    )
                  }
                  className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 rounded text-xs"
                >
                  1. List
                </button>
                <button
                  type="button"
                  onClick={() =>
                    insertAtCursor(
                      `<table>\n  <thead>\n    <tr><th>Parameter / Grade</th><th>Specification</th><th>Application</th></tr>\n  </thead>\n  <tbody>\n    <tr><td>Grade G10</td><td>±0.25 µm Sphericity</td><td>High-speed precision bearings</td></tr>\n    <tr><td>Grade G28</td><td>±0.70 µm Sphericity</td><td>Automotive & industrial bearings</td></tr>\n  </tbody>\n</table>\n`
                    )
                  }
                  className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 rounded text-xs"
                >
                  ⊞ Spec Table
                </button>
                <button
                  type="button"
                  onClick={() =>
                    insertAtCursor(
                      `<blockquote><strong>Engineering Note:</strong> Always verify material hardness and chemical compatibility prior to specifying ball grade.</blockquote>\n`
                    )
                  }
                  className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 rounded text-xs"
                >
                  ❝ Callout
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setImageModalTarget("inline");
                    setShowImageModal(true);
                  }}
                  className="px-2.5 py-1.5 bg-blue-600/20 hover:bg-blue-600/40 text-blue-300 border border-blue-500/30 rounded text-xs font-medium"
                >
                  🖼️ Insert Image + Alt
                </button>
              </div>

              {/* Editor View Mode Toggle */}
              <div className="flex items-center gap-1 bg-slate-900 p-0.5 rounded-lg border border-slate-800">
                {[
                  { id: "write", label: "Editor" },
                  { id: "split", label: "Split Live View" },
                  { id: "preview", label: "Full Preview" },
                ].map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setEditorMode(m.id as any)}
                    className={`px-2.5 py-1 rounded text-xs font-medium ${
                      editorMode === m.id
                        ? "bg-blue-600 text-white"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    {m.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Editor Body */}
            <div
              className={`grid ${
                editorMode === "split"
                  ? "grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-slate-800"
                  : "grid-cols-1"
              }`}
            >
              {(editorMode === "write" || editorMode === "split") && (
                <div className="p-4">
                  <textarea
                    ref={textareaRef}
                    rows={22}
                    value={article.bodyHtml}
                    onChange={(e) =>
                      setArticle((prev) => ({
                        ...prev,
                        bodyHtml: e.target.value,
                      }))
                    }
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-slate-100 font-mono text-xs leading-relaxed focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Write article HTML or use the toolbar buttons above..."
                  />
                </div>
              )}

              {(editorMode === "preview" || editorMode === "split") && (
                <div className="p-5 bg-white text-slate-900 max-h-[600px] overflow-y-auto">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                    Live Article Rendering + Auto Table of Contents
                  </div>
                  {liveToc.toc.length > 0 && (
                    <div className="mb-4 p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
                      <div className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                        Table of Contents (Auto-generated)
                      </div>
                      <ul className="space-y-1 text-xs text-blue-700">
                        {liveToc.toc.map((t) => (
                          <li
                            key={t.id}
                            style={{ paddingLeft: `${(t.level - 2) * 12}px` }}
                          >
                            • {t.text}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  <div
                    className="prose prose-sm max-w-none prose-headings:font-bold prose-headings:text-slate-900 prose-a:text-blue-600 prose-table:border prose-th:bg-slate-100 prose-th:p-2 prose-td:p-2 prose-td:border"
                    dangerouslySetInnerHTML={{ __html: liveToc.htmlWithIds }}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Dedicated Rank Math / Yoast SEO Panel */}
          <SeoEditorPanel
            title={article.title}
            bodyHtml={article.bodyHtml}
            urlPath={`/blog/${article.slug || "new-article"}`}
            seo={article.seo}
            onChange={(nextSeo) =>
              setArticle((prev) => ({
                ...prev,
                slug: nextSeo.slug || prev.slug,
                seo: nextSeo,
              }))
            }
            onSlugChange={(cleanSlug) =>
              setArticle((prev) => ({
                ...prev,
                slug: cleanSlug,
                seo: { ...prev.seo, slug: cleanSlug },
              }))
            }
            onInsertInternalLink={(anchorHtml) => insertAtCursor(anchorHtml)}
            linkCandidates={linkCandidates}
          />
        </div>

        {/* Right Sidebar: Publishing, Featured Image, Taxonomy & Related Posts */}
        <div className="space-y-6">
          {/* Publishing & Scheduling Box */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 text-white space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Publishing & Scheduling
            </h3>

            <div>
              <label className="block text-xs text-slate-300 mb-1">
                Publication Status
              </label>
              <select
                value={article.status}
                onChange={(e) =>
                  setArticle((prev) => ({
                    ...prev,
                    status: e.target.value as any,
                  }))
                }
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white"
              >
                <option value="draft">Draft (Hidden from public & sitemap)</option>
                <option value="published">Published (Live on website)</option>
                <option value="scheduled">Scheduled (Future publication date)</option>
              </select>
            </div>

            {article.status === "scheduled" && (
              <div>
                <label className="block text-xs text-slate-300 mb-1">
                  Scheduled Publication Date & Time
                </label>
                <input
                  type="datetime-local"
                  value={
                    article.scheduledFor
                      ? article.scheduledFor.slice(0, 16)
                      : ""
                  }
                  onChange={(e) =>
                    setArticle((prev) => ({
                      ...prev,
                      scheduledFor: e.target.value
                        ? new Date(e.target.value).toISOString()
                        : "",
                    }))
                  }
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white"
                />
              </div>
            )}

            <div>
              <label className="block text-xs text-slate-300 mb-1">
                Original Publication Date
              </label>
              <input
                type="date"
                value={
                  article.publishedAt ? article.publishedAt.slice(0, 10) : ""
                }
                onChange={(e) =>
                  setArticle((prev) => ({
                    ...prev,
                    publishedAt: e.target.value
                      ? new Date(e.target.value).toISOString()
                      : prev.publishedAt,
                  }))
                }
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white"
              />
            </div>

            <label className="flex items-center gap-2 text-xs text-slate-200 cursor-pointer pt-1">
              <input
                type="checkbox"
                checked={article.featured}
                onChange={(e) =>
                  setArticle((prev) => ({
                    ...prev,
                    featured: e.target.checked,
                  }))
                }
                className="rounded border-slate-600 text-blue-600"
              />
              <span>★ Pin as Featured Engineering Article on /blog</span>
            </label>
          </div>

          {/* Featured Image with Alt Text, Title & Caption */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 text-white space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Featured Image & SEO Alt
              </h3>
              <button
                type="button"
                onClick={() => {
                  setImageModalTarget("featured");
                  setShowImageModal(true);
                }}
                className="text-xs text-blue-400 hover:text-blue-300"
              >
                Choose from Media Library
              </button>
            </div>

            {article.featuredImage && (
              <div className="h-36 rounded-xl overflow-hidden bg-slate-950 border border-slate-800">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={article.featuredImage}
                  alt={article.featuredImageAlt || article.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            <div>
              <label className="block text-[11px] text-slate-400 mb-1">
                Featured Image URL
              </label>
              <input
                type="text"
                value={article.featuredImage}
                onChange={(e) =>
                  setArticle((prev) => ({
                    ...prev,
                    featuredImage: e.target.value,
                    seo: {
                      ...prev.seo,
                      ogImage: prev.seo.ogImage || e.target.value,
                    },
                  }))
                }
                placeholder="/images/products/high-chrome-steel-balls.webp"
                className="w-full px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white"
              />
            </div>

            <div>
              <label className="block text-[11px] text-slate-400 mb-1">
                Image Alt Text (Required for Image SEO)
              </label>
              <input
                type="text"
                value={article.featuredImageAlt}
                onChange={(e) =>
                  setArticle((prev) => ({
                    ...prev,
                    featuredImageAlt: e.target.value,
                  }))
                }
                placeholder="e.g. Precision ground AISI 52100 chrome steel balls"
                className="w-full px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white"
              />
            </div>

            <div>
              <label className="block text-[11px] text-slate-400 mb-1">
                Image Caption (Optional)
              </label>
              <input
                type="text"
                value={article.featuredImageCaption}
                onChange={(e) =>
                  setArticle((prev) => ({
                    ...prev,
                    featuredImageCaption: e.target.value,
                  }))
                }
                placeholder="Displayed below featured image..."
                className="w-full px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white"
              />
            </div>
          </div>

          {/* Categories, Tags & Author */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 text-white space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Category, Tags & Author
            </h3>

            <div>
              <label className="block text-xs text-slate-300 mb-1">
                Primary Category
              </label>
              <select
                value={article.category}
                onChange={(e) =>
                  setArticle((prev) => ({ ...prev, category: e.target.value }))
                }
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white"
              >
                {DEFAULT_CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs text-slate-300 mb-1">
                Tags (Comma separated)
              </label>
              <input
                type="text"
                value={(article.tags || []).join(", ")}
                onChange={(e) =>
                  setArticle((prev) => ({
                    ...prev,
                    tags: e.target.value
                      .split(",")
                      .map((t) => t.trim())
                      .filter(Boolean),
                  }))
                }
                placeholder="AISI 52100, Chrome Steel Balls, ISO 3290"
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white"
              />
            </div>

            <div>
              <label className="block text-xs text-slate-300 mb-1">
                Author Name (E-E-A-T Signal)
              </label>
              <input
                type="text"
                value={article.authorName}
                onChange={(e) =>
                  setArticle((prev) => ({
                    ...prev,
                    authorName: e.target.value,
                  }))
                }
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white"
              />
            </div>

            <div>
              <label className="block text-xs text-slate-300 mb-1">
                Author Credentials / Role
              </label>
              <input
                type="text"
                value={article.authorRole}
                onChange={(e) =>
                  setArticle((prev) => ({
                    ...prev,
                    authorRole: e.target.value,
                  }))
                }
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white"
              />
            </div>
          </div>

          {/* Related Articles Selector */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 text-white space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Related Articles (Internal Cluster)
            </h3>
            <div className="space-y-1.5 max-h-48 overflow-y-auto">
              {allArticles
                .filter((a) => a.slug !== article.slug)
                .map((a) => {
                  const checked = (article.relatedSlugs || []).includes(a.slug);
                  return (
                    <label
                      key={a.slug}
                      className="flex items-start gap-2 text-xs text-slate-300 cursor-pointer p-1.5 rounded hover:bg-slate-800"
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={(e) => {
                          const next = e.target.checked
                            ? [...(article.relatedSlugs || []), a.slug]
                            : (article.relatedSlugs || []).filter(
                                (s) => s !== a.slug
                              );
                          setArticle((prev) => ({
                            ...prev,
                            relatedSlugs: next,
                          }));
                        }}
                        className="mt-0.5 rounded border-slate-600 text-blue-600"
                      />
                      <span className="line-clamp-2">{a.title}</span>
                    </label>
                  );
                })}
            </div>
          </div>
        </div>
      </div>

      {/* Inline / Featured Image Modal */}
      {showImageModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-2xl w-full p-6 text-white space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold">
                {imageModalTarget === "featured"
                  ? "Select Featured Image"
                  : "Insert Inline Image with SEO Alt Text & Caption"}
              </h3>
              <button
                type="button"
                onClick={() => setShowImageModal(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            {mediaItems.length > 0 && (
              <div>
                <div className="text-xs text-slate-400 mb-2">
                  Click a media library image or paste a URL below:
                </div>
                <div className="grid grid-cols-4 sm:grid-cols-5 gap-2 max-h-40 overflow-y-auto p-2 bg-slate-950 rounded-xl border border-slate-800">
                  {mediaItems
                    .filter((m) => !m.url.endsWith(".mp4"))
                    .slice(0, 20)
                    .map((m) => (
                      <button
                        key={m.url}
                        type="button"
                        onClick={() => {
                          if (imageModalTarget === "featured") {
                            setArticle((prev) => ({
                              ...prev,
                              featuredImage: m.url,
                            }));
                            setShowImageModal(false);
                          } else {
                            setInlineImgUrl(m.url);
                          }
                        }}
                        className="h-16 rounded-lg overflow-hidden border border-slate-700 hover:border-blue-500"
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={m.url}
                          alt={m.name}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                </div>
              </div>
            )}

            {imageModalTarget === "inline" && (
              <div className="space-y-3">
                <div>
                  <label className="block text-xs text-slate-300 mb-1">
                    Image URL
                  </label>
                  <input
                    type="text"
                    value={inlineImgUrl}
                    onChange={(e) => setInlineImgUrl(e.target.value)}
                    placeholder="/images/products/high-chrome-steel-balls.webp"
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-slate-300 mb-1">
                      Alt Text (Descriptive for SEO & Accessibility)
                    </label>
                    <input
                      type="text"
                      value={inlineImgAlt}
                      onChange={(e) => setInlineImgAlt(e.target.value)}
                      placeholder="AISI 52100 chrome steel balls macro inspection"
                      className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-300 mb-1">
                      Image Title Attribute
                    </label>
                    <input
                      type="text"
                      value={inlineImgTitle}
                      onChange={(e) => setInlineImgTitle(e.target.value)}
                      placeholder="Chrome Steel Balls ISO 3290"
                      className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs text-slate-300 mb-1">
                    Figure Caption (Optional)
                  </label>
                  <input
                    type="text"
                    value={inlineImgCaption}
                    onChange={(e) => setInlineImgCaption(e.target.value)}
                    placeholder="Figure 1: Optical surface roughness inspection at DSP Jaipur lab."
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowImageModal(false)}
                    className="px-4 py-2 bg-slate-800 rounded-lg text-xs"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (!inlineImgUrl) return;
                      const html = inlineImgCaption
                        ? `<figure>\n  <img src="${inlineImgUrl}" alt="${inlineImgAlt}" title="${inlineImgTitle}" />\n  <figcaption>${inlineImgCaption}</figcaption>\n</figure>\n`
                        : `<img src="${inlineImgUrl}" alt="${inlineImgAlt}" title="${inlineImgTitle}" />\n`;
                      insertAtCursor(html);
                      setShowImageModal(false);
                      setInlineImgUrl("");
                      setInlineImgAlt("");
                      setInlineImgTitle("");
                      setInlineImgCaption("");
                    }}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold"
                  >
                    Insert Image into Article
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Revisions History Modal */}
      {showRevisionsModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-xl w-full p-6 text-white space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold">
                Article Revision History ({article.revisions?.length || 0})
              </h3>
              <button
                type="button"
                onClick={() => setShowRevisionsModal(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>
            <div className="divide-y divide-slate-800 max-h-80 overflow-y-auto">
              {(article.revisions || []).map((rev) => (
                <div
                  key={rev.id}
                  className="py-3 flex items-center justify-between gap-3"
                >
                  <div>
                    <div className="text-xs font-semibold text-white">
                      {rev.title}
                    </div>
                    <div className="text-[11px] text-slate-400">
                      Saved {new Date(rev.savedAt).toLocaleString()} ·{" "}
                      {rev.note}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setArticle((prev) => ({
                        ...prev,
                        title: rev.title,
                        bodyHtml: rev.bodyHtml,
                      }));
                      setShowRevisionsModal(false);
                    }}
                    className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-medium"
                  >
                    Restore
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
