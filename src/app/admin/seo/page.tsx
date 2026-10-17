"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { AuditedSeoItem } from "@/lib/seoCms";

type OverviewData = {
  items: AuditedSeoItem[];
  summary: {
    totalUrls: number;
    indexedCount: number;
    noindexCount: number;
    missingTitlesCount: number;
    missingDescriptionsCount: number;
    duplicateTitlesCount: number;
    duplicateDescriptionsCount: number;
    missingAltImagesTotal: number;
    orphanPagesCount: number;
    canonicalIssuesCount: number;
    avgScore: number;
    goodCount: number;
    okCount: number;
    poorCount: number;
  };
  blogCounts: {
    total: number;
    published: number;
    draft: number;
    scheduled: number;
  };
  recentArticles: {
    id: string;
    slug: string;
    title: string;
    status: string;
    category: string;
    updatedAt: string;
    readingTimeMinutes: number;
    wordCount: number;
    focusKeyword: string;
  }[];
  technical: any;
};

export default function SeoDashboardPage() {
  const [data, setData] = useState<OverviewData | null>(null);
  const [gsc, setGsc] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<
    | "all"
    | "missing-meta"
    | "duplicates"
    | "missing-alt"
    | "orphans"
    | "noindex"
    | "poor"
  >("all");
  const [search, setSearch] = useState("");

  const loadData = async () => {
    setLoading(true);
    try {
      const [ovRes, gscRes] = await Promise.all([
        fetch("/api/admin/seo/overview"),
        fetch("/api/admin/seo/gsc?days=28"),
      ]);
      if (ovRes.ok) {
        setData(await ovRes.json());
      }
      if (gscRes.ok) {
        setGsc(await gscRes.json());
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredItems = useMemo(() => {
    if (!data?.items) return [];
    const q = search.trim().toLowerCase();
    return data.items.filter((item) => {
      if (q) {
        const match =
          item.title.toLowerCase().includes(q) ||
          item.urlPath.toLowerCase().includes(q) ||
          (item.seo.focusKeyword || "").toLowerCase().includes(q) ||
          (item.seo.seoTitle || "").toLowerCase().includes(q);
        if (!match) return false;
      }
      if (filter === "missing-meta") {
        return (
          item.issues.includes("Missing SEO Title") ||
          item.issues.includes("Missing Meta Description")
        );
      }
      if (filter === "duplicates") {
        return (
          item.issues.includes("Duplicate SEO Title") ||
          item.issues.includes("Duplicate Meta Description")
        );
      }
      if (filter === "missing-alt") {
        return item.imagesMissingAltCount > 0;
      }
      if (filter === "orphans") {
        return item.isOrphan;
      }
      if (filter === "noindex") {
        return !item.seo.robotsIndex;
      }
      if (filter === "poor") {
        return item.grade === "poor";
      }
      return true;
    });
  }, [data, filter, search]);

  const pendingTasks = useMemo(() => {
    if (!data?.items) return [];
    return [...data.items]
      .filter((i) => i.issues.length > 0 || i.score < 75)
      .sort((a, b) => a.score - b.score)
      .slice(0, 6);
  }, [data]);

  if (loading || !data) {
    return (
      <div className="p-8 text-slate-400 flex items-center gap-3">
        <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
        <span>Auditing all pages, products, blog articles, and internal links...</span>
      </div>
    );
  }

  const { summary, blogCounts, recentArticles, technical } = data;

  const getEditHref = (item: AuditedSeoItem) => {
    if (item.entityType === "blog") return `/admin/blog/${item.entityId}`;
    if (item.entityType === "product") return `/admin/products/${item.entityId}`;
    return `/admin/pages/${item.entityId}`;
  };

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-blue-950 border border-slate-800 rounded-2xl p-6 text-white shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-blue-500/15 border border-blue-500/30 text-blue-300 text-xs font-semibold mb-2">
              <span>🚀 Rank Math & Yoast Enterprise SEO Suite</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
              SEO Command Center & Site Health Audit
            </h1>
            <p className="text-slate-400 text-sm mt-1 max-w-2xl">
              Live audit across {summary.totalUrls} indexable & content URLs (Pages,
              Industrial Products, and Technical Blog Articles). All changes
              sync directly with Next.js Metadata, XML Sitemaps, Robots.txt, and
              JSON-LD Schema.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <Link
              href="/admin/blog/new"
              className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-lg shadow-blue-600/25 transition"
            >
              + Write SEO Blog Article
            </Link>
            <Link
              href="/admin/seo/bulk"
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold border border-slate-700 transition"
            >
              ⚡ Bulk Metadata Editor
            </Link>
            <Link
              href="/admin/seo/technical"
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold border border-slate-700 transition"
            >
              🛠️ Redirects & Sitemaps ({technical?.redirects?.length || 0})
            </Link>
          </div>
        </div>

        {/* Top KPI Row */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mt-6">
          <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-4">
            <div className="text-[11px] uppercase tracking-wider text-slate-400">
              Average SEO Score
            </div>
            <div className="flex items-baseline gap-2 mt-1">
              <span
                className={`text-2xl font-bold ${
                  summary.avgScore >= 75
                    ? "text-emerald-400"
                    : summary.avgScore >= 50
                    ? "text-amber-400"
                    : "text-red-400"
                }`}
              >
                {summary.avgScore}
              </span>
              <span className="text-xs text-slate-500">/ 100</span>
            </div>
            <div className="text-[11px] text-slate-400 mt-1">
              {summary.goodCount} Good · {summary.okCount} OK · {summary.poorCount} Poor
            </div>
          </div>

          <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-4">
            <div className="text-[11px] uppercase tracking-wider text-slate-400">
              Blog Articles
            </div>
            <div className="text-2xl font-bold text-white mt-1">
              {blogCounts.published}{" "}
              <span className="text-xs font-normal text-slate-400">
                Published
              </span>
            </div>
            <div className="text-[11px] text-slate-400 mt-1">
              {blogCounts.draft} Drafts · {blogCounts.scheduled} Scheduled
            </div>
          </div>

          <div
            onClick={() => setFilter("missing-meta")}
            className="bg-slate-950/70 border border-slate-800/80 hover:border-amber-500/50 rounded-xl p-4 cursor-pointer transition"
          >
            <div className="text-[11px] uppercase tracking-wider text-slate-400">
              Missing Meta
            </div>
            <div className="text-2xl font-bold text-amber-400 mt-1">
              {summary.missingTitlesCount + summary.missingDescriptionsCount}
            </div>
            <div className="text-[11px] text-slate-400 mt-1">
              {summary.missingTitlesCount} Titles ·{" "}
              {summary.missingDescriptionsCount} Desc
            </div>
          </div>

          <div
            onClick={() => setFilter("duplicates")}
            className="bg-slate-950/70 border border-slate-800/80 hover:border-amber-500/50 rounded-xl p-4 cursor-pointer transition"
          >
            <div className="text-[11px] uppercase tracking-wider text-slate-400">
              Duplicate Meta
            </div>
            <div className="text-2xl font-bold text-amber-400 mt-1">
              {summary.duplicateTitlesCount + summary.duplicateDescriptionsCount}
            </div>
            <div className="text-[11px] text-slate-400 mt-1">
              {summary.duplicateTitlesCount} Titles ·{" "}
              {summary.duplicateDescriptionsCount} Desc
            </div>
          </div>

          <div
            onClick={() => setFilter("missing-alt")}
            className="bg-slate-950/70 border border-slate-800/80 hover:border-amber-500/50 rounded-xl p-4 cursor-pointer transition"
          >
            <div className="text-[11px] uppercase tracking-wider text-slate-400">
              Missing Image Alt
            </div>
            <div className="text-2xl font-bold text-amber-400 mt-1">
              {summary.missingAltImagesTotal}
            </div>
            <div className="text-[11px] text-slate-400 mt-1">
              Images without alt text
            </div>
          </div>

          <div
            onClick={() => setFilter("orphans")}
            className="bg-slate-950/70 border border-slate-800/80 hover:border-blue-500/50 rounded-xl p-4 cursor-pointer transition"
          >
            <div className="text-[11px] uppercase tracking-wider text-slate-400">
              Orphan / Noindex
            </div>
            <div className="text-2xl font-bold text-blue-400 mt-1">
              {summary.orphanPagesCount} / {summary.noindexCount}
            </div>
            <div className="text-[11px] text-slate-400 mt-1">
              {summary.orphanPagesCount} Orphans · {summary.noindexCount} Noindex
            </div>
          </div>
        </div>
      </div>

      {/* Middle Row: Pending SEO Tasks + Google Search Console Status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pending SEO Tasks */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold">
                Priority SEO Optimization Queue
              </h2>
              <p className="text-xs text-slate-400">
                Pages and articles needing immediate metadata, keyword, or
                internal link improvements.
              </p>
            </div>
            <Link
              href="/admin/seo/bulk"
              className="text-xs text-blue-400 hover:text-blue-300 font-medium"
            >
              Open Bulk Editor →
            </Link>
          </div>

          <div className="divide-y divide-slate-800">
            {pendingTasks.map((task) => (
              <div
                key={task.id}
                className="py-3 flex flex-wrap items-center justify-between gap-3"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                        task.grade === "good"
                          ? "bg-emerald-500/20 text-emerald-400"
                          : task.grade === "ok"
                          ? "bg-amber-500/20 text-amber-400"
                          : "bg-red-500/20 text-red-400"
                      }`}
                    >
                      {task.score}/100
                    </span>
                    <span className="text-[10px] uppercase px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 font-semibold">
                      {task.entityType}
                    </span>
                    <span className="text-sm font-medium text-white truncate">
                      {task.title}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                    <span className="text-xs font-mono text-slate-500 mr-2">
                      {task.urlPath}
                    </span>
                    {task.issues.slice(0, 3).map((iss) => (
                      <span
                        key={iss}
                        className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300"
                      >
                        {iss}
                      </span>
                    ))}
                  </div>
                </div>

                <Link
                  href={getEditHref(task)}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-blue-600 text-xs font-medium text-white rounded-lg transition shrink-0"
                >
                  Optimize →
                </Link>
              </div>
            ))}
          </div>
        </div>

        {/* Google Search Console & Recent Blog Posts */}
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 text-white">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-bold flex items-center gap-2">
                <span>🔍 Google Search Console</span>
              </h2>
              <span
                className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                  gsc?.connected
                    ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                    : "bg-slate-800 text-slate-400 border border-slate-700"
                }`}
              >
                {gsc?.connected ? "Connected (Live API)" : "Not Connected"}
              </span>
            </div>

            {gsc?.connected && gsc.totals ? (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-2.5">
                  <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                    <div className="text-[10px] text-slate-400 uppercase">
                      Total Clicks (28d)
                    </div>
                    <div className="text-lg font-bold text-white">
                      {gsc.totals.clicks}
                    </div>
                  </div>
                  <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                    <div className="text-[10px] text-slate-400 uppercase">
                      Impressions (28d)
                    </div>
                    <div className="text-lg font-bold text-white">
                      {gsc.totals.impressions}
                    </div>
                  </div>
                  <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                    <div className="text-[10px] text-slate-400 uppercase">
                      Avg CTR
                    </div>
                    <div className="text-lg font-bold text-emerald-400">
                      {gsc.totals.ctr}%
                    </div>
                  </div>
                  <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                    <div className="text-[10px] text-slate-400 uppercase">
                      Avg Position
                    </div>
                    <div className="text-lg font-bold text-blue-400">
                      #{gsc.totals.position}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-xs text-slate-400 leading-relaxed">
                  {gsc?.message ||
                    "Connect your Google Search Console OAuth token & verification tag to view real Google search clicks, impressions, CTR, and average keyword positions."}
                </p>
                <div className="flex flex-wrap gap-2">
                  <Link
                    href="/admin/seo/technical?tab=integrations"
                    className="inline-block px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-medium"
                  >
                    Configure Search Console →
                  </Link>
                  <a
                    href="/sitemap.xml"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-block px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium"
                  >
                    View Live Sitemap.xml ↗
                  </a>
                </div>
              </div>
            )}
          </div>

          {/* Recently Updated Blog Articles */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 text-white">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-bold">Recent Blog Articles</h2>
              <Link
                href="/admin/blog"
                className="text-xs text-blue-400 hover:text-blue-300"
              >
                Manage All →
              </Link>
            </div>
            <div className="space-y-2.5">
              {recentArticles.map((art) => (
                <Link
                  key={art.slug}
                  href={`/admin/blog/${art.slug}`}
                  className="block p-3 rounded-xl bg-slate-950/60 hover:bg-slate-800/80 border border-slate-800 transition"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-semibold text-white line-clamp-1">
                      {art.title}
                    </span>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full uppercase font-semibold shrink-0 ${
                        art.status === "published"
                          ? "bg-emerald-500/20 text-emerald-400"
                          : art.status === "scheduled"
                          ? "bg-blue-500/20 text-blue-400"
                          : "bg-slate-700 text-slate-300"
                      }`}
                    >
                      {art.status}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400 mt-1 flex items-center justify-between">
                    <span>
                      {art.wordCount} words · {art.readingTimeMinutes} min read
                    </span>
                    <span className="font-mono text-slate-500">
                      KW: {art.focusKeyword || "Not set"}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Full Audited Inventory Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden text-white">
        <div className="p-5 border-b border-slate-800 flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-1.5">
            {[
              { id: "all", label: `All URLs (${summary.totalUrls})` },
              {
                id: "missing-meta",
                label: `Missing Meta (${
                  summary.missingTitlesCount + summary.missingDescriptionsCount
                })`,
              },
              {
                id: "duplicates",
                label: `Duplicates (${
                  summary.duplicateTitlesCount +
                  summary.duplicateDescriptionsCount
                })`,
              },
              {
                id: "missing-alt",
                label: `Missing Alt (${summary.missingAltImagesTotal})`,
              },
              {
                id: "orphans",
                label: `Orphan Pages (${summary.orphanPagesCount})`,
              },
              { id: "noindex", label: `Noindex (${summary.noindexCount})` },
              { id: "poor", label: `Needs Attention (${summary.poorCount})` },
            ].map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setFilter(t.id as any)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                  filter === t.id
                    ? "bg-blue-600 text-white"
                    : "bg-slate-800 text-slate-400 hover:text-white"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by title, URL, or focus keyword..."
            className="px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white w-64 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-950/70 text-[11px] uppercase tracking-wider text-slate-400 border-b border-slate-800">
                <th className="py-3 px-4">Score</th>
                <th className="py-3 px-4">Page / Article / Product</th>
                <th className="py-3 px-4">Focus Keyword</th>
                <th className="py-3 px-4">SEO Title & Meta Description</th>
                <th className="py-3 px-4">Links (In / Out)</th>
                <th className="py-3 px-4">Audit Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-sm">
              {filteredItems.map((item) => (
                <tr
                  key={item.id}
                  className="hover:bg-slate-800/40 transition-colors"
                >
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold border ${
                        item.grade === "good"
                          ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
                          : item.grade === "ok"
                          ? "bg-amber-500/15 text-amber-400 border-amber-500/30"
                          : "bg-red-500/15 text-red-400 border-red-500/30"
                      }`}
                    >
                      {item.score} / 100
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] uppercase px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-semibold">
                        {item.entityType}
                      </span>
                      <span className="font-medium text-white">
                        {item.title}
                      </span>
                    </div>
                    <div className="text-xs text-slate-400 font-mono mt-0.5">
                      {item.urlPath}
                    </div>
                  </td>
                  <td className="py-3.5 px-4">
                    {item.seo.focusKeyword ? (
                      <span className="text-xs px-2 py-1 rounded bg-blue-500/10 text-blue-300 border border-blue-500/20 font-medium">
                        {item.seo.focusKeyword}
                      </span>
                    ) : (
                      <span className="text-xs text-slate-500 italic">
                        Not set
                      </span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 max-w-xs">
                    <div className="text-xs text-slate-200 truncate font-medium">
                      {item.seo.seoTitle || item.title}
                    </div>
                    <div className="text-[11px] text-slate-400 truncate mt-0.5">
                      {item.seo.metaDescription || "Missing meta description"}
                    </div>
                  </td>
                  <td className="py-3.5 px-4 whitespace-nowrap text-xs">
                    <span className="text-emerald-400 font-semibold">
                      {item.incomingInternalLinks} In
                    </span>{" "}
                    ·{" "}
                    <span className="text-blue-400 font-semibold">
                      {item.internalLinksCount} Out
                    </span>
                    {item.isOrphan && (
                      <span className="ml-1.5 text-[10px] px-1.5 py-0.5 rounded bg-red-500/20 text-red-300">
                        Orphan
                      </span>
                    )}
                  </td>
                  <td className="py-3.5 px-4">
                    {item.issues.length === 0 ? (
                      <span className="text-xs text-emerald-400 font-medium">
                        ✓ All Checks Healthy
                      </span>
                    ) : (
                      <div className="flex flex-wrap gap-1">
                        {item.issues.slice(0, 2).map((iss) => (
                          <span
                            key={iss}
                            className="text-[10px] px-2 py-0.5 rounded bg-amber-500/15 text-amber-300 border border-amber-500/30"
                          >
                            {iss}
                          </span>
                        ))}
                        {item.issues.length > 2 && (
                          <span className="text-[10px] text-slate-400">
                            +{item.issues.length - 2} more
                          </span>
                        )}
                      </div>
                    )}
                  </td>
                  <td className="py-3.5 px-4 text-right whitespace-nowrap">
                    <div className="inline-flex items-center gap-2">
                      <Link
                        href={getEditHref(item)}
                        className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-medium transition"
                      >
                        Edit SEO
                      </Link>
                      <a
                        href={item.urlPath}
                        target="_blank"
                        rel="noreferrer"
                        className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-xs"
                      >
                        ↗
                      </a>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
