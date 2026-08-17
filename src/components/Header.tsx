"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

type NavLink = { href: string; label: string };
type DropdownGroup = { label: string; items: NavLink[] };
type SiteData = { shortName: string; name: string; logoUrl?: string; mobile?: string; whatsapp?: string };
type Props    = { navLinks: NavLink[]; site: SiteData };

function IconChevron({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={`w-3.5 h-3.5 transition-transform duration-200 ${className}`} aria-hidden>
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

function IconArrow() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4" aria-hidden>
      <path d="M5 12h14M13 5l7 7-7 7" />
    </svg>
  );
}

function buildGroups(links: NavLink[]): { standalone: NavLink[]; groups: DropdownGroup[] } {
  const find = (label: string) => links.find(l => l.label === label);
  const companyItems: NavLink[] = [find("About"), find("Clients"), find("Career")].filter(Boolean) as NavLink[];
  const excelItems: NavLink[]   = [find("Quality"), find("Helpdesk")].filter(Boolean) as NavLink[];
  const reachItems: NavLink[]   = [find("Network")].filter(Boolean) as NavLink[];
  const standalone: NavLink[]   = [find("Home"), find("Products"), find("Contact")].filter(Boolean) as NavLink[];

  const groups: DropdownGroup[] = [];
  if (companyItems.length) groups.push({ label: "Company", items: companyItems });
  if (excelItems.length)   groups.push({ label: "Excellence", items: excelItems });
  if (reachItems.length)   groups.push({ label: "Reach", items: reachItems });
  return { standalone, groups };
}

export default function Header({ navLinks, site }: Props) {
  const pathname = usePathname();
  const [scrolled, setScrolled]     = useState(false);
  const [openGroup, setOpenGroup]   = useState<string | null>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const mobile   = site.mobile   || "";
  const whatsapp = site.whatsapp || mobile;
  const waNum    = whatsapp.replace(/\D/g, "");
  const waMsg    = encodeURIComponent("Hi DSP Precision, I would like to enquire about your precision balls.");

  const { standalone, groups } = buildGroups(navLinks);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 12);
    fn();
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  const groupActive = (items: NavLink[]) =>
    items.some(l => l.href === "/" ? pathname === "/" : pathname.startsWith(l.href));

  const isActive = (link: NavLink) =>
    link.href === "/" ? pathname === "/" : pathname.startsWith(link.href);

  const enterGroup = (label: string) => {
    if (closeTimer.current) { clearTimeout(closeTimer.current); closeTimer.current = null; }
    setOpenGroup(label);
  };
  const leaveGroup = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => setOpenGroup(null), 120);
  };

  return (
    <header className={`site-header sticky top-0 z-50 ${scrolled ? "site-header-solid" : ""}`}>
      {/* Main nav row */}
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-4 py-4 md:px-8">
        {/* ── Brand ── */}
        <Link href="/" className="brand-mark group flex items-center gap-3.5 shrink-0">
          {site.logoUrl ? (
            <img src={site.logoUrl} alt={site.name} className="h-12 md:h-14 lg:h-16 w-auto object-contain transition-transform duration-300 group-hover:scale-105" />
          ) : (
            <div className="flex items-center gap-3.5">
              <span className="brand-badge !w-12 !h-12 !text-base" aria-hidden>{site.shortName}</span>
              <div className="hidden sm:flex flex-col leading-tight">
                <span className="font-display font-bold text-lg md:text-xl text-[var(--ink)] tracking-[0.03em]">
                  {site.shortName} Precision
                </span>
                <span className="text-[0.68rem] uppercase tracking-[0.18em] text-[var(--muted)] font-semibold">
                  Precision Balls Mfg.
                </span>
              </div>
            </div>
          )}
        </Link>

        {/* ── Desktop Nav ── */}
        <nav className="hidden lg:flex items-center gap-2 xl:gap-3">
          {standalone.map(link => (
            <Link key={link.href} href={link.href}
              className={`nav-link ${isActive(link) ? "nav-link-active" : ""}`}>
              {link.label}
            </Link>
          ))}

          {groups.map(g => {
            const open = openGroup === g.label;
            const active = groupActive(g.items);
            return (
              <div
                key={g.label}
                className="relative nav-dropdown-wrap"
                onMouseEnter={() => enterGroup(g.label)}
                onMouseLeave={leaveGroup}
              >
                <button
                  type="button"
                  className={`nav-link group flex items-center gap-1.5 ${active ? "nav-link-active" : ""}`}
                  aria-expanded={open}
                  aria-haspopup="true"
                  onClick={() => setOpenGroup(open ? null : g.label)}
                >
                  {g.label}
                  <IconChevron className={open ? "rotate-180 text-[var(--orange-deep)]" : ""} />
                </button>

                <div
                  className={`nav-dropdown ${open ? "nav-dropdown-open" : ""}`}
                  role="menu"
                >
                  <div className="nav-dropdown-inner">
                    {g.items.map(item => (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={`nav-dropdown-item ${isActive(item) ? "nav-dropdown-item-active" : ""}`}
                        role="menuitem"
                      >
                        <div>
                          <div className="nav-dropdown-item-title">{item.label}</div>
                        </div>
                        <div className="nav-dropdown-item-arrow">
                          <IconArrow />
                        </div>
                      </Link>
                    ))}
                  </div>
                  <div className="nav-dropdown-accent" aria-hidden />
                </div>
              </div>
            );
          })}
        </nav>

        {/* ── Right: quick actions ── */}
        <div className="flex items-center gap-3">
          <Link href="/contact" className="btn btn-primary inline-flex text-sm py-2.5 px-5">
            Get a Quote
            <IconArrow />
          </Link>
        </div>
      </div>
    </header>
  );
}
