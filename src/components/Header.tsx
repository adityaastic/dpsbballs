"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

type NavLink = { href: string; label: string };
type SiteData = {
  shortName: string;
  name: string;
};

type Props = {
  navLinks: NavLink[];
  site: SiteData;
};

export default function Header({ navLinks, site }: Props) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    fetch("/api/admin/auth/me")
      .then((r) => r.ok && r.json())
      .then((d) => {
        if (d?.user) setIsAdmin(true);
      })
      .catch(() => {});
  }, []);

  return (
    <header
      className={`site-header sticky top-0 z-50 transition-all duration-300 ${
        scrolled ? "site-header-solid" : ""
      }`}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 md:px-6">
        <Link href="/" className="brand-mark group flex items-center gap-3">
          <span className="brand-badge" aria-hidden>
            {site.shortName}
          </span>
          <span className="leading-tight">
            <span className="block font-display text-lg tracking-wide text-[var(--ink)] md:text-xl">
              DSP Precision
            </span>
            <span className="hidden text-[11px] uppercase tracking-[0.22em] text-[var(--muted)] sm:block">
              Products Pvt. Ltd.
            </span>
          </span>
        </Link>

        <nav className="hidden items-center gap-0.5 xl:flex">
          {navLinks.map((link) => {
            const active =
              link.href === "/"
                ? pathname === "/"
                : pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`nav-link ${active ? "nav-link-active" : ""}`}
              >
                {link.label}
              </Link>
            );
          })}
          {isAdmin && (
            <Link
              href="/admin"
              className="nav-link ml-2 border-l border-[var(--line)] pl-3 text-[var(--copper)]"
            >
              Admin
            </Link>
          )}
        </nav>

        <div className="flex items-center gap-3">
          <Link href="/contact" className="btn btn-primary hidden sm:inline-flex">
            Get a Quote
          </Link>
          <button
            type="button"
            className="menu-btn xl:hidden"
            aria-expanded={open}
            aria-label="Toggle menu"
            onClick={() => setOpen((v) => !v)}
          >
            <span />
            <span />
            <span />
          </button>
        </div>
      </div>

      {open && (
        <div className="border-t border-[var(--line)] bg-[var(--surface)] xl:hidden">
          <nav className="mx-auto flex max-w-6xl flex-col px-4 py-3">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="border-b border-[var(--line)] py-3 text-sm font-medium text-[var(--ink)]"
              >
                {link.label}
              </Link>
            ))}
            {isAdmin && (
              <Link
                href="/admin"
                className="border-b border-[var(--line)] py-3 text-sm font-medium text-[var(--copper)]"
              >
                Admin Panel
              </Link>
            )}
            <Link href="/contact" className="btn btn-primary mt-4 justify-center">
              Get a Quote
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
