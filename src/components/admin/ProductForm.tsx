"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Field, inputClass, useToast } from "./AdminUI";

type ProductFormData = {
  slug: string;
  title: string;
  short: string;
  description: string;
  imageUrl: string;
  highlights: string[];
  grades: string[];
  specs: { label: string; value: string }[];
  tables: { title: string; headers: string[]; rows: string[][] }[];
  order: number;
  published: boolean;
};

const emptyProduct: ProductFormData = {
  slug: "",
  title: "",
  short: "",
  description: "",
  imageUrl: "",
  highlights: [""],
  grades: [""],
  specs: [{ label: "", value: "" }],
  tables: [{ title: "", headers: [""], rows: [[""]] }],
  order: 0,
  published: true,
};

type Props = {
  initial?: (Partial<ProductFormData> & { _id?: string }) | null;
  mode: "new" | "edit";
};

export default function ProductForm({ initial, mode }: Props) {
  const [data, setData] = useState<ProductFormData>(
    { ...emptyProduct, ...(initial || {}) }
  );
  const [submitting, setSubmitting] = useState(false);
  const { ToastContainer, show } = useToast();
  const router = useRouter();

  const update = <K extends keyof ProductFormData>(key: K, value: ProductFormData[K]) =>
    setData((d) => ({ ...d, [key]: value }));

  const arrPush = (key: "highlights" | "grades", v = "") =>
    setData((d) => ({ ...d, [key]: [...(d[key] as string[]), v] }));
  const arrPop = (key: "highlights" | "grades") =>
    setData((d) => ({
      ...d,
      [key]:
        (d[key] as string[]).length > 1
          ? (d[key] as string[]).slice(0, -1)
          : (d[key] as string[]),
    }));
  const arrSet = (key: "highlights" | "grades", idx: number, val: string) =>
    setData((d) => {
      const next = [...(d[key] as string[])];
      next[idx] = val;
      return { ...d, [key]: next };
    });

  const specSet = (idx: number, field: "label" | "value", val: string) =>
    setData((d) => {
      const next = [...d.specs];
      next[idx] = { ...next[idx], [field]: val };
      return { ...d, specs: next };
    });
  const specAdd = () => setData((d) => ({ ...d, specs: [...d.specs, { label: "", value: "" }] }));
  const specRemove = (i: number) =>
    setData((d) => ({
      ...d,
      specs: d.specs.length > 1 ? d.specs.filter((_, x) => x !== i) : d.specs,
    }));

  const tableSet = <K extends "title" | "headers" | "rows">(tIdx: number, key: K, value: ProductFormData["tables"][number][K]) =>
    setData((d) => {
      const next = [...d.tables];
      next[tIdx] = { ...next[tIdx], [key]: value };
      return { ...d, tables: next };
    });
  const tableHeaderSet = (tIdx: number, hIdx: number, v: string) =>
    setData((d) => {
      const next = [...d.tables];
      const h = [...next[tIdx].headers];
      h[hIdx] = v;
      next[tIdx] = { ...next[tIdx], headers: h };
      return { ...d, tables: next };
    });
  const tableHeaderAdd = (tIdx: number) =>
    setData((d) => {
      const next = [...d.tables];
      next[tIdx] = {
        ...next[tIdx],
        headers: [...next[tIdx].headers, ""],
        rows: next[tIdx].rows.map((r) => [...r, ""]),
      };
      return { ...d, tables: next };
    });
  const tableHeaderRemove = (tIdx: number) =>
    setData((d) => {
      if (d.tables[tIdx].headers.length <= 1) return d;
      const next = [...d.tables];
      const removeIdx = next[tIdx].headers.length - 1;
      next[tIdx] = {
        ...next[tIdx],
        headers: next[tIdx].headers.filter((_, x) => x !== removeIdx),
        rows: next[tIdx].rows.map((r) => r.filter((_, x) => x !== removeIdx)),
      };
      return { ...d, tables: next };
    });
  const tableRowSet = (tIdx: number, rIdx: number, cIdx: number, v: string) =>
    setData((d) => {
      const next = [...d.tables];
      const r = next[tIdx].rows.map((row, i) =>
        i === rIdx ? row.map((c, j) => (j === cIdx ? v : c)) : row
      );
      next[tIdx] = { ...next[tIdx], rows: r };
      return { ...d, tables: next };
    });
  const tableRowAdd = (tIdx: number) =>
    setData((d) => {
      const next = [...d.tables];
      next[tIdx] = {
        ...next[tIdx],
        rows: [...next[tIdx].rows, Array(next[tIdx].headers.length).fill("")],
      };
      return { ...d, tables: next };
    });
  const tableRowRemove = (tIdx: number) =>
    setData((d) => {
      if (d.tables[tIdx].rows.length <= 1) return d;
      const next = [...d.tables];
      next[tIdx] = {
        ...next[tIdx],
        rows: next[tIdx].rows.slice(0, -1),
      };
      return { ...d, tables: next };
    });
  const tableAdd = () =>
    setData((d) => ({
      ...d,
      tables: [...d.tables, { title: "", headers: [""], rows: [[""]] }],
    }));
  const tableRemove = (i: number) =>
    setData((d) => ({
      ...d,
      tables: d.tables.length > 1 ? d.tables.filter((_, x) => x !== i) : d.tables,
    }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!data.title.trim()) {
      show("Title is required", "error");
      return;
    }
    setSubmitting(true);

    const clean: ProductFormData = { ...data };
    clean.highlights = data.highlights.filter((x) => x.trim());
    clean.grades = data.grades.filter((x) => x.trim());
    clean.specs = data.specs.filter((s) => s.label.trim() && s.value.trim());
    clean.tables = data.tables
      .filter((t) => t.headers.some((h) => h.trim()))
      .map((t) => ({
        ...t,
        headers: t.headers.map((h) => h.trim()),
        rows: t.rows.filter((r) => r.some((c) => c.trim())),
      }));

    try {
      let res: Response;
      if (mode === "new") {
        res = await fetch("/api/admin/products", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(clean),
        });
      } else {
        res = await fetch(`/api/admin/products/${initial?._id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(clean),
        });
      }
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed");
      show(mode === "new" ? "Product created" : "Product saved", "success");
      setTimeout(() => router.push("/admin/products"), 400);
    } catch {
      show("Operation failed", "error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-8">
      <ToastContainer />
      <div className="grid md:grid-cols-2 gap-5">
        <Field label="Title *">
          <input
            className={inputClass()}
            value={data.title}
            onChange={(e) => update("title", e.target.value)}
            placeholder="e.g. Stainless Steel Balls"
          />
        </Field>
        <Field label="Slug (auto-generated if empty)">
          <input
            className={inputClass()}
            value={data.slug}
            onChange={(e) => update("slug", e.target.value)}
            placeholder="stainless-steel-balls"
          />
        </Field>
        <Field label="Short summary" className="md:col-span-2">
          <input
            className={inputClass()}
            value={data.short}
            onChange={(e) => update("short", e.target.value)}
            placeholder="One-liner for cards & lists"
          />
        </Field>
        <Field label="Image URL (use media library)" className="md:col-span-2">
          <input
            className={inputClass()}
            value={data.imageUrl}
            onChange={(e) => update("imageUrl", e.target.value)}
            placeholder="/uploads/xxx.jpg or https://..."
          />
        </Field>
        <Field label="Description" className="md:col-span-2">
          <textarea
            className={`${inputClass()} min-h-[140px]`}
            value={data.description}
            onChange={(e) => update("description", e.target.value)}
          />
        </Field>
        <Field label="Display order (number)">
          <input
            type="number"
            className={inputClass()}
            value={data.order}
            onChange={(e) => update("order", parseInt(e.target.value) || 0)}
          />
        </Field>
        <Field label="Published">
          <div className="flex items-center h-[38px]">
            <input
              id="pub"
              type="checkbox"
              className="w-4 h-4 accent-amber-600"
              checked={data.published}
              onChange={(e) => update("published", e.target.checked)}
            />
            <label htmlFor="pub" className="ml-2 text-sm text-slate-600">
              Show on site
            </label>
          </div>
        </Field>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-slate-900">Highlights</h3>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => arrPop("highlights")}
              className="px-3 py-1.5 text-xs border border-slate-300 rounded hover:bg-slate-50"
            >
              − Remove
            </button>
            <button
              type="button"
              onClick={() => arrPush("highlights")}
              className="px-3 py-1.5 text-xs bg-slate-900 text-white rounded hover:bg-slate-800"
            >
              + Add bullet
            </button>
          </div>
        </div>
        <div className="space-y-2">
          {data.highlights.map((h, i) => (
            <input
              key={i}
              className={inputClass()}
              value={h}
              onChange={(e) => arrSet("highlights", i, e.target.value)}
              placeholder={`Highlight ${i + 1}`}
            />
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-slate-900">Grades</h3>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => arrPop("grades")}
              className="px-3 py-1.5 text-xs border border-slate-300 rounded hover:bg-slate-50"
            >
              − Remove
            </button>
            <button
              type="button"
              onClick={() => arrPush("grades")}
              className="px-3 py-1.5 text-xs bg-slate-900 text-white rounded hover:bg-slate-800"
            >
              + Add grade
            </button>
          </div>
        </div>
        <div className="space-y-2">
          {data.grades.map((g, i) => (
            <input
              key={i}
              className={inputClass()}
              value={g}
              onChange={(e) => arrSet("grades", i, e.target.value)}
              placeholder={`Grade ${i + 1} — e.g. SS 304`}
            />
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-slate-900">Specifications</h3>
          <button
            type="button"
            onClick={specAdd}
            className="px-3 py-1.5 text-xs bg-slate-900 text-white rounded hover:bg-slate-800"
          >
            + Add spec
          </button>
        </div>
        <div className="space-y-2">
          {data.specs.map((s, i) => (
            <div key={i} className="flex gap-2">
              <input
                className={`${inputClass()} flex-[1_1_180px]`}
                value={s.label}
                onChange={(e) => specSet(i, "label", e.target.value)}
                placeholder="Label (e.g. Hardness)"
              />
              <input
                className={`${inputClass()} flex-[2_1_280px]`}
                value={s.value}
                onChange={(e) => specSet(i, "value", e.target.value)}
                placeholder="Value"
              />
              <button
                type="button"
                onClick={() => specRemove(i)}
                className="px-3 text-xs text-red-600 border border-red-200 rounded hover:bg-red-50"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-slate-900">Data Tables</h3>
          <button
            type="button"
            onClick={tableAdd}
            className="px-3 py-1.5 text-xs bg-slate-900 text-white rounded hover:bg-slate-800"
          >
            + Add table
          </button>
        </div>
        {data.tables.map((t, tIdx) => (
          <div key={tIdx} className="p-4 border border-slate-200 rounded-lg space-y-4">
            <div className="flex items-center justify-between gap-3">
              <input
                className={inputClass()}
                value={t.title}
                onChange={(e) => tableSet(tIdx, "title", e.target.value)}
                placeholder={`Table ${tIdx + 1} title`}
              />
              <button
                type="button"
                onClick={() => tableRemove(tIdx)}
                className="px-3 py-2 text-xs text-red-600 border border-red-200 rounded hover:bg-red-50 shrink-0"
              >
                Delete
              </button>
            </div>
            <div>
              <div className="text-xs font-medium text-slate-600 mb-2 flex items-center justify-between">
                <span>Headers</span>
                <div className="flex gap-1">
                  <button
                    type="button"
                    onClick={() => tableHeaderRemove(tIdx)}
                    className="px-2 py-0.5 text-[11px] border border-slate-300 rounded"
                  >
                    −Col
                  </button>
                  <button
                    type="button"
                    onClick={() => tableHeaderAdd(tIdx)}
                    className="px-2 py-0.5 text-[11px] bg-slate-700 text-white rounded"
                  >
                    +Col
                  </button>
                </div>
              </div>
              <div className="grid gap-2 mb-3" style={{ gridTemplateColumns: `repeat(${t.headers.length || 1}, minmax(0,1fr))` }}>
                {t.headers.map((h, hIdx) => (
                  <input
                    key={hIdx}
                    className={inputClass()}
                    value={h}
                    onChange={(e) => tableHeaderSet(tIdx, hIdx, e.target.value)}
                    placeholder={`H${hIdx + 1}`}
                  />
                ))}
              </div>
              <div className="text-xs font-medium text-slate-600 mb-2 flex items-center justify-between">
                <span>Rows</span>
                <div className="flex gap-1">
                  <button
                    type="button"
                    onClick={() => tableRowRemove(tIdx)}
                    className="px-2 py-0.5 text-[11px] border border-slate-300 rounded"
                  >
                    −Row
                  </button>
                  <button
                    type="button"
                    onClick={() => tableRowAdd(tIdx)}
                    className="px-2 py-0.5 text-[11px] bg-slate-700 text-white rounded"
                  >
                    +Row
                  </button>
                </div>
              </div>
              <div className="space-y-2">
                {t.rows.map((r, rIdx) => (
                  <div
                    key={rIdx}
                    className="grid gap-2"
                    style={{ gridTemplateColumns: `repeat(${t.headers.length || 1}, minmax(0,1fr))` }}
                  >
                    {r.map((c, cIdx) => (
                      <input
                        key={cIdx}
                        className={inputClass()}
                        value={c}
                        onChange={(e) => tableRowSet(tIdx, rIdx, cIdx, e.target.value)}
                        placeholder={`R${rIdx + 1}C${cIdx + 1}`}
                      />
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="pt-4 border-t border-slate-200 flex gap-3 sticky bottom-0 bg-white/80 backdrop-blur py-4">
        <button
          type="submit"
          disabled={submitting}
          className="px-6 py-2.5 bg-amber-600 hover:bg-amber-700 disabled:opacity-60 text-white font-medium rounded-md"
        >
          {submitting ? "Saving..." : mode === "new" ? "Create Product" : "Save Changes"}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="px-6 py-2.5 border border-slate-300 text-slate-700 rounded-md hover:bg-slate-50"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
