"use client";

import { useEffect, useRef, useState } from "react";
import HeroCTA from "@/components/HeroCTA";
import type { HeroSlide } from "@/lib/cms";

function HomeHero({ slides, tagline }: { slides: HeroSlide[]; tagline: string }) {
  const [activeIdx, setActiveIdx] = useState(0);
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Normalize slides
  const normalizedSlides = slides && slides.length > 0 ? slides : [];
  const count = normalizedSlides.length;

  const hasAnyDesktopImage = normalizedSlides.some((s) => Boolean(s.desktopUrl || s.mobileUrl));
  const hasAnyMobileImage = normalizedSlides.some((s) => Boolean(s.mobileUrl || s.desktopUrl));

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
      {/* DESKTOP BACKGROUND MEDIA */}
      <div className="home-hero-media home-hero-media-desktop" aria-hidden>
        {!hasAnyDesktopImage && <div className="hero-fallback-bg" />}
        {normalizedSlides.map((s, i) => {
          const url = s.desktopUrl || s.mobileUrl;
          if (!url) return null;
          const isActive = i === activeIdx;
          return (
            <div
              key={`desktop-${i}`}
              className={`hero-layer ${isActive ? "active" : ""}`}
              style={{ backgroundImage: `url("${url}")` }}
            />
          );
        })}
        <div className="hero-overlay-gradients" aria-hidden />

        {count > 1 && hasAnyDesktopImage && (
          <div className="hero-carousel-dots hero-carousel-dots-desktop" role="tablist" aria-label="Hero slides">
            {normalizedSlides.map((_, i) => (
              <button
                key={`dot-desk-${i}`}
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

      {/* MOBILE BACKGROUND MEDIA */}
      <div
        className="home-hero-media home-hero-media-mobile"
        aria-hidden
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
          {normalizedSlides.map((s, i) => {
            const url = s.mobileUrl || s.desktopUrl;
            return (
              <div key={`mob-${i}`} className="mobile-slide">
                {url ? (
                  <div
                    className="mobile-slide-bg"
                    style={{ backgroundImage: `url("${url}")` }}
                  />
                ) : (
                  <div className="mobile-slide-bg mobile-slide-fallback" />
                )}
                <div className="mobile-slide-vignette" aria-hidden />
              </div>
            );
          })}
        </div>

        {count > 1 && (
          <div className="mobile-carousel-dots" role="tablist" aria-label="Hero slides">
            {normalizedSlides.map((_, i) => (
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

      {/* HERO FOREGROUND CONTENT */}
      <div className="home-hero-content">
        <HeroCTA tagline={tagline} />
      </div>
    </section>
  );
}

export default HomeHero;
