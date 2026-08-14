"use client";

import { useEffect, useRef, useState } from "react";
import AdminPageHeader, {
  AdminCard,
  useConfirmDelete,
  useToast,
} from "@/components/admin/AdminUI";

export default function AdminMediaPage() {
  const [media, setMedia] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [filter, setFilter] = useState<"all" | "images" | "docs">("all");
  const fileInput = useRef<HTMLInputElement>(null);
  const { show, ToastContainer } = useToast();
  const { confirm, Dialog } = useConfirmDelete();

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/media");
      const json = await res.json();
      setMedia(json.media || []);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    load();
  }, []);

  const onUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploading(true);
    try {
      const form = new FormData();
      Array.from(files).forEach((f) => form.append("files", f));
      const res = await fetch("/api/admin/media", {
        method: "POST",
        body: form,
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Upload failed");
      setMedia((prev) => [...(json.media || []), ...prev]);
      show(`Uploaded ${json.media?.length || 0} file(s)`, "success");
    } catch (e: any) {
      show(e.message, "error");
    } finally {
      setUploading(false);
      if (fileInput.current) fileInput.current.value = "";
    }
  };

  const onDelete = (m: any) => {
    confirm(`Delete file "${m.originalName || m.filename}"?`, async () => {
      try {
        const res = await fetch(`/api/admin/media/${m._id}`, { method: "DELETE" });
        if (!res.ok) throw new Error("Failed");
        setMedia((prev) => prev.filter((x) => x._id !== m._id));
        show("File deleted", "success");
      } catch (e: any) {
        show(e.message, "error");
      }
    });
  };

  const copyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    show("URL copied to clipboard", "success");
  };

  const filtered = media.filter((m) => {
    if (filter === "all") return true;
    if (filter === "images") return m.mimeType?.startsWith("image/");
    if (filter === "docs") return !m.mimeType?.startsWith("image/");
    return true;
  });

  const isImage = (m: any) => m.mimeType?.startsWith("image/");

  const formatSize = (b: number) => {
    if (!b) return "";
    if (b < 1024) return `${b} B`;
    if (b < 1024 * 1024) return `${(b / 1024).toFixed(0)} KB`;
    return `${(b / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <>
      <ToastContainer />
      <Dialog />
      <AdminPageHeader
        title="Media Library"
        description={`${media.length} files uploaded`}
        actions={
          <>
            <input
              ref={fileInput}
              type="file"
              multiple
              className="hidden"
              onChange={(e) => onUpload(e.target.files)}
              accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.csv,.txt"
            />
            <button
              onClick={() => fileInput.current?.click()}
              disabled={uploading}
              className="inline-flex items-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-700 disabled:opacity-60 text-white text-sm rounded-md"
            >
              <span>↑</span>
              {uploading ? "Uploading..." : "Upload Files"}
            </button>
          </>
        }
      />

      <div className="mb-4 flex flex-wrap gap-2">
        {[
          { key: "all", label: `All (${media.length})` },
          {
            key: "images",
            label: `Images (${media.filter(isImage).length})`,
          },
          {
            key: "docs",
            label: `Documents (${media.filter((m) => !isImage(m)).length})`,
          },
        ].map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key as typeof filter)}
            className={`px-3 py-1.5 text-sm rounded-full border transition ${
              filter === f.key
                ? "bg-amber-600 text-white border-amber-600"
                : "border-slate-300 text-slate-600 hover:bg-slate-50"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="bg-white border border-slate-200 rounded-lg p-8 text-center text-slate-500">
          Loading media library...
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-lg p-16 text-center">
          <div className="text-5xl mb-4 opacity-30">▣</div>
          <div className="text-slate-600 mb-2">No files yet</div>
          <div className="text-sm text-slate-400">
            Upload images, PDFs and other files to use across the site.
          </div>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {filtered.map((m) => (
            <AdminCard key={m._id} className="overflow-hidden">
              <div className="aspect-square bg-slate-100 flex items-center justify-center relative overflow-hidden">
                {isImage(m) ? (
                  // eslint-disable-next-line
                  <img
                    src={m.url}
                    alt={m.alt || m.originalName}
                    className="w-full h-full object-contain p-2"
                  />
                ) : (
                  <div className="text-center p-4">
                    <div className="text-4xl opacity-40 mb-2">📄</div>
                    <div className="text-xs text-slate-500 font-mono truncate px-2">
                      {(m.originalName || m.filename).split(".").pop()?.toUpperCase()}
                    </div>
                  </div>
                )}
              </div>
              <div className="p-3 space-y-2">
                <div className="text-sm font-medium text-slate-900 truncate">
                  {m.originalName || m.filename}
                </div>
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span>{formatSize(m.size)}</span>
                  <span>{new Date(m.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="pt-2 border-t border-slate-100 flex gap-2">
                  <button
                    onClick={() => copyUrl(m.url)}
                    className="flex-1 text-xs py-1.5 border border-slate-300 rounded hover:bg-slate-50"
                  >
                    Copy URL
                  </button>
                  <a
                    href={m.url}
                    target="_blank"
                    className="flex-1 text-xs py-1.5 border border-slate-300 rounded hover:bg-slate-50 text-center"
                  >
                    Open
                  </a>
                  <button
                    onClick={() => onDelete(m)}
                    className="text-xs py-1.5 px-2 text-red-600 border border-red-200 rounded hover:bg-red-50"
                  >
                    ✕
                  </button>
                </div>
              </div>
            </AdminCard>
          ))}
        </div>
      )}
    </>
  );
}
