"use client";

import { useEffect, useRef, useState } from "react";
import type { HeroSlide } from "@/lib/cms";

export function isVideoUrl(url?: string): boolean {
  if (!url) return false;
  return (
    /\.(mp4|webm|ogg|mov|m4v)(\?.*)?$/i.test(url) ||
    url.includes("/video/") ||
    url.startsWith("data:video/")
  );
}

function HeroMediaItem({ url, alt, className }: { url: string; alt: string; className: string }) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.defaultMuted = true;
      videoRef.current.muted = true;
      videoRef.current.play().catch(() => {});
    }
  }, [url]);

  if (isVideoUrl(url)) {
    return (
      <video
        ref={videoRef}
        src={url}
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
        className={className}
      />
    );
  }
  return (
    /* eslint-disable-next-line @next/next/no-img-element */
    <img
      src={url}
      alt={alt}
      className={className}
    />
  );
}

function HomeHero({ slides }: { slides: HeroSlide[]; tagline?: string }) {
  const [activeIdx, setActiveIdx] = useState(0);
  const [activeDesktopIdx, setActiveDesktopIdx] = useState(0);
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const desktopIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const defaultFallbackImage =
    "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=1920&q=80";

  const normalizedSlides = slides && slides.length > 0 ? slides : [];

  // Desktop slides setup
  const desktopSlides = normalizedSlides.filter((s) => Boolean(s.desktopUrl || s.mobileUrl));
  const effectiveDesktopSlides = desktopSlides.length > 0 ? desktopSlides : [
    { desktopUrl: defaultFallbackImage, mobileUrl: defaultFallbackImage, headline: "", subline: "", order: 0 }
  ];

  // Desktop auto-advance when multiple slides exist
  useEffect(() => {
    if (effectiveDesktopSlides.length <= 1) return;
    desktopIntervalRef.current = setInterval(() => {
      setActiveDesktopIdx((i) => (i + 1) % effectiveDesktopSlides.length);
    }, 6000);
    return () => {
      if (desktopIntervalRef.current) clearInterval(desktopIntervalRef.current);
    };
  }, [effectiveDesktopSlides.length]);

  const goToDesktop = (i: number) => {
    if (effectiveDesktopSlides.length === 0) return;
    const next = (i + effectiveDesktopSlides.length) % effectiveDesktopSlides.length;
    setActiveDesktopIdx(next);
    if (desktopIntervalRef.current) {
      clearInterval(desktopIntervalRef.current);
      desktopIntervalRef.current = setInterval(() => {
        setActiveDesktopIdx((cur) => (cur + 1) % effectiveDesktopSlides.length);
      }, 6000);
    }
  };

  // Mobile slides setup (ensure at least 3 slides for smooth carousel)
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
      {/* DESKTOP FULL-PAGE BANNER (PHOTO / VIDEO SUPPORT) */}
      <div className="home-hero-media home-hero-media-desktop relative overflow-hidden group">
        <div
          className="flex w-full transition-transform duration-700 ease-out"
          style={{ transform: `translateX(-${activeDesktopIdx * 100}%)` }}
        >
          {effectiveDesktopSlides.map((slide, idx) => {
            const url = slide.desktopUrl || slide.mobileUrl || defaultFallbackImage;
            return (
              <div key={`desk-${idx}`} className="w-full shrink-0 flex-none">
                <HeroMediaItem
                  url={url}
                  alt={slide.headline || `DSP Precision Products Banner ${idx + 1}`}
                  className="w-full h-auto block"
                />
              </div>
            );
          })}
        </div>

        {effectiveDesktopSlides.length > 1 && (
          <>
            <button
              type="button"
              aria-label="Previous slide"
              onClick={() => goToDesktop(activeDesktopIdx - 1)}
              className="absolute left-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-black/40 hover:bg-black/70 text-white backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 z-10 cursor-pointer"
            >
              ❮
            </button>
            <button
              type="button"
              aria-label="Next slide"
              onClick={() => goToDesktop(activeDesktopIdx + 1)}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-black/40 hover:bg-black/70 text-white backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 z-10 cursor-pointer"
            >
              ❯
            </button>

            <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex items-center gap-2 z-10 bg-black/30 backdrop-blur-md px-3 py-1.5 rounded-full">
              {effectiveDesktopSlides.map((_, i) => (
                <button
                  key={`dot-desk-${i}`}
                  aria-label={`Go to slide ${i + 1}`}
                  onClick={() => goToDesktop(i)}
                  className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                    activeDesktopIdx === i ? "w-8 bg-amber-500" : "w-2 bg-white/60 hover:bg-white"
                  }`}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* MOBILE SLIDER (PHOTO / VIDEO SUPPORT) */}
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
                <HeroMediaItem
                  url={url}
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
