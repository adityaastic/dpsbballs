"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

type NavLink = { href: string; label: string };
type DropdownGroup = { label: string; items: NavLink[] };
type SiteData = { shortName: string; name: string; logoUrl?: string; mobile?: string; whatsapp?: string };
type Props    = { navLinks: NavLink[]; site: SiteData };

function IconWA() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4" aria-hidden>
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z" />
    </svg>
  );
}

function IconPhone() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4" aria-hidden>
      <path d="M6.6 10.8c1.4 2.8 3.8 5.1 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1C10.6 21 3 13.4 3 4c0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.3 0 .7-.2 1L6.6 10.8z" />
    </svg>
  );
}

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
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileSub, setMobileSub]   = useState<string | null>(null);
  const [scrolled, setScrolled]     = useState(false);
  const [isAdmin, setIsAdmin]       = useState(false);
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

  useEffect(() => { setMobileOpen(false); setMobileSub(null); }, [pathname]);

  useEffect(() => {
    fetch("/api/admin/auth/me").then(r => r.ok && r.json()).then(d => d?.user && setIsAdmin(true)).catch(() => {});
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
      {/* Top bar — tiny accent strip with tagline highlights */}
      <div className="hidden md:block top-accent-bar">
        <div className="mx-auto max-w-6xl px-6 flex items-center justify-between text-[0.68rem] uppercase tracking-[0.16em] font-semibold">
          <div className="flex items-center gap-5 text-orange-100/85">
            <span className="flex items-center gap-1.5">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-amber-300 shadow-[0_0_8px_rgba(251,191,36,0.9)]" />
              ISO 9001 Certified
            </span>
            <span className="opacity-60">•</span>
            <span>Est. 1995</span>
            <span className="opacity-60">•</span>
            <span>AFBMA / DIN / ISO Standards</span>
          </div>
          <div className="flex items-center gap-4 text-orange-100/85">
            {mobile && (
              <a href={`tel:${mobile.replace(/\s/g, "")}`} className="hover:text-white transition-colors flex items-center gap-1.5">
                <IconPhone />
                <span>{mobile}</span>
              </a>
            )}
            {waNum && (
              <a href={`https://wa.me/${waNum}?text=${waMsg}`} target="_blank" rel="noreferrer" className="hover:text-white transition-colors flex items-center gap-1.5">
                <IconWA />
                <span>WhatsApp</span>
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Main nav row */}
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3.5 md:px-6">
        {/* ── Brand ── */}
        <Link href="/" className="brand-mark group flex items-center gap-3 shrink-0">
          {site.logoUrl ? (
            <img src={site.logoUrl} alt={site.name} className="h-10 md:h-12 w-auto object-contain" />
          ) : (
            <div className="flex items-center gap-3">
              <span className="brand-badge" aria-hidden>{site.shortName}</span>
              <div className="hidden sm:flex flex-col leading-tight">
                <span className="font-display font-bold text-[0.95rem] text-[var(--ink)] tracking-[0.04em]">
                  {site.shortName} Precision
                </span>
                <span className="text-[0.62rem] uppercase tracking-[0.18em] text-[var(--muted)] font-semibold">
                  Precision Balls Mfg.
                </span>
              </div>
            </div>
          )}
        </Link>

        {/* ── Desktop Nav ── */}
        <nav className="hidden lg:flex items-center gap-0.5">
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
                  className={`nav-link group flex items-center gap-1 ${active ? "nav-link-active" : ""}`}
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

          {isAdmin && (
            <Link href="/admin" className="nav-link ml-2 border-l border-[var(--line)] pl-3 text-[var(--copper)]">
              Admin
            </Link>
          )}
        </nav>

        {/* ── Right: quick actions ── */}
        <div className="flex items-center gap-2">
          {waNum && (
            <a
              href={`https://wa.me/${waNum}?text=${waMsg}`}
              target="_blank" rel="noreferrer"
              title="WhatsApp us"
              aria-label="WhatsApp DSP Precision"
              className="icon-chip icon-chip-wa"
            >
              <IconWA />
            </a>
          )}
          {mobile && (
            <a
              href={`tel:${mobile.replace(/\s/g, "")}`}
              title={`Call: ${mobile}`}
              aria-label={`Call: ${mobile}`}
              className="icon-chip icon-chip-phone"
            >
              <IconPhone />
            </a>
          )}

          <Link href="/contact" className="btn btn-primary hidden md:inline-flex">
            Get a Quote
            <IconArrow />
          </Link>

          <button
            type="button"
            onClick={() => setMobileOpen(v => !v)}
            className={`menu-btn lg:hidden ${mobileOpen ? "menu-btn-open" : ""}`}
            aria-expanded={mobileOpen}
            aria-label="Toggle menu"
          >
            <span /><span /><span />
          </button>
        </div>
      </div>

      {/* ── Mobile menu drawer ── */}
      {mobileOpen && (
        <div className="mobile-drawer lg:hidden">
          <nav className="mx-auto flex max-w-6xl flex-col px-4 pt-2 pb-5">
            {standalone.map(link => (
              <Link
                key={link.href}
                href={link.href}
                className={`mobile-nav-item ${isActive(link) ? "mobile-nav-item-active" : ""}`}
              >
                {link.label}
              </Link>
            ))}

            {groups.map(g => {
              const active = groupActive(g.items);
              const subOpen = mobileSub === g.label;
              return (
                <div key={g.label} className="border-b border-[var(--line)]">
                  <button
                    type="button"
                    onClick={() => setMobileSub(subOpen ? null : g.label)}
                    className={`mobile-nav-item mobile-nav-item-btn ${active && !subOpen ? "mobile-nav-item-active" : ""}`}
                    aria-expanded={subOpen}
                  >
                    <span>{g.label}</span>
                    <IconChevron className={subOpen ? "rotate-180 text-[var(--orange-deep)]" : ""} />
                  </button>
                  {subOpen && (
                    <div className="mobile-submenu">
                      {g.items.map(item => (
                        <Link
                          key={item.href}
                          href={item.href}
                          className={`mobile-submenu-item ${isActive(item) ? "mobile-submenu-item-active" : ""}`}
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-gradient-to-r from-[var(--orange)] to-[var(--gold)] shadow-sm flex-shrink-0 mt-[0.55rem]" />
                          <span>{item.label}</span>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}

            {isAdmin && (
              <Link href="/admin" className="mobile-nav-item font-bold text-[var(--orange-deep)] before:hidden">
                Admin Panel
              </Link>
            )}

            {/* Mobile CTA strip */}
            <div className="mt-5 grid grid-cols-2 gap-2.5">
              {waNum && (
                <a href={`https://wa.me/${waNum}?text=${waMsg}`} target="_blank" rel="noreferrer"
                   className="mobile-cta mobile-cta-wa">
                  <IconWA /> WhatsApp
                </a>
              )}
              {mobile && (
                <a href={`tel:${mobile.replace(/\s/g, "")}`} className="mobile-cta mobile-cta-phone">
                  <IconPhone /> Call Now
                </a>
              )}
            </div>

            <Link href="/contact" className="btn btn-primary mt-3 justify-center w-full !py-3.5 gap-2">
              Get a Quote
              <IconArrow />
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
