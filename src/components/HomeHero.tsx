"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { HeroSlide } from "@/lib/cms";

export function isVideoUrl(url?: string): boolean {
  if (!url) return false;
  return (
    /\.(mp4|webm|ogg|mov|m4v)(\?.*)?$/i.test(url) ||
    url.includes("/video/") ||
    url.startsWith("data:video/")
  );
}

function HeroMediaItem({
  url,
  alt,
  className,
  isActive = true,
  shouldLoop = false,
  onVideoEnded,
}: {
  url: string;
  alt: string;
  className: string;
  isActive?: boolean;
  shouldLoop?: boolean;
  onVideoEnded?: () => void;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const retriedRef = useRef(false);
  const [hasActivated, setHasActivated] = useState(isActive);

  useEffect(() => {
    if (isActive && !hasActivated) {
      setHasActivated(true);
    }
  }, [isActive, hasActivated]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    video.defaultMuted = true;
    video.muted = true;

    let cancelled = false;

    const attemptPlay = () => {
      if (cancelled || !video) return;
      video.defaultMuted = true;
      video.muted = true;
      const playPromise = video.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => {
          if (cancelled) return;
          const handleCanPlay = () => {
            video.removeEventListener("canplay", handleCanPlay);
            if (!cancelled && isActive) {
              video.muted = true;
              video.play().catch(() => {});
            }
          };
          video.addEventListener("canplay", handleCanPlay);
        });
      }
    };

    if (isActive) {
      retriedRef.current = false;
      if (video.readyState === 0 || video.error) {
        video.load();
        attemptPlay();
      } else {
        if (video.currentTime > 0.2) {
          try {
            video.currentTime = 0;
          } catch {
            // ignore seek errors
          }
        }
        attemptPlay();
      }
    } else {
      video.pause();
    }

    return () => {
      cancelled = true;
    };
  }, [url, isActive, hasActivated]);

  if (isVideoUrl(url)) {
    return (
      <video
        ref={videoRef}
        src={hasActivated ? url : undefined}
        autoPlay={isActive}
        loop={shouldLoop}
        muted
        playsInline
        preload={isActive ? "auto" : "none"}
        onCanPlay={() => {
          const video = videoRef.current;
          if (isActive && video && video.paused) {
            video.muted = true;
            video.play().catch(() => {});
          }
        }}
        onEnded={() => {
          if (!shouldLoop && isActive && onVideoEnded) {
            onVideoEnded();
          }
        }}
        onError={() => {
          const video = videoRef.current;
          if (isActive && video && !retriedRef.current) {
            retriedRef.current = true;
            video.load();
            video.play().catch(() => {});
          }
        }}
        className={className}
      />
    );
  }
  return (
    /* eslint-disable-next-line @next/next/no-img-element */
    <img src={url} alt={alt} loading={isActive ? "eager" : "lazy"} className={className} />
  );
}

function HomeHero({ slides }: { slides: HeroSlide[]; tagline?: string }) {
  const [activeIdx, setActiveIdx] = useState(0);
  const [activeDesktopIdx, setActiveDesktopIdx] = useState(0);
  const [isMobileViewport, setIsMobileViewport] = useState(false);
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const desktopTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(max-width: 767.98px)");
    const update = () => setIsMobileViewport(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  const defaultFallbackImage =
    "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=1920&q=80";

  const normalizedSlides = slides && slides.length > 0 ? slides : [];

  // Desktop slides setup: ONLY slides that have a dedicated desktopUrl!
  const desktopSlides = normalizedSlides.filter((s) =>
    Boolean(s.desktopUrl && s.desktopUrl.trim() !== "")
  );
  const effectiveDesktopSlides =
    desktopSlides.length > 0
      ? desktopSlides
      : [
          {
            desktopUrl: defaultFallbackImage,
            mobileUrl: "",
            headline: "",
            subline: "",
            order: 0,
          },
        ];

  const desktopCount = effectiveDesktopSlides.length;

  const goToDesktop = useCallback(
    (i: number) => {
      if (desktopCount === 0) return;
      if (desktopTimerRef.current) clearTimeout(desktopTimerRef.current);
      setActiveDesktopIdx(((i % desktopCount) + desktopCount) % desktopCount);
    },
    [desktopCount]
  );

  // Desktop auto-advance: only set timer if active slide is an IMAGE (videos advance via onEnded)
  useEffect(() => {
    if (desktopTimerRef.current) clearTimeout(desktopTimerRef.current);
    if (desktopCount <= 1) return;

    const currentSlide = effectiveDesktopSlides[activeDesktopIdx];
    const currentUrl = currentSlide?.desktopUrl || defaultFallbackImage;

    // If current slide is a video, wait for onVideoEnded instead of fixed timer
    if (isVideoUrl(currentUrl)) return;

    desktopTimerRef.current = setTimeout(() => {
      setActiveDesktopIdx((i) => (i + 1) % desktopCount);
    }, 6000);

    return () => {
      if (desktopTimerRef.current) clearTimeout(desktopTimerRef.current);
    };
  }, [activeDesktopIdx, desktopCount, effectiveDesktopSlides]);

  // Mobile slides setup
  const mobileSlidesRaw = normalizedSlides.filter((s) =>
    Boolean(s.mobileUrl?.trim() || s.desktopUrl?.trim())
  );
  const mobileSlides =
    mobileSlidesRaw.length > 0
      ? mobileSlidesRaw
      : [
          {
            desktopUrl: defaultFallbackImage,
            mobileUrl: defaultFallbackImage,
            headline: "",
            subline: "",
            order: 0,
          },
        ];
  const count = mobileSlides.length;

  const goTo = useCallback(
    (i: number) => {
      if (count === 0) return;
      if (timerRef.current) clearTimeout(timerRef.current);
      setActiveIdx(((i % count) + count) % count);
    },
    [count]
  );

  // Mobile auto-advance: only set timer if active slide is an IMAGE (videos advance via onEnded)
  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (count <= 1) return;

    const currentSlide = mobileSlides[activeIdx];
    const currentUrl =
      currentSlide?.mobileUrl || currentSlide?.desktopUrl || defaultFallbackImage;

    // If current slide is a video, wait for onVideoEnded instead of fixed timer
    if (isVideoUrl(currentUrl)) return;

    timerRef.current = setTimeout(() => {
      setActiveIdx((i) => (i + 1) % count);
    }, 5500);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [activeIdx, count, mobileSlides]);

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
      {/* DESKTOP FULL-SCREEN BANNER (NATIVE HARDWARE VIDEO SHARPNESS, ZERO GPU TEXTURE DOWNSCALING) */}
      <div className="home-hero-media home-hero-media-desktop relative overflow-hidden group w-full h-[calc(100dvh-4.25rem)] bg-[#081426]">
        {effectiveDesktopSlides.map((slide, idx) => {
          const url = slide.desktopUrl || defaultFallbackImage;
          const isActive = activeDesktopIdx === idx;
          const isVid = isVideoUrl(url);
          return (
            <div
              key={`desk-${idx}-${url}`}
              className={`w-full h-full transition-opacity duration-500 ${
                isActive
                  ? "relative z-1 opacity-100"
                  : "absolute inset-0 z-0 opacity-0 pointer-events-none"
              }`}
            >
              <HeroMediaItem
                url={url}
                alt={
                  slide.headline ||
                  `DSP Precision Products Banner ${idx + 1}`
                }
                className={`w-full h-full block ${
                  isVid ? "object-cover object-center" : "object-fill"
                }`}
                isActive={!isMobileViewport && isActive}
                shouldLoop={desktopCount <= 1}
                onVideoEnded={() => goToDesktop(activeDesktopIdx + 1)}
              />
            </div>
          );
        })}

        {desktopCount > 1 && (
          <>
            <button
              type="button"
              aria-label="Previous slide"
              onClick={() => goToDesktop(activeDesktopIdx - 1)}
              className="absolute left-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-black/50 hover:bg-black/80 text-white backdrop-blur-sm flex items-center justify-center opacity-80 group-hover:opacity-100 transition-all duration-200 z-10 cursor-pointer shadow-lg"
            >
              ❮
            </button>
            <button
              type="button"
              aria-label="Next slide"
              onClick={() => goToDesktop(activeDesktopIdx + 1)}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-black/50 hover:bg-black/80 text-white backdrop-blur-sm flex items-center justify-center opacity-80 group-hover:opacity-100 transition-all duration-200 z-10 cursor-pointer shadow-lg"
            >
              ❯
            </button>

            <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex items-center gap-2 z-10 bg-black/40 backdrop-blur-md px-3.5 py-2 rounded-full shadow-md">
              {effectiveDesktopSlides.map((_, i) => (
                <button
                  key={`dot-desk-${i}`}
                  aria-label={`Go to slide ${i + 1}`}
                  onClick={() => goToDesktop(i)}
                  className={`h-2.5 rounded-full transition-all duration-300 cursor-pointer ${
                    activeDesktopIdx === i
                      ? "w-8 bg-amber-500"
                      : "w-2.5 bg-white/70 hover:bg-white"
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
            const isVid = isVideoUrl(url);
            return (
              <div key={`mob-${i}-${url}`} className="mobile-slide">
                <HeroMediaItem
                  url={url}
                  alt={`Mobile banner ${i + 1}`}
                  className={`w-full h-full ${
                    isVid ? "object-cover object-center" : "object-contain"
                  }`}
                  isActive={isMobileViewport && activeIdx === i}
                  shouldLoop={count <= 1}
                  onVideoEnded={() => goTo(activeIdx + 1)}
                />
              </div>
            );
          })}
        </div>

        {count > 1 && (
          <div
            className="mobile-carousel-dots"
            role="tablist"
            aria-label="Hero slides"
          >
            {mobileSlides.map((_, i) => (
              <button
                key={`dot-mob-${i}`}
                role="tab"
                aria-selected={activeIdx === i}
                aria-label={`Go to slide ${i + 1}`}
                onClick={() => goTo(i)}
                className={`carousel-dot ${
                  activeIdx === i ? "carousel-dot-active" : ""
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

export default HomeHero;
