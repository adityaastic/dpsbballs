import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import ComingSoon from "@/components/ComingSoon";
import ProductHeroBanner from "@/components/ProductHeroBanner";
import { getProduct, getProducts } from "@/lib/cms";
import { resolveNextPageMetadata } from "@/lib/seoCms";
import { getProductBannerConfig } from "@/lib/productBanners";
import { verifySession } from "@/lib/auth";

type Props = { params: Promise<{ slug: string }> };

export const dynamic = "force-dynamic";
export const dynamicParams = true;
export const revalidate = 0;

export async function generateStaticParams() {
  const products = await getProducts();
  const set = new Set<string>();
  products.forEach((p) => {
    set.add(p.slug);
    if (p.slug.endsWith("s")) set.add(p.slug.slice(0, -1));
    if (p.slug.includes("aluminium")) {
      set.add(p.slug.replace("aluminium", "aluminum"));
      if (p.slug.endsWith("s")) set.add(p.slug.replace("aluminium", "aluminum").slice(0, -1));
    }
  });
  return Array.from(set).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) return { title: "Product" };
  return resolveNextPageMetadata({
    entityType: "product",
    entityId: product.slug,
    urlPath: `/products/${product.slug}`,
    fallbackTitle: `${product.title} Manufacturer & Supplier India`,
    fallbackDescription: product.short || product.description,
    fallbackImage: product.imageUrl,
    fallbackKeywords: [
      product.title,
      `${product.title} manufacturer India`,
      ...(product.grades || []),
    ],
  });
}

export default async function ProductDetailPage({ params }: Props) {
  const { slug } = await params;
  const [product, products, session] = await Promise.all([
    getProduct(slug),
    getProducts(),
    verifySession(),
  ]);
  if (!product) notFound();

  const isAdmin = Boolean(session && session.role === "admin");
  const initialBanner = await getProductBannerConfig(
    product.slug,
    (product as any).id || (product as any)._id
  );

  const others = products.filter((p) => p.slug !== product.slug).slice(0, 3);

  const baseUrl = (process.env.NEXT_PUBLIC_SITE_URL || "https://www.dspballs.co.in").replace(/\/$/, "");
  const productSchema = {
    "@context": "https://schema.org",
    "@type": "Product",
    "@id": `${baseUrl}/products/${product.slug}/#product`,
    name: product.title,
    description: product.description || product.short,
    image: product.imageUrl ? [product.imageUrl] : [`${baseUrl}/images/certifications/gsci-cert.jpg`],
    category: "Precision Balls",
    brand: {
      "@type": "Brand",
      name: "DSP Precision",
    },
    manufacturer: {
      "@type": "Organization",
      name: "DSP Precision Products Pvt. Ltd.",
    },
    offers: {
      "@type": "AggregateOffer",
      priceCurrency: "INR",
      price: "100",
      itemCondition: "https://schema.org/NewCondition",
      availability: "https://schema.org/InStock",
    },
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: baseUrl,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Products",
        item: `${baseUrl}/products`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: product.title,
        item: `${baseUrl}/products/${product.slug}`,
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <ProductHeroBanner
        product={product}
        initialBanner={initialBanner}
        isAdmin={isAdmin}
      />

      <section className="section">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 md:grid-cols-[1.2fr_0.8fr] md:px-6">
          <div>
            <h2 className="section-title">Overview</h2>
            <p className="section-copy">{product.description}</p>

            {product.highlights && product.highlights.length > 0 && (
              <ul className="feature-list mt-6">
                {product.highlights.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            )}

            {product.grades && product.grades.length > 0 && (
              <div className="mt-8">
                <h3 className="font-display text-xl text-[var(--ink)]">
                  Available options
                </h3>
                <div className="mt-3 flex flex-wrap gap-2">
                  {product.grades.map((g) => (
                    <span
                      key={g}
                      className="border border-[var(--line)] bg-[var(--surface)] px-3 py-1.5 text-sm text-[var(--ink)]"
                    >
                      {g}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {product.specs && product.specs.length > 0 && (
              <div className="mt-8 overflow-x-auto">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Property</th>
                      <th>Value</th>
                    </tr>
                  </thead>
                  <tbody>
                    {product.specs.map((row) => (
                      <tr key={row.label}>
                        <td>{row.label}</td>
                        <td>{row.value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {product.tables?.map((table) => (
              <div key={table.title} className="mt-8 overflow-x-auto">
                <h3 className="mb-3 font-display text-xl text-[var(--ink)]">
                  {table.title}
                </h3>
                <table className="data-table">
                  <thead>
                    <tr>
                      {table.headers.map((h) => (
                        <th key={h}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {table.rows.map((row, idx) => (
                      <tr key={idx}>
                        {row.map((cell, j) => (
                          <td key={j}>{cell}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ))}
          </div>

          <aside className="h-fit border border-[var(--line)] bg-white p-6">
            <p className="eyebrow" style={{ color: "var(--copper)" }}>
              Need this product?
            </p>
            <p className="mt-3 text-sm leading-relaxed text-[var(--muted)]">
              Share size, grade, material and quantity. We manufacture to
              standard grades or customer drawings.
            </p>
            <Link href="/contact" className="btn btn-primary mt-5 w-full">
              Send enquiry
            </Link>
            {product.imageUrl ? (
              <div className="mt-6 border border-[var(--line)] rounded overflow-hidden">
                {/* eslint-disable-next-line */}
                <img src={product.imageUrl} alt={product.title} className="w-full aspect-square object-cover" />
              </div>
            ) : (
              <ComingSoon
                label="Replace with product close-up later"
                aspect="square"
                className="mt-6 border border-[var(--line)]"
              />
            )}
          </aside>
        </div>
      </section>

      <section className="section bg-[var(--surface)]">
        <div className="mx-auto max-w-6xl px-4 md:px-6">
          <h2 className="section-title">Related products</h2>
          <div className="mt-8 grid gap-5 sm:grid-cols-3">
            {others.map((p) => (
              <Link
                key={p.slug}
                href={`/products/${p.slug}`}
                className="border border-[var(--line)] bg-white p-5 transition hover:border-[var(--steel)]"
              >
                <h3 className="font-display text-lg text-[var(--ink)]">
                  {p.title}
                </h3>
                <p className="mt-2 text-sm text-[var(--muted)]">{p.short}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
