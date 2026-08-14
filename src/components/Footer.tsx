import Link from "next/link";

type Product = { slug: string; title: string };
type Office = { label: string; lines: string[] };
type SiteData = {
  name: string;
  shortName: string;
  tagline: string;
  email: string;
  phoneWork: string;
  mobile: string;
  workOffice: Office;
  regdOffice: Office;
};

export default function Footer({
  products,
  site,
}: {
  products: Product[];
  site: SiteData;
}) {
  return (
    <footer className="site-footer mt-auto">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 md:grid-cols-4 md:px-6">
        <div className="md:col-span-1">
          <p className="font-display text-2xl tracking-wide text-white">DSP</p>
          <p className="mt-2 text-sm leading-relaxed text-white/70">
            {site.tagline}
          </p>
          <a
            href={`mailto:${site.email}`}
            className="mt-4 inline-block text-sm text-[var(--copper-light)] hover:underline"
          >
            {site.email}
          </a>
        </div>

        <div>
          <p className="footer-heading">Explore</p>
          <ul className="mt-3 space-y-2 text-sm text-white/75">
            <li>
              <Link href="/about">About Us</Link>
            </li>
            <li>
              <Link href="/products">Products</Link>
            </li>
            <li>
              <Link href="/quality">Quality</Link>
            </li>
            <li>
              <Link href="/technical">Technical Helpdesk</Link>
            </li>
            <li>
              <Link href="/clients">Client Appreciation</Link>
            </li>
            <li>
              <Link href="/network">Network</Link>
            </li>
            <li>
              <Link href="/career">Career</Link>
            </li>
            <li>
              <Link href="/contact">Contact</Link>
            </li>
            <li>
              <a href="/docs/catalogue.pdf" target="_blank" rel="noreferrer">
                Download Catalogue
              </a>
            </li>
          </ul>
        </div>

        <div>
          <p className="footer-heading">Products</p>
          <ul className="mt-3 space-y-2 text-sm text-white/75">
            {products.slice(0, 6).map((p) => (
              <li key={p.slug}>
                <Link href={`/products/${p.slug}`}>{p.title}</Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="footer-heading">Offices</p>
          <div className="mt-3 space-y-4 text-sm text-white/75">
            <div>
              <p className="font-medium text-white">{site.workOffice.label}</p>
              {site.workOffice.lines.map((line, i) => (
                <p key={i}>{line}</p>
              ))}
              <p className="mt-1">{site.phoneWork}</p>
            </div>
            <div>
              <p className="font-medium text-white">{site.regdOffice.label}</p>
              {site.regdOffice.lines.map((line, i) => (
                <p key={i}>{line}</p>
              ))}
              <p className="mt-1">{site.mobile}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-5 text-xs text-white/55 md:flex-row md:items-center md:justify-between md:px-6">
          <p>
            © {new Date().getFullYear()} {site.name}. All rights reserved.
          </p>
          <Link href="/disclaimer" className="hover:text-white">
            Disclaimer
          </Link>
        </div>
      </div>
    </footer>
  );
}
