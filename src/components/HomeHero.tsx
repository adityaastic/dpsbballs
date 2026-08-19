"use client";

import { useEffect, useRef, useState } from "react";
import type { HeroSlide } from "@/lib/cms";

function HomeHero({ slides }: { slides: HeroSlide[]; tagline?: string }) {
  const [activeIdx, setActiveIdx] = useState(0);
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Normalize slides
  const defaultFallbackImage =
    "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=1920&q=80";

  const normalizedSlides = slides && slides.length > 0 ? slides : [];
  const primarySlide = normalizedSlides.find((s) => Boolean(s.desktopUrl || s.mobileUrl)) || normalizedSlides[0];
  const desktopUrl = primarySlide?.desktopUrl || primarySlide?.mobileUrl || defaultFallbackImage;

  // Ensure mobile view has at least 3 slides
  let mobileSlides = [...normalizedSlides];
  while (mobileSlides.length > 0 && mobileSlides.length < 3) {
    mobileSlides = [...mobileSlides, ...normalizedSlides].slice(0, 3);
  }
  if (mobileSlides.length === 0) {
    mobileSlides = [
      { desktopUrl: defaultFallbackImage, mobileUrl: defaultFallbackImage, headline: "", subline: "", order: 0 },
      { desktopUrl: defaultFallbackImage, mobileUrl: defaultFallbackImage, headline: "", subline: "", order: 1 },
      { desktopUrl: defaultFallbackImage, mobileUrl: defaultFallbackImage, headline: "", subline: "", order: 2 },
    ];
  }
  const count = mobileSlides.length;

  useEffect(() => {
    if (count <= 1) return;
    intervalRef.current = setInterval(() => {
      setActiveIdx((i) => (i + 1) % count);
    }, 5500);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [count]);

  const goTo = (i: number) => {
    if (count === 0) return;
    setActiveIdx((i + count) % count);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = setInterval(() => {
        setActiveIdx((cur) => (cur + 1) % count);
      }, 5500);
    }
  };

  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchEndX.current = null;
  };
  const onTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX;
  };
  const onTouchEnd = () => {
    if (touchStartX.current === null || touchEndX.current === null) return;
    const delta = touchEndX.current - touchStartX.current;
    if (Math.abs(delta) > 40) {
      goTo(activeIdx + (delta < 0 ? 1 : -1));
    }
    touchStartX.current = null;
    touchEndX.current = null;
  };

  return (
    <section className="home-hero">
      {/* DESKTOP SINGLE IMAGE (NO SLIDER) */}
      <div className="home-hero-media home-hero-media-desktop">
        {desktopUrl ? (
          <div className="hero-layer active">
            <img
              src={desktopUrl}
              alt="Desktop Hero Banner"
              className="w-full h-full object-contain md:object-fill"
            />
          </div>
        ) : (
          <div className="hero-fallback-bg" />
        )}
      </div>

      {/* MOBILE SLIDER (3+ SLIDES) */}
      <div
        className="home-hero-media home-hero-media-mobile"
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        <div
          className="mobile-track"
          style={{
            transform: `translateX(-${activeIdx * 100}%)`,
            transitionDuration: "650ms",
          }}
        >
          {mobileSlides.map((s, i) => {
            const url = s.mobileUrl || s.desktopUrl || defaultFallbackImage;
            return (
              <div key={`mob-${i}`} className="mobile-slide">
                <img
                  src={url}
                  alt={`Mobile banner ${i + 1}`}
                  className="w-full h-full object-contain"
                />
              </div>
            );
          })}
        </div>

        {count > 1 && (
          <div className="mobile-carousel-dots" role="tablist" aria-label="Hero slides">
            {mobileSlides.map((_, i) => (
              <button
                key={`dot-mob-${i}`}
                role="tab"
                aria-selected={activeIdx === i}
                aria-label={`Go to slide ${i + 1}`}
                onClick={() => goTo(i)}
                className={`carousel-dot ${activeIdx === i ? "carousel-dot-active" : ""}`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

export default HomeHero;
