"use client";

import Link from "next/link";
import { useState } from "react";

type TaglineData = { tagline: string };

export default function HeroCTA({ tagline }: TaglineData) {
  const [moreOpen, setMoreOpen] = useState(false);

  const trustBadges = ["ISO 9001 Certified", "AFBMA / DIN / ISO Grades", "45+ Years Experience"];
  const moreMenuItems = [
    { href: "/quality", label: "Quality Standards", icon: "✓" },
    { href: "/clients", label: "Our Clients", icon: "♦" },
    { href: "/network", label: "Global Network", icon: "◈" },
    { href: "/career", label: "Careers", icon: "☆" },
    { href: "/technical", label: "Technical Helpdesk", icon: "✦" },
    { href: "/docs/catalogue.pdf", label: "Download Catalogue", icon: "↓", external: true },
  ];

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

        {/* More menu button */}
        <div className="relative">
          <button
            onClick={() => setMoreOpen(v => !v)}
            className="btn btn-ghost flex items-center gap-2"
            aria-haspopup="true"
            aria-expanded={moreOpen}
          >
            More
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
              className={`transition-transform ${moreOpen ? "rotate-180" : ""}`}>
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>
          {moreOpen && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setMoreOpen(false)}
                aria-hidden
              />
              <div className="absolute left-0 top-full mt-2 w-60 rounded-xl border border-white/15 bg-[rgba(20,10,5,0.96)] backdrop-blur-md shadow-2xl z-50 overflow-hidden">
                {moreMenuItems.map((item) => (
                  item.external ? (
                    <a key={item.href} href={item.href} target="_blank" rel="noreferrer"
                      onClick={() => setMoreOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 text-sm text-white/80 hover:bg-white/10 hover:text-white transition">
                      <span className="w-6 h-6 flex items-center justify-center rounded-md bg-white/8 text-[var(--copper-light)] text-xs">
                        {item.icon}
                      </span>
                      {item.label}
                    </a>
                  ) : (
                    <Link key={item.href} href={item.href}
                      onClick={() => setMoreOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 text-sm text-white/80 hover:bg-white/10 hover:text-white transition">
                      <span className="w-6 h-6 flex items-center justify-center rounded-md bg-white/8 text-[var(--copper-light)] text-xs">
                        {item.icon}
                      </span>
                      {item.label}
                    </Link>
                  )
                ))}
              </div>
            </>
          )}
        </div>
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
