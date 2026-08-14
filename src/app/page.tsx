import Link from "next/link";
import ComingSoon from "@/components/ComingSoon";
import ProductCard from "@/components/ProductCard";
import { getProducts, getSiteData } from "@/lib/cms";

export default async function HomePage() {
  const [{ site }, products] = await Promise.all([getSiteData(), getProducts()]);

  return (
    <>
      {/* ── HERO ── */}
      <section className="home-hero">
        <div className="home-hero-content">
          <p className="eyebrow reveal">Since 1995 · Baddi, Himachal Pradesh</p>

          <h1 className="brand-lockup reveal reveal-delay-1 mt-4">
            DSP<br />Precision
          </h1>

          <p className="reveal reveal-delay-2 mt-6 max-w-xl text-base md:text-lg leading-relaxed text-[#d4d4d4]">
            {site.tagline}. Precision-grade balls to{" "}
            <span className="text-white font-semibold">AFBMA, DIN &amp; ISO</span> standards — engineered
            for bearings, gauging and industrial assemblies.
          </p>

          <div className="reveal reveal-delay-3 mt-10 flex flex-wrap gap-4 items-center">
            <Link href="/products" className="btn btn-accent">
              Explore Products
            </Link>
            <Link href="/contact" className="btn btn-ghost">
              Request a Quote
            </Link>
          </div>

          <div className="reveal reveal-delay-3 mt-12 pt-8 border-t border-[#262626] flex flex-wrap gap-x-8 gap-y-3">
            {["ISO 9001 Certified", "AFBMA / DIN / ISO Grades", "45+ Years Experience"].map(b => (
              <span key={b} className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#a3a3a3]">
                <span className="w-1.5 h-1.5 bg-[#f97316]" />
                {b}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── STATS ── */}
      <section className="section-tight bg-white">
        <div className="mx-auto max-w-6xl px-4 md:px-6">
          <div className="stat-strip">
            {site.highlights.map((item: any) => (
              <div key={item.label} className="stat-item">
                <strong>{item.value}</strong>
                <span>{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── ABOUT ── */}
      <section className="section border-t border-[#e5e5e5]">
        <div className="mx-auto grid max-w-6xl gap-12 px-4 md:grid-cols-2 md:items-center md:px-6">
          <div>
            <p className="eyebrow">Who we are</p>
            <h2 className="section-title mt-3">
              Precision balls engineered for demanding industry
            </h2>
            <p className="section-copy">
              Founded by Mr. Yashpal Verma, DSP is a leading manufacturer of precision-grade balls
              in high carbon chrome steel, stainless steels, brass, copper, tungsten carbide,
              ceramics and specialty materials — made to AFBMA, DIN &amp; ISO grades or your drawings.
            </p>
            <ul className="feature-list mt-8">
              <li>Full in-house process capabilities</li>
              <li>Self-certification status with reputed customers</li>
              <li>QS 9000 &amp; TS 16949 customer ecosystem</li>
              <li>ISO 9001 certified quality systems</li>
            </ul>
            <div className="mt-8">
              <Link href="/about" className="btn btn-primary">About DSP</Link>
            </div>
          </div>

          <div>
            <ComingSoon label="Plant / product image coming soon" aspect="square" />
          </div>
        </div>
      </section>

      {/* ── PRODUCTS ── */}
      <section className="section bg-[#f5f5f5] border-t border-[#e5e5e5]">
        <div className="mx-auto max-w-6xl px-4 md:px-6">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div>
              <p className="eyebrow">Product range</p>
              <h2 className="section-title mt-3">Built for every grade &amp; material</h2>
              <p className="section-copy">
                From bearing steel to ceramics and gauging balls — explore our core catalogue.
              </p>
            </div>
            <Link href="/products" className="btn btn-primary shrink-0">View all products</Link>
          </div>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {products.slice(0, 6).map(product => (
              <ProductCard key={product.slug} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* ── QUALITY ── */}
      <section className="section border-t border-[#e5e5e5]">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 md:grid-cols-[1fr_1.1fr] md:px-6">
          <div className="bg-white border border-[#e5e5e5] p-8 md:p-10">
            <p className="eyebrow">Quality circle</p>
            <h2 className="section-title mt-3">Committed to total customer satisfaction</h2>
            <p className="section-copy">
              Products are delivered after understanding technical requirements,
              with continual improvement of the quality management system through teamwork.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/quality" className="btn btn-primary">Quality policy</Link>
              <Link href="/technical" className="btn btn-outline">
                Technical helpdesk
              </Link>
            </div>
          </div>
          <div>
            <ComingSoon label="Certificate / lab image coming soon" aspect="wide" className="min-h-[240px]" />
          </div>
        </div>
      </section>

      {/* ── FEATURED CARDS ── */}
      <section className="section pt-0">
        <div className="mx-auto max-w-6xl px-4 md:px-6">
          <div className="grid gap-6 md:grid-cols-2">
            {[
              {
                href: "/clients", tag: "Clients", title: "Client appreciation",
                desc: "Read feedback from first-time and repeat buyers worldwide."
              },
              {
                href: "/technical#enquiry", tag: "Helpdesk", title: "New or experienced buyer forms",
                desc: "Submit technical requirements with size, grade and quantity."
              },
            ].map(card => (
              <Link key={card.href} href={card.href}
                className="group bg-white border border-[#e5e5e5] p-8 hover:border-[#f97316] transition-colors">
                <p className="eyebrow">{card.tag}</p>
                <h3 className="mt-3 font-display text-2xl text-[#0a0a0a] group-hover:text-[#f97316] transition-colors">
                  {card.title}
                </h3>
                <p className="mt-2 text-sm text-[#737373] leading-relaxed">{card.desc}</p>
                <span className="mt-6 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#f97316]">
                  Learn more &rarr;
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── BANNER CTA ── */}
      <section className="section pt-0">
        <div className="mx-auto max-w-6xl px-4 md:px-6">
          <div className="bg-[#0a0a0a] text-white p-8 md:p-14 border-l-4 border-[#f97316]">
            <div className="grid gap-8 md:grid-cols-[1.5fr_auto] md:items-center">
              <div>
                <p className="eyebrow">Ready to order?</p>
                <h2 className="mt-3 font-display text-3xl md:text-4xl">
                  Need a custom size, grade or material?
                </h2>
                <p className="mt-3 max-w-xl text-[#a3a3a3] text-sm leading-relaxed">
                  Share your drawings or technical requirements. Our team will respond from{" "}
                  <span className="text-white font-semibold">{site.email}</span>.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <Link href="/contact" className="btn btn-accent">Contact sales</Link>
                <Link href="/products" className="btn btn-ghost">Browse products</Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
