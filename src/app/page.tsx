import Link from "next/link";
import ComingSoon from "@/components/ComingSoon";
import ProductCard from "@/components/ProductCard";
import { getProducts, getSiteData } from "@/lib/cms";

export default async function HomePage() {
  const [{ site }, products] = await Promise.all([
    getSiteData(),
    getProducts(),
  ]);

  return (
    <>
      <section className="home-hero">
        <div className="home-hero-media" aria-hidden />
        <div className="home-hero-content">
          <p className="eyebrow reveal">Since 1995 · Baddi, India</p>
          <h1 className="brand-lockup reveal reveal-delay-1 mt-4">
            DSP
            <br />
            Precision
          </h1>
          <p className="reveal reveal-delay-2 mt-5 max-w-lg text-base leading-relaxed text-white/80 md:text-lg">
            {site.tagline}. Precision grade balls to AFBMA, DIN & ISO — built
            for bearings, gauging and industrial assemblies.
          </p>
          <div className="reveal reveal-delay-3 mt-8 flex flex-wrap gap-3">
            <Link href="/products" className="btn btn-accent">
              Explore Products
            </Link>
            <Link href="/contact" className="btn btn-ghost">
              Request Quote
            </Link>
          </div>
        </div>
      </section>

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

      <section className="section">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 md:grid-cols-2 md:items-center md:px-6">
          <div>
            <p className="eyebrow" style={{ color: "var(--copper)" }}>
              Who we are
            </p>
            <h2 className="section-title mt-3">
              Precision balls engineered for demanding industry
            </h2>
            <p className="section-copy">
              Founded by Mr. Yashpal Verma, DSP is a leading manufacturer of
              precision grade balls in high carbon chrome steel, stainless
              steels, brass, copper, tungsten carbide, ceramics and specialty
              materials — made to AFBMA, DIN & ISO grades or your drawings.
            </p>
            <ul className="feature-list mt-6">
              <li>Full in-house process capabilities</li>
              <li>Self-certification status with reputed customers</li>
              <li>QS 9000 & TS 16949 customer ecosystem</li>
              <li>ISO 9001 certified quality systems</li>
            </ul>
            <Link href="/about" className="btn btn-primary mt-8">
              About DSP
            </Link>
          </div>
          <ComingSoon
            label="Plant / product image coming soon"
            aspect="square"
            className="border border-[var(--line)]"
          />
        </div>
      </section>

      <section className="section bg-[var(--surface)]">
        <div className="mx-auto max-w-6xl px-4 md:px-6">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="eyebrow" style={{ color: "var(--copper)" }}>
                Product range
              </p>
              <h2 className="section-title mt-3">Built for every grade & material</h2>
              <p className="section-copy">
                From bearing steel to ceramics and gauging balls — explore our
                core catalogue.
              </p>
            </div>
            <Link href="/products" className="btn btn-primary">
              View all products
            </Link>
          </div>
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {products.slice(0, 6).map((product) => (
              <ProductCard key={product.slug} product={product} />
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 md:grid-cols-[1fr_1.1fr] md:px-6">
          <div className="border border-[var(--line)] bg-[#fff] p-8">
            <p className="eyebrow" style={{ color: "var(--copper)" }}>
              Quality circle
            </p>
            <h2 className="section-title mt-3">Committed to total customer satisfaction</h2>
            <p className="section-copy">
              Products are delivered after understanding technical requirements,
              with continual improvement of the quality management system through
              teamwork.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/quality" className="btn btn-primary">
                Quality policy
              </Link>
              <Link href="/technical" className="btn btn-primary" style={{ background: "transparent", color: "var(--steel-deep)", borderColor: "var(--line)" }}>
                Technical helpdesk
              </Link>
            </div>
          </div>
          <ComingSoon
            label="Certificate / lab image coming soon"
            aspect="wide"
            className="border border-[var(--line)] min-h-[240px]"
          />
        </div>
      </section>

      <section className="section pt-0">
        <div className="mx-auto max-w-6xl px-4 md:px-6">
          <div className="grid gap-5 md:grid-cols-2">
            <Link
              href="/clients"
              className="border border-[var(--line)] bg-white p-7 transition hover:border-[var(--steel)]"
            >
              <p className="eyebrow" style={{ color: "var(--copper)" }}>
                Clients
              </p>
              <h3 className="mt-3 font-display text-2xl text-[var(--ink)]">
                Client appreciation
              </h3>
              <p className="mt-2 text-sm text-[var(--muted)]">
                Read feedback from first-time and repeat buyers worldwide.
              </p>
            </Link>
            <Link
              href="/technical#enquiry"
              className="border border-[var(--line)] bg-white p-7 transition hover:border-[var(--steel)]"
            >
              <p className="eyebrow" style={{ color: "var(--copper)" }}>
                Helpdesk
              </p>
              <h3 className="mt-3 font-display text-2xl text-[var(--ink)]">
                New or experienced buyer forms
              </h3>
              <p className="mt-2 text-sm text-[var(--muted)]">
                Submit technical requirements with size, grade and quantity.
              </p>
            </Link>
          </div>
        </div>
      </section>

      <section className="section pt-0">
        <div className="mx-auto max-w-6xl px-4 md:px-6">
          <div className="relative overflow-hidden bg-[var(--steel-deep)] px-6 py-12 text-white md:px-12">
            <div
              className="pointer-events-none absolute inset-0 opacity-40"
              style={{
                background:
                  "radial-gradient(circle at 90% 20%, rgba(181,106,47,0.45), transparent 40%)",
              }}
            />
            <div className="relative grid gap-6 md:grid-cols-[1.4fr_auto] md:items-center">
              <div>
                <h2 className="font-display text-3xl tracking-wide md:text-4xl">
                  Need a custom size, grade or material?
                </h2>
                <p className="mt-3 max-w-xl text-white/75">
                  Share your drawings or technical requirements. Our team will
                  respond from {site.email}.
                </p>
              </div>
              <Link href="/contact" className="btn btn-accent justify-self-start md:justify-self-end">
                Contact sales
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
