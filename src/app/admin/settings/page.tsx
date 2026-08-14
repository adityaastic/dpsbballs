"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AdminPageHeader, {
  AdminCard,
  Field,
  inputClass,
  useToast,
} from "@/components/admin/AdminUI";

export default function AdminSettingsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { show, ToastContainer } = useToast();

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/settings");
      const json = await res.json();
      setData(json.settings);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    load();
  }, []);

  const update = (key: string, value: any) =>
    setData((d: any) => ({ ...d, [key]: value }));

  const updateOffice = (which: "workOffice" | "regdOffice", key: string, v: any) =>
    setData((d: any) => ({
      ...d,
      [which]: { ...d[which], [key]: v },
    }));
  const updateOfficeLine = (which: "workOffice" | "regdOffice", i: number, v: string) =>
    setData((d: any) => {
      const lines = [...(d[which]?.lines || [])];
      lines[i] = v;
      return { ...d, [which]: { ...d[which], lines } };
    });
  const officeLineAdd = (which: "workOffice" | "regdOffice") =>
    setData((d: any) => {
      const lines = [...(d[which]?.lines || []), ""];
      return { ...d, [which]: { ...d[which], lines } };
    });
  const officeLineRemove = (which: "workOffice" | "regdOffice") =>
    setData((d: any) => {
      const lines = (d[which]?.lines || []).slice(0, -1);
      return { ...d, [which]: { ...d[which], lines } };
    });

  const highlightSet = (i: number, field: "label" | "value", v: string) =>
    setData((d: any) => {
      const highlights = [...(d.highlights || [])];
      highlights[i] = { ...highlights[i], [field]: v };
      return { ...d, highlights };
    });
  const highlightAdd = () =>
    setData((d: any) => ({
      ...d,
      highlights: [...(d.highlights || []), { label: "", value: "" }],
    }));
  const highlightRemove = () =>
    setData((d: any) => ({
      ...d,
      highlights: (d.highlights || []).slice(0, -1),
    }));

  const navSet = (i: number, field: "href" | "label" | "order", v: any) =>
    setData((d: any) => {
      const navLinks = [...(d.navLinks || [])];
      navLinks[i] = { ...navLinks[i], [field]: v };
      return { ...d, navLinks };
    });
  const navAdd = () =>
    setData((d: any) => ({
      ...d,
      navLinks: [...(d.navLinks || []), { href: "", label: "", order: 0 }],
    }));
  const navRemove = () =>
    setData((d: any) => ({ ...d, navLinks: (d.navLinks || []).slice(0, -1) }));

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const clean: any = { ...data };
      clean.highlights = (clean.highlights || []).filter(
        (x: any) => x.label && x.value
      );
      clean.navLinks = (clean.navLinks || []).filter((x: any) => x.href && x.label);

      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(clean),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Save failed");
      show("Site settings saved", "success");
    } catch (e: any) {
      show(e.message, "error");
    } finally {
      setSaving(false);
    }
  };

  if (loading || !data) {
    return (
      <div className="space-y-8">
        <ToastContainer />
        <AdminPageHeader title="Site Settings" />
        <div className="p-12 bg-white border border-slate-200 rounded-lg text-center text-slate-500">
          Loading settings...
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={save} className="space-y-8">
      <ToastContainer />
      <AdminPageHeader
        title="Site Settings"
        description="Update company information, contact details, navigation and SEO defaults."
      />

      <AdminCard className="p-6 space-y-5">
        <h3 className="font-semibold text-slate-900">Company</h3>
        <div className="grid md:grid-cols-2 gap-5">
          <Field label="Company name">
            <input
              className={inputClass()}
              value={data.name || ""}
              onChange={(e) => update("name", e.target.value)}
            />
          </Field>
          <Field label="Short name">
            <input
              className={inputClass()}
              value={data.shortName || ""}
              onChange={(e) => update("shortName", e.target.value)}
            />
          </Field>
          <Field label="Tagline" className="md:col-span-2">
            <input
              className={inputClass()}
              value={data.tagline || ""}
              onChange={(e) => update("tagline", e.target.value)}
            />
          </Field>
        </div>
      </AdminCard>

      <AdminCard className="p-6 space-y-5">
        <h3 className="font-semibold text-slate-900">Contact</h3>
        <div className="grid md:grid-cols-2 gap-5">
          <Field label="Email">
            <input
              type="email"
              className={inputClass()}
              value={data.email || ""}
              onChange={(e) => update("email", e.target.value)}
            />
          </Field>
          <Field label="Mobile">
            <input
              className={inputClass()}
              value={data.mobile || ""}
              onChange={(e) => update("mobile", e.target.value)}
            />
          </Field>
          <Field label="Work Office Phone">
            <input
              className={inputClass()}
              value={data.phoneWork || ""}
              onChange={(e) => update("phoneWork", e.target.value)}
            />
          </Field>
          <Field label="Regd Office Phone">
            <input
              className={inputClass()}
              value={data.phoneRegd || ""}
              onChange={(e) => update("phoneRegd", e.target.value)}
            />
          </Field>
          <Field label="Fax" className="md:col-span-2">
            <input
              className={inputClass()}
              value={data.phoneFax || ""}
              onChange={(e) => update("phoneFax", e.target.value)}
            />
          </Field>
        </div>

        <div className="grid md:grid-cols-2 gap-5 pt-3">
          <div className="space-y-3 border border-slate-200 rounded-lg p-4">
            <h4 className="font-medium text-sm text-slate-800">Work Office</h4>
            <Field label="Label">
              <input
                className={inputClass()}
                value={data.workOffice?.label || ""}
                onChange={(e) =>
                  updateOffice("workOffice", "label", e.target.value)
                }
              />
            </Field>
            {(data.workOffice?.lines || [""]).map((line: string, i: number) => (
              <Field key={i} label={`Address line ${i + 1}`}>
                <input
                  className={inputClass()}
                  value={line || ""}
                  onChange={(e) =>
                    updateOfficeLine("workOffice", i, e.target.value)
                  }
                />
              </Field>
            ))}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => officeLineRemove("workOffice")}
                className="text-xs px-2 py-1 border border-slate-300 rounded"
              >
                − Line
              </button>
              <button
                type="button"
                onClick={() => officeLineAdd("workOffice")}
                className="text-xs px-2 py-1 bg-slate-700 text-white rounded"
              >
                + Line
              </button>
            </div>
          </div>

          <div className="space-y-3 border border-slate-200 rounded-lg p-4">
            <h4 className="font-medium text-sm text-slate-800">Registered Office</h4>
            <Field label="Label">
              <input
                className={inputClass()}
                value={data.regdOffice?.label || ""}
                onChange={(e) =>
                  updateOffice("regdOffice", "label", e.target.value)
                }
              />
            </Field>
            {(data.regdOffice?.lines || [""]).map((line: string, i: number) => (
              <Field key={i} label={`Address line ${i + 1}`}>
                <input
                  className={inputClass()}
                  value={line || ""}
                  onChange={(e) =>
                    updateOfficeLine("regdOffice", i, e.target.value)
                  }
                />
              </Field>
            ))}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => officeLineRemove("regdOffice")}
                className="text-xs px-2 py-1 border border-slate-300 rounded"
              >
                − Line
              </button>
              <button
                type="button"
                onClick={() => officeLineAdd("regdOffice")}
                className="text-xs px-2 py-1 bg-slate-700 text-white rounded"
              >
                + Line
              </button>
            </div>
          </div>
        </div>
      </AdminCard>

      <AdminCard className="p-6 space-y-5">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-slate-900">Stats Highlights</h3>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={highlightRemove}
              className="text-xs px-3 py-1.5 border border-slate-300 rounded"
            >
              − Remove
            </button>
            <button
              type="button"
              onClick={highlightAdd}
              className="text-xs px-3 py-1.5 bg-slate-900 text-white rounded"
            >
              + Add
            </button>
          </div>
        </div>
        <div className="space-y-3">
          {(data.highlights || [{ label: "", value: "" }]).map(
            (h: any, i: number) => (
              <div key={i} className="grid grid-cols-2 gap-3">
                <input
                  className={inputClass()}
                  value={h.label || ""}
                  onChange={(e) => highlightSet(i, "label", e.target.value)}
                  placeholder="Label (e.g. Established)"
                />
                <input
                  className={inputClass()}
                  value={h.value || ""}
                  onChange={(e) => highlightSet(i, "value", e.target.value)}
                  placeholder="Value (e.g. 1995)"
                />
              </div>
            )
          )}
        </div>
      </AdminCard>

      <AdminCard className="p-6 space-y-5">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-slate-900">Navigation Links</h3>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={navRemove}
              className="text-xs px-3 py-1.5 border border-slate-300 rounded"
            >
              − Remove
            </button>
            <button
              type="button"
              onClick={navAdd}
              className="text-xs px-3 py-1.5 bg-slate-900 text-white rounded"
            >
              + Add Link
            </button>
          </div>
        </div>
        <div className="space-y-3">
          {(data.navLinks || [{ href: "", label: "", order: 0 }]).map(
            (n: any, i: number) => (
              <div key={i} className="grid md:grid-cols-[1.5fr_2fr_100px] gap-3">
                <input
                  className={inputClass()}
                  value={n.href || ""}
                  onChange={(e) => navSet(i, "href", e.target.value)}
                  placeholder="URL (e.g. /about)"
                />
                <input
                  className={inputClass()}
                  value={n.label || ""}
                  onChange={(e) => navSet(i, "label", e.target.value)}
                  placeholder="Label (e.g. About Us)"
                />
                <input
                  type="number"
                  className={inputClass()}
                  value={n.order ?? i}
                  onChange={(e) => navSet(i, "order", parseInt(e.target.value) || 0)}
                  placeholder="Order"
                />
              </div>
            )
          )}
        </div>
      </AdminCard>

      <AdminCard className="p-6 space-y-5">
        <h3 className="font-semibold text-slate-900">SEO Defaults</h3>
        <Field label="Default meta title">
          <input
            className={inputClass()}
            value={data.seoTitle || ""}
            onChange={(e) => update("seoTitle", e.target.value)}
          />
        </Field>
        <Field label="Default meta description">
          <textarea
            className={`${inputClass()} min-h-[80px]`}
            value={data.seoDescription || ""}
            onChange={(e) => update("seoDescription", e.target.value)}
          />
        </Field>
      </AdminCard>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={saving}
          className="px-6 py-2.5 bg-amber-600 hover:bg-amber-700 disabled:opacity-60 text-white font-medium rounded-md"
        >
          {saving ? "Saving..." : "Save Settings"}
        </button>
      </div>
    </form>
  );
}
