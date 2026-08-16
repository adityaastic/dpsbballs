"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import AdminPageHeader, {
  AdminCard,
  StatCard,
  AdminButton,
  Badge,
  useToast,
} from "@/components/admin/AdminUI";

type Stats = {
  products: number;
  enquiries: number;
  unreadEnquiries: number;
  media: number;
  pages: number;
};

const quickActions = [
  {
    label: "Add Product",
    desc: "Create a new product",
    href: "/admin/products/new",
    icon: "＋",
    gradient: "from-slate-900 to-slate-700",
    iconBg: "bg-white/15",
  },
  {
    label: "Upload Media",
    desc: "Images & documents",
    href: "/admin/media",
    icon: "↑",
    gradient: "from-amber-600 to-amber-500",
    iconBg: "bg-white/15",
  },
  {
    label: "View Enquiries",
    desc: "Customer messages",
    href: "/admin/enquiries",
    icon: "✉",
    gradient: "from-blue-600 to-blue-500",
    iconBg: "bg-white/15",
  },
  {
    label: "Site Settings",
    desc: "Branding & config",
    href: "/admin/settings",
    icon: "⚙",
    gradient: "from-emerald-600 to-emerald-500",
    iconBg: "bg-white/15",
  },
  {
    label: "Edit Pages",
    desc: "Content & SEO",
    href: "/admin/pages",
    icon: "▤",
    gradient: "from-purple-600 to-purple-500",
    iconBg: "bg-white/15",
  },
  {
    label: "Technical Data",
    desc: "Materials & specs",
    href: "/admin/technical",
    icon: "✦",
    gradient: "from-rose-600 to-rose-500",
    iconBg: "bg-white/15",
  },
];

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
  const [recentProducts, setRecentProducts] = useState<any[]>([]);
  const [greeting, setGreeting] = useState("Welcome back");

  useEffect(() => {
    const h = new Date().getHours();
    if (h < 12) setGreeting("Good morning");
    else if (h < 17) setGreeting("Good afternoon");
    else if (h < 21) setGreeting("Good evening");
    else setGreeting("Welcome back");
  }, []);

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
        setRecentProducts((pData.products || []).slice(0, 4));
      } catch (e: any) {
        show("Could not load stats: " + e.message, "error");
      } finally {
        setLoading(false);
      }
    })();
  }, [show]);

  const Skeleton = () => (
    <div className="h-28 md:h-32 bg-slate-100 rounded-xl animate-pulse" />
  );

  return (
    <>
      <ToastContainer />

      <AdminPageHeader
        title={
          <span className="flex items-center gap-3">
            {greeting}, 👋
          </span>
        }
        description="Here's what's happening with DSP Precision today. Manage products, enquiries, and site content from one place."
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-6 md:mb-8">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} />)
        ) : (
          <>
            <StatCard
              label="Products"
              value={stats.products}
              icon="⬢"
              href="/admin/products"
              accent="bg-slate-900 text-white"
              trend="Live"
              trendUp
              delay={0}
            />
            <StatCard
              label="Total Enquiries"
              value={stats.enquiries}
              icon="✉"
              href="/admin/enquiries"
              accent="bg-blue-500 text-white"
              trend="All time"
              trendUp
              delay={50}
            />
            <StatCard
              label="Unread Messages"
              value={stats.unreadEnquiries}
              icon="●"
              href="/admin/enquiries?unread=true"
              accent={
                stats.unreadEnquiries > 0
                  ? "bg-red-500 text-white"
                  : "bg-slate-100 text-slate-500"
              }
              trend={stats.unreadEnquiries > 0 ? "Needs attention" : "All read"}
              trendUp={stats.unreadEnquiries === 0}
              delay={100}
            />
            <StatCard
              label="Media Files"
              value={stats.media}
              icon="▣"
              href="/admin/media"
              accent="bg-emerald-500 text-white"
              trend="In library"
              trendUp
              delay={150}
            />
          </>
        )}
      </div>

      <div className="grid lg:grid-cols-3 gap-4 md:gap-6">
        <div className="lg:col-span-2 space-y-4 md:space-y-6">
          <AdminCard className="p-5 md:p-6">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="font-semibold text-slate-900 tracking-tight text-lg">
                  Quick Actions
                </h2>
                <p className="mt-1 text-xs text-slate-500">
                  Jump straight into content management
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 md:gap-3.5">
              {quickActions.map((a, i) => (
                <Link
                  key={a.href}
                  href={a.href}
                  className="group relative block rounded-xl overflow-hidden focus:outline-none focus:ring-2 focus:ring-amber-500"
                  style={{ animationDelay: `${i * 60}ms` }}
                >
                  <div
                    className={`absolute inset-0 bg-gradient-to-br ${a.gradient} opacity-100 transition-opacity group-hover:opacity-90`}
                  />
                  <div className="relative p-4 md:p-5 text-white h-full flex flex-col min-h-[104px]">
                    <div
                      className={`inline-flex items-center justify-center w-9 h-9 rounded-lg ${a.iconBg} shrink-0 mb-3 group-hover:scale-110 transition-transform`}
                    >
                      <span className="text-lg">{a.icon}</span>
                    </div>
                    <div className="mt-auto">
                      <div className="font-semibold text-sm leading-tight">
                        {a.label}
                      </div>
                      <div className="text-[11px] opacity-80 mt-0.5 leading-tight">
                        {a.desc}
                      </div>
                    </div>
                    <div className="absolute top-3.5 right-3.5 w-1.5 h-1.5 rounded-full bg-white/40 group-hover:bg-white transition-colors" />
                  </div>
                </Link>
              ))}
            </div>
          </AdminCard>

          <AdminCard className="overflow-hidden">
            <div className="p-5 md:p-6 border-b border-slate-100 flex items-center justify-between gap-4 flex-wrap">
              <div>
                <h2 className="font-semibold text-slate-900 tracking-tight text-lg flex items-center gap-2">
                  Recent Enquiries
                  {stats.unreadEnquiries > 0 && (
                    <Badge variant="danger">{stats.unreadEnquiries} new</Badge>
                  )}
                </h2>
                <p className="mt-1 text-xs text-slate-500">
                  Latest customer messages and product enquiries
                </p>
              </div>
              <Link
                href="/admin/enquiries"
                className="text-xs font-semibold text-amber-600 hover:text-amber-700 transition hover:underline"
              >
                View all enquiries →
              </Link>
            </div>
            {loading ? (
              <div className="p-8 space-y-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="h-12 bg-slate-100 rounded-lg animate-pulse" />
                ))}
              </div>
            ) : recentEnquiries.length === 0 ? (
              <div className="p-10 md:p-14 text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-slate-100 text-slate-400 text-3xl mb-4">
                  ✉
                </div>
                <div className="text-slate-700 font-medium">No enquiries yet</div>
                <p className="text-sm text-slate-500 mt-1.5 max-w-xs mx-auto">
                  New customer enquiries will appear here. Check back soon!
                </p>
              </div>
            ) : (
              <ul className="divide-y divide-slate-100">
                {recentEnquiries.map((e, idx) => (
                  <li
                    key={e._id}
                    className={`group transition ${
                      !e.read ? "bg-amber-50/40" : "hover:bg-slate-50/50"
                    }`}
                    style={{ animationDelay: `${idx * 40}ms` }}
                  >
                    <Link
                      href={`/admin/enquiries/${e._id}`}
                      className="flex items-start gap-3 md:gap-4 p-4 md:px-6 md:py-4"
                    >
                      <div className="shrink-0 mt-0.5">
                        <div
                          className={`w-9 h-9 md:w-10 md:h-10 rounded-full flex items-center justify-center text-white text-xs md:text-sm font-bold ${
                            !e.read
                              ? "bg-gradient-to-br from-amber-500 to-amber-600 shadow-md shadow-amber-500/20"
                              : "bg-slate-200 text-slate-600"
                          }`}
                        >
                          {(e.name || "?").charAt(0).toUpperCase()}
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <div className="text-sm font-semibold text-slate-900 truncate">
                            {e.name || "Unknown"}
                          </div>
                          {!e.read && (
                            <Badge variant="warning">NEW</Badge>
                          )}
                          <Badge
                            variant={
                              e.type === "career"
                                ? "info"
                                : e.type === "buyer"
                                ? "success"
                                : "default"
                            }
                          >
                            {(e.type || "general").charAt(0).toUpperCase() +
                              (e.type || "general").slice(1)}
                          </Badge>
                        </div>
                        <div className="mt-0.5 text-xs text-slate-500 truncate">
                          {e.email}
                          {e.subject && <> · {e.subject}</>}
                          {e.product && <> · Product enquiry</>}
                        </div>
                        {e.message && (
                          <div className="mt-2 text-xs text-slate-600 line-clamp-2 leading-relaxed">
                            {String(e.message).slice(0, 160)}
                            {String(e.message).length > 160 && "…"}
                          </div>
                        )}
                      </div>
                      <div className="shrink-0 text-right">
                        <div className="text-[11px] font-medium text-slate-400">
                          {new Date(e.createdAt).toLocaleDateString(undefined, {
                            month: "short",
                            day: "numeric",
                          })}
                        </div>
                        <div className="text-[10px] text-slate-300 mt-0.5">
                          {new Date(e.createdAt).toLocaleTimeString(undefined, {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </div>
                        <div className="mt-2 opacity-0 group-hover:opacity-100 transition">
                          <span className="text-[11px] font-semibold text-amber-600">
                            Open →
                          </span>
                        </div>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </AdminCard>
        </div>

        <div className="space-y-4 md:space-y-6">
          <AdminCard className="p-5 md:p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-slate-900 tracking-tight text-lg">
                Setup Status
              </h2>
            </div>
            <div className="space-y-3.5">
              {[
                {
                  label: "Products added",
                  done: stats.products > 0,
                  count: `${stats.products}`,
                  href: "/admin/products/new",
                  cta: "Add product",
                },
                {
                  label: "Media uploaded",
                  done: stats.media > 0,
                  count: `${stats.media}`,
                  href: "/admin/media",
                  cta: "Upload",
                },
                {
                  label: "Pages configured",
                  done: stats.pages > 0,
                  count: `${stats.pages}`,
                  href: "/admin/pages",
                  cta: "Setup",
                },
              ].map((item, i) => (
                <div
                  key={item.label}
                  className="flex items-center gap-3 p-3 rounded-xl bg-slate-50/60 hover:bg-slate-50 transition"
                >
                  <div
                    className={`w-8 h-8 rounded-lg shrink-0 flex items-center justify-center text-sm font-bold transition ${
                      item.done
                        ? "bg-emerald-500 text-white shadow-sm shadow-emerald-500/20"
                        : "bg-slate-200 text-slate-500"
                    }`}
                  >
                    {item.done ? "✓" : i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs md:text-sm font-medium text-slate-800">
                      {item.label}
                    </div>
                    <div className="text-[11px] text-slate-500">
                      {item.count} items
                    </div>
                  </div>
                  <Link
                    href={item.href}
                    className="text-[11px] md:text-xs font-semibold text-amber-600 hover:text-amber-700 shrink-0"
                  >
                    {item.done ? "Manage" : item.cta}
                  </Link>
                </div>
              ))}
            </div>
          </AdminCard>

          <AdminCard className="overflow-hidden">
            <div className="p-5 md:p-6 border-b border-slate-100 flex items-center justify-between gap-3">
              <div>
                <h2 className="font-semibold text-slate-900 tracking-tight text-lg">
                  Recent Products
                </h2>
                <p className="mt-1 text-xs text-slate-500">
                  Your product catalogue
                </p>
              </div>
              <Link
                href="/admin/products"
                className="text-xs font-semibold text-amber-600 hover:text-amber-700 transition hover:underline shrink-0"
              >
                All →
              </Link>
            </div>
            {loading ? (
              <div className="p-4 space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="h-14 bg-slate-100 rounded-lg animate-pulse" />
                ))}
              </div>
            ) : recentProducts.length === 0 ? (
              <div className="p-8 text-center">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-slate-100 text-slate-400 text-2xl mb-3">
                  ⬢
                </div>
                <div className="text-slate-700 font-medium text-sm">
                  No products yet
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Start building your catalogue
                </p>
                <Link href="/admin/products/new">
                  <AdminButton variant="accent" size="sm" className="mt-4">
                    ＋ Add First Product
                  </AdminButton>
                </Link>
              </div>
            ) : (
              <ul className="divide-y divide-slate-100">
                {recentProducts.map((p) => (
                  <li
                    key={p._id}
                    className="flex items-center gap-3 p-4 hover:bg-slate-50/50 transition"
                  >
                    <div
                      className={`w-11 h-11 rounded-lg shrink-0 flex items-center justify-center overflow-hidden border border-slate-100 ${
                        p.imageUrl ? "bg-slate-50" : "bg-gradient-to-br from-slate-50 to-slate-100"
                      }`}
                    >
                      {p.imageUrl ? (
                        // eslint-disable-next-line
                        <img
                          src={p.imageUrl}
                          alt={p.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-slate-400 text-lg">⬢</span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold text-slate-900 truncate">
                        {p.title}
                      </div>
                      <div className="mt-0.5 flex items-center gap-2">
                        <Badge
                          variant={p.published ? "success" : "warning"}
                        >
                          {p.published ? "Live" : "Draft"}
                        </Badge>
                        {p.order !== undefined && (
                          <span className="text-[10px] text-slate-400 font-medium">
                            #{p.order}
                          </span>
                        )}
                      </div>
                    </div>
                    <Link
                      href={`/admin/products/${p._id}`}
                      className="shrink-0 p-2 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition"
                      title="Edit"
                    >
                      ✎
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </AdminCard>

          <AdminCard className="overflow-hidden bg-gradient-to-br from-slate-900 to-slate-800 text-white border-slate-800">
            <div className="p-5 md:p-6">
              <div className="flex items-center gap-2.5 mb-2">
                <div className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center text-sm">
                  ⚡
                </div>
                <h3 className="font-semibold tracking-tight">
                  Need help setting up?
                </h3>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed mb-4">
                Seed the database with default content if this is a fresh installation.
                Creates products, pages, and settings in one click.
              </p>
              <div className="flex flex-wrap gap-2">
                <a
                  href="/api/seed"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg bg-white text-slate-900 hover:bg-slate-100 transition shadow-sm"
                >
                  🌱 Seed Database ↗
                </a>
                <Link
                  href="/admin/settings"
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg bg-white/10 text-white hover:bg-white/15 border border-white/10 transition"
                >
                  Site Settings
                </Link>
              </div>
            </div>
          </AdminCard>
        </div>
      </div>
    </>
  );
}
