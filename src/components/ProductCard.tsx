import Link from "next/link";
import type { Product } from "@/data/products";
import ComingSoon from "./ComingSoon";

export default function ProductCard({ product }: { product: Product }) {
  return (
    <Link
      href={`/products/${product.slug}`}
      className="product-card group block bg-white border border-[var(--line)] rounded-xl overflow-hidden shadow-[var(--shadow-sm)] hover:shadow-[var(--shadow-md)] transition-all duration-300 hover:-translate-y-1"
    >
      {product.imageUrl ? (
        <div className="relative aspect-[16/10] overflow-hidden bg-slate-50 border-b border-[var(--line)]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={product.imageUrl}
            alt={product.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
        </div>
      ) : (
        <ComingSoon
          label={`${product.title} — image coming soon`}
          aspect="wide"
          className="rounded-none border-0 border-b border-[var(--line)]"
        />
      )}
      <div className="p-5">
        <h3 className="font-display text-xl tracking-wide text-[var(--ink)] transition group-hover:text-[var(--steel)]">
          {product.title}
        </h3>
        <p className="mt-2 text-sm leading-relaxed text-[var(--muted)]">
          {product.short}
        </p>
        <span className="mt-4 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--copper)]">
          View details
          <span aria-hidden className="transition group-hover:translate-x-1">
            →
          </span>
        </span>
      </div>
    </Link>
  );
}
