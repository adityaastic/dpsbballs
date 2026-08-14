"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import AdminPageHeader, { AdminCard, useToast } from "@/components/admin/AdminUI";

type Stats = {
  products: number;
  enquiries: number;
  unreadEnquiries: number;
  media: number;
  pages: number;
};

export default function AdminDashboardPage() {
  const { ToastContainer, show } = useToast();
  const [stats, setStats] = useState<Stats>({
    products: 0,
    enquiries: 0,
    unreadEnquiries: 0,
    media: 0,
    pages: 0,
  });
  const [loading, setLoading] = useState(true);
  const [recentEnquiries, setRecentEnquiries] = useState<any[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const [pRes, eRes, mRes, pgRes] = await Promise.all([
          fetch("/api/admin/products"),
          fetch("/api/admin/enquiries"),
          fetch("/api/admin/media"),
          fetch("/api/admin/pages"),
        ]);

        const pData = await pRes.json();
        const eData = await eRes.json();
        const mData = await mRes.json();
        const pgData = await pgRes.json();

        setStats({
          products: pData.products?.length || 0,
          enquiries: eData.total || 0,
          unreadEnquiries: eData.unreadCount || 0,
          media: mData.media?.length || 0,
          pages: pgData.pages?.length || 0,
        });
        setRecentEnquiries((eData.enquiries || []).slice(0, 5));
      } catch (e: any) {
        show("Could not load stats: " + e.message, "error");
      } finally {
        setLoading(false);
      }
    })();
  }, [show]);

  const statCards = [
    { label: "Products", value: stats.products, href: "/admin/products", color: "bg-slate-900" },
    {
      label: "Total Enquiries",
      value: stats.enquiries,
      href: "/admin/enquiries",
      color: "bg-blue-700",
    },
    {
      label: "Unread",
      value: stats.unreadEnquiries,
      href: "/admin/enquiries?unread=true",
      color: "bg-amber-600",
    },
    { label: "Media Files", value: stats.media, href: "/admin/media", color: "bg-emerald-700" },
    { label: "Pages", value: stats.pages, href: "/admin/pages", color: "bg-purple-700" },
  ];

  return (
    <>
      <ToastContainer />
      <AdminPageHeader
        title="Dashboard"
        description="Welcome to the DSP admin panel."
      />

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
        {loading
          ? Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="h-28 bg-slate-200 rounded-lg animate-pulse"
              />
            ))
          : statCards.map((s) => (
              <Link
                key={s.label}
                href={s.href}
                className="block group"
              >
                <AdminCard className="overflow-hidden p-5 transition group-hover:shadow-md">
                  <div className={`w-10 h-10 rounded-md ${s.color} text-white flex items-center justify-center text-sm mb-3`}>
                    {s.label.charAt(0)}
                  </div>
                  <div className="text-3xl font-display font-semibold text-slate-900">
                    {s.value}
                  </div>
                  <div className="text-sm text-slate-500 mt-1">{s.label}</div>
                </AdminCard>
              </Link>
            ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <AdminCard className="p-6">
          <h2 className="font-semibold text-slate-900 mb-4 flex items-center justify-between">
            Recent Enquiries
            <Link
              href="/admin/enquiries"
              className="text-sm font-normal text-amber-600 hover:underline"
            >
              View all →
            </Link>
          </h2>
          {recentEnquiries.length === 0 ? (
            <p className="text-sm text-slate-500">No enquiries yet.</p>
          ) : (
            <ul className="divide-y divide-slate-100">
              {recentEnquiries.map((e) => (
                <li
                  key={e._id}
                  className={`py-3 flex items-start justify-between gap-3 ${
                    !e.read ? "bg-amber-50/60 -mx-2 px-2 rounded" : ""
                  }`}
                >
                  <div className="min-w-0">
                    <div className="text-sm font-medium text-slate-900 truncate">
                      {e.name}
                      {!e.read && (
                        <span className="ml-2 text-xs bg-amber-500 text-white px-2 py-0.5 rounded-full">
                          NEW
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-slate-500 truncate">
                      {e.email} · {e.subject || e.type}
                    </div>
                  </div>
                  <div className="text-xs text-slate-400 shrink-0">
                    {new Date(e.createdAt).toLocaleDateString()}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </AdminCard>

        <AdminCard className="p-6">
          <h2 className="font-semibold text-slate-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-3">
            <Link
              href="/admin/products/new"
              className="p-4 border border-slate-200 rounded-md hover:bg-slate-50 transition"
            >
              <div className="text-2xl mb-1">＋</div>
              <div className="font-medium text-sm">Add Product</div>
            </Link>
            <Link
              href="/admin/media"
              className="p-4 border border-slate-200 rounded-md hover:bg-slate-50 transition"
            >
              <div className="text-2xl mb-1">↑</div>
              <div className="font-medium text-sm">Upload Media</div>
            </Link>
            <Link
              href="/admin/settings"
              className="p-4 border border-slate-200 rounded-md hover:bg-slate-50 transition"
            >
              <div className="text-2xl mb-1">⚙</div>
              <div className="font-medium text-sm">Site Settings</div>
            </Link>
            <Link
              href="/admin/pages"
              className="p-4 border border-slate-200 rounded-md hover:bg-slate-50 transition"
            >
              <div className="text-2xl mb-1">▤</div>
              <div className="font-medium text-sm">Edit Pages</div>
            </Link>
          </div>

          <div className="mt-6 pt-6 border-t border-slate-100">
            <h3 className="font-medium text-slate-900 mb-2">Database Setup</h3>
            <p className="text-xs text-slate-500 mb-3">
              If products and content are empty, seed the database first:
            </p>
            <a
              href="/api/seed"
              target="_blank"
              className="inline-block text-xs px-3 py-2 rounded border border-slate-300 hover:bg-slate-50"
            >
              Run /api/seed ↗
            </a>
          </div>
        </AdminCard>
      </div>
    </>
  );
}
