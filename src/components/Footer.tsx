import Link from "next/link";

type Product = { slug: string; title: string };
type Office  = { label: string; lines: string[] };
type SiteData = {
  name: string; shortName: string; tagline: string;
  email: string; phoneWork: string; mobile: string;
  workOffice: Office; regdOffice: Office;
  logoDarkUrl?: string; logoUrl?: string; whatsapp?: string;
};

function IconWA({ cls = "w-3.5 h-3.5" }: { cls?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={cls} aria-hidden>
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z" />
    </svg>
  );
}
function IconPhone({ cls = "w-3.5 h-3.5" }: { cls?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={cls} aria-hidden>
      <path d="M6.6 10.8c1.4 2.8 3.8 5.1 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1C10.6 21 3 13.4 3 4c0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.3 0 .7-.2 1L6.6 10.8z" />
    </svg>
  );
}
function IconMail({ cls = "w-3.5 h-3.5" }: { cls?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={cls} aria-hidden>
      <rect width="20" height="16" x="2" y="4" rx="2.5" />
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </svg>
  );
}
function IconPin({ cls = "w-4 h-4" }: { cls?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={cls} aria-hidden>
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}

export default function Footer({ products, site }: { products: Product[]; site: SiteData }) {
  const mobile   = site.mobile;
  const whatsapp = site.whatsapp || mobile;
  const waNum    = whatsapp?.replace(/\D/g, "") || "";
  const waMsg    = encodeURIComponent("Hi DSP Precision, I would like to enquire about your precision balls.");

  const quickLinks = [
    { href: "/about",      label: "About Us" },
    { href: "/products",   label: "Products" },
    { href: "/quality",    label: "Quality" },
    { href: "/technical",  label: "Technical Helpdesk" },
    { href: "/clients",    label: "Client Appreciation" },
    { href: "/network",    label: "Network" },
    { href: "/career",     label: "Career" },
    { href: "/contact",    label: "Contact" },
  ];

  return (
    <footer className="site-footer mt-auto">
      <div className="relative z-10 mx-auto grid max-w-6xl gap-10 px-4 py-16 md:grid-cols-4 md:px-6">

        {/* ── Brand col ── */}
        <div className="md:col-span-1">
          {site.logoDarkUrl || site.logoUrl ? (
            <img src={site.logoDarkUrl || site.logoUrl} alt={site.name}
              className="h-10 w-auto object-contain mb-5" />
          ) : (
            <p className="font-display text-2xl tracking-wide text-white mb-5">DSP</p>
          )}

          <p className="text-sm leading-relaxed text-white/60 mb-6">{site.tagline}</p>

          {/* Contact quick-links */}
          <div className="flex flex-col gap-3">
            <a href={`mailto:${site.email}`}
              className="group flex items-center gap-3 text-sm text-white/60 hover:text-[var(--copper-light)] transition-colors">
              <span className="flex w-8 h-8 items-center justify-center rounded-lg bg-white/8 group-hover:bg-[var(--copper-light)]/15 transition-colors shrink-0">
                <IconMail />
              </span>
              <span className="truncate">{site.email}</span>
            </a>
            {mobile && (
              <a href={`tel:${mobile.replace(/\s/g, "")}`}
                className="group flex items-center gap-3 text-sm text-white/60 hover:text-white transition-colors">
                <span className="flex w-8 h-8 items-center justify-center rounded-lg bg-white/8 group-hover:bg-[var(--steel-mid)]/50 transition-colors shrink-0">
                  <IconPhone />
                </span>
                <span>{mobile}</span>
              </a>
            )}
            {waNum && (
              <a href={`https://wa.me/${waNum}?text=${waMsg}`} target="_blank" rel="noreferrer"
                className="group flex items-center gap-3 text-sm text-white/60 hover:text-[#2dda6e] transition-colors">
                <span className="flex w-8 h-8 items-center justify-center rounded-lg bg-white/8 group-hover:bg-[#2dda6e]/15 transition-colors shrink-0">
                  <IconWA />
                </span>
                <span>WhatsApp Chat</span>
              </a>
            )}
          </div>
        </div>

        {/* ── Quick links ── */}
        <div>
          <p className="footer-heading">Explore</p>
          <ul className="mt-5 space-y-2.5 text-sm text-white/60">
            {quickLinks.map(item => (
              <li key={item.href}>
                <Link href={item.href}
                  className="inline-block hover:text-white hover:translate-x-1 transition-all duration-200">
                  {item.label}
                </Link>
              </li>
            ))}
            <li>
              <a href="/docs/catalogue.pdf" target="_blank" rel="noreferrer"
                className="inline-flex items-center gap-1.5 hover:text-[var(--copper-light)] transition-colors">
                <span>↓</span> Download Catalogue
              </a>
            </li>
          </ul>
        </div>

        {/* ── Products ── */}
        <div>
          <p className="footer-heading">Products</p>
          <ul className="mt-5 space-y-2.5 text-sm text-white/60">
            {products.slice(0, 6).map(p => (
              <li key={p.slug}>
                <Link href={`/products/${p.slug}`}
                  className="inline-block hover:text-white hover:translate-x-1 transition-all duration-200">
                  {p.title}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* ── Offices ── */}
        <div>
          <p className="footer-heading">Offices</p>
          <div className="mt-5 flex flex-col gap-6 text-sm text-white/60">

            {/* Work Office */}
            <div className="flex gap-3">
              <IconPin cls="w-4 h-4 mt-0.5 text-[var(--copper-light)] shrink-0" />
              <div>
                <p className="text-[11px] font-bold uppercase tracking-widest text-white/40 mb-1.5">
                  {site.workOffice.label}
                </p>
                {site.workOffice.lines.map((line, i) => (
                  <p key={i} className="leading-relaxed">{line}</p>
                ))}
                <a href={`tel:${site.phoneWork.replace(/\s/g, "")}`}
                  className="mt-2 inline-flex items-center gap-1.5 text-white/70 hover:text-white transition-colors">
                  <IconPhone cls="w-3 h-3" /> {site.phoneWork}
                </a>
              </div>
            </div>

            {/* Regd Office */}
            <div className="flex gap-3">
              <IconPin cls="w-4 h-4 mt-0.5 text-[var(--copper-light)] shrink-0" />
              <div>
                <p className="text-[11px] font-bold uppercase tracking-widest text-white/40 mb-1.5">
                  {site.regdOffice.label}
                </p>
                {site.regdOffice.lines.map((line, i) => (
                  <p key={i} className="leading-relaxed">{line}</p>
                ))}
                <a href={`tel:${mobile.replace(/\s/g, "")}`}
                  className="mt-2 inline-flex items-center gap-1.5 text-white/70 hover:text-white transition-colors">
                  <IconPhone cls="w-3 h-3" /> {mobile}
                </a>
                {waNum && (
                  <a href={`https://wa.me/${waNum}`} target="_blank" rel="noreferrer"
                    className="mt-1.5 flex items-center gap-1.5 text-[#2dda6e]/70 hover:text-[#2dda6e] transition-colors">
                    <IconWA cls="w-3 h-3" /> WhatsApp
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Accreditations Trust Marks */}
      <div className="relative z-10 border-t border-white/8 bg-black/20">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-4 md:px-6">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[var(--orange)]" />
            <span className="text-[11px] font-bold uppercase tracking-wider text-white/50">
              ISO 9001:2015 Certified & Accredited Quality System
            </span>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-white/10 hover:bg-white/15 px-2.5 py-1 rounded border border-white/10 transition">
              <img src="/images/certifications/gsci-cert.jpg" alt="GSCI" className="w-5 h-5 rounded-xs object-contain bg-white" />
              <span className="text-[11px] font-semibold text-white/80">GSCI</span>
            </div>
            <div className="flex items-center gap-2 bg-white/10 hover:bg-white/15 px-2.5 py-1 rounded border border-white/10 transition">
              <img src="/images/certifications/uaf-cert.jpg" alt="UAF CB-MS-5428" className="w-5 h-5 rounded-xs object-contain bg-white" />
              <span className="text-[11px] font-semibold text-white/80">UAF (CB-MS-5428)</span>
            </div>
            <div className="flex items-center gap-2 bg-white/10 hover:bg-white/15 px-2.5 py-1 rounded border border-white/10 transition">
              <img src="/images/certifications/iaf-cert.jpg" alt="IAF MLA" className="w-5 h-5 rounded-xs object-contain bg-white" />
              <span className="text-[11px] font-semibold text-white/80">IAF MLA</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="relative z-10 border-t border-white/8">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-5 text-xs text-white/40 md:flex-row md:items-center md:justify-between md:px-6">
          <p>© {new Date().getFullYear()} {site.name}. All rights reserved.</p>
          <div className="flex items-center gap-5">
            <Link href="/disclaimer" className="hover:text-white transition-colors">Disclaimer</Link>
            {waNum && (
              <a href={`https://wa.me/${waNum}`} target="_blank" rel="noreferrer"
                className="inline-flex items-center gap-1.5 hover:text-[#2dda6e] transition-colors">
                <IconWA /> WhatsApp
              </a>
            )}
            {mobile && (
              <a href={`tel:${mobile.replace(/\s/g, "")}`}
                className="inline-flex items-center gap-1.5 hover:text-white transition-colors">
                <IconPhone /> {mobile}
              </a>
            )}
          </div>
        </div>
      </div>
    </footer>
  );
}
