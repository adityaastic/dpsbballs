import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import ComingSoon from "@/components/ComingSoon";
import { getProduct, getProducts } from "@/lib/cms";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  const products = await getProducts();
  return products.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) return { title: "Product" };
  return {
    title: product.title,
    description: product.short,
  };
}

export default async function ProductDetailPage({ params }: Props) {
  const { slug } = await params;
  const [product, products] = await Promise.all([
    getProduct(slug),
    getProducts(),
  ]);
  if (!product) notFound();

  const others = products.filter((p) => p.slug !== product.slug).slice(0, 3);

  return (
    <>
      <section className="page-hero">
        <div className="page-hero-bg" aria-hidden />
        <div className="relative mx-auto grid max-w-6xl gap-8 px-4 py-14 md:grid-cols-2 md:items-end md:px-6 md:py-20">
          <div>
            <p className="eyebrow">
              <Link href="/products" className="hover:underline">
                Products
              </Link>{" "}
              / {product.title}
            </p>
            <h1 className="mt-3 font-display text-4xl tracking-tight text-white md:text-5xl">
              {product.title}
            </h1>
            <p className="mt-4 max-w-xl text-white/75">{product.short}</p>
            <Link href="/contact" className="btn btn-accent mt-8">
              Enquire now
            </Link>
          </div>
          {product.imageUrl ? (
            <div className="rounded overflow-hidden border border-white/10">
              {/* eslint-disable-next-line */}
              <img src={product.imageUrl} alt={product.title} className="w-full h-full object-cover aspect-[16/9]" />
            </div>
          ) : (
            <ComingSoon
              label={`${product.title} photo coming soon`}
              aspect="wide"
              className="border border-white/10"
            />
          )}
        </div>
      </section>

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
