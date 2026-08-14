"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ReactNode, useEffect, useState } from "react";
import { useAdminAuth } from "./AdminAuthProvider";

const navItems = [
  { href: "/admin", label: "Dashboard", icon: "◼" },
  { href: "/admin/products", label: "Products", icon: "⬢" },
  { href: "/admin/settings", label: "Site Settings", icon: "⚙" },
  { href: "/admin/technical", label: "Technical", icon: "✦" },
  { href: "/admin/pages", label: "Pages", icon: "▤" },
  { href: "/admin/enquiries", label: "Enquiries", icon: "✉" },
  { href: "/admin/media", label: "Media", icon: "▣" },
];

export default function AdminLayoutClient({ children }: { children: ReactNode }) {
  const { user, loading, logout } = useAdminAuth();
  const pathname = usePathname();
  const router = useRouter();
  const isLoginPage = pathname?.startsWith("/admin/login");
  const [logoDarkUrl, setLogoDarkUrl] = useState("");
  const [logoUrl, setLogoUrl] = useState("");

  useEffect(() => {
    if (!loading && !isLoginPage) {
      fetch("/api/admin/settings")
        .then((r) => r.json())
        .then((d) => {
          setLogoDarkUrl(d.settings?.logoDarkUrl || "");
          setLogoUrl(d.settings?.logoUrl || "");
        })
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
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-slate-500">Loading...</div>
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

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <aside className="w-64 bg-slate-900 text-white flex flex-col shrink-0">
        <div className="px-6 py-5 border-b border-slate-800">
          <Link href="/" className="block">
            {logoDarkUrl || logoUrl ? (
              <img
                src={logoDarkUrl || logoUrl}
                alt="Admin"
                className="h-9 w-auto object-contain mb-1"
              />
            ) : (
              <div className="font-display text-2xl tracking-wide">DSP</div>
            )}
            <div className="text-xs text-slate-400 mt-0.5">Admin Panel</div>
          </Link>
        </div>

        <nav className="flex-1 py-4 px-3 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-sm transition ${
                isActive(item.href)
                  ? "bg-amber-600 text-white"
                  : "text-slate-300 hover:bg-slate-800 hover:text-white"
              }`}
            >
              <span className="w-5 text-center opacity-80">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-800 space-y-2">
          <div className="text-sm">
            <div className="font-medium truncate">{user.name || user.username}</div>
            <div className="text-xs text-slate-400 truncate">{user.email}</div>
          </div>
          <div className="flex gap-2">
            <Link
              href="/"
              className="flex-1 text-center text-xs px-3 py-2 rounded border border-slate-700 text-slate-300 hover:bg-slate-800"
            >
              View Site
            </Link>
            <button
              onClick={() => logout()}
              className="flex-1 text-xs px-3 py-2 rounded border border-slate-700 text-slate-300 hover:bg-red-600 hover:border-red-600 hover:text-white transition"
            >
              Logout
            </button>
          </div>
        </div>
      </aside>

      <main className="flex-1 min-w-0 overflow-auto">
        <div className="p-8 max-w-6xl mx-auto">{children}</div>
      </main>
    </div>
  );
}
