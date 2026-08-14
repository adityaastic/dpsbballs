import Link from "next/link";

type Product = { slug: string; title: string };
type Office  = { label: string; lines: string[] };
type SiteData = {
  name: string; shortName: string; tagline: string;
  email: string; phoneWork: string; mobile: string;
  workOffice: Office; regdOffice: Office;
  logoDarkUrl?: string; logoUrl?: string; whatsapp?: string;
};

function IconWA({ cls = "w-4 h-4" }: { cls?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={cls} aria-hidden>
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z" />
    </svg>
  );
}
function IconPhone({ cls = "w-4 h-4" }: { cls?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={cls} aria-hidden>
      <path d="M6.6 10.8c1.4 2.8 3.8 5.1 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1C10.6 21 3 13.4 3 4c0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.3 0 .7-.2 1L6.6 10.8z" />
    </svg>
  );
}
function IconMail({ cls = "w-4 h-4" }: { cls?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square" strokeLinejoin="miter" className={cls} aria-hidden>
      <rect width="20" height="16" x="2" y="4" />
      <path d="m22 7-10 7L2 7" />
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
      <div className="mx-auto max-w-6xl px-4 py-16 md:px-6">
        <div className="grid gap-12 md:grid-cols-4">

          {/* Brand */}
          <div className="md:col-span-1">
            {site.logoDarkUrl || site.logoUrl ? (
              <img src={site.logoDarkUrl || site.logoUrl} alt={site.name}
                className="h-9 w-auto object-contain mb-4" />
            ) : (
              <p className="font-display text-2xl tracking-tight text-white mb-4">DSP</p>
            )}

            <p className="text-xs leading-relaxed text-[#a3a3a3] mb-6">{site.tagline}</p>

            <div className="flex flex-col gap-3.5 text-xs text-[#d4d4d4]">
              <a href={`mailto:${site.email}`} className="flex items-center gap-2.5 hover:text-[#f97316] transition-colors">
                <IconMail />
                <span className="truncate">{site.email}</span>
              </a>
              {mobile && (
                <a href={`tel:${mobile.replace(/\s/g, "")}`} className="flex items-center gap-2.5 hover:text-white transition-colors">
                  <IconPhone />
                  <span>{mobile}</span>
                </a>
              )}
              {waNum && (
                <a href={`https://wa.me/${waNum}?text=${waMsg}`} target="_blank" rel="noreferrer" className="flex items-center gap-2.5 text-[#f97316] hover:underline">
                  <IconWA />
                  <span>WhatsApp Chat</span>
                </a>
              )}
            </div>
          </div>

          {/* Explore */}
          <div>
            <p className="footer-heading mb-4">Explore</p>
            <ul className="space-y-2 text-xs text-[#a3a3a3]">
              {quickLinks.map(item => (
                <li key={item.href}>
                  <Link href={item.href} className="hover:text-white transition-colors">
                    {item.label}
                  </Link>
                </li>
              ))}
              <li className="pt-2">
                <a href="/docs/catalogue.pdf" target="_blank" rel="noreferrer" className="text-[#f97316] hover:underline">
                  Download Catalogue &rarr;
                </a>
              </li>
            </ul>
          </div>

          {/* Products */}
          <div>
            <p className="footer-heading mb-4">Products</p>
            <ul className="space-y-2 text-xs text-[#a3a3a3]">
              {products.slice(0, 6).map(p => (
                <li key={p.slug}>
                  <Link href={`/products/${p.slug}`} className="hover:text-white transition-colors">
                    {p.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Offices */}
          <div>
            <p className="footer-heading mb-4">Offices</p>
            <div className="space-y-6 text-xs text-[#a3a3a3]">
              <div>
                <p className="font-bold uppercase tracking-wider text-white text-[11px] mb-1">
                  {site.workOffice.label}
                </p>
                {site.workOffice.lines.map((line, i) => (
                  <p key={i} className="leading-relaxed">{line}</p>
                ))}
                <p className="mt-1 text-[#737373]">{site.phoneWork}</p>
              </div>

              <div>
                <p className="font-bold uppercase tracking-wider text-white text-[11px] mb-1">
                  {site.regdOffice.label}
                </p>
                {site.regdOffice.lines.map((line, i) => (
                  <p key={i} className="leading-relaxed">{line}</p>
                ))}
                <p className="mt-1 text-[#737373]">{mobile}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-6 border-t border-[#262626] flex flex-col sm:flex-row justify-between items-center gap-4 text-[11px] text-[#737373]">
          <p>© {new Date().getFullYear()} {site.name}. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <Link href="/disclaimer" className="hover:text-[#a3a3a3]">Disclaimer</Link>
            <span>•</span>
            <Link href="/privacy" className="hover:text-[#a3a3a3]">Privacy</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
