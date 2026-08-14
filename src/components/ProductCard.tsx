import Link from "next/link";
import type { Product } from "@/data/products";
import ComingSoon from "./ComingSoon";

export default function ProductCard({ product }: { product: Product }) {
  return (
    <Link href={`/products/${product.slug}`} className="product-card group">
      <ComingSoon
        label={`${product.title}`}
        aspect="wide"
        className="rounded-none border-b border-[#e5e5e5]"
      />
      <div className="p-6">
        <h3 className="font-display text-xl uppercase tracking-tight text-[#0a0a0a] transition-colors group-hover:text-[#f97316]">
          {product.title}
        </h3>
        <p className="mt-2 text-xs leading-relaxed text-[#737373]">
          {product.short}
        </p>
        <span className="mt-5 inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#f97316]">
          View details &rarr;
        </span>
      </div>
    </Link>
  );
}
