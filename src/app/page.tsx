import Link from "next/link";
import ComingSoon from "@/components/ComingSoon";
import ProductCard from "@/components/ProductCard";
import { getProducts, getSiteData } from "@/lib/cms";

export default async function HomePage() {
  const [{ site }, products] = await Promise.all([getSiteData(), getProducts()]);

  return (
    <>
      {/* ═══════════════════════════════════════
          HERO
      ═══════════════════════════════════════ */}
      <section className="home-hero">
        <div className="home-hero-media" aria-hidden />
        <div className="home-hero-content">

          <p className="eyebrow reveal">Since 1995 · Baddi, Himachal Pradesh</p>

          <h1 className="brand-lockup reveal reveal-delay-1 mt-5">
            DSP<br />Precision
          </h1>

          <p className="reveal reveal-delay-2 mt-6 max-w-xl text-base md:text-lg leading-relaxed text-white/78">
            {site.tagline}. Precision-grade balls to{" "}
            <span className="text-white/95 font-semibold">AFBMA, DIN &amp; ISO</span> — built
            for bearings, gauging and industrial assemblies.
          </p>

          {/* CTA row */}
          <div className="reveal reveal-delay-3 mt-10 flex flex-wrap gap-3 items-center">
            <Link href="/products" className="btn btn-accent">
              Explore Products
            </Link>
            <Link href="/contact" className="btn btn-ghost">
              Request a Quote
            </Link>
          </div>

          {/* Trust badges */}
          <div className="reveal reveal-delay-3 mt-12 flex flex-wrap gap-x-6 gap-y-2">
            {["ISO 9001 Certified", "AFBMA / DIN / ISO Grades", "45+ Years Experience"].map(b => (
              <span key={b} className="flex items-center gap-2 text-[0.72rem] font-semibold uppercase tracking-[0.15em] text-white/55">
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--copper-light)] shrink-0" />
                {b}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          STATS
      ═══════════════════════════════════════ */}
      <section className="section-tight">
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

      {/* ═══════════════════════════════════════
          ABOUT STRIP
      ═══════════════════════════════════════ */}
      <section className="section">
        <div className="mx-auto grid max-w-6xl gap-12 px-4 md:grid-cols-2 md:items-center md:px-6">
          <div>
            <p className="eyebrow" style={{ color: "var(--orange)" }}>Who we are</p>
            <h2 className="section-title mt-4">
              Precision balls engineered for demanding industry
            </h2>
            <p className="section-copy">
              Founded by Mr. Yashpal Verma, DSP is a leading manufacturer of precision-grade balls
              in high carbon chrome steel, stainless steels, brass, copper, tungsten carbide,
              ceramics and specialty materials — made to AFBMA, DIN &amp; ISO grades or your drawings.
            </p>
            <ul className="feature-list mt-7">
              <li>Full in-house process capabilities</li>
              <li>Self-certification status with reputed customers</li>
              <li>QS 9000 &amp; TS 16949 customer ecosystem</li>
              <li>ISO 9001 certified quality systems</li>
            </ul>
            <Link href="/about" className="btn btn-primary mt-9">About DSP</Link>
          </div>

          <div className="relative">
            <div className="absolute -inset-4 rounded-2xl bg-gradient-to-br from-[var(--orange)]/10 to-[var(--gold)]/10 blur-2xl" aria-hidden />
            <ComingSoon label="Plant / product image coming soon" aspect="square"
              className="relative border border-[var(--line)] shadow-[var(--shadow-lg)]" />
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          PRODUCTS
      ═══════════════════════════════════════ */}
      <section className="section bg-[var(--surface)]">
        <div className="mx-auto max-w-6xl px-4 md:px-6">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div>
              <p className="eyebrow" style={{ color: "var(--copper)" }}>Product range</p>
              <h2 className="section-title mt-4">Built for every grade &amp; material</h2>
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

      {/* ═══════════════════════════════════════
          QUALITY + CERT
      ═══════════════════════════════════════ */}
      <section className="section">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 md:grid-cols-[1fr_1.1fr] md:px-6">
          <div className="bg-white border border-[var(--line)] rounded-2xl p-8 md:p-10 shadow-[var(--shadow-md)]">
            <p className="eyebrow" style={{ color: "var(--copper)" }}>Quality circle</p>
            <h2 className="section-title mt-4">Committed to total customer satisfaction</h2>
            <p className="section-copy">
              Products are delivered after understanding technical requirements,
              with continual improvement of the quality management system through teamwork.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/quality" className="btn btn-primary">Quality policy</Link>
              <Link href="/technical" className="btn"
                style={{ background: "transparent", color: "var(--steel-deep)", border: "1.5px solid var(--line)" }}>
                Technical helpdesk
              </Link>
            </div>
          </div>
          <div className="relative">
              <div className="absolute -inset-4 rounded-2xl bg-gradient-to-br from-[var(--orange)]/10 to-[var(--gold)]/10 blur-2xl" aria-hidden />
            <ComingSoon label="Certificate / lab image coming soon" aspect="wide"
              className="relative border border-[var(--line)] min-h-[240px] shadow-[var(--shadow-lg)]" />
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          CARDS GRID
      ═══════════════════════════════════════ */}
      <section className="section pt-0">
        <div className="mx-auto max-w-6xl px-4 md:px-6">
          <div className="grid gap-5 md:grid-cols-2">
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
                className="group bg-white border border-[var(--line)] rounded-2xl p-8 transition-all duration-300 hover:border-[var(--steel)] hover:shadow-[var(--shadow-lg)] hover:-translate-y-1">
                <p className="eyebrow" style={{ color: "var(--copper)" }}>{card.tag}</p>
                <h3 className="mt-4 font-display text-2xl text-[var(--ink)] group-hover:text-[var(--steel)] transition-colors">
                  {card.title}
                </h3>
                <p className="mt-3 text-sm text-[var(--muted)] leading-relaxed">{card.desc}</p>
                <span className="mt-6 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-[var(--copper)]">
                  Learn more
                  <span aria-hidden className="transition-transform group-hover:translate-x-1.5">→</span>
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          CTA BANNER
      ═══════════════════════════════════════ */}
      <section className="section pt-0">
        <div className="mx-auto max-w-6xl px-4 md:px-6">
          <div className="relative overflow-hidden rounded-2xl px-8 py-14 md:px-14 text-white shadow-[var(--shadow-xl)]" style={{ background: "linear-gradient(135deg,#7c2d12 0%,#c2410c 55%,#ea580c 100%)" }}>
            {/* decorative glows */}
            <div aria-hidden className="pointer-events-none absolute inset-0">
              <div className="absolute top-0 right-0 w-96 h-96 translate-x-1/2 -translate-y-1/2 rounded-full bg-[var(--gold)]/25 blur-3xl" />
              <div className="absolute bottom-0 left-0 w-64 h-64 -translate-x-1/3 translate-y-1/3 rounded-full bg-[var(--orange-mid)]/30 blur-2xl" />
              {/* grid lines */}
              <div className="absolute inset-0" style={{
                backgroundImage: "repeating-linear-gradient(90deg,transparent 0,transparent 44px,rgba(255,255,255,0.025) 44px,rgba(255,255,255,0.025) 45px)"
              }} />
            </div>

            <div className="relative grid gap-8 md:grid-cols-[1.5fr_auto] md:items-center">
              <div>
                <p className="eyebrow text-[var(--gold-light)]">Ready to order?</p>
                <h2 className="mt-4 font-display text-3xl md:text-4xl tracking-wide">
                  Need a custom size, grade or material?
                </h2>
                <p className="mt-4 max-w-xl text-white/70 leading-relaxed">
                  Share your drawings or technical requirements. Our team will respond from{" "}
                  <span className="text-[var(--gold-light)]">{site.email}</span>.
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
