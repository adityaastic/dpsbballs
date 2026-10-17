"use client";

import React, { useMemo, useRef, useState } from "react";
import {
  analyzeSeoContent,
  SeoMetadataPayload,
  SeoCheckResult,
} from "@/lib/seoAnalyzer";

export type InternalLinkCandidate = {
  title: string;
  urlPath: string;
  entityType: "page" | "product" | "blog";
  focusKeyword?: string;
};

type SeoEditorPanelProps = {
  title: string;
  bodyHtml: string;
  urlPath: string;
  seo: SeoMetadataPayload;
  onChange: (nextSeo: SeoMetadataPayload) => void;
  onSlugChange?: (newSlug: string) => void;
  onInsertInternalLink?: (htmlAnchor: string) => void;
  linkCandidates?: InternalLinkCandidate[];
  siteUrl?: string;
};

export default function SeoEditorPanel({
  title,
  bodyHtml,
  urlPath,
  seo,
  onChange,
  onSlugChange,
  onInsertInternalLink,
  linkCandidates = [],
  siteUrl = "https://www.dspballs.co.in",
}: SeoEditorPanelProps) {
  const [activeTab, setActiveTab] = useState<
    "general" | "analysis" | "social" | "advanced" | "links"
  >("general");
  const [serpDevice, setSerpDevice] = useState<"desktop" | "mobile">("desktop");
  const [linkSearch, setLinkSearch] = useState("");
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);

  const focusKeywordRef = useRef<HTMLInputElement>(null);
  const seoTitleRef = useRef<HTMLInputElement>(null);
  const metaDescRef = useRef<HTMLTextAreaElement>(null);
  const slugRef = useRef<HTMLInputElement>(null);
  const canonicalRef = useRef<HTMLInputElement>(null);

  const analysis = useMemo(
    () =>
      analyzeSeoContent({
        title,
        bodyHtml,
        urlPath,
        seo,
      }),
    [title, bodyHtml, urlPath, seo]
  );

  const updateField = <K extends keyof SeoMetadataPayload>(
    key: K,
    value: SeoMetadataPayload[K]
  ) => {
    onChange({
      ...seo,
      [key]: value,
    });
  };

  const handleFixJump = (fieldTarget?: SeoCheckResult["fieldTarget"]) => {
    if (!fieldTarget) return;
    if (
      fieldTarget === "focusKeyword" ||
      fieldTarget === "seoTitle" ||
      fieldTarget === "metaDescription" ||
      fieldTarget === "slug"
    ) {
      setActiveTab("general");
      setTimeout(() => {
        if (fieldTarget === "focusKeyword") focusKeywordRef.current?.focus();
        if (fieldTarget === "seoTitle") seoTitleRef.current?.focus();
        if (fieldTarget === "metaDescription") metaDescRef.current?.focus();
        if (fieldTarget === "slug") slugRef.current?.focus();
      }, 60);
    } else if (fieldTarget === "canonicalUrl" || fieldTarget === "robots" || fieldTarget === "schema") {
      setActiveTab("advanced");
      setTimeout(() => {
        if (fieldTarget === "canonicalUrl") canonicalRef.current?.focus();
      }, 60);
    }
  };

  const effectiveTitle =
    (seo.seoTitle || title || "Untitled Page").trim() +
    ((seo.seoTitle || title || "").toLowerCase().includes("dsp")
      ? ""
      : " | Durga Steel & Precision Ball");
  const effectiveDescription =
    (seo.metaDescription || "").trim() ||
    "Add a compelling meta description summarizing technical tolerances, materials, and manufacturing capabilities for search results.";
  const fullUrl = `${siteUrl}${urlPath.startsWith("/") ? urlPath : `/${urlPath}`}`;

  const titleLen = (seo.seoTitle || title || "").trim().length;
  const descLen = (seo.metaDescription || "").trim().length;

  const scoreColor =
    analysis.grade === "good"
      ? "text-emerald-400 border-emerald-500/40 bg-emerald-500/10"
      : analysis.grade === "ok"
      ? "text-amber-400 border-amber-500/40 bg-amber-500/10"
      : "text-red-400 border-red-500/40 bg-red-500/10";

  // Smart internal link recommendations based on focus keyword / title overlap
  const filteredLinkCandidates = useMemo(() => {
    const q = linkSearch.trim().toLowerCase();
    const fk = (seo.focusKeyword || "").trim().toLowerCase();
    return linkCandidates
      .filter((c) => c.urlPath !== urlPath)
      .filter((c) => {
        if (!q) return true;
        return (
          c.title.toLowerCase().includes(q) ||
          c.urlPath.toLowerCase().includes(q) ||
          (c.focusKeyword || "").toLowerCase().includes(q)
        );
      })
      .map((c) => {
        let relevance = 0;
        const cTitle = c.title.toLowerCase();
        if (fk && cTitle.includes(fk)) relevance += 3;
        if (fk && (c.focusKeyword || "").toLowerCase().includes(fk))
          relevance += 2;
        const titleWords = title
          .toLowerCase()
          .split(/\s+/)
          .filter((w) => w.length > 3);
        for (const w of titleWords) {
          if (cTitle.includes(w)) relevance += 1;
        }
        return { ...c, relevance };
      })
      .sort((a, b) => b.relevance - a.relevance);
  }, [linkCandidates, linkSearch, seo.focusKeyword, title, urlPath]);

  const categories: {
    id: SeoCheckResult["category"];
    label: string;
  }[] = [
    { id: "basic", label: "Basic SEO" },
    { id: "additional", label: "Additional SEO" },
    { id: "title-readability", label: "Title Readability" },
    { id: "content-readability", label: "Content Readability" },
    { id: "technical", label: "Technical & Schema" },
  ];

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg">
      {/* Header Bar */}
      <div className="px-5 py-4 bg-slate-950/70 border-b border-slate-800 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div
            className={`w-12 h-12 rounded-xl border-2 flex flex-col items-center justify-center font-bold ${scoreColor}`}
          >
            <span className="text-lg leading-none">{analysis.score}</span>
            <span className="text-[9px] uppercase tracking-wider opacity-80">
              / 100
            </span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-white">
                Rank Math / Yoast SEO Suite
              </h3>
              <span
                className={`text-[11px] px-2 py-0.5 rounded-full border font-medium ${scoreColor}`}
              >
                {analysis.grade === "good"
                  ? "Optimized"
                  : analysis.grade === "ok"
                  ? "Needs Tuning"
                  : "Needs Attention"}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              {analysis.passCount} Passed · {analysis.warnCount} Warnings ·{" "}
              {analysis.failCount} Errors · {analysis.wordCount} Words (
              {analysis.readingTimeMinutes} min read)
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex flex-wrap items-center gap-1 bg-slate-900 p-1 rounded-lg border border-slate-800">
          {[
            { id: "general", label: "General & Snippet" },
            {
              id: "analysis",
              label: `Checks (${analysis.passCount}/${analysis.checks.length})`,
            },
            { id: "links", label: `Internal Links (${analysis.internalLinksCount})` },
            { id: "social", label: "Social / OG" },
            { id: "advanced", label: "Schema & Technical" },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                activeTab === tab.id
                  ? "bg-blue-600 text-white"
                  : "text-slate-400 hover:text-white hover:bg-slate-800"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="p-5 space-y-6">
        {activeTab === "general" && (
          <div className="space-y-6">
            {/* Focus & Secondary Keywords */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                  Focus Keyword (Primary Target)
                </label>
                <input
                  ref={focusKeywordRef}
                  type="text"
                  value={seo.focusKeyword || ""}
                  onChange={(e) => updateField("focusKeyword", e.target.value)}
                  placeholder="e.g. AISI 52100 chrome steel balls"
                  className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-[11px] text-slate-500 mt-1">
                  Keyword density: {analysis.keywordDensity}% (Recommended:
                  0.5%–2.5%)
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                  Secondary Keywords (Comma separated)
                </label>
                <input
                  type="text"
                  value={(seo.secondaryKeywords || []).join(", ")}
                  onChange={(e) =>
                    updateField(
                      "secondaryKeywords",
                      e.target.value
                        .split(",")
                        .map((k) => k.trim())
                        .filter(Boolean)
                    )
                  }
                  placeholder="e.g. G10 precision balls, bearing steel balls India, ISO 3290"
                  className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-[11px] text-slate-500 mt-1">
                  Used to check semantic coverage and secondary phrase placement.
                </p>
              </div>
            </div>

            {/* Live Google SERP Preview */}
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Live Google SERP Snippet Preview
                </span>
                <div className="flex items-center gap-1 bg-slate-900 p-0.5 rounded-lg border border-slate-800">
                  <button
                    type="button"
                    onClick={() => setSerpDevice("desktop")}
                    className={`px-2.5 py-1 rounded text-xs font-medium ${
                      serpDevice === "desktop"
                        ? "bg-slate-800 text-white"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    Desktop
                  </button>
                  <button
                    type="button"
                    onClick={() => setSerpDevice("mobile")}
                    className={`px-2.5 py-1 rounded text-xs font-medium ${
                      serpDevice === "mobile"
                        ? "bg-slate-800 text-white"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    Mobile
                  </button>
                </div>
              </div>

              <div
                className={`bg-white rounded-lg p-4 text-slate-900 shadow-inner ${
                  serpDevice === "mobile" ? "max-w-sm" : "max-w-2xl"
                }`}
              >
                <div className="flex items-center gap-2 text-xs text-slate-600 mb-1">
                  <div className="w-6 h-6 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-[10px] text-blue-900">
                    DSP
                  </div>
                  <div className="truncate">
                    <div className="font-medium text-slate-800 leading-tight">
                      Durga Steel & Precision Ball
                    </div>
                    <div className="text-[11px] text-slate-500 truncate">
                      {fullUrl}
                    </div>
                  </div>
                </div>
                <div className="text-[#1a0dab] text-base sm:text-lg font-medium leading-snug hover:underline cursor-pointer line-clamp-1">
                  {effectiveTitle}
                </div>
                <div className="text-xs sm:text-sm text-[#4d5156] mt-1 leading-relaxed line-clamp-2">
                  {effectiveDescription}
                </div>
              </div>
            </div>

            {/* SEO Title, Slug & Meta Description */}
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                    SEO Title
                  </label>
                  <span
                    className={`text-xs font-mono ${
                      titleLen >= 30 && titleLen <= 60
                        ? "text-emerald-400"
                        : titleLen > 0 && titleLen <= 68
                        ? "text-amber-400"
                        : "text-red-400"
                    }`}
                  >
                    {titleLen} / 60 chars
                  </span>
                </div>
                <input
                  ref={seoTitleRef}
                  type="text"
                  value={seo.seoTitle || ""}
                  onChange={(e) => updateField("seoTitle", e.target.value)}
                  placeholder={title || "Enter custom SEO title..."}
                  className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden mt-1.5">
                  <div
                    className={`h-full transition-all ${
                      titleLen >= 30 && titleLen <= 60
                        ? "bg-emerald-500"
                        : titleLen > 0 && titleLen <= 68
                        ? "bg-amber-500"
                        : "bg-red-500"
                    }`}
                    style={{ width: `${Math.min(100, (titleLen / 65) * 100)}%` }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
                    URL Slug
                  </label>
                  <input
                    ref={slugRef}
                    type="text"
                    value={seo.slug || ""}
                    onChange={(e) => {
                      const clean = e.target.value
                        .toLowerCase()
                        .replace(/[^a-z0-9-/]+/g, "-")
                        .replace(/^-+|-+$/g, "");
                      updateField("slug", clean);
                      if (onSlugChange) onSlugChange(clean);
                    }}
                    placeholder="custom-url-slug"
                    className="w-full px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
                    Breadcrumb Title
                  </label>
                  <input
                    type="text"
                    value={seo.breadcrumbTitle || ""}
                    onChange={(e) =>
                      updateField("breadcrumbTitle", e.target.value)
                    }
                    placeholder={title || "Short breadcrumb label"}
                    className="w-full px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                    Meta Description
                  </label>
                  <span
                    className={`text-xs font-mono ${
                      descLen >= 110 && descLen <= 160
                        ? "text-emerald-400"
                        : descLen >= 70 && descLen <= 175
                        ? "text-amber-400"
                        : "text-red-400"
                    }`}
                  >
                    {descLen} / 160 chars
                  </span>
                </div>
                <textarea
                  ref={metaDescRef}
                  rows={3}
                  value={seo.metaDescription || ""}
                  onChange={(e) =>
                    updateField("metaDescription", e.target.value)
                  }
                  placeholder="Write a clear, high-CTR summary highlighting grades, tolerances, materials, and B2B supply..."
                  className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden mt-1.5">
                  <div
                    className={`h-full transition-all ${
                      descLen >= 110 && descLen <= 160
                        ? "bg-emerald-500"
                        : descLen >= 70 && descLen <= 175
                        ? "bg-amber-500"
                        : "bg-red-500"
                    }`}
                    style={{ width: `${Math.min(100, (descLen / 170) * 100)}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "analysis" && (
          <div className="space-y-5">
            <div className="p-3.5 bg-slate-950/90 border border-slate-800 rounded-lg text-xs text-slate-400 flex items-center justify-between gap-4">
              <span>
                Real-time On-Page SEO Analyzer evaluates keyword placement,
                heading hierarchy, readability, links, image alt attributes, and
                technical directives. Note: This score guides content quality and
                does not guarantee specific Google rankings.
              </span>
            </div>

            {categories.map((cat) => {
              const items = analysis.checks.filter(
                (c) => c.category === cat.id
              );
              if (!items.length) return null;
              return (
                <div
                  key={cat.id}
                  className="bg-slate-950/60 border border-slate-800 rounded-xl overflow-hidden"
                >
                  <div className="px-4 py-2.5 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                      {cat.label}
                    </h4>
                    <span className="text-[11px] text-slate-400">
                      {items.filter((i) => i.status === "pass").length} /{" "}
                      {items.length} Passed
                    </span>
                  </div>
                  <div className="divide-y divide-slate-800/70">
                    {items.map((check) => (
                      <div
                        key={check.id}
                        className="p-3.5 flex items-start justify-between gap-3 hover:bg-slate-900/40 transition-colors"
                      >
                        <div className="flex items-start gap-3">
                          <span
                            className={`mt-0.5 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                              check.status === "pass"
                                ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
                                : check.status === "warn"
                                ? "bg-amber-500/20 text-amber-400 border border-amber-500/40"
                                : "bg-red-500/20 text-red-400 border border-red-500/40"
                            }`}
                          >
                            {check.status === "pass"
                              ? "✓"
                              : check.status === "warn"
                              ? "!"
                              : "✕"}
                          </span>
                          <div>
                            <div className="text-sm font-medium text-white">
                              {check.label}
                            </div>
                            <p className="text-xs text-slate-400 mt-0.5">
                              {check.message}
                            </p>
                            {check.status !== "pass" && (
                              <p className="text-[11px] text-blue-300/90 mt-1">
                                Fix: {check.recommendation}
                              </p>
                            )}
                          </div>
                        </div>

                        {check.status !== "pass" && check.fieldTarget && (
                          <button
                            type="button"
                            onClick={() => handleFixJump(check.fieldTarget)}
                            className="px-2.5 py-1 bg-slate-800 hover:bg-blue-600 text-slate-200 hover:text-white rounded text-xs font-medium shrink-0 transition-colors"
                          >
                            Fix Field
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {activeTab === "links" && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h4 className="text-sm font-semibold text-white">
                  Smart Internal Link Suggestions
                </h4>
                <p className="text-xs text-slate-400">
                  Link to existing published products, pages, and engineering
                  articles to strengthen topical authority and prevent orphan
                  pages.
                </p>
              </div>
              <input
                type="text"
                value={linkSearch}
                onChange={(e) => setLinkSearch(e.target.value)}
                placeholder="Search pages, products, or articles..."
                className="px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white w-64 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="max-h-72 overflow-y-auto divide-y divide-slate-800 border border-slate-800 rounded-xl bg-slate-950/60">
              {filteredLinkCandidates.slice(0, 20).map((cand) => {
                const anchorHtml = `<a href="${cand.urlPath}">${cand.title}</a>`;
                return (
                  <div
                    key={cand.urlPath}
                    className="p-3 flex items-center justify-between gap-3 hover:bg-slate-900/60"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] uppercase px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-semibold">
                          {cand.entityType}
                        </span>
                        <span className="text-sm font-medium text-white truncate">
                          {cand.title}
                        </span>
                        {cand.relevance > 0 && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                            Relevant Match
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-slate-500 font-mono mt-0.5">
                        {cand.urlPath}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {onInsertInternalLink && (
                        <button
                          type="button"
                          onClick={() => onInsertInternalLink(anchorHtml)}
                          className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-medium"
                        >
                          + Insert Link
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText(anchorHtml);
                          setCopiedUrl(cand.urlPath);
                          setTimeout(() => setCopiedUrl(null), 2000);
                        }}
                        className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-xs font-medium"
                      >
                        {copiedUrl === cand.urlPath ? "Copied!" : "Copy HTML"}
                      </button>
                    </div>
                  </div>
                );
              })}
              {filteredLinkCandidates.length === 0 && (
                <div className="p-6 text-center text-xs text-slate-500">
                  No matching internal pages found.
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === "social" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
                  Open Graph / Social Title
                </label>
                <input
                  type="text"
                  value={seo.ogTitle || ""}
                  onChange={(e) => updateField("ogTitle", e.target.value)}
                  placeholder={seo.seoTitle || title || "Social share title"}
                  className="w-full px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
                  Open Graph / Social Description
                </label>
                <textarea
                  rows={3}
                  value={seo.ogDescription || ""}
                  onChange={(e) =>
                    updateField("ogDescription", e.target.value)
                  }
                  placeholder={
                    seo.metaDescription || "Social share summary..."
                  }
                  className="w-full px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
                  Open Graph Image URL (1200×630 recommended)
                </label>
                <input
                  type="text"
                  value={seo.ogImage || ""}
                  onChange={(e) => updateField("ogImage", e.target.value)}
                  placeholder="/images/infrastructure/building-front-view.jpg"
                  className="w-full px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm"
                />
              </div>
            </div>

            {/* Social Card Preview */}
            <div>
              <span className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                LinkedIn / Facebook / X Card Preview
              </span>
              <div className="border border-slate-700 rounded-xl overflow-hidden bg-slate-950 max-w-md">
                <div className="h-44 bg-slate-800 relative flex items-center justify-center overflow-hidden">
                  {seo.ogImage ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={seo.ogImage}
                      alt="Social preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-xs text-slate-500">
                      Default Brand OG Image (/images/infrastructure/building-front-view.jpg)
                    </span>
                  )}
                </div>
                <div className="p-3.5 bg-slate-900 border-t border-slate-800">
                  <div className="text-[11px] uppercase tracking-wider text-slate-400">
                    dspballs.co.in
                  </div>
                  <div className="text-sm font-semibold text-white mt-0.5 line-clamp-1">
                    {seo.ogTitle || effectiveTitle}
                  </div>
                  <div className="text-xs text-slate-400 mt-1 line-clamp-2">
                    {seo.ogDescription || effectiveDescription}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "advanced" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
                  Canonical URL
                </label>
                <input
                  ref={canonicalRef}
                  type="text"
                  value={seo.canonicalUrl || ""}
                  onChange={(e) => updateField("canonicalUrl", e.target.value)}
                  placeholder={fullUrl}
                  className="w-full px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm font-mono"
                />
                <p className="text-[11px] text-slate-500 mt-1">
                  Leave default ({fullUrl}) unless syndicating content.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
                  JSON-LD Schema Type
                </label>
                <select
                  value={seo.schemaType || "TechArticle"}
                  onChange={(e) =>
                    updateField("schemaType", e.target.value as any)
                  }
                  className="w-full px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm"
                >
                  <option value="TechArticle">
                    TechArticle (Engineering & Technical Guide)
                  </option>
                  <option value="BlogPosting">BlogPosting (Standard Blog)</option>
                  <option value="Article">Article (Editorial / News)</option>
                  <option value="Product">
                    Product (Industrial Precision Ball Product)
                  </option>
                  <option value="WebPage">WebPage (Corporate / Static Page)</option>
                  <option value="FAQPage">FAQPage (FAQ Resource)</option>
                </select>
              </div>
            </div>

            {/* Robots Directives */}
            <div className="p-4 bg-slate-950/70 border border-slate-800 rounded-xl flex flex-wrap items-center gap-6">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                Robots Meta Directives:
              </span>
              <label className="flex items-center gap-2 text-sm text-slate-200 cursor-pointer">
                <input
                  type="checkbox"
                  checked={seo.robotsIndex !== false}
                  onChange={(e) => updateField("robotsIndex", e.target.checked)}
                  className="rounded border-slate-600 text-blue-600 focus:ring-blue-500"
                />
                <span>Index (Allow Google to index this page)</span>
              </label>

              <label className="flex items-center gap-2 text-sm text-slate-200 cursor-pointer">
                <input
                  type="checkbox"
                  checked={seo.robotsFollow !== false}
                  onChange={(e) =>
                    updateField("robotsFollow", e.target.checked)
                  }
                  className="rounded border-slate-600 text-blue-600 focus:ring-blue-500"
                />
                <span>Follow (Follow outgoing links)</span>
              </label>
            </div>

            {/* FAQ Schema Builder */}
            <div className="border border-slate-800 rounded-xl p-4 bg-slate-950/50 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                    FAQPage Structured Data (JSON-LD)
                  </h4>
                  <p className="text-xs text-slate-400">
                    Questions added here automatically output valid Schema.org
                    FAQPage JSON-LD on this URL.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    updateField("faqItems", [
                      ...(seo.faqItems || []),
                      { question: "", answer: "" },
                    ])
                  }
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-medium"
                >
                  + Add FAQ Item
                </button>
              </div>

              {(seo.faqItems || []).map((faq, idx) => (
                <div
                  key={idx}
                  className="p-3 bg-slate-900 border border-slate-800 rounded-lg space-y-2"
                >
                  <div className="flex items-center justify-between gap-2">
                    <input
                      type="text"
                      value={faq.question}
                      onChange={(e) => {
                        const next = [...(seo.faqItems || [])];
                        next[idx] = { ...next[idx], question: e.target.value };
                        updateField("faqItems", next);
                      }}
                      placeholder="Question (e.g. What is the hardness of AISI 52100 chrome steel balls?)"
                      className="flex-1 px-3 py-1.5 bg-slate-800 border border-slate-700 rounded text-xs text-white"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const next = (seo.faqItems || []).filter(
                          (_, i) => i !== idx
                        );
                        updateField("faqItems", next);
                      }}
                      className="text-xs text-red-400 hover:text-red-300 px-2 py-1"
                    >
                      Remove
                    </button>
                  </div>
                  <textarea
                    rows={2}
                    value={faq.answer}
                    onChange={(e) => {
                      const next = [...(seo.faqItems || [])];
                      next[idx] = { ...next[idx], answer: e.target.value };
                      updateField("faqItems", next);
                    }}
                    placeholder="Answer..."
                    className="w-full px-3 py-1.5 bg-slate-800 border border-slate-700 rounded text-xs text-white"
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
