"use client";

import React, { useEffect, useMemo, useState } from "react";
import { AuditedSeoItem } from "@/lib/seoCms";

export default function BulkSeoEditorPage() {
  const [items, setItems] = useState<AuditedSeoItem[]>([]);
  const [dirtyIds, setDirtyIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [typeFilter, setTypeFilter] = useState<
    "all" | "page" | "product" | "blog"
  >("all");
  const [issueFilter, setIssueFilter] = useState<
    "all" | "missing" | "duplicates" | "poor"
  >("all");
  const [search, setSearch] = useState("");

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/seo/overview");
      if (res.ok) {
        const d = await res.json();
        setItems(d.items || []);
        setDirtyIds(new Set());
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const updateRowSeo = (
    id: string,
    field:
      | "focusKeyword"
      | "seoTitle"
      | "metaDescription"
      | "canonicalUrl"
      | "robotsIndex"
      | "robotsFollow",
    value: any
  ) => {
    setItems((prev) =>
      prev.map((it) =>
        it.id === id
          ? {
              ...it,
              seo: {
                ...it.seo,
                [field]: value,
              },
            }
          : it
      )
    );
    setDirtyIds((prev) => new Set(prev).add(id));
  };

  const handleAutoFillMissing = () => {
    let filled = 0;
    const nextDirty = new Set(dirtyIds);

    setItems((prev) =>
      prev.map((it) => {
        const nextSeo = { ...it.seo };
        let changed = false;

        if (!nextSeo.seoTitle || !nextSeo.seoTitle.trim()) {
          nextSeo.seoTitle =
            it.entityType === "product"
              ? `${it.title} Manufacturer & Supplier India`
              : `${it.title} | Durga Steel & Precision Ball`;
          changed = true;
        }
        if (!nextSeo.metaDescription || !nextSeo.metaDescription.trim()) {
          nextSeo.metaDescription =
            it.entityType === "product"
              ? `ISO 9001:2015 certified ${it.title.toLowerCase()} manufacturer in Jaipur, India. Precision ISO 3290 grades, custom sizes, and global export supply from DSP.`
              : `Explore ${it.title} at Durga Steel & Precision Ball (DSP) — India's trusted manufacturer of precision balls, media, and bearing components since 1984.`;
          changed = true;
        }
        if (!nextSeo.focusKeyword || !nextSeo.focusKeyword.trim()) {
          nextSeo.focusKeyword = it.title;
          changed = true;
        }

        if (changed) {
          filled++;
          nextDirty.add(it.id);
          return { ...it, seo: nextSeo };
        }
        return it;
      })
    );

    setDirtyIds(nextDirty);
    setMessage(
      filled > 0
        ? `Generated templates for ${filled} rows with missing fields (existing custom metadata preserved). Click "Save Changes" to apply.`
        : "All rows already have SEO titles, descriptions, and focus keywords!"
    );
  };

  const handleSaveBulk = async () => {
    const toSave = items.filter((it) => dirtyIds.has(it.id));
    if (!toSave.length) return;

    setSaving(true);
    setMessage("");
    try {
      const res = await fetch("/api/admin/seo/bulk", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          updates: toSave.map((it) => ({
            id: it.id,
            entityType: it.entityType,
            entityId: it.entityId,
            urlPath: it.urlPath,
            title: it.title,
            seo: it.seo,
          })),
        }),
      });
      if (res.ok) {
        const d = await res.json();
        setMessage(
          `Successfully saved SEO metadata for ${d.updatedCount} URLs and revalidated live pages!`
        );
        await loadData();
      }
    } finally {
      setSaving(false);
    }
  };

  const handleExportCsv = () => {
    const headers = [
      "id",
      "entityType",
      "entityId",
      "urlPath",
      "focusKeyword",
      "seoTitle",
      "metaDescription",
      "canonicalUrl",
      "robotsIndex",
      "robotsFollow",
    ];
    const escapeCsv = (val: any) =>
      `"${String(val ?? "").replace(/"/g, '""')}"`;

    const rows = items.map((it) =>
      [
        it.id,
        it.entityType,
        it.entityId,
        it.urlPath,
        it.seo.focusKeyword,
        it.seo.seoTitle,
        it.seo.metaDescription,
        it.seo.canonicalUrl,
        it.seo.robotsIndex,
        it.seo.robotsFollow,
      ]
        .map(escapeCsv)
        .join(",")
    );

    const csv = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `dsp-seo-metadata-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportCsv = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = String(ev.target?.result || "");
      const lines = text.split(/\r?\n/).filter(Boolean);
      if (lines.length < 2) return;

      const parseCsvLine = (line: string) => {
        const result: string[] = [];
        let cur = "";
        let inQuotes = false;
        for (let i = 0; i < line.length; i++) {
          const ch = line[i];
          if (ch === '"') {
            if (inQuotes && line[i + 1] === '"') {
              cur += '"';
              i++;
            } else {
              inQuotes = !inQuotes;
            }
          } else if (ch === "," && !inQuotes) {
            result.push(cur);
            cur = "";
          } else {
            cur += ch;
          }
        }
        result.push(cur);
        return result;
      };

      const nextDirty = new Set(dirtyIds);
      const mapById = new Map<string, string[]>();
      for (let i = 1; i < lines.length; i++) {
        const cols = parseCsvLine(lines[i]);
        if (cols[0]) mapById.set(cols[0], cols);
      }

      setItems((prev) =>
        prev.map((it) => {
          const cols = mapById.get(it.id);
          if (!cols) return it;
          nextDirty.add(it.id);
          return {
            ...it,
            seo: {
              ...it.seo,
              focusKeyword: cols[4] ?? it.seo.focusKeyword,
              seoTitle: cols[5] ?? it.seo.seoTitle,
              metaDescription: cols[6] ?? it.seo.metaDescription,
              canonicalUrl: cols[7] ?? it.seo.canonicalUrl,
              robotsIndex: cols[8] !== "false",
              robotsFollow: cols[9] !== "false",
            },
          };
        })
      );
      setDirtyIds(nextDirty);
      setMessage(
        `Imported ${mapById.size} rows from CSV. Review changes and click "Save Changes" to persist.`
      );
    };
    reader.readAsText(file);
  };

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return items.filter((it) => {
      if (typeFilter !== "all" && it.entityType !== typeFilter) return false;
      if (issueFilter === "missing") {
        if (
          !it.issues.includes("Missing SEO Title") &&
          !it.issues.includes("Missing Meta Description")
        )
          return false;
      } else if (issueFilter === "duplicates") {
        if (
          !it.issues.includes("Duplicate SEO Title") &&
          !it.issues.includes("Duplicate Meta Description")
        )
          return false;
      } else if (issueFilter === "poor") {
        if (it.grade !== "poor") return false;
      }

      if (!q) return true;
      return (
        it.title.toLowerCase().includes(q) ||
        it.urlPath.toLowerCase().includes(q) ||
        (it.seo.seoTitle || "").toLowerCase().includes(q) ||
        (it.seo.focusKeyword || "").toLowerCase().includes(q)
      );
    });
  }, [items, typeFilter, issueFilter, search]);

  return (
    <div className="space-y-6">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-white flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">
            ⚡ Bulk SEO Metadata Editor & CSV Manager
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Inline edit SEO titles, meta descriptions, focus keywords, canonical
            URLs, and indexation directives across all pages, products, and blog
            posts.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleAutoFillMissing}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold border border-slate-700 transition"
          >
            ✨ Auto-Fill Missing Fields Only
          </button>
          <button
            type="button"
            onClick={handleExportCsv}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold border border-slate-700 transition"
          >
            ↓ Export CSV
          </button>
          <label className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold border border-slate-700 transition cursor-pointer">
            ↑ Import CSV
            <input
              type="file"
              accept=".csv"
              onChange={handleImportCsv}
              className="hidden"
            />
          </label>
          <button
            type="button"
            disabled={saving || dirtyIds.size === 0}
            onClick={handleSaveBulk}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition ${
              dirtyIds.size > 0
                ? "bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/25"
                : "bg-slate-800 text-slate-500 cursor-not-allowed"
            }`}
          >
            {saving
              ? "Saving..."
              : `Save Changes (${dirtyIds.size} modified)`}
          </button>
        </div>
      </div>

      {message && (
        <div className="p-4 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-sm font-medium">
          ✓ {message}
        </div>
      )}

      {/* Filter Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden text-white">
        <div className="p-4 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
              {[
                { id: "all", label: "All Types" },
                { id: "page", label: "Pages" },
                { id: "product", label: "Products" },
                { id: "blog", label: "Blogs" },
              ].map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setTypeFilter(t.id as any)}
                  className={`px-2.5 py-1 rounded text-xs font-medium ${
                    typeFilter === t.id
                      ? "bg-blue-600 text-white"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
              {[
                { id: "all", label: "All Status" },
                { id: "missing", label: "Missing Meta" },
                { id: "duplicates", label: "Duplicates" },
                { id: "poor", label: "Low Score (<50)" },
              ].map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setIssueFilter(t.id as any)}
                  className={`px-2.5 py-1 rounded text-xs font-medium ${
                    issueFilter === t.id
                      ? "bg-amber-600 text-white"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Filter rows by URL, title, or keyword..."
            className="px-3.5 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white w-64"
          />
        </div>

        {loading ? (
          <div className="p-8 text-center text-slate-400 text-sm">
            Loading unified SEO inventory...
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-950 text-[11px] uppercase tracking-wider text-slate-400 border-b border-slate-800">
                  <th className="py-3 px-3">URL & Score</th>
                  <th className="py-3 px-3 w-48">Focus Keyword</th>
                  <th className="py-3 px-3 w-72">SEO Title (Target: 30–60 chars)</th>
                  <th className="py-3 px-3 w-96">
                    Meta Description (Target: 110–160 chars)
                  </th>
                  <th className="py-3 px-3 w-36">Robots</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-xs">
                {filtered.map((item) => {
                  const titleLen = (item.seo.seoTitle || "").length;
                  const descLen = (item.seo.metaDescription || "").length;
                  const isDirty = dirtyIds.has(item.id);
                  return (
                    <tr
                      key={item.id}
                      className={`${
                        isDirty ? "bg-blue-950/20" : "hover:bg-slate-800/30"
                      }`}
                    >
                      <td className="py-3 px-3 align-top">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] uppercase px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-semibold">
                            {item.entityType}
                          </span>
                          <span
                            className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${
                              item.grade === "good"
                                ? "bg-emerald-500/20 text-emerald-400"
                                : item.grade === "ok"
                                ? "bg-amber-500/20 text-amber-400"
                                : "bg-red-500/20 text-red-400"
                            }`}
                          >
                            {item.score}/100
                          </span>
                        </div>
                        <div className="font-semibold text-white mt-1">
                          {item.title}
                        </div>
                        <div className="font-mono text-[11px] text-slate-500">
                          {item.urlPath}
                        </div>
                      </td>

                      <td className="py-3 px-3 align-top">
                        <input
                          type="text"
                          value={item.seo.focusKeyword || ""}
                          onChange={(e) =>
                            updateRowSeo(
                              item.id,
                              "focusKeyword",
                              e.target.value
                            )
                          }
                          placeholder="Focus keyword..."
                          className="w-full px-2.5 py-1.5 bg-slate-800 border border-slate-700 rounded text-white text-xs"
                        />
                      </td>

                      <td className="py-3 px-3 align-top">
                        <input
                          type="text"
                          value={item.seo.seoTitle || ""}
                          onChange={(e) =>
                            updateRowSeo(item.id, "seoTitle", e.target.value)
                          }
                          placeholder="SEO Title..."
                          className="w-full px-2.5 py-1.5 bg-slate-800 border border-slate-700 rounded text-white text-xs"
                        />
                        <div className="flex justify-between mt-1 text-[10px] text-slate-400">
                          <span>
                            {titleLen >= 30 && titleLen <= 60
                              ? "✓ Optimal"
                              : "Adjust length"}
                          </span>
                          <span
                            className={
                              titleLen > 60
                                ? "text-amber-400"
                                : "text-slate-400"
                            }
                          >
                            {titleLen}/60
                          </span>
                        </div>
                      </td>

                      <td className="py-3 px-3 align-top">
                        <textarea
                          rows={2}
                          value={item.seo.metaDescription || ""}
                          onChange={(e) =>
                            updateRowSeo(
                              item.id,
                              "metaDescription",
                              e.target.value
                            )
                          }
                          placeholder="Meta description..."
                          className="w-full px-2.5 py-1.5 bg-slate-800 border border-slate-700 rounded text-white text-xs"
                        />
                        <div className="flex justify-between mt-0.5 text-[10px] text-slate-400">
                          <span>
                            {descLen >= 110 && descLen <= 160
                              ? "✓ Optimal"
                              : "Adjust length"}
                          </span>
                          <span
                            className={
                              descLen > 165
                                ? "text-amber-400"
                                : "text-slate-400"
                            }
                          >
                            {descLen}/160
                          </span>
                        </div>
                      </td>

                      <td className="py-3 px-3 align-top space-y-1.5">
                        <label className="flex items-center gap-1.5 text-slate-300 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={item.seo.robotsIndex !== false}
                            onChange={(e) =>
                              updateRowSeo(
                                item.id,
                                "robotsIndex",
                                e.target.checked
                              )
                            }
                            className="rounded border-slate-600 text-blue-600"
                          />
                          <span>Index</span>
                        </label>
                        <label className="flex items-center gap-1.5 text-slate-300 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={item.seo.robotsFollow !== false}
                            onChange={(e) =>
                              updateRowSeo(
                                item.id,
                                "robotsFollow",
                                e.target.checked
                              )
                            }
                            className="rounded border-slate-600 text-blue-600"
                          />
                          <span>Follow</span>
                        </label>
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
