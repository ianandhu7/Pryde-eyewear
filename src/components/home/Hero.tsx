"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import styles from "./Hero.module.css";

// ─── Frame Sequence Configuration ─────────────────────────────────────────────
// Folder: public/images/animation/ezgif-7feec42b6c8612f9-jpg/
// Files:  ezgif-frame-001.jpg … ezgif-frame-300.jpg  (300 frames)
// No embedded duration metadata → 10 s total → 30 fps (≈33.33 ms/frame)
const FRAME_BASE = "/images/animation/ezgif-7feec42b6c8612f9-jpg/ezgif-frame-";
const TOTAL_FRAMES = 300;
const TOTAL_DURATION_MS = 10_000;
const MS_PER_FRAME = TOTAL_DURATION_MS / TOTAL_FRAMES; // ≈ 33.33 ms
const PRELOAD_COUNT = 30; // frames decoded eagerly before first tick

/** Build the public URL for 1-based frame number n. */
function frameUrl(n: number) {
  return `${FRAME_BASE}${String(n).padStart(3, "0")}.jpg`;
}

// ─── Slide text content (unchanged) ───────────────────────────────────────────
const HERO_SLIDES = [
  {
    id: "slide-1",
    alt: "A woman wearing PRYDE sunglasses and a man wearing PRYDE optical frames — PRYDE campaign imagery.",
    eyebrow: "AUTUMN / WINTER EDIT",
    heading: "Presence, in every frame.",
    ctaText: "EXPLORE THE COLLECTION",
    ctaLink: "/collections",
  },
  {
    id: "slide-2",
    alt: "Luxurious modern interior of the PRYDE eyewear showroom and flagship store.",
    eyebrow: "THE PRYDE ATELIER",
    heading: "Where craftsmanship meets modern design.",
    ctaText: "FIND AUTHORIZED OPTICIANS",
    ctaLink: "/where-to-buy",
  },
  {
    id: "slide-3",
    alt: "Woman wearing PRYDE optical eyewear in a refined studio portrait setting.",
    eyebrow: "PRECISION OPTICS",
    heading: "Architectural clarity & refined bio-acetate.",
    ctaText: "DISCOVER OPTICAL COLLECTION",
    ctaLink: "/collections/optical",
  },
];

// ─── Reduced-motion hook ───────────────────────────────────────────────────────
function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const handler = (e: MediaQueryListEvent) => setReduced(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);
  return reduced;
}

// ─── Hero ──────────────────────────────────────────────────────────────────────
export function Hero() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const reducedMotion = usePrefersReducedMotion();

  // Canvas rendering
  const canvasRef = useRef<HTMLCanvasElement>(null);
  // ImageBitmap cache, index = frame number − 1
  const cache = useRef<(ImageBitmap | null)[]>(Array(TOTAL_FRAMES).fill(null));
  // RAF state
  const rafId = useRef<number | null>(null);
  const lastTs = useRef<number | null>(null);
  const frameIdx = useRef(0); // 0-based current frame
  // Expose isPlaying to RAF closure without re-creating it
  const playingRef = useRef(true);

  // ── Draw a 0-based frame index onto the canvas (cover, no stretch) ──────────
  const drawFrame = useCallback((idx: number) => {
    const canvas = canvasRef.current;
    const bmp = cache.current[idx];
    if (!canvas || !bmp) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const { width, height } = canvas.getBoundingClientRect();
    // Resize backing buffer to match display pixels
    if (canvas.width !== Math.round(width) || canvas.height !== Math.round(height)) {
      canvas.width = Math.round(width);
      canvas.height = Math.round(height);
    }

    // "cover" scaling — maintains aspect ratio, no stretching, centered
    const scale = Math.max(canvas.width / bmp.width, canvas.height / bmp.height);
    const sw = bmp.width * scale;
    const sh = bmp.height * scale;
    const dx = (canvas.width - sw) / 2;
    const dy = (canvas.height - sh) / 2;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(bmp, dx, dy, sw, sh);
  }, []);

  // ── Fetch + decode one frame (1-based), cache it ────────────────────────────
  const loadFrame = useCallback((n: number): Promise<ImageBitmap | null> => {
    const idx = n - 1;
    if (cache.current[idx]) return Promise.resolve(cache.current[idx]);
    return fetch(frameUrl(n))
      .then((r) => r.blob())
      .then((blob) => createImageBitmap(blob))
      .then((bmp) => {
        cache.current[idx] = bmp;
        return bmp;
      })
      .catch(() => null);
  }, []);

  // ── RAF loop ─────────────────────────────────────────────────────────────────
  const tick = useCallback(
    (ts: number) => {
      if (!playingRef.current) return;
      if (lastTs.current === null) lastTs.current = ts;

      const elapsed = ts - lastTs.current;
      if (elapsed >= MS_PER_FRAME) {
        const steps = Math.floor(elapsed / MS_PER_FRAME);
        frameIdx.current = (frameIdx.current + steps) % TOTAL_FRAMES;
        lastTs.current = ts - (elapsed % MS_PER_FRAME);
        drawFrame(frameIdx.current);
      }
      rafId.current = requestAnimationFrame(tick);
    },
    [drawFrame]
  );

  const startLoop = useCallback(() => {
    if (rafId.current !== null) return;
    lastTs.current = null;
    rafId.current = requestAnimationFrame(tick);
  }, [tick]);

  const stopLoop = useCallback(() => {
    if (rafId.current !== null) {
      cancelAnimationFrame(rafId.current);
      rafId.current = null;
    }
  }, []);

  // ── Preload first PRELOAD_COUNT frames, then load the rest lazily ─────────
  useEffect(() => {
    if (reducedMotion) return;

    // Draw frame 1 immediately as it arrives (avoids blank canvas at start)
    loadFrame(1).then(() => drawFrame(0));

    // Eagerly load the first batch in parallel, then start the loop
    Promise.all(
      Array.from({ length: PRELOAD_COUNT }, (_, i) => loadFrame(i + 1))
    ).then(() => {
      drawFrame(0);
      startLoop();

      // Lazily load remaining frames, one at a time
      let next = PRELOAD_COUNT + 1;
      function loadNext() {
        if (next > TOTAL_FRAMES) return;
        loadFrame(next++).then(loadNext);
      }
      loadNext();
    });

    return () => stopLoop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reducedMotion]);

  // ── Sync play/pause ──────────────────────────────────────────────────────────
  useEffect(() => {
    playingRef.current = isPlaying;
    if (reducedMotion) return;
    if (isPlaying) {
      startLoop();
    } else {
      stopLoop();
    }
  }, [isPlaying, reducedMotion, startLoop, stopLoop]);

  // ── Redraw on window resize ──────────────────────────────────────────────────
  useEffect(() => {
    const onResize = () => drawFrame(frameIdx.current);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [drawFrame]);

  // ── Text-slide auto-advance (unchanged timing: 4.5 s) ────────────────────────
  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length);
  }, []);

  const prevSlide = useCallback(() => {
    setCurrentSlide(
      (prev) => (prev - 1 + HERO_SLIDES.length) % HERO_SLIDES.length
    );
  }, []);

  useEffect(() => {
    const timer = setInterval(nextSlide, 4500);
    return () => clearInterval(timer);
  }, [nextSlide]);

  return (
    <section className={styles.hero} aria-label="Campaign hero carousel">
      {/* Photo Stage — layout/dimensions/positioning unchanged */}
      <div className={styles.photoStage}>
        {/*
          Track is now a single slide containing the canvas.
          The text panels cross-fade via opacity so all three slide texts
          are preserved exactly; the mobile panel track still slides horizontally.
        */}
        <div className={styles.track} style={{ transform: "translateX(0)" }}>
          <div className={styles.slide}>
            <div className={styles.photoWrap}>
              {reducedMotion ? (
                // Static first frame for prefers-reduced-motion
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={frameUrl(1)}
                  alt={HERO_SLIDES[0].alt}
                  className={styles.img}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              ) : (
                <canvas
                  ref={canvasRef}
                  aria-label={HERO_SLIDES[currentSlide].alt}
                  className={styles.img}
                  style={{ width: "100%", height: "100%", display: "block" }}
                />
              )}
              {/* Desktop-only dark gradient overlay — unchanged */}
              <div className={styles.overlay} />
            </div>

            {/* Desktop-only content overlay — three panels cross-fade */}
            {HERO_SLIDES.map((slide, index) => (
              <div
                key={slide.id}
                className={styles.desktopContent}
                aria-hidden={index !== currentSlide}
                style={{
                  opacity: index === currentSlide ? 1 : 0,
                  pointerEvents: index === currentSlide ? "auto" : "none",
                  transition: "opacity 0.8s ease",
                }}
              >
                {slide.eyebrow && (
                  <span className={styles.eyebrow}>{slide.eyebrow}</span>
                )}
                {index === 0 ? (
                  <h1 className={styles.heading}>{slide.heading}</h1>
                ) : (
                  <p className={styles.heading}>{slide.heading}</p>
                )}
                <Link href={slide.ctaLink} className={styles.cta}>
                  {slide.ctaText}
                </Link>
              </div>
            ))}
          </div>
        </div>

        {/* Navigation Arrow Controls — unchanged */}
        <button
          type="button"
          className={`${styles.navBtn} ${styles.prevBtn}`}
          onClick={prevSlide}
          aria-label="Previous slide"
        >
          ‹
        </button>
        <button
          type="button"
          className={`${styles.navBtn} ${styles.nextBtn}`}
          onClick={nextSlide}
          aria-label="Next slide"
        >
          ›
        </button>

        {/* Play / Pause control for the frame animation */}
        {!reducedMotion && (
          <button
            type="button"
            className={styles.playPauseBtn}
            onClick={() => setIsPlaying((p) => !p)}
            aria-label={isPlaying ? "Pause animation" : "Play animation"}
            aria-pressed={!isPlaying}
          >
            {isPlaying ? "⏸" : "▶"}
          </button>
        )}

        {/* Desktop-only Pagination Dots — unchanged */}
        <div
          className={`${styles.pagination} ${styles.desktopPagination}`}
          role="tablist"
          aria-label="Hero slides"
        >
          {HERO_SLIDES.map((slide, idx) => {
            const isActive = idx === currentSlide;
            return (
              <button
                key={slide.id}
                type="button"
                role="tab"
                aria-selected={isActive}
                aria-label={`Go to slide ${idx + 1}`}
                className={`${styles.dot} ${isActive ? styles.dotActive : ""}`}
                onClick={() => setCurrentSlide(idx)}
              />
            );
          })}
        </div>
      </div>

      {/* Mobile-only Content Panel — completely unchanged */}
      <div className={styles.mobilePanel}>
        <div
          className={styles.mobilePanelTrack}
          style={{
            transform: `translateX(-${(currentSlide * 100) / HERO_SLIDES.length}%)`,
          }}
        >
          {HERO_SLIDES.map((slide) => (
            <div key={`mob-${slide.id}`} className={styles.mobileSlideContent}>
              {slide.eyebrow && (
                <span className={styles.eyebrow}>{slide.eyebrow}</span>
              )}
              <p aria-hidden="true" className={styles.mobileHeading}>
                {slide.heading}
              </p>
              <Link href={slide.ctaLink} className={styles.cta}>
                {slide.ctaText}
              </Link>
            </div>
          ))}
        </div>

        {/* Mobile Pagination Indicators — unchanged */}
        <div
          className={styles.mobilePagination}
          role="tablist"
          aria-label="Hero slides mobile"
        >
          {HERO_SLIDES.map((slide, idx) => {
            const isActive = idx === currentSlide;
            return (
              <button
                key={`mob-dot-${slide.id}`}
                type="button"
                role="tab"
                aria-selected={isActive}
                aria-label={`Go to slide ${idx + 1}`}
                className={`${styles.dot} ${isActive ? styles.dotActive : ""}`}
                onClick={() => setCurrentSlide(idx)}
              />
            );
          })}
        </div>
      </div>
    </section>
  );
}
