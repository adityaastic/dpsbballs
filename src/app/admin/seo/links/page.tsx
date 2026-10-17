"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { AuditedSeoItem } from "@/lib/seoCms";

export default function InternalLinkingManagerPage() {
  const [items, setItems] = useState<AuditedSeoItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "orphans" | "no-outgoing">(
    "all"
  );
  const [search, setSearch] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/seo/overview")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (d?.items) setItems(d.items);
      })
      .finally(() => setLoading(false));
  }, []);

  const stats = useMemo(() => {
    const totalOut = items.reduce((a, b) => a + b.internalLinksCount, 0);
    const orphans = items.filter((i) => i.isOrphan).length;
    const noOutgoing = items.filter((i) => i.internalLinksCount === 0).length;
    return {
      totalOut,
      orphans,
      noOutgoing,
      avgOut: items.length ? (totalOut / items.length).toFixed(1) : "0",
    };
  }, [items]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return items.filter((i) => {
      if (filter === "orphans" && !i.isOrphan) return false;
      if (filter === "no-outgoing" && i.internalLinksCount > 0) return false;
      if (!q) return true;
      return (
        i.title.toLowerCase().includes(q) ||
        i.urlPath.toLowerCase().includes(q) ||
        (i.seo.focusKeyword || "").toLowerCase().includes(q)
      );
    });
  }, [items, filter, search]);

  const getEditHref = (item: AuditedSeoItem) => {
    if (item.entityType === "blog") return `/admin/blog/${item.entityId}`;
    if (item.entityType === "product") return `/admin/products/${item.entityId}`;
    return `/admin/pages/${item.entityId}`;
  };

  return (
    <div className="space-y-6">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-white">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">
              🔗 Advanced Internal Linking & Orphan Page Manager
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              Analyze incoming and outgoing internal link distribution across
              all pages, products, and blog articles. Eliminate orphan pages and
              build high-authority topic clusters.
            </p>
          </div>
          <Link
            href="/admin/blog"
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold"
          >
            Open Blog Editor to Add Links →
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
          <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4">
            <div className="text-[11px] uppercase text-slate-400">
              Total Content Internal Links
            </div>
            <div className="text-2xl font-bold text-blue-400 mt-1">
              {stats.totalOut}
            </div>
          </div>
          <div
            onClick={() => setFilter("orphans")}
            className="bg-slate-950/70 border border-slate-800 hover:border-red-500/50 rounded-xl p-4 cursor-pointer"
          >
            <div className="text-[11px] uppercase text-slate-400">
              Orphan Pages (0 Incoming)
            </div>
            <div className="text-2xl font-bold text-red-400 mt-1">
              {stats.orphans}
            </div>
          </div>
          <div
            onClick={() => setFilter("no-outgoing")}
            className="bg-slate-950/70 border border-slate-800 hover:border-amber-500/50 rounded-xl p-4 cursor-pointer"
          >
            <div className="text-[11px] uppercase text-slate-400">
              Dead-End Pages (0 Outgoing)
            </div>
            <div className="text-2xl font-bold text-amber-400 mt-1">
              {stats.noOutgoing}
            </div>
          </div>
          <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4">
            <div className="text-[11px] uppercase text-slate-400">
              Avg Outgoing Links / URL
            </div>
            <div className="text-2xl font-bold text-emerald-400 mt-1">
              {stats.avgOut}
            </div>
          </div>
        </div>
      </div>

      {/* Anchor Text Best Practices Box */}
      <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-300 flex flex-wrap items-center justify-between gap-3">
        <div>
          <strong className="text-white">
            Anchor Text Diversity Guidance:
          </strong>{" "}
          Avoid using generic anchors like &ldquo;click here&rdquo; or repeating
          the exact same anchor text on every link. Rotate between the{" "}
          <span className="text-blue-400">Focus Keyword</span>,{" "}
          <span className="text-emerald-400">Product / Article Title</span>, and
          natural descriptive phrases.
        </div>
      </div>

      {/* Link Graph Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden text-white">
        <div className="p-4 border-b border-slate-800 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-1.5">
            {[
              { id: "all", label: `All URLs (${items.length})` },
              {
                id: "orphans",
                label: `Orphan Pages (${stats.orphans})`,
              },
              {
                id: "no-outgoing",
                label: `0 Outgoing Links (${stats.noOutgoing})`,
              },
            ].map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setFilter(t.id as any)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium ${
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
            placeholder="Search URL, title, or focus keyword..."
            className="px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white w-64"
          />
        </div>

        {loading ? (
          <div className="p-8 text-center text-slate-400 text-sm">
            Building internal link graph...
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-950 text-[11px] uppercase tracking-wider text-slate-400 border-b border-slate-800">
                  <th className="py-3.5 px-4">Target Page / Article / Product</th>
                  <th className="py-3.5 px-4">Recommended Anchor Text</th>
                  <th className="py-3.5 px-4">Incoming Internal Links</th>
                  <th className="py-3.5 px-4">Outgoing Internal Links</th>
                  <th className="py-3.5 px-4">External Links</th>
                  <th className="py-3.5 px-4 text-right">Quick Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-sm">
                {filtered.map((item) => {
                  const anchorText = item.seo.focusKeyword || item.title;
                  const htmlSnippet = `<a href="${item.urlPath}">${anchorText}</a>`;
                  return (
                    <tr key={item.id} className="hover:bg-slate-800/40">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] uppercase px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-semibold">
                            {item.entityType}
                          </span>
                          <span className="font-medium text-white">
                            {item.title}
                          </span>
                        </div>
                        <div className="text-xs font-mono text-slate-500 mt-0.5">
                          {item.urlPath}
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="text-xs text-blue-300 font-medium">
                          &ldquo;{anchorText}&rdquo;
                        </div>
                        {(item.seo.secondaryKeywords || []).length > 0 && (
                          <div className="text-[11px] text-slate-500 mt-0.5">
                            Alt anchors:{" "}
                            {item.seo.secondaryKeywords.slice(0, 2).join(", ")}
                          </div>
                        )}
                      </td>

                      <td className="py-3.5 px-4">
                        {item.isOrphan ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-500/15 text-red-400 border border-red-500/30">
                            0 Incoming (Orphan)
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                            {item.incomingInternalLinks} Incoming
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4">
                        <span
                          className={`text-xs font-semibold ${
                            item.internalLinksCount > 0
                              ? "text-blue-400"
                              : "text-amber-400"
                          }`}
                        >
                          {item.internalLinksCount} Outgoing
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-xs text-slate-400">
                        {item.externalLinksCount} External
                      </td>

                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="inline-flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              navigator.clipboard.writeText(htmlSnippet);
                              setCopiedId(item.id);
                              setTimeout(() => setCopiedId(null), 2000);
                            }}
                            className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-xs font-medium"
                          >
                            {copiedId === item.id
                              ? "✓ Anchor Copied"
                              : "Copy HTML Link"}
                          </button>
                          <Link
                            href={getEditHref(item)}
                            className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-medium"
                          >
                            Edit Content
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
