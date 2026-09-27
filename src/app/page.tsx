import Link from "next/link";
import ComingSoon from "@/components/ComingSoon";
import ProductCard from "@/components/ProductCard";
import HomeHero from "@/components/HomeHero";
import CertificationBadges from "@/components/CertificationBadges";
import { getProducts, getSiteData, getPageContent, type HeroSlide } from "@/lib/cms";
import type { Product } from "@/data/products";

type SiteHighlight = { label: string; value: string };
type SiteData = {
  name: string;
  shortName: string;
  tagline: string;
  logoUrl?: string;
  logoDarkUrl?: string;
  faviconUrl?: string;
  email: string;
  phoneWork?: string;
  phoneRegd?: string;
  phoneFax?: string;
  mobile?: string;
  whatsapp?: string;
  highlights: SiteHighlight[];
};

export const dynamic = "force-dynamic";
export const revalidate = 0;

function isVideo(url?: string): boolean {
  if (!url) return false;
  return /\.(mp4|webm|ogg|mov)(\?.*)?$/i.test(url);
}

export default async function HomePage() {
  const [{ site, heroSlides }, products, pageData] = await Promise.all([
    getSiteData() as Promise<{
      site: SiteData;
      heroSlides: HeroSlide[];
      navLinks: { href: string; label: string }[];
      seo: { title: string; description: string };
    }>,
    getProducts() as Promise<Product[]>,
    getPageContent("home"),
  ]);

  const slides: HeroSlide[] = heroSlides?.length
    ? [...heroSlides].sort((a: HeroSlide, b: HeroSlide) => (a.order || 0) - (b.order || 0))
    : [
        { desktopUrl: "", mobileUrl: "", headline: "", subline: "", order: 0 },
        { desktopUrl: "", mobileUrl: "", headline: "", subline: "", order: 1 },
        { desktopUrl: "", mobileUrl: "", headline: "", subline: "", order: 2 },
      ];

  const sec0 = pageData?.sections?.[0];
  const sec1 = pageData?.sections?.[1];
  const sec2 = pageData?.sections?.[2];
  const sec3 = pageData?.sections?.[3];

  const whoWeAreHeading = sec0?.heading || "Precision balls engineered for demanding industry";
  const whoWeAreSubheading = sec0?.subheading || "Who we are";
  const whoWeAreBody =
    sec0?.body ||
    "Founded by Mr. Yashpal Verma, DSP is a leading manufacturer of precision-grade balls in high carbon chrome steel, stainless steels, brass, copper, tungsten carbide, ceramics and specialty materials — made to AFBMA, DIN & ISO grades or your drawings.";

  const whoWeAreFeatures =
    Array.isArray(sec0?.features) && sec0.features.length > 0
      ? (sec0.features as string[])
      : [
          "Full in-house process capabilities",
          "Self-certification status with reputed customers",
          "QS 9000 & TS 16949 customer ecosystem",
          "ISO 9001 certified quality systems",
        ];

  const whoWeAreButtonText = (sec0?.buttonText as string) || "About DSP";
  const whoWeAreButtonLink = (sec0?.buttonLink as string) || "/about";
  const whoWeAreMediaUrl = (sec0?.videoUrl as string) || (sec0?.imageUrl as string) || "";

  return (
    <>
      <HomeHero slides={slides} tagline={site.tagline} />

      <section className="section-tight">
        <div className="mx-auto max-w-6xl px-4 md:px-6">
          <div className="stat-strip">
            {site.highlights.map((item: SiteHighlight) => (
              <div key={item.label} className="stat-item">
                <strong>{item.value}</strong>
                <span>{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* WHO WE ARE SECTION - FULLY DYNAMIC */}
      <section className="section">
        <div className="mx-auto grid max-w-6xl gap-12 px-4 md:grid-cols-2 md:items-center md:px-6">
          <div>
            <p className="eyebrow" style={{ color: "var(--orange)" }}>{whoWeAreSubheading}</p>
            <h2 className="section-title mt-4">{whoWeAreHeading}</h2>
            <div className="section-copy mt-4 space-y-3">
              {whoWeAreBody.split(/\n\n+/).map((para, i) => (
                <p key={i}>{para}</p>
              ))}
            </div>
            <ul className="feature-list mt-7">
              {whoWeAreFeatures.map((feat, i) => (
                <li key={i}>{feat}</li>
              ))}
            </ul>
            <Link href={whoWeAreButtonLink} className="btn btn-primary mt-9">
              {whoWeAreButtonText}
            </Link>
          </div>

          <div className="relative">
            <div
              className="absolute -inset-4 rounded-2xl bg-gradient-to-br from-[var(--orange)]/10 to-[var(--gold)]/10 blur-2xl"
              aria-hidden
            />
            {whoWeAreMediaUrl ? (
              isVideo(whoWeAreMediaUrl) ? (
                <video
                  src={whoWeAreMediaUrl}
                  controls
                  autoPlay
                  loop
                  muted
                  playsInline
                  preload="metadata"
                  className="relative rounded-2xl border border-[var(--line)] shadow-[var(--shadow-lg)] w-full aspect-square object-cover"
                />
              ) : (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={whoWeAreMediaUrl}
                  alt={whoWeAreHeading}
                  className="relative rounded-2xl border border-[var(--line)] shadow-[var(--shadow-lg)] w-full aspect-square object-cover"
                />
              )
            ) : (
              <ComingSoon
                label="Plant / product image coming soon"
                aspect="square"
                className="relative border border-[var(--line)] shadow-[var(--shadow-lg)]"
              />
            )}
          </div>
        </div>
      </section>

      {/* PRODUCT RANGE SECTION */}
      <section className="section bg-[var(--surface)]">
        <div className="mx-auto max-w-6xl px-4 md:px-6">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div>
              <p className="eyebrow" style={{ color: "var(--copper)" }}>
                {(sec1?.subheading as string) || "Product range"}
              </p>
              <h2 className="section-title mt-4">
                {(sec1?.heading as string) || "Built for every grade & material"}
              </h2>
              <p className="section-copy">
                {(sec1?.body as string) ||
                  "From bearing steel to ceramics and gauging balls — explore our core catalogue."}
              </p>
            </div>
            <Link
              href={(sec1?.buttonLink as string) || "/products"}
              className="btn btn-primary shrink-0"
            >
              {(sec1?.buttonText as string) || "View all products"}
            </Link>
          </div>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {products.slice(0, 6).map((product: Product) => (
              <ProductCard key={product.slug} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* QUALITY CIRCLE SECTION */}
      <section className="section">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 lg:grid-cols-[1fr_1.1fr] md:px-6 items-center">
          <div className="bg-white border border-[var(--line)] rounded-2xl p-8 md:p-10 shadow-[var(--shadow-md)]">
            <p className="eyebrow" style={{ color: "var(--copper)" }}>
              {(sec2?.subheading as string) || "Quality circle"}
            </p>
            <h2 className="section-title mt-4">
              {(sec2?.heading as string) || "Committed to total customer satisfaction"}
            </h2>
            <p className="section-copy">
              {(sec2?.body as string) ||
                "Products are delivered after understanding technical requirements, with continual improvement of the quality management system through teamwork."}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/quality" className="btn btn-primary">
                Quality policy
              </Link>
              <Link
                href="/technical"
                className="btn"
                style={{
                  background: "transparent",
                  color: "var(--steel-deep)",
                  border: "1.5px solid var(--line)",
                }}
              >
                Technical helpdesk
              </Link>
            </div>
          </div>
          <div className="relative">
            <div
              className="absolute -inset-4 rounded-2xl bg-gradient-to-br from-[var(--orange)]/10 to-[var(--gold)]/10 blur-2xl"
              aria-hidden
            />
            <CertificationBadges className="relative" />
          </div>
        </div>
      </section>

      {/* QUICK LINKS SECTION */}
      <section className="section pt-0">
        <div className="mx-auto max-w-6xl px-4 md:px-6">
          <div className="grid gap-5 md:grid-cols-2">
            {[
              {
                href: "/clients",
                tag: "Clients",
                title: "Client appreciation",
                desc: "Read feedback from first-time and repeat buyers worldwide.",
              },
              {
                href: "/technical#enquiry",
                tag: "Helpdesk",
                title: "New or experienced buyer forms",
                desc: "Submit technical requirements with size, grade and quantity.",
              },
            ].map((card) => (
              <Link
                key={card.href}
                href={card.href}
                className="group bg-white border border-[var(--line)] rounded-2xl p-8 transition-all duration-300 hover:border-[var(--steel)] hover:shadow-[var(--shadow-lg)] hover:-translate-y-1"
              >
                <p className="eyebrow" style={{ color: "var(--copper)" }}>
                  {card.tag}
                </p>
                <h3 className="mt-4 font-display text-2xl text-[var(--ink)] group-hover:text-[var(--steel)] transition-colors">
                  {card.title}
                </h3>
                <p className="mt-3 text-sm text-[var(--muted)] leading-relaxed">
                  {card.desc}
                </p>
                <span className="mt-6 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-[var(--copper)]">
                  Learn more
                  <span
                    aria-hidden
                    className="transition-transform group-hover:translate-x-1.5"
                  >
                    →
                  </span>
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CALL TO ACTION BANNER */}
      <section className="section pt-0">
        <div className="mx-auto max-w-6xl px-4 md:px-6">
          <div
            className="relative overflow-hidden rounded-2xl px-8 py-14 md:px-14 text-white shadow-[var(--shadow-xl)]"
            style={{
              background:
                "linear-gradient(135deg,#7c2d12 0%,#c2410c 55%,#ea580c 100%)",
            }}
          >
            <div aria-hidden className="pointer-events-none absolute inset-0">
              <div className="absolute top-0 right-0 w-96 h-96 translate-x-1/2 -translate-y-1/2 rounded-full bg-[var(--gold)]/25 blur-3xl" />
              <div className="absolute bottom-0 left-0 w-64 h-64 -translate-x-1/3 translate-y-1/3 rounded-full bg-[var(--orange-mid)]/30 blur-2xl" />
              <div
                className="absolute inset-0"
                style={{
                  backgroundImage:
                    "repeating-linear-gradient(90deg,transparent 0,transparent 44px,rgba(255,255,255,0.025) 44px,rgba(255,255,255,0.025) 45px)",
                }}
              />
            </div>

            <div className="relative grid gap-8 md:grid-cols-[1.5fr_auto] md:items-center">
              <div>
                <p className="eyebrow text-[var(--gold-light)]">
                  {(sec3?.subheading as string) || "Ready to order?"}
                </p>
                <h2 className="mt-4 font-display text-3xl md:text-4xl tracking-wide">
                  {(sec3?.heading as string) ||
                    "Need a custom size, grade or material?"}
                </h2>
                <p className="mt-4 max-w-xl text-white/70 leading-relaxed">
                  {(sec3?.body as string) ||
                    "Share your drawings or technical requirements. Our team will respond promptly from "}
                  <span className="text-[var(--gold-light)]">{site.email}</span>.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <Link
                  href={(sec3?.buttonLink as string) || "/contact"}
                  className="btn btn-accent"
                >
                  {(sec3?.buttonText as string) || "Contact sales"}
                </Link>
                <Link href="/products" className="btn btn-ghost">
                  Browse products
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
