"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
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
  const [showNewModal, setShowNewModal] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newSlug, setNewSlug] = useState("");
  const [creating, setCreating] = useState(false);
  const router = useRouter();
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

  const handleCreatePage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newSlug.trim()) {
      show("Title and slug are required", "error");
      return;
    }
    setCreating(true);
    try {
      const slugClean = newSlug
        .toLowerCase()
        .replace(/[^a-z0-9-_]/g, "-")
        .replace(/-+/g, "-");

      const res = await fetch("/api/admin/pages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newTitle,
          slug: slugClean,
          heroEyebrow: newTitle,
          heroTitle: newTitle,
          heroDescription: `Content and information about ${newTitle}`,
          sections: [
            {
              key: "section_1",
              heading: "Overview",
              subheading: "Details",
              body: "Add your content details here...",
              order: 0,
            },
          ],
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create page");

      show("Page created successfully!", "success");
      setShowNewModal(false);
      setNewTitle("");
      setNewSlug("");
      router.push(`/admin/pages/${data.page._id || data.page.id}`);
    } catch (err: any) {
      show(err.message, "error");
    } finally {
      setCreating(false);
    }
  };

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
        title="Pages & Sections Manager"
        description="Control and edit every section, photo, video, and content across all website pages."
        actions={
          <button
            onClick={() => setShowNewModal(true)}
            className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-sm font-semibold rounded-md shadow-sm flex items-center gap-1.5"
          >
            <span>+</span> Add New Page
          </button>
        }
      />

      {/* CREATE MODAL */}
      {showNewModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-semibold text-slate-900 text-lg">Create New Page</h3>
              <button
                onClick={() => setShowNewModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleCreatePage} className="space-y-4">
              <Field label="Page Title">
                <input
                  className={inputClass()}
                  value={newTitle}
                  onChange={(e) => {
                    setNewTitle(e.target.value);
                    if (!newSlug) {
                      setNewSlug(
                        e.target.value
                          .toLowerCase()
                          .replace(/[^a-z0-9]/g, "-")
                          .replace(/-+/g, "-")
                      );
                    }
                  }}
                  placeholder="e.g. Infrastructure & Machinery"
                  required
                />
              </Field>

              <Field label="URL Slug">
                <div className="flex items-center">
                  <span className="text-xs text-slate-500 bg-slate-100 px-3 py-2.5 border border-r-0 border-slate-300 rounded-l-md font-mono">
                    /
                  </span>
                  <input
                    className={`${inputClass()} rounded-l-none font-mono text-xs`}
                    value={newSlug}
                    onChange={(e) => setNewSlug(e.target.value)}
                    placeholder="infrastructure"
                    required
                  />
                </div>
              </Field>

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowNewModal(false)}
                  className="px-4 py-2 border border-slate-300 rounded text-sm text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded text-sm font-semibold disabled:opacity-60"
                >
                  {creating ? "Creating..." : "Create & Edit"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <AdminCard className="overflow-hidden">
        {loading ? (
          <div className="p-8 text-slate-500 text-center">Loading website pages...</div>
        ) : pages.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            No pages found. Click &quot;Add New Page&quot; to create one.
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-6 py-3 text-left">Page Title</th>
                <th className="px-6 py-3 text-left">Slug / Route</th>
                <th className="px-6 py-3 text-left">Sections</th>
                <th className="px-6 py-3 text-left">Last Updated</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {pages.map((p) => {
                const liveUrl = p.slug === "home" ? "/" : `/${p.slug}`;
                const sectionCount = Array.isArray(p.sections) ? p.sections.length : 0;
                return (
                  <tr key={p._id} className="hover:bg-slate-50/50">
                    <td className="px-6 py-4 font-semibold text-slate-900">
                      {p.title}
                    </td>
                    <td className="px-6 py-4 font-mono text-xs text-amber-700">
                      {liveUrl}
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-600">
                      <span className="bg-slate-100 px-2.5 py-1 rounded-full font-medium">
                        {sectionCount} section{sectionCount === 1 ? "" : "s"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-500">
                      {p.updatedAt ? new Date(p.updatedAt).toLocaleDateString() : "Just now"}
                    </td>
                    <td className="px-6 py-4 text-right whitespace-nowrap space-x-2">
                      <Link
                        href={liveUrl}
                        target="_blank"
                        className="px-2.5 py-1 text-xs text-slate-600 hover:text-slate-900 border border-slate-200 rounded hover:bg-slate-50"
                      >
                        View Live ↗
                      </Link>
                      <Link
                        href={`/admin/pages/${p._id}`}
                        className="px-3 py-1 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-700 rounded shadow-xs"
                      >
                        Edit Sections
                      </Link>
                      {p.slug !== "home" && p.slug !== "about" && (
                        <button
                          onClick={() => onDelete(p._id, p.slug)}
                          className="px-2 py-1 text-xs text-red-600 hover:underline"
                        >
                          Delete
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </AdminCard>
    </>
  );
}
