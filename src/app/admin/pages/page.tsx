"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import AdminPageHeader, {
  AdminCard,
  Field,
  inputClass,
  useConfirmDelete,
  useToast,
} from "@/components/admin/AdminUI";

export default function AdminPagesList() {
  const [pages, setPages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { show, ToastContainer } = useToast();
  const { confirm, Dialog } = useConfirmDelete();

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/pages");
      const data = await res.json();
      setPages(data.pages || []);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    load();
  }, []);

  const onDelete = (id: string, slug: string) => {
    confirm(`Delete page "${slug}"?`, async () => {
      try {
        const res = await fetch(`/api/admin/pages/${id}`, { method: "DELETE" });
        if (!res.ok) throw new Error("Failed");
        setPages((p) => p.filter((x) => x._id !== id));
        show("Page deleted", "success");
      } catch (e: any) {
        show(e.message, "error");
      }
    });
  };

  return (
    <>
      <ToastContainer />
      <Dialog />
      <AdminPageHeader
        title="Pages"
        description="Edit page hero content, sections and content blocks."
      />
      <AdminCard className="overflow-hidden">
        {loading ? (
          <div className="p-8 text-slate-500">Loading...</div>
        ) : pages.length === 0 ? (
          <div className="p-12 text-center text-slate-500">No pages</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-6 py-3 text-left">Slug</th>
                <th className="px-6 py-3 text-left">Title</th>
                <th className="px-6 py-3 text-left">Updated</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {pages.map((p) => (
                <tr key={p._id} className="hover:bg-slate-50/50">
                  <td className="px-6 py-4 font-mono text-xs">{p.slug}</td>
                  <td className="px-6 py-4 font-medium text-slate-900">{p.title}</td>
                  <td className="px-6 py-4 text-xs text-slate-500">
                    {new Date(p.updatedAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-right whitespace-nowrap">
                    <Link
                      href={`/${p.slug}`}
                      target="_blank"
                      className="px-2 py-1 text-xs text-slate-600 hover:text-slate-900"
                    >
                      View
                    </Link>
                    <Link
                      href={`/admin/pages/${p._id}`}
                      className="px-2 py-1 text-xs text-amber-700 hover:underline"
                    >
                      Edit
                    </Link>
                    <button
                      onClick={() => onDelete(p._id, p.slug)}
                      className="px-2 py-1 text-xs text-red-600 hover:underline"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </AdminCard>
    </>
  );
}
