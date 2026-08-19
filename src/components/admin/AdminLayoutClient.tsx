"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ReactNode, useEffect, useState } from "react";
import { useAdminAuth } from "./AdminAuthProvider";

const navItems = [
  { href: "/admin", label: "Dashboard", icon: "◼", group: "Overview" },
  { href: "/admin/hero", label: "Home Hero Slider", icon: "🖼️", group: "Content" },
  { href: "/admin/products", label: "Products", icon: "⬢", group: "Content" },
  { href: "/admin/pages", label: "Pages", icon: "▤", group: "Content" },
  { href: "/admin/media", label: "Media Library", icon: "▣", group: "Content" },
  { href: "/admin/technical", label: "Technical", icon: "✦", group: "Content" },
  { href: "/admin/enquiries", label: "Enquiries", icon: "✉", group: "Engagement", badge: "unread" },
  { href: "/admin/settings", label: "Site Settings", icon: "⚙", group: "System" },
];

const groupLabels: Record<string, string> = {
  Overview: "",
  Content: "Content",
  Engagement: "Engagement",
  System: "System",
};

export default function AdminLayoutClient({ children }: { children: ReactNode }) {
  const { user, loading, logout } = useAdminAuth();
  const pathname = usePathname();
  const router = useRouter();
  const isLoginPage = pathname?.startsWith("/admin/login");
  const [logoDarkUrl, setLogoDarkUrl] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [sidebarState, setSidebarState] = useState<{ open: boolean; pathname: string }>({
    open: false,
    pathname: "",
  });
  const [unreadCount, setUnreadCount] = useState(0);
  const [prevPathname, setPrevPathname] = useState<string>(pathname || "");

  if (prevPathname !== pathname) {
    setPrevPathname(pathname || "");
    if (sidebarState.open) {
      setSidebarState({ open: false, pathname: pathname || "" });
    }
  }

  const sidebarOpen = sidebarState.open && sidebarState.pathname === pathname;

  useEffect(() => {
    if (!loading && !isLoginPage) {
      fetch("/api/admin/settings")
        .then((r) => r.json())
        .then((d) => {
          setLogoDarkUrl(d.settings?.logoDarkUrl || "");
          setLogoUrl(d.settings?.logoUrl || "");
        })
        .catch(() => {});

      fetch("/api/admin/enquiries")
        .then((r) => r.json())
        .then((d) => setUnreadCount(d.unreadCount || 0))
        .catch(() => {});
    }
  }, [loading, isLoginPage]);

  useEffect(() => {
    if (!loading && !user && !isLoginPage) {
      router.replace("/admin/login");
    }
  }, [loading, user, router, isLoginPage]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
          <div className="text-slate-500 text-sm">Loading admin panel...</div>
        </div>
      </div>
    );
  }

  if (!user) {
    if (isLoginPage) {
      return <>{children}</>;
    }
    return null;
  }

  const isActive = (href: string) => {
    if (href === "/admin") return pathname === "/admin";
    return pathname?.startsWith(href);
  };

  const breadcrumb = () => {
    const parts = pathname?.split("/").filter(Boolean) || [];
    if (parts.length <= 1) return [{ label: "Dashboard", href: "/admin" }];
    const items: { label: string; href: string }[] = [];
    let p = "";
    for (const part of parts) {
      p += "/" + part;
      const pretty = part.charAt(0).toUpperCase() + part.slice(1).replace(/[-_]/g, " ");
      items.push({ label: pretty, href: p });
    }
    return items;
  };

  const crumbs = breadcrumb();

  const groupedNav = navItems.reduce((acc, item) => {
    if (!acc[item.group]) acc[item.group] = [];
    acc[item.group].push(item);
    return acc;
  }, {} as Record<string, typeof navItems>);

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarState(s => ({ ...s, open: false }))}
        />
      )}

      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 w-72 bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 text-white flex flex-col shrink-0 transform transition-transform duration-300 ease-out ${
          sidebarOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div className="px-6 py-5 border-b border-slate-800/70 flex items-center justify-between">
          <Link href="/admin" className="block">
            {logoDarkUrl || logoUrl ? (
              <img
                src={logoDarkUrl || logoUrl}
                alt="Admin"
                className="h-10 w-auto object-contain"
              />
            ) : (
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center font-bold text-white shadow-lg shadow-amber-500/20">
                  D
                </div>
                <div>
                  <div className="font-display text-lg tracking-wide leading-tight">DSP</div>
                  <div className="text-[10px] text-slate-400 leading-none mt-0.5">Precision Products</div>
                </div>
              </div>
            )}
            <div className="text-[11px] text-slate-500 mt-2 font-medium uppercase tracking-wider">Admin Console</div>
          </Link>
          <button
            onClick={() => setSidebarState(s => ({ ...s, open: false }))}
            className="lg:hidden p-1.5 rounded-md hover:bg-slate-800 text-slate-400 hover:text-white transition"
            aria-label="Close sidebar"
          >
            ✕
          </button>
        </div>

        <nav className="flex-1 py-4 px-3 overflow-y-auto space-y-5">
          {Object.entries(groupedNav).map(([group, items]) => (
            <div key={group}>
              {groupLabels[group] && (
                <div className="px-3 mb-2 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                  {groupLabels[group]}
                </div>
              )}
              <div className="space-y-1">
                {items.map((item) => {
                  const showBadge = item.badge === "unread" && unreadCount > 0;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group relative overflow-hidden ${
                        isActive(item.href)
                          ? "bg-gradient-to-r from-amber-600 to-amber-500 text-white shadow-lg shadow-amber-600/25"
                          : "text-slate-300 hover:bg-slate-800/60 hover:text-white"
                      }`}
                    >
                      <span
                        className={`w-5 h-5 flex items-center justify-center text-xs rounded transition ${
                          isActive(item.href) ? "bg-white/20" : "bg-slate-800 group-hover:bg-slate-700"
                        }`}
                      >
                        {item.icon}
                      </span>
                      <span className="flex-1">{item.label}</span>
                      {showBadge && (
                        <span className="inline-flex items-center justify-center min-w-[22px] h-[22px] px-1.5 rounded-full bg-red-500 text-white text-[10px] font-bold shadow-lg shadow-red-500/30 animate-pulse">
                          {unreadCount > 99 ? "99+" : unreadCount}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-800/70 space-y-3 bg-gradient-to-b from-slate-900/0 to-slate-950/50">
          <div className="flex items-center gap-3 p-2.5 rounded-lg bg-slate-800/40 hover:bg-slate-800/70 transition">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center text-white font-bold text-sm shrink-0 shadow-md">
              {(user.name || user.username).charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-sm font-medium truncate">{user.name || user.username}</div>
              <div className="text-[11px] text-slate-400 truncate">{user.role === "admin" ? "Administrator" : "Editor"}</div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Link
              href="/"
              target="_blank"
              className="text-center text-xs px-3 py-2 rounded-lg border border-slate-700/60 text-slate-300 hover:bg-slate-800 hover:text-white transition font-medium"
            >
              ↗ View Site
            </Link>
            <button
              onClick={() => logout()}
              className="text-xs px-3 py-2 rounded-lg border border-slate-700/60 text-slate-300 hover:bg-red-600/10 hover:border-red-500/50 hover:text-red-400 transition font-medium"
            >
              Logout
            </button>
          </div>
        </div>
      </aside>

      <main className="flex-1 min-w-0 overflow-auto flex flex-col min-h-screen">
        <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-200/80">
          <div className="flex items-center gap-3 px-4 md:px-8 py-3.5">
            <button
              onClick={() => setSidebarState({ open: true, pathname: pathname || "" })}
              className="lg:hidden p-2 -ml-2 rounded-lg hover:bg-slate-100 text-slate-600 hover:text-slate-900 transition"
              aria-label="Open menu"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            </button>

            <nav className="hidden md:flex items-center gap-1.5 text-xs">
              {crumbs.map((crumb, i) => (
                <div key={crumb.href + i} className="flex items-center gap-1.5">
                  {i > 0 && <span className="text-slate-400">/</span>}
                  <Link
                    href={crumb.href}
                    className={`px-2 py-1 rounded-md transition ${
                      i === crumbs.length - 1
                        ? "text-slate-900 font-semibold bg-slate-100"
                        : "text-slate-500 hover:text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    {crumb.label === "Admin" ? "Dashboard" : crumb.label}
                  </Link>
                </div>
              ))}
            </nav>

            <div className="ml-auto flex items-center gap-2">
              <Link
                href="/admin/enquiries"
                className="relative p-2 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition"
                title="Enquiries"
              >
                ✉
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-red-500 ring-2 ring-white" />
                )}
              </Link>
              <Link
                href="/admin/media"
                className="hidden sm:inline-flex items-center gap-2 px-3 py-2 text-xs font-medium rounded-lg bg-gradient-to-r from-amber-600 to-amber-500 text-white hover:from-amber-700 hover:to-amber-600 shadow-md shadow-amber-500/20 transition"
              >
                ↑ Upload
              </Link>
              <Link
                href="/admin/products/new"
                className="hidden md:inline-flex items-center gap-2 px-3 py-2 text-xs font-medium rounded-lg bg-slate-900 text-white hover:bg-slate-800 transition"
              >
                ＋ New Product
              </Link>
            </div>
          </div>
        </header>

        <div className="flex-1 p-4 md:p-8 max-w-7xl mx-auto w-full">{children}</div>
      </main>
    </div>
  );
}
