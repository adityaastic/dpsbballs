import type { Metadata } from "next";
import PageHero from "@/components/PageHero";
import ProductCard from "@/components/ProductCard";
import { getProducts } from "@/lib/cms";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Precision Balls Product Catalogue",
    description:
      "Explore DSP Precision Products full catalogue: chrome steel, stainless steel, tungsten carbide, ceramic, brass, copper, gauge and modified balls manufactured to AFBMA, DIN & ISO standards.",
  };
}

export default async function ProductsPage() {
  const products = await getProducts();
  return (
    <>
      <PageHero
        eyebrow="Catalogue"
        title="Precision balls & allied products"
        description="Steel, stainless, carbide, ceramic, brass/copper, gauge, modified balls and burnishing media — manufactured to international standards."
        ctaHref="/contact"
        ctaLabel="Ask for a quote"
      />

      <section className="section">
        <div className="mx-auto max-w-6xl px-4 md:px-6">
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((product) => (
              <ProductCard key={product.slug} product={product} />
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
