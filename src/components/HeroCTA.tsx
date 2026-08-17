"use client";

import Link from "next/link";

type TaglineData = { tagline: string };

export default function HeroCTA({ tagline }: TaglineData) {
  const trustBadges = ["ISO 9001 Certified", "AFBMA / DIN / ISO Grades", "45+ Years Experience"];

  return (
    <>
      <p className="eyebrow reveal">Since 1995 · Baddi, Himachal Pradesh</p>

      <h1 className="brand-lockup reveal reveal-delay-1 mt-5">
        DSP<br />Precision
      </h1>

      <p className="reveal reveal-delay-2 mt-6 max-w-xl text-base md:text-lg leading-relaxed text-white/78">
        {tagline}. Precision-grade balls to{" "}
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

      {/* Trust badges - compact */}
      <div className="reveal reveal-delay-3 mt-10 flex flex-wrap gap-x-5 gap-y-2">
        {trustBadges.slice(0, 2).map(b => (
          <span key={b} className="flex items-center gap-2 text-[0.72rem] font-semibold uppercase tracking-[0.15em] text-white/55">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--copper-light)] shrink-0" />
            {b}
          </span>
        ))}
      </div>
    </>
  );
}
