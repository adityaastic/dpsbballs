"use client";

import { useEffect, useState } from "react";
import AdminPageHeader, {
  AdminCard,
  Field,
  inputClass,
  useToast,
} from "@/components/admin/AdminUI";

export default function AdminTechnicalPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { show, ToastContainer } = useToast();

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/technical");
      const json = await res.json();
      setData(json.content);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    load();
  }, []);

  const processSet = (key: string, val: any) =>
    setData((d: any) => ({ ...d, [key]: val }));

  const stepSet = (i: number, f: string, v: any) =>
    setData((d: any) => {
      const mp = [...(d.manufacturingProcess || [])];
      mp[i] = { ...mp[i], [f]: v };
      return { ...d, manufacturingProcess: mp };
    });
  const stepAdd = () =>
    setData((d: any) => ({
      ...d,
      manufacturingProcess: [
        ...(d.manufacturingProcess || []),
        { step: String((d.manufacturingProcess?.length || 0) + 1).padStart(2, "0"), title: "", text: "", order: 0 },
      ],
    }));
  const stepRemove = () =>
    setData((d: any) => ({
      ...d,
      manufacturingProcess: (d.manufacturingProcess || []).slice(0, -1),
    }));

  const matRowSet = (i: number, f: string, v: any) =>
    setData((d: any) => {
      const rows = [...(d.materialComparison?.rows || [])];
      rows[i] = { ...rows[i], [f]: v };
      return { ...d, materialComparison: { ...d.materialComparison, rows } };
    });
  const matRowAdd = () =>
    setData((d: any) => ({
      ...d,
      materialComparison: {
        ...d.materialComparison,
        rows: [...(d.materialComparison?.rows || []), { material: "", bestFor: "", strengths: "", notes: "" }],
      },
    }));
  const matRowRemove = () =>
    setData((d: any) => ({
      ...d,
      materialComparison: {
        ...d.materialComparison,
        rows: (d.materialComparison?.rows || []).slice(0, -1),
      },
    }));

  const testSet = (i: number, f: string, v: any) =>
    setData((d: any) => {
      const t = [...(d.clientTestimonials || [])];
      t[i] = { ...t[i], [f]: v };
      return { ...d, clientTestimonials: t };
    });
  const testAdd = () =>
    setData((d: any) => ({
      ...d,
      clientTestimonials: [
        ...(d.clientTestimonials || []),
        { type: "", author: "", role: "", quote: "", detail: "" },
      ],
    }));
  const testRemove = () =>
    setData((d: any) => ({
      ...d,
      clientTestimonials: (d.clientTestimonials || []).slice(0, -1),
    }));

  const ceramicHeaderSet = (i: number, v: string) =>
    setData((d: any) => {
      const h = [...(d.ceramicCompare?.headers || [])];
      h[i] = v;
      return { ...d, ceramicCompare: { ...d.ceramicCompare, headers: h } };
    });
  const ceramicHeaderAdd = () =>
    setData((d: any) => {
      const h = [...(d.ceramicCompare?.headers || []), ""];
      const rows = (d.ceramicCompare?.rows || [[""]]).map((r: string[]) => [...r, ""]);
      return { ...d, ceramicCompare: { headers: h, rows } };
    });
  const ceramicHeaderRemove = () =>
    setData((d: any) => {
      if (!d.ceramicCompare?.headers || d.ceramicCompare.headers.length <= 1) return d;
      const hi = d.ceramicCompare.headers.length - 1;
      const h = d.ceramicCompare.headers.filter((_: any, i: number) => i !== hi);
      const rows = d.ceramicCompare.rows.map((r: string[]) =>
        r.filter((_: any, i: number) => i !== hi)
      );
      return { ...d, ceramicCompare: { headers: h, rows } };
    });
  const ceramicCellSet = (r: number, c: number, v: string) =>
    setData((d: any) => {
      const rows = d.ceramicCompare.rows.map((row: string[], i: number) =>
        i === r ? row.map((cell, j) => (j === c ? v : cell)) : row
      );
      return { ...d, ceramicCompare: { ...d.ceramicCompare, rows } };
    });
  const ceramicRowAdd = () =>
    setData((d: any) => ({
      ...d,
      ceramicCompare: {
        ...d.ceramicCompare,
        rows: [
          ...d.ceramicCompare.rows,
          Array(d.ceramicCompare.headers?.length || 1).fill(""),
        ],
      },
    }));
  const ceramicRowRemove = () =>
    setData((d: any) => {
      if (d.ceramicCompare.rows.length <= 1) return d;
      return {
        ...d,
        ceramicCompare: { ...d.ceramicCompare, rows: d.ceramicCompare.rows.slice(0, -1) },
      };
    });

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const clean: any = JSON.parse(JSON.stringify(data));
      const res = await fetch("/api/admin/technical", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(clean),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Save failed");
      show("Technical content saved", "success");
    } catch (e: any) {
      show(e.message, "error");
    } finally {
      setSaving(false);
    }
  };

  if (loading || !data) {
    return (
      <div>
        <ToastContainer />
        <AdminPageHeader title="Technical Content" />
        <div className="p-12 bg-white border border-slate-200 rounded-lg text-center text-slate-500">
          Loading...
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={save} className="space-y-8">
      <ToastContainer />
      <AdminPageHeader
        title="Technical Content"
        description="Manufacturing steps, material comparison, testimonials and ceramic property table."
      />

      <AdminCard className="p-6 space-y-5">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-slate-900">Manufacturing Process</h3>
          <div className="flex gap-2">
            <button type="button" onClick={stepRemove} className="text-xs px-3 py-1.5 border border-slate-300 rounded">
              − Step
            </button>
            <button type="button" onClick={stepAdd} className="text-xs px-3 py-1.5 bg-slate-900 text-white rounded">
              + Step
            </button>
          </div>
        </div>
        <div className="space-y-4">
          {(data.manufacturingProcess || []).map((s: any, i: number) => (
            <div key={i} className="grid md:grid-cols-[80px_200px_1fr] gap-3 items-start border border-slate-200 p-4 rounded">
              <Field label="Step no.">
                <input className={inputClass()} value={s.step} onChange={(e) => stepSet(i, "step", e.target.value)} />
              </Field>
              <Field label="Title">
                <input className={inputClass()} value={s.title || ""} onChange={(e) => stepSet(i, "title", e.target.value)} />
              </Field>
              <Field label="Description">
                <textarea className={`${inputClass()} min-h-[72px]`} value={s.text || ""} onChange={(e) => stepSet(i, "text", e.target.value)} />
              </Field>
            </div>
          ))}
        </div>
      </AdminCard>

      <AdminCard className="p-6 space-y-5">
        <h3 className="font-semibold text-slate-900">Material Comparison</h3>
        <Field label="Intro text">
          <textarea
            className={`${inputClass()} min-h-[80px]`}
            value={data.materialComparison?.intro || ""}
            onChange={(e) => processSet("materialComparison", { ...data.materialComparison, intro: e.target.value })}
          />
        </Field>
        <div className="flex justify-end gap-2">
          <button type="button" onClick={matRowRemove} className="text-xs px-3 py-1.5 border border-slate-300 rounded">− Row</button>
          <button type="button" onClick={matRowAdd} className="text-xs px-3 py-1.5 bg-slate-900 text-white rounded">+ Row</button>
        </div>
        <div className="space-y-3">
          {(data.materialComparison?.rows || []).map((r: any, i: number) => (
            <div key={i} className="grid md:grid-cols-4 gap-3">
              <input className={inputClass()} value={r.material || ""} onChange={(e) => matRowSet(i, "material", e.target.value)} placeholder="Material" />
              <input className={inputClass()} value={r.bestFor || ""} onChange={(e) => matRowSet(i, "bestFor", e.target.value)} placeholder="Best for" />
              <input className={inputClass()} value={r.strengths || ""} onChange={(e) => matRowSet(i, "strengths", e.target.value)} placeholder="Strengths" />
              <input className={inputClass()} value={r.notes || ""} onChange={(e) => matRowSet(i, "notes", e.target.value)} placeholder="Notes" />
            </div>
          ))}
        </div>
      </AdminCard>

      <AdminCard className="p-6 space-y-5">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-slate-900">Client Testimonials</h3>
          <div className="flex gap-2">
            <button type="button" onClick={testRemove} className="text-xs px-3 py-1.5 border border-slate-300 rounded">− Remove</button>
            <button type="button" onClick={testAdd} className="text-xs px-3 py-1.5 bg-slate-900 text-white rounded">+ Testimonial</button>
          </div>
        </div>
        <div className="space-y-4">
          {(data.clientTestimonials || []).map((t: any, i: number) => (
            <div key={i} className="border border-slate-200 p-4 rounded space-y-3">
              <div className="grid md:grid-cols-3 gap-3">
                <input className={inputClass()} value={t.type || ""} onChange={(e) => testSet(i, "type", e.target.value)} placeholder="Type (Repeat Client)" />
                <input className={inputClass()} value={t.author || ""} onChange={(e) => testSet(i, "author", e.target.value)} placeholder="Author" />
                <input className={inputClass()} value={t.role || ""} onChange={(e) => testSet(i, "role", e.target.value)} placeholder="Role / Company" />
              </div>
              <Field label="Quote">
                <textarea className={`${inputClass()} min-h-[80px]`} value={t.quote || ""} onChange={(e) => testSet(i, "quote", e.target.value)} />
              </Field>
              <Field label="Detail / context">
                <textarea className={`${inputClass()} min-h-[60px]`} value={t.detail || ""} onChange={(e) => testSet(i, "detail", e.target.value)} />
              </Field>
            </div>
          ))}
        </div>
      </AdminCard>

      <AdminCard className="p-6 space-y-5">
        <h3 className="font-semibold text-slate-900">Ceramic Material Comparison Table</h3>
        <div className="flex justify-end gap-2">
          <button type="button" onClick={ceramicHeaderRemove} className="text-xs px-2 py-1 border border-slate-300 rounded">−Col</button>
          <button type="button" onClick={ceramicHeaderAdd} className="text-xs px-2 py-1 bg-slate-700 text-white rounded">+Col</button>
          <button type="button" onClick={ceramicRowRemove} className="text-xs px-2 py-1 border border-slate-300 rounded">−Row</button>
          <button type="button" onClick={ceramicRowAdd} className="text-xs px-2 py-1 bg-slate-700 text-white rounded">+Row</button>
        </div>
        <div className="overflow-x-auto space-y-2">
          <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${data.ceramicCompare?.headers?.length || 1}, minmax(120px,1fr))` }}>
            {(data.ceramicCompare?.headers || []).map((h: string, i: number) => (
              <input key={i} className={`${inputClass()} bg-slate-100 font-semibold`} value={h || ""} onChange={(e) => ceramicHeaderSet(i, e.target.value)} placeholder={`Header ${i + 1}`} />
            ))}
          </div>
          {(data.ceramicCompare?.rows || [[]]).map((r: string[], ri: number) => (
            <div key={ri} className="grid gap-2" style={{ gridTemplateColumns: `repeat(${data.ceramicCompare?.headers?.length || 1}, minmax(120px,1fr))` }}>
              {r.map((c, ci) => (
                <input key={ci} className={inputClass()} value={c || ""} onChange={(e) => ceramicCellSet(ri, ci, e.target.value)} />
              ))}
            </div>
          ))}
        </div>
      </AdminCard>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={saving}
          className="px-6 py-2.5 bg-amber-600 hover:bg-amber-700 disabled:opacity-60 text-white font-medium rounded-md"
        >
          {saving ? "Saving..." : "Save All"}
        </button>
      </div>
    </form>
  );
}
