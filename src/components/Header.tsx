"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

type NavLink = { href: string; label: string };
type SiteData = { shortName: string; name: string; logoUrl?: string; mobile?: string; whatsapp?: string };
type Props    = { navLinks: NavLink[]; site: SiteData };

function IconWA() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5" aria-hidden>
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z" />
    </svg>
  );
}

function IconPhone() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5" aria-hidden>
      <path d="M6.6 10.8c1.4 2.8 3.8 5.1 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1C10.6 21 3 13.4 3 4c0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.3 0 .7-.2 1L6.6 10.8z" />
    </svg>
  );
}

export default function Header({ navLinks, site }: Props) {
  const pathname  = usePathname();
  const [open, setOpen]       = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  const mobile   = site.mobile   || "";
  const whatsapp = site.whatsapp || mobile;
  const waNum    = whatsapp.replace(/\D/g, "");
  const waMsg    = encodeURIComponent("Hi DSP Precision, I would like to enquire about your precision balls.");

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 12);
    fn();
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  useEffect(() => { setOpen(false); }, [pathname]);

  useEffect(() => {
    fetch("/api/admin/auth/me").then(r => r.ok && r.json()).then(d => d?.user && setIsAdmin(true)).catch(() => {});
  }, []);

  return (
    <header className={`site-header sticky top-0 z-50 ${scrolled ? "site-header-solid" : ""}`}>
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3.5 md:px-6">

        {/* Brand */}
        <Link href="/" className="brand-mark group flex items-center gap-3 shrink-0">
          {site.logoUrl ? (
            <img src={site.logoUrl} alt={site.name} className="h-9 w-auto object-contain" />
          ) : (
            <span className="brand-badge" aria-hidden>{site.shortName}</span>
          )}
          <span className="leading-none">
            <span className="block font-display text-lg uppercase tracking-tight text-[#0a0a0a]">
              {site.logoUrl ? site.name : "DSP Precision"}
            </span>
            <span className="hidden text-[10px] uppercase tracking-[0.2em] text-[#737373] mt-1 sm:block font-semibold">
              Products Pvt. Ltd.
            </span>
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden items-center gap-1 xl:flex">
          {navLinks.map(link => {
            const active = link.href === "/" ? pathname === "/" : pathname.startsWith(link.href);
            return (
              <Link key={link.href} href={link.href}
                className={`nav-link ${active ? "nav-link-active" : ""}`}>
                {link.label}
              </Link>
            );
          })}
          {isAdmin && (
            <Link href="/admin" className="nav-link text-[#f97316]">
              Admin
            </Link>
          )}
        </nav>

        {/* Header Action Buttons */}
        <div className="flex items-center gap-2">
          {/* WhatsApp chip */}
          {waNum && (
            <a href={`https://wa.me/${waNum}?text=${waMsg}`}
              target="_blank" rel="noreferrer"
              title="WhatsApp us"
              aria-label="WhatsApp DSP Precision"
              className="hidden lg:inline-flex items-center gap-1.5 px-3 py-2 bg-[#f97316] text-white text-[0.72rem] font-bold uppercase tracking-wider hover:bg-[#c2410c] transition-colors">
              <IconWA />
              <span>WhatsApp</span>
            </a>
          )}

          {/* Call chip */}
          {mobile && (
            <a href={`tel:${mobile.replace(/\s/g, "")}`}
              title={`Call: ${mobile}`}
              aria-label={`Call: ${mobile}`}
              className="hidden lg:inline-flex items-center gap-1.5 px-3 py-2 border border-[#0a0a0a] text-[#0a0a0a] text-[0.72rem] font-bold uppercase tracking-wider hover:bg-[#0a0a0a] hover:text-white transition-colors">
              <IconPhone />
              <span>{mobile}</span>
            </a>
          )}

          <Link href="/contact" className="btn btn-primary hidden sm:inline-flex">
            Get a Quote
          </Link>

          <button type="button" onClick={() => setOpen(v => !v)}
            className="menu-btn xl:hidden" aria-expanded={open} aria-label="Toggle menu">
            <span /><span /><span />
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="border-t border-[#e5e5e5] bg-white xl:hidden">
          <nav className="mx-auto flex max-w-6xl flex-col px-4 py-4">
            {navLinks.map(link => (
              <Link key={link.href} href={link.href}
                className="border-b border-[#f5f5f5] py-3 text-sm font-semibold uppercase tracking-wider text-[#0a0a0a] hover:text-[#f97316] transition-colors">
                {link.label}
              </Link>
            ))}
            {isAdmin && (
              <Link href="/admin" className="border-b border-[#f5f5f5] py-3 text-sm font-semibold uppercase tracking-wider text-[#f97316]">
                Admin Panel
              </Link>
            )}

            {/* Mobile actions */}
            <div className="flex gap-2 mt-4 mb-2">
              {waNum && (
                <a href={`https://wa.me/${waNum}?text=${waMsg}`} target="_blank" rel="noreferrer"
                  className="flex items-center justify-center gap-2 flex-1 py-2.5 bg-[#f97316] text-white text-xs font-bold uppercase tracking-wider">
                  <IconWA />
                  WhatsApp
                </a>
              )}
              {mobile && (
                <a href={`tel:${mobile.replace(/\s/g, "")}`}
                  className="flex items-center justify-center gap-2 flex-1 py-2.5 border border-[#0a0a0a] text-[#0a0a0a] text-xs font-bold uppercase tracking-wider">
                  <IconPhone />
                  Call
                </a>
              )}
            </div>

            <Link href="/contact" className="btn btn-primary mt-2 justify-center w-full">
              Get a Quote
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
