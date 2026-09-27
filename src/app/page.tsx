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

  const sections = Array.isArray(pageData?.sections) ? pageData.sections : [];
  const whoWeAre = sections.find((s) => s.key === "who_we_are") || sections[0];
  const productRange = sections.find((s) => s.key === "product_range");
  const qualityCircle = sections.find((s) => s.key === "quality_circle");
  const orderCta = sections.find((s) => s.key === "order_cta");

  // Who We Are Section
  const whoWeAreHeading = whoWeAre?.heading || "Precision balls engineered for demanding industry";
  const whoWeAreSubheading = whoWeAre?.subheading || "Who we are";
  const whoWeAreBody =
    whoWeAre?.body ||
    "Founded by Mr. Yashpal Verma, DSP is a leading manufacturer of precision-grade balls in high carbon chrome steel, stainless steels, brass, copper, tungsten carbide, ceramics and specialty materials — made to AFBMA, DIN & ISO grades or your drawings.";

  const whoWeAreFeatures =
    Array.isArray(whoWeAre?.features) && whoWeAre.features.length > 0
      ? (whoWeAre.features as string[])
      : [
          "Full in-house process capabilities",
          "Self-certification status with reputed customers",
          "QS 9000 & TS 16949 customer ecosystem",
          "ISO 9001 certified quality systems",
        ];

  const whoWeAreButtonText = (whoWeAre?.buttonText as string) || "About DSP";
  const whoWeAreButtonLink = (whoWeAre?.buttonLink as string) || "/about";
  const rawWhoWeAreMedia = (whoWeAre?.videoUrl as string) || (whoWeAre?.imageUrl as string) || "";
  const whoWeAreMediaUrl = rawWhoWeAreMedia && rawWhoWeAreMedia !== "/images/hero/hero-desktop.jpg" ? rawWhoWeAreMedia : "";

  // Product Range Section
  const productRangeSubheading = (productRange?.subheading as string) || "Product range";
  const productRangeHeading = (productRange?.heading as string) || "Built for every grade & material";
  const productRangeBody =
    (productRange?.body as string) ||
    "From bearing steel to ceramics and gauging balls — explore our core catalogue.";
  const productRangeButtonText = (productRange?.buttonText as string) || "View all products";
  const productRangeButtonLink = (productRange?.buttonLink as string) || "/products";

  // Quality Circle Section
  const qualityCircleSubheading = (qualityCircle?.subheading as string) || "Quality circle";
  const qualityCircleHeading = (qualityCircle?.heading as string) || "Committed to total customer satisfaction";
  const qualityCircleBody =
    (qualityCircle?.body as string) ||
    "Products are delivered after understanding technical requirements, with continual improvement of the quality management system through teamwork.";
  const qualityCircleButtonText = (qualityCircle?.buttonText as string) || "Quality policy";
  const qualityCircleButtonLink = (qualityCircle?.buttonLink as string) || "/quality";

  // Order CTA Banner
  const orderCtaSubheading = (orderCta?.subheading as string) || "Ready to order?";
  const orderCtaHeading = (orderCta?.heading as string) || "Need a custom size, grade or material?";
  const orderCtaBody =
    (orderCta?.body as string) ||
    "Share your drawings or technical requirements. Our team will respond promptly from ";
  const orderCtaButtonText = (orderCta?.buttonText as string) || "Contact sales";
  const orderCtaButtonLink = (orderCta?.buttonLink as string) || "/contact";

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
                {productRangeSubheading}
              </p>
              <h2 className="section-title mt-4">
                {productRangeHeading}
              </h2>
              <p className="section-copy">
                {productRangeBody}
              </p>
            </div>
            <Link
              href={productRangeButtonLink}
              className="btn btn-primary shrink-0"
            >
              {productRangeButtonText}
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
              {qualityCircleSubheading}
            </p>
            <h2 className="section-title mt-4">
              {qualityCircleHeading}
            </h2>
            <p className="section-copy">
              {qualityCircleBody}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href={qualityCircleButtonLink} className="btn btn-primary">
                {qualityCircleButtonText}
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
                  {orderCtaSubheading}
                </p>
                <h2 className="mt-4 font-display text-3xl md:text-4xl tracking-wide">
                  {orderCtaHeading}
                </h2>
                <p className="mt-4 max-w-xl text-white/70 leading-relaxed">
                  {orderCtaBody}
                  <span className="text-[var(--gold-light)]">{site.email}</span>.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <Link
                  href={orderCtaButtonLink}
                  className="btn btn-accent"
                >
                  {orderCtaButtonText}
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
