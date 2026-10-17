"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";

type BlogListItem = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  tags: string[];
  authorName: string;
  status: "draft" | "published" | "scheduled";
  publishedAt: string;
  updatedAt: string;
  featured: boolean;
  readingTimeMinutes: number;
  wordCount: number;
  seoScore: number;
  seoGrade: "good" | "ok" | "poor";
  passCount: number;
  warnCount: number;
  failCount: number;
  internalLinksCount: number;
  imagesMissingAltCount: number;
  seo: {
    focusKeyword: string;
    seoTitle: string;
    metaDescription: string;
  };
};

export default function AdminBlogListPage() {
  const [articles, setArticles] = useState<BlogListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<
    "all" | "published" | "draft" | "scheduled"
  >("all");
  const [search, setSearch] = useState("");
  const [busySlug, setBusySlug] = useState<string | null>(null);

  const loadArticles = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/blog");
      if (res.ok) {
        setArticles(await res.json());
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadArticles();
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return articles.filter((a) => {
      if (statusFilter !== "all" && a.status !== statusFilter) return false;
      if (!q) return true;
      return (
        a.title.toLowerCase().includes(q) ||
        a.slug.toLowerCase().includes(q) ||
        a.category.toLowerCase().includes(q) ||
        (a.seo?.focusKeyword || "").toLowerCase().includes(q)
      );
    });
  }, [articles, statusFilter, search]);

  const handleToggleStatus = async (article: BlogListItem) => {
    const nextStatus = article.status === "published" ? "draft" : "published";
    setBusySlug(article.slug);
    try {
      const res = await fetch(`/api/admin/blog/${article.slug}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...article,
          status: nextStatus,
        }),
      });
      if (res.ok) {
        await loadArticles();
      }
    } finally {
      setBusySlug(null);
    }
  };

  const handleDelete = async (article: BlogListItem) => {
    if (
      !window.confirm(
        `Delete article "${article.title}"? If this URL is already indexed in Google, consider unpublishing to Draft or setting up a 301 redirect in Technical SEO.`
      )
    ) {
      return;
    }
    setBusySlug(article.slug);
    try {
      const res = await fetch(`/api/admin/blog/${article.slug}`, {
        method: "DELETE",
      });
      if (res.ok) {
        await loadArticles();
      }
    } finally {
      setBusySlug(null);
    }
  };

  const counts = useMemo(
    () => ({
      all: articles.length,
      published: articles.filter((a) => a.status === "published").length,
      draft: articles.filter((a) => a.status === "draft").length,
      scheduled: articles.filter((a) => a.status === "scheduled").length,
    }),
    [articles]
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-900 border border-slate-800 rounded-2xl p-6 text-white">
        <div>
          <h1 className="text-2xl font-bold">
            WordPress-Style Blog & Technical Articles Manager
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Create, schedule, optimize, and publish long-form technical articles
            with live Rank Math / Yoast SEO scoring and automatic Table of
            Contents.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <a
            href="/blog"
            target="_blank"
            rel="noreferrer"
            className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold border border-slate-700 transition"
          >
            View Public Blog ↗
          </a>
          <Link
            href="/admin/blog/new"
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-lg shadow-blue-600/25 transition"
          >
            + Create New Blog Article
          </Link>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden text-white">
        <div className="p-4 border-b border-slate-800 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-1.5">
            {[
              { id: "all", label: `All (${counts.all})` },
              { id: "published", label: `Published (${counts.published})` },
              { id: "draft", label: `Drafts (${counts.draft})` },
              { id: "scheduled", label: `Scheduled (${counts.scheduled})` },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setStatusFilter(tab.id as any)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                  statusFilter === tab.id
                    ? "bg-blue-600 text-white"
                    : "bg-slate-800 text-slate-400 hover:text-white"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search articles by title, slug, category, or keyword..."
            className="px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white w-72 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {loading ? (
          <div className="p-8 text-center text-slate-400 text-sm">
            Loading blog articles and calculating SEO scores...
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-950/70 text-[11px] uppercase tracking-wider text-slate-400 border-b border-slate-800">
                  <th className="py-3.5 px-4">Article Title & URL</th>
                  <th className="py-3.5 px-4">Category & Tags</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Focus Keyword</th>
                  <th className="py-3.5 px-4">SEO Score</th>
                  <th className="py-3.5 px-4">Metrics</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-sm">
                {filtered.map((art) => (
                  <tr
                    key={art.slug}
                    className="hover:bg-slate-800/40 transition-colors"
                  >
                    <td className="py-4 px-4 max-w-md">
                      <div className="flex items-center gap-2">
                        {art.featured && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30 font-semibold">
                            ★ Featured
                          </span>
                        )}
                        <Link
                          href={`/admin/blog/${art.slug}`}
                          className="font-semibold text-white hover:text-blue-400 transition line-clamp-1"
                        >
                          {art.title}
                        </Link>
                      </div>
                      <div className="text-xs text-slate-500 font-mono mt-0.5">
                        /blog/{art.slug}
                      </div>
                    </td>

                    <td className="py-4 px-4">
                      <div className="text-xs font-medium text-slate-200">
                        {art.category}
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5 truncate max-w-[180px]">
                        {(art.tags || []).join(", ")}
                      </div>
                    </td>

                    <td className="py-4 px-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize ${
                          art.status === "published"
                            ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                            : art.status === "scheduled"
                            ? "bg-blue-500/15 text-blue-400 border border-blue-500/30"
                            : "bg-slate-800 text-slate-300 border border-slate-700"
                        }`}
                      >
                        {art.status}
                      </span>
                      <div className="text-[11px] text-slate-500 mt-1">
                        Updated{" "}
                        {new Date(art.updatedAt).toLocaleDateString("en-IN", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}
                      </div>
                    </td>

                    <td className="py-4 px-4">
                      {art.seo?.focusKeyword ? (
                        <span className="text-xs px-2 py-1 rounded bg-blue-500/10 text-blue-300 border border-blue-500/20">
                          {art.seo.focusKeyword}
                        </span>
                      ) : (
                        <span className="text-xs text-slate-500 italic">
                          None
                        </span>
                      )}
                    </td>

                    <td className="py-4 px-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold border ${
                          art.seoGrade === "good"
                            ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
                            : art.seoGrade === "ok"
                            ? "bg-amber-500/15 text-amber-400 border-amber-500/30"
                            : "bg-red-500/15 text-red-400 border-red-500/30"
                        }`}
                      >
                        {art.seoScore} / 100
                      </span>
                      <div className="text-[10px] text-slate-400 mt-1">
                        {art.passCount}✓ · {art.warnCount}! · {art.failCount}✕
                      </div>
                    </td>

                    <td className="py-4 px-4 whitespace-nowrap text-xs text-slate-300">
                      <div>
                        {art.wordCount} words ({art.readingTimeMinutes}m)
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        {art.internalLinksCount} internal links
                      </div>
                    </td>

                    <td className="py-4 px-4 text-right whitespace-nowrap">
                      <div className="inline-flex items-center gap-1.5">
                        <Link
                          href={`/admin/blog/${art.slug}`}
                          className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-medium transition"
                        >
                          Edit
                        </Link>
                        <button
                          type="button"
                          disabled={busySlug === art.slug}
                          onClick={() => handleToggleStatus(art)}
                          className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium"
                        >
                          {art.status === "published" ? "Unpublish" : "Publish"}
                        </button>
                        <a
                          href={`/blog/${art.slug}`}
                          target="_blank"
                          rel="noreferrer"
                          className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs"
                          title="Preview Article"
                        >
                          ↗
                        </a>
                        <button
                          type="button"
                          disabled={busySlug === art.slug}
                          onClick={() => handleDelete(art)}
                          className="px-2.5 py-1.5 bg-slate-800 hover:bg-red-600/20 text-slate-400 hover:text-red-400 rounded-lg text-xs"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td
                      colSpan={7}
                      className="py-10 text-center text-slate-500 text-sm"
                    >
                      No blog articles match your filter.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
