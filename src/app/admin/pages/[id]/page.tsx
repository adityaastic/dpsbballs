"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import AdminPageHeader, {
  Field,
  inputClass,
  useToast,
} from "@/components/admin/AdminUI";

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

  const sectionSet = (i: number, f: string, v: any) =>
    setPage((p: any) => {
      const s = [...(p.sections || [])];
      s[i] = { ...s[i], [f]: v };
      return { ...p, sections: s };
    });
  const sectionAdd = () =>
    setPage((p: any) => ({
      ...p,
      sections: [...(p.sections || []), { key: `section_${Date.now()}`, heading: "", subheading: "", body: "", order: (p.sections?.length || 0) }],
    }));
  const sectionRemove = () =>
    setPage((p: any) => ({ ...p, sections: (p.sections || []).slice(0, -1) }));

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
      show("Page saved", "success");
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
          Loading...
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={save} className="space-y-8">
      <ToastContainer />
      <AdminPageHeader
        title={`Edit: ${page.title}`}
        description={`Page slug: ${page.slug}`}
        actions={
          <div className="flex gap-2">
            <Link
              href="/admin/pages"
              className="px-4 py-2 border border-slate-300 text-sm rounded-md hover:bg-slate-50"
            >
              ← Pages
            </Link>
            <Link
              href={`/${page.slug}`}
              target="_blank"
              className="px-4 py-2 border border-slate-300 text-sm rounded-md hover:bg-slate-50"
            >
              Preview ↗
            </Link>
          </div>
        }
      />

      <div className="bg-white border border-slate-200 rounded-lg p-6 space-y-5">
        <h3 className="font-semibold text-slate-900">Basics</h3>
        <div className="grid md:grid-cols-2 gap-5">
          <Field label="Title">
            <input
              className={inputClass()}
              value={page.title || ""}
              onChange={(e) => update("title", e.target.value)}
            />
          </Field>
          <Field label="Slug">
            <input
              className={inputClass()}
              value={page.slug || ""}
              onChange={(e) => update("slug", e.target.value)}
            />
          </Field>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-lg p-6 space-y-5">
        <h3 className="font-semibold text-slate-900">Hero Section</h3>
        <div className="grid gap-5">
          <Field label="Hero eyebrow">
            <input
              className={inputClass()}
              value={page.heroEyebrow || ""}
              onChange={(e) => update("heroEyebrow", e.target.value)}
            />
          </Field>
          <Field label="Hero title">
            <input
              className={inputClass()}
              value={page.heroTitle || ""}
              onChange={(e) => update("heroTitle", e.target.value)}
            />
          </Field>
          <Field label="Hero description">
            <textarea
              className={`${inputClass()} min-h-[100px]`}
              value={page.heroDescription || ""}
              onChange={(e) => update("heroDescription", e.target.value)}
            />
          </Field>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-lg p-6 space-y-5">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-slate-900">Content Sections</h3>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={sectionRemove}
              className="text-xs px-3 py-1.5 border border-slate-300 rounded"
            >
              − Remove
            </button>
            <button
              type="button"
              onClick={sectionAdd}
              className="text-xs px-3 py-1.5 bg-slate-900 text-white rounded"
            >
              + Section
            </button>
          </div>
        </div>
        <div className="space-y-5">
          {(page.sections || []).map((s: any, i: number) => (
            <div key={i} className="border border-slate-200 rounded p-4 space-y-4">
              <div className="grid md:grid-cols-3 gap-3">
                <Field label="Heading">
                  <input
                    className={inputClass()}
                    value={s.heading || ""}
                    onChange={(e) => sectionSet(i, "heading", e.target.value)}
                  />
                </Field>
                <Field label="Subheading">
                  <input
                    className={inputClass()}
                    value={s.subheading || ""}
                    onChange={(e) => sectionSet(i, "subheading", e.target.value)}
                  />
                </Field>
                <Field label="Order">
                  <input
                    type="number"
                    className={inputClass()}
                    value={s.order ?? i}
                    onChange={(e) => sectionSet(i, "order", parseInt(e.target.value) || 0)}
                  />
                </Field>
              </div>
              <Field label="Body content">
                <textarea
                  className={`${inputClass()} min-h-[140px]`}
                  value={s.body || ""}
                  onChange={(e) => sectionSet(i, "body", e.target.value)}
                />
              </Field>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-lg p-6 space-y-5">
        <h3 className="font-semibold text-slate-900">Free-form HTML (optional)</h3>
        <Field label="Raw HTML body (if sections aren't enough)">
          <textarea
            className={`${inputClass()} min-h-[160px] font-mono text-xs`}
            value={page.bodyHtml || ""}
            onChange={(e) => update("bodyHtml", e.target.value)}
          />
        </Field>
      </div>

      <div className="flex justify-end gap-3">
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
          className="px-6 py-2.5 bg-amber-600 hover:bg-amber-700 disabled:opacity-60 text-white font-medium rounded-md"
        >
          {saving ? "Saving..." : "Save Page"}
        </button>
      </div>
    </form>
  );
}
