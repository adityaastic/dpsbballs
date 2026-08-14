import Link from "next/link";
import ComingSoon from "./ComingSoon";

type PageHeroProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  ctaHref?: string;
  ctaLabel?: string;
  showMedia?: boolean;
};

export default function PageHero({
  eyebrow,
  title,
  description,
  ctaHref,
  ctaLabel,
  showMedia = true,
}: PageHeroProps) {
  return (
    <section className="page-hero">
      <div className="page-hero-bg" aria-hidden />
      <div className="relative mx-auto grid max-w-6xl gap-8 px-4 py-14 md:grid-cols-[1.1fr_0.9fr] md:items-end md:px-6 md:py-20">
        <div className="reveal">
          {eyebrow && <p className="eyebrow">{eyebrow}</p>}
          <h1 className="mt-3 font-display text-4xl leading-[1.05] tracking-tight text-white md:text-5xl lg:text-6xl">
            {title}
          </h1>
          {description && (
            <p className="mt-4 max-w-xl text-base leading-relaxed text-white/75 md:text-lg">
              {description}
            </p>
          )}
          {ctaHref && ctaLabel && (
            <Link href={ctaHref} className="btn btn-accent mt-8">
              {ctaLabel}
            </Link>
          )}
        </div>
        {showMedia && (
          <div className="reveal reveal-delay-2 overflow-hidden rounded-sm border border-white/10">
            <ComingSoon label="Replace with page photo later" aspect="wide" />
          </div>
        )}
      </div>
    </section>
  );
}
