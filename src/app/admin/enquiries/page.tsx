"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import AdminPageHeader, {
  AdminCard,
  useConfirmDelete,
  useToast,
} from "@/components/admin/AdminUI";

export default function AdminEnquiriesPage() {
  const [enquiries, setEnquiries] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "unread" | "contact" | "buyer" | "career">("all");
  const [selected, setSelected] = useState<any | null>(null);
  const { show, ToastContainer } = useToast();
  const { confirm, Dialog } = useConfirmDelete();

  const load = async () => {
    setLoading(true);
    try {
      const url =
        filter === "unread"
          ? "/api/admin/enquiries?unread=true"
          : filter === "contact" || filter === "buyer" || filter === "career"
          ? `/api/admin/enquiries?type=${filter === "buyer" ? "buyer-new" : filter}`
          : "/api/admin/enquiries";
      const res = await fetch(url);
      const data = await res.json();
      setEnquiries(data.enquiries || []);
      setUnreadCount(data.unreadCount || 0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [filter]);

  const open = async (e: any) => {
    try {
      const res = await fetch(`/api/admin/enquiries/${e._id}`);
      const json = await res.json();
      if (res.ok && json.enquiry) {
        setSelected(json.enquiry);
        setEnquiries((prev) =>
          prev.map((x) => (x._id === e._id ? { ...x, read: true } : x))
        );
        if (!e.read) setUnreadCount((c) => Math.max(0, c - 1));
      }
    } catch (err) {}
  };

  const markAllRead = async () => {
    try {
      const ids = enquiries.filter((e) => !e.read).map((e) => e._id);
      await Promise.all(
        ids.map((id) =>
          fetch(`/api/admin/enquiries/${id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ read: true }),
          })
        )
      );
      setEnquiries((prev) => prev.map((x) => ({ ...x, read: true })));
      setUnreadCount(0);
      show("All marked as read", "success");
    } catch (e: any) {
      show(e.message, "error");
    }
  };

  const onDelete = (id: string) => {
    confirm("Delete this enquiry? This cannot be undone.", async () => {
      try {
        const res = await fetch(`/api/admin/enquiries/${id}`, { method: "DELETE" });
        if (!res.ok) throw new Error("Failed");
        setEnquiries((prev) => prev.filter((x) => x._id !== id));
        if (selected?._id === id) setSelected(null);
        show("Deleted", "success");
      } catch (e: any) {
        show(e.message, "error");
      }
    });
  };

  const filterOptions: { key: typeof filter; label: string }[] = [
    { key: "all", label: `All (${enquiries.length})` },
    { key: "unread", label: `Unread (${unreadCount})` },
    { key: "contact", label: "Contact" },
    { key: "buyer", label: "Buyer forms" },
    { key: "career", label: "Career" },
  ];

  return (
    <>
      <ToastContainer />
      <Dialog />
      <AdminPageHeader
        title="Enquiries"
        description={`${unreadCount} unread · ${enquiries.length} shown`}
        actions={
          <>
            {unreadCount > 0 && (
              <button
                onClick={markAllRead}
                className="px-4 py-2 text-sm border border-slate-300 rounded-md hover:bg-slate-50"
              >
                Mark all read
              </button>
            )}
          </>
        }
      />

      <div className="mb-4 flex flex-wrap gap-2">
        {filterOptions.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
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

      <div className="grid lg:grid-cols-[360px_1fr] gap-5">
        <AdminCard className="overflow-hidden max-h-[calc(100vh-280px)] overflow-auto">
          {loading ? (
            <div className="p-5 text-sm text-slate-500">Loading...</div>
          ) : enquiries.length === 0 ? (
            <div className="p-12 text-center text-sm text-slate-500">
              No enquiries in this view.
            </div>
          ) : (
            <ul className="divide-y divide-slate-100">
              {enquiries.map((e) => (
                <li
                  key={e._id}
                  onClick={() => open(e)}
                  className={`p-4 cursor-pointer hover:bg-slate-50 ${
                    selected?._id === e._id ? "bg-amber-50" : ""
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        {!e.read && (
                          <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0" />
                        )}
                        <span className="font-medium text-sm text-slate-900 truncate">
                          {e.name}
                        </span>
                      </div>
                      <div className="text-xs text-slate-500 truncate mt-1">
                        {e.email}
                      </div>
                      <div className="text-xs text-slate-400 truncate mt-1">
                        {e.subject || e.type} · {new Date(e.createdAt).toLocaleString()}
                      </div>
                    </div>
                    <span className="text-[10px] uppercase tracking-wide text-slate-500 border border-slate-200 rounded px-1.5 py-0.5">
                      {e.type}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </AdminCard>

        <AdminCard className="p-6 min-h-[300px]">
          {!selected ? (
            <div className="h-full flex flex-col items-center justify-center text-center text-slate-500 p-10">
              <div className="text-4xl mb-3 opacity-40">✉</div>
              <div>Select an enquiry to view details</div>
            </div>
          ) : (
            <div className="space-y-5">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <h2 className="text-xl font-semibold text-slate-900">
                      {selected.name}
                    </h2>
                    <span className="text-xs uppercase tracking-wide text-slate-500 border border-slate-200 rounded px-2 py-0.5">
                      {selected.type}
                    </span>
                    {selected.read ? (
                      <span className="text-[10px] uppercase text-slate-400">Read</span>
                    ) : (
                      <span className="text-[10px] uppercase text-amber-600">New</span>
                    )}
                  </div>
                  <div className="text-sm text-slate-500 space-y-0.5">
                    {selected.email && <div>✉ {selected.email}</div>}
                    {selected.phone && <div>☎ {selected.phone}</div>}
                    {selected.company && <div>🏭 {selected.company}</div>}
                    {selected.country && <div>🌍 {selected.country}</div>}
                    <div className="text-xs text-slate-400 mt-2">
                      {new Date(selected.createdAt).toLocaleString()}
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  {selected.email && (
                    <a
                      href={`mailto:${selected.email}`}
                      className="px-3 py-1.5 text-sm border border-slate-300 rounded hover:bg-slate-50"
                    >
                      Reply
                    </a>
                  )}
                  <button
                    onClick={() => onDelete(selected._id)}
                    className="px-3 py-1.5 text-sm text-red-600 border border-red-200 rounded hover:bg-red-50"
                  >
                    Delete
                  </button>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4 text-sm pt-4 border-t border-slate-100">
                {selected.subject && (
                  <div>
                    <div className="text-xs uppercase tracking-wide text-slate-400 mb-1">
                      Subject
                    </div>
                    <div className="text-slate-700">{selected.subject}</div>
                  </div>
                )}
                {selected.productInterest && (
                  <div>
                    <div className="text-xs uppercase tracking-wide text-slate-400 mb-1">
                      Product
                    </div>
                    <div className="text-slate-700">{selected.productInterest}</div>
                  </div>
                )}
                {selected.size && (
                  <div>
                    <div className="text-xs uppercase tracking-wide text-slate-400 mb-1">
                      Size
                    </div>
                    <div className="text-slate-700">{selected.size}</div>
                  </div>
                )}
                {selected.grade && (
                  <div>
                    <div className="text-xs uppercase tracking-wide text-slate-400 mb-1">
                      Grade
                    </div>
                    <div className="text-slate-700">{selected.grade}</div>
                  </div>
                )}
                {selected.quantity && (
                  <div>
                    <div className="text-xs uppercase tracking-wide text-slate-400 mb-1">
                      Quantity
                    </div>
                    <div className="text-slate-700">{selected.quantity}</div>
                  </div>
                )}
                {selected.application && (
                  <div>
                    <div className="text-xs uppercase tracking-wide text-slate-400 mb-1">
                      Application
                    </div>
                    <div className="text-slate-700">{selected.application}</div>
                  </div>
                )}
              </div>

              {(selected.message || "") && (
                <div className="pt-4 border-t border-slate-100">
                  <div className="text-xs uppercase tracking-wide text-slate-400 mb-2">
                    Message
                  </div>
                  <div className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">
                    {selected.message}
                  </div>
                </div>
              )}
            </div>
          )}
        </AdminCard>
      </div>
    </>
  );
}
